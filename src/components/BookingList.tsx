"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Calendar, Trash2, Pencil, Check, X, Hash, Store, ShoppingBag } from "lucide-react";
import Link from "next/link";
import dayjs, { Dayjs } from "dayjs";
import DateReserve from "@/components/DateReserve";
import getReservations from "@/libs/getReservations";
import updateReservation from "@/libs/updateReservation";
import deleteReservation from "@/libs/deleteReservation";

export default function BookingList() {
    const { data: session } = useSession()
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editDate, setEditDate] = useState<Dayjs | null>(null)
    const [editTime, setEditTime] = useState("18:00")
    const [restaurantNames, setRestaurantNames] = useState<Record<string, string>>({})

    const token = (session?.user as any)?.token

    useEffect(() => {
        fetch('/api/v1/restaurants')
            .then(r => r.json())
            .then(j => {
                const map: Record<string, string> = {}
                for (const r of j.data ?? []) map[r._id] = r.name
                setRestaurantNames(map)
            })
            .catch(() => {})
    }, [])

    const fetchBookings = async () => {
        try {
            const data = await getReservations(token)
            setBookings(data.data ?? [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (token) fetchBookings()
    }, [token])

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this reservation?")) return
        try {
            await deleteReservation(id, token)
            setBookings(bookings.filter(b => b._id !== id))
        } catch (err: any) {
            alert(err.message)
        }
    }

    const handleSave = async (id: string) => {
        if (!editDate) return
        try {
            await updateReservation(id, dayjs(editDate).format("YYYY-MM-DD"), editTime, token)
            setEditingId(null)
            fetchBookings()
        } catch (err: any) {
            alert(err.message)
        }
    }

    if (loading) return (
        <div className="text-center py-20">
            <p className="text-gray-600 text-sm tracking-widest uppercase">Loading...</p>
        </div>
    )

    if (bookings.length === 0) return (
        <div className="text-center py-20">
            <p className="text-gray-600 text-sm tracking-widest uppercase">No Reservations Found</p>
        </div>
    )

    return (
        <div className="w-full flex flex-col gap-3">
            {bookings.map((item: any) => (
                <div key={item._id} className="bg-[#111] border border-yellow-600/20 p-6">
                    {editingId === item._id ? (
                        <div className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-yellow-500 text-sm tracking-widest uppercase">
                                    Editing Reservation
                                </h3>
                                {(() => {
                                    const rid = item.restaurantId || item.restaurant?._id || item.restaurant || item.venue
                                    const rname = restaurantNames[rid] || item.restaurant?.name || rid
                                    return rname ? (
                                        <p className="flex items-center gap-1.5 text-gray-400 text-xs mt-1">
                                            <Store size={11} className="text-yellow-600/50" />
                                            {rname}
                                        </p>
                                    ) : null
                                })()}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-gray-500 text-xs tracking-widest uppercase">New Date</label>
                                <div className="bg-[#1a1a1a] border border-gray-700 p-3">
                                    <DateReserve onDateChange={(v) => setEditDate(v)} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-gray-500 text-xs tracking-widest uppercase">New Time</label>
                                <input
                                    type="time"
                                    value={editTime}
                                    onChange={(e) => setEditTime(e.target.value)}
                                    className="bg-[#1a1a1a] border border-gray-700 text-white text-sm px-4 py-2.5 outline-none focus:border-yellow-500 transition [color-scheme:dark]"
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-600 text-gray-400 hover:text-white text-xs tracking-widest uppercase transition"
                                >
                                    <X size={13} /> Cancel
                                </button>
                                <button
                                    onClick={() => handleSave(item._id)}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-black hover:bg-yellow-400 text-xs tracking-widest uppercase font-semibold transition"
                                >
                                    <Check size={13} /> Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-2">
                                {/* ชื่อร้าน */}
                                {(() => {
                                    const rid = item.restaurantId || item.restaurant?._id || item.restaurant || item.venue
                                    const rname = restaurantNames[rid] || item.restaurant?.name || rid
                                    return (
                                        <h3 className="text-yellow-500 text-lg flex items-center gap-2">
                                            <Store size={14} className="text-yellow-600/50 shrink-0" />
                                            {rname || <span className="text-gray-600 text-sm">Unknown restaurant</span>}
                                        </h3>
                                    )
                                })()}

                                {/* วันเวลา */}
                                <div className="flex items-center gap-2 text-gray-400 text-xs">
                                    <Calendar size={12} className="text-yellow-600/60" />
                                    {item.date ? dayjs(item.date).format("DD MMM YYYY") : '—'} {item.time || ''}
                                </div>

                                {/* Booking ID */}
                                <div className="flex items-center gap-2 text-gray-600 text-xs font-mono">
                                    <Hash size={12} className="text-yellow-600/40" />
                                    {item._id}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-yellow-600/60 text-xs tracking-widest uppercase border border-yellow-600/20 px-3 py-1">
                                    Upcoming
                                </span>
                                {/* Order button */}
                                {(() => {
                                    const rid = item.restaurantId || item.restaurant?._id || item.restaurant || item.venue
                                    const rname = restaurantNames[rid] || item.restaurant?.name || ''
                                    return rid ? (
                                        <Link
                                            href={`/menu?venueId=${rid}&venueName=${encodeURIComponent(rname)}`}
                                            className="flex items-center gap-1.5 p-2 border border-yellow-600/30 text-yellow-600/60 hover:border-yellow-500 hover:text-yellow-500 transition"
                                            title="Order food"
                                        >
                                            <ShoppingBag size={14} />
                                        </Link>
                                    ) : null
                                })()}
                                <button
                                    onClick={() => {
                                        setEditingId(item._id)
                                        setEditDate(null)
                                        setEditTime(item.time || '18:00')
                                    }}
                                    className="p-2 border border-yellow-600/30 text-yellow-600/60 hover:border-yellow-500 hover:text-yellow-500 transition"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="p-2 border border-red-900/40 text-red-700/60 hover:border-red-500 hover:text-red-500 transition"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}