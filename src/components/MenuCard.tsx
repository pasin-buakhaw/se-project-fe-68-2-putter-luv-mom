'use client'

import { useDispatch, useSelector } from 'react-redux'
import { MenuItem } from '@/libs/getMenus'
import { addToPreorder, removeFromPreorder } from '@/redux/features/preorderSlice'
import { RootState } from '@/redux/store'

interface MenuCardProps {
  menu: MenuItem
}

export default function MenuCard({ menu }: MenuCardProps) {
  const dispatch = useDispatch()
  const items = useSelector((state: RootState) => state.preorder.items)
  const inCart = items.some((i) => i.id === menu._id)

  const handleToggle = () => {
    if (inCart) {
      dispatch(removeFromPreorder(menu._id))
    } else {
      dispatch(
        addToPreorder({
          id: menu._id,
          name: menu.name,
          price: menu.price,
          category: menu.category,
          venueId: menu.venueId,
        })
      )
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-600 transition">
      {menu.imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img src={menu.imageUrl} alt={menu.name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{menu.category}</p>
        <h3 className="text-white font-medium mb-1">{menu.name}</h3>
        {menu.description && <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{menu.description}</p>}
        <div className="flex items-center justify-between mt-3">
          <span className="text-yellow-400 font-semibold">฿{menu.price.toFixed(2)}</span>
          <button
            onClick={handleToggle}
            className={`px-3 py-1 text-xs rounded transition ${
              inCart
                ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                : 'bg-yellow-500 text-black hover:bg-yellow-400'
            }`}
          >
            {inCart ? 'Remove' : 'Add to Pre-order'}
          </button>
        </div>
      </div>
    </div>
  )
}
