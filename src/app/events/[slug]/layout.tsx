import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { getApiUrl } from '@/lib/api'

const API_URL = getApiUrl()
const API_BASE = API_URL.replace('/api', '')
const SITE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'

async function getEvent(slug: string) {
  try {
    const res = await fetch(`${API_URL}/events/${slug}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const data = await res.json()
    return data?.success ? data.data : null
  } catch {
    return null
  }
}

function getImageUrl(img: string | null) {
  if (!img) return `${SITE_URL}/images/og-events.jpg`
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/g, '')}`
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug)
  const event = await getEvent(slug)

  const title = event ? `${event.title} | Big Bean Cafe Events` : 'Event | Big Bean Cafe'
  const description =
    event?.short_description ||
    event?.description?.replace(/<[^>]+>/g, '').slice(0, 160) ||
    'Book tickets for this exclusive Big Bean Cafe event.'
  const image = getImageUrl(event?.event_banner || event?.event_thumbnail)

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: event ? [event.title, 'Big Bean Cafe', 'event', 'tickets', 'cafe'] : ['Big Bean Cafe', 'event', 'tickets'],
    openGraph: {
      title,
      description,
      url: `/events/${slug}`,
      type: 'article',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: event?.title || 'Big Bean Cafe Event',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default function EventDetailLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
