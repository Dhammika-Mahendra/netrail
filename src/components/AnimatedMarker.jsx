import { useEffect, useMemo, useState } from 'react'
import * as turf from '@turf/turf'
import arrowSvg from '../assets/arrow.svg?raw'
import { Marker } from 'react-leaflet'

export default function AnimatedMarker({ pathCoordinates, progress = 0, direction = 'forward' }) {
  const [position, setPosition] = useState(null)
  const [rotation, setRotation] = useState(0)

  const { line, length } = useMemo(() => {
    if (!pathCoordinates || pathCoordinates.length === 0) {
      return { line: null, length: 0 }
    }

    const coords = direction === 'backward'
      ? [...pathCoordinates].reverse()
      : pathCoordinates

    const lineString = turf.lineString(coords)
    const totalLength = turf.length(lineString, { units: 'kilometers' })
    return { line: lineString, length: totalLength }
  }, [pathCoordinates, direction])

  useEffect(() => {
    if (!line || length <= 0) {
      setPosition(null)
      return
    }

    const clampedProgress = Math.min(Math.max(progress, 0), 100)
    const distanceAlong = (clampedProgress / 100) * length
    const point = turf.along(line, distanceAlong, { units: 'kilometers' })
    const currentCoords = point.geometry.coordinates

    if (!currentCoords) {
      setPosition(null)
      return
    }

    setPosition([currentCoords[1], currentCoords[0]])

    const orientationStep = Math.min(length * 0.01, 0.1)
    const aheadDistance = Math.min(distanceAlong + orientationStep, length)
    const behindDistance = Math.max(distanceAlong - orientationStep, 0)

    const comparisonDistance = aheadDistance !== distanceAlong
      ? aheadDistance
      : behindDistance !== distanceAlong
        ? behindDistance
        : distanceAlong

    if (comparisonDistance === distanceAlong) {
      setRotation(0)
      return
    }

    const comparisonPoint = turf.along(line, comparisonDistance, { units: 'kilometers' })
    const bearing = turf.bearing(
      turf.point(currentCoords),
      turf.point(comparisonPoint.geometry.coordinates)
    )
    setRotation(bearing)
  }, [line, length, progress])

  if (!position) return null

  const arrowIconWithRotation = L.divIcon({
    className: 'custom-arrow-icon',
    html: `<div style="width: 16px; height: 16px; transform: rotate(${rotation}deg); transition: transform 0.1s linear;">${arrowSvg}</div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })

  return <Marker position={position} icon={arrowIconWithRotation} />
}