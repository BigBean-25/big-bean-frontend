'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 focus:border-[#C9943A] transition-all bg-white'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-2'

export default function AddMenuHero() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    eyebrow: 'BIG BEAN CAFÉ MENU',
    title: '',
    highlight_text: '',
    subtitle: '',
    button_primary_text: 'Order Online',
    button_primary_url: 'https://bigbeancafe.store',
    button_secondary_text: 'Explore Menu',
    button_secondary_url: '#menu-products',
    status: 'active',
    sort_order: '0'
  })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
    setImagePreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setErr('Title is required'); return }
    setSaving(true); setErr('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imageFile) fd.append('image', imageFile)
      const res = await apiRequest('/menu-hero', {
        method: 'POST',
        body: fd
      })
      const data = await res.json()
      if (data.success) router.push('/admin/menu-hero')
      else setErr(data.message || 'Failed to create')
    } catch { setErr('Network error') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/menu-hero" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Menu Hero Banner</h1>
          <p className="text-gray-500 text-sm mt-1">Create a new Menu page hero banner</p>
        </div>
      </div>

      {err && <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{err}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Hero Text</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Eyebrow Text</label>
              <input className={inputClass} value={form.eyebrow} onChange={e => set('eyebrow', e.target.value)} placeholder="BIG BEAN CAFÉ MENU" />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Title <span className="text-red-500">*</span></label>
              <input className={inputClass} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Crafted Coffee, Fresh Food" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Highlight Text <span className="text-xs text-[#C9943A]">(shown in gold)</span></label>
              <input className={inputClass} value={form.highlight_text} onChange={e => set('highlight_text', e.target.value)} placeholder="Café Favourites" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Subtitle</label>
              <textarea className={inputClass} rows={3} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Explore our live menu with handcrafted beverages..." />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-5">CTA Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Primary Button Text</label>
              <input className={inputClass} value={form.button_primary_text} onChange={e => set('button_primary_text', e.target.value)} placeholder="Order Online" />
            </div>
            <div>
              <label className={labelClass}>Primary Button URL</label>
              <input className={inputClass} value={form.button_primary_url} onChange={e => set('button_primary_url', e.target.value)} placeholder="https://bigbeancafe.store" />
            </div>
            <div>
              <label className={labelClass}>Secondary Button Text</label>
              <input className={inputClass} value={form.button_secondary_text} onChange={e => set('button_secondary_text', e.target.value)} placeholder="Explore Menu" />
            </div>
            <div>
              <label className={labelClass}>Secondary Button URL</label>
              <input className={inputClass} value={form.button_secondary_url} onChange={e => set('button_secondary_url', e.target.value)} placeholder="#menu-products" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Image & Order</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Hero Image</label>
              <label className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#C9943A] transition-colors">
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-32 object-cover rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Click to upload image</span>
                    <span className="text-xs text-gray-400">JPG, PNG, WEBP — max 5MB</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
            </div>
            <div>
              <label className={labelClass}>Sort Order</label>
              <input type="number" className={inputClass} value={form.sort_order} onChange={e => set('sort_order', e.target.value)} min="0" />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Hero Banner'}
          </button>
          <Link href="/admin/menu-hero" className="px-8 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
