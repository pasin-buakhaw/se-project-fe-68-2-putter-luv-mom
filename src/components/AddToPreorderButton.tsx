'use client'

import { usePreorder } from '@/hooks/usePreorder'
import { PreorderItem } from '@/redux/features/preorderSlice'

interface AddToPreorderButtonProps {
  item: Omit<PreorderItem, 'quantity'>
}

export default function AddToPreorderButton({ item }: AddToPreorderButtonProps) {
  const { isInCart, add, remove } = usePreorder()
  const inCart = isInCart(item.id)

  return (
    <button
      onClick={() => (inCart ? remove(item.id) : add(item))}
      className={`px-3 py-1 text-xs rounded transition font-medium ${
        inCart
          ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
          : 'bg-yellow-500 text-black hover:bg-yellow-400'
      }`}
    >
      {inCart ? 'Remove' : 'Add to Pre-order'}
    </button>
  )
}
