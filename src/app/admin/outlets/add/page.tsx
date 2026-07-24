'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Phone, Mail, Clock, ImageIcon } from 'lucide-react'
import apiRequest from '@/utils/api'
import { outletSlugify, validateSlug } from '@/utils/slugify'

interface OutletForm {
  name: string
  slug: string
  address: string
  phone: string
  email: string
  opening_hours: string
  latitude: string
  longitude: string
  status: 'active' | 'inactive'
  sort_order: string
}

export default function AddOutlet() {
  const router = useRouter()
  const [formData, setFormData] = useState<OutletForm>({
    name: '',
    slug: '',
    address: '',
    phone: '',
    email: '',
    opening_hours: '',
    latitude: '',
    longitude: '',
    status: 'active',
    sort_order: '0'
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && !prev.slug ? { slug: outletSlugify(value) } : {}),
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
    setSelectedImage(file)
    setImagePreview(file ? URL.createObjectURL(file) : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    const slugErr = validateSlug(formData.slug)
    if (slugErr) { setErrors(prev => ({ ...prev, slug: slugErr })); return }
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
      fd.append('sort_order',    formData.sort_order || '0')
      if (selectedImage) fd.append('image', selectedImage)


      const response = await apiRequest('/outlets', {
        method: 'POST',
        body: fd
      })
      if (response.ok) {
        router.push('/admin/outlets')
      } else {
        const data = await response.json()
        console.error('Create outlet error response:', data)
        alert(data.message || 'Failed to create outlet')
      }
    } catch (err) {
      console.error('Create outlet network error:', err)
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin/outlets" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Outlet</h1>
            <p className="text-gray-600">Create a new outlet location</p>
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
              className={`input-field ${errors.slug ? 'border-red-500' : ''}`} placeholder="e.g. koramangala" />
            {errors.slug
              ? <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
              : <p className="text-xs text-gray-500 mt-1">Used for page URL: /outlets/{formData.slug || 'slug'}. Auto-generated from name.</p>
            }
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange}
              className={`input-field ${errors.address ? 'border-red-500' : ''}`}
              placeholder="Full outlet address" />
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
                <img src={imagePreview} alt="Preview" className="mx-auto h-40 object-cover rounded-lg" />
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
            <span>{isSubmitting ? 'Creating...' : 'Create Outlet'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
