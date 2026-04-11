'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import MenuForm from '@/components/MenuForm'
import { createMenu } from '@/libs/getMenus'
import Link from 'next/link'

export default function NewMenuPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const token = (session?.user as any)?.token ?? ''

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/signin')
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.push('/')
  }, [status, session, router])

  const handleSubmit = async (data: Parameters<typeof createMenu>[1]) => {
    await createMenu(token, data)
    router.push('/admin/menu')
  }

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <Link href="/admin/menu" className="text-zinc-500 text-sm hover:text-yellow-400 transition">
            ← Back to Menu List
          </Link>
          <h1 className="text-2xl text-yellow-500 font-normal mt-4">Add New Menu Item</h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <MenuForm
            venueId=""
            onSubmit={handleSubmit}
            submitLabel="Create Menu Item"
          />
        </div>
      </div>
    </main>
  )
}
