import Link from "next/link"
import { VenueItem, VenueJson } from "@/../interface"

export default function VenueCatalog({ venuesJson }: { venuesJson: VenueJson }) {  // เปลี่ยน any → VenueJson
    const restaurants: VenueItem[] = venuesJson.data

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {restaurants.map((r) => (
                <Link href={`/venue/${r._id}`} key={r._id}>
                    <div className="bg-[#111] border border-yellow-600/20 hover:border-yellow-500/60 
                                    transition-all duration-200 p-6 flex flex-col gap-3 h-full cursor-pointer">
                        
                        {/* ชื่อ */}
                        <h2 className="font-playfair text-xl text-yellow-500 font-bold">{r.name}</h2>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                            <span className="text-yellow-400 text-sm">★</span>
                            <span className="text-white text-sm">{r.averageRating}</span>
                            <span className="text-gray-600 text-xs">({r.reviewCount} reviews)</span>
                        </div>

                        {/* Address */}
                        <p className="text-gray-400 text-sm">{r.address}</p>

                        {/* Open/Close */}
                        <div className="flex items-center gap-2 mt-auto">
                            <span className="text-green-500 text-xs border border-green-500/30 px-2 py-0.5">
                                {r.opentime} – {r.closetime}
                            </span>
                        </div>

                        {/* Tel */}
                        <p className="text-gray-600 text-xs">{r.tel}</p>
                    </div>
                </Link>
            ))}
        </div>
    )
}