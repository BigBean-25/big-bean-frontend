import {
  generateLocalBusinessSchema,
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

  const gtmId  = settings.google_tag_manager_id  || null
  const gaId   = settings.google_analytics_id    || null
  const gscKey = settings.google_search_console_verification || null
  const bingKey = settings.bing_verification      || null
  const fbKey  = settings.facebook_domain_verification || null

  const lbSchema  = generateLocalBusinessSchema(settings)
  const orgSchema = generateOrganizationSchema(settings)

  return (
    <>
      {/* ── Verification meta tags ────────────────────────────── */}
      {gscKey  && <meta name="google-site-verification" content={gscKey} />}
      {bingKey && <meta name="msvalidate.01" content={bingKey} />}
      {fbKey   && <meta name="facebook-domain-verification" content={fbKey} />}

      {/* ── Google Tag Manager (head) ─────────────────────────── */}
      {gtmId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
          }}
        />
      )}

      {/* ── Google Analytics 4 (no GTM) ───────────────────────── */}
      {gaId && !gtmId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
            }}
          />
        </>
      )}

      {/* ── JSON-LD schemas ───────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
    </>
  )
}
