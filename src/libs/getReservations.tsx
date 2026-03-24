export default async function getReservations(token: string) {
    const response = await fetch(
        "https://project-bn-sorawat.vercel.app/api/v1/reservations",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    )
    if (!response.ok) {
        throw new Error("Failed to fetch reservations")
    }
    return await response.json()
}