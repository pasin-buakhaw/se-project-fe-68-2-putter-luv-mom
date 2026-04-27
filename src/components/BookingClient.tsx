"use client";

import DateReserve from '@/components/DateReserve';
import dayjs, { Dayjs } from 'dayjs';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import getVenues from '@/libs/getVenues';
import getReservations from '@/libs/getReservations';
import createReservation from '@/libs/createReservation';
import Toast from '@/components/Toast';
import useToast from '@/hooks/useToast';

const RANKING_LIMIT: Record<string, number> = {
    bronze: 1,
    silver: 2,
    gold: 3,
}

export default function BookingClient() {
    const { data: session } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast, showToast, hideToast } = useToast()

    const [restaurants, setRestaurants] = useState<any[]>([])
    const [restaurantId, setRestaurantId] = useState(searchParams.get('vid') ?? "")
    const [restaurantName, setRestaurantName] = useState(searchParams.get('venue') ?? "")
    const [bookDate, setBookDate] = useState<Dayjs | null>(null)
    const [bookTime, setBookTime] = useState("18:00")
    const [loading, setLoading] = useState(false)

    const token = (session?.user as any)?.token
    const ranking = ((session?.user as any)?.ranking || "bronze").toLowerCase()
    const role = ((session?.user as any)?.role || "user").toLowerCase()
    const limit = role === "admin" ? Infinity : (RANKING_LIMIT[ranking] ?? 1)

    useEffect(() => {
        getVenues().then((data) => setRestaurants(data.data))
    }, [])

    const handleBooking = async () => {
        if (!restaurantId || !bookDate) {
            showToast("Please select a restaurant and date", "error")
            return
        }
        setLoading(true)
        try {
            const existing = await getReservations(token)
            const currentCount = existing.data?.length ?? 0

            if (role !== "admin" && currentCount >= limit) {
                showToast(
                    `Your ${ranking} membership allows only ${limit} reservation${limit > 1 ? "s" : ""}`,
                    "error"
                )
                setLoading(false)
                return
            }

            const dateTimeStr = `${dayjs(bookDate).format("YYYY-MM-DD")}T${bookTime}:00.000Z`
            await createReservation(restaurantId, dateTimeStr, token)
            showToast("Booking confirmed!", "success")
            setTimeout(() => router.push("/mybooking"), 1500)
        } catch (err: any) {
            showToast(err.message || "Failed to create booking", "error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-black text-white px-6 py-12">
            {toast && (
                <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />
            )}
            <div className="max-w-7xl px-6 mx-auto">
                <p className="text-gray-600 text-xs tracking-widest uppercase mb-8">
                    Home / <span className="text-gray-400 ml-1">Reservation</span>
                </p>

                {/* Ranking limit info */}
                <div className="mb-6 px-4 py-3 border border-yellow-600/20 bg-yellow-500/5 text-xs text-gray-400 tracking-widest uppercase">
                    {role === "admin"
                        ? "Admin — Unlimited reservations"
                        : `${ranking} Member — ${limit} reservation${limit > 1 ? "s" : ""} allowed`
                    }
                </div>

                <div className="flex flex-col md:flex-row gap-10">
                    {/* ซ้าย */}
                    <div className="w-full md:w-1/2 flex flex-col gap-6">
                        <h1 className="font-playfair text-3xl font-bold text-white">
                            {restaurantName || "Select a Restaurant"}
                        </h1>
                        <div className="flex flex-col gap-1">
                            <p className="text-yellow-500 text-xs tracking-widest uppercase mb-1">Selected Date & Time</p>
                            <p className="text-gray-400 text-sm">
                                {bookDate ? `${dayjs(bookDate).format("DD MMM YYYY")} at ${bookTime}` : "—"}
                            </p>
                        </div>
                    </div>

                    {/* ขวา */}
                    <div className="w-full md:w-1/2 flex flex-col gap-5">
                        <h2 className="font-playfair text-xl font-bold text-yellow-500">
                            Book Your Reservation
                        </h2>

                        {/* Restaurant */}
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 text-xs tracking-widest uppercase">Restaurant</label>
                            <select
                                value={restaurantId}
                                onChange={(e) => {
                                    const selected = restaurants.find(r => r._id === e.target.value)
                                    setRestaurantId(e.target.value)
                                    setRestaurantName(selected?.name || "")
                                }}
                                className="bg-[#1a1a1a] border border-gray-700 text-white text-sm px-4 py-2.5 outline-none focus:border-yellow-500 transition"
                            >
                                <option value="" disabled>Select Restaurant</option>
                                {restaurants.map((r) => (
                                    <option key={r._id} value={r._id}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div className="flex flex-col gap-1">
                            <label className="text-white text-xs tracking-widest uppercase">Select Date</label>
                            <div className="bg-[#1a1a1a] border border-gray-700 p-3">
                                <DateReserve onDateChange={(value: Dayjs | null) => setBookDate(value)} />
                            </div>
                        </div>

                        {/* Time */}
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 text-xs tracking-widest uppercase">Select Time</label>
                            <input
                                type="time"
                                value={bookTime}
                                onChange={(e) => setBookTime(e.target.value)}
                                className="bg-[#1a1a1a] border border-gray-700 text-white text-sm px-4 py-2.5 outline-none focus:border-yellow-500 transition [color-scheme:dark]"
                            />
                        </div>

                        <button
                            onClick={handleBooking}
                            disabled={loading}
                            className="w-full py-3 bg-yellow-500 text-black text-sm font-semibold
                                       tracking-widest uppercase hover:bg-yellow-400
                                       transition-all duration-200 mt-2 disabled:opacity-50"
                        >
                            {loading ? "Confirming..." : "Confirm Reservation"}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}