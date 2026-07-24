'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, Instagram } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const ic = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 focus:border-[#C9943A] transition-all bg-white'
const lc = 'block text-sm font-semibold text-gray-700 mb-2'

export default function AddGalleryItem() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    title: '',
    category: 'general',
    media_type: 'image',
    instagram_url: '',
    description: '',
    tags: '',
    status: 'active',
    is_featured: false,
    sort_order: '0'
  })

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
    setImagePreview(URL.createObjectURL(f))
  }

  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setVideoFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setErr('Title is required'); return }
    if (form.media_type === 'instagram' && !form.instagram_url.trim()) { setErr('Instagram URL is required'); return }
    if (form.media_type === 'image' && !imageFile) { setErr('Image is required for image type'); return }
    if (form.media_type === 'video' && !videoFile) { setErr('Video is required for video type'); return }

    setSaving(true); setErr('')
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('category', form.category)
      fd.append('media_type', form.media_type)
      fd.append('instagram_url', form.instagram_url)
      fd.append('description', form.description)
      fd.append('tags', form.tags)
      fd.append('status', form.status)
      fd.append('is_featured', form.is_featured ? '1' : '0')
      fd.append('sort_order', form.sort_order)
      if (imageFile) fd.append('image', imageFile)
      if (videoFile) fd.append('video', videoFile)

      const res = await apiRequest('/gallery-items', {
        method: 'POST',
        body: fd
      })
      const data = await res.json()
      if (data.success) router.push('/admin/gallery')
      else setErr(data.message || 'Failed to create')
    } catch { setErr('Network error') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/gallery" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Gallery Item</h1>
          <p className="text-gray-500 text-sm mt-1">Add a new photo, video or Instagram reel</p>
        </div>
      </div>

      {err && <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{err}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={lc}>Title <span className="text-red-500">*</span></label>
              <input className={ic} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Indiranagar Outlet Evening" />
            </div>
            <div>
              <label className={lc}>Category</label>
              <select className={ic} value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="general">General</option>
                <option value="outlets">Outlets</option>
                <option value="events">Events</option>
                <option value="coffee">Coffee</option>
                <option value="food">Food</option>
                <option value="customers">Customers</option>
                <option value="team">Team</option>
                <option value="reels">Reels</option>
              </select>
            </div>
            <div>
              <label className={lc}>Media Type</label>
              <select className={ic} value={form.media_type} onChange={e => set('media_type', e.target.value)}>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="instagram">Instagram Reel/Post</option>
              </select>
            </div>
            <div>
              <label className={lc}>Status</label>
              <select className={ic} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className={lc}>Sort Order</label>
              <input type="number" className={ic} value={form.sort_order} onChange={e => set('sort_order', e.target.value)} min="0" />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)}
                  className="w-4 h-4 accent-[#C9943A]" />
                <span className="text-sm font-semibold text-gray-700">Feature this item (shown first)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Media</h2>

          {form.media_type === 'instagram' && (
            <div className="mb-5">
              <label className={lc}>Instagram Reel / Post URL <span className="text-red-500">*</span></label>
              <div className="relative">
                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                <input className={`${ic} pl-10`} value={form.instagram_url}
                  onChange={e => set('instagram_url', e.target.value)}
                  placeholder="https://www.instagram.com/p/..." />
              </div>
              <p className="text-xs text-gray-400 mt-1">Paste the full Instagram post or reel URL</p>
              <p className="text-xs text-amber-600 mt-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Add Instagram Reel/Post URL manually now. Automatic Instagram Graph API sync will be enabled later after Meta access token setup.
              </p>
            </div>
          )}

          {form.media_type === 'image' && (
            <div>
              <label className={lc}>Image <span className="text-red-500">*</span></label>
              <label className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#C9943A] transition-colors">
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="max-h-48 object-cover rounded-lg" />
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
          )}

          {form.media_type === 'video' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={lc}>Video File <span className="text-red-500">*</span></label>
                <label className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#C9943A] transition-colors">
                  {videoFile ? (
                    <p className="text-sm text-green-600 font-medium">✓ {videoFile.name}</p>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">Click to upload video</span>
                      <span className="text-xs text-gray-400">MP4, WEBM, MOV — max 50MB</span>
                    </>
                  )}
                  <input type="file" accept="video/*" className="hidden" onChange={handleVideo} />
                </label>
              </div>
              <div>
                <label className={lc}>Thumbnail Image (optional)</label>
                <label className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#C9943A] transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-28 object-cover rounded-lg" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-sm text-gray-500">Upload thumbnail</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Details</h2>
          <div className="space-y-5">
            <div>
              <label className={lc}>Description</label>
              <textarea className={ic} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe this gallery item..." />
            </div>
            <div>
              <label className={lc}>Tags <span className="text-xs text-gray-400">(comma separated)</span></label>
              <input className={ic} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. interior, events, latte" />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Add Gallery Item'}
          </button>
          <Link href="/admin/gallery" className="px-8 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
