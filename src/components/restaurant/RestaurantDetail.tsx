'use client'

import { RestaurantDetail as RestaurantDetailType } from '@/libs/getRestaurantDetail'

interface RestaurantDetailProps {
  restaurant: RestaurantDetailType
}

export default function RestaurantDetail({ restaurant }: RestaurantDetailProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {restaurant.picture && (
        <div className="w-full aspect-video overflow-hidden rounded-xl mb-6">
          <img
            src={restaurant.picture}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-white">{restaurant.name}</h1>
        <p className="text-zinc-400 text-sm">
          {restaurant.address}, {restaurant.province} {restaurant.postalcode}
        </p>
        <p className="text-zinc-400 text-sm">Tel: {restaurant.tel}</p>
        <p className="text-zinc-400 text-sm">
          Open: {restaurant.opentime} – {restaurant.closetime}
        </p>
        {restaurant.description && (
          <p className="text-zinc-300 text-sm leading-relaxed pt-2">{restaurant.description}</p>
        )}
      </div>
    </div>
  )
}
