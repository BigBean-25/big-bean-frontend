'use client'

import { useState, useEffect } from 'react'
import { Save, Globe, BarChart2, Search, Facebook, Linkedin, MapPin, Phone, Mail, Image } from 'lucide-react'
import apiRequest from '@/utils/api'
import toast from 'react-hot-toast'

const CARD = 'rounded-[28px] border border-[#DCE8E3] bg-white shadow-[0_18px_45px_rgba(31,42,36,0.06)] p-6 mb-6'

type Settings = Record<string, string>

const FIELDS: { key: string; label: string; placeholder: string; type?: string; hint?: string }[][] = [
  [
    { key: 'google_analytics_id',               label: 'Google Analytics ID',              placeholder: 'G-XXXXXXXXXX',        hint: 'GA4 Measurement ID' },
    { key: 'google_tag_manager_id',             label: 'Google Tag Manager ID',            placeholder: 'GTM-XXXXXXX',         hint: 'GTM Container ID' },
    { key: 'google_search_console_verification',label: 'Google Search Console Verification', placeholder: 'abc123...',         hint: 'HTML meta tag content value' },
    { key: 'facebook_domain_verification',      label: 'Facebook Domain Verification',     placeholder: 'abc123...',           hint: 'Facebook meta tag content value' },
    { key: 'bing_verification',                 label: 'Bing Webmaster Verification',      placeholder: 'abc123...',           hint: 'Bing meta tag content value' },
  ],
  [
    { key: 'default_og_image',   label: 'Default OG Image URL',  placeholder: 'https://www.bigbeancafe.in/og.jpg', hint: 'Fallback image for social sharing (1200×630 recommended)' },
    { key: 'business_phone',     label: 'Business Phone',        placeholder: '+91-XXXXXXXXXX' },
    { key: 'business_email',     label: 'Business Email',        placeholder: 'hello@bigbeancafe.in' },
    { key: 'business_address',   label: 'Business Address',      placeholder: '123 MG Road, Bengaluru, Karnataka 560001' },
    { key: 'business_latitude',  label: 'Latitude',              placeholder: '12.9716' },
    { key: 'business_longitude', label: 'Longitude',             placeholder: '77.5946' },
  ],
  [
    { key: 'same_as_instagram', label: 'Instagram URL', placeholder: 'https://www.instagram.com/bigbeancafe' },
    { key: 'same_as_facebook',  label: 'Facebook URL',  placeholder: 'https://www.facebook.com/bigbeancafe' },
    { key: 'same_as_linkedin',  label: 'LinkedIn URL',  placeholder: 'https://www.linkedin.com/company/bigbeancafe' },
    { key: 'same_as_zomato',    label: 'Zomato URL',    placeholder: 'https://www.zomato.com/bigbeancafe' },
    { key: 'same_as_swiggy',    label: 'Swiggy URL',    placeholder: 'https://www.swiggy.com/bigbeancafe' },
  ],
]

const SECTION_META = [
  { title: 'Analytics & Verification', icon: BarChart2, color: '#2FBF9B' },
  { title: 'Business Information',      icon: MapPin,    color: '#C9943A' },
  { title: 'Social Media Profiles',     icon: Globe,     color: '#6366f1' },
]

export default function SeoSettingsPage() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    apiRequest('/seo-pages/settings')
      .then(r => r.json())
      .then(j => { if (j.success) setSettings(j.data) })
      .finally(() => setLoading(false))
  }, [])

  const set = (key: string, value: string) =>
    setSettings(prev => ({ ...prev, [key]: value }))

  const save = async () => {
    setSaving(true)
    try {
      const res = await apiRequest('/seo-pages/settings', { method: 'PUT', body: JSON.stringify(settings) })
      const j = await res.json()
      if (j.success) toast.success('SEO settings saved!')
      else toast.error(j.message || 'Failed to save')
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="p-8 text-center text-sm text-[#9CB3AC]">Loading settings…</div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E27]">SEO Settings</h1>
          <p className="text-sm text-[#9CB3AC] mt-1">Analytics, verification codes, business info & social profiles</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white text-sm transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(to right,#2FBF9B,#1a9e80)' }}>
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {FIELDS.map((group, gi) => {
        const { title, icon: Icon, color } = SECTION_META[gi]
        return (
          <div key={gi} className={CARD}>
            <h2 className="text-base font-bold text-[#1A2E27] mb-5 flex items-center gap-2">
              <Icon className="w-5 h-5" style={{ color }} />
              {title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-[#4A6B5D] mb-1.5">{field.label}</label>
                  <input
                    type="text"
                    value={settings[field.key] || ''}
                    onChange={e => set(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#DCE8E3] bg-[#F8FFFE] text-sm text-[#1A2E27] placeholder-[#9CB3AC] focus:outline-none focus:ring-2 focus:ring-[#2FBF9B]/30 focus:border-[#2FBF9B]"
                  />
                  {field.hint && <p className="text-[11px] text-[#9CB3AC] mt-1">{field.hint}</p>}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Schema preview */}
      <div className={CARD}>
        <h2 className="text-base font-bold text-[#1A2E27] mb-3 flex items-center gap-2">
          <Search className="w-5 h-5 text-[#C9943A]" />
          Schema.org Preview
        </h2>
        <p className="text-xs text-[#9CB3AC] mb-3">These settings automatically generate LocalBusiness, Organization, and WebSite schemas on your homepage.</p>
        <div className="bg-[#F8FFFE] rounded-2xl border border-[#DCE8E3] p-4 text-xs font-mono text-[#4A6B5D] overflow-auto max-h-64">
          <pre>{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CafeOrCoffeeShop',
            name: 'Big Bean Café Coffee Roasters',
            url: 'https://www.bigbeancafe.in',
            telephone: settings.business_phone || '+91-XXXXXXXXXX',
            address: { '@type': 'PostalAddress', streetAddress: settings.business_address || '…' },
            sameAs: [settings.same_as_instagram, settings.same_as_facebook].filter(Boolean),
          }, null, 2)}</pre>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white text-sm transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(to right,#2FBF9B,#1a9e80)' }}>
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}
