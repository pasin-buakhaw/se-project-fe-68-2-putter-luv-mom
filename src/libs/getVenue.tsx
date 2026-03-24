export default async function getVenue(vid: string) {
    const response = await fetch(
        `https://project-bn-sorawat.vercel.app/api/v1/restaurants/${vid}`
    )
    if (!response.ok) {
        throw new Error("Failed to fetch restaurant")
    }
    return await response.json()
}