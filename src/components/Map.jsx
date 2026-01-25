import { useEffect, useState, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import pathDataUrl from '../assets/path.geojson?url'
import { useAppContext } from '../context/AppContext'
import AnimatedMarker from './AnimatedMarker'
import scheduleData from '../assets/schedule.json'

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
  const buildRoute = (paths, basePath) => {
    return basePath.reduce((acc, idx) => {
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
      route: buildRoute(paths, config.basePath),
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
  //      Dynamically add markers based on schedule data
  //-------------------------------------------------------
  useEffect(() => {
    // Create timers for each train in the schedule
    const timers = scheduleData.map((train) => {
      return setTimeout(() => {
        setTrains(prevTrains => [
          ...prevTrains,
          {
            id: train.id,
            key: String(train.id),
            basePath: train.basePath,
            speedMs: train.speedMs,
            stepKm: train.stepKm,
            direction: train.direction,
            loop: train.loop !== undefined ? train.loop : true
          }
        ])
      }, train.start * 1000) // Convert seconds to milliseconds
    })

    // Cleanup all timers on unmount
    return () => {
      timers.forEach(timer => clearTimeout(timer))
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
