import { Metadata } from 'next'
import { getSeo, buildMetadata, getFaqSchema } from '@/lib/seo'
import { getOutlets } from '@/lib/outlets'
import HomeClient, { type HeroBannerData } from './HomeClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Hero banners are fetched on the server so the LCP media is present in the
// initial HTML instead of being discovered after hydration + a client fetch.
async function getHomeBanners(): Promise<HeroBannerData[]> {
  try {
    const res = await fetch(`${API_URL}/home-banners/active`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json?.data) ? json.data : []
  } catch {
    return []
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('home')
  return buildMetadata(seo, {
    title: 'Big Bean Café Coffee Roasters | Best Café in Bengaluru',
    description: 'Visit Big Bean Café Coffee Roasters for handcrafted coffee, fresh food, desserts, events and cozy café experiences across Bengaluru outlets.',
    path: '/',
  })
}

export default async function Page() {
  const [seo, outlets, heroBanners] = await Promise.all([getSeo('home'), getOutlets(), getHomeBanners()])
  const faqSchema = getFaqSchema(seo)
  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <HomeClient initialOutlets={outlets} initialBanners={heroBanners} />
    </>
  )
}
