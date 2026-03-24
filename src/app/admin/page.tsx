import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import AdminBookingList from "@/components/AdminBookingList";

export default async function AdminPage() {
    const session = await getServerSession(authOptions)

    if (!session) redirect("/signin")

    // เช็ค role admin
    if ((session.user as any)?.role !== "admin") redirect("/")

    return (
        <main className="min-h-screen bg-black text-white px-6 py-12">
            <div className="max-w-7xl px-6 mx-auto">
                <div className="mb-10">
                    <h1 className="text-2xl text-yellow-500 font-normal">Admin Dashboard</h1>
                    <p className="text-gray-600 text-xs tracking-widest uppercase mt-1">
                        Manage all reservations
                    </p>
                </div>
                <AdminBookingList />
            </div>
        </main>
    )
}