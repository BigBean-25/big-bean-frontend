import {
  generateOrganizationSchema,
  websiteSchema,
} from '@/lib/schema'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

type SiteSettings = Record<string, string | null>

async function fetchSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${API_URL}/seo-pages/settings/public`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return {}
    const json = await res.json()
    return json?.data || {}
  } catch {
    return {}
  }
}

export default async function GlobalSeoScripts() {
  const settings = await fetchSettings()

  const gscKey = settings.google_search_console_verification || null
  const bingKey = settings.bing_verification      || null
  const fbKey  = settings.facebook_domain_verification || null

  const orgSchema = generateOrganizationSchema(settings)

  return (
    <>
      {/* ── Verification meta tags ────────────────────────────── */}
      {gscKey  && <meta name="google-site-verification" content={gscKey} />}
      {bingKey && <meta name="msvalidate.01" content={bingKey} />}
      {fbKey   && <meta name="facebook-domain-verification" content={fbKey} />}

      {/* ── JSON-LD schemas ───────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
    </>
  )
}
