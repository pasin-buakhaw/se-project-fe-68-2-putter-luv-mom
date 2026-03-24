export default async function getReviews(vid: string) {
    const response = await fetch(
        `https://project-bn-sorawat.vercel.app/api/v1/restaurants/${vid}/reviews`,
        { cache: "no-store" }
    )
    if (!response.ok) throw new Error("Failed to fetch reviews")
    return await response.json()
}
