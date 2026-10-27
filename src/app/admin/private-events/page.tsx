'use client'

import { useState, useEffect, useRef } from 'react'
import apiRequest from '@/lib/api'
import toast from 'react-hot-toast'
import {
  Plus, Pencil, Trash2, ImageIcon, Eye, EyeOff, X, Loader2,
  PartyPopper, Image as Images,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace(/\/api$/, '')

const getImg = (img?: string | null) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

interface HeroRow {
  id: number
  eyebrow: string | null
  heading: string
  description: string | null
  supporting_text: string | null
  primary_cta_text: string | null
  secondary_cta_text: string | null
  image: string | null
  mobile_image: string | null
  image_alt: string | null
  status: string
  sort_order: number
}

interface GalleryRow {
  id: number
  image: string
  outlet_slug: string | null
  outlet_name: string | null
  caption: string | null
  alt_text: string | null
  status: string
  sort_order: number
}

interface OutletOpt { slug: string; name: string }

const card = 'rounded-2xl border border-[#EAE2D6] bg-white shadow-[0_8px_30px_rgba(61,31,13,0.05)]'
const inputCls =
  'w-full rounded-xl border border-[#E4D5BF] bg-white px-3.5 py-2.5 text-sm text-[#3D1F0D] placeholder-[#B09880] transition focus:border-[#C9943A] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/25'
const labelCls = 'mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#6B4F3A]'
const btnPrimary =
  'inline-flex items-center gap-2 rounded-xl bg-[#3D1F0D] px-5 py-2.5 text-sm font-bold text-[#FFF7ED] transition hover:bg-[#5A2D1D] disabled:opacity-50'
const btnGhost =
  'inline-flex items-center gap-2 rounded-xl border border-[#E4D5BF] px-5 py-2.5 text-sm font-bold text-[#6B4F3A] transition hover:bg-[#F5EBDD]'

const EMPTY_HERO = {
  eyebrow: '', heading: '', description: '', supporting_text: '',
  primary_cta_text: 'Enquire About Your Event', secondary_cta_text: 'Explore Outlet Locations',
  image_alt: '', status: 'active', sort_order: 0,
}
const EMPTY_GALLERY = { outlet_slug: '', outlet_name: '', caption: '', alt_text: '', status: 'active', sort_order: 0 }

export default function PrivateEventsAdmin() {
  const [tab, setTab] = useState<'hero' | 'gallery'>('hero')
  const [heroes, setHeroes] = useState<HeroRow[]>([])
  const [gallery, setGallery] = useState<GalleryRow[]>([])
  const [outlets, setOutlets] = useState<OutletOpt[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [heroModal, setHeroModal] = useState<null | { id: number | null }>(null)
  const [heroForm, setHeroForm] = useState<any>(EMPTY_HERO)
  const [heroImage, setHeroImage] = useState<File | null>(null)
  const [heroMobile, setHeroMobile] = useState<File | null>(null)

  const [galModal, setGalModal] = useState<null | { id: number | null }>(null)
  const [galForm, setGalForm] = useState<any>(EMPTY_GALLERY)
  const [galImage, setGalImage] = useState<File | null>(null)

  const heroImgRef = useRef<HTMLInputElement>(null)
  const heroMobRef = useRef<HTMLInputElement>(null)
  const galImgRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [h, g, o] = await Promise.all([
        apiRequest('/admin/private-events/hero').then((r) => r.json()),
        apiRequest('/admin/private-events/gallery').then((r) => r.json()),
        apiRequest('/outlets/active').then((r) => r.json()).catch(() => ({ data: [] })),
      ])
      setHeroes(h.data || [])
      setGallery(g.data || [])
      setOutlets((o.data || []).map((x: any) => ({ slug: x.slug, name: x.name })).filter((x: OutletOpt) => x.slug))
    } catch {
      toast.error('Failed to load private events content')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  /* ── Hero modal ── */
  const openHero = (row?: HeroRow) => {
    setHeroImage(null); setHeroMobile(null)
    if (heroImgRef.current) heroImgRef.current.value = ''
    if (heroMobRef.current) heroMobRef.current.value = ''
    setHeroForm(row ? {
      eyebrow: row.eyebrow || '', heading: row.heading || '',
      description: row.description || '', supporting_text: row.supporting_text || '',
      primary_cta_text: row.primary_cta_text || '', secondary_cta_text: row.secondary_cta_text || '',
      image_alt: row.image_alt || '', status: row.status, sort_order: row.sort_order,
    } : EMPTY_HERO)
    setHeroModal({ id: row?.id ?? null })
  }

  const saveHero = async () => {
    if (!heroForm.heading.trim()) { toast.error('Heading is required'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(heroForm).forEach(([k, v]) => fd.append(k, String(v ?? '')))
      if (heroImage) fd.append('image', heroImage)
      if (heroMobile) fd.append('mobile_image', heroMobile)
      const res = heroModal?.id
        ? await apiRequest(`/admin/private-events/hero/${heroModal.id}`, { method: 'PUT', body: fd })
        : await apiRequest('/admin/private-events/hero', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      toast.success(heroModal?.id ? 'Hero updated' : 'Hero created')
      setHeroModal(null)
      load()
    } catch {
      toast.error('Failed to save hero')
    }
    setSaving(false)
  }

  const delHero = async (id: number) => {
    if (!confirm('Delete this hero entry?')) return
    try {
      await apiRequest(`/admin/private-events/hero/${id}`, { method: 'DELETE' })
      toast.success('Deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  /* ── Gallery modal ── */
  const openGal = (row?: GalleryRow) => {
    setGalImage(null)
    if (galImgRef.current) galImgRef.current.value = ''
    setGalForm(row ? {
      outlet_slug: row.outlet_slug || '', outlet_name: row.outlet_name || '',
      caption: row.caption || '', alt_text: row.alt_text || '',
      status: row.status, sort_order: row.sort_order,
    } : EMPTY_GALLERY)
    setGalModal({ id: row?.id ?? null })
  }

  const saveGal = async () => {
    if (!galModal?.id && !galImage) { toast.error('Please choose an image'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(galForm).forEach(([k, v]) => fd.append(k, String(v ?? '')))
      if (galImage) fd.append('image', galImage)
      const res = galModal?.id
        ? await apiRequest(`/admin/private-events/gallery/${galModal.id}`, { method: 'PUT', body: fd })
        : await apiRequest('/admin/private-events/gallery', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      toast.success(galModal?.id ? 'Image updated' : 'Image added')
      setGalModal(null)
      load()
    } catch {
      toast.error('Failed to save image')
    }
    setSaving(false)
  }

  const delGal = async (id: number) => {
    if (!confirm('Delete this gallery image?')) return
    try {
      await apiRequest(`/admin/private-events/gallery/${id}`, { method: 'DELETE' })
      toast.success('Deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#3D1F0D]">Private Events</h1>
          <p className="mt-1 text-sm text-[#8A7059]">Manage the /private-events page hero and gallery</p>
        </div>
        <button
          onClick={() => (tab === 'hero' ? openHero() : openGal())}
          className={btnPrimary}
        >
          <Plus className="h-4 w-4" /> {tab === 'hero' ? 'Add Hero' : 'Add Image'}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        {([['hero', 'Hero', PartyPopper], ['gallery', 'Gallery', Images]] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              tab === key ? 'bg-[#3D1F0D] text-[#FFF7ED]' : 'border border-[#E4D5BF] bg-white text-[#6B4F3A] hover:bg-[#F5EBDD]'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={`${card} py-20 text-center text-[#8A7059]`}>Loading…</div>
      ) : tab === 'hero' ? (
        heroes.length === 0 ? (
          <div className={`${card} py-20 text-center`}>
            <PartyPopper className="mx-auto mb-3 h-12 w-12 text-[#E4D5BF]" />
            <p className="font-semibold text-[#6B4F3A]">No hero entries yet</p>
            <button onClick={() => openHero()} className="mt-4 text-sm font-bold text-[#C9943A] hover:underline">
              Create the hero for /private-events
            </button>
          </div>
        ) : (
          <div className={`${card} overflow-hidden`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F1E6D6] bg-[#FAF5EE]">
                  <th className="px-5 py-3.5 text-left font-semibold text-[#6B4F3A]">Image</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-[#6B4F3A]">Heading</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-[#6B4F3A]">Status</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-[#6B4F3A]">Order</th>
                  <th className="px-5 py-3.5 text-right font-semibold text-[#6B4F3A]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {heroes.map((h) => {
                  const img = getImg(h.image)
                  return (
                    <tr key={h.id} className="border-b border-[#F7EFE7] transition-colors hover:bg-[#FAF5EE]">
                      <td className="px-5 py-3">
                        {img ? (
                          <img src={img} alt={h.image_alt || ''} className="h-10 w-16 rounded-lg border border-[#E4D5BF] object-cover" />
                        ) : (
                          <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-[#F5EBDD]">
                            <ImageIcon className="h-4 w-4 text-[#C9B49C]" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 font-semibold text-[#3D1F0D]">{h.heading}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${h.status === 'active' ? 'bg-[#EAF8F3] text-[#167E68]' : 'bg-[#F5EBDD] text-[#8A7059]'}`}>
                          {h.status === 'active' ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />} {h.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#6B4F3A]">{h.sort_order}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openHero(h)} className="rounded-lg p-2 transition-colors hover:bg-[#F5EBDD]" aria-label="Edit hero">
                            <Pencil className="h-4 w-4 text-[#8A7059]" />
                          </button>
                          <button onClick={() => delHero(h.id)} className="rounded-lg p-2 transition-colors hover:bg-red-50" aria-label="Delete hero">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      ) : gallery.length === 0 ? (
        <div className={`${card} py-20 text-center`}>
          <Images className="mx-auto mb-3 h-12 w-12 text-[#E4D5BF]" />
          <p className="font-semibold text-[#6B4F3A]">No gallery images yet</p>
          <p className="mt-1 text-xs text-[#8A7059]">Only real Big Bean photographs — the public gallery stays hidden until images are added.</p>
          <button onClick={() => openGal()} className="mt-4 text-sm font-bold text-[#C9943A] hover:underline">
            Add the first image
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {gallery.map((g) => (
            <div key={g.id} className={`${card} group overflow-hidden`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-[#F5EBDD]">
                <img src={getImg(g.image) || ''} alt={g.alt_text || ''} className="h-full w-full object-cover" />
                {g.status !== 'active' && (
                  <span className="absolute left-2 top-2 rounded-full bg-[#3D1F0D]/80 px-2.5 py-1 text-[10px] font-bold uppercase text-[#FFF7ED]">Inactive</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#3D1F0D]">{g.caption || g.outlet_name || 'Gallery image'}</p>
                  {g.outlet_name && <p className="truncate text-xs text-[#8A7059]">{g.outlet_name}</p>}
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  <button onClick={() => openGal(g)} className="rounded-lg p-2 transition-colors hover:bg-[#F5EBDD]" aria-label="Edit image">
                    <Pencil className="h-4 w-4 text-[#8A7059]" />
                  </button>
                  <button onClick={() => delGal(g.id)} className="rounded-lg p-2 transition-colors hover:bg-red-50" aria-label="Delete image">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Hero modal ── */}
      {heroModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#120905]/60 p-4 py-10" onClick={() => setHeroModal(null)}>
          <div className={`${card} w-full max-w-2xl p-6 sm:p-8`} onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-xl font-black text-[#3D1F0D]">{heroModal.id ? 'Edit Hero' : 'New Hero'}</h2>
              <button onClick={() => setHeroModal(null)} className="rounded-lg p-2 hover:bg-[#F5EBDD]" aria-label="Close"><X className="h-5 w-5 text-[#8A7059]" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={labelCls}>Eyebrow</label>
                <input className={inputCls} value={heroForm.eyebrow} onChange={(e) => setHeroForm({ ...heroForm, eyebrow: e.target.value })} placeholder="BIRTHDAYS · TEAM GATHERINGS · TIME TOGETHER" /></div>
              <div><label className={labelCls}>Heading *</label>
                <input className={inputCls} value={heroForm.heading} onChange={(e) => setHeroForm({ ...heroForm, heading: e.target.value })} placeholder="Event Spaces & Group Bookings in Bengaluru" /></div>
              <div className="sm:col-span-2"><label className={labelCls}>Main description</label>
                <textarea rows={3} className={inputCls} value={heroForm.description} onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })} /></div>
              <div className="sm:col-span-2"><label className={labelCls}>Supporting description</label>
                <textarea rows={2} className={inputCls} value={heroForm.supporting_text} onChange={(e) => setHeroForm({ ...heroForm, supporting_text: e.target.value })} /></div>
              <div><label className={labelCls}>Primary CTA text</label>
                <input className={inputCls} value={heroForm.primary_cta_text} onChange={(e) => setHeroForm({ ...heroForm, primary_cta_text: e.target.value })} /></div>
              <div><label className={labelCls}>Secondary CTA text</label>
                <input className={inputCls} value={heroForm.secondary_cta_text} onChange={(e) => setHeroForm({ ...heroForm, secondary_cta_text: e.target.value })} /></div>
              <div><label className={labelCls}>Desktop image</label>
                <input ref={heroImgRef} type="file" accept="image/*" onChange={(e) => setHeroImage(e.target.files?.[0] || null)} className={`${inputCls} file:mr-3 file:rounded-lg file:border-0 file:bg-[#F5EBDD] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-[#6B4F3A]`} /></div>
              <div><label className={labelCls}>Mobile image (optional)</label>
                <input ref={heroMobRef} type="file" accept="image/*" onChange={(e) => setHeroMobile(e.target.files?.[0] || null)} className={`${inputCls} file:mr-3 file:rounded-lg file:border-0 file:bg-[#F5EBDD] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-[#6B4F3A]`} /></div>
              <div className="sm:col-span-2"><label className={labelCls}>Image alt text</label>
                <input className={inputCls} value={heroForm.image_alt} onChange={(e) => setHeroForm({ ...heroForm, image_alt: e.target.value })} placeholder="Warm café event space set for a private gathering" /></div>
              <div><label className={labelCls}>Sort order</label>
                <input type="number" className={inputCls} value={heroForm.sort_order} onChange={(e) => setHeroForm({ ...heroForm, sort_order: parseInt(e.target.value) || 0 })} /></div>
              <div><label className={labelCls}>Publish status</label>
                <select className={inputCls} value={heroForm.status} onChange={(e) => setHeroForm({ ...heroForm, status: e.target.value })}>
                  <option value="active">Active (published)</option>
                  <option value="inactive">Inactive (hidden)</option>
                </select></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setHeroModal(null)} className={btnGhost}>Cancel</button>
              <button onClick={saveHero} disabled={saving} className={btnPrimary}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Hero
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Gallery modal ── */}
      {galModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#120905]/60 p-4 py-10" onClick={() => setGalModal(null)}>
          <div className={`${card} w-full max-w-lg p-6 sm:p-8`} onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-xl font-black text-[#3D1F0D]">{galModal.id ? 'Edit Image' : 'Add Image'}</h2>
              <button onClick={() => setGalModal(null)} className="rounded-lg p-2 hover:bg-[#F5EBDD]" aria-label="Close"><X className="h-5 w-5 text-[#8A7059]" /></button>
            </div>
            <div className="grid gap-4">
              <div><label className={labelCls}>Image {galModal.id ? '(leave empty to keep current)' : '*'}</label>
                <input ref={galImgRef} type="file" accept="image/*" onChange={(e) => setGalImage(e.target.files?.[0] || null)} className={`${inputCls} file:mr-3 file:rounded-lg file:border-0 file:bg-[#F5EBDD] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-[#6B4F3A]`} /></div>
              <div><label className={labelCls}>Outlet</label>
                <select className={inputCls} value={galForm.outlet_slug}
                  onChange={(e) => {
                    const slug = e.target.value
                    const name = outlets.find((o) => o.slug === slug)?.name || ''
                    setGalForm({ ...galForm, outlet_slug: slug, outlet_name: name })
                  }}>
                  <option value="">— Not outlet-specific —</option>
                  {outlets.map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}
                </select></div>
              <div><label className={labelCls}>Caption</label>
                <input className={inputCls} value={galForm.caption} onChange={(e) => setGalForm({ ...galForm, caption: e.target.value })} placeholder="e.g. First-floor event space, Koramangala" /></div>
              <div><label className={labelCls}>Alt text</label>
                <input className={inputCls} value={galForm.alt_text} onChange={(e) => setGalForm({ ...galForm, alt_text: e.target.value })} placeholder="Describe the photo for screen readers & SEO" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Sort order</label>
                  <input type="number" className={inputCls} value={galForm.sort_order} onChange={(e) => setGalForm({ ...galForm, sort_order: parseInt(e.target.value) || 0 })} /></div>
                <div><label className={labelCls}>Status</label>
                  <select className={inputCls} value={galForm.status} onChange={(e) => setGalForm({ ...galForm, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select></div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setGalModal(null)} className={btnGhost}>Cancel</button>
              <button onClick={saveGal} disabled={saving} className={btnPrimary}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
