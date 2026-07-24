'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { Search, Play, X, Instagram, ExternalLink, Loader2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

interface GalleryHero {
  eyebrow: string
  title: string
  highlight_text: string | null
  subtitle: string | null
  button_primary_text: string
  button_primary_url: string
  button_secondary_text: string
  button_secondary_url: string
  image: string | null
  stat_1_value: string
  stat_1_label: string
  stat_2_value: string
  stat_2_label: string
  stat_3_value: string
  stat_3_label: string
}

interface GalleryItem {
  id: number
  title: string
  category: string
  media_type: 'image' | 'video' | 'instagram'
  image: string | null
  video: string | null
  instagram_url: string | null
  description: string | null
  tags: string | null
  is_featured: number
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'instagram', label: 'Instagram Reels', mediaType: 'instagram' },
  { id: 'image', label: 'Photos', mediaType: 'image' },
  { id: 'video', label: 'Videos', mediaType: 'video' },
  { id: 'outlets', label: 'Outlets', category: 'outlets' },
  { id: 'events', label: 'Events', category: 'events' },
  { id: 'coffee', label: 'Coffee', category: 'coffee' },
  { id: 'food', label: 'Food', category: 'food' },
  { id: 'customers', label: 'Customers', category: 'customers' },
  { id: 'team', label: 'Team', category: 'team' },
]

// NOTE: For automatic Instagram feed, use the official Instagram Graph API later with:
// - Instagram Business/Creator account, Meta Developer App, access token, media endpoint, backend scheduled sync.
// Future: set INSTAGRAM_SYNC_ENABLED=true in .env with token + IG user ID to activate.

// ── Future instagram_media item shape (synced via Graph API) ─────────────────
interface InstagramMediaItem {
  id: number
  instagram_id: string
  caption: string | null
  media_type: string | null
  media_url: string | null
  thumbnail_url: string | null
  permalink: string | null
  is_featured: number
}
// ─────────────────────────────────────────────────────────────────────────────

// Convert an instagram_media DB row into a GalleryItem shape for the grid
function igMediaToGalleryItem(m: InstagramMediaItem): GalleryItem {
  const rawCaption = m.caption || ''
  return {
    id: m.id * -1,
    title: rawCaption.length > 60 ? rawCaption.slice(0, 60) + '…' : rawCaption || 'Instagram Moment',
    category: 'reels',
    media_type: 'instagram',
    image: m.thumbnail_url || m.media_url || null,
    video: null,
    instagram_url: m.permalink || null,
    description: m.caption || null,
    tags: null,
    is_featured: m.is_featured,
  }
}

