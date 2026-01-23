import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import * as turf from '@turf/turf'
import 'leaflet/dist/leaflet.css'
import pathDataUrl from '../assets/path.geojson?url'
import arrowSvg from '../assets/arrow.svg?raw'

// Component to animate marker
function AnimatedMarker({ pathCoordinates }) {
  const [position, setPosition] = useState(null)
  const [rotation, setRotation] = useState(0)
  const map = useMap()
  const indexRef = useRef(0)
  const pointsRef = useRef([])

  useEffect(() => {
    if (!pathCoordinates || pathCoordinates.length === 0) return

    // Create a LineString from the coordinates
    const line = turf.lineString(pathCoordinates)
    const length = turf.length(line, { units: 'kilometers' })
    
    // Generate points along the line (every 0.5km for smooth animation)
    const points = []
    const step = 0.5 // kilometers
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
    }, 100) // Update every 100ms for smooth animation

    return () => clearInterval(intervalId)
  }, [pathCoordinates])

  if (!position) return null

  const arrowIconWithRotation = L.divIcon({
    className: 'custom-arrow-icon',
    html: `<div style="width: 32px; height: 32px; transform: rotate(${rotation}deg); transition: transform 0.1s linear;">${arrowSvg}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

  return <Marker position={position} icon={arrowIconWithRotation} />
}

export default function Map() {
  const [pathData, setPathData] = useState(null)
  const [pathCoordinates, setPathCoordinates] = useState(null)
  
  // Sri Lanka center coordinates
  const center = [7.8731, 80.7718]
  const zoom = 8

  useEffect(() => {
    fetch(pathDataUrl)
      .then(response => response.json())
      .then(data => {
        setPathData(data)
        
        // Extract the path with id=1
        const feature = data.features.find(f => f.properties.id === 1)
        if (feature && feature.geometry.type === 'MultiLineString') {
          // Get the first line string from MultiLineString
          const coordinates = feature.geometry.coordinates[0]
          setPathCoordinates(coordinates)
        }
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
        {pathCoordinates && <AnimatedMarker pathCoordinates={pathCoordinates} />}
      </MapContainer>
    </div>
  )
}
