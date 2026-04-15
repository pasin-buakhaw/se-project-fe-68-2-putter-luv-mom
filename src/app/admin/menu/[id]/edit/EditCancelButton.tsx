'use client'

import Link from 'next/link'

interface EditCancelButtonProps {
  href?: string
}

export default function EditCancelButton({ href = '/admin/menu' }: EditCancelButtonProps) {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-sm text-zinc-300 border border-zinc-600 rounded hover:bg-zinc-800 transition"
    >
      Cancel
    </Link>
  )
}
