'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, User } from 'lucide-react'
import apiRequest from '@/utils/api'

const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 focus:border-[#C9943A] transition-all bg-white'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-2'

export default function AddAboutFounder() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    name: '',
    role: '',
    description: '',
    phone: '',
    email: '',
    instagram_url: '',
    linkedin_url: '',
    status: 'active',
    sort_order: '0',
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
    if (!form.name.trim()) { setErr('Name is required'); return }
    if (!form.role.trim()) { setErr('Role is required'); return }
    if (!form.description.trim()) { setErr('Description is required'); return }
    if (!imageFile) { setErr('Founder image is required'); return }

    setSaving(true); setErr('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('image', imageFile)
      const res = await apiRequest('/about-founders', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) router.push('/admin/about-founders')
      else setErr(data.message || 'Failed to create founder')
    } catch { setErr('Network error') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/about-founders" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Founder</h1>
          <p className="text-gray-500 text-sm mt-1">Create a new founder profile for the About page</p>
        </div>
      </div>

      {err && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{err}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Founder Photo <span className="text-red-500">*</span></h2>
          <label className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#C9943A] transition-colors max-w-sm">
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="w-40 h-40 object-cover rounded-2xl" />
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload founder photo</span>
                <span className="text-xs text-gray-400">JPG, PNG, WEBP — max 5MB</span>
              </>
            )}
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleImage} />
          </label>
        </div>

        {/* Core Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Founder Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Name <span className="text-red-500">*</span></label>
              <input className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Rajesh Kumar" />
            </div>
            <div>
              <label className={labelClass}>Role / Designation <span className="text-red-500">*</span></label>
              <input className={inputClass} value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Founder & CEO" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Description <span className="text-red-500">*</span></label>
              <textarea className={inputClass} rows={5} value={form.description} onChange={e => set('description', e.target.value)} placeholder="A brief description about the founder..." />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Phone Number</label>
              <input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} placeholder="founder@bigbeancafe.in" />
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Social Links</h2>
          <p className="text-xs text-gray-500 mb-5">Enter full URLs. Only icons will be shown on the website — no usernames or labels.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Instagram URL</label>
              <input className={inputClass} value={form.instagram_url} onChange={e => set('instagram_url', e.target.value)} placeholder="https://instagram.com/yourprofile" />
            </div>
            <div>
              <label className={labelClass}>LinkedIn URL</label>
              <input className={inputClass} value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/yourprofile" />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
            {saving ? 'Saving...' : 'Save Founder'}
          </button>
          <Link href="/admin/about-founders" className="px-8 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
