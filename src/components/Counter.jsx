import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'

export default function Counter() {

  const [value, setValue] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const dialRef = useRef(null)

  // Auto-increment while not dragging
  useEffect(() => {
    if (isDragging) return

    const id = setInterval(() => {
      setValue(prev => {
        if (prev >= 120) {
          return 1
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(id)
  }, [isDragging])

  const radius = 70
  const center = 90
  const twoPi = 2 * Math.PI

  // Map current value (1–100) to angle, starting from bottom
  const normalized = (value - 1) / 99 // 0 to 1
  const angle = normalized * twoPi // 0 at bottom, counter-clockwise

  // Convert to cartesian: bottom = 0°, counter-clockwise positive
  const markerX = center - radius * Math.sin(angle)
  const markerY = center + radius * Math.cos(angle)

  const handleDragStart = event => {
    event.preventDefault()
    setIsDragging(true)
  }

  // Drag handler: move marker around dial and update value
  useEffect(() => {
    if (!isDragging) return

    const handleMove = event => {
      if (!dialRef.current) return

      const rect = dialRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2

      const point =
        event.touches && event.touches[0] ? event.touches[0] : event

      const clientX = point.clientX
      const clientY = point.clientY

      const dx = clientX - cx
      const dy = clientY - cy

      // Calculate angle from center to match marker position calculation
      // Marker uses: X = center - radius*sin(angle), Y = center + radius*cos(angle)
      // So: -sin(angle) = (X - center)/radius, cos(angle) = (Y - center)/radius
      // This means: angle from bottom, counter-clockwise
      let angleFromBottom = Math.atan2(-dx, dy) // 0 at bottom, counter-clockwise
      
      // Normalize to 0–2π range
      if (angleFromBottom < 0) angleFromBottom += twoPi

      const percent = angleFromBottom / twoPi
      const newValue = Math.min(100, Math.max(1, Math.round(percent * 99) + 1))
      setValue(newValue)
    }

    const handleEnd = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleMove)
    window.addEventListener('touchend', handleEnd)
    window.addEventListener('touchcancel', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
      window.removeEventListener('touchcancel', handleEnd)
    }
  }, [isDragging])

  return (
    <div className="flex flex-col items-center justify-center w-full py-8 from-white to-blue-50 rounded-2xl">
      {/* Circular dial with draggable marker */}
      <div className="relative flex items-center justify-center" ref={dialRef}>
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          className="drop-shadow-sm"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))' }}
        >
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#E5EDFF"
            strokeWidth="10"
            fill="white"
          />

          {/* Scale marks - 12 positions around the dial */}
          {Array.from({ length: 12 }).map((_, i) => {
            const markAngle = (i / 12) * twoPi
            const markRadius = radius -4
            const markX = center - markRadius * Math.sin(markAngle)
            const markY = center + markRadius * Math.cos(markAngle)
            const outerX = center - (markRadius + 8) * Math.sin(markAngle)
            const outerY = center + (markRadius + 8) * Math.cos(markAngle)
            
            return (
              <line
                key={i}
                x1={markX}
                y1={markY}
                x2={outerX}
                y2={outerY}
                stroke="#a2b0c7ff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )
          })}

          {/* Draggable marker */}
          <g
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            {/* Larger invisible hit area for easier dragging */}
            <circle
              cx={markerX}
              cy={markerY}
              r={15}
              fill="transparent"
              style={{ pointerEvents: 'all' }}
            />
            {/* Visible marker */}
            <circle
              cx={markerX}
              cy={markerY}
              r={7}
              fill="#FFFFFF"
              stroke="#2563EB"
              strokeWidth="1"
              style={{ pointerEvents: 'none' }}
            />
            <circle 
              cx={markerX} 
              cy={markerY} 
              r={3} 
              fill="#2563EB"
              style={{ pointerEvents: 'none' }}
            />
          </g>
        </svg>

        {/* Content inside dial */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-5xl font-semibold text-blue-600 leading-none">
            {value}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col items-center space-y-4 w-full">
        {/* Play icon styled as modern button (visual only) */}
        <button
          type="button"
          className="inline-flex items-center px-1 py-1 rounded-full bg-blue-600 text-white text-md font-medium shadow-sm hover:bg-blue-500 transition-colors"
        >
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

      </div>
    </div>
  )
}
