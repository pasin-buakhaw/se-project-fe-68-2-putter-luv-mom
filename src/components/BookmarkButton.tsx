'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { addBookmark, removeBookmark, isBookmarked } from '@/libs/bookmarkService'

interface BookmarkButtonProps {
  restaurantId: string
  restaurantName: string
}

export default function BookmarkButton({ restaurantId, restaurantName }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(isBookmarked(restaurantId))
  }, [restaurantId])

  function toggle() {
    if (saved) {
      removeBookmark(restaurantId)
    } else {
      addBookmark({ id: restaurantId, name: restaurantName })
    }
    setSaved(!saved)
  }

  return (
    <button
      onClick={toggle}
      aria-label={saved ? 'Remove bookmark' : 'Add bookmark'}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border transition-all duration-200 ${
        saved
          ? 'bg-yellow-500 text-black border-yellow-500'
          : 'text-yellow-500 border-yellow-500 hover:bg-yellow-500 hover:text-black'
      }`}
    >
      <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
      {saved ? 'Saved' : 'Bookmark'}
    </button>
  )
}
