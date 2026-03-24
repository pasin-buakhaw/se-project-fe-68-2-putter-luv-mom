"use client";

import DateReserve from '@/components/DateReserve';
import { BookingItem } from '@/../interface';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import getVenues from '@/libs/getVenues';
import createReservation from '@/libs/createReservation';
import { useEffect } from 'react';

export default function BookingClient() {
    const { data: session } = useSession()
    const router = useRouter()

    const [restaurants, setRestaurants] = useState<any[]>([])
    const [restaurantId, setRestaurantId] = useState("")
    const [restaurantName, setRestaurantName] = useState("")
    const [bookDate, setBookDate] = useState<Dayjs | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        getVenues().then((data) => setRestaurants(data.data))
    }, [])

    const handleBooking = async () => {
        if (!restaurantId || !bookDate) {
            setError("Please select a restaurant and date")
            return
        }
        setError("")
        setLoading(true)
        try {
            const token = (session?.user as any)?.token
            await createReservation(
                restaurantId,
                dayjs(bookDate).toISOString(),
                token
            )
            alert("Booking Confirmed!")
            router.push("/mybooking")
        } catch (err: any) {
            setError(err.message || "Failed to create booking")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-black text-white px-6 py-12">
            <div className="max-w-7xl px-6 mx-auto">

                <p className="text-gray-600 text-xs tracking-widest uppercase mb-8">
                    Home / <span className="text-gray-400 ml-1">Booking</span>
                </p>

                <div className="flex flex-col md:flex-row gap-10">

                    {/* ซ้าย */}
                    <div className="w-full md:w-1/2 flex flex-col gap-6">
                        <h1 className="font-playfair text-3xl font-bold text-white">
                            {restaurantName || "Select a Restaurant"}
                        </h1>
                        <div className="flex flex-col gap-1">
                            <p className="text-yellow-500 text-xs tracking-widest uppercase mb-1">Selected Date</p>
                            <p className="text-gray-400 text-sm">
                                {bookDate ? dayjs(bookDate).format("DD MMM YYYY") : "—"}
                            </p>
                        </div>
                    </div>

                    {/* ขวา */}
                    <div className="w-full md:w-1/2 flex flex-col gap-5">
                        <h2 className="font-playfair text-xl font-bold text-yellow-500">
                            Book Your Reservation
                        </h2>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

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
                            <label className="text-gray-500 text-xs tracking-widest uppercase">Select Date</label>
                            <div className="bg-[#1a1a1a] border border-gray-700 p-3">
                                <DateReserve onDateChange={(value: Dayjs | null) => setBookDate(value)} />
                            </div>
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