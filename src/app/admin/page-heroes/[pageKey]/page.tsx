'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import apiRequest from '@/utils/api'
import { getImageUrl } from '@/lib/imageUrl'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 focus:border-[#C9943A] transition-all bg-white'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-2'

interface PageHero {
  page_key: string
  page_name: string
  label: string | null
  title: string
  subtitle: string | null
  hero_image: string | null
  mobile_hero_image: string | null
  primary_button_text: string | null
  primary_button_url: string | null
  secondary_button_text: string | null
  secondary_button_url: string | null
  overlay_opacity: number | string
  status: string
}

export default function EditPageHero() {
  const router = useRouter()
  const { pageKey } = useParams<{ pageKey: string }>()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Partial<PageHero>>({
    label: '',
    title: '',
    subtitle: '',
    primary_button_text: '',
    primary_button_url: '',
    secondary_button_text: '',
    secondary_button_url: '',
    overlay_opacity: 0.45,
    status: 'active',
  })
  const [heroPreview, setHeroPreview] = useState<string | null>(null)
  const [mobilePreview, setMobilePreview] = useState<string | null>(null)
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [mobileFile, setMobileFile] = useState<File | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiRequest(`/admin/page-heroes/${pageKey}`, {})
        const data = await res.json()
        if (data.success && data.data) {
          const d = data.data
          setForm({
            label: d.label || '',
            title: d.title || '',
            subtitle: d.subtitle || '',
            primary_button_text: d.primary_button_text || '',
            primary_button_url: d.primary_button_url || '',
            secondary_button_text: d.secondary_button_text || '',
            secondary_button_url: d.secondary_button_url || '',
            overlay_opacity: d.overlay_opacity ?? 0.45,
            status: d.status || 'active',
          })
          setHeroPreview(d.hero_image ? getImageUrl(d.hero_image) : null)
          setMobilePreview(d.mobile_hero_image ? getImageUrl(d.mobile_hero_image) : null)
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [pageKey])

  const set = (k: keyof PageHero, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleFile = (field: 'hero' | 'mobile', file?: File | null) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    if (field === 'hero') {
      setHeroFile(file)
      setHeroPreview(url)
    } else {
      setMobileFile(file)
      setMobilePreview(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title?.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, String(v))
      })
      if (heroFile) fd.append('hero_image', heroFile)
      if (mobileFile) fd.append('mobile_hero_image', mobileFile)
      const res = await apiRequest(`/admin/page-heroes/${pageKey}`, { method: 'PUT', body: fd })
      const data = await res.json()
      if (data.success && data.data) {
        const d = data.data
        setForm({
          label: d.label || '',
          title: d.title || '',
          subtitle: d.subtitle || '',
          primary_button_text: d.primary_button_text || '',
          primary_button_url: d.primary_button_url || '',
          secondary_button_text: d.secondary_button_text || '',
          secondary_button_url: d.secondary_button_url || '',
          overlay_opacity: d.overlay_opacity ?? 0.45,
          status: d.status || 'active',
        })
        setHeroFile(null)
        setMobileFile(null)
        setHeroPreview(d.hero_image ? getImageUrl(d.hero_image) : null)
        setMobilePreview(d.mobile_hero_image ? getImageUrl(d.mobile_hero_image) : null)
        toast.success('Saved successfully')
        setTimeout(() => router.push('/admin/page-heroes'), 800)
      } else {
        toast.error(data.message || 'Failed to save')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/page-heroes" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Page Hero</h1>
          <p className="text-gray-500 text-sm mt-1">{pageKey}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Hero Text</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Page Name</label>
              <input className={`${inputClass} bg-gray-50`} value={pageKey} disabled />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Label</label>
              <input className={inputClass} value={form.label || ''} onChange={e => set('label', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Overlay Opacity</label>
              <input type="number" step="0.01" min="0" max="1" className={inputClass} value={form.overlay_opacity} onChange={e => set('overlay_opacity', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Title <span className="text-red-500">*</span></label>
              <input className={inputClass} value={form.title || ''} onChange={e => set('title', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Subtitle</label>
              <textarea className={inputClass} rows={3} value={form.subtitle || ''} onChange={e => set('subtitle', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-5">CTA Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Primary Button Text</label>
              <input className={inputClass} value={form.primary_button_text || ''} onChange={e => set('primary_button_text', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Primary Button URL</label>
              <input className={inputClass} value={form.primary_button_url || ''} onChange={e => set('primary_button_url', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Secondary Button Text</label>
              <input className={inputClass} value={form.secondary_button_text || ''} onChange={e => set('secondary_button_text', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Secondary Button URL</label>
              <input className={inputClass} value={form.secondary_button_url || ''} onChange={e => set('secondary_button_url', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Hero Image</label>
              <label className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#C9943A] transition-colors">
                {heroPreview ? (
                  <img src={heroPreview} alt="preview" className="w-full h-40 object-cover rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Click to upload hero image</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={e => handleFile('hero', e.target.files?.[0])} />
              </label>
            </div>
            <div>
              <label className={labelClass}>Mobile Hero Image</label>
              <label className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#C9943A] transition-colors">
                {mobilePreview ? (
                  <img src={mobilePreview} alt="preview" className="w-full h-40 object-cover rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Click to upload mobile image</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={e => handleFile('mobile', e.target.files?.[0])} />
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Hero'}
          </button>
          <Link href="/admin/page-heroes" className="px-8 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
