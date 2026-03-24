import getVenues from '@/libs/getVenues'
import VenueCatalog from '@/components/VenueCatalog'

export default async function VenuePage() {
    const venuesJson = await getVenues()  // เพิ่ม await

    return (
        <div className="min-h-screen bg-black px-6 py-10">
            <div className="text-center mb-10">
                <h1 className="font-playfair text-4xl font-thin text-white tracking-widest">
                    Select Your
                </h1>
                <h1 className="font-playfair text-4xl mt-2 font-bold text-yellow-500 tracking-widest">
                    Destinations
                </h1>
                <p className="text-gray-400 mt-2 text-sm tracking-wide">
                    Choose from our exclusive collection of signature restaurants, each offering a
                    unique culinary journey
                </p>
            </div>
            <VenueCatalog venuesJson={venuesJson} />
        </div>
    )
}