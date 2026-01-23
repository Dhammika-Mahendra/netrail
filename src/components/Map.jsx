import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import pathDataUrl from '../assets/path.geojson?url'

export default function Map() {
  const [pathData, setPathData] = useState(null)
  
  // Sri Lanka center coordinates
  const center = [7.8731, 80.7718]
  const zoom = 8

  useEffect(() => {
    fetch(pathDataUrl)
      .then(response => response.json())
      .then(data => setPathData(data))
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
      </MapContainer>
    </div>
  )
}
