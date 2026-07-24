'use client'

import { useState, useEffect, useMemo } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { Coffee, Search, Leaf, ShoppingBag, AlertCircle, SlidersHorizontal, X, ArrowRight, ChevronDown, Star, BadgeCheck } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'
const ORDER_URL = 'https://bigbeancafe.store'

interface MenuHero {
  id: number
  eyebrow: string
  title: string
  highlight_text: string | null
  subtitle: string | null
  button_primary_text: string
  button_primary_url: string
  button_secondary_text: string
  button_secondary_url: string
  image: string | null
}

interface MenuCombo {
  id: number
  title: string
  subtitle: string | null
  description: string | null
  items_text: string | null
  price: number
  mrp: number | null
  badge_text: string | null
  image: string | null
  button_text: string
  button_url: string
}

interface Category {
  id: number
  name: string
  image: string | null
  banner_image?: string | null
  children?: Category[]
  childes?: Category[]
}

interface Product {
  id: number
  name: string
  description: string
  image_url: string | null
  price: number
  display_price: string
  product_type: string
  is_available: boolean
  status: number
  category_ids?: Array<{
    id: string | number
    position: number | string
  }>
}

const PRICE_RANGES = [
  { label: 'All Prices', value: 'all' },
  { label: 'Under ₹100', value: 'under100' },
  { label: '₹100 – ₹200', value: '100-200' },
  { label: '₹200 – ₹300', value: '200-300' },
  { label: 'Above ₹300', value: 'above300' },
]

