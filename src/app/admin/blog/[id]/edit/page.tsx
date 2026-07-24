'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, X } from 'lucide-react'
import apiRequest from '@/utils/api'
import { validateSlug } from '@/utils/slugify'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

const lc = 'block text-sm font-semibold text-gray-700 mb-1.5'
const ic = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 bg-white'

const CATEGORIES = [
  { value: 'coffee-culture', label: 'Coffee Culture' },
  { value: 'brewing-tips', label: 'Brewing Tips' },
  { value: 'company-news', label: 'Company News' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'events', label: 'Events' },
  { value: 'food', label: 'Food' },
  { value: 'offers', label: 'Offers' },
]

export default function EditBlogPost() {
  const router = useRouter()
  const { id } = useParams()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '',
    author: '', category: 'coffee-culture',
    read_time: '5 min read', is_featured: false,
    status: 'draft', published_at: '',
    meta_title: '', meta_description: '', tags: '', sort_order: '0'
  })

  useEffect(() => {
    apiRequest(`/blog-posts/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          const d = data.data
          setForm({
            title: d.title || '', slug: d.slug || '', excerpt: d.excerpt || '', content: d.content || '',
            author: d.author || '', category: d.category || 'coffee-culture',
            read_time: d.read_time || '5 min read', is_featured: !!d.is_featured,
            status: d.status || 'draft',
            published_at: d.published_at ? d.published_at.split('T')[0] : '',
            meta_title: d.meta_title || '', meta_description: d.meta_description || '',
            tags: d.tags || '', sort_order: String(d.sort_order ?? 0)
          })
          if (d.featured_image) {
            const url = d.featured_image.startsWith('http') ? d.featured_image : `${API_BASE_URL}/${d.featured_image.replace(/^\/+/, '')}`
            setImagePreview(url)
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) { setError('Title is required'); return }
    const slugErr = validateSlug(form.slug)
    if (slugErr) { setError(slugErr); return }
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
      if (imageFile) fd.append('featured_image', imageFile)
      const res = await apiRequest(`/blog-posts/${id}`, {
        method: 'PUT',
        body: fd
      })
      const data = await res.json()
      if (data.success) router.push('/admin/blog')
      else setError(data.message || 'Failed to update post')
    } catch { setError('Network error') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/blog" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
          <p className="text-gray-500 text-sm mt-1">Update post content and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-800 text-base">Post Content</h2>
              <div><label className={lc}>Title <span className="text-red-500">*</span></label>
                <input className={ic} value={form.title} onChange={e => set('title', e.target.value)} required /></div>
              <div>
                <label className={lc}>Slug <span className="text-red-500">*</span></label>
                <input className={ic} value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '').replace(/^-+|-+$/g, ''))} required />
                <p className="mt-1 text-xs text-gray-400">Website URL: /blog/<span className="font-medium text-gray-600">{form.slug || 'slug'}</span></p>
              </div>
              <div><label className={lc}>Excerpt</label>
                <textarea className={ic} rows={3} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} /></div>
              <div><label className={lc}>Content</label>
                <textarea className={`${ic} font-mono text-xs leading-relaxed`} rows={18} value={form.content} onChange={e => set('content', e.target.value)} /></div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-800 text-base">SEO & Meta</h2>
              <div><label className={lc}>Meta Title</label><input className={ic} value={form.meta_title} onChange={e => set('meta_title', e.target.value)} /></div>
              <div><label className={lc}>Meta Description</label><textarea className={ic} rows={2} value={form.meta_description} onChange={e => set('meta_description', e.target.value)} /></div>
              <div><label className={lc}>Tags <span className="text-gray-400 font-normal text-xs">(comma-separated)</span></label>
                <input className={ic} value={form.tags} onChange={e => set('tags', e.target.value)} /></div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-800 text-base">Featured Image</h2>
              <label className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#C9943A] transition-colors">
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="max-h-48 object-cover rounded-lg w-full" />
                ) : (
                  <><Upload className="w-8 h-8 text-gray-300" /><p className="text-sm text-gray-400">Click to replace image</p></>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
              {imagePreview && imageFile && (
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null) }}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1"><X className="w-3 h-3" />Remove new image</button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-gray-800 text-base">Post Settings</h2>
              <div>
                <label className={lc}>Category</label>
                <select className={ic} value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div><label className={lc}>Author</label><input className={ic} value={form.author} onChange={e => set('author', e.target.value)} /></div>
              <div><label className={lc}>Read Time</label><input className={ic} value={form.read_time} onChange={e => set('read_time', e.target.value)} /></div>
              <div>
                <label className={lc}>Status</label>
                <select className={ic} value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div><label className={lc}>Published Date</label><input type="date" className={ic} value={form.published_at} onChange={e => set('published_at', e.target.value)} /></div>
              <div><label className={lc}>Sort Order</label><input type="number" className={ic} value={form.sort_order} onChange={e => set('sort_order', e.target.value)} /></div>
              <div className="flex items-center gap-3 pt-1">
                <input type="checkbox" id="is_featured" checked={form.is_featured}
                  onChange={e => set('is_featured', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#C9943A] focus:ring-[#C9943A]" />
                <label htmlFor="is_featured" className="text-sm font-semibold text-gray-700 cursor-pointer">Mark as Featured</label>
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
