'use client'

import { PreorderItem as PreorderItemType } from '@/redux/features/preorderSlice'
import QuantityEditor from './QuantityEditor'

interface PreorderItemProps {
  item: PreorderItemType
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export default function PreorderItemRow({ item, onQuantityChange, onRemove }: PreorderItemProps) {
  return (
    <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm truncate">{item.name}</p>
        <p className="text-zinc-500 text-xs">฿{item.price.toFixed(2)} each</p>
      </div>

      <QuantityEditor
        quantity={item.quantity}
        onChange={(q) => onQuantityChange(item.id, q)}
      />

      <span className="text-yellow-400 text-sm w-16 text-right">
        ฿{(item.price * item.quantity).toFixed(2)}
      </span>

      <button
        onClick={() => onRemove(item.id)}
        className="text-zinc-600 hover:text-red-400 transition text-xs"
        aria-label={`Remove ${item.name}`}
      >
        ✕
      </button>
    </div>
  )
}
