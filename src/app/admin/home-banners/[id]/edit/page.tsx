'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Save, AlertCircle } from 'lucide-react'
import apiRequest from '@/utils/api'

export default function EditHomeBanner() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    media_type: 'image',
    desktop_media: null as File | null,
    mobile_media: null as File | null,
    fallback_image: null as File | null,
    desktop_media_url: '',
    mobile_media_url: '',
    fallback_image_url: '',
    button_1_text: '',
    button_1_url: '',
    button_2_text: '',
    button_2_url: '',
    text_position: 'center',
    overlay_enabled: true,
    overlay_opacity: 0.5,
    status: 'active',
    sort_order: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchBanner()
  }, [id])

  const fetchBanner = async () => {
    try {
      const response = await apiRequest(`/home-banners/${id}`, {})
      
      if (response.ok) {
        const data = await response.json()
        setFormData({
          ...data.data,
          desktop_media: null,
          mobile_media: null,
          fallback_image: null,
          desktop_media_url: data.data.desktop_media || '',
          mobile_media_url: data.data.mobile_media || '',
          fallback_image_url: data.data.fallback_image || ''
        })
      } else {
        alert('Banner not found')
        router.push('/admin/home-banners')
      }
    } catch (error) {
      console.error('Error fetching banner:', error)
      router.push('/admin/home-banners')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }))
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }))
    }
    
    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!formData.media_type) {
      newErrors.media_type = 'Media type is required'
    }
    
    if (!formData.desktop_media && !formData.desktop_media_url) {
      newErrors.desktop_media = 'Desktop media is required'
    }
    
    if (formData.overlay_opacity < 0 || formData.overlay_opacity > 1) {
      newErrors.overlay_opacity = 'Overlay opacity must be between 0 and 1'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const formDataToSend = new FormData()
      
      // Add form fields
      formDataToSend.append('title', formData.title)
      formDataToSend.append('subtitle', formData.subtitle)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('media_type', formData.media_type)
      formDataToSend.append('button_1_text', formData.button_1_text)
      formDataToSend.append('button_1_url', formData.button_1_url)
      formDataToSend.append('button_2_text', formData.button_2_text)
      formDataToSend.append('button_2_url', formData.button_2_url)
      formDataToSend.append('text_position', formData.text_position)
      formDataToSend.append('overlay_enabled', formData.overlay_enabled.toString())
      formDataToSend.append('overlay_opacity', formData.overlay_opacity.toString())
      formDataToSend.append('status', formData.status)
      formDataToSend.append('sort_order', formData.sort_order.toString())
      
      // Add existing URLs for files that weren't updated
      if (!formData.desktop_media) {
        formDataToSend.append('desktop_media', formData.desktop_media_url)
      }
      if (!formData.mobile_media) {
        formDataToSend.append('mobile_media', formData.mobile_media_url)
      }
      if (!formData.fallback_image) {
        formDataToSend.append('fallback_image', formData.fallback_image_url)
      }
      
      // Add new files
      if (formData.desktop_media) {
        formDataToSend.append('desktop_media', formData.desktop_media)
      }
      if (formData.mobile_media) {
        formDataToSend.append('mobile_media', formData.mobile_media)
      }
      if (formData.fallback_image) {
        formDataToSend.append('fallback_image', formData.fallback_image)
      }
      
      const response = await apiRequest(`/home-banners/${id}`, {
        method: 'PUT',
        body: formDataToSend
      })
      
      if (response.ok) {
        router.push('/admin/home-banners')
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to update banner')
      }
    } catch (error) {
      console.error('Error updating banner:', error)
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coffee-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading banner...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/home-banners"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Home Banner</h1>
            <p className="text-gray-600">Update hero banner for the homepage</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Enter banner title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter subtitle (optional)"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="input-field"
              placeholder="Enter banner description"
            />
          </div>
        </div>

        {/* Media Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Media Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media Type *
              </label>
              <select
                name="media_type"
                value={formData.media_type}
                onChange={handleInputChange}
                className={`input-field ${errors.media_type ? 'border-red-500' : ''}`}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              {errors.media_type && (
                <p className="text-red-500 text-sm mt-1">{errors.media_type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Position
              </label>
              <select
                name="text_position"
                value={formData.text_position}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desktop Media Upload *
            </label>
            <input
              type="file"
              name="desktop_media"
              accept={formData.media_type === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp'}
              onChange={handleFileChange}
              className={`input-field ${errors.desktop_media ? 'border-red-500' : ''}`}
            />
            {errors.desktop_media && (
              <p className="text-red-500 text-sm mt-1">{errors.desktop_media}</p>
            )}
            {(formData.desktop_media || formData.desktop_media_url) && (
              <div className="mt-2">
                {formData.media_type === 'video' ? (
                  <video
                    src={formData.desktop_media ? URL.createObjectURL(formData.desktop_media) : `http://localhost:5000${formData.desktop_media_url}`}
                    className="w-full h-48 object-cover rounded-lg"
                    controls
                    muted
                  />
                ) : (
                  <img
                    src={formData.desktop_media ? URL.createObjectURL(formData.desktop_media) : `http://localhost:5000${formData.desktop_media_url}`}
                    alt="Desktop media preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>
            )}
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Recommended size:</strong> {formData.media_type === 'video' ? '1920 × 1080 mp4' : '1920 × 900 px or 1920 × 1080 px (16:9 ratio)'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Keep important text/objects in the safe center area for better visibility
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Media Upload (Optional)
            </label>
            <input
              type="file"
              name="mobile_media"
              accept={formData.media_type === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp'}
              onChange={handleFileChange}
              className="input-field"
            />
            {(formData.mobile_media || formData.mobile_media_url) && (
              <div className="mt-2">
                {formData.media_type === 'video' ? (
                  <video
                    src={formData.mobile_media ? URL.createObjectURL(formData.mobile_media) : `http://localhost:5000${formData.mobile_media_url}`}
                    className="w-full h-48 object-cover rounded-lg"
                    controls
                    muted
                  />
                ) : (
                  <img
                    src={formData.mobile_media ? URL.createObjectURL(formData.mobile_media) : `http://localhost:5000${formData.mobile_media_url}`}
                    alt="Mobile media preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>
            )}
            <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Recommended size:</strong> {formData.media_type === 'video' ? '1080 × 1920 mp4' : '1080 × 1920 px (9:16 ratio)'}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                For best mobile responsiveness, upload a separate mobile banner
              </p>
            </div>
            {!(formData.mobile_media || formData.mobile_media_url) && (formData.desktop_media || formData.desktop_media_url) && (
              <div className="mt-2 p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-800">
                  ⚠️ Mobile will use desktop media as fallback
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  For optimal mobile experience, upload a separate mobile banner
                </p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fallback Image Upload (Optional)
            </label>
            <input
              type="file"
              name="fallback_image"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="input-field"
            />
            {(formData.fallback_image || formData.fallback_image_url) && (
              <div className="mt-2">
                <img
                  src={formData.fallback_image ? URL.createObjectURL(formData.fallback_image) : `http://localhost:5000${formData.fallback_image_url}`}
                  alt="Fallback image preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Button Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Button Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button 1 Text
              </label>
              <input
                type="text"
                name="button_1_text"
                value={formData.button_1_text}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Order Now"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button 1 URL
              </label>
              <input
                type="text"
                name="button_1_url"
                value={formData.button_1_url}
                onChange={handleInputChange}
                className="input-field"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button 2 Text
              </label>
              <input
                type="text"
                name="button_2_text"
                value={formData.button_2_text}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Learn More"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button 2 URL
              </label>
              <input
                type="text"
                name="button_2_url"
                value={formData.button_2_url}
                onChange={handleInputChange}
                className="input-field"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Display Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleInputChange}
                className="input-field"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="overlay_enabled"
                checked={formData.overlay_enabled}
                onChange={handleInputChange}
                className="w-4 h-4 text-coffee-600 border-gray-300 rounded focus:ring-coffee-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Enable Overlay
              </span>
            </label>
          </div>

          {formData.overlay_enabled && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overlay Opacity ({formData.overlay_opacity})
              </label>
              <input
                type="range"
                name="overlay_opacity"
                min="0"
                max="1"
                step="0.1"
                value={formData.overlay_opacity}
                onChange={handleInputChange}
                className="w-full"
              />
              {errors.overlay_opacity && (
                <p className="text-red-500 text-sm mt-1">{errors.overlay_opacity}</p>
              )}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/admin/home-banners"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Updating...' : 'Update Banner'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
