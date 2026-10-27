import type { Metadata } from 'next'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { getOutlets, sortOutlets } from '@/lib/outlets'
import PrivateEventsClient from '@/components/private-events/PrivateEventsClient'

const SITE_URL = 'https://www.bigbeancafe.in'
const PAGE_URL = `${SITE_URL}/private-events`
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace(/\/api$/, '')

export const revalidate = 60

interface PrivateEventsHero {
  id: number
  eyebrow: string | null
  heading: string
  description: string | null
  supporting_text: string | null
  primary_cta_text: string | null
  secondary_cta_text: string | null
  image: string | null
  mobile_image: string | null
  image_alt: string | null
  status: string
}

interface PrivateEventsGalleryItem {
  id: number
  image: string
  outlet_slug: string | null
  outlet_name: string | null
  caption: string | null
  alt_text: string | null
  status: string | null
  sort_order: number | null
}

interface PrivateEventsContent {
  hero: PrivateEventsHero | null
  gallery: PrivateEventsGalleryItem[]
}

const imageUrl = (img?: string | null): string | null => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

async function getContent(): Promise<PrivateEventsContent> {
  try {
    const res = await fetch(`${API_URL}/private-events/content`, { next: { revalidate: 60 } })
    if (!res.ok) return { hero: null, gallery: [] }
    const json = await res.json()
    const raw = Array.isArray(json?.data?.gallery) ? json.data.gallery : []
    const gallery: PrivateEventsGalleryItem[] = raw
      .filter((g: any) => g && g.image && g.status !== 'inactive')
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id)
    return { hero: json?.data?.hero || null, gallery }
  } catch {
    return { hero: null, gallery: [] }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { hero } = await getContent()
  const heroImg = imageUrl(hero?.image)
  const ogTitle = 'Birthdays, Team Gatherings & Group Dining | Big Bean Cafe'
  const ogDescription =
    'Plan your next celebration across 8 Big Bean Cafe locations in Bengaluru, with seating capacities of 50-100 depending on the outlet. Enquire about your date.'

  return {
    title: 'Event Spaces in Bengaluru | 50-100 Seats | Big Bean Cafe',
    description:
      'Plan birthdays, corporate events and get-togethers at Big Bean Cafe in Bengaluru. Explore our Bengaluru outlets with seating capacities of 50-100 and enquire today.',
    alternates: { canonical: PAGE_URL },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: PAGE_URL,
      siteName: 'Big Bean Cafe',
      locale: 'en_IN',
      type: 'website',
      // Only attach a social image when a real, admin-approved hero exists
      ...(heroImg ? { images: [{ url: heroImg }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      ...(heroImg ? { images: [heroImg] } : {}),
    },
  }
}

// Outlet cards are driven entirely by the shared active-outlet source used
// by the main /outlets page — new or reactivated outlets appear automatically.
export default async function PrivateEventsPage() {
  const [{ hero, gallery }, apiOutlets] = await Promise.all([getContent(), getOutlets()])
  const ordered = sortOutlets(apiOutlets)

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Private Events', item: PAGE_URL },
    ],
  }

  const pageLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Event Spaces & Group Bookings in Bengaluru',
    url: PAGE_URL,
    description:
      'Plan birthdays, corporate events and get-togethers at Big Bean Cafe in Bengaluru. Explore our Bengaluru outlets with seating capacities of 50-100 and enquire today.',
    isPartOf: { '@type': 'WebSite', name: 'Big Bean Café', url: SITE_URL },
  }

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Private events and group bookings',
    serviceType: 'Private event hosting at cafés',
    provider: { '@type': 'Organization', name: 'Big Bean Cafe', url: SITE_URL },
    areaServed: { '@type': 'City', name: 'Bengaluru' },
    description:
      'Enquiry-based private gatherings, celebrations and group bookings across Big Bean Cafe outlets in Bengaluru.',
    url: PAGE_URL,
  }

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Big Bean Cafe outlets for private gatherings',
    numberOfItems: ordered.length,
    itemListElement: ordered.map((o, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: o.name,
      url: `${PAGE_URL}#${o.slug}`,
    })),
  }

  // EventVenue only for the verified Koramangala first-floor event space
  const koramangala = ordered.find((o) => o.slug === 'koramangala')
  const venueLd = koramangala
    ? {
        '@context': 'https://schema.org',
        '@type': 'EventVenue',
        name: 'Big Bean Cafe Koramangala — First-Floor Event Space',
        url: `${PAGE_URL}#koramangala`,
        maximumAttendeeCapacity: 100,
        address: {
          '@type': 'PostalAddress',
          streetAddress: koramangala.address,
          addressLocality: 'Bengaluru',
          addressRegion: 'Karnataka',
          addressCountry: 'IN',
        },
      }
    : null

  return (
    <div className="min-h-screen bg-[#FDF8F1]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbLd, pageLd, serviceLd, itemListLd, ...(venueLd ? [venueLd] : [])]),
        }}
      />
      <Header />
      <PrivateEventsClient
        hero={hero}
        gallery={gallery}
        outlets={ordered}
      />
      <Footer />
    </div>
  )
}
