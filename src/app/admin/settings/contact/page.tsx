'use client'

import { useState, useEffect, useCallback } from 'react'
import { Phone, Mail, Save, Check, AlertCircle, Eye, EyeOff, MessageCircle } from 'lucide-react'
import { adminApiFetch } from '@/utils/api'

type FlatValues = Record<string, string>

const ic = 'w-full px-3 py-2.5 rounded-xl border border-[#DCE8E3] bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9943A]/30 focus:border-[#C9943A] transition'
const lc = 'block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5'

const SECTIONS = [
  {
    id: 'general', label: 'General Contact', icon: Phone,
    fields: [
      { key: 'contact_phone', label: 'Contact Phone Number', type: 'tel' },
      { key: 'contact_email', label: 'Contact Email', type: 'email' },
    ],
  },
  {
    id: 'reservations', label: 'Reservations', icon: Phone,
    fields: [
      { key: 'reservations_phone', label: 'Reservations Phone Number', type: 'tel' },
      { key: 'reservations_email', label: 'Reservations Email', type: 'email' },
    ],
  },
  {
    id: 'franchise', label: 'Franchise', icon: Phone,
    fields: [
      { key: 'franchise_phone', label: 'Franchise Phone Number', type: 'tel' },
      { key: 'franchise_email', label: 'Franchise Email', type: 'email' },
    ],
  },
  {
    id: 'corporate', label: 'Corporate Orders', icon: Phone,
    fields: [
      { key: 'corporate_phone', label: 'Corporate Phone Number', type: 'tel' },
      { key: 'corporate_email', label: 'Corporate Email', type: 'email' },
    ],
  },
  {
    id: 'careers', label: 'Careers', icon: Phone,
    fields: [
      { key: 'career_phone', label: 'Career Phone Number', type: 'tel' },
      { key: 'career_email', label: 'Career Email', type: 'email' },
    ],
  },
  {
    id: 'events', label: 'Events', icon: Phone,
    fields: [
      { key: 'event_phone', label: 'Event Phone Number', type: 'tel' },
      { key: 'event_email', label: 'Event Email', type: 'email' },
    ],
  },
  {
    id: 'system', label: 'System Email', icon: Mail,
    fields: [
      { key: 'no_reply_email', label: 'No-Reply Email (System Sender)', type: 'email' },
    ],
  },
]

const ALL_KEYS = [
  'contact_phone', 'contact_email',
  'reservations_phone', 'reservations_email',
  'franchise_phone', 'franchise_email',
  'corporate_phone', 'corporate_email',
  'career_phone', 'career_email',
  'event_phone', 'event_email',
  'no_reply_email',
  'whatsapp_enabled', 'whatsapp_business_number',
  'whatsapp_api_key', 'whatsapp_access_token', 'whatsapp_phone_number_id',
]

const DEFAULTS: FlatValues = {
  contact_phone: '8073601065', contact_email: 'info@bigbeancafe.in',
  reservations_phone: '8073601065', reservations_email: 'bookings@bigbeancafe.in',
  franchise_phone: '8867671422', franchise_email: 'franchise@bigbeancafe.in',
  corporate_phone: '8073601065', corporate_email: 'bookings@bigbeancafe.in',
  career_phone: '8073601065', career_email: 'jobs@bigbeancafe.in',
  event_phone: '8073601065', event_email: 'events@bigbeancafe.in',
  no_reply_email: 'noreply@bigbeancafe.in',
  whatsapp_enabled: '0', whatsapp_business_number: '',
  whatsapp_api_key: '', whatsapp_access_token: '', whatsapp_phone_number_id: '',
}

const MASK = '********'

