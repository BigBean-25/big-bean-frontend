'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, X } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface Outlet {
  id: number
  name: string
  address: string | null
  status: string
}

export default function AddEvent() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    outlet_id: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    price: '',
    booking_url: '',
    status: 'active',
    sort_order: '0'
  })
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/outlets')
      .then(r => r.json())
      .then(d => setOutlets((d.data || []).filter((o: Outlet) => o.status === 'active')))
      .catch(() => {})
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleOutletChange = (outletId: string) => {
    setForm(f => {
      const outlet = outlets.find(o => String(o.id) === outletId)
      return {
        ...f,
        outlet_id: outletId,
        location: outlet ? outlet.name : f.location
      }
    })
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setImageFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true); setError('')

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (imageFile) fd.append('image', imageFile)

    try {
      const res = await apiRequest('/events', { method: 'POST', body: fd })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      router.push('/admin/events')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/events" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Event</h1>
          <p className="text-gray-600">Create a new café event or workshop</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 space-y-4">
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Event Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" value={form.title} onChange={e => set('title', e.target.value)} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  placeholder="e.g. Coffee Tasting Workshop" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 resize-none"
                  placeholder="Describe the event…" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                  <input type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Outlet</label>
                <select value={form.outlet_id} onChange={e => handleOutletChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500">
                  <option value="">— Select outlet —</option>
                  {outlets.map(o => (
                    <option key={o.id} value={String(o.id)}>{o.name}{o.address ? ` · ${o.address}` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-gray-400 font-normal text-xs">(optional override)</span></label>
                  <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="e.g. Indiranagar Outlet" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input type="text" value={form.price} onChange={e => set('price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="e.g. ₹999 or Free" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking URL</label>
                <input type="url" value={form.booking_url} onChange={e => set('booking_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-4">Event Image</h2>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-coffee-400 transition-colors">
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="preview" className="w-full h-40 object-cover rounded-lg" />
                    <button type="button" onClick={e => { e.stopPropagation(); setImageFile(null); setPreview(null) }}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow">
                      <X className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload image</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · max 5 MB</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
            </div>

            {/* Settings */}
            <div className="card p-6 space-y-4">
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  min="0" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button type="submit" disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? 'Saving…' : 'Create Event'}
              </button>
              <Link href="/admin/events" className="btn-outline w-full text-center">Cancel</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