const SORT_OPTIONS = [
  { label: 'Recommended', value: 'popular' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name A → Z', value: 'name_asc' },
]

function matchesPrice(price: number, range: string): boolean {
  if (range === 'all') return true
  if (range === 'under100') return price < 100
  if (range === '100-200') return price >= 100 && price <= 200
  if (range === '200-300') return price > 200 && price <= 300
  if (range === 'above300') return price > 300
  return true
}

export default function Menu() {
  const [categories, setCategories] = useState<Category[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categoryProductsMap, setCategoryProductsMap] = useState<Record<number, Product[]>>({})
  const [selectedCatId, setSelectedCatId] = useState<number | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [vegFilter, setVegFilter] = useState('all')
  const [loadingCats, setLoadingCats] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [apiFailed, setApiFailed] = useState(false)
  const [apiMessage, setApiMessage] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [menuHero, setMenuHero] = useState<MenuHero | null>(null)
  const [combos, setCombos] = useState<MenuCombo[]>([])

  const getImg = (img: string | null | undefined) => {
    if (!img) return null
    if (img.startsWith('http')) return img
    return `${API_BASE}/${img.replace(/^\/+/, '')}`
  }

  const encodeBase64 = (value?: string | null) => {
    if (!value) return ''
    try {
      if (typeof window !== 'undefined') {
        return window.btoa(value)
      }
      return Buffer.from(value).toString('base64')
    } catch {
      return ''
    }
  }

  const getProductParentCategoryId = (product: Product) => {
    if (!Array.isArray(product.category_ids)) return null
    const parent = product.category_ids.find((cat) => Number(cat.position) === 1)
    return parent?.id || product.category_ids[0]?.id || null
  }

  const getCategoryById = (categoryId: string | number | null) => {
    if (!categoryId) return null
    return categories.find((cat) => Number(cat.id) === Number(categoryId)) || null
  }

  const getProductOrderUrl = (product: Product) => {
    if (!product?.id) return ORDER_URL
    const parentCategoryId = getProductParentCategoryId(product)
    if (!parentCategoryId) return ORDER_URL
    const category = getCategoryById(parentCategoryId)
    const categoryName = category?.name || 'Menu'
    const categoryImage = category?.banner_image || category?.image || ''
    const params = new URLSearchParams()
    params.set('id', String(parentCategoryId))
    params.set('name', categoryName)
    const encodedImage = encodeBase64(categoryImage)
    if (encodedImage) {
      params.set('img', encodedImage)
    }
    params.set('product_id', String(product.id))
    return `${ORDER_URL}/category?${params.toString()}`
  }

  // Fetch hero + combos
  useEffect(() => {
    fetch(`${API_BASE}/api/menu-hero/active`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setMenuHero(d.data) })
      .catch(() => {})
    fetch(`${API_BASE}/api/menu-combos/active`)
      .then(r => r.json())
      .then(d => { if (d.success) setCombos(d.data || []) })
      .catch(() => {})
  }, [])

  // Fetch all categories + all products on mount (single run)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoadingProducts(true)
      try {
        const res = await fetch(`${API_BASE}/api/store-menu/categories`)
        const json = await res.json()
        if (!json.success || !json.data?.length) {
          if (!cancelled) {
            setApiFailed(true)
            setApiMessage(json.message || 'Live menu is available on our ordering platform.')
          }
          return
        }
        const flat: Category[] = []
        json.data.forEach((cat: Category) => {
          flat.push(cat)
          const children = cat.children || cat.childes || []
          if (children?.length) flat.push(...children)
        })
        if (cancelled) return
        setCategories(flat)

        // Fetch products for all categories in parallel
        const results = await Promise.all(
          flat.map(cat =>
            fetch(`${API_BASE}/api/store-menu/products/${cat.id}`)
              .then(r => r.json())
              .then(j => ({ catId: cat.id, products: (j.success ? j.data : []) as Product[] }))
              .catch(() => ({ catId: cat.id, products: [] as Product[] }))
          )
        )
        if (cancelled) return

        const map: Record<number, Product[]> = {}
        const seen = new Set<number>()
        const merged: Product[] = []
        for (const { catId, products } of results) {
          map[catId] = products
          for (const p of products) {
            if (!seen.has(p.id)) { seen.add(p.id); merged.push(p) }
          }
        }
        setCategoryProductsMap(map)
        setAllProducts(merged)
      } catch {
        if (!cancelled) {
          setApiFailed(true)
          setApiMessage('Could not connect to menu service.')
        }
      } finally {
        if (!cancelled) {
          setLoadingCats(false)
          setLoadingProducts(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Base list for selected category
  const baseProducts = useMemo(() => {
    if (selectedCatId === 'all') return allProducts
    return categoryProductsMap[selectedCatId as number] || []
  }, [selectedCatId, allProducts, categoryProductsMap])

  // Apply all filters + sort
  const filtered = useMemo(() => {
    let list = baseProducts.filter(p => {
      const q = searchTerm.toLowerCase()
      const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
      const price = Number(p.price || 0)
      const matchPrice = matchesPrice(price, priceFilter)
      const matchVeg = vegFilter === 'all' || (vegFilter === 'veg' && p.product_type === 'veg') || (vegFilter === 'available' && p.is_available)
      return matchSearch && matchPrice && matchVeg
    })
    if (sortBy === 'price_asc') list = [...list].sort((a, b) => Number(a.price) - Number(b.price))
    else if (sortBy === 'price_desc') list = [...list].sort((a, b) => Number(b.price) - Number(a.price))
    else if (sortBy === 'name_asc') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [baseProducts, searchTerm, priceFilter, vegFilter, sortBy])

  const hasActiveFilters = searchTerm !== '' || priceFilter !== 'all' || vegFilter !== 'all' || sortBy !== 'popular'

  const clearFilters = () => {
    setSearchTerm('')
    setPriceFilter('all')
    setVegFilter('all')
    setSortBy('popular')
  }

  const selectedCatName = selectedCatId === 'all'
    ? 'All Products'
    : categories.find(c => c.id === selectedCatId)?.name || 'Products'

  /* ─── SIDEBAR ─────────────────────────────────────────────────── */
  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Search */}
      <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Search</p>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#8B5A3C' }} />
          <input
            type="text"
            placeholder="Dishes, coffee, desserts…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', background: '#FBF4EC', border: '1px solid #E6C7A8', borderRadius: 100, padding: '0.6rem 0.9rem 0.6rem 2.2rem', fontSize: '0.82rem', color: '#3D1F0D', outline: 'none', boxSizing: 'border-box' }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <X style={{ width: 13, height: 13, color: '#9B6B50' }} />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Categories</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {/* All */}
          <button
            onClick={() => setSelectedCatId('all')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', borderRadius: 14, padding: '0.62rem 0.9rem', fontSize: '0.82rem', fontWeight: 700, textAlign: 'left', cursor: 'pointer', border: selectedCatId === 'all' ? '1.5px solid #C9943A' : '1px solid transparent', background: selectedCatId === 'all' ? 'linear-gradient(135deg,#3D1F0D,#6B3520)' : 'transparent', color: selectedCatId === 'all' ? '#FFF7ED' : '#3D1F0D', transition: 'all 0.18s' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: selectedCatId === 'all' ? 'rgba(255,247,237,0.18)' : '#F6E6D1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Coffee style={{ width: 13, height: 13, color: selectedCatId === 'all' ? '#F6D58D' : '#C9943A' }} />
              </span>
              All Products
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, background: selectedCatId === 'all' ? 'rgba(255,247,237,0.18)' : '#F6E6D1', color: selectedCatId === 'all' ? '#F6D58D' : '#9B6B50', borderRadius: 20, padding: '0.15rem 0.5rem', flexShrink: 0 }}>{allProducts.length}</span>
          </button>
          {/* Dynamic cats */}
          {loadingCats
            ? [...Array(5)].map((_, i) => <div key={i} style={{ height: 42, borderRadius: 14, background: '#E6C7A8', opacity: 0.35 + i * 0.07 }} />)
            : categories.map(cat => {
                const isActive = selectedCatId === cat.id
                const count = categoryProductsMap[cat.id]?.length ?? 0
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', borderRadius: 14, padding: '0.62rem 0.9rem', fontSize: '0.82rem', fontWeight: 700, textAlign: 'left', cursor: 'pointer', border: isActive ? '1.5px solid #C9943A' : '1px solid transparent', background: isActive ? 'linear-gradient(135deg,#3D1F0D,#6B3520)' : 'transparent', color: isActive ? '#FFF7ED' : '#3D1F0D', transition: 'all 0.18s' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                      <span style={{ width: 28, height: 28, borderRadius: '50%', background: isActive ? 'rgba(255,247,237,0.18)' : '#F6E6D1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Coffee style={{ width: 13, height: 13, color: isActive ? '#F6D58D' : '#C9943A' }} />
                      </span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                    </span>
                    {count > 0 && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, background: isActive ? 'rgba(255,247,237,0.18)' : '#F6E6D1', color: isActive ? '#F6D58D' : '#9B6B50', borderRadius: 20, padding: '0.15rem 0.5rem', flexShrink: 0 }}>{count}</span>
                    )}
                  </button>
                )
              })
          }
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Price Range</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {PRICE_RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setPriceFilter(r.value)}
              style={{ textAlign: 'left', borderRadius: 10, padding: '0.5rem 0.85rem', fontSize: '0.8rem', fontWeight: priceFilter === r.value ? 800 : 600, cursor: 'pointer', border: priceFilter === r.value ? '1.5px solid #C9943A' : '1px solid transparent', background: priceFilter === r.value ? '#FFF3E0' : 'transparent', color: priceFilter === r.value ? '#8B4A2F' : '#6B3520', transition: 'all 0.15s' }}
            >{r.label}</button>
          ))}
        </div>
      </div>

      {/* Food Type */}
      <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Food Type</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {[{ label: 'All Items', value: 'all' }, { label: 'Veg Only', value: 'veg' }, { label: 'Available Now', value: 'available' }].map(f => (
            <button
              key={f.value}
              onClick={() => setVegFilter(f.value)}
              style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 10, padding: '0.5rem 0.85rem', fontSize: '0.8rem', fontWeight: vegFilter === f.value ? 800 : 600, cursor: 'pointer', border: vegFilter === f.value ? '1.5px solid #C9943A' : '1px solid transparent', background: vegFilter === f.value ? '#FFF3E0' : 'transparent', color: vegFilter === f.value ? '#8B4A2F' : '#6B3520', transition: 'all 0.15s' }}
            >
              {f.value === 'veg' && <Leaf style={{ width: 12, height: 12, color: '#256029', flexShrink: 0 }} />}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Sort By</p>
        <div style={{ position: 'relative' }}>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ width: '100%', appearance: 'none', background: '#FBF4EC', border: '1px solid #E6C7A8', borderRadius: 12, padding: '0.6rem 2rem 0.6rem 0.9rem', fontSize: '0.82rem', color: '#3D1F0D', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
          >
            {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9B6B50', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: 100, padding: '0.65rem', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', border: '1.5px solid #E6C7A8', background: '#FFF7ED', color: '#8B4A2F', transition: 'all 0.18s' }}
        >
          <X style={{ width: 13, height: 13 }} /> Clear Filters
        </button>
      )}
    </div>
  )

  /* ─── PRODUCT CARD ────────────────────────────────────────────── */
  const ProductCard = ({ product }: { product: Product }) => (
    <div
      style={{ display: 'flex', flexDirection: 'column', borderRadius: 26, background: '#fff', border: '1px solid #E6C7A8', boxShadow: '0 4px 18px rgba(61,31,13,0.06)', overflow: 'hidden', transition: 'all 0.25s', opacity: product.is_available ? 1 : 0.72 }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 44px rgba(61,31,13,0.13)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 18px rgba(61,31,13,0.06)' }}
    >
      {/* Image area */}
      <div style={{ position: 'relative', height: 190, flexShrink: 0, overflow: 'hidden' }}>
        {product.image_url ? (
          <a
            href={getProductOrderUrl(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            style={{ display: 'block', width: '100%', height: '100%' }}
          >
            <img
              src={product.image_url}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }}
              onError={e => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                const next = e.currentTarget.parentElement?.nextElementSibling as HTMLElement | null
                if (next) next.style.display = 'flex'
              }}
            />
          </a>
        ) : null}
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#3D1F0D,#8B4A2F,#C9943A)', display: product.image_url ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', position: product.image_url ? 'absolute' : 'relative', inset: 0 }}>
          <Coffee style={{ width: 48, height: 48, opacity: 0.28, color: '#FFF7ED' }} />
        </div>
        {/* Overlay badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: '0.4rem', flexWrap: 'wrap', pointerEvents: 'none' }}>
          {product.product_type === 'veg' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(230,244,234,0.95)', color: '#256029', borderRadius: 20, padding: '0.2rem 0.55rem', fontSize: '0.68rem', fontWeight: 800, backdropFilter: 'blur(4px)' }}>
              <Leaf style={{ width: 11, height: 11 }} /> Veg
            </span>
          )}
          {!product.is_available && (
            <span style={{ background: 'rgba(254,242,242,0.95)', color: '#b91c1c', borderRadius: 20, padding: '0.2rem 0.55rem', fontSize: '0.68rem', fontWeight: 800, backdropFilter: 'blur(4px)' }}>Unavailable</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '1rem 1.1rem 1.1rem' }}>
        <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#2A120B', lineHeight: 1.35, marginBottom: '0.4rem' }}>
          <a
            href={getProductOrderUrl(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {product.name}
          </a>
        </h3>
        <p style={{ fontSize: '0.75rem', color: '#7A5A48', lineHeight: 1.65, flex: 1, marginBottom: '0.9rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {product.description?.trim() || 'Freshly prepared Big Bean Café favourite.'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#8B4A2F', fontFamily: 'inherit' }}>{product.display_price}</span>
          <a
            href={getProductOrderUrl(product)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: product.is_available ? '#3D1F0D' : '#C9B8AD', color: '#FFF7ED', borderRadius: 100, padding: '0.52rem 1.1rem', fontSize: '0.7rem', fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 0.18s', pointerEvents: product.is_available ? 'auto' : 'none' }}
          >
            Order <ArrowRight style={{ width: 11, height: 11 }} />
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#FBF4EC' }}>
      <Header />

      <main>
        {/* ── HERO ──────────────────────────────────────────────── */}
        <section style={{ position: 'relative', minHeight: 420, display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg,#120905 0%,#2A120B 50%,#5C2E12 100%)', overflow: 'hidden', padding: '4.5rem 0' }}>
          {/* Background image from admin */}
          {menuHero?.image && (() => { const img = getImg(menuHero.image); return img ? <img src={img} alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.22, zIndex: 0 }} /> : null })()}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(201,148,58,0.08) 1px,transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none', zIndex: 1 }} />
          <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,148,58,0.12),transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 1400, margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '3rem', alignItems: 'center' }}>
            {/* Left */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,148,58,0.15)', border: '1px solid rgba(201,148,58,0.35)', borderRadius: 100, padding: '0.38rem 1rem', marginBottom: '1.4rem' }}>
                <Coffee style={{ width: 13, height: 13, color: '#C9943A' }} />
                <span style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.22em', color: '#F3D59B', textTransform: 'uppercase' }}>{menuHero?.eyebrow || 'Big Bean Café Menu'}</span>
              </div>
              <h1 className="font-heading" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 900, color: '#FFF7ED', lineHeight: 1.08, marginBottom: '1.1rem' }}>
                {menuHero?.title || 'Crafted Coffee, Fresh Food'}
                {(menuHero?.highlight_text) && (
                  <span style={{ display: 'block', background: 'linear-gradient(90deg,#F6D58D,#C9943A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{menuHero.highlight_text}</span>
                )}
                {!menuHero && <span style={{ display: 'block', background: 'linear-gradient(90deg,#F6D58D,#C9943A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>&amp; Café Favourites</span>}
              </h1>
              <p style={{ fontSize: '0.95rem', color: '#C7A489', lineHeight: 1.75, maxWidth: 480, marginBottom: '1.8rem' }}>
                {menuHero?.subtitle || 'Explore our live menu with handcrafted beverages, fresh bites, desserts and signature Big Bean Café favourites.'}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a href={menuHero?.button_primary_url || ORDER_URL} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#C9943A', color: '#120905', borderRadius: 100, padding: '0.78rem 1.65rem', fontSize: '0.74rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em', boxShadow: '0 10px 28px rgba(201,148,58,0.32)', transition: 'all 0.22s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F6D58D'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#C9943A'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                  <ShoppingBag style={{ width: 14, height: 14 }} /> {menuHero?.button_primary_text || 'Order Online'}
                </a>
                <a href={menuHero?.button_secondary_url || '#menu-section'}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: '#fff', borderRadius: 100, padding: '0.78rem 1.65rem', fontSize: '0.74rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em', border: '1.5px solid rgba(255,255,255,0.28)', transition: 'all 0.22s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                  {menuHero?.button_secondary_text || 'View Menu Items'} <ArrowRight style={{ width: 13, height: 13 }} />
                </a>
              </div>
            </div>
            {/* Right — hero image or gradient card */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {menuHero?.image && getImg(menuHero.image) ? (
                <div style={{ width: '100%', maxWidth: 360, aspectRatio: '4/3', borderRadius: 28, overflow: 'hidden', boxShadow: '0 32px 80px rgba(18,9,5,0.45)', border: '1px solid rgba(201,148,58,0.22)' }}>
                  <img src={getImg(menuHero.image)!} alt={menuHero.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ width: '100%', maxWidth: 340, aspectRatio: '4/3', borderRadius: 32, background: 'linear-gradient(135deg,rgba(201,148,58,0.18),rgba(92,46,18,0.35))', border: '1px solid rgba(201,148,58,0.28)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 32px 80px rgba(18,9,5,0.3)' }}>
                  <Coffee style={{ width: 72, height: 72, color: 'rgba(201,148,58,0.45)' }} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── TRUST STRIP ─────────────────────────────────────── */}
        <style>{`
          @media (max-width: 900px) { .menu-trust-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
          @media (max-width: 520px) { .menu-trust-grid { grid-template-columns: 1fr !important; padding: 0.8rem !important; border-radius: 22px !important; } .menu-trust-card { padding: 0.85rem !important; } }
        `}</style>
        <section style={{ maxWidth: 1280, margin: '-2rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 5 }}>
          <div
            className="menu-trust-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', background: '#FFF7ED', border: '1px solid #E6C7A8', borderRadius: 28, padding: '1rem', boxShadow: '0 18px 50px rgba(61,31,13,0.10)' }}
          >
            {[
              { icon: Coffee, title: 'Freshly Brewed Coffee' },
              { icon: Leaf, title: 'Handcrafted Every Day' },
              { icon: Star, title: 'Signature Café Favourites' },
              { icon: BadgeCheck, title: 'Premium Quality Ingredients' },
            ].map(({ icon: Icon, title }) => (
              <div key={title} className="menu-trust-card"
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: 20, padding: '1rem', background: 'linear-gradient(135deg,#FFFFFF 0%,#FFF3E0 100%)', border: '1px solid rgba(201,148,58,0.22)' }}>
                <span style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(201,148,58,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 19, height: 19, color: '#C9943A' }} />
                </span>
                <span style={{ fontSize: '0.86rem', fontWeight: 900, color: '#3D1F0D', lineHeight: 1.25 }}>{title}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── MENU SECTION ──────────────────────────────────────── */}
        <section id="menu-section" style={{ maxWidth: 1400, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>

          {/* API failure */}
          {apiFailed && !loadingCats && (
            <div style={{ borderRadius: 24, border: '1px solid #E6C7A8', background: '#fff', padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem' }}>
              <AlertCircle style={{ width: 48, height: 48, margin: '0 auto 1rem', color: '#C9943A' }} />
              <h2 className="font-heading" style={{ fontSize: '1.2rem', fontWeight: 900, color: '#3D1F0D', marginBottom: '0.5rem' }}>Full live menu available online</h2>
              <p style={{ fontSize: '0.88rem', color: '#8B5A3C', marginBottom: '1.5rem' }}>{apiMessage}</p>
              <a href={ORDER_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#3D1F0D', color: '#FFF7ED', borderRadius: 100, padding: '0.78rem 1.8rem', fontSize: '0.8rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase' }}>
                <ShoppingBag style={{ width: 15, height: 15 }} /> Order Online
              </a>
            </div>
          )}

          {!apiFailed && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '1.75rem' }} className="lg:grid-cols-menu">

              {/* ── Mobile filter bar ─────────────────────────── */}
              <div className="lg:hidden" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.25rem' }}>
                <button
                  onClick={() => setMobileFiltersOpen(v => !v)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderRadius: 100, padding: '0.55rem 1.1rem', fontSize: '0.76rem', fontWeight: 800, background: mobileFiltersOpen ? '#3D1F0D' : '#fff', color: mobileFiltersOpen ? '#FFF7ED' : '#3D1F0D', border: '1px solid #E6C7A8', cursor: 'pointer', transition: 'all 0.18s' }}
                >
                  <SlidersHorizontal style={{ width: 13, height: 13 }} /> Filters {hasActiveFilters && '•'}
                </button>
                {/* Category chips on mobile */}
                {!loadingCats && (
                  <div className="custom-menu-scroll" style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', flex: 1, paddingBottom: 4 }}>
                    <button
                      onClick={() => setSelectedCatId('all')}
                      style={{ flexShrink: 0, borderRadius: 100, padding: '0.45rem 0.9rem', fontSize: '0.74rem', fontWeight: 700, background: selectedCatId === 'all' ? '#3D1F0D' : '#fff', color: selectedCatId === 'all' ? '#FFF7ED' : '#3D1F0D', border: '1px solid #E6C7A8', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                    >All</button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCatId(cat.id)}
                        style={{ flexShrink: 0, borderRadius: 100, padding: '0.45rem 0.9rem', fontSize: '0.74rem', fontWeight: 700, background: selectedCatId === cat.id ? '#3D1F0D' : '#fff', color: selectedCatId === cat.id ? '#FFF7ED' : '#3D1F0D', border: '1px solid #E6C7A8', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                      >{cat.name}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile filters panel */}
              {mobileFiltersOpen && (
                <div className="lg:hidden" style={{ background: '#FFF7ED', border: '1px solid #E6C7A8', borderRadius: 24, padding: '1.5rem', marginBottom: '0.25rem' }}>
                  <SidebarContent />
                </div>
              )}

              {/* ── Desktop layout wrapper ─────────────────────── */}
              <div style={{ display: 'grid', gap: '1.75rem' }} className="lg:grid-cols-sidebar">

                {/* LEFT SIDEBAR — desktop only, sticky + independent scroll */}
                <div className="hidden lg:block">
                  <div className="custom-menu-scroll" style={{ position: 'sticky', top: 100, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', background: '#FFF7ED', border: '1px solid #E6C7A8', borderRadius: 28, boxShadow: '0 4px 20px rgba(61,31,13,0.06)', display: 'flex', flexDirection: 'column' }}>
                    {/* Fixed top: title + search */}
                    <div style={{ padding: '1.5rem 1.5rem 0.75rem', flexShrink: 0 }}>
                      <p className="font-heading" style={{ fontSize: '1rem', fontWeight: 900, color: '#3D1F0D', marginBottom: '1.2rem' }}>Browse Menu</p>
                      {/* Search inline */}
                      <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#8B5A3C' }} />
                        <input type="text" placeholder="Dishes, coffee, desserts…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                          style={{ width: '100%', background: '#FBF4EC', border: '1px solid #E6C7A8', borderRadius: 100, padding: '0.6rem 2.2rem 0.6rem 2.2rem', fontSize: '0.82rem', color: '#3D1F0D', outline: 'none', boxSizing: 'border-box' }} />
                        {searchTerm && (
                          <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                            <X style={{ width: 13, height: 13, color: '#9B6B50' }} />
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Category label */}
                    <div style={{ padding: '0.5rem 1.5rem 0.4rem', flexShrink: 0 }}>
                      <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', color: '#C9943A', textTransform: 'uppercase' }}>Categories</p>
                    </div>
                    {/* Category list */}
                    <div style={{ padding: '0 1.2rem 0 1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingBottom: '0.5rem' }}>
                        <button onClick={() => setSelectedCatId('all')}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', borderRadius: 14, padding: '0.62rem 0.9rem', fontSize: '0.82rem', fontWeight: 700, textAlign: 'left', cursor: 'pointer', border: selectedCatId === 'all' ? '1.5px solid #C9943A' : '1px solid transparent', background: selectedCatId === 'all' ? 'linear-gradient(135deg,#3D1F0D,#6B3520)' : 'transparent', color: selectedCatId === 'all' ? '#FFF7ED' : '#3D1F0D', transition: 'all 0.18s' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{ width: 28, height: 28, borderRadius: '50%', background: selectedCatId === 'all' ? 'rgba(255,247,237,0.18)' : '#F6E6D1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Coffee style={{ width: 13, height: 13, color: selectedCatId === 'all' ? '#F6D58D' : '#C9943A' }} />
                            </span>
                            All Products
                          </span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, background: selectedCatId === 'all' ? 'rgba(255,247,237,0.18)' : '#F6E6D1', color: selectedCatId === 'all' ? '#F6D58D' : '#9B6B50', borderRadius: 20, padding: '0.15rem 0.5rem', flexShrink: 0 }}>{allProducts.length}</span>
                        </button>
                        {loadingCats
                          ? [...Array(5)].map((_, i) => <div key={i} style={{ height: 42, borderRadius: 14, background: '#E6C7A8', opacity: 0.35 + i * 0.07 }} />)
                          : categories.map(cat => {
                              const isActive = selectedCatId === cat.id
                              const count = categoryProductsMap[cat.id]?.length ?? 0
                              return (
                                <button key={cat.id} onClick={() => setSelectedCatId(cat.id)}
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', borderRadius: 14, padding: '0.62rem 0.9rem', fontSize: '0.82rem', fontWeight: 700, textAlign: 'left', cursor: 'pointer', border: isActive ? '1.5px solid #C9943A' : '1px solid transparent', background: isActive ? 'linear-gradient(135deg,#3D1F0D,#6B3520)' : 'transparent', color: isActive ? '#FFF7ED' : '#3D1F0D', transition: 'all 0.18s' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: isActive ? 'rgba(255,247,237,0.18)' : '#F6E6D1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      <Coffee style={{ width: 13, height: 13, color: isActive ? '#F6D58D' : '#C9943A' }} />
                                    </span>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                                  </span>
                                  {count > 0 && (
                                    <span style={{ fontSize: '0.68rem', fontWeight: 700, background: isActive ? 'rgba(255,247,237,0.18)' : '#F6E6D1', color: isActive ? '#F6D58D' : '#9B6B50', borderRadius: 20, padding: '0.15rem 0.5rem', flexShrink: 0 }}>{count}</span>
                                  )}
                                </button>
                              )
                            })
                        }
                      </div>
                    </div>
                    {/* Rest: price, food type, sort, clear */}
                    <div style={{ padding: '0.75rem 1.5rem 1.5rem', borderTop: '1px solid #E6C7A8' }}>
                      {/* Price Range */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Price Range</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          {PRICE_RANGES.map(r => (
                            <button key={r.value} onClick={() => setPriceFilter(r.value)}
                              style={{ textAlign: 'left', borderRadius: 10, padding: '0.45rem 0.85rem', fontSize: '0.8rem', fontWeight: priceFilter === r.value ? 800 : 600, cursor: 'pointer', border: priceFilter === r.value ? '1.5px solid #C9943A' : '1px solid transparent', background: priceFilter === r.value ? '#FFF3E0' : 'transparent', color: priceFilter === r.value ? '#8B4A2F' : '#6B3520', transition: 'all 0.15s' }}>
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Food Type */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Food Type</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          {[{ label: 'All Items', value: 'all' }, { label: 'Veg Only', value: 'veg' }, { label: 'Available Now', value: 'available' }].map(f => (
                            <button key={f.value} onClick={() => setVegFilter(f.value)}
                              style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 10, padding: '0.45rem 0.85rem', fontSize: '0.8rem', fontWeight: vegFilter === f.value ? 800 : 600, cursor: 'pointer', border: vegFilter === f.value ? '1.5px solid #C9943A' : '1px solid transparent', background: vegFilter === f.value ? '#FFF3E0' : 'transparent', color: vegFilter === f.value ? '#8B4A2F' : '#6B3520', transition: 'all 0.15s' }}>
                              {f.value === 'veg' && <Leaf style={{ width: 12, height: 12, color: '#256029', flexShrink: 0 }} />}
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Sort */}
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Sort By</p>
                        <div style={{ position: 'relative' }}>
                          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                            style={{ width: '100%', appearance: 'none', background: '#FBF4EC', border: '1px solid #E6C7A8', borderRadius: 12, padding: '0.6rem 2rem 0.6rem 0.9rem', fontSize: '0.82rem', color: '#3D1F0D', fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
                            {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                          <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9B6B50', pointerEvents: 'none' }} />
                        </div>
                      </div>
                      {/* Clear */}
                      {hasActiveFilters && (
                        <button onClick={clearFilters}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: 100, padding: '0.6rem', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', border: '1.5px solid #E6C7A8', background: '#FFF7ED', color: '#8B4A2F', width: '100%', transition: 'all 0.18s' }}>
                          <X style={{ width: 13, height: 13 }} /> Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT — product area */}
                <div>
                  {/* ── Combo Banner ────────────────────────────── */}
                  {combos.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
                      {combos.map(combo => {
                        const comboImg = getImg(combo.image)
                        const price = Number(combo.price)
                        const mrp = combo.mrp ? Number(combo.mrp) : null
                        const discount = mrp && mrp > price ? Math.round((1 - price / mrp) * 100) : null
                        return (
                          <div key={combo.id}
                            style={{ borderRadius: 28, background: 'linear-gradient(135deg,#1A0D07 0%,#3D1F0D 55%,#6B3520 100%)', border: '1px solid rgba(201,148,58,0.28)', overflow: 'hidden', display: 'grid', gridTemplateColumns: comboImg ? '1fr auto' : '1fr', boxShadow: '0 8px 32px rgba(18,9,5,0.18)', transition: 'all 0.25s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 18px 48px rgba(18,9,5,0.28)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(18,9,5,0.18)' }}>
                            {/* Left content */}
                            <div style={{ padding: '1.4rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {combo.badge_text && (
                                  <span style={{ background: '#C9943A', color: '#120905', borderRadius: 20, padding: '0.18rem 0.7rem', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{combo.badge_text}</span>
                                )}
                                {discount && (
                                  <span style={{ background: 'rgba(34,197,94,0.18)', color: '#4ade80', borderRadius: 20, padding: '0.18rem 0.7rem', fontSize: '0.65rem', fontWeight: 800 }}>Save {discount}%</span>
                                )}
                              </div>
                              <h3 className="font-heading" style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FFF7ED', lineHeight: 1.2 }}>{combo.title}</h3>
                              {combo.subtitle && <p style={{ fontSize: '0.78rem', color: '#C7A489', lineHeight: 1.5 }}>{combo.subtitle}</p>}
                              {combo.items_text && (
                                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{combo.items_text}</p>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                                <span className="font-heading" style={{ fontSize: '1.5rem', fontWeight: 900, color: '#F6D58D' }}>₹{price.toFixed(0)}</span>
                                {mrp && <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>₹{mrp.toFixed(0)}</span>}
                                <a href={combo.button_url || ORDER_URL} target="_blank" rel="noopener noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#C9943A', color: '#120905', borderRadius: 100, padding: '0.52rem 1.2rem', fontSize: '0.72rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 0.18s' }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F6D58D' }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#C9943A' }}>
                                  {combo.button_text || 'Order Combo'} <ArrowRight style={{ width: 11, height: 11 }} />
                                </a>
                              </div>
                            </div>
                            {/* Right image */}
                            {comboImg && (
                              <div style={{ width: 160, flexShrink: 0, overflow: 'hidden' }} className="hidden sm:block">
                                <img src={comboImg} alt={combo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Top bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div>
                      <h2 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#3D1F0D', margin: 0 }}>{selectedCatName}</h2>
                      <p style={{ fontSize: '0.76rem', color: '#9B6B50', marginTop: 2 }}>
                        {loadingProducts ? 'Loading…' : `Showing ${filtered.length} item${filtered.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {/* Sort — desktop quick access */}
                      <div style={{ position: 'relative' }} className="hidden sm:block">
                        <select
                          value={sortBy}
                          onChange={e => setSortBy(e.target.value)}
                          style={{ appearance: 'none', background: '#fff', border: '1px solid #E6C7A8', borderRadius: 100, padding: '0.5rem 2rem 0.5rem 1rem', fontSize: '0.76rem', fontWeight: 700, color: '#3D1F0D', cursor: 'pointer', outline: 'none' }}
                        >
                          {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: '#9B6B50', pointerEvents: 'none' }} />
                      </div>
                      <a href={ORDER_URL} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#3D1F0D', color: '#FFF7ED', borderRadius: 100, padding: '0.55rem 1.2rem', fontSize: '0.72rem', fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 0.18s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#6B3520' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#3D1F0D' }}>
                        <ShoppingBag style={{ width: 12, height: 12 }} /> Order Online
                      </a>
                    </div>
                  </div>

                  {/* Loading skeleton */}
                  {loadingProducts && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} style={{ borderRadius: 26, background: '#fff', border: '1px solid #E6C7A8', overflow: 'hidden' }}>
                          <div style={{ height: 190, background: 'linear-gradient(90deg,#E6C7A8 25%,#F6E6D1 50%,#E6C7A8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <div style={{ height: 14, width: '70%', background: '#E6C7A8', borderRadius: 8, opacity: 0.5 }} />
                            <div style={{ height: 11, width: '90%', background: '#E6C7A8', borderRadius: 8, opacity: 0.35 }} />
                            <div style={{ height: 11, width: '55%', background: '#E6C7A8', borderRadius: 8, opacity: 0.25 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Product grid */}
                  {!loadingProducts && filtered.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                      {filtered.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                  )}

                  {/* Empty state */}
                  {!loadingProducts && filtered.length === 0 && !loadingCats && (
                    <div style={{ borderRadius: 24, border: '1px solid #E6C7A8', background: '#fff', padding: '4rem 2rem', textAlign: 'center' }}>
                      <Coffee style={{ width: 52, height: 52, margin: '0 auto 1rem', color: '#C7A489' }} />
                      <h3 className="font-heading" style={{ fontSize: '1.1rem', fontWeight: 900, color: '#4A2518', marginBottom: '0.5rem' }}>
                        No menu items found
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#A9866F', marginBottom: '1.5rem' }}>
                        Try another category or adjust your filters.
                      </p>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={clearFilters}
                          style={{ borderRadius: 100, padding: '0.65rem 1.5rem', fontSize: '0.78rem', fontWeight: 800, background: '#FFF7ED', color: '#3D1F0D', border: '1.5px solid #E6C7A8', cursor: 'pointer' }}>
                          Clear Filters
                        </button>
                        <a href={ORDER_URL} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#3D1F0D', color: '#FFF7ED', borderRadius: 100, padding: '0.65rem 1.5rem', fontSize: '0.78rem', fontWeight: 800, textDecoration: 'none' }}>
                          <ShoppingBag style={{ width: 13, height: 13 }} /> View Full Menu Online
                        </a>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section style={{ background: 'linear-gradient(135deg,#120905 0%,#2A120B 50%,#5C2E12 100%)', padding: '4rem 2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,148,58,0.10),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Coffee style={{ width: 40, height: 40, color: '#C9943A', margin: '0 auto 1rem' }} />
            <h2 className="font-heading" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, color: '#FFF7ED', marginBottom: '0.75rem' }}>Ready to Order?</h2>
            <p style={{ fontSize: '0.95rem', color: '#C7A489', lineHeight: 1.75, marginBottom: '1.8rem' }}>
              Enjoy your favourite coffee and food from Big Bean Cafe. Order online or visit our Koramangala café today.
            </p>
            <a href={ORDER_URL} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#C9943A', color: '#120905', borderRadius: 100, padding: '0.9rem 2.2rem', fontSize: '0.82rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em', boxShadow: '0 12px 32px rgba(201,148,58,0.30)', transition: 'all 0.22s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F6D58D'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#C9943A'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
              <ShoppingBag style={{ width: 16, height: 16 }} /> Order Now
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
