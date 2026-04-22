import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/AdminDashboard"

export default async function AdminPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/signin")
    if ((session.user as any)?.role !== "admin") redirect("/")
    return <AdminDashboard />
}
