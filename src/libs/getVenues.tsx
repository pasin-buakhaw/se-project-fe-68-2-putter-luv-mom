export default async function getVenues() {
    const response = await fetch("https://project-bn-sorawat.vercel.app/api/v1/restaurants")
    if (!response.ok) {
        throw new Error("Failed to fetch restaurants")
    }
    return await response.json()
}