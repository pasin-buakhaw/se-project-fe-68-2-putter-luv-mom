export default async function createReservation(
    restaurantId: string,
    reservationDate: string,
    token: string
) {
    const response = await fetch(
        `https://project-bn-sorawat.vercel.app/api/v1/restaurants/${restaurantId}/reservations`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reservationDate }),
        }
    )
    if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || "Failed to create reservation")
    }
    return await response.json()
}