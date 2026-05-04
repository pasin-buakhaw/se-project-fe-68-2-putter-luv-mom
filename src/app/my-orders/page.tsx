'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Store, ChevronDown, ChevronRight, Pencil, Trash2,
  X, Check, Loader2, ShoppingBag, AlertTriangle, RefreshCw,
} from 'lucide-react'
import { usePreorder } from '@/hooks/usePreorder'
import { getAllPreorders, PreorderData, PreorderItemData, confirmPreorder, removePreorderItem } from '@/libs/getAllPreorders'
import { useDispatch } from 'react-redux'
import { addToPreorder, setQuantityBounded } from '@/redux/features/preorderSlice'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')

export default function MyOrdersPage() {
  const { data: session, status } = useSession()
  const token = (session?.user as any)?.token as string | undefined
  const role  = (session?.user as any)?.role  as string | undefined
  const { add: _add } = usePreorder()
  const dispatch = useDispatch()

  const [orders, setOrders]       = useState<PreorderData[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [venueNames, setVenueNames] = useState<Record<string, string>>({})
  const [expanded, setExpanded]   = useState<Set<string>>(new Set())

  // edit modal
  const [editVenueId, setEditVenueId] = useState<string | null>(null)
  const [editItems, setEditItems]     = useState<PreorderItemData[]>([])
  const [saving, setSaving]           = useState(false)
  const [saveError, setSaveError]     = useState('')

  // cancel confirm
  const [cancelVenueId, setCancelVenueId] = useState<string | null>(null)
  const [cancelling, setCancelling]       = useState(false)

  const [toast, setToast] = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchOrders = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const result = await getAllPreorders(token, role)
      const data = result.data ?? []
      setOrders(data)
      setExpanded(new Set(data.map((o) => o.venueId)))
    } catch (e: any) {
      setError(e.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [token, role])

  useEffect(() => {
    if (status === 'authenticated' && token) fetchOrders()
    if (status === 'authenticated' && !token) setLoading(false)
    if (status === 'unauthenticated') setLoading(false)
  }, [status, token, fetchOrders])

  // Fetch venue names
  useEffect(() => {
    fetch(`${API_URL}/api/v1/restaurants?limit=100`)
      .then((r) => r.json())
      .then((j) => {
        const map: Record<string, string> = {}
        for (const v of j.data ?? []) map[v._id] = v.name
        setVenueNames(map)
      })
      .catch(() => {})
  }, [])

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function openEdit(order: PreorderData) {
    setEditVenueId(order.venueId)
    setEditItems(order.items.map((i) => ({ ...i })))
    setSaveError('')
  }

  function closeEdit() { setEditVenueId(null); setEditItems([]) }

  function changeEditQty(menuId: string, qty: number) {
    setEditItems((prev) =>
      qty < 1 ? prev.filter((i) => i.menuId !== menuId)
              : prev.map((i) => i.menuId === menuId ? { ...i, quantity: qty } : i)
    )
  }

  async function handleSaveEdit() {
    if (!editVenueId) return
    setSaving(true); setSaveError('')
    try {
      await confirmPreorder(editVenueId, editItems, token)
      await fetchOrders()
      closeEdit()
      showToast('Order updated')
    } catch (e: any) {
      setSaveError(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleCancelVenue(venueId: string, venueItems: PreorderItemData[]) {
    setCancelling(true)
    try {
      await Promise.all(venueItems.map((i) => removePreorderItem(venueId, i.menuId, token)))
    } catch { /* ignore — still refresh */ }
    finally {
      await fetchOrders()
      setCancelVenueId(null)
      setCancelling(false)
      showToast('Order cancelled')
    }
  }

  function handleReorder(order: PreorderData) {
    for (const item of order.items) {
      dispatch(addToPreorder({ _id: item.menuId, venueId: order.venueId, name: item.name, price: item.price, category: '' }))
      dispatch(setQuantityBounded({ id: item.menuId, quantity: item.quantity }))
    }
    showToast('Items added to pre-order cart')
  }

  // ── Loading / auth states ────────────────────────────────────────────────────
  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center" data-testid="orders-loading">
        <Loader2 className="animate-spin text-yellow-500" size={28} />
      </main>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 px-6" data-testid="no-auth-prompt">
        <ShoppingBag size={48} className="text-zinc-700" />
        <div className="text-center">
          <h1 className="text-xl text-yellow-500 font-normal mb-2">Sign in to view your orders</h1>
          <p className="text-zinc-500 text-sm">You need to be signed in to see your order history.</p>
        </div>
        <Link href="/signin" className="px-6 py-2.5 bg-yellow-500 text-black font-medium rounded hover:bg-yellow-400 transition text-sm">
          Sign In
        </Link>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 px-6">
        <AlertTriangle size={40} className="text-red-500" />
        <p className="text-zinc-400 text-sm">{error}</p>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-5 py-2 border border-zinc-700 text-zinc-300 text-sm rounded hover:border-yellow-500 hover:text-yellow-400 transition">
          <RefreshCw size={14} /> Retry
        </button>
      </main>
    )
  }

  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 px-6" data-testid="empty-orders">
        <ShoppingBag size={48} className="text-zinc-700" />
        <div className="text-center">
          <h1 className="text-xl text-yellow-500 font-normal mb-2">No Orders Yet</h1>
          <p className="text-zinc-500 text-sm">You haven't confirmed any pre-orders.</p>
        </div>
        <Link href="/menu" className="px-6 py-2.5 bg-yellow-500 text-black font-medium rounded hover:bg-yellow-400 transition text-sm">
          Browse Menus
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-yellow-500 text-black text-sm font-medium px-5 py-2.5 shadow-lg rounded">
          {toast}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <Link href="/menu" className="text-zinc-500 text-xs hover:text-yellow-400 transition">← Back to Menu</Link>
            <h1 className="text-2xl text-yellow-500 font-normal mt-3" data-testid="order-history-heading">My Orders</h1>
            <p className="text-zinc-500 text-xs tracking-widest uppercase mt-1">
              {orders.length} restaurant(s) · {orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0)} item(s)
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setExpanded(new Set(orders.map((o) => o.venueId)))} className="text-xs text-zinc-500 hover:text-yellow-500 transition">Expand all</button>
            <span className="text-zinc-700">·</span>
            <button onClick={() => setExpanded(new Set())} className="text-xs text-zinc-500 hover:text-yellow-500 transition">Collapse all</button>
          </div>
        </div>

        <div className="flex flex-col gap-4" data-testid="orders-list">
          {orders.map((order) => {
            const name     = venueNames[order.venueId] || order.venueId
            const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0)
            return (
              <div key={order.venueId} className="border border-zinc-800 rounded-lg overflow-hidden" data-testid="order-card">
                <div className="flex items-center bg-[#111] px-5 py-4 gap-3">
                  <button onClick={() => toggle(order.venueId)} className="flex-1 flex items-center gap-3 text-left">
                    <Store size={15} className="text-yellow-600/50 shrink-0" />
                    <div>
                      <p className="text-yellow-400 text-sm font-medium">{name}</p>
                      <p className="text-zinc-600 text-xs mt-0.5">{order.items.length} item(s) · ฿{subtotal.toFixed(2)}</p>
                    </div>
                    <span className="ml-1 text-zinc-500">
                      {expanded.has(order.venueId) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReorder(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-700 text-zinc-400 text-xs rounded hover:border-yellow-500 hover:text-yellow-500 transition"
                      data-testid="reorder-btn"
                    >
                      <RefreshCw size={12} /> Re-order
                    </button>
                    <button
                      onClick={() => openEdit(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-700 text-zinc-400 text-xs rounded hover:border-yellow-500 hover:text-yellow-500 transition"
                      data-testid="edit-order-btn"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => setCancelVenueId(order.venueId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-700 text-zinc-400 text-xs rounded hover:border-red-500 hover:text-red-400 transition"
                      data-testid="cancel-order-btn"
                    >
                      <Trash2 size={12} /> Cancel
                    </button>
                  </div>
                </div>

                {expanded.has(order.venueId) && (
                  <div className="border-t border-zinc-800 divide-y divide-zinc-900">
                    {order.items.map((item) => (
                      <div key={item.menuId} className="flex items-center justify-between px-5 py-3 bg-[#0a0a0a]">
                        <div>
                          <p className="text-white text-sm">{item.name}</p>
                          <p className="text-zinc-500 text-xs">฿{item.price.toFixed(2)} × {item.quantity}</p>
                        </div>
                        <p className="text-yellow-400 text-sm font-mono">฿{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                    <div className="flex justify-between px-5 py-3 bg-[#0d0d0d]">
                      <span className="text-zinc-500 text-xs uppercase tracking-widest">Total</span>
                      <span className="text-yellow-400 text-sm font-mono font-medium">฿{subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Edit Modal */}
      {editVenueId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-[#111] border border-yellow-600/20 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-600/10">
              <div>
                <h3 className="text-yellow-400 font-medium">Edit Order</h3>
                <p className="text-zinc-600 text-xs mt-0.5">{venueNames[editVenueId] || editVenueId}</p>
              </div>
              <button onClick={closeEdit} className="text-zinc-500 hover:text-white transition"><X size={18} /></button>
            </div>

            <div className="px-6 py-4 flex flex-col gap-4 max-h-80 overflow-y-auto">
              {editItems.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-4">No items left — saving will cancel this order.</p>
              ) : (
                editItems.map((item) => (
                  <div key={item.menuId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{item.name}</p>
                      <p className="text-zinc-500 text-xs">฿{item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => changeEditQty(item.menuId, item.quantity - 1)} className="w-6 h-6 border border-zinc-700 rounded text-zinc-400 hover:text-white text-xs">−</button>
                      <span className="w-6 text-center text-sm text-white">{item.quantity}</span>
                      <button onClick={() => changeEditQty(item.menuId, item.quantity + 1)} className="w-6 h-6 border border-zinc-700 rounded text-zinc-400 hover:text-white text-xs">+</button>
                    </div>
                    <span className="text-yellow-400 text-sm font-mono w-20 text-right">฿{(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => changeEditQty(item.menuId, 0)} className="text-zinc-600 hover:text-red-400 transition shrink-0"><X size={14} /></button>
                  </div>
                ))
              )}
            </div>

            {editItems.length > 0 && (
              <div className="px-6 py-3 border-t border-yellow-600/10 flex justify-between">
                <span className="text-zinc-500 text-sm">Total</span>
                <span className="text-yellow-400 font-mono">฿{editItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</span>
              </div>
            )}

            {saveError && (
              <div className="mx-6 mb-2 flex items-center gap-2 text-red-400 text-xs p-2 border border-red-900/30 bg-red-900/10 rounded">
                <AlertTriangle size={12} /> {saveError}
              </div>
            )}

            <div className="px-6 py-4 border-t border-yellow-600/10 flex gap-3 justify-end">
              <button onClick={closeEdit} className="px-4 py-2 border border-zinc-700 text-zinc-400 text-sm rounded hover:text-white transition">Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black text-sm font-medium rounded hover:bg-yellow-400 transition disabled:opacity-60">
                {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Check size={13} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirm */}
      {cancelVenueId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-[#111] border border-red-900/40 rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={20} className="text-red-400 shrink-0" />
              <h3 className="text-red-400 font-medium">Cancel Order?</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              This will remove all items from{' '}
              <strong className="text-white">{venueNames[cancelVenueId] || cancelVenueId}</strong>.
              This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setCancelVenueId(null)} className="px-4 py-2 border border-zinc-700 text-zinc-400 text-sm rounded hover:text-white transition">Keep Order</button>
              <button
                onClick={() => {
                  const order = orders.find((o) => o.venueId === cancelVenueId)
                  if (order) handleCancelVenue(cancelVenueId, order.items)
                }}
                disabled={cancelling}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-500 transition disabled:opacity-60"
              >
                {cancelling ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
