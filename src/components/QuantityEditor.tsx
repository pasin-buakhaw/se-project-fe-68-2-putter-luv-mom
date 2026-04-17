'use client'

interface QuantityEditorProps {
  quantity: number
  min?: number
  max?: number
  onChange: (quantity: number) => void
}

export default function QuantityEditor({ quantity, min = 1, max = 99, onChange }: QuantityEditorProps) {
  const decrement = () => onChange(Math.max(min, quantity - 1))
  const increment = () => onChange(Math.min(max, quantity + 1))

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val)) onChange(Math.min(max, Math.max(min, val)))
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={decrement}
        disabled={quantity <= min}
        className="w-6 h-6 flex items-center justify-center bg-zinc-700 text-white rounded hover:bg-zinc-600 disabled:opacity-40 text-sm"
      >
        −
      </button>
      <input
        type="number"
        value={quantity}
        onChange={handleInput}
        min={min}
        max={max}
        className="w-10 text-center text-white text-sm bg-zinc-800 border border-zinc-700 rounded px-1 py-0.5 focus:outline-none focus:border-yellow-500"
      />
      <button
        onClick={increment}
        disabled={quantity >= max}
        className="w-6 h-6 flex items-center justify-center bg-zinc-700 text-white rounded hover:bg-zinc-600 disabled:opacity-40 text-sm"
      >
        +
      </button>
    </div>
  )
}
