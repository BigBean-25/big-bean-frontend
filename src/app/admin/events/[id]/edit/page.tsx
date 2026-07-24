'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Calendar, MapPin, Clock, Ticket, Info, FileText,
  Upload, X, Plus, Trash2, Copy, Save, Globe
} from 'lucide-react'
import apiRequest from '@/lib/api'
import { slugify, validateSlug } from '@/utils/slugify'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

const getImageUrl = (img: string | null) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

interface OutletOption {
  id: number
  name: string
  address: string
  latitude: string
  longitude: string
}

interface EventDate {
  id: string
  event_date: string
  start_time: string
  end_time: string
  door_open_time: string
  display_time_label: string
  total_seats: string
  available_seats: string
  status: 'active' | 'sold_out' | 'closed' | 'cancelled'
}

interface EventTicket {
  id: string
  ticket_name: string
  ticket_description: string
  price: string
  mrp: string
  total_quantity: string
  available_quantity: string
  max_per_booking: string
  status: 'active' | 'inactive' | 'sold_out'
}

interface EventFormData {
  title: string
  slug: string
  category: string
  short_description: string
  description: string
  status: 'draft' | 'active' | 'closed' | 'sold_out' | 'cancelled'
  is_featured: boolean
  sort_order: string
  outlet: {
    outlet_id: string
    outlet_name: string
    outlet_address: string
    city: string
    map_url: string
    latitude: string
    longitude: string
  }
  dates: EventDate[]
  ticket_types: EventTicket[]
  things_to_know: {
    language: string
    duration: string
    ticket_age_rule: string
    entry_age_rule: string
    layout_type: string
    seating_type: string
    kid_friendly: boolean
    pets_allowed: boolean
  }
  terms_conditions: string
  cancellation_policy: string
  entry_policy: string
}

const newDateId = () => Math.random().toString(36).slice(2)
const newTicketId = () => Math.random().toString(36).slice(2)

const defaultDate: EventDate = {
  id: newDateId(),
  event_date: '',
  start_time: '',
  end_time: '',
  door_open_time: '',
  display_time_label: '',
  total_seats: '40',
  available_seats: '40',
  status: 'active',
}

const defaultTicket: EventTicket = {
  id: newTicketId(),
  ticket_name: '',
  ticket_description: '',
  price: '',
  mrp: '',
  total_quantity: '',
  available_quantity: '',
  max_per_booking: '10',
  status: 'active',
}

const initialForm: EventFormData = {
  title: '',
  slug: '',
  category: '',
  short_description: '',
  description: '',
  status: 'draft',
  is_featured: false,
  sort_order: '0',
  outlet: {
    outlet_id: '',
    outlet_name: '',
    outlet_address: '',
    city: 'Bengaluru',
    map_url: '',
    latitude: '',
    longitude: '',
  },
  dates: [{ ...defaultDate }],
  ticket_types: [{ ...defaultTicket }],
  things_to_know: {
    language: 'English, Hindi',
    duration: '1 Hour',
    ticket_age_rule: 'Ticket needed for all ages',
    entry_age_rule: 'Entry allowed for all ages',
    layout_type: 'Indoor',
    seating_type: 'Seated & Standing',
    kid_friendly: true,
    pets_allowed: false,
  },
  terms_conditions: '',
  cancellation_policy: '',
  entry_policy: '',
}

