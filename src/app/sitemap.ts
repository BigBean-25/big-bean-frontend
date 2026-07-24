import { MetadataRoute } from 'next'

const BASE    = 'https://www.bigbeancafe.in'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const now     = new Date()

type DynamicItem = {
  slug?: string | null
  updated_at?: string | null
  created_at?: string | null
}

function safeDate(item: DynamicItem): Date {
  const raw = item.updated_at || item.created_at
  if (!raw) return now
  const d = new Date(raw)
  return isNaN(d.getTime()) ? now : d
}

async function safeFetch(url: string): Promise<DynamicItem[]> {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    const arr = json?.data || json?.posts || []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE + '/',                     priority: 1.0, changeFrequency: 'weekly',  lastModified: now },
    { url: BASE + '/about',                priority: 0.9, changeFrequency: 'monthly', lastModified: now },
    { url: BASE + '/menu',                 priority: 0.9, changeFrequency: 'weekly',  lastModified: now },
    { url: BASE + '/outlets',              priority: 0.9, changeFrequency: 'weekly',  lastModified: now },
    { url: BASE + '/offers',               priority: 0.8, changeFrequency: 'weekly',  lastModified: now },
    { url: BASE + '/contact',              priority: 0.8, changeFrequency: 'monthly', lastModified: now },
    { url: BASE + '/gallery',              priority: 0.7, changeFrequency: 'weekly',  lastModified: now },
    { url: BASE + '/blog',                 priority: 0.8, changeFrequency: 'daily',   lastModified: now },
    { url: BASE + '/careers',              priority: 0.7, changeFrequency: 'weekly',  lastModified: now },
    { url: BASE + '/franchise',            priority: 0.7, changeFrequency: 'monthly', lastModified: now },
    { url: BASE + '/corporate-orders',     priority: 0.7, changeFrequency: 'monthly', lastModified: now },
    { url: BASE + '/reservations',         priority: 0.8, changeFrequency: 'weekly',  lastModified: now },
    { url: BASE + '/merchandise',          priority: 0.7, changeFrequency: 'weekly',  lastModified: now },
    { url: BASE + '/privacy-policy',       priority: 0.3, changeFrequency: 'yearly',  lastModified: now },
    { url: BASE + '/terms-and-conditions', priority: 0.3, changeFrequency: 'yearly',  lastModified: now },
  ]

  // Each fetch is independently safe — any failure returns []
  const [blogPosts, products, outlets] = await Promise.all([
    safeFetch(`${API_URL}/blog-posts/published`),
    safeFetch(`${API_URL}/merchandise/active`),
    safeFetch(`${API_URL}/outlets/active`),
  ])

  const blogUrls: MetadataRoute.Sitemap = blogPosts
    .filter(p => typeof p.slug === 'string' && p.slug.trim() !== '')
    .map(p => ({
      url: `${BASE}/blog/${p.slug}`,
      priority: 0.7,
      changeFrequency: 'weekly' as const,
      lastModified: safeDate(p),
    }))

  const productUrls: MetadataRoute.Sitemap = products
    .filter(p => typeof p.slug === 'string' && p.slug.trim() !== '')
    .map(p => ({
      url: `${BASE}/merchandise/${p.slug}`,
      priority: 0.6,
      changeFrequency: 'weekly' as const,
      lastModified: safeDate(p),
    }))

  // Only include outlets that actually have a slug (currently none do — skipped safely)
  const outletUrls: MetadataRoute.Sitemap = outlets
    .filter(o => typeof o.slug === 'string' && o.slug.trim() !== '')
    .map(o => ({
      url: `${BASE}/outlets/${o.slug}`,
      priority: 0.7,
      changeFrequency: 'monthly' as const,
      lastModified: safeDate(o),
    }))

  return [...staticPages, ...blogUrls, ...productUrls, ...outletUrls]
}