function SecretField({ label, fieldKey, values, onChange }: { label: string; fieldKey: string; values: FlatValues; onChange: (k: string, v: string) => void }) {
  const [show, setShow] = useState(false)
  const val = values[fieldKey] || ''
  const isMasked = val === MASK
  return (
    <div>
      <label className={lc}>{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={isMasked ? '' : val}
          placeholder={isMasked ? 'Leave blank to keep current value' : 'Enter value'}
          onChange={e => onChange(fieldKey, e.target.value)}
          className={`${ic} pr-10`}
        />
        <button type="button" onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  )
}

export default function ContactSettingsPage() {
  const [values, setValues] = useState<FlatValues>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const keys = ['contact', 'sms_whatsapp', 'general']
      const results = await Promise.all(keys.map(g =>
        adminApiFetch(`/site-settings/group/${g}`)
      ))
      const flat: FlatValues = { ...DEFAULTS }
      results.forEach((r: any) => {
        if (r?.success && r.data) {
          Object.entries(r.data).forEach(([k, row]: any) => {
            if (ALL_KEYS.includes(k)) flat[k] = row.setting_value ?? ''
          })
        }
      })
      setValues(flat)
    } catch {
      showToast('error', 'Failed to load settings')
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const change = (k: string, v: string) => setValues(prev => ({ ...prev, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      const settings: FlatValues = {}
      ALL_KEYS.forEach(k => { settings[k] = values[k] ?? '' })
      const res = await adminApiFetch<any>('/site-settings', { method: 'PUT', body: JSON.stringify({ settings }) })
      if (res?.success) showToast('success', 'Contact settings saved successfully!')
      else showToast('error', res?.message || 'Save failed')
    } catch {
      showToast('error', 'Unable to save. Please try again.')
    }
    setSaving(false)
  }

  const waEnabled = values.whatsapp_enabled === '1'

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C9943A] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#120905]">Contact Details</h1>
          <p className="text-sm text-gray-500 mt-1">Update phone numbers and email addresses used across all public pages.</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#3D1F0D] px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-[#6B3520] disabled:opacity-60 transition">
          {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={15} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Section cards */}
      {SECTIONS.map(sec => (
        <div key={sec.id} className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F5E6D3]" style={{ background: 'linear-gradient(135deg,#FFF7ED,#FEFAF5)' }}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3D1F0D]/10">
              <sec.icon size={16} className="text-[#C9943A]" />
            </div>
            <h2 className="text-sm font-black text-[#3D1F0D] uppercase tracking-wider">{sec.label}</h2>
          </div>
          <div className="grid gap-5 p-6 sm:grid-cols-2">
            {sec.fields.map(f => (
              <div key={f.key}>
                <label className={lc}>{f.label}</label>
                <input
                  type={f.type}
                  value={values[f.key] || ''}
                  onChange={e => change(f.key, e.target.value)}
                  className={ic}
                  placeholder={DEFAULTS[f.key] || ''}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* WhatsApp config */}
      <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F5E6D3]" style={{ background: 'linear-gradient(135deg,#FFF7ED,#FEFAF5)' }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3D1F0D]/10">
            <MessageCircle size={16} className="text-[#C9943A]" />
          </div>
          <h2 className="text-sm font-black text-[#3D1F0D] uppercase tracking-wider">WhatsApp Configuration</h2>
        </div>
        <div className="p-6 space-y-5">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">WhatsApp Enabled</p>
              <p className="text-xs text-gray-400 mt-0.5">Enable WhatsApp notification system</p>
            </div>
            <button type="button" onClick={() => change('whatsapp_enabled', waEnabled ? '0' : '1')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${waEnabled ? 'bg-[#C9943A]' : 'bg-gray-200'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${waEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={lc}>WhatsApp Business Number</label>
              <input type="tel" value={values.whatsapp_business_number || ''} onChange={e => change('whatsapp_business_number', e.target.value)}
                className={ic} placeholder="918073601065" />
            </div>
            <div>
              <label className={lc}>Phone Number ID</label>
              <input type="text" value={values.whatsapp_phone_number_id || ''} onChange={e => change('whatsapp_phone_number_id', e.target.value)}
                className={ic} placeholder="Meta WhatsApp Phone Number ID" />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <SecretField label="WhatsApp API Key" fieldKey="whatsapp_api_key" values={values} onChange={change} />
            <SecretField label="WhatsApp Access Token" fieldKey="whatsapp_access_token" values={values} onChange={change} />
          </div>
          <p className="text-xs text-gray-400 rounded-lg bg-gray-50 px-4 py-2.5 border border-gray-100">
            API Key and Access Token are encrypted at rest and never exposed in public APIs.
          </p>
        </div>
      </div>

      {/* Save bottom */}
      <div className="flex justify-end pb-4">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#3D1F0D] px-6 py-3 text-sm font-bold text-white shadow hover:bg-[#6B3520] disabled:opacity-60 transition">
          {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={15} />}
          {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>
    </div>
  )
}