const inputClass = 'w-full rounded-xl border border-[#DCE8E3] bg-[#F9FDFB] px-4 py-2.5 text-sm text-[#0F1F1A] placeholder:text-[#9CB3AC] focus:border-[#2FBF9B] focus:outline-none'
const labelClass = 'block text-sm font-bold text-[#0F1F1A] mb-1.5'
const cardClass = 'rounded-[28px] border border-[#DCE8E3] bg-white shadow-[0_18px_45px_rgba(31,42,36,0.06)] p-6'

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [form, setForm] = useState<EventFormData>(initialForm)
  const [outlets, setOutlets] = useState<OutletOption[]>([])
  const [loadingOutlets, setLoadingOutlets] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [loading, setLoading] = useState(true)

  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [existingBanner, setExistingBanner] = useState<string | null>(null)
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null)
  const [removeBanner, setRemoveBanner] = useState(false)
  const [removeThumbnail, setRemoveThumbnail] = useState(false)

  const [generator, setGenerator] = useState({
    from_date: '',
    to_date: '',
    start_time: '',
    end_time: '',
    door_open_time: '',
    seats_per_day: '40',
  })

  const bannerRef = useRef<HTMLInputElement>(null)
  const thumbnailRef = useRef<HTMLInputElement>(null)

  const formatTime = (time: string | null) => {
    if (!time) return ''
    const [h, m] = time.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
  }

  useEffect(() => {
    if (form.title && !form.slug) {
      setForm(prev => ({ ...prev, slug: slugify(form.title) }))
    }
  }, [form.title, form.slug])

  useEffect(() => {
    setLoadingOutlets(true)
    apiRequest('/outlets')
      .then(r => r.json())
      .then(d => {
        setOutlets(d.data || [])
      })
      .catch(() => {})
      .finally(() => setLoadingOutlets(false))
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    apiRequest(`/admin/events/${id}`)
      .then(async r => {
        if (r.status === 404) {
          setNotFound(true)
          return
        }
        const data = await r.json()
        if (!data.success) {
          setNotFound(true)
          return
        }
        const ev = data.data
        setForm({
          title: ev.title || '',
          slug: ev.slug || '',
          category: ev.category || '',
          short_description: ev.short_description || '',
          description: ev.description || '',
          status: ev.status || 'draft',
          is_featured: !!ev.is_featured,
          sort_order: String(ev.sort_order ?? 0),
          outlet: ev.outlet ? {
            outlet_id: ev.outlet.outlet_id ? String(ev.outlet.outlet_id) : '',
            outlet_name: ev.outlet.outlet_name || '',
            outlet_address: ev.outlet.outlet_address || '',
            city: ev.outlet.city || 'Bengaluru',
            map_url: ev.outlet.map_url || '',
            latitude: ev.outlet.latitude || '',
            longitude: ev.outlet.longitude || '',
          } : initialForm.outlet,
          dates: Array.isArray(ev.dates) && ev.dates.length ? ev.dates.map((d: any) => ({
            id: String(d.id),
            event_date: d.event_date,
            start_time: d.start_time,
            end_time: d.end_time || '',
            door_open_time: d.door_open_time || '',
            display_time_label: d.display_time_label || '',
            total_seats: String(d.total_seats),
            available_seats: String(d.available_seats),
            status: d.status,
          })) : [{ ...defaultDate, id: newDateId() }],
          ticket_types: Array.isArray(ev.ticket_types) && ev.ticket_types.length ? ev.ticket_types.map((t: any) => ({
            id: String(t.id),
            ticket_name: t.ticket_name || '',
            ticket_description: t.ticket_description || '',
            price: String(t.price),
            mrp: t.mrp != null ? String(t.mrp) : '',
            total_quantity: String(t.total_quantity),
            available_quantity: String(t.available_quantity),
            max_per_booking: String(t.max_per_booking),
            status: t.status,
          })) : [{ ...defaultTicket, id: newTicketId() }],
          things_to_know: {
            language: ev.language || 'English, Hindi',
            duration: ev.duration || '1 Hour',
            ticket_age_rule: ev.ticket_age_rule || 'Ticket needed for all ages',
            entry_age_rule: ev.entry_age_rule || 'Entry allowed for all ages',
            layout_type: ev.layout_type || 'Indoor',
            seating_type: ev.seating_type || 'Seated & Standing',
            kid_friendly: ev.kid_friendly !== undefined ? ev.kid_friendly : true,
            pets_allowed: ev.pets_allowed !== undefined ? ev.pets_allowed : false,
          },
          terms_conditions: ev.terms_conditions || '',
          cancellation_policy: ev.cancellation_policy || '',
          entry_policy: ev.entry_policy || '',
        })
        setExistingBanner(ev.event_banner || null)
        setExistingThumbnail(ev.event_thumbnail || null)
        setBannerPreview(ev.event_banner ? getImageUrl(ev.event_banner) : null)
        setThumbnailPreview(ev.event_thumbnail ? getImageUrl(ev.event_thumbnail) : null)
      })
      .catch(err => {
        if (err.message === 'Access denied' || err.message?.includes('Access denied')) {
          setForbidden(true)
        } else {
          setError('Unable to load event. Please try again.')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (field: keyof EventFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleOutletChange = (field: keyof EventFormData['outlet'], value: string) => {
    setForm(prev => ({ ...prev, outlet: { ...prev.outlet, [field]: value } }))
  }

  const handleOutletSelect = (outletId: string) => {
    if (!outletId) {
      setForm(prev => ({ ...prev, outlet: { ...initialForm.outlet, outlet_id: '' } }))
      return
    }
    const selected = outlets.find(o => String(o.id) === outletId)
    if (selected) {
      setForm(prev => ({
        ...prev,
        outlet: {
          ...prev.outlet,
          outlet_id: String(selected.id),
          outlet_name: selected.name,
          outlet_address: selected.address || '',
          latitude: selected.latitude || '',
          longitude: selected.longitude || '',
        },
      }))
    }
  }

  const handleDateChange = (index: number, field: keyof EventDate, value: any) => {
    setForm(prev => {
      const dates = [...prev.dates]
      dates[index] = { ...dates[index], [field]: value }
      return { ...prev, dates }
    })
  }

  const addDate = () => {
    setForm(prev => ({ ...prev, dates: [...prev.dates, { ...defaultDate, id: newDateId() }] }))
  }

  const removeDate = (index: number) => {
    setForm(prev => {
      const dates = prev.dates.filter((_, i) => i !== index)
      if (dates.length === 0) dates.push({ ...defaultDate, id: newDateId() })
      return { ...prev, dates }
    })
  }

  const duplicateFirstTiming = () => {
    setForm(prev => {
      if (prev.dates.length === 0) return prev
      const first = prev.dates[0]
      const dates = prev.dates.map((d, i) =>
        i === 0 ? d : {
          ...d,
          start_time: first.start_time,
          end_time: first.end_time,
          door_open_time: first.door_open_time,
          display_time_label: first.display_time_label,
          total_seats: first.total_seats,
          available_seats: first.available_seats,
          status: first.status,
        }
      )
      return { ...prev, dates }
    })
  }

  const getNextDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00`)
    date.setDate(date.getDate() + 1)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const autoGenerateDates = () => {
    if (!generator.from_date || !generator.to_date || !generator.start_time) {
      toast.error('From date, to date and start time are required to generate dates')
      return
    }
    if (generator.to_date < generator.from_date) {
      toast.error('To date must be same or after from date')
      return
    }
    if (generator.end_time && generator.end_time <= generator.start_time) {
      toast.error('End time must be after start time')
      return
    }
    const seats = Number(generator.seats_per_day) || 40
    const generated: EventDate[] = []
    let current = generator.from_date
    const displayLabel = generator.end_time
      ? `${formatTime(generator.start_time)} - ${formatTime(generator.end_time)}`
      : formatTime(generator.start_time)
    while (current <= generator.to_date) {
      generated.push({
        id: newDateId(),
        event_date: current,
        start_time: generator.start_time,
        end_time: generator.end_time,
        door_open_time: generator.door_open_time,
        display_time_label: displayLabel,
        total_seats: String(seats),
        available_seats: String(seats),
        status: 'active',
      })
      current = getNextDate(current)
    }
    setForm(prev => ({ ...prev, dates: [...prev.dates, ...generated] }))
    toast.success(`${generated.length} date(s) generated`)
  }

  const handleTicketChange = (index: number, field: keyof EventTicket, value: any) => {
    setForm(prev => {
      const ticket_types = [...prev.ticket_types]
      ticket_types[index] = { ...ticket_types[index], [field]: value }
      return { ...prev, ticket_types }
    })
  }

  const addTicket = () => {
    setForm(prev => ({ ...prev, ticket_types: [...prev.ticket_types, { ...defaultTicket, id: newTicketId() }] }))
  }

  const removeTicket = (index: number) => {
    setForm(prev => {
      const ticket_types = prev.ticket_types.filter((_, i) => i !== index)
      if (ticket_types.length === 0) ticket_types.push({ ...defaultTicket, id: newTicketId() })
      return { ...prev, ticket_types }
    })
  }

  const handleFileChange = (type: 'banner' | 'thumbnail', file: File | null, remove = false) => {
    if (type === 'banner') {
      setBannerFile(file)
      if (file) {
        setBannerPreview(URL.createObjectURL(file))
        setRemoveBanner(false)
      } else if (remove) {
        setBannerPreview(null)
        setExistingBanner(null)
        setRemoveBanner(true)
      } else {
        setBannerPreview(getImageUrl(existingBanner))
        setRemoveBanner(false)
      }
    } else {
      setThumbnailFile(file)
      if (file) {
        setThumbnailPreview(URL.createObjectURL(file))
        setRemoveThumbnail(false)
      } else if (remove) {
        setThumbnailPreview(null)
        setExistingThumbnail(null)
        setRemoveThumbnail(true)
      } else {
        setThumbnailPreview(getImageUrl(existingThumbnail))
        setRemoveThumbnail(false)
      }
    }
  }

  const validate = (status: string = form.status): string => {
    if (!form.title.trim()) return 'Event title is required'
    if (!form.slug.trim()) return 'Slug is required'
    const slugErr = validateSlug(form.slug)
    if (slugErr) return slugErr
    if (!form.outlet.outlet_name.trim()) return 'Outlet name is required'
    if (!form.outlet.outlet_address.trim()) return 'Outlet address is required'
    if (!form.dates.length) return 'At least one event date is required'
    for (let i = 0; i < form.dates.length; i++) {
      const d = form.dates[i]
      if (!d.event_date) return `Date ${i + 1}: event date is required`
      if (!d.start_time) return `Date ${i + 1}: start time is required`
      if (d.end_time && d.end_time <= d.start_time) return `Date ${i + 1}: end time must be after start time`
      const total = Number(d.total_seats)
      const available = Number(d.available_seats)
      if (isNaN(total) || total < 0) return `Date ${i + 1}: total seats must be a valid number`
      if (isNaN(available) || available < 0) return `Date ${i + 1}: available seats must be a valid number`
      if (available > total) return `Date ${i + 1}: available seats cannot be greater than total seats`
    }
    for (let i = 0; i < form.ticket_types.length; i++) {
      const t = form.ticket_types[i]
      if (!t.ticket_name.trim()) return `Ticket ${i + 1}: ticket name is required`
      if (t.price === '' || isNaN(Number(t.price)) || Number(t.price) < 0) return `Ticket ${i + 1}: price is required`
      const totalQty = Number(t.total_quantity)
      const availQty = Number(t.available_quantity)
      if (!isNaN(totalQty) && !isNaN(availQty) && availQty > totalQty) return `Ticket ${i + 1}: available quantity cannot be greater than total quantity`
    }
    if (status === 'active') {
      if (!form.dates.some(d => d.status === 'active')) return 'At least one active date is required for active event'
      if (!form.ticket_types.some(t => t.status === 'active')) return 'At least one active ticket is required for active event'
    }
    return ''
  }

  const handleSubmit = async (mode: 'save' | 'draft' | 'active') => {
    setError('')
    const submitStatus = mode === 'save' ? form.status : mode
    const validationError = validate(submitStatus)
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        category: form.category || null,
        short_description: form.short_description || null,
        description: form.description || null,
        status: submitStatus,
        is_featured: form.is_featured,
        sort_order: Number(form.sort_order) || 0,
        outlet: {
          outlet_id: form.outlet.outlet_id ? Number(form.outlet.outlet_id) : null,
          outlet_name: form.outlet.outlet_name.trim(),
          outlet_address: form.outlet.outlet_address.trim(),
          city: form.outlet.city || 'Bengaluru',
          map_url: form.outlet.map_url || null,
          latitude: form.outlet.latitude || null,
          longitude: form.outlet.longitude || null,
        },
        dates: form.dates.map(d => ({
          id: d.id,
          event_date: d.event_date,
          start_time: d.start_time,
          end_time: d.end_time || null,
          door_open_time: d.door_open_time || null,
          display_time_label: d.display_time_label || null,
          total_seats: Number(d.total_seats) || 0,
          available_seats: Number(d.available_seats) || 0,
          status: d.status,
        })),
        ticket_types: form.ticket_types.map(t => ({
          id: t.id,
          ticket_name: t.ticket_name.trim(),
          ticket_description: t.ticket_description || null,
          price: Number(t.price) || 0,
          mrp: t.mrp ? Number(t.mrp) : null,
          total_quantity: Number(t.total_quantity) || 0,
          available_quantity: Number(t.available_quantity) || 0,
          max_per_booking: Number(t.max_per_booking) || 10,
          status: t.status,
        })),
        things_to_know: {
          language: form.things_to_know.language || 'English, Hindi',
          duration: form.things_to_know.duration || '1 Hour',
          ticket_age_rule: form.things_to_know.ticket_age_rule || 'Ticket needed for all ages',
          entry_age_rule: form.things_to_know.entry_age_rule || 'Entry allowed for all ages',
          layout_type: form.things_to_know.layout_type || 'Indoor',
          seating_type: form.things_to_know.seating_type || 'Seated & Standing',
          kid_friendly: form.things_to_know.kid_friendly,
          pets_allowed: form.things_to_know.pets_allowed,
        },
        terms_conditions: form.terms_conditions || null,
        cancellation_policy: form.cancellation_policy || null,
        entry_policy: form.entry_policy || null,
        remove_banner: removeBanner,
        remove_thumbnail: removeThumbnail,
      }

      const fd = new FormData()
      fd.append('data', JSON.stringify(payload))
      if (bannerFile) fd.append('event_banner', bannerFile)
      if (thumbnailFile) fd.append('event_thumbnail', thumbnailFile)

      const res = await apiRequest(`/admin/events/${id}`, { method: 'PUT', body: fd })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update event')
      }
      toast.success('Event updated successfully')
      router.push('/admin/events')
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="mb-4 flex items-center gap-2 text-lg font-black text-[#0F1F1A]">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF8F3] text-[#167E68]">
        <Icon className="h-4 w-4" />
      </div>
      {title}
    </div>
  )

  if (loading) return <div className="p-12 text-center text-[#5F6F68]">Loading event...</div>
  if (notFound) return <div className="p-12 text-center text-[#5F6F68]">Event not found.</div>
  if (forbidden) return <div className="p-12 text-center text-[#5F6F68]">You do not have permission to edit events.</div>

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/events" scroll={false} className="rounded-xl p-2 hover:bg-[#F3F8F6]">
          <ArrowLeft className="h-5 w-5 text-[#5F6F68]" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#0F1F1A] sm:text-3xl">Edit Event</h1>
          <p className="text-sm text-[#5F6F68]">Update event details</p>
        </div>
      </div>

      {notFound && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          Event not found.
        </div>
      )}
      {forbidden && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          You do not have permission to edit events.
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={e => e.preventDefault()} className="space-y-6">
        {/* Basic Event Details */}
        <div className={cardClass}>
          <SectionTitle icon={Calendar} title="Basic Event Details" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-2">
              <label className={labelClass}>Event Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                placeholder="e.g. Coffee Brewing Workshop"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => handleChange('slug', slugify(e.target.value))}
                placeholder="coffee-brewing-workshop"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <input
                type="text"
                value={form.category}
                onChange={e => handleChange('category', e.target.value)}
                placeholder="e.g. Workshop"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={e => handleChange('status', e.target.value)}
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="sold_out">Sold Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={e => handleChange('sort_order', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelClass}>Short Description</label>
              <textarea
                value={form.short_description}
                onChange={e => handleChange('short_description', e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelClass}>About / Full Description</label>
              <textarea
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                rows={5}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="flex items-center gap-4 sm:col-span-2 lg:col-span-3">
              <label className="flex items-center gap-2 text-sm font-bold text-[#0F1F1A]">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={e => handleChange('is_featured', e.target.checked)}
                  className="h-4 w-4 rounded border-[#DCE8E3] text-[#167E68] focus:ring-[#2FBF9B]"
                />
                Featured Event
              </label>
            </div>
          </div>
        </div>

        {/* Event Media */}
        <div className={cardClass}>
          <SectionTitle icon={Upload} title="Event Media" />
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Hero Banner */}
            <div>
              <label className={labelClass}>Hero Banner Image</label>
              <p className="mb-2 text-xs text-[#5F6F68]">This image appears on the event detail page hero section. Recommended size: 1920 x 900 px.</p>
              <input
                type="file"
                accept="image/*"
                ref={bannerRef}
                onChange={e => handleFileChange('banner', e.target.files?.[0] || null)}
                className="hidden"
              />
              {bannerPreview ? (
                <div className="group relative overflow-hidden rounded-2xl border border-[#DCE8E3]">
                  <img src={bannerPreview} alt="Hero banner preview" className="h-52 w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => bannerRef.current?.click()}
                      className="rounded-xl bg-white px-3 py-1.5 text-sm font-bold text-[#3D1F0D] shadow hover:bg-[#F7EFE7]"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFileChange('banner', null, true)}
                      className="rounded-xl bg-[#E85D4C] px-3 py-1.5 text-sm font-bold text-white shadow hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => bannerRef.current?.click()}
                  className="flex h-52 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#DCE8E3] bg-[#F9FDFB] text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6] hover:border-[#C9943A]"
                >
                  <Upload className="h-8 w-8 text-[#C9943A]" />
                  Upload hero banner image
                </button>
              )}
            </div>

            {/* Thumbnail */}
            <div>
              <label className={labelClass}>Thumbnail Image</label>
              <p className="mb-2 text-xs text-[#5F6F68]">This image appears on event listing cards. Recommended size: 800 x 600 px.</p>
              <input
                type="file"
                accept="image/*"
                ref={thumbnailRef}
                onChange={e => handleFileChange('thumbnail', e.target.files?.[0] || null)}
                className="hidden"
              />
              {thumbnailPreview ? (
                <div className="group relative overflow-hidden rounded-2xl border border-[#DCE8E3]">
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="h-52 w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => thumbnailRef.current?.click()}
                      className="rounded-xl bg-white px-3 py-1.5 text-sm font-bold text-[#3D1F0D] shadow hover:bg-[#F7EFE7]"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFileChange('thumbnail', null, true)}
                      className="rounded-xl bg-[#E85D4C] px-3 py-1.5 text-sm font-bold text-white shadow hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => thumbnailRef.current?.click()}
                  className="flex h-52 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#DCE8E3] bg-[#F9FDFB] text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6] hover:border-[#C9943A]"
                >
                  <Upload className="h-8 w-8 text-[#C9943A]" />
                  Upload thumbnail image
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Outlet Details */}
        <div className={cardClass}>
          <SectionTitle icon={MapPin} title="Outlet Details" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Select Outlet</label>
              <select
                value={form.outlet.outlet_id}
                onChange={e => handleOutletSelect(e.target.value)}
                className={inputClass}
                disabled={loadingOutlets}
              >
                <option value="">{loadingOutlets ? 'Loading outlets...' : 'Select an existing outlet or enter manually'}</option>
                {outlets.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Outlet Name *</label>
              <input
                type="text"
                value={form.outlet.outlet_name}
                onChange={e => handleOutletChange('outlet_name', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input
                type="text"
                value={form.outlet.city}
                onChange={e => handleOutletChange('city', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Outlet Address *</label>
              <textarea
                value={form.outlet.outlet_address}
                onChange={e => handleOutletChange('outlet_address', e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className={labelClass}>Google Map URL</label>
              <input
                type="text"
                value={form.outlet.map_url}
                onChange={e => handleOutletChange('map_url', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Latitude</label>
                <input
                  type="text"
                  value={form.outlet.latitude}
                  onChange={e => handleOutletChange('latitude', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Longitude</label>
                <input
                  type="text"
                  value={form.outlet.longitude}
                  onChange={e => handleOutletChange('longitude', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className={cardClass}>
          <SectionTitle icon={Clock} title="Date & Time" />

          {/* Auto Date Generator */}
          <div className="mb-6 rounded-2xl border border-[#E8D8C8] bg-[#FDF9F3] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black text-[#3D1F0D]">Auto Generate Dates</p>
              <span className="text-xs text-[#5F4A3A]">From-to date range</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className={labelClass}>From Date</label>
                <input
                  type="date"
                  value={generator.from_date}
                  onChange={e => setGenerator(prev => ({ ...prev, from_date: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>To Date</label>
                <input
                  type="date"
                  value={generator.to_date}
                  onChange={e => setGenerator(prev => ({ ...prev, to_date: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Start Time</label>
                <input
                  type="time"
                  value={generator.start_time}
                  onChange={e => setGenerator(prev => ({ ...prev, start_time: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>End Time</label>
                <input
                  type="time"
                  value={generator.end_time}
                  onChange={e => setGenerator(prev => ({ ...prev, end_time: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Door Open Time</label>
                <input
                  type="time"
                  value={generator.door_open_time}
                  onChange={e => setGenerator(prev => ({ ...prev, door_open_time: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Seats Per Day</label>
                <input
                  type="number"
                  value={generator.seats_per_day}
                  onChange={e => setGenerator(prev => ({ ...prev, seats_per_day: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="flex items-end sm:col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={autoGenerateDates}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3D1F0D] px-4 py-2.5 text-sm font-bold text-[#FFF7ED] hover:bg-[#5A3A24]"
                >
                  <Calendar className="h-4 w-4" />
                  Generate Date Range
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {form.dates.map((date, index) => (
              <div key={date.id} className="rounded-2xl border border-[#E5E7EB] bg-[#F9FDFB] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-black text-[#0F1F1A]">Date {index + 1}</span>
                  <div className="flex items-center gap-2">
                    {form.dates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDate(index)}
                        className="rounded-lg p-2 text-[#E85D4C] hover:bg-[#FDE8E8]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className={labelClass}>Event Date *</label>
                    <input
                      type="date"
                      value={date.event_date}
                      onChange={e => handleDateChange(index, 'event_date', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Start Time *</label>
                    <input
                      type="time"
                      value={date.start_time}
                      onChange={e => handleDateChange(index, 'start_time', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End Time</label>
                    <input
                      type="time"
                      value={date.end_time}
                      onChange={e => handleDateChange(index, 'end_time', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Door Open Time</label>
                    <input
                      type="time"
                      value={date.door_open_time}
                      onChange={e => handleDateChange(index, 'door_open_time', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Display Time Label</label>
                    <input
                      type="text"
                      value={date.display_time_label}
                      onChange={e => handleDateChange(index, 'display_time_label', e.target.value)}
                      placeholder="e.g. 04:00 PM - 05:00 PM"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Total Seats *</label>
                    <input
                      type="number"
                      value={date.total_seats}
                      onChange={e => handleDateChange(index, 'total_seats', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Available Seats *</label>
                    <input
                      type="number"
                      value={date.available_seats}
                      onChange={e => handleDateChange(index, 'available_seats', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Date Status</label>
                    <select
                      value={date.status}
                      onChange={e => handleDateChange(index, 'status', e.target.value)}
                      className={inputClass}
                    >
                      <option value="active">Active</option>
                      <option value="sold_out">Sold Out</option>
                      <option value="closed">Closed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={addDate}
                className="inline-flex items-center gap-2 rounded-xl bg-[#EAF8F3] px-4 py-2.5 text-sm font-bold text-[#167E68] hover:bg-[#D4F2E8]"
              >
                <Plus className="h-4 w-4" />
                Add Another Date & Time
              </button>
              {form.dates.length > 1 && (
                <button
                  type="button"
                  onClick={duplicateFirstTiming}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8E3] bg-white px-4 py-2.5 text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6]"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate First Timing to All Dates
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ticket Types */}
        <div className={cardClass}>
          <SectionTitle icon={Ticket} title="Ticket Types" />
          <div className="space-y-4">
            {form.ticket_types.map((ticket, index) => (
              <div key={ticket.id} className="rounded-2xl border border-[#E5E7EB] bg-[#F9FDFB] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-black text-[#0F1F1A]">Ticket {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeTicket(index)}
                    className="rounded-lg p-2 text-[#E85D4C] hover:bg-[#FDE8E8]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Ticket Name *</label>
                    <input
                      type="text"
                      value={ticket.ticket_name}
                      onChange={e => handleTicketChange(index, 'ticket_name', e.target.value)}
                      placeholder="e.g. Regular Ticket"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Price (₹) *</label>
                    <input
                      type="number"
                      value={ticket.price}
                      onChange={e => handleTicketChange(index, 'price', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>MRP (₹)</label>
                    <input
                      type="number"
                      value={ticket.mrp}
                      onChange={e => handleTicketChange(index, 'mrp', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Total Quantity</label>
                    <input
                      type="number"
                      value={ticket.total_quantity}
                      onChange={e => handleTicketChange(index, 'total_quantity', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Available Quantity</label>
                    <input
                      type="number"
                      value={ticket.available_quantity}
                      onChange={e => handleTicketChange(index, 'available_quantity', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Max Per Booking</label>
                    <input
                      type="number"
                      value={ticket.max_per_booking}
                      onChange={e => handleTicketChange(index, 'max_per_booking', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select
                      value={ticket.status}
                      onChange={e => handleTicketChange(index, 'status', e.target.value)}
                      className={inputClass}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="sold_out">Sold Out</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className={labelClass}>Description</label>
                    <input
                      type="text"
                      value={ticket.ticket_description}
                      onChange={e => handleTicketChange(index, 'ticket_description', e.target.value)}
                      placeholder="Ticket description"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTicket}
              className="inline-flex items-center gap-2 rounded-xl bg-[#EAF8F3] px-4 py-2.5 text-sm font-bold text-[#167E68] hover:bg-[#D4F2E8]"
            >
              <Plus className="h-4 w-4" />
              Add Ticket Type
            </button>
          </div>
        </div>

        {/* Things to Know */}
        <div className={cardClass}>
          <SectionTitle icon={Info} title="Things to Know" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClass}>Activity Language</label>
              <input
                type="text"
                value={form.things_to_know.language}
                onChange={e => setForm(prev => ({ ...prev, things_to_know: { ...prev.things_to_know, language: e.target.value } }))}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-[#5F6F68]">Display: Activity will be in {form.things_to_know.language}</p>
            </div>
            <div>
              <label className={labelClass}>Duration</label>
              <input
                type="text"
                value={form.things_to_know.duration}
                onChange={e => setForm(prev => ({ ...prev, things_to_know: { ...prev.things_to_know, duration: e.target.value } }))}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-[#5F6F68]">Display: Duration {form.things_to_know.duration}</p>
            </div>
            <div>
              <label className={labelClass}>Ticket Rule</label>
              <input
                type="text"
                value={form.things_to_know.ticket_age_rule}
                onChange={e => setForm(prev => ({ ...prev, things_to_know: { ...prev.things_to_know, ticket_age_rule: e.target.value } }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Entry Rule</label>
              <input
                type="text"
                value={form.things_to_know.entry_age_rule}
                onChange={e => setForm(prev => ({ ...prev, things_to_know: { ...prev.things_to_know, entry_age_rule: e.target.value } }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Layout Type</label>
              <input
                type="text"
                value={form.things_to_know.layout_type}
                onChange={e => setForm(prev => ({ ...prev, things_to_know: { ...prev.things_to_know, layout_type: e.target.value } }))}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-[#5F6F68]">Display: Layout {form.things_to_know.layout_type}</p>
            </div>
            <div>
              <label className={labelClass}>Seating Arrangement</label>
              <input
                type="text"
                value={form.things_to_know.seating_type}
                onChange={e => setForm(prev => ({ ...prev, things_to_know: { ...prev.things_to_know, seating_type: e.target.value } }))}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-[#5F6F68]">Display: Seating Arrangement {form.things_to_know.seating_type}</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-bold text-[#0F1F1A]">
                <input
                  type="checkbox"
                  checked={form.things_to_know.kid_friendly}
                  onChange={e => setForm(prev => ({ ...prev, things_to_know: { ...prev.things_to_know, kid_friendly: e.target.checked } }))}
                  className="h-4 w-4 rounded border-[#DCE8E3] text-[#167E68] focus:ring-[#2FBF9B]"
                />
                Kid Friendly
              </label>
              <span className="text-xs text-[#5F6F68]">{form.things_to_know.kid_friendly ? 'Kid friendly' : 'Not Kid friendly'}</span>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-bold text-[#0F1F1A]">
                <input
                  type="checkbox"
                  checked={form.things_to_know.pets_allowed}
                  onChange={e => setForm(prev => ({ ...prev, things_to_know: { ...prev.things_to_know, pets_allowed: e.target.checked } }))}
                  className="h-4 w-4 rounded border-[#DCE8E3] text-[#167E68] focus:ring-[#2FBF9B]"
                />
                Pets Allowed
              </label>
              <span className="text-xs text-[#5F6F68]">{form.things_to_know.pets_allowed ? 'Pets allowed' : 'Pets not allowed'}</span>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className={cardClass}>
          <SectionTitle icon={FileText} title="Terms & Conditions" />
          <div className="grid gap-5">
            <div>
              <label className={labelClass}>Terms & Conditions</label>
              <textarea
                value={form.terms_conditions}
                onChange={e => handleChange('terms_conditions', e.target.value)}
                rows={5}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className={labelClass}>Cancellation Policy</label>
              <textarea
                value={form.cancellation_policy}
                onChange={e => handleChange('cancellation_policy', e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className={labelClass}>Entry Policy</label>
              <textarea
                value={form.entry_policy}
                onChange={e => handleChange('entry_policy', e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </div>
      </form>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#DCE8E3] bg-white/90 px-5 py-4 backdrop-blur-xl lg:left-[280px] lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/admin/events"
            scroll={false}
            className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8E3] bg-white px-5 py-2.5 text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6]"
          >
            Cancel
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8E3] bg-white px-5 py-2.5 text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('save')}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8E3] bg-white px-5 py-2.5 text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('active')}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#167E68] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0F1F1A] disabled:opacity-50"
            >
              <Globe className="h-4 w-4" />
              Publish Event
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
