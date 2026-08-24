import { Metadata } from 'next'
import OutletDetailClient from './OutletDetailClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace(/\/api$/, '')
const SITE_URL = 'https://www.bigbeancafe.in'

async function getOutlet(slug: string) {
  try {
    const res = await fetch(`${API_URL}/outlets/slug/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data?.data || null
  } catch {
    return null
  }
}

const getOutletImageUrl = (image?: string | null): string | undefined => {
  if (!image) return undefined
  if (image.startsWith('http')) return image
  return `${API_BASE_URL}/${image.replace(/^\/+/, '')}`
}

const getShortName = (name?: string | null): string => {
  if (!name) return ''
  return name.replace(/^big bean cafe\s*[-–—]?\s*/i, '').trim() || name
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const canonical = `${SITE_URL}/outlets/${params.slug}`
  const outlet = await getOutlet(params.slug)

  if (!outlet) {
    return {
      title: 'Outlet Not Found | Big Bean Café',
      description: 'The outlet you are looking for could not be found.',
      robots: { index: false, follow: false },
      alternates: { canonical },
    }
  }

  const shortName = getShortName(outlet.name)
  const title = outlet.seo_title || `Big Bean Cafe ${shortName} | Bengaluru`
  const description = outlet.seo_description ||
    (outlet.address
      ? `Visit Big Bean Cafe ${shortName} at ${outlet.address}. Specialty coffee, breakfast, brunch, fresh food and desserts in Bengaluru.`
      : 'Premium coffee, café dining, events and franchise opportunities.')
  const ogTitle = outlet.og_title || title
  const ogDescription = outlet.og_description || description
  const ogImage = getOutletImageUrl(outlet.image)

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: 'Big Bean Café Coffee Roasters',
      images: ogImage ? [{ url: ogImage }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : [],
    },
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const outlet = await getOutlet(params.slug)
  const canonical = `${SITE_URL}/outlets/${params.slug}`
  const imageUrl = getOutletImageUrl(outlet?.image)

  const outletSchema = outlet
    ? {
        '@context': 'https://schema.org',
        '@type': 'CafeOrCoffeeShop',
        name: outlet.name,
        url: canonical,
        ...(outlet.phone ? { telephone: outlet.phone } : {}),
        ...(outlet.email ? { email: outlet.email } : {}),
        ...(imageUrl ? { image: [imageUrl] } : {}),
        address: {
          '@type': 'PostalAddress',
          streetAddress: outlet.address,
          addressLocality: 'Bengaluru',
          addressRegion: 'Karnataka',
          addressCountry: 'IN',
        },
        ...(outlet.latitude != null && outlet.longitude != null
          ? {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: outlet.latitude,
                longitude: outlet.longitude,
              },
            }
          : {}),
        ...(outlet.opening_hours ? { openingHours: outlet.opening_hours } : {}),
        hasMenu: `${SITE_URL}/menu`,
      }
    : null

  return (
    <>
      {outletSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(outletSchema) }}
        />
      )}
      <OutletDetailClient slug={params.slug} initialOutlet={outlet} />
    </>
  )
}
