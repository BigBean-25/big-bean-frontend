const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface PublicContactSettings {
  contact_phone: string
  contact_email: string
  reservations_phone: string
  reservations_email: string
  franchise_phone: string
  franchise_email: string
  corporate_phone: string
  corporate_email: string
  career_phone: string
  career_email: string
  event_phone: string
  event_email: string
  whatsapp_enabled: string
  whatsapp_business_number: string
  address: string
  website_url: string
  store_url: string
  [key: string]: string
}

export const CONTACT_DEFAULTS: PublicContactSettings = {
  contact_phone: '8073601065',
  contact_email: 'info@bigbeancafe.in',
  reservations_phone: '8073601065',
  reservations_email: 'bookings@bigbeancafe.in',
  franchise_phone: '8867671422',
  franchise_email: 'franchise@bigbeancafe.in',
  corporate_phone: '8073601065',
  corporate_email: 'bookings@bigbeancafe.in',
  career_phone: '8073601065',
  career_email: 'jobs@bigbeancafe.in',
  event_phone: '8073601065',
  event_email: 'events@bigbeancafe.in',
  whatsapp_enabled: '0',
  whatsapp_business_number: '',
  address: 'Bengaluru, Karnataka, India',
  website_url: 'https://www.bigbeancafe.in',
  store_url: 'https://bigbeancafe.store',
}

let _cache: PublicContactSettings | null = null
let _cacheTs = 0
const CACHE_TTL = 60_000

export async function getPublicSettings(): Promise<PublicContactSettings> {
  if (_cache && Date.now() - _cacheTs < CACHE_TTL) return _cache
  try {
    const res = await fetch(`${API_URL}/site-settings/public`, { next: { revalidate: 60 } })
    const json = await res.json()
    if (json.success && json.data) {
      const merged = { ...CONTACT_DEFAULTS, ...json.data }
      _cache = merged
      _cacheTs = Date.now()
      return merged
    }
  } catch {}
  return { ...CONTACT_DEFAULTS }
}

export function formatPhoneForTel(phone: string): string {
  return phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '')
}
