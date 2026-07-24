'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, X } from 'lucide-react'
import apiRequest from '@/utils/api'
import { slugify, validateSlug } from '@/utils/slugify'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function AddMerchandise() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', mrp: '', sku: '',
    stock: '0', rating: '4.8', badge_text: '', category_id: '',
    status: 'active', sort_order: '0'
  })
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])

  const set = (k: string, v: string) =>
    setForm(p => ({
      ...p,
      [k]: v,
      ...(k === 'name' && !p.slug ? { slug: slugify(v) } : {}),
    }))

  useEffect(() => {
    apiRequest('/merchandise-categories/active')
      .then(r => r.json())
      .then(d => setCategories(d.data || []))
      .catch(() => {})
  }, [])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImagePreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price) { setError('Name and price are required'); return }
    if (form.stock === '' || Number(form.stock) < 0) { setError('Stock quantity must be 0 or greater'); return }
    const slugErr = validateSlug(form.slug)
    if (slugErr) { setError(slugErr); return }
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (fileRef.current?.files?.[0]) fd.append('image', fileRef.current.files[0])
      const res = await apiRequest('/merchandise', { method: 'POST', body: fd })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      router.push('/admin/merchandise')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/merchandise" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Merchandise</h1>
          <p className="text-gray-500 text-sm">Create a new product</p>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — main fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 space-y-4">
              <h2 className="font-semibold text-gray-800 text-base">Product Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input type="text" value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '').replace(/^-+|-+$/g, ''))} required
                  placeholder="e.g. vienna-roast"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500" />
                <p className="mt-1 text-xs text-gray-400">Website URL: /merchandise/<span className="font-medium text-gray-600">{form.slug || 'slug'}</span>. Auto-generated from name.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', e.target.value)} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹)</label>
                  <input type="number" step="0.01" min="0" value={form.mrp} onChange={e => set('mrp', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input type="text" value={form.sku} onChange={e => set('sku', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                  <input type="number" min="0" required value={form.stock} onChange={e => set('stock', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500" />
                  <p className="mt-1 text-xs text-gray-400">Stock 0 = product shows <span className="text-red-500 font-medium">Out of Stock</span>.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category_id} onChange={e => set('category_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
                  <input type="text" value={form.badge_text} onChange={e => set('badge_text', e.target.value)}
                    placeholder="e.g. Best Seller, New"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => set('rating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input type="number" min="0" value={form.sort_order} onChange={e => set('sort_order', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Right — image + status */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="font-semibold text-gray-800 text-base mb-4">Product Image</h2>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-coffee-400 transition-colors"
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <button type="button" onClick={e => { e.stopPropagation(); setImagePreview(null); if (fileRef.current) fileRef.current.value = '' }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="py-8">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload image</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Max 5MB</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleFile} />
            </div>

            <div className="card p-6">
              <h2 className="font-semibold text-gray-800 text-base mb-4">Status</h2>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="btn-primary flex-1 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Product'}
              </button>
              <Link href="/admin/merchandise" className="btn-outline flex-1 text-center">Cancel</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
