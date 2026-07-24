'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

type ImageField = 'qr_image' | 'mockup_image' | 'background_image'

export default function AddAppPromo() {
  const router = useRouter()
  const qrRef = useRef<HTMLInputElement>(null)
  const mockupRef = useRef<HTMLInputElement>(null)
  const bgRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    eyebrow: 'BIG BEAN CAFÉ APP',
    title: '',
    subtitle: '',
    feature_1: 'Mobile ordering & payment',
    feature_2: 'Exclusive app-only deals',
    feature_3: 'QR code ordering in-store',
    feature_4: 'Big Coins rewards',
    google_play_url: '#',
    app_store_url: '#',
    order_url: 'https://bigbeancafe.store',
    button_text: 'Order Online Now',
    status: 'active',
    sort_order: '0'
  })

  const [images, setImages] = useState<Record<ImageField, File | null>>({
    qr_image: null, mockup_image: null, background_image: null
  })
  const [previews, setPreviews] = useState<Record<ImageField, string | null>>({
    qr_image: null, mockup_image: null, background_image: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [titleError, setTitleError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'title') setTitleError('')
  }

  const handleImageChange = (field: ImageField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImages(prev => ({ ...prev, [field]: file }))
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreviews(prev => ({ ...prev, [field]: reader.result as string }))
      reader.readAsDataURL(file)
    } else {
      setPreviews(prev => ({ ...prev, [field]: null }))
    }
  }

  const clearImage = (field: ImageField, ref: React.RefObject<HTMLInputElement>) => {
    setImages(prev => ({ ...prev, [field]: null }))
    setPreviews(prev => ({ ...prev, [field]: null }))
    if (ref.current) ref.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) { setTitleError('Title is required'); return }

    setIsSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v))
      if (images.qr_image) fd.append('qr_image', images.qr_image)
      if (images.mockup_image) fd.append('mockup_image', images.mockup_image)
      if (images.background_image) fd.append('background_image', images.background_image)

      const res = await apiRequest('/app-promos', {
        method: 'POST',
        body: fd
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/admin/app-promos')
      } else {
        alert(data.message || 'Failed to create')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const ImageUploadField = ({
    label, field, ref: fieldRef, hint
  }: { label: string; field: ImageField; ref: React.RefObject<HTMLInputElement>; hint?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      <input ref={fieldRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleImageChange(field)} className="hidden" />
      {previews[field] ? (
        <div className="relative w-full max-w-xs">
          <img src={previews[field]!} alt={label} className="w-full h-36 object-cover rounded-xl" />
          <button type="button" onClick={() => clearImage(field, fieldRef)}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => fieldRef.current?.click()}
          className="flex flex-col items-center justify-center w-full max-w-xs h-28 border-2 border-dashed border-gray-300 rounded-xl hover:border-coffee-400 transition-colors text-gray-400 hover:text-coffee-600">
          <Upload className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Click to upload</span>
          <span className="text-xs mt-0.5">JPG, PNG, WEBP — max 5MB</span>
        </button>
      )}
    </div>
  )

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/admin/app-promos" className="text-gray-600 hover:text-gray-900"><ArrowLeft className="w-6 h-6" /></Link>
        <div>
          <h1 className="text-3xl font-bold text-coffee-950">Add App Promo</h1>
          <p className="text-coffee-700">Create a new app promo section</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-8">
        {/* Basic Info */}
        <div className="w-full rounded-3xl bg-white p-8 shadow-xl border border-coffee-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Eyebrow Label</label>
              <input type="text" name="eyebrow" value={formData.eyebrow} onChange={handleChange}
                className="input-field" placeholder="BIG BEAN CAFÉ APP" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                className={`input-field ${titleError ? 'border-red-500' : ''}`}
                placeholder="Order on the Go with Big Bean Café App" />
              {titleError && <p className="text-red-500 text-sm mt-1">{titleError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <textarea name="subtitle" value={formData.subtitle} onChange={handleChange}
                rows={3} className="input-field" placeholder="Short description under the title" />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="w-full rounded-3xl bg-white p-8 shadow-xl border border-coffee-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Feature Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(['feature_1', 'feature_2', 'feature_3', 'feature_4'] as const).map((f, i) => (
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feature {i + 1}</label>
                <input type="text" name={f} value={formData[f]} onChange={handleChange}
                  className="input-field" placeholder={`Feature ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="w-full rounded-3xl bg-white p-8 shadow-xl border border-coffee-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Links & Button</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Play URL</label>
              <input type="text" name="google_play_url" value={formData.google_play_url} onChange={handleChange}
                className="input-field" placeholder="https://play.google.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">App Store URL</label>
              <input type="text" name="app_store_url" value={formData.app_store_url} onChange={handleChange}
                className="input-field" placeholder="https://apps.apple.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Online URL</label>
              <input type="text" name="order_url" value={formData.order_url} onChange={handleChange}
                className="input-field" placeholder="https://bigbeancafe.store" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
              <input type="text" name="button_text" value={formData.button_text} onChange={handleChange}
                className="input-field" placeholder="Order Online Now" />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="w-full rounded-3xl bg-white p-8 shadow-xl border border-coffee-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ImageUploadField label="QR Image" field="qr_image" ref={qrRef}
              hint="QR code image for scan-to-order" />
            <ImageUploadField label="Mockup Image" field="mockup_image" ref={mockupRef}
              hint="Phone/app mockup shown on right side" />
            <ImageUploadField label="Background Image" field="background_image" ref={bgRef}
              hint="Optional section background" />
          </div>
        </div>

        {/* Display Settings */}
        <div className="w-full rounded-3xl bg-white p-8 shadow-xl border border-coffee-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Display Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input type="number" name="sort_order" value={formData.sort_order} onChange={handleChange}
                className="input-field" placeholder="0" min="0" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Link href="/admin/app-promos" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={isSubmitting}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50">
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Creating...' : 'Create Promo'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