export default function Gallery() {
  const [hero, setHero] = useState<GalleryHero | null>(null)
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)

  useEffect(() => {
    fetchHero()
    fetchAllItems()
  }, [])

  const fetchHero = async () => {
    try {
      const res = await fetch(`${API_URL}/gallery-hero/active`)
      const data = await res.json()
      if (data.success && data.data) setHero(data.data)
    } catch { }
  }

  // Fetch manual gallery items + future automatic instagram-media, merge them
  const fetchAllItems = async () => {
    try {
      const [galleryRes, igRes] = await Promise.allSettled([
        fetch(`${API_URL}/gallery-items/active`),
        fetch(`${API_URL}/instagram-media/active`),
      ])

      let manualItems: GalleryItem[] = []
      let igItems: GalleryItem[] = []

      if (galleryRes.status === 'fulfilled') {
        const data = await galleryRes.value.json()
        if (data.success) manualItems = data.data || []
      }

      // Future: when instagram-media has rows (Graph API synced), map them to GalleryItem
      if (igRes.status === 'fulfilled') {
        try {
          const data = await igRes.value.json()
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            igItems = (data.data as InstagramMediaItem[]).map(igMediaToGalleryItem)
          }
        } catch { }
      }

      // Manual items first, then future auto-synced items (deduplication not needed now)
      setItems([...manualItems, ...igItems])
    } catch { }
    finally { setLoading(false) }
  }

  const getImageUrl = (img?: string | null): string | null => {
    if (!img) return null
    if (img.startsWith('http')) return img
    return `${API_BASE_URL}/${img.replace(/^\/+/, '')}`
  }

  const filtered = items.filter(item => {
    const f = FILTERS.find(f => f.id === activeFilter)
    if (f && f.id !== 'all') {
      if ('mediaType' in f && f.mediaType && item.media_type !== f.mediaType) return false
      if ('category' in f && f.category && item.category !== f.category) return false
    }
    if (search) {
      const s = search.toLowerCase()
      return item.title.toLowerCase().includes(s) ||
        (item.description || '').toLowerCase().includes(s) ||
        (item.tags || '').toLowerCase().includes(s)
    }
    return true
  })

  const heroImageUrl = getImageUrl(hero?.image)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #FFF7ED, #F5E6D3, #FFF7ED)' }}>
      <Header />

      <main>
        {/* ── Hero ── */}
        <section className="relative min-h-[520px] flex items-center pt-[5.5rem] pb-16 overflow-hidden">
          {heroImageUrl ? (
            <>
              <img src={heroImageUrl} alt={hero?.title || 'Gallery Hero'}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.88, filter: 'brightness(1.05) contrast(1.05) saturate(1.05)' }} />
              <div className="absolute inset-0" style={{ background: 'rgba(18, 9, 5, 0.65)' }} />
            </>
          ) : (
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #120905 0%, #3D1F0D 50%, #6B3520 100%)' }} />
          )}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #C9943A 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="container-custom relative z-10">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-sm font-bold tracking-[0.22em] uppercase mb-4" style={{ color: '#C9943A' }}>
                  {hero?.eyebrow || 'BIG BEAN CAFÉ GALLERY'}
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-4" style={{ color: '#FFF7ED', lineHeight: 1.1 }}>
                  {hero?.title || 'Moments Brewed'}{' '}
                  <span style={{ color: '#C9943A' }}>{hero?.highlight_text || 'at Big Bean Café'}</span>
                </h1>
                <p className="text-lg mb-8" style={{ color: '#F5E6D3', maxWidth: '500px' }}>
                  {hero?.subtitle || 'Explore our café stories, Instagram reels, outlet moments, events, coffee creations and community memories.'}
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href={hero?.button_primary_url || '#gallery-list'}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(to right, #C9943A, #8B4A2F)' }}>
                    {hero?.button_primary_text || 'Explore Gallery'}
                  </a>
                  <a href={hero?.button_secondary_url || 'https://www.instagram.com/bigbeancafe.in/'}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold border-2 transition-all hover:bg-white/10"
                    style={{ borderColor: '#C9943A', color: '#FFF7ED' }}>
                    <Instagram className="w-4 h-4" />
                    {hero?.button_secondary_text || 'Follow Instagram'}
                  </a>
                </div>
              </div>

              <div className="hidden md:flex flex-wrap gap-4">
                {[
                  { value: hero?.stat_1_value || 'Reels', label: hero?.stat_1_label || 'Café Moments' },
                  { value: hero?.stat_2_value || 'Events', label: hero?.stat_2_label || 'Workshops' },
                  { value: hero?.stat_3_value || 'Outlets', label: hero?.stat_3_label || 'Good Vibes' },
                ].map((s, i) => (
                  <div key={i} className="flex-1 min-w-[120px] bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <p className="text-2xl font-bold font-heading" style={{ color: '#C9943A' }}>{s.value}</p>
                    <p className="text-sm" style={{ color: '#F5E6D3' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Filter + Search ── */}
        <section id="gallery-list" className="py-10 sticky top-0 z-20" style={{ background: 'rgba(255,247,237,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E6C7A8' }}>
          <div className="container-custom">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#C9943A' }} />
                <input
                  type="text"
                  placeholder="Search gallery..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#E6C7A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 bg-white"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => (
                  <button key={f.id} onClick={() => setActiveFilter(f.id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeFilter === f.id ? 'text-white shadow-md' : 'border border-[#E6C7A8] hover:border-[#C9943A]'}`}
                    style={{
                      background: activeFilter === f.id ? 'linear-gradient(to right, #C9943A, #8B4A2F)' : 'white',
                      color: activeFilter === f.id ? 'white' : '#3D1F0D'
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Gallery Grid ── */}
        <section className="py-16">
          <div className="container-custom">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C9943A' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-2xl font-bold font-heading mb-2" style={{ color: '#3D1F0D' }}>No items found</p>
                <p className="text-sm" style={{ color: '#6B3520' }}>Try a different filter or search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map(item => (
                  <GalleryCard key={item.id} item={item} getImageUrl={getImageUrl} onClick={() => setLightbox(item)} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Instagram CTA ── */}
        <section className="py-16">
          <div className="container-custom">
            <div className="rounded-[36px] p-10 md:p-16 text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #120905 0%, #3D1F0D 60%, #1a0a06 100%)' }}>
              <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 50%, #C9943A 0%, transparent 70%)' }} />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                  <Instagram className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4" style={{ color: '#FFF7ED' }}>
                  Follow Our Café Moments on <span style={{ color: '#C9943A' }}>Instagram</span>
                </h2>
                <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: '#F5E6D3' }}>
                  Catch the latest reels, outlet stories, events and fresh launches from Big Bean Café.
                </p>
                <a href="https://www.instagram.com/bigbeancafe.in/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-bold text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                  <Instagram className="w-5 h-5" />
                  Follow @bigbeancafe.in
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ── Lightbox ── */}
      {lightbox && (
        <Lightbox item={lightbox} getImageUrl={getImageUrl} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}

function GalleryCard({ item, getImageUrl, onClick }: {
  item: GalleryItem
  getImageUrl: (img?: string | null) => string | null
  onClick: () => void
}) {
  const imageUrl = getImageUrl(item.image)

  return (
    <div
      onClick={onClick}
      className="group relative rounded-[28px] overflow-hidden border border-[#E6C7A8] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white"
    >
      {/* Thumbnail */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        {item.media_type === 'instagram' ? (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
            <Instagram className="w-16 h-16 text-white opacity-90" />
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : item.media_type === 'video' ? (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#1A0D07' }}>
            <Play className="w-12 h-12 text-white/80" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-300 text-4xl">📷</span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            {item.media_type === 'video' ? <Play className="w-5 h-5 text-gray-800 ml-1" /> :
             item.media_type === 'instagram' ? <ExternalLink className="w-5 h-5 text-gray-800" /> :
             <Search className="w-5 h-5 text-gray-800" />}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {item.is_featured ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900">Featured</span>
          ) : null}
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            item.media_type === 'instagram' ? 'bg-pink-500 text-white' :
            item.media_type === 'video' ? 'bg-purple-600 text-white' :
            'bg-black/60 text-white'
          }`}>
            {item.media_type === 'instagram' ? 'Reel' : item.media_type === 'video' ? 'Video' : 'Photo'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="font-semibold text-sm font-heading truncate" style={{ color: '#3D1F0D' }}>{item.title}</p>
        <p className="text-xs mt-1 capitalize" style={{ color: '#8B4A2F' }}>{item.category}</p>
      </div>
    </div>
  )
}

function Lightbox({ item, getImageUrl, onClose }: {
  item: GalleryItem
  getImageUrl: (img?: string | null) => string | null
  onClose: () => void
}) {
  const imageUrl = getImageUrl(item.image)
  const videoUrl = getImageUrl(item.video)
  const tags = item.tags ? item.tags.split(',').map(t => t.trim()).filter(Boolean) : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(12, 5, 2, 0.92)' }}
      onClick={onClose}>
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-[#1A0D07] border border-[#3D1F0D] shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors">
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Media */}
        <div className="w-full" style={{ minHeight: '260px' }}>
          {item.media_type === 'instagram' ? (
            <div className="flex flex-col items-center justify-center py-12 px-8"
              style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
              <Instagram className="w-20 h-20 text-white mb-4" />
              <p className="text-white font-bold text-lg mb-6 text-center">{item.title}</p>
              <a href={item.instagram_url!} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-pink-600 font-bold hover:bg-gray-100 transition-colors">
                <ExternalLink className="w-4 h-4" /> Watch on Instagram
              </a>
            </div>
          ) : item.media_type === 'video' && videoUrl ? (
            <video src={videoUrl} controls className="w-full max-h-96 object-contain bg-black" />
          ) : imageUrl ? (
            <img src={imageUrl} alt={item.title} className="w-full max-h-96 object-contain bg-black" />
          ) : (
            <div className="flex items-center justify-center h-48 bg-gray-900">
              <p className="text-gray-400">No preview available</p>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="text-xl font-bold font-heading" style={{ color: '#FFF7ED' }}>{item.title}</h3>
            <span className="text-xs px-2.5 py-1 rounded-full capitalize flex-shrink-0"
              style={{ background: '#3D1F0D', color: '#C9943A' }}>{item.category}</span>
          </div>
          {item.description && (
            <p className="text-sm mb-4" style={{ color: '#C7A489' }}>{item.description}</p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: '#2A120B', color: '#C9943A', border: '1px solid #3D1F0D' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {item.media_type === 'instagram' && item.instagram_url && (
            <a href={item.instagram_url} target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: '#C9943A' }}>
              <ExternalLink className="w-4 h-4" /> View on Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  )
}