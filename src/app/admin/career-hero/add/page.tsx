'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, X } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const lc = 'block text-sm font-semibold text-gray-700 mb-1.5'
const ic = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 bg-white'

export default function AddCareerHero() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    eyebrow: 'CAREERS AT BIG BEAN CAFÉ', title: 'Build Your Career',
    highlight_text: 'With Big Bean Café',
    subtitle: 'Join a passionate café team where coffee, people, learning and growth come together every day.',
    button_primary_text: 'View Openings', button_primary_url: '#job-openings',
    button_secondary_text: 'Apply Now', button_secondary_url: '#career-application',
    stat_1_value: '7+', stat_1_label: 'Outlets',
    stat_2_value: 'Team', stat_2_label: 'Growth',
    stat_3_value: 'Coffee', stat_3_label: 'Culture',
    status: 'active', sort_order: '0'
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) { setError('Title is required'); return }
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imageFile) fd.append('image', imageFile)
      const res = await apiRequest('/career-hero', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) router.push('/admin/career-hero')
      else setError(data.message || 'Failed to create banner')
    } catch { setError('Network error') } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/career-hero" className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5 text-gray-600" /></Link>
        <div><h1 className="text-3xl font-bold text-gray-900">Add Career Hero Banner</h1><p className="text-gray-500 text-sm mt-1">Create a new hero banner for the careers page</p></div>
      </div>
      <form onSubmit={handleSubmit}>
        {error && <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-800 text-base">Hero Content</h2>
              <div><label className={lc}>Eyebrow Text</label><input className={ic} value={form.eyebrow} onChange={e => set('eyebrow', e.target.value)} /></div>
              <div><label className={lc}>Title <span className="text-red-500">*</span></label><input className={ic} value={form.title} onChange={e => set('title', e.target.value)} required /></div>
              <div><label className={lc}>Highlight Text</label><input className={ic} value={form.highlight_text} onChange={e => set('highlight_text', e.target.value)} /></div>
              <div><label className={lc}>Subtitle</label><textarea className={ic} rows={3} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} /></div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-800 text-base">CTA Buttons</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lc}>Primary Text</label><input className={ic} value={form.button_primary_text} onChange={e => set('button_primary_text', e.target.value)} /></div>
                <div><label className={lc}>Primary URL</label><input className={ic} value={form.button_primary_url} onChange={e => set('button_primary_url', e.target.value)} /></div>
                <div><label className={lc}>Secondary Text</label><input className={ic} value={form.button_secondary_text} onChange={e => set('button_secondary_text', e.target.value)} /></div>
                <div><label className={lc}>Secondary URL</label><input className={ic} value={form.button_secondary_url} onChange={e => set('button_secondary_url', e.target.value)} /></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-800 text-base">Stats</h2>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="space-y-2">
                    <div><label className={lc}>Stat {n} Value</label><input className={ic} value={(form as any)[`stat_${n}_value`]} onChange={e => set(`stat_${n}_value`, e.target.value)} /></div>
                    <div><label className={lc}>Stat {n} Label</label><input className={ic} value={(form as any)[`stat_${n}_label`]} onChange={e => set(`stat_${n}_label`, e.target.value)} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-800 text-base">Hero Image</h2>
              <label className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#C9943A] transition-colors">
                {imagePreview ? <img src={imagePreview} alt="preview" className="max-h-48 object-cover rounded-lg w-full" /> : <><Upload className="w-8 h-8 text-gray-300" /><p className="text-sm text-gray-400">Click to upload</p></>}
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) } }} />
              </label>
              {imagePreview && <button type="button" onClick={() => { setImageFile(null); setImagePreview(null) }} className="text-xs text-red-500 hover:underline flex items-center gap-1"><X className="w-3 h-3" />Remove</button>}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-gray-800 text-base">Settings</h2>
              <div><label className={lc}>Status</label><select className={ic} value={form.status} onChange={e => set('status', e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              <div><label className={lc}>Sort Order</label><input type="number" className={ic} value={form.sort_order} onChange={e => set('sort_order', e.target.value)} /></div>
            </div>
            <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Banner'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
