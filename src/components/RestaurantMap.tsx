'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface RestaurantPin {
  _id: string
  name: string
  address: string
  tel?: string
  lat?: number
  lng?: number
}

// Bangkok restaurant coordinates (fallback seeded data)
const FALLBACK_COORDS: Record<string, [number, number]> = {
  'ร้านอาหารป่ามหาเฮง V99':    [13.7563, 100.5018],
  'The Grand Palace Dining':     [13.7500, 100.4927],
  'Sushiro Premium Zen':         [13.7450, 100.5340],
  'Pony Sweet Cafe':             [13.7620, 100.5660],
  'ครัวเจ๊ง้อ สาขาต้นตำรับ':   [13.7380, 100.5100],
  'ครัวเจ๊ง้อ สาขา2':           [13.7290, 100.5250],
}

const DEFAULT_CENTER: [number, number] = [13.7563, 100.5018] // Bangkok

const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export default function RestaurantMap() {
  const [restaurants, setRestaurants] = useState<RestaurantPin[]>([])
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER)
  const [geoError, setGeoError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/v1/restaurants`)
      .then((r) => r.json())
      .then((j) => {
        const data: RestaurantPin[] = (j.data ?? []).map((r: any) => ({
          _id: r._id,
          name: r.name,
          address: r.address,
          tel: r.tel,
          lat: r.lat ?? FALLBACK_COORDS[r.name]?.[0],
          lng: r.lng ?? FALLBACK_COORDS[r.name]?.[1],
        }))
        setRestaurants(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setUserPos(coords)
        setCenter(coords)
      },
      () => setGeoError('Location access denied. Showing Bangkok by default.')
    )
  }, [])

  const pins = restaurants.filter((r) => r.lat !== undefined && r.lng !== undefined)

  return (
    <div className="relative">
      {geoError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-black/80 border border-yellow-600/30 text-yellow-400 text-xs px-4 py-2 rounded shadow">
          {geoError}
        </div>
      )}
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '500px', width: '100%', background: '#0a0a0a' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} />

        {userPos && (
          <Marker position={userPos} icon={userIcon} />
        )}

        {pins.map((r) => (
          <Marker
            key={r._id}
            position={[r.lat!, r.lng!]}
            icon={restaurantIcon}
          />
        ))}
      </MapContainer>
    </div>
  )
}
