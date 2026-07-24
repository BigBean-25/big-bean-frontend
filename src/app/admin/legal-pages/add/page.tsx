'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const ic = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/30'
const lc = 'block text-sm font-semibold text-gray-700 mb-1.5'

export default function AddLegalPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    page_type: 'privacy_policy', eyebrow: '', title: '', highlight_text: '',
    subtitle: '', content: '', effective_date: '', status: 'active', sort_order: '0'
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) { setError('Title is required'); return }
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imageFile) fd.append('hero_image', imageFile)
      const res = await apiRequest('/legal-pages', {
        method: 'POST',
        body: fd
      })
      const data = await res.json()
      if (data.success) router.push('/admin/legal-pages')
      else setError(data.message || 'Failed to create')
    } catch { setError('Network error') } finally { setSaving(false) }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Legal Page</h1>
        <p className="text-gray-500 text-sm mt-1">Create a new Privacy Policy or Terms & Conditions page</p>
      </div>
      {error && <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={lc}>Page Type <span className="text-red-500">*</span></label>
              <select name="page_type" value={form.page_type} onChange={handleChange} className={ic}>
                <option value="privacy_policy">Privacy Policy</option>
                <option value="terms_conditions">Terms & Conditions</option>
              </select>
            </div>
            <div>
              <label className={lc}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={ic}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className={lc}>Eyebrow Text</label>
            <input name="eyebrow" value={form.eyebrow} onChange={handleChange} className={ic} placeholder="e.g. PRIVACY POLICY" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={lc}>Title <span className="text-red-500">*</span></label>
              <input name="title" value={form.title} onChange={handleChange} className={ic} placeholder="e.g. Your Privacy" required />
            </div>
            <div>
              <label className={lc}>Highlight Text</label>
              <input name="highlight_text" value={form.highlight_text} onChange={handleChange} className={ic} placeholder="e.g. Matters to Us" />
            </div>
          </div>
          <div>
            <label className={lc}>Subtitle</label>
            <textarea name="subtitle" value={form.subtitle} onChange={handleChange} rows={2} className={ic} placeholder="Short introductory subtitle..." />
          </div>
          <div>
            <label className={lc}>Hero Image</label>
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={e => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#FBF4EC] file:text-[#8B4A2F] hover:file:bg-[#F5E6D3]" />
          </div>
          <div>
            <label className={lc}>Full Content</label>
            <textarea name="content" value={form.content} onChange={handleChange} rows={18}
              className={`${ic} font-mono text-xs leading-6`}
              placeholder="Paste or type the full policy content here. Use blank lines to separate sections." />
            <p className="text-xs text-gray-400 mt-1">Use blank lines between sections. Line breaks are preserved on the website.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={lc}>Effective Date</label>
              <input type="date" name="effective_date" value={form.effective_date} onChange={handleChange} className={ic} />
            </div>
            <div>
              <label className={lc}>Sort Order</label>
              <input type="number" name="sort_order" value={form.sort_order} onChange={handleChange} className={ic} min="0" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="px-7 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
              {saving ? 'Saving...' : 'Create Legal Page'}
            </button>
            <button type="button" onClick={() => router.push('/admin/legal-pages')}
              className="px-7 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
