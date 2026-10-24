'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, MapPin, Phone, Mail, Clock, ImageIcon, Trash2, Plus } from 'lucide-react'
import apiRequest from '@/utils/api'
import { OUTLET_FACILITIES, outletGalleryCategory } from '@/lib/outlets'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')

interface AdminGalleryItem {
  id: number
  title: string
  category: string
  media_type: string
  image: string | null
  description: string | null
  tags: string | null
  status: string
  is_featured: number
  sort_order: number
}

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
  store_branch_id: string
  seo_title: string
  seo_description: string
  seo_h1: string
  og_title: string
  og_description: string
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
    sort_order: 0,
    store_branch_id: '',
    seo_title: '',
    seo_description: '',
    seo_h1: '',
    og_title: '',
    og_description: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Facilities & event space (outlet_content)
  const [facilityKeys, setFacilityKeys] = useState<string[]>([])
  const [eventSpaceText, setEventSpaceText] = useState('')
  const [contentSaving, setContentSaving] = useState(false)
  const [contentMsg, setContentMsg] = useState('')

  // Step Inside gallery (gallery_items with category 'outlet-{slug}')
  const [galleryItems, setGalleryItems] = useState<AdminGalleryItem[]>([])
  const [galleryBusy, setGalleryBusy] = useState<number | 'new' | null>(null)
  const [newPhoto, setNewPhoto] = useState<{ title: string; sort_order: string; file: File | null }>({
    title: '', sort_order: '0', file: null
  })

  useEffect(() => { fetchOutlet() }, [id])

  const fetchOutlet = async () => {
    try {
      const res = await apiRequest(`/outlets/${id}`, {})
      if (res.ok) {
        const data = await res.json()
        const o = data.data
        setFormData({
          name:             o.name             || '',
          slug:             o.slug             || '',
          address:          o.address          || '',
          phone:            o.phone            || '',
          email:            o.email            || '',
          latitude:         o.latitude         != null ? String(o.latitude)  : '',
          longitude:        o.longitude        != null ? String(o.longitude) : '',
          opening_hours:    o.opening_hours    || '',
          image:            o.image            || '',
          status:           o.status           || 'active',
          sort_order:       o.sort_order       ?? 0,
          store_branch_id:  o.store_branch_id  != null ? String(o.store_branch_id) : '',
          seo_title:        o.seo_title        || '',
          seo_description:  o.seo_description  || '',
          seo_h1:           o.seo_h1           || '',
          og_title:         o.og_title         || '',
          og_description:   o.og_description   || ''
        })
        fetchContent()
        if (o.slug) fetchGallery(o.slug)
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

  const fetchContent = async () => {
    try {
      const res = await apiRequest(`/outlets/${id}/content`, {})
      const json = await res.json()
      if (json?.success && json.data) {
        setFacilityKeys(Array.isArray(json.data.facilities) ? json.data.facilities : [])
        setEventSpaceText(json.data.event_space_text || '')
      }
    } catch { /* content optional — leave empty */ }
  }

  const fetchGallery = async (slug: string) => {
    if (!slug) return
    try {
      const res = await apiRequest(`/gallery-items?category=${encodeURIComponent(outletGalleryCategory(slug))}`, {})
      const json = await res.json()
      if (json?.success) {
        const items: AdminGalleryItem[] = (json.data || []).filter((i: AdminGalleryItem) => i.media_type === 'image')
        items.sort((a, b) => a.sort_order - b.sort_order || b.id - a.id)
        setGalleryItems(items)
      }
    } catch { /* gallery optional */ }
  }

  const toggleFacility = (key: string) =>
    setFacilityKeys((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])

  const saveContent = async () => {
    setContentSaving(true); setContentMsg('')
    try {
      const res = await apiRequest(`/outlets/${id}/content`, {
        method: 'PUT',
        body: JSON.stringify({ facilities: facilityKeys, event_space_text: eventSpaceText }),
      })
      const json = await res.json()
      setContentMsg(res.ok && json?.success ? 'Saved!' : (json?.message || 'Save failed'))
    } catch {
      setContentMsg('Network error. Please try again.')
    } finally {
      setContentSaving(false)
    }
  }

  const uploadGalleryPhoto = async () => {
    if (!newPhoto.file || !newPhoto.title.trim()) { alert('Image file and alt text are required'); return }
    if (!formData.slug.trim()) { alert('Save the outlet with a slug first'); return }
    setGalleryBusy('new')
    try {
      const fd = new FormData()
      fd.append('title', newPhoto.title.trim())
      fd.append('category', outletGalleryCategory(formData.slug.trim()))
      fd.append('media_type', 'image')
      fd.append('status', 'active')
      fd.append('sort_order', newPhoto.sort_order || '0')
      fd.append('image', newPhoto.file)
      const res = await apiRequest('/gallery-items', { method: 'POST', body: fd })
      const json = await res.json()
      if (res.ok && json?.success) {
        setNewPhoto({ title: '', sort_order: '0', file: null })
        fetchGallery(formData.slug.trim())
      } else {
        alert(json?.message || 'Failed to upload photo')
      }
    } catch { alert('Network error. Please try again.') }
    finally { setGalleryBusy(null) }
  }

  const updateGalleryItem = async (item: AdminGalleryItem) => {
    setGalleryBusy(item.id)
    try {
      const fd = new FormData()
      fd.append('title', item.title)
      fd.append('category', item.category)
      fd.append('media_type', item.media_type || 'image')
      fd.append('instagram_url', '')
      fd.append('description', item.description || '')
      fd.append('tags', item.tags || '')
      fd.append('status', item.status)
      fd.append('is_featured', String(item.is_featured ? 1 : 0))
      fd.append('sort_order', String(item.sort_order ?? 0))
      const res = await apiRequest(`/gallery-items/${item.id}`, { method: 'PUT', body: fd })
      if (!res.ok) alert('Failed to update photo')
    } catch { alert('Network error. Please try again.') }
    finally { setGalleryBusy(null) }
  }

  const deleteGalleryItem = async (itemId: number) => {
    if (!confirm('Remove this photo from the outlet gallery?')) return
    setGalleryBusy(itemId)
    try {
      const res = await apiRequest(`/gallery-items/${itemId}`, { method: 'DELETE' })
      if (res.ok) fetchGallery(formData.slug.trim())
      else alert('Failed to delete photo')
    } catch { alert('Network error. Please try again.') }
    finally { setGalleryBusy(null) }
  }

  const patchGalleryItem = (itemId: number, patch: Partial<AdminGalleryItem>) =>
    setGalleryItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...patch } : i)))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: (type === 'number' && name === 'sort_order') ? (parseFloat(value) || 0) : value
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
      fd.append('status',           formData.status || 'active')
      fd.append('sort_order',       String(formData.sort_order ?? 0))
      fd.append('store_branch_id',  formData.store_branch_id || '')
      fd.append('seo_title',        formData.seo_title || '')
      fd.append('seo_description',  formData.seo_description || '')
      fd.append('seo_h1',           formData.seo_h1 || '')
      fd.append('og_title',         formData.og_title || '')
      fd.append('og_description',   formData.og_description || '')
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

        {/* SEO & Search Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">SEO &amp; Search Settings</h2>
          <p className="text-sm text-gray-500 mb-6">
            Per-outlet metadata for the public outlet page. OG URL and JSON-LD are generated automatically from the canonical URL and outlet data.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
            <input type="text" name="seo_title" value={formData.seo_title} onChange={handleInputChange}
              className="input-field" placeholder="e.g. Big Bean Cafe Koramangala | Coffee, Breakfast & Brunch" />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">Recommended ~50–60 characters. Falls back to outlet name if empty.</p>
              <p className="text-xs text-gray-500">{formData.seo_title.length} / 60</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
            <textarea name="seo_description" value={formData.seo_description} onChange={handleInputChange}
              rows={3} className="input-field"
              placeholder="e.g. Visit Big Bean Cafe on 80 Feet Road, Koramangala, Bengaluru, for specialty coffee, breakfast, brunch and desserts." />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">Recommended ~140–160 characters.</p>
              <p className="text-xs text-gray-500">{formData.seo_description.length} / 160</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">SEO H1</label>
            <input type="text" name="seo_h1" value={formData.seo_h1} onChange={handleInputChange}
              className="input-field" placeholder="e.g. Big Bean Cafe - Koramangala" />
            <p className="text-xs text-gray-500 mt-1">Visible page heading. Falls back to the outlet name if empty.</p>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Canonical URL</label>
            <input type="text" readOnly
              value={`https://www.bigbeancafe.in/outlets/${formData.slug || 'slug'}`}
              className="input-field bg-gray-50 text-gray-500 cursor-not-allowed" />
            <p className="text-xs text-gray-500 mt-1">Auto-generated from the slug. Used for rel=canonical and og:url.</p>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Open Graph Title</label>
            <input type="text" name="og_title" value={formData.og_title} onChange={handleInputChange}
              className="input-field" placeholder="Defaults to SEO Title when empty" />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Open Graph Description</label>
            <textarea name="og_description" value={formData.og_description} onChange={handleInputChange}
              rows={3} className="input-field" placeholder="Defaults to Meta Description when empty" />
          </div>
        </div>

        {/* Store Menu Integration */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Store Menu Integration</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Menu Branch ID</label>
            <input type="number" name="store_branch_id" value={formData.store_branch_id} onChange={handleInputChange}
              className="input-field" placeholder="e.g. 12" min="1" />
            <p className="text-xs text-gray-500 mt-1">
              Store branch ID used for outlet-specific menu pricing and availability. Leave empty to remove menu integration.
            </p>
          </div>
        </div>

        {/* Facilities & Comfort */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Facilities &amp; Comfort</h2>
          <p className="text-sm text-gray-500 mb-6">
            Tick only the facilities confirmed for this outlet. They appear on the public
            &quot;Facilities &amp; Comfort&quot; section — unticked facilities are never shown.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {OUTLET_FACILITIES.map(({ key, label }) => (
              <label key={key} className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 cursor-pointer transition-colors text-sm font-medium ${
                facilityKeys.includes(key) ? 'border-[#C9943A] bg-[#FFF7ED] text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
                <input
                  type="checkbox"
                  checked={facilityKeys.includes(key)}
                  onChange={() => toggleFacility(key)}
                  className="w-4 h-4 accent-[#C9943A]"
                />
                {label}
              </label>
            ))}
          </div>

          {facilityKeys.includes('event_space') && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Space Details <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={eventSpaceText}
                onChange={(e) => setEventSpaceText(e.target.value)}
                rows={3}
                className="input-field"
                placeholder="e.g. Dedicated event space for gatherings, workshops and celebrations. Contact the outlet for capacity and availability."
              />
              <p className="text-xs text-gray-500 mt-1">
                Shown in the &quot;Space for Your Next Gathering&quot; section. Only state confirmed details — no estimated capacities.
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <button type="button" onClick={saveContent} disabled={contentSaving}
              className="px-6 py-2 bg-[#3D1F0D] text-white rounded-lg hover:bg-[#5C2E12] disabled:opacity-50 flex items-center gap-2">
              <Save className="w-4 h-4" />
              {contentSaving ? 'Saving…' : 'Save Facilities'}
            </button>
            {contentMsg && <span className="text-sm text-gray-600">{contentMsg}</span>}
          </div>
        </div>

        {/* Outlet Gallery — Step Inside */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Outlet Gallery — Step Inside</h2>
          <p className="text-sm text-gray-500 mb-6">
            Interior and location photos shown in &quot;Step Inside Our Cafe&quot; on the public outlet page.
            Stored under gallery category <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">outlet-{formData.slug || 'slug'}</code>.
            Recommended: 3–6 photos.
          </p>

          {/* Existing photos */}
          {galleryItems.length > 0 ? (
            <div className="space-y-3 mb-6">
              {galleryItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border border-gray-200 rounded-xl p-3">
                  {item.image && (
                    <img src={getImageUrl(item.image) || ''} alt={item.title}
                      className="w-20 h-14 object-cover rounded-lg flex-shrink-0 bg-gray-100" />
                  )}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_90px_120px] gap-3 items-center min-w-0">
                    <input type="text" value={item.title}
                      onChange={(e) => patchGalleryItem(item.id, { title: e.target.value })}
                      className="input-field !py-2 text-sm" placeholder="Alt text / photo title" />
                    <input type="number" value={item.sort_order} min={0}
                      onChange={(e) => patchGalleryItem(item.id, { sort_order: parseInt(e.target.value, 10) || 0 })}
                      className="input-field !py-2 text-sm" placeholder="Order" title="Display order" />
                    <select value={item.status}
                      onChange={(e) => patchGalleryItem(item.id, { status: e.target.value })}
                      className="input-field !py-2 text-sm">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => updateGalleryItem(item)}
                    disabled={galleryBusy === item.id}
                    className="px-4 py-2 text-sm font-semibold text-[#3D1F0D] border border-[#C9943A] rounded-lg hover:bg-[#FFF7ED] disabled:opacity-50 whitespace-nowrap">
                    {galleryBusy === item.id ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" onClick={() => deleteGalleryItem(item.id)}
                    disabled={galleryBusy === item.id}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50" title="Delete photo">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-6">No gallery photos yet — upload the first one below.</p>
          )}

          {/* Upload new photo */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Add Photo</p>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_110px] gap-4 items-start">
              <div className="space-y-3">
                <input type="text" value={newPhoto.title}
                  onChange={(e) => setNewPhoto((p) => ({ ...p, title: e.target.value }))}
                  className="input-field" placeholder="Alt text, e.g. Koramangala cafe interior seating" />
                <input
                  type="file" accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => setNewPhoto((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FFF7ED] file:text-[#3D1F0D] hover:file:bg-[#F6E6D1] file:cursor-pointer" />
              </div>
              <div>
                <input type="number" value={newPhoto.sort_order} min={0}
                  onChange={(e) => setNewPhoto((p) => ({ ...p, sort_order: e.target.value }))}
                  className="input-field" placeholder="Order" title="Display order" />
                <button type="button" onClick={uploadGalleryPhoto}
                  disabled={galleryBusy === 'new'}
                  className="mt-3 w-full px-4 py-2 bg-[#3D1F0D] text-white rounded-lg hover:bg-[#5C2E12] disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-semibold">
                  <Plus className="w-4 h-4" />
                  {galleryBusy === 'new' ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Tip: if you rename the outlet slug, re-upload or update these photos — their category is tied to the slug.
            </p>
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
