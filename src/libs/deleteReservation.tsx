export default async function deleteReservation(
    reservationId: string,
    token: string
) {
    const response = await fetch(
        `https://project-bn-sorawat.vercel.app/api/v1/reservations/${reservationId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    if (!response.ok) {
        throw new Error("Failed to delete reservation")
    }
    return await response.json()
}