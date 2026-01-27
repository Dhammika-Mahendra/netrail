import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import * as turf from '@turf/turf'
import 'leaflet/dist/leaflet.css'
import pathDataUrl from '../assets/path.geojson?url'
import arrowSvg from '../assets/arrow.svg?raw'
import { useAppContext } from '../context/AppContext'

// Component to animate marker
function AnimatedMarker({ pathCoordinates }) {
  const { count } = useAppContext()
  const [position, setPosition] = useState(null)
  const [rotation, setRotation] = useState(0)
  const map = useMap()
  const pointsRef = useRef([])

  // Initialize points array when path coordinates change
  useEffect(() => {
    if (!pathCoordinates || pathCoordinates.length === 0) return

    // Create a LineString from the coordinates
    const line = turf.lineString(pathCoordinates)
    const length = turf.length(line, { units: 'kilometers' })
    
    // Generate 1200 points along the line to match the count range (0-1200)
    const points = []
    const totalPoints = 1200
    for (let i = 0; i <= totalPoints; i++) {
      const distance = (i / totalPoints) * length
      const point = turf.along(line, distance, { units: 'kilometers' })
      points.push(point.geometry.coordinates)
    }
    
    pointsRef.current = points
    
    // Set initial position
    if (points.length > 0) {
      setPosition([points[0][1], points[0][0]])
    }
  }, [pathCoordinates])

  // Update marker position based on count value
  useEffect(() => {
    if (pointsRef.current.length === 0) return
    
    // Clamp count between 0 and 1200
    const index = Math.max(0, Math.min(count, 1200))
    
    const currentPoint = pointsRef.current[index]
    const nextIndex = Math.min(index + 1, pointsRef.current.length - 1)
    const nextPoint = pointsRef.current[nextIndex]
    
    setPosition([currentPoint[1], currentPoint[0]])
    
    // Calculate rotation angle between current and next point
    if (nextPoint && index < pointsRef.current.length - 1) {
      const bearing = turf.bearing(
        turf.point(currentPoint),
        turf.point(nextPoint)
      )
      setRotation(bearing)
    }
  }, [count])

  if (!position) return null

  const arrowIconWithRotation = L.divIcon({
    className: 'custom-arrow-icon',
    html: `<div style="width: 16px; height: 16px; transform: rotate(${rotation}deg); transition: transform 0.1s linear;">${arrowSvg}</div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
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
