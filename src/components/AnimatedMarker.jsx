import { useEffect, useRef, useState } from 'react'
import * as turf from '@turf/turf'
import arrowSvg from '../assets/arrow.svg?raw'
import { Marker } from 'react-leaflet'

export default function AnimatedMarker({ pathCoordinates, speedMs, stepKm=0.2 , direction, loop }) {
  const [position, setPosition] = useState(null)
  const [rotation, setRotation] = useState(0)
  const indexRef = useRef(0)
  const pointsRef = useRef([])
  const isInitializedRef = useRef(false)

  useEffect(() => {
    if (!pathCoordinates || pathCoordinates.length === 0) return

    // Only reset if this is the first initialization
    // This prevents restarts when other markers are added/removed
    if (!isInitializedRef.current) {
      // Create a LineString from the coordinates
      const line = turf.lineString(pathCoordinates)
      const length = turf.length(line, { units: 'kilometers' })

      // Generate points along the line
      let points = []
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

      // Reverse for backward direction
      if (direction === 'backward') {
        points = [...points].reverse()
      }
      
      pointsRef.current = points
      indexRef.current = 0
      
      // Set initial position
      if (points.length > 0) {
        setPosition([points[0][1], points[0][0]])
      }
      
      isInitializedRef.current = true
    }

    const intervalId = setInterval(() => {
      // If we don't loop and we're already at the last point, stop
      if (!loop && indexRef.current >= pointsRef.current.length - 1) {
        clearInterval(intervalId)
        return
      }

      indexRef.current += 1
      
      if (indexRef.current >= pointsRef.current.length) {
        if (loop) {
          indexRef.current = 0 // Loop back to start
        } else {
          indexRef.current = pointsRef.current.length - 1
          clearInterval(intervalId)
          return
        }
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
    }, speedMs)

    return () => clearInterval(intervalId)
  }, [pathCoordinates, speedMs, stepKm, direction, loop])

  if (!position) return null

  const arrowIconWithRotation = L.divIcon({
    className: 'custom-arrow-icon',
    html: `<div style="width: 16px; height: 16px; transform: rotate(${rotation}deg); transition: transform 0.1s linear;">${arrowSvg}</div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })

  return <Marker position={position} icon={arrowIconWithRotation} />
}