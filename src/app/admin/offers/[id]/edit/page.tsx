'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

const getImageUrl = (image?: string | null): string | null => {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${API_BASE}/${image.replace(/^\/+/, '')}`
}

export default function EditOffer() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const fileRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_text: '',
    badge_text: '',
    label_text: '',
    offer_code: '',
    start_date: '',
    end_date: '',
    button_text: 'ORDER NOW',
    button_url: 'https://bigbeancafe.store',
    status: 'active',
    sort_order: '0',
    image: '' as string | null
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [titleError, setTitleError] = useState('')

  useEffect(() => {
    apiRequest(`/offers/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          const o = d.data
          setFormData({
            title: o.title || '',
            description: o.description || '',
            discount_text: o.discount_text || '',
            badge_text: o.badge_text || '',
            label_text: o.label_text || '',
            offer_code: o.offer_code || '',
            start_date: o.start_date ? o.start_date.split('T')[0] : '',
            end_date: o.end_date ? o.end_date.split('T')[0] : '',
            button_text: o.button_text || 'ORDER NOW',
            button_url: o.button_url || 'https://bigbeancafe.store',
            status: o.status || 'active',
            sort_order: String(o.sort_order ?? 0),
            image: o.image || null
          })
        } else {
          alert('Offer not found')
          router.push('/admin/offers')
        }
      })
      .catch(() => { alert('Failed to load offer'); router.push('/admin/offers') })
      .finally(() => setIsLoading(false))
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'title') setTitleError('')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedImage(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) { setTitleError('Offer title is required'); return }

    setIsSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('title', formData.title.trim())
      fd.append('description', formData.description)
      fd.append('discount_text', formData.discount_text)
      fd.append('badge_text', formData.badge_text)
      fd.append('label_text', formData.label_text)
      fd.append('offer_code', formData.offer_code)
      fd.append('start_date', formData.start_date)
      fd.append('end_date', formData.end_date)
      fd.append('button_text', formData.button_text || 'Order Now')
      fd.append('button_url', formData.button_url || 'https://bigbeancafe.store')
      fd.append('status', formData.status)
      fd.append('sort_order', formData.sort_order || '0')
      if (selectedImage) fd.append('image', selectedImage)

      const res = await apiRequest(`/offers/${id}`, {
        method: 'PUT',
        body: fd
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/admin/offers')
      } else {
        alert(data.message || 'Failed to update offer')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading offer...</p>
        </div>
      </div>
    )
  }

  const existingImgUrl = getImageUrl(formData.image)

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/admin/offers" className="text-gray-600 hover:text-gray-900"><ArrowLeft className="w-6 h-6" /></Link>
        <div>
          <h1 className="text-3xl font-bold text-coffee-950">Edit Offer</h1>
          <p className="text-coffee-700">Update offer information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-8">
        {/* Basic Info */}
        <div className="w-full rounded-3xl bg-white p-8 shadow-xl border border-coffee-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                className={`input-field ${titleError ? 'border-red-500' : ''}`} placeholder="e.g. Morning Brew Special" />
              {titleError && <p className="text-red-500 text-sm mt-1">{titleError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                rows={3} className="input-field" placeholder="Short offer description" />
            </div>
          </div>
        </div>

        {/* Offer Details */}
        <div className="w-full rounded-3xl bg-white p-8 shadow-xl border border-coffee-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Offer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Text</label>
              <input type="text" name="discount_text" value={formData.discount_text} onChange={handleChange}
                className="input-field" placeholder="e.g. BUY 1 GET 1, 20% OFF" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
              <input type="text" name="badge_text" value={formData.badge_text} onChange={handleChange}
                className="input-field" placeholder="BEST DEAL" />
              <p className="text-xs text-gray-400 mt-1">Circular badge on banner. e.g. BEST DEAL, NEW OFFER, SAVE 20%</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Label Text</label>
              <input type="text" name="label_text" value={formData.label_text} onChange={handleChange}
                className="input-field" placeholder="LIMITED TIME OFFER" />
              <p className="text-xs text-gray-400 mt-1">Top label on banner. e.g. LIMITED TIME OFFER, WEDNESDAY OFFER</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offer Code</label>
              <input type="text" name="offer_code" value={formData.offer_code} onChange={handleChange}
                className="input-field" placeholder="e.g. BREW20" style={{ textTransform: 'uppercase' }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
              <input type="text" name="button_text" value={formData.button_text} onChange={handleChange}
                className="input-field" placeholder="Order Now" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button URL</label>
              <input type="url" name="button_url" value={formData.button_url} onChange={handleChange}
                className="input-field" placeholder="https://bigbeancafe.store" />
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="w-full rounded-3xl bg-white p-8 shadow-xl border border-coffee-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Offer Image</h2>
          <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange} className="hidden" />

          {/* New preview takes priority, then existing */}
          {(imagePreview || existingImgUrl) && (
            <div className="relative w-full max-w-sm mb-4">
              <img src={imagePreview || existingImgUrl!} alt="Offer"
                className="w-full h-48 object-cover rounded-xl" />
              {imagePreview && (
                <button type="button"
                  onClick={() => { setSelectedImage(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = '' }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-coffee-400 hover:text-coffee-600 transition-colors">
            <Upload className="w-4 h-4" />
            {existingImgUrl && !imagePreview ? 'Replace image' : 'Upload image'}
          </button>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — max 5MB</p>
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
          <Link href="/admin/offers" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={isSubmitting}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50">
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Updating...' : 'Update Offer'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
