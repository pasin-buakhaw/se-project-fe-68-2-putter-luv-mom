"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Calendar, Trash2, Pencil, Check, X } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import DateReserve from "@/components/DateReserve";
import getReservations from "@/libs/getReservations";
import updateReservation from "@/libs/updateReservation";
import deleteReservation from "@/libs/deleteReservation";

export default function AdminBookingList() {
    const { data: session } = useSession()
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editDate, setEditDate] = useState<Dayjs | null>(null)

    const token = (session?.user as any)?.token

    const fetchBookings = async () => {
        try {
            const data = await getReservations(token)
            setBookings(data.data)
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
            await updateReservation(id, dayjs(editDate).toISOString(), token)
            setEditingId(null)
            fetchBookings()
        } catch (err: any) {
            alert(err.message)
        }
    }

    if (loading) return (
        <p className="text-gray-600 text-sm tracking-widest uppercase">Loading...</p>
    )

    if (bookings.length === 0) return (
        <p className="text-gray-600 text-sm tracking-widest uppercase">No Reservations Found</p>
    )

    return (
        <div className="w-full flex flex-col gap-3">
            {bookings.map((item: any) => (
                <div key={item._id} className="bg-[#111] border border-yellow-600/20 p-6">
                    {editingId === item._id ? (
                        <div className="flex flex-col gap-4">
                            <h3 className="text-yellow-500 text-sm tracking-widest uppercase">
                                Editing Reservation
                            </h3>
                            <div className="flex flex-col gap-1">
                                <label className="text-gray-500 text-xs tracking-widest uppercase">New Date</label>
                                <div className="bg-[#1a1a1a] border border-gray-700 p-3">
                                    <DateReserve onDateChange={(v) => setEditDate(v)} />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-600 text-gray-400 hover:text-white text-xs uppercase transition"
                                >
                                    <X size={13} /> Cancel
                                </button>
                                <button
                                    onClick={() => handleSave(item._id)}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-black text-xs uppercase font-semibold transition"
                                >
                                    <Check size={13} /> Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-yellow-500 text-lg">
                                    {item.restaurant?.name || item.restaurant}
                                </h3>
                                <div className="flex items-center gap-2 text-gray-400 text-xs">
                                    <Calendar size={12} className="text-yellow-600/60" />
                                    {dayjs(item.reservationDate).format("DD MMM YYYY HH:mm")}
                                </div>
                                {/* แสดง user ด้วย เพราะ admin เห็นทุก booking */}
                                <div className="text-gray-600 text-xs">
                                    User: {item.user?.name || item.user?.email || item.user}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setEditingId(item._id); setEditDate(null) }}
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