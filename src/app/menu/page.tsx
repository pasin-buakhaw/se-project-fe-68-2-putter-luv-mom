import { getMenusByVenue } from '@/libs/getMenus'
import MenuGalleryClient from './MenuGalleryClient'

// Default venue — can be parameterised via searchParams later
const DEFAULT_VENUE_ID = process.env.NEXT_PUBLIC_DEFAULT_VENUE_ID || ''

export default async function MenuPage() {
  let initialMenus: Awaited<ReturnType<typeof getMenusByVenue>>['data'] = []

  try {
    if (DEFAULT_VENUE_ID) {
      const json = await getMenusByVenue(DEFAULT_VENUE_ID)
      initialMenus = json.data
    }
  } catch {
    // Server-side fetch failure — client will show empty state
  }

  return <MenuGalleryClient initialMenus={initialMenus} />
}
