'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, MapPin, Phone, Mail, Clock, ImageIcon } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')

function getImageUrl(p: string | null | undefined): string | null {
  if (!p) return null
  if (p.startsWith('http')) return p
  return `${API_BASE}/${p.replace(/^\/+/, '')}`
}

interface OutletForm {
  name: string
  slug: string
  address: string
  phone: string
  email: string
  latitude: string
  longitude: string
  opening_hours: string
  image: string
  status: string
  sort_order: number
}

export default function EditOutlet() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [formData, setFormData] = useState<OutletForm>({
    name: '',
    slug: '',
    address: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
    opening_hours: '',
    image: '',
    status: 'active',
    sort_order: 0
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => { fetchOutlet() }, [id])

  const fetchOutlet = async () => {
    try {
      const res = await apiRequest(`/outlets/${id}`, {})
      if (res.ok) {
        const data = await res.json()
        const o = data.data
        setFormData({
          name:          o.name          || '',
          slug:          o.slug          || '',
          address:       o.address       || '',
          phone:         o.phone         || '',
          email:         o.email         || '',
          latitude:      o.latitude      != null ? String(o.latitude)  : '',
          longitude:     o.longitude     != null ? String(o.longitude) : '',
          opening_hours: o.opening_hours || '',
          image:         o.image         || '',
          status:        o.status        || 'active',
          sort_order:    o.sort_order    ?? 0
        })
      } else {
        alert('Failed to fetch outlet')
        router.push('/admin/outlets')
      }
    } catch {
      alert('Network error. Please try again.')
      router.push('/admin/outlets')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (parseFloat(value) || 0) : value
    }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Outlet name is required'
    if (!formData.address.trim()) newErrors.address = 'Outlet address is required'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email format'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
    if (file) setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('name',          formData.name.trim())
      fd.append('slug',          formData.slug.trim())
      fd.append('address',       formData.address.trim())
      fd.append('phone',         formData.phone || '')
      fd.append('email',         formData.email || '')
      fd.append('opening_hours', formData.opening_hours || '')
      fd.append('latitude',      formData.latitude || '')
      fd.append('longitude',     formData.longitude || '')
      fd.append('status',        formData.status || 'active')
      fd.append('sort_order',    String(formData.sort_order ?? 0))
      if (imageFile) fd.append('image', imageFile)

      const res = await apiRequest(`/outlets/${id}`, {
        method: 'PUT',
        body: fd
      })
      if (res.ok) {
        router.push('/admin/outlets')
      } else {
        const data = await res.json()
        alert(data.message || 'Failed to update outlet')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading outlet...</p>
        </div>
      </div>
    )
  }

  const currentImageUrl = getImageUrl(formData.image)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin/outlets" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Outlet</h1>
            <p className="text-gray-600">Update outlet information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange}
              className={`input-field ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Enter outlet name" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
            <input type="text" name="slug" value={formData.slug} onChange={handleInputChange}
              className="input-field" placeholder="e.g. koramangala" />
            <p className="text-xs text-gray-500 mt-1">Used for page URL: /outlets/{formData.slug || 'slug'}</p>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" name="address" value={formData.address} onChange={handleInputChange}
                className={`input-field pl-10 ${errors.address ? 'border-red-500' : ''}`}
                placeholder="Full outlet address" />
            </div>
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
        </div>

        {/* Contact Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                  className="input-field pl-10" placeholder="Enter phone number" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                  className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter email address" />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
              <input type="text" name="latitude" value={formData.latitude} onChange={handleInputChange}
                className="input-field" placeholder="e.g. 12.9716" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
              <input type="text" name="longitude" value={formData.longitude} onChange={handleInputChange}
                className="input-field" placeholder="e.g. 77.5946" />
            </div>
          </div>
        </div>

        {/* Hours & Image */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Hours & Image</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Opening Hours</label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea name="opening_hours" value={formData.opening_hours} onChange={handleInputChange}
                rows={3} className="input-field pl-10"
                placeholder="e.g. Mon–Fri: 8AM–8PM, Sat–Sun: 9AM–9PM" />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Outlet Image</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-coffee-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="New preview" className="mx-auto h-40 object-cover rounded-lg" />
              ) : currentImageUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={currentImageUrl} alt="Current" className="mx-auto h-40 object-cover rounded-lg" />
                  <span className="text-xs text-gray-400">Click to replace image</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-sm">Click to upload outlet image</span>
                  <span className="text-xs">JPG, JPEG, PNG, WEBP — max 5 MB</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden" onChange={handleImageChange} />
          </div>
        </div>

        {/* Display Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Display Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
              <input type="number" name="sort_order" value={formData.sort_order} onChange={handleInputChange}
                className="input-field" placeholder="0" min="0" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Link href="/admin/outlets" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </Link>
          <button type="submit" disabled={isSubmitting}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50">
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Updating...' : 'Update Outlet'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
