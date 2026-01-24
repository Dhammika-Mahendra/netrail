import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker } from 'react-leaflet'
import L from 'leaflet'
import * as turf from '@turf/turf'
import 'leaflet/dist/leaflet.css'
import pathDataUrl from '../assets/path.geojson?url'
import arrowSvg from '../assets/arrow.svg?raw'

// Component to animate marker
function AnimatedMarker({ pathCoordinates, speedMs = 500, stepKm = 0.5 }) {
  const [position, setPosition] = useState(null)
  const [rotation, setRotation] = useState(0)
  const indexRef = useRef(0)
  const pointsRef = useRef([])

  useEffect(() => {
    if (!pathCoordinates || pathCoordinates.length === 0) return

    // Create a LineString from the coordinates
    const line = turf.lineString(pathCoordinates)
    const length = turf.length(line, { units: 'kilometers' })

    // Generate points along the line
    const points = []
    const step = stepKm // kilometers
    for (let i = 0; i <= length; i += step) {
      const point = turf.along(line, i, { units: 'kilometers' })
      points.push(point.geometry.coordinates)
    }
    
    // Add the last point to ensure we reach the end
    if (points.length > 0) {
      const lastCoord = pathCoordinates[pathCoordinates.length - 1]
      if (points[points.length - 1][0] !== lastCoord[0] || 
          points[points.length - 1][1] !== lastCoord[1]) {
        points.push(lastCoord)
      }
    }
    
    pointsRef.current = points
    indexRef.current = 0
    
    // Set initial position
    if (points.length > 0) {
      setPosition([points[0][1], points[0][0]])
    }

    // Animation loop
    const intervalId = setInterval(() => {
      indexRef.current += 1
      
      if (indexRef.current >= pointsRef.current.length) {
        indexRef.current = 0 // Loop back to start
      }
      
      const currentPoint = pointsRef.current[indexRef.current]
      const nextPoint = pointsRef.current[(indexRef.current + 1) % pointsRef.current.length]
      
      setPosition([currentPoint[1], currentPoint[0]])
      
      // Calculate rotation angle between current and next point
      if (nextPoint) {
        const bearing = turf.bearing(
          turf.point(currentPoint),
          turf.point(nextPoint)
        )
        setRotation(bearing)
      }
    }, speedMs) // Update interval time

    return () => clearInterval(intervalId)
  }, [pathCoordinates, speedMs, stepKm])

  if (!position) return null

  const arrowIconWithRotation = L.divIcon({
    className: 'custom-arrow-icon',
    html: `<div style="width: 16px; height: 16px; transform: rotate(${rotation}deg); transition: transform 0.1s linear;">${arrowSvg}</div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })

  return <Marker position={position} icon={arrowIconWithRotation} />
}

// Build a route by combining one or more base paths by index
function buildRoute(paths, indices) {
  return indices.reduce((acc, idx) => {
    const segment = paths[idx]
    if (segment && segment.length) {
      return acc.concat(segment)
    }
    return acc
  }, [])
}

export default function Map() {
  const [pathData, setPathData] = useState(null)
  const [paths, setPaths] = useState([])
  
  // Sri Lanka center coordinates
  const center = [7.8731, 80.7718]
  const zoom = 8

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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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
          // Configure markers as flexible routes built from base paths
          [
            // Marker following only path 1
            { key: 'path-1', indices: [0,2], speedMs: 50, stepKm: 0.5 },
            // Marker following only path 2
            { key: 'path-2', indices: [1], speedMs: 50, stepKm: 0.5 },
            // Marker that goes along path 1 then path 2
            { key: 'path-1-2', indices: [0, 1], speedMs: 50, stepKm: 0.5 },
          ].map(config => {
            const route = buildRoute(paths, config.indices)
            if (!route.length) return null
            return (
              <AnimatedMarker
                key={config.key}
                pathCoordinates={route}
                speedMs={config.speedMs}
                stepKm={config.stepKm}
              />
            )
          })
        }
      </MapContainer>
    </div>
  )
}
