const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface Outlet {
  id: number
  name: string
  slug?: string | null
  address: string
  phone: string | null
  email: string | null
  opening_hours: string | null
  latitude: number | string | null
  longitude: number | string | null
  image: string | null
  status: string
  sort_order: number
  seo_title?: string | null
  seo_description?: string | null
  seo_h1?: string | null
  og_title?: string | null
  og_description?: string | null
}

export interface OutletGalleryItem {
  id: number
  title: string
  category: string
  media_type: string
  image: string | null
  description: string | null
  sort_order: number
  status: string
}

export interface OutletContent {
  facilities: string[]
  event_space_text: string
}

export interface OutletMenuItem {
  id: number
  name: string
  description: string
  image_url: string | null
  display_price: string
  category_name: string
}

// Facility keys must mirror outletContentController.FACILITY_KEYS (backend).
export const OUTLET_FACILITIES: { key: string; label: string }[] = [
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'charging_points', label: 'Charging Points' },
  { key: 'parking', label: 'Parking' },
  { key: 'outdoor_seating', label: 'Outdoor Seating' },
  { key: 'work_friendly', label: 'Work Friendly' },
  { key: 'air_conditioning', label: 'Air Conditioning' },
  { key: 'event_space', label: 'Event Space' },
  { key: 'family_friendly', label: 'Family Friendly' },
  { key: 'pet_friendly', label: 'Pet Friendly' },
  { key: 'live_music', label: 'Live Music' },
  { key: 'rooftop', label: 'Rooftop' },
  { key: 'drive_thru', label: 'Drive Thru' },
]

export const outletGalleryCategory = (slug: string) => `outlet-${slug}`

const jsonList = (json: any): any[] =>
  Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []

// Server-safe fetch for the public outlets list (used by page components
// to seed client components for SSR).
export async function getOutlets(): Promise<Outlet[]> {
  try {
    const res = await fetch(`${API_URL}/outlets`, { cache: 'no-store' })
    if (!res.ok) return []
    const list: Outlet[] = jsonList(await res.json())
    return list.filter((o) => o.status === 'active')
  } catch {
    return []
  }
}

export async function getOutletBySlug(slug: string): Promise<Outlet | null> {
  try {
    const res = await fetch(`${API_URL}/outlets/slug/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return json?.data || null
  } catch {
    return null
  }
}

// Outlet "Step Inside" gallery — reuses the shared gallery_items CMS table
// with category = 'outlet-{slug}'. Managed from Admin → Outlets → Edit.
export async function getOutletGallery(slug: string): Promise<OutletGalleryItem[]> {
  try {
    const res = await fetch(
      `${API_URL}/gallery-items/active?category=${encodeURIComponent(outletGalleryCategory(slug))}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return []
    return jsonList(await res.json())
      .filter((i: OutletGalleryItem) => i.media_type === 'image' && !!i.image)
      .sort((a: OutletGalleryItem, b: OutletGalleryItem) => a.sort_order - b.sort_order || b.id - a.id)
  } catch {
    return []
  }
}

// Per-outlet facilities + event space content (outlet_content table).
export async function getOutletContent(slug: string): Promise<OutletContent> {
  try {
    const res = await fetch(`${API_URL}/outlets/slug/${slug}/content`, { cache: 'no-store' })
    if (!res.ok) return { facilities: [], event_space_text: '' }
    const json = await res.json()
    return {
      facilities: Array.isArray(json?.data?.facilities) ? json.data.facilities : [],
      event_space_text: typeof json?.data?.event_space_text === 'string' ? json.data.event_space_text : '',
    }
  } catch {
    return { facilities: [], event_space_text: '' }
  }
}

interface MenuCategory {
  id: number
  name: string
  children?: MenuCategory[]
}

const flattenCategories = (cats: MenuCategory[]): MenuCategory[] => {
  const out: MenuCategory[] = []
  const seen = new Set<number>()
  const walk = (items: MenuCategory[]) => {
    for (const c of items) {
      const id = Number(c.id)
      if (Number.isFinite(id) && !seen.has(id)) { seen.add(id); out.push({ ...c, id }) }
      if (Array.isArray(c.children) && c.children.length) walk(c.children)
    }
  }
  walk(cats)
  return out
}

// Outlet-specific menu preview — reuses the same store-menu endpoints as /menu.
// outlet_id is the website outlet id; the backend resolves it to the
// outlet's store_branch_id server-side.
export async function getOutletMenuPreview(outletId: number, limit = 14): Promise<OutletMenuItem[]> {
  try {
    const catRes = await fetch(`${API_URL}/store-menu/categories?outlet_id=${outletId}`, { cache: 'no-store' })
    if (!catRes.ok) return []
    const catJson = await catRes.json()
    const cats = flattenCategories(jsonList(catJson))
    if (!cats.length) return []

    const results = await Promise.all(
      cats.map(async (cat) => {
        try {
          const res = await fetch(
            `${API_URL}/store-menu/products/${cat.id}?outlet_id=${outletId}&limit=50`,
            { cache: 'no-store' }
          )
          const json = await res.json().catch(() => null)
          return (json?.success ? jsonList(json) : []).map((p: any) => ({ ...p, _cat: cat.name }))
        } catch {
          return []
        }
      })
    )

    const seen = new Set<number>()
    const items: OutletMenuItem[] = []
    for (const products of results) {
      for (const p of products) {
        if (seen.has(p.id)) continue
        seen.add(p.id)
        if (p.is_available === false || (p.status != null && p.status !== 1)) continue
        items.push({
          id: p.id,
          name: p.name,
          description: p.description || '',
          image_url: p.image_url || null,
          display_price: p.display_price || '',
          category_name: p._cat,
        })
        if (items.length >= limit) return items
      }
    }
    return items
  } catch {
    return []
  }
}

// Shared ordering: Koramangala first, then sort_order, then newest id.
// Pure + deterministic so SSR HTML and hydration produce identical output.
export const sortOutlets = (list: Outlet[]): Outlet[] => {
  const priority = (o: Outlet) => {
    const name = (o.name || '').toLowerCase()
    const slug = (o.slug || '').toLowerCase()
    return name.includes('koramangala') || slug.includes('koramangala') ? 0 : 1
  }
  return [...list].sort((a, b) => {
    const pd = priority(a) - priority(b)
    return pd !== 0 ? pd : a.sort_order - b.sort_order || b.id - a.id
  })
}
