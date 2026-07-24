'use client'

import { useState, ChangeEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function AddBanner() {
  const router = useRouter()
  const [form, setForm] = useState({
    eyebrow: 'BIG BEAN CAFÉ MERCH',
    title: '',
    subtitle: '',
    button_text: 'Shop Now',
    button_url: '/merchandise',
    status: 'active',
    sort_order: '0'
  })
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImage(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      fd.append('eyebrow', form.eyebrow)
      fd.append('title', form.title)
      fd.append('subtitle', form.subtitle)
      fd.append('button_text', form.button_text)
      fd.append('button_url', form.button_url)
      fd.append('status', form.status)
      fd.append('sort_order', form.sort_order)
      if (image) fd.append('image', image)
      const res = await apiRequest('/merchandise-banners', { method: 'POST', body: fd })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      router.push('/admin/merchandise-banners')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create banner')
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/merchandise-banners" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Banner</h1>
          <p className="text-gray-600">Create a new merchandise hero banner</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 max-w-2xl">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eyebrow</label>
            <input type="text" name="eyebrow" value={form.eyebrow} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <textarea name="subtitle" rows={2} value={form.subtitle} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
            <input type="text" name="button_text" value={form.button_text} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button URL</label>
            <input type="text" name="button_url" value={form.button_url} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input type="number" name="sort_order" value={form.sort_order} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500" />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700">
              <Upload className="w-4 h-4" /> Choose Image
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
            {preview ? (
              <img src={preview} alt="Preview" className="w-24 h-16 object-cover rounded-lg border border-gray-200" />
            ) : (
              <div className="w-24 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-amber-600" />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Banner'}</button>
          <Link href="/admin/merchandise-banners" className="btn-outline">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
