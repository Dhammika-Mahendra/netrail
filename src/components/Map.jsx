import { useEffect, useState, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import pathDataUrl from '../assets/path.geojson?url'
import { useAppContext } from '../context/AppContext'
import AnimatedMarker from './AnimatedMarker'

export default function Map() {

  const { trains, setTrains } = useAppContext()

  const [pathData, setPathData] = useState(null)
  const [paths, setPaths] = useState([])
  
  const center = [7.8731, 80.7718]
  const zoom = 8

  //-------------------------------------------------------
  //      Map path functions
  //-------------------------------------------------------
  // Build a route by combining one or more base paths by index
  const buildRoute = (paths, indices) => {
    return indices.reduce((acc, idx) => {
      const segment = paths[idx]
      if (segment && segment.length) {
        return acc.concat(segment)
      }
      return acc
    }, [])
  }

  // Memoize routes for each train to prevent unnecessary recalculations
  const trainRoutes = useMemo(() => {
    return trains.map(config => ({
      id: config.id,
      route: buildRoute(paths, config.indices),
      config
    }))
  }, [trains, paths])

  //-------------------------------------------------------
  //      Basic Load path data on mount
  //-------------------------------------------------------
  useEffect(() => {
    fetch(pathDataUrl)
      .then(response => response.json())
      .then(data => {
        setPathData(data)

        // Extract one path per feature (all MultiLineString features)
        const allPaths = (data.features || [])
          .filter(f => f.geometry && f.geometry.type === 'MultiLineString')
          .map(f => {
            const coords = f.geometry.coordinates || []
            // Each feature here has a single line inside the MultiLineString
            return coords[0] || []
          })
          .filter(p => p.length > 0)

        setPaths(allPaths)
      })
  }, [])

  //-------------------------------------------------------
  //      Dynamically add/remove markers for testing
  //-------------------------------------------------------
  useEffect(() => {
    const addTimer = setTimeout(() => {
      console.log('Adding new marker with id=4')
      setTrains(prevTrains => [
        ...prevTrains,
        { 
          id: 3, 
          key: 'path-dynamic', 
          indices: [2], 
          speedMs: 30, 
          stepKm: 0.3, 
          direction: 'forward', 
          loop: true 
        }
      ])
    }, 20000) // 20 seconds

    const removeTimer = setTimeout(() => {
      console.log('Removing marker with id=2')
      setTrains(prevTrains => prevTrains.filter(train => train.id !== 2))
    }, 40000) // 40 seconds

    return () => {
      clearTimeout(addTimer)
      clearTimeout(removeTimer)
    }
  }, [setTrains])

  return (
    <div className='h-full w-full'>
      <MapContainer
        center={center}
        zoom={zoom}
        className='h-full w-full'
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
      >
        {pathData && (
          <GeoJSON 
            data={pathData}
            style={{
              color: '#3388ff',
              weight: 2,
              opacity: 0.8
            }}
          />
        )}
        {
          // dynamically render animated markers for each train on map layer
          trainRoutes.map(({ id, route, config }) => {
            if (!route.length) return null
            return (
              <AnimatedMarker
                key={id}
                pathCoordinates={route}
                speedMs={config.speedMs}
                stepKm={config.stepKm}
                direction={config.direction}
                loop={config.loop}
              />
            )
          })
        }
      </MapContainer>
    </div>
  )
}
