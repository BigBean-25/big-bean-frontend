'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function AddCorporateHero() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    eyebrow: 'CORPORATE ORDERS', title: 'Premium Coffee Solutions',
    highlight_text: 'for Modern Workplaces',
    subtitle: 'From office coffee requirements to event catering, meetings, bulk orders and custom café solutions — Big Bean Café brings quality, freshness and service to your business.',
    button_primary_text: 'Request Corporate Quote', button_primary_url: '#corporate-form',
    button_secondary_text: 'Explore Solutions', button_secondary_url: '#corporate-solutions',
    stat_1_value: 'Bulk', stat_1_label: 'Orders',
    stat_2_value: 'Events', stat_2_label: 'Catering',
    stat_3_value: 'Custom', stat_3_label: 'Solutions',
    status: 'active', sort_order: '0'
  })

  const ic = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40'
  const lc = 'block text-sm font-semibold text-gray-700 mb-1.5'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imageFile) fd.append('image', imageFile)
      const res = await apiRequest('/corporate-hero', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) router.push('/admin/corporate-hero')
      else setError(data.message || 'Failed to create banner')
    } catch { setError('Network error') } finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/corporate-hero" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Corporate Hero Banner</h1>
      </div>
      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div><label className={lc}>Eyebrow Text</label><input className={ic} value={form.eyebrow} onChange={e => setForm(p => ({ ...p, eyebrow: e.target.value }))} /></div>
        <div><label className={lc}>Title <span className="text-red-500">*</span></label><input className={ic} required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
        <div><label className={lc}>Highlight Text</label><input className={ic} value={form.highlight_text} onChange={e => setForm(p => ({ ...p, highlight_text: e.target.value }))} /></div>
        <div><label className={lc}>Subtitle</label><textarea className={ic} rows={3} value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={lc}>Primary Button Text</label><input className={ic} value={form.button_primary_text} onChange={e => setForm(p => ({ ...p, button_primary_text: e.target.value }))} /></div>
          <div><label className={lc}>Primary Button URL</label><input className={ic} value={form.button_primary_url} onChange={e => setForm(p => ({ ...p, button_primary_url: e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={lc}>Secondary Button Text</label><input className={ic} value={form.button_secondary_text} onChange={e => setForm(p => ({ ...p, button_secondary_text: e.target.value }))} /></div>
          <div><label className={lc}>Secondary Button URL</label><input className={ic} value={form.button_secondary_url} onChange={e => setForm(p => ({ ...p, button_secondary_url: e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(n => (
            <div key={n} className="space-y-2">
              <div><label className={lc}>Stat {n} Value</label><input className={ic} value={(form as any)[`stat_${n}_value`]} onChange={e => setForm(p => ({ ...p, [`stat_${n}_value`]: e.target.value }))} /></div>
              <div><label className={lc}>Stat {n} Label</label><input className={ic} value={(form as any)[`stat_${n}_label`]} onChange={e => setForm(p => ({ ...p, [`stat_${n}_label`]: e.target.value }))} /></div>
            </div>
          ))}
        </div>
        <div>
          <label className={lc}>Hero Image</label>
          <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#C9943A] transition-colors">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">{imageFile ? imageFile.name : 'Click to upload image'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={lc}>Status</label>
            <select className={ic} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
          <div><label className={lc}>Sort Order</label><input type="number" className={ic} value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))} /></div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50" style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
            {saving ? 'Saving...' : 'Create Banner'}
          </button>
          <Link href="/admin/corporate-hero" className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
