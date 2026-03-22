import Card from "./Card";
// 1. เพิ่มการ Import Interface จากไฟล์ที่คุณเพิ่งส่งมา
import { VenueJson, VenueItem } from "@/../interface"; 

export default async function VenueCatalog({ venuesJson }: { venuesJson: Promise<VenueJson> }) {
    const venueData = await venuesJson;  

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center p-10">
            {/* 2. ระบุ Type ให้กับ venue เป็น VenueItem เพื่อความปลอดภัยของ TypeScript */}
            {venueData.data.map((venue: VenueItem) => (
                <Card
                    key={venue.id}
                    venueName={venue.name}
                    imgSrc={venue.picture}
                    vid={venue.id}
                />
            ))}
        </div>
    );
}