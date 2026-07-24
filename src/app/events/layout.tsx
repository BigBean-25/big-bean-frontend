import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { getApiUrl } from '@/lib/api'

const API_URL = getApiUrl()
const API_BASE = API_URL.replace('/api', '')
const SITE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Events at Big Bean Cafe | Workshops, Live Music & Tastings',
  description:
    'Discover upcoming events at Big Bean Cafe – coffee workshops, live acoustic evenings, latte art sessions, tastings and community experiences. Book your tickets online.',
  keywords: ['Big Bean Cafe events', 'coffee workshops', 'live music Bangalore', 'cafe tastings', 'latte art workshop'],
  openGraph: {
    title: 'Events at Big Bean Cafe | Workshops, Live Music & Tastings',
    description:
      'Discover upcoming events at Big Bean Cafe – coffee workshops, live acoustic evenings, latte art sessions, tastings and community experiences. Book your tickets online.',
    url: '/events',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/images/og-events.jpg`,
        width: 1200,
        height: 630,
        alt: 'Big Bean Cafe Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Events at Big Bean Cafe | Workshops, Live Music & Tastings',
    description:
      'Discover upcoming events at Big Bean Cafe – coffee workshops, live acoustic evenings, latte art sessions, tastings and community experiences. Book your tickets online.',
    images: [`${SITE_URL}/images/og-events.jpg`],
  },
}

export default function EventsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
