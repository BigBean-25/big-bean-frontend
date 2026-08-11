'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const PUBLIC_SETTINGS_URL = `${API_URL}/seo-pages/settings/public`

type SiteSettings = Record<string, string | null>

export default function DynamicGoogleTracking() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(PUBLIC_SETTINGS_URL)
      .then(r => (r.ok ? r.json() : null))
      .then(j => {
        if (!cancelled && j?.success) setSettings(j.data || {})
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (!settings) return null

  const gtmId = settings.google_tag_manager_id || null
  const gaId = settings.google_analytics_id || null
  const adsId = settings.google_ads_tag_id || null

  if (gtmId) {
    return (
      <Script
        id="gtm-loader"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\nnew Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\nj=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n})(window,document,'script','dataLayer','${gtmId}');`,
        }}
      />
    )
  }

  if (!gaId && !adsId) return null

  const loaderId = gaId || adsId

  return (
    <>
      <Script
        id="gtag-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${loaderId}`}
        strategy="afterInteractive"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${gaId ? `gtag('config','${gaId}');` : ''}${adsId ? `gtag('config','${adsId}');` : ''}`,
        }}
      />
    </>
  )
}
