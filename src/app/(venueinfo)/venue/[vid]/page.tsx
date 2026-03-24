import getVenue from '@/libs/getVenue'
import getReviews from '@/libs/getReviews'
import RatingReview from '@/components/RatingReview'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import Link from 'next/link'

export default async function VenueDetailPage({ params }: { params: Promise<{ vid: string }> }) {
    const { vid } = await params
    const [venueDetail, reviewsData, session] = await Promise.all([
        getVenue(vid),
        getReviews(vid).catch(() => ({ data: [] })),
        getServerSession(authOptions),
    ])
    const v = venueDetail.data
    const reviews = reviewsData.data ?? []
    const token: string | null = (session?.user as any)?.token ?? null
    const userId: string | null = (session?.user as any)?.id ?? null

    return (
        <main className="min-h-screen bg-black text-white px-6 py-12">
            <div className="max-w-7xl px-6 mx-auto">

                {/* Breadcrumb */}
                <p className="text-gray-600 text-xs tracking-widest uppercase mb-8">
                    <Link href="/venue" className="hover:text-yellow-500 transition">Venues</Link>
                    {" / "}
                    <span className="text-gray-400">{v.name}</span>
                </p>

                <div className="flex flex-col md:flex-row gap-10">

                    {/* ซ้าย: placeholder แทนรูป */}
                    <div className="w-full md:w-1/2 h-72 bg-[#111] border border-yellow-600/20
                                    flex items-center justify-center">
                        <span className="font-playfair text-4xl text-yellow-600/30">
                            {v.name.charAt(0)}
                        </span>
                    </div>

                    {/* ขวา: ข้อมูล */}
                    <div className="w-full md:w-1/2 flex flex-col justify-between">
                        <div>
                            <h1 className="font-playfair text-3xl font-bold text-yellow-500 mb-6">
                                {v.name}
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-yellow-400">★</span>
                                <span className="text-white">{v.averageRating}</span>
                                <span className="text-gray-500 text-sm">({v.reviewCount} reviews)</span>
                            </div>

                            <div className="flex flex-col gap-4">
                                <DetailRow label="Address" value={v.address} />
                                <DetailRow label="Tel" value={v.tel} />
                                <DetailRow label="Open" value={`${v.opentime} – ${v.closetime}`} />
                            </div>
                        </div>

                        <Link
                            href={`/booking?vid=${vid}&venue=${encodeURIComponent(v.name)}`}
                            className="mt-8 w-fit text-xs font-medium px-6 py-2
                                       text-yellow-500 border border-yellow-500
                                       hover:bg-yellow-500 hover:text-black
                                       transition-all duration-200 tracking-widest uppercase"
                        >
                            Book Now
                        </Link>
                    </div>
                </div>

                <RatingReview
                    venueId={vid}
                    token={token}
                    userId={userId}
                    initialReviews={reviews}
                />
            </div>
        </main>
    )
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-gray-600 text-xs tracking-widest uppercase">{label}</span>
            <span className="text-gray-300 text-sm">{value}</span>
        </div>
    )
}