'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Upload, X, Image as ImageIcon, Link2, Link2Off,
  Eye, EyeOff, Save, Loader2, AlertCircle
} from 'lucide-react'
import { apiRequest } from '@/lib/api'
import toast from 'react-hot-toast'

const API_URL  = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace(/\/api$/, '')

const getImageUrl = (img?: string | null) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

interface PopupFormProps {
  mode: 'create' | 'edit'
  initialData?: Record<string, any>
  popupId?: number
}

const POPUP_TYPES = [
  { value: 'general',     label: 'General / Announcement' },
  { value: 'merchandise', label: 'Merchandise' },
  { value: 'event',       label: 'Event' },
  { value: 'offer',       label: 'Offer' },
]
const FREQ_OPTIONS = [
  { value: 'once_per_session', label: 'Once Per Session (default)' },
  { value: 'every_visit',      label: 'Every Website Visit' },
  { value: 'once_per_day',     label: 'Once Per Day' },
  { value: 'show_once',        label: 'Show Only Once (forever)' },
]
const DEVICE_OPTIONS = [
  { value: 'all',     label: 'All Devices' },
  { value: 'desktop', label: 'Desktop and Laptop Only (≥1024px)' },
  { value: 'mobile',  label: 'Mobile and Tablet Only (<1024px)' },
]
const PAGE_OPTIONS = [
  { value: 'home',             label: 'Home Page' },
  { value: 'menu',             label: 'Menu Page' },
  { value: 'offers',           label: 'Offers Page' },
  { value: 'events',           label: 'Events Page' },
  { value: 'merchandise',      label: 'Merchandise Page' },
  { value: 'outlets',          label: 'Outlets Page' },
  { value: 'gallery',          label: 'Gallery Page' },
  { value: 'blog',             label: 'Blog Page' },
  { value: 'about',            label: 'About Page' },
  { value: 'contact',          label: 'Contact Page' },
  { value: 'franchise',        label: 'Franchise Page' },
  { value: 'reservations',     label: 'Reservations Page' },
  { value: 'corporate-orders', label: 'Corporate Orders Page' },
]

interface ImageMeta { file: File; preview: string; width: number; height: number }

function ImageUploadField({
  label, hint, aspect, name, existing, onFile, onRemove
}: {
  label: string; hint: string; aspect: string; name: string
  existing?: string | null; onFile: (f: File) => void; onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError]   = useState('')

  const validate = (file: File) => {
    setError('')
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { setError('Only JPG, PNG or WebP images allowed.'); return false }
    if (file.size > 2 * 1024 * 1024)  { setError('File size must be under 2MB.'); return false }
    return true
  }

  const handleFile = (file: File) => {
    if (!validate(file)) return
    onFile(file)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
    onRemove()
  }

  const displaySrc = preview || getImageUrl(existing)

  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-[#1F2A24]">{label}</label>
      <p className="mb-2 text-xs text-[#9DB0A1]">{hint}</p>
      {displaySrc ? (
        <div className="relative w-fit">
          <img
            src={displaySrc}
            alt={label}
            className="rounded-xl border border-[#DDE8DD] object-contain bg-[#F8FBF7]"
            style={{ width: 240, aspectRatio: aspect, display: 'block' }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault(); setDragging(false)
            const f = e.dataTransfer.files[0]; if (f) handleFile(f)
          }}
          className={`flex h-28 w-full max-w-xs flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition ${
            dragging ? 'border-[#2FBF9B] bg-[#EAF8F3]' : 'border-[#DDE8DD] bg-[#F8FBF7] hover:border-[#2FBF9B] hover:bg-[#EAF8F3]'
          }`}
        >
          <Upload className="h-6 w-6 text-[#9DB0A1]" />
          <span className="text-xs font-bold text-[#607064]">Click or drag image here</span>
        </button>
      )}
      {error && <p className="mt-1 text-xs font-bold text-red-600">{error}</p>}
      <input ref={inputRef} type="file" name={name} accept="image/jpeg,image/jpg,image/png,image/webp" className="sr-only"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
    </div>
  )
}

