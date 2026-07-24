import { generateFaqSchema } from './schema'

const API_URL      = process.env.NEXT_PUBLIC_API_URL      || 'http://localhost:5000/api'
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')

export async function getSeo(pageKey: string) {
  try {
    const res = await fetch(`${API_URL}/seo-pages/page/${pageKey}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return json?.data || null
  } catch {
    return null
  }
}

export const getImageUrl = (image?: string | null): string | undefined => {
  if (!image) return undefined
  if (image.startsWith('http')) return image
  if (image.startsWith('/uploads')) return `${API_BASE_URL}${image}`
  if (image.startsWith('uploads'))  return `${API_BASE_URL}/${image}`
  return `${API_BASE_URL}/${image.replace(/^\/+/, '')}`
}

type SeoData = Record<string, unknown> | null

export function buildMetadata(seo: SeoData, fallback: {
  title: string
  description: string
  path: string
}) {
  const str = (v: unknown): string | undefined =>
    v != null && v !== '' ? String(v) : undefined

  const title       = str(seo?.meta_title)       ?? fallback.title
  const description = str(seo?.meta_description) ?? fallback.description
  const canonical   = str(seo?.canonical_url)    ?? `https://www.bigbeancafe.in${fallback.path}`
  const keywords    = str(seo?.meta_keywords)
  const ogImage     = getImageUrl(str(seo?.og_image || seo?.twitter_image) ?? null)

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical },
    robots: {
      index:  seo?.robots_index  !== 0,
      follow: seo?.robots_follow !== 0,
    },
    openGraph: {
      title:       str(seo?.og_title)       ?? title,
      description: str(seo?.og_description) ?? description,
      url:         canonical,
      siteName:    'Big Bean Café Coffee Roasters',
      images:      ogImage ? [{ url: ogImage }] : [],
      type:        'website' as const,
    },
    twitter: {
      card:        'summary_large_image' as const,
      title:       str(seo?.twitter_title)       ?? str(seo?.og_title)       ?? title,
      description: str(seo?.twitter_description) ?? str(seo?.og_description) ?? description,
      images:      ogImage ? [ogImage] : [],
    },
  }
}

export function getFaqSchema(seo: SeoData): object | null {
  const raw = seo?.faq_schema_json
  if (!raw || typeof raw !== 'string' || raw.trim() === '') return null
  try {
    const items = JSON.parse(raw)
    if (!Array.isArray(items) || items.length === 0) return null
    return generateFaqSchema(items)
  } catch {
    return null
  }
}
