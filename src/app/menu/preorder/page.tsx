'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, ShoppingBag, ArrowRight } from 'lucide-react'
import PreorderList from '@/components/PreorderList'
import { usePreorder } from '@/hooks/usePreorder'
import { usePreorderPersist } from '@/hooks/usePreorderPersist'
import { confirmPreorder } from '@/libs/getAllPreorders'

export default function PreorderPage() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.token as string | undefined
  const { items, total, clear } = usePreorder()
  const router = useRouter()
  usePreorderPersist()

  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

  // Group items by venueId
  const byVenue = items.reduce<Record<string, typeof items>>((acc, item) => {
    if (!acc[item.venueId]) acc[item.venueId] = []
    acc[item.venueId].push(item)
    return acc
  }, {})

  async function handleConfirm() {
    if (items.length === 0) return
    if (!token) {
      setError('You must be signed in to confirm an order')
      return
    }
    setConfirming(true)
    setError('')
    try {
      await Promise.all(
        Object.entries(byVenue).map(([venueId, venueItems]) =>
          confirmPreorder(
            venueId,
            venueItems.map((i) => ({ menuId: i._id, name: i.name, price: i.price, quantity: i.quantity })),
            token
          )
        )
      )
      setConfirmed(true)
    } catch (e: any) {
      setError(e.message || 'Failed to confirm order')
    } finally {
      setConfirming(false)
    }
  }

  function handleGoToOrders() {
    clear()
    router.push('/my-orders')
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/menu" className="text-zinc-500 text-sm hover:text-yellow-400 transition">
            ← Back to Menu
          </Link>
          <h1 className="text-2xl text-yellow-500 font-normal mt-4">Your Pre-order</h1>
          <p className="text-zinc-500 text-xs tracking-widest uppercase mt-1">
            Review your selected items
          </p>
        </div>

        <PreorderList />

        {items.length > 0 && (
          <div className="mt-6">
            {error && (
              <p className="text-red-400 text-sm mb-3 p-3 border border-red-900/30 bg-red-900/10 rounded">
                {error}
              </p>
            )}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Order Total</p>
                <p className="text-yellow-400 text-xl font-semibold">฿{total.toFixed(2)}</p>
              </div>
              <button
                onClick={handleConfirm}
                disabled={confirming || !token}
                className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-black font-medium rounded hover:bg-yellow-400 transition disabled:opacity-60"
              >
                {confirming
                  ? <><Loader2 size={15} className="animate-spin" /> Confirming…</>
                  : <><ShoppingBag size={15} /> Confirm Pre-order</>
                }
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Success Modal ─────────────────────────────────────────────────── */}
      {confirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-[#111] border border-yellow-600/20 rounded-xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
              <CheckCircle size={32} className="text-yellow-400" />
            </div>

            <div>
              <h2 className="text-white text-lg font-medium mb-1">Order Confirmed!</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Your pre-order has been saved successfully.
                You can view and edit it anytime from My Orders.
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleGoToOrders}
                className="flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-yellow-500 text-black font-medium rounded hover:bg-yellow-400 transition"
              >
                View My Orders <ArrowRight size={15} />
              </button>
              <Link
                href="/menu"
                onClick={() => clear()}
                className="w-full px-5 py-2.5 border border-zinc-700 text-zinc-400 text-sm rounded hover:text-white hover:border-zinc-500 transition text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
