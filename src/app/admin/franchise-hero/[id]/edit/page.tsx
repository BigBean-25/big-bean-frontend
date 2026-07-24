'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

export default function EditFranchiseHero() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [form, setForm] = useState({
    eyebrow: '', title: '', highlight_text: '', subtitle: '',
    button_primary_text: '', button_primary_url: '',
    button_secondary_text: '', button_secondary_url: '',
    stat_1_value: '', stat_1_label: '', stat_2_value: '', stat_2_label: '',
    stat_3_value: '', stat_3_label: '', status: 'active', sort_order: '0'
  })

  const ic = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40'
  const lc = 'block text-sm font-semibold text-gray-700 mb-1.5'

  useEffect(() => {
    apiRequest(`/franchise-hero/${id}`)
      .then(r => r.json()).then(data => {
        if (data.success && data.data) {
          const b = data.data
          setCurrentImage(b.image)
          setForm({
            eyebrow: b.eyebrow || '', title: b.title || '', highlight_text: b.highlight_text || '',
            subtitle: b.subtitle || '', button_primary_text: b.button_primary_text || '',
            button_primary_url: b.button_primary_url || '', button_secondary_text: b.button_secondary_text || '',
            button_secondary_url: b.button_secondary_url || '', stat_1_value: b.stat_1_value || '',
            stat_1_label: b.stat_1_label || '', stat_2_value: b.stat_2_value || '',
            stat_2_label: b.stat_2_label || '', stat_3_value: b.stat_3_value || '',
            stat_3_label: b.stat_3_label || '', status: b.status || 'active', sort_order: String(b.sort_order ?? 0)
          })
        }
      }).catch(() => setError('Failed to load banner')).finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imageFile) fd.append('image', imageFile)
      const res = await apiRequest(`/franchise-hero/${id}`, { method: 'PUT', body: fd })
      const data = await res.json()
      if (data.success) router.push('/admin/franchise-hero')
      else setError(data.message || 'Failed to update banner')
    } catch { setError('Network error') } finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/franchise-hero" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Franchise Hero Banner</h1>
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
          {currentImage && !imageFile && (
            <div className="mb-2 rounded-xl overflow-hidden h-32 w-full">
              <img src={`${API_BASE}/${currentImage}`} alt="Current" className="w-full h-full object-cover" />
            </div>
          )}
          <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#C9943A] transition-colors">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">{imageFile ? imageFile.name : 'Click to replace image'}</span>
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
            {saving ? 'Saving...' : 'Update Banner'}
          </button>
          <Link href="/admin/franchise-hero" className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