export default function PopupForm({ mode, initialData = {}, popupId }: PopupFormProps) {
  const router = useRouter()

  const [title,        setTitle]        = useState(initialData.title        || '')
  const [popupType,    setPopupType]    = useState(initialData.popup_type   || 'general')
  const [description,  setDescription]  = useState(initialData.short_description || '')
  const [linkEnabled,  setLinkEnabled]  = useState(!!initialData.link_enabled)
  const [buttonText,   setButtonText]   = useState(initialData.button_text  || '')
  const [buttonUrl,    setButtonUrl]    = useState(initialData.button_url   || '')
  const [openNewTab,   setOpenNewTab]   = useState(!!initialData.open_in_new_tab)
  const [imgClickable, setImgClickable] = useState(!!initialData.image_clickable)
  const [delayMs,      setDelayMs]      = useState(String(initialData.display_delay_ms ?? 0))
  const [frequency,    setFrequency]    = useState(initialData.display_frequency || 'once_per_session')
  const [pageMode,     setPageMode]     = useState<'all' | 'selected'>(() => {
    const pages = initialData.target_pages
    if (!pages) return 'all'
    const arr = typeof pages === 'string' ? (() => { try { return JSON.parse(pages) } catch { return [] } })() : pages
    return Array.isArray(arr) && arr.length > 0 ? 'selected' : 'all'
  })
  const [selectedPages, setSelectedPages] = useState<string[]>(() => {
    const pages = initialData.target_pages
    if (!pages) return []
    try { const arr = typeof pages === 'string' ? JSON.parse(pages) : pages; return Array.isArray(arr) ? arr : [] }
    catch { return [] }
  })
  const [targetDevices, setTargetDevices] = useState(initialData.target_devices || 'all')
  const [priority,     setPriority]     = useState(String(initialData.priority ?? 0))
  const [startAt,      setStartAt]      = useState(initialData.start_at ? initialData.start_at.slice(0, 16) : '')
  const [endAt,        setEndAt]        = useState(initialData.end_at   ? initialData.end_at.slice(0, 16)   : '')
  const [status,       setStatus]       = useState(initialData.status !== undefined ? !!initialData.status : true)

  const [desktopFile,  setDesktopFile]  = useState<File | null>(null)
  const [mobileFile,   setMobileFile]   = useState<File | null>(null)
  const [removeMobile, setRemoveMobile] = useState(false)

  const [saving,  setSaving]  = useState(false)
  const [errors,  setErrors]  = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = 'Title is required'
    if (mode === 'create' && !desktopFile) e.desktop_image = 'Desktop image is required'
    if (linkEnabled) {
      if (!buttonText.trim()) e.button_text = 'Button text is required when link is enabled'
      if (!buttonUrl.trim())  e.button_url  = 'Button URL is required when link is enabled'
    }
    if (startAt && endAt && new Date(endAt) <= new Date(startAt)) {
      e.end_at = 'End date must be after start date'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) { toast.error('Please fix the highlighted errors'); return }

    setSaving(true)
    const fd = new FormData()
    fd.append('title', title.trim())
    fd.append('popup_type', popupType)
    fd.append('short_description', description)
    fd.append('link_enabled', String(linkEnabled))
    if (linkEnabled) {
      fd.append('button_text', buttonText)
      fd.append('button_url', buttonUrl)
      fd.append('open_in_new_tab', String(openNewTab))
      fd.append('image_clickable', String(imgClickable))
    }
    fd.append('display_delay_ms', delayMs)
    fd.append('display_frequency', frequency)
    fd.append('target_pages', pageMode === 'all' ? JSON.stringify([]) : JSON.stringify(selectedPages))
    fd.append('target_devices', targetDevices)
    fd.append('priority', priority)
    fd.append('start_at', startAt)
    fd.append('end_at', endAt)
    fd.append('status', String(status))
    if (desktopFile) fd.append('desktop_image', desktopFile)
    if (mobileFile)  fd.append('mobile_image',  mobileFile)
    if (removeMobile) fd.append('remove_mobile_image', 'true')

    try {
      const res = await apiRequest(
        mode === 'create' ? '/admin/website-popups' : `/admin/website-popups/${popupId}`,
        { method: mode === 'create' ? 'POST' : 'PUT', body: fd }
      )
      const d = await res.json()
      if (d.success) {
        toast.success(mode === 'create' ? 'Popup created!' : 'Popup updated!')
        router.push('/admin/website-popups')
      } else {
        toast.error(d.message || 'Save failed')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const togglePage = (v: string) =>
    setSelectedPages(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])

  const Field = ({ id, label, error, children }: { id?: string; label: string; error?: string; children: React.ReactNode }) => (
    <div>
      {id ? <label htmlFor={id} className="mb-1 block text-sm font-bold text-[#1F2A24]">{label}</label>
           : <p className="mb-1 text-sm font-bold text-[#1F2A24]">{label}</p>}
      {children}
      {error && <p className="mt-1 flex items-center gap-1 text-xs font-bold text-red-600"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
    </div>
  )

  const inputClass = (err?: string) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm text-[#1F2A24] outline-none transition focus:ring-2 focus:ring-[#2FBF9B]/30 ${
      err ? 'border-red-400 bg-red-50' : 'border-[#DDE8DD] bg-white focus:border-[#2FBF9B]'
    }`

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/website-popups" className="flex items-center gap-1.5 rounded-xl border border-[#DDE8DD] bg-white px-3 py-2 text-sm font-bold text-[#607064] hover:bg-[#F8FBF7] transition">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#1F2A24]">{mode === 'create' ? 'Create Website Popup' : 'Edit Website Popup'}</h1>
          <p className="text-sm text-[#9DB0A1]">{mode === 'create' ? 'Add a new promotional popup to the public website.' : 'Update the popup content and settings.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Left column — main fields */}
        <div className="space-y-5 lg:col-span-2">

          {/* Popup Content */}
          <section className="rounded-2xl border border-[#DDE8DD] bg-white p-5 space-y-4">
            <h2 className="font-heading text-base font-black text-[#1F2A24]">Popup Content</h2>

            <Field id="title" label="Title *" error={errors.title}>
              <input id="title" type="text" maxLength={255} value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. 20% Off All Merchandise This Weekend" className={inputClass(errors.title)} />
            </Field>

            <Field id="popup_type" label="Popup Type *">
              <select id="popup_type" value={popupType} onChange={e => setPopupType(e.target.value)} className={inputClass()}>
                {POPUP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>

            <Field id="description" label="Short Description">
              <textarea id="description" rows={3} maxLength={500} value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Optional short description shown below the title…"
                className={inputClass()} style={{ resize: 'vertical' }} />
              <p className="mt-0.5 text-right text-xs text-[#9DB0A1]">{description.length}/500</p>
            </Field>
          </section>

          {/* Images */}
          <section className="rounded-2xl border border-[#DDE8DD] bg-white p-5 space-y-5">
            <h2 className="font-heading text-base font-black text-[#1F2A24]">Images</h2>
            {errors.desktop_image && (
              <p className="flex items-center gap-1 text-xs font-bold text-red-600"><AlertCircle className="h-3.5 w-3.5" />{errors.desktop_image}</p>
            )}
            <ImageUploadField
              label="Desktop Image *"
              hint="Recommended 1200×800px · 3:2 ratio · WebP or JPG · max 2 MB"
              aspect="3/2"
              name="desktop_image"
              existing={mode === 'edit' ? initialData.desktop_image : null}
              onFile={f => setDesktopFile(f)}
              onRemove={() => setDesktopFile(null)}
            />
            <ImageUploadField
              label="Mobile Image (optional)"
              hint="Recommended 800×1000px · 4:5 ratio · WebP or JPG · max 2 MB. Falls back to desktop image if not provided."
              aspect="4/5"
              name="mobile_image"
              existing={mode === 'edit' && !removeMobile ? initialData.mobile_image : null}
              onFile={f => { setMobileFile(f); setRemoveMobile(false) }}
              onRemove={() => { setMobileFile(null); if (mode === 'edit' && initialData.mobile_image) setRemoveMobile(true) }}
            />
          </section>

          {/* Link Settings */}
          <section className="rounded-2xl border border-[#DDE8DD] bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-black text-[#1F2A24]">Link Settings</h2>
              <button type="button" onClick={() => setLinkEnabled(v => !v)}
                className="flex items-center gap-2 rounded-full border border-[#DDE8DD] px-3 py-1.5 text-xs font-bold transition hover:bg-[#F8FBF7]">
                {linkEnabled
                  ? <><Link2    className="h-3.5 w-3.5 text-emerald-600" /><span className="text-emerald-700">Link Enabled</span></>
                  : <><Link2Off className="h-3.5 w-3.5 text-[#9DB0A1]"  /><span className="text-[#607064]">Enable Link</span></>}
              </button>
            </div>

            {linkEnabled && (
              <div className="space-y-4">
                <Field id="button_text" label="Button Text *" error={errors.button_text}>
                  <input id="button_text" type="text" maxLength={100} value={buttonText}
                    onChange={e => setButtonText(e.target.value)} placeholder="e.g. Shop Now, Learn More, Book Now"
                    className={inputClass(errors.button_text)} />
                </Field>
                <Field id="button_url" label="Button URL *" error={errors.button_url}>
                  <input id="button_url" type="text" value={buttonUrl}
                    onChange={e => setButtonUrl(e.target.value)}
                    placeholder="/merchandise  or  https://example.com"
                    className={inputClass(errors.button_url)} />
                  <p className="mt-0.5 text-xs text-[#9DB0A1]">Use /path for internal pages or https:// for external links.</p>
                </Field>
                <div className="flex flex-wrap gap-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={openNewTab} onChange={e => setOpenNewTab(e.target.checked)}
                      className="h-4 w-4 rounded accent-[#2FBF9B]" />
                    <span className="text-sm text-[#1F2A24]">Open in new tab</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={imgClickable} onChange={e => setImgClickable(e.target.checked)}
                      className="h-4 w-4 rounded accent-[#2FBF9B]" />
                    <span className="text-sm text-[#1F2A24]">Image is clickable (links to button URL)</span>
                  </label>
                </div>
              </div>
            )}
          </section>

          {/* Display Settings */}
          <section className="rounded-2xl border border-[#DDE8DD] bg-white p-5 space-y-4">
            <h2 className="font-heading text-base font-black text-[#1F2A24]">Display Settings</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="delay" label="Display Delay (ms)">
                <input id="delay" type="number" min={0} max={30000} step={100} value={delayMs}
                  onChange={e => setDelayMs(e.target.value)} className={inputClass()} />
                <p className="mt-0.5 text-xs text-[#9DB0A1]">0 = immediately when page loads. Max 30000ms.</p>
              </Field>
              <Field id="frequency" label="Display Frequency *">
                <select id="frequency" value={frequency} onChange={e => setFrequency(e.target.value)} className={inputClass()}>
                  {FREQ_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </Field>
            </div>
          </section>

          {/* Schedule */}
          <section className="rounded-2xl border border-[#DDE8DD] bg-white p-5 space-y-4">
            <h2 className="font-heading text-base font-black text-[#1F2A24]">Schedule (optional)</h2>
            <p className="text-xs text-[#9DB0A1]">Leave blank to show the popup without a time restriction. The server checks these times server-side.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="start_at" label="Start Date &amp; Time">
                <input id="start_at" type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} className={inputClass()} />
              </Field>
              <Field id="end_at" label="End Date &amp; Time" error={errors.end_at}>
                <input id="end_at" type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} className={inputClass(errors.end_at)} />
              </Field>
            </div>
          </section>

          {/* Page & Device Targeting */}
          <section className="rounded-2xl border border-[#DDE8DD] bg-white p-5 space-y-4">
            <h2 className="font-heading text-base font-black text-[#1F2A24]">Page &amp; Device Targeting</h2>

            <Field id="target_devices" label="Target Devices *">
              <select id="target_devices" value={targetDevices} onChange={e => setTargetDevices(e.target.value)} className={inputClass()}>
                {DEVICE_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </Field>

            <Field label="Target Pages *">
              <div className="flex gap-3 mb-3">
                {(['all', 'selected'] as const).map(m => (
                  <label key={m} className="flex cursor-pointer items-center gap-2">
                    <input type="radio" checked={pageMode === m} onChange={() => setPageMode(m)} className="accent-[#2FBF9B]" />
                    <span className="text-sm text-[#1F2A24]">{m === 'all' ? 'All Public Pages' : 'Selected Pages'}</span>
                  </label>
                ))}
              </div>
              {pageMode === 'selected' && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PAGE_OPTIONS.map(pg => (
                    <label key={pg.value} className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#DDE8DD] px-3 py-2 hover:bg-[#F8FBF7]">
                      <input type="checkbox" checked={selectedPages.includes(pg.value)}
                        onChange={() => togglePage(pg.value)} className="h-4 w-4 accent-[#2FBF9B]" />
                      <span className="text-xs text-[#1F2A24]">{pg.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </Field>
          </section>
        </div>

        {/* Right column — meta */}
        <div className="space-y-5">

          {/* Publish */}
          <section className="rounded-2xl border border-[#DDE8DD] bg-white p-5 space-y-4">
            <h2 className="font-heading text-base font-black text-[#1F2A24]">Publish</h2>

            <div className="flex items-center justify-between rounded-xl border border-[#DDE8DD] bg-[#F8FBF7] px-4 py-3">
              <span className="text-sm font-bold text-[#1F2A24]">Status</span>
              <button
                type="button"
                onClick={() => setStatus(v => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${status ? 'bg-[#2FBF9B]' : 'bg-[#DDE8DD]'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${status ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="text-xs text-[#9DB0A1]">{status ? 'Popup is enabled and will be shown according to its schedule.' : 'Popup is disabled and will not be shown.'}</p>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3D1F0D] py-3 text-sm font-black text-[#FFF7ED] shadow hover:bg-[#2FBF9B] hover:text-[#120905] transition disabled:opacity-50"
            >
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : <><Save className="h-4 w-4" />{mode === 'create' ? 'Create Popup' : 'Save Changes'}</>}
            </button>
          </section>

          {/* Priority */}
          <section className="rounded-2xl border border-[#DDE8DD] bg-white p-5 space-y-3">
            <h2 className="font-heading text-base font-black text-[#1F2A24]">Priority</h2>
            <input
              type="number" min={0} max={999} value={priority}
              onChange={e => setPriority(e.target.value)}
              className={inputClass()}
            />
            <p className="text-xs text-[#9DB0A1]">Higher number = shown first when multiple active popups match. Default 0.</p>
          </section>

          {/* Summary */}
          <section className="rounded-2xl border border-[#DDE8DD] bg-[#F8FBF7] p-5 space-y-2 text-xs text-[#607064]">
            <h2 className="font-heading text-sm font-black text-[#1F2A24]">Summary</h2>
            <p><strong>Type:</strong> {POPUP_TYPES.find(t => t.value === popupType)?.label}</p>
            <p><strong>Frequency:</strong> {FREQ_OPTIONS.find(f => f.value === frequency)?.label}</p>
            <p><strong>Devices:</strong> {DEVICE_OPTIONS.find(d => d.value === targetDevices)?.label}</p>
            <p><strong>Pages:</strong> {pageMode === 'all' ? 'All public pages' : selectedPages.length > 0 ? selectedPages.join(', ') : '(none selected)'}</p>
            <p><strong>Delay:</strong> {delayMs}ms {Number(delayMs) === 0 ? '(immediate)' : ''}</p>
            <p><strong>Link:</strong> {linkEnabled ? (buttonUrl || 'URL not set') : 'Disabled'}</p>
          </section>
        </div>
      </div>
    </form>
  )
}
