'use client'

import { usePreorder } from '@/hooks/usePreorder'
import PreorderItemRow from './PreorderItem'

export default function PreorderList() {
  const { items, total, itemCount, remove, setQuantity, clear } = usePreorder()

  if (items.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-white font-medium mb-2">Pre-order List</h2>
        <p className="text-zinc-500 text-sm">No items added yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-medium">
          Pre-order List
          <span className="ml-2 text-xs text-zinc-500">({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
        </h2>
        <button
          onClick={clear}
          className="text-xs text-zinc-500 hover:text-red-400 transition"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <PreorderItemRow
            key={item.id}
            item={item}
            onQuantityChange={setQuantity}
            onRemove={remove}
          />
        ))}
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-700">
        <span className="text-zinc-400 text-sm">Total</span>
        <span className="text-yellow-400 font-semibold">฿{total.toFixed(2)}</span>
      </div>
    </div>
  )
}
