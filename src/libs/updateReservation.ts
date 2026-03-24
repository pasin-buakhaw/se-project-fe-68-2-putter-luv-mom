export default async function updateReservation(
    reservationId: string,
    reservationDate: string,
    token: string
) {
    const response = await fetch(
        `https://project-bn-sorawat.vercel.app/api/v1/reservations/${reservationId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reservationDate }),
        }
    )
    if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || "Failed to update reservation")
    }
    return await response.json()
}