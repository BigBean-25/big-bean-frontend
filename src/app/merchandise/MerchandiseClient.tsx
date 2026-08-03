'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { addToCart, cartCount } from '@/lib/cart'
import {
  ArrowRight,
  Check,
  Coffee,
  CupSoda,
  FlaskConical,
  Gift,
  Heart,
  Headphones,
  Home,
  Package,
  Percent,
  RotateCcw,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  Ticket,
  Truck,
  X,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace(/\/api$/, '')

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  mrp: number | null
  rating: number | null
  image: string | null
  badge_text: string | null
  slug: string
  stock: number
  category: string | null
  category_name: string | null
  category_slug: string | null
  category_id: number | null
  status: string
}

interface Category {
  id: number
  name: string
  slug: string | null
  icon: string | null
  image: string | null
  description: string | null
}

interface Banner {
  id: number
  eyebrow: string | null
  title: string
  subtitle: string | null
  button_text: string | null
  button_url: string | null
  image: string | null
}

const getImageUrl = (img?: string | null) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

const categoryIcon = (name: string, size = 18) => {
  const n = name.toLowerCase()
  const style = { width: size, height: size }

  if (n.includes('coffee') || n.includes('bean') || n.includes('powder')) return <Coffee style={style} />
  if (n.includes('mug') || n.includes('cup')) return <CupSoda style={style} />
  if (n.includes('brew') || n.includes('tool')) return <FlaskConical style={style} />
  if (n.includes('apparel') || n.includes('shirt') || n.includes('t-shirt') || n.includes('cloth')) return <Shirt style={style} />
  if (n.includes('gift') || n.includes('hamper') || n.includes('pack')) return <Gift style={style} />
  if (n.includes('access')) return <Sparkles style={style} />

  return <Tag style={style} />
}

const createSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const getCategoryHref = (category: Category): string =>
  `/merchandise/category/${category.slug || createSlug(category.name)}`

const getProductAlt = (product: Product) => {
  const name = product.name.toLowerCase()
  if (name.includes('vienna')) return 'Big Bean Cafe Vienna Roast Coffee Powder'
  if (name.includes('signature') && name.includes('filter')) return 'Big Bean Cafe Signature Filter Coffee'
  if (name.includes('single origin')) return 'Big Bean Cafe Single Origin Coffee'
  return `Big Bean Cafe ${product.name}`
}

const SHOP_INTERNAL_LINKS = [
  { label: 'Menu', href: '/menu', external: false },
  { label: 'Offers', href: '/offers', external: false },
  { label: 'Order Online', href: 'https://bigbeancafe.store', external: true },
  { label: 'Outlets', href: '/outlets', external: false },
  { label: 'Contact', href: '/contact', external: false },
]

const safeJson = async (url: string) => {
  try {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) return { success: false, data: [] }
    return await response.json()
  } catch {
    return { success: false, data: [] }
  }
}

export default function MerchandisePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [banner, setBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [addedProductId, setAddedProductId] = useState<number | null>(null)
  const [cartCountValue, setCartCountValue] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [recentSlugs, setRecentSlugs] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('bigbean_recently_viewed_products')
      setRecentSlugs(raw ? JSON.parse(raw) : [])
    } catch {
      setRecentSlugs([])
    }
  }, [])

  useEffect(() => {
    const updateCartCount = () => setCartCountValue(cartCount())
    updateCartCount()
    window.addEventListener('bigbean-cart-updated', updateCartCount)
    window.addEventListener('storage', updateCartCount)
    return () => {
      window.removeEventListener('bigbean-cart-updated', updateCartCount)
      window.removeEventListener('storage', updateCartCount)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      const [productsRes, categoriesRes, bannersRes] = await Promise.all([
        safeJson(`${API_URL}/merchandise/active`),
        safeJson(`${API_URL}/merchandise-categories/active`),
        safeJson(`${API_URL}/merchandise-banners/active`),
      ])

      setProducts(productsRes.data || [])

      const rawCatList: Category[] = Array.isArray(categoriesRes.data) ? (categoriesRes.data as Category[]) : []
      const uniqueCategories: Category[] = Array.from(
        new Map<string, Category>(rawCatList.filter((c) => c?.name).map((c) => [c.name.trim().toLowerCase(), c])).values()
      )
      setCategories(uniqueCategories)

      const banners = bannersRes.data || []
      setBanner(banners[0] || null)

      setLoading(false)
    }

    loadData()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const search = searchTerm.trim().toLowerCase()

      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        (product.description || '').toLowerCase().includes(search) ||
        (product.category_name || product.category || '').toLowerCase().includes(search)

      const matchesCategory =
        selectedCategory === 'all' ||
        String(product.category_id || '') === selectedCategory ||
        product.category_slug === selectedCategory ||
        product.category === selectedCategory ||
        product.category_name === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, selectedCategory, searchTerm])

  const bestDeals = useMemo(() => {
    return filteredProducts
      .filter((product) => product.mrp && Number(product.mrp) > Number(product.price))
      .slice(0, 3)
  }, [filteredProducts])

  const recommendedProducts = useMemo(() => {
    const dealIds = new Set(bestDeals.map((product) => product.id))
    const productsWithoutDeals = filteredProducts.filter((product) => !dealIds.has(product.id))

    if (productsWithoutDeals.length > 0) return productsWithoutDeals
    return filteredProducts
  }, [filteredProducts, bestDeals])

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) return

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug,
    })

    setAddedProductId(product.id)
    setTimeout(() => setAddedProductId(null), 1500)
  }

  const handleBuyNow = (product: Product) => {
    if (product.stock === 0) return

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug,
    })

    router.push('/checkout')
  }

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const q = searchTerm.trim()
    if (!q) return
    router.push(`/merchandise/search?q=${encodeURIComponent(q)}`)
  }

  const getDiscount = (product: Product) => {
    if (!product.mrp || Number(product.mrp) <= Number(product.price)) return null
    return Math.round((1 - Number(product.price) / Number(product.mrp)) * 100)
  }

  const bannerImage = getImageUrl(banner?.image)

  const ProductCard = ({ product }: { product: Product }) => {
    const imageUrl = getImageUrl(product.image)
    const discount = getDiscount(product)
    const isAdded = addedProductId === product.id
    const outOfStock = product.stock === 0
    const lowStock = !outOfStock && product.stock <= 5
    const categoryName = product.category_name || product.category || 'Merchandise'

    return (
      <div className="merch-product-card group overflow-hidden rounded-[22px] border border-[#E6C7A8] bg-white shadow-[0_10px_30px_rgba(61,31,13,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(61,31,13,0.14)]">
        <div className="merch-product-image relative overflow-hidden bg-[#FFF7ED]">
          <Link href={`/merchandise/${product.slug}`} className="block h-full w-full">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={getProductAlt(product)}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFF7ED] to-[#F2DAC0]">
                <ShoppingBag className="h-11 w-11 text-[#C9943A]" />
              </div>
            )}
          </Link>

          <button
            type="button"
            aria-label="Wishlist"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#3D1F0D] shadow-md transition hover:bg-[#3D1F0D] hover:text-white"
          >
            <Heart className="h-4 w-4" />
          </button>

          {product.badge_text && (
            <span className="absolute left-3 top-3 rounded-full bg-[#C9943A] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
              {product.badge_text}
            </span>
          )}

          {discount && (
            <span className="absolute bottom-3 left-3 rounded-full bg-[#A92517] px-3 py-1 text-[10px] font-black text-white">
              -{discount}%
            </span>
          )}

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#FFF7ED]/80">
              <span className="rounded-full bg-[#3D1F0D] px-4 py-2 text-xs font-black uppercase tracking-wider text-white">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="merch-product-content">
          <p className="merch-label mb-1 uppercase tracking-[0.16em] text-[#C9943A]">
            {categoryName}
          </p>

          <Link href={`/merchandise/${product.slug}`} className="block">
            <h3 className="merch-card-title font-heading min-h-[48px]">
              {product.name}
            </h3>
          </Link>

          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= Math.round(Number(product.rating) || 4.8)

              return (
                <Star
                  key={star}
                  className="h-3 w-3"
                  fill={active ? '#C9943A' : 'transparent'}
                  color={active ? '#C9943A' : '#E6C7A8'}
                />
              )
            })}

            <span className="ml-1 text-xs font-bold text-[#9B6B50]">
              {Number(product.rating || 4.8).toFixed(1)}
            </span>

            {lowStock && (
              <span className="ml-auto rounded-full bg-[#FFF7ED] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[#A92517]">
                Low Stock
              </span>
            )}
          </div>

          <div className="mt-3 flex items-end gap-2">
            <span className="text-xl font-black text-[#3D1F0D]">
              ₹{Number(product.price).toFixed(0)}
            </span>

            {product.mrp && Number(product.mrp) > Number(product.price) && (
              <span className="pb-1 text-sm font-bold text-[#A98A74] line-through">
                ₹{Number(product.mrp).toFixed(0)}
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
            <button
              type="button"
              disabled={outOfStock}
              onClick={() => handleAddToCart(product)}
              className="flex items-center justify-center gap-2 rounded-full bg-[#3D1F0D] px-4 py-3 text-[11px] font-black uppercase tracking-wider text-white transition hover:bg-[#6B3520] disabled:cursor-not-allowed disabled:bg-[#C7A489]"
            >
              {isAdded ? (
                <>
                  <Check className="h-4 w-4" /> Added
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" /> Add
                </>
              )}
            </button>

            <button
              type="button"
              disabled={outOfStock}
              onClick={() => handleBuyNow(product)}
              className="flex items-center justify-center rounded-full border border-[#E6C7A8] px-4 py-3 text-[11px] font-black uppercase tracking-wider text-[#3D1F0D] transition hover:border-[#3D1F0D] hover:bg-[#FFF7ED] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    )
  }

  const mightAlsoLike = products.slice(0, 3)
  // Vienna Roast price is controlled from admin/database. Update price in admin if incorrect.
  const recentlyViewed = useMemo(() => {
    if (recentSlugs.length === 0) return []
    const bySlug = new Map(products.map((p) => [p.slug, p]))
    return recentSlugs.map((slug) => bySlug.get(slug)).filter(Boolean) as Product[]
  }, [products, recentSlugs])

  return (
    <div className="merchandise-page min-h-screen bg-[#F7EFE7]">
      <style>{`
        .merchandise-page{width:100%;overflow-x:clip;}
        .merchandise-page,.merchandise-page *{box-sizing:border-box;}
        .merch-hero-eyebrow{font-size:0.72rem;line-height:1;}
        .merch-hero-title{margin:1.25rem 0 0;max-width:720px;color:#3D1F0D;font-size:clamp(2.5rem,3.8vw,4.25rem);font-weight:900;line-height:0.98;letter-spacing:-0.025em;text-wrap:balance;}
        .merch-hero-subtitle{max-width:650px;margin-top:1.25rem;color:#6B3520;font-size:clamp(0.92rem,1.1vw,1.05rem);font-weight:600;line-height:1.75;}
        .merch-hero-action{min-height:46px;font-size:0.78rem;}
        .merch-section-title{margin:0;color:#3D1F0D;font-size:clamp(1.8rem,3.5vw,2.6rem);font-weight:900;line-height:1.1;letter-spacing:-0.015em;text-wrap:balance;}
        .merch-section-subtitle{margin-top:0.4rem;color:#9B6B50;font-size:0.88rem;font-weight:600;line-height:1.6;}
        .merch-subsection-title{color:#3D1F0D;font-size:clamp(1.25rem,2vw,1.55rem);font-weight:900;line-height:1.2;}
        .merch-card-title{color:#3D1F0D;font-size:1.05rem;font-weight:900;line-height:1.35;}
        .merch-label{font-size:0.72rem;font-weight:900;line-height:1.3;}
        .merch-product-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:1.4rem;}
        .merch-product-card{width:100%;min-width:0;height:100%;}
        .merch-product-image{height:250px;}
        .merch-product-content{padding:1.25rem;}
        .merch-main{width:100%;}
        .merch-layout{display:grid;gap:1.5rem;width:100%;min-width:0;}
        .merch-left-sidebar,.merch-right-sidebar,.merch-center-scroll{min-width:0;}
        .merch-sidebar-surface,.merch-right-sidebar-stack{overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;}
        .merch-sidebar-surface::-webkit-scrollbar,.merch-right-sidebar-stack::-webkit-scrollbar{display:none;}
        @media(min-width:640px){.merch-product-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
        @media(min-width:1024px){.merch-layout{grid-template-columns:240px minmax(0,1fr);}}
        @media(min-width:1280px){
          .merch-product-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:1.5rem;}
          .merchandise-page{height:100dvh;overflow:hidden;}
          .merch-main{height:100dvh;max-width:1700px;margin:0 auto;padding:1.25rem 1.5rem;overflow:hidden;}
          .merch-layout{height:100%;grid-template-columns:240px minmax(0,1fr) 300px;overflow:hidden;}
          .merch-left-sidebar,.merch-right-sidebar{height:100%;overflow:hidden;}
          .merch-sidebar-surface,.merch-right-sidebar-stack{height:100%;max-height:100%;}
          .merch-center-scroll{height:100%;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scroll-behavior:smooth;padding-right:0.35rem;scrollbar-width:thin;scrollbar-color:rgba(201,148,58,0.5) transparent;}
          .merch-center-scroll::-webkit-scrollbar{width:7px;}
          .merch-center-scroll::-webkit-scrollbar-track{background:transparent;}
          .merch-center-scroll::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(201,148,58,0.42);}
          .merch-center-scroll::-webkit-scrollbar-thumb:hover{background:rgba(201,148,58,0.65);}
        }
        @media(max-width:1279px){.merchandise-page,.merch-main,.merch-layout,.merch-center-scroll{height:auto;overflow:visible;}}
        @media(max-width:1199px){.merch-hero-title{font-size:clamp(2.5rem,5vw,3.75rem);}}
        @media(max-width:899px){.merch-hero-grid{grid-template-columns:minmax(0,1fr);}}
        @media(max-width:640px){
          .merch-hero-eyebrow{font-size:0.65rem;}
          .merch-hero-title{max-width:100%;font-size:clamp(2.15rem,11vw,3rem);line-height:1;letter-spacing:-0.02em;}
          .merch-hero-subtitle{max-width:100%;font-size:0.9rem;line-height:1.7;}
          .merch-section-title{font-size:clamp(1.7rem,8vw,2.15rem);}
          .merch-product-image{height:215px;}
          .merch-product-content{padding:1rem;}
        }
        @media(max-width:374px){.merch-hero-title{font-size:2rem;}}
        @media(min-width:1280px) and (max-height:820px){
          .merch-sidebar-surface{padding:1rem !important;}
          .merch-sidebar-surface nav{gap:0.25rem !important;}
          .merch-sidebar-surface nav a{padding-top:0.55rem !important;padding-bottom:0.55rem !important;}
          .merch-right-sidebar-stack{gap:1rem !important;}
        }
      `}</style>
      {/* Mobile shop tools bar */}
      <div className="flex items-center justify-between border-b border-[#E6C7A8] bg-[#FBF4EC] px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#3D1F0D] shadow-sm"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-black text-[#3D1F0D]">Shop</h1>
            <p className="text-[10px] font-bold text-[#9B6B50]">Merchandise</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/wishlist" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#3D1F0D] shadow-sm">
            <Heart className="h-5 w-5" />
          </Link>
          <Link href="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#3D1F0D] shadow-sm">
            <ShoppingCart className="h-5 w-5" />
            {cartCountValue > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#A92517] px-1 text-[10px] font-black text-white">
                {cartCountValue}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[260px] bg-[#FBF4EC] p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3D1F0D] text-white">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#3D1F0D]">Big Bean</h2>
                  <p className="text-[10px] font-bold text-[#9B6B50]">Shop</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#3D1F0D]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <MobileSidebarContent
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(id) => {
                setSelectedCategory(id)
                setMobileMenuOpen(false)
              }}
            />
          </div>
        </div>
      )}

      <main className="merch-main px-4 py-4 lg:px-6 lg:py-6">
        <div className="merch-layout">
          {/* Left Sidebar */}
          <aside className="merch-left-sidebar hidden lg:block">
            <div className="merch-sidebar-surface overflow-hidden rounded-[30px] border border-[#E6C7A8] bg-white p-5 shadow-[0_16px_45px_rgba(61,31,13,0.08)]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3D1F0D] text-white">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#3D1F0D]">Big Bean</h2>
                  <p className="text-xs font-bold text-[#9B6B50]">Shop</p>
                </div>
              </div>

              <nav className="space-y-2">
                <Link
                  href="/"
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[#3D1F0D] transition hover:bg-[#FFF7ED]"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>

                <h2 className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#9B6B50]">
                  Categories
                </h2>

                <Link
                  href="/merchandise"
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
                    selectedCategory === 'all'
                      ? 'bg-[#3D1F0D] text-white shadow-lg'
                      : 'text-[#3D1F0D] hover:bg-[#FFF7ED]'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  All Products
                </Link>

                {categories.map((category) => {
                  const active = selectedCategory === String(category.id)

                  return (
                    <Link
                      key={category.id}
                      href={getCategoryHref(category)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
                        active
                          ? 'bg-[#3D1F0D] text-white shadow-lg'
                          : 'text-[#3D1F0D] hover:bg-[#FFF7ED]'
                      }`}
                    >
                      {categoryIcon(category.name)}
                      {category.name}
                    </Link>
                  )
                })}

                <div className="px-4 pt-4 pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#9B6B50]">
                  My Account
                </div>

                <Link
                  href="/orders"
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[#3D1F0D] transition hover:bg-[#FFF7ED]"
                >
                  <Package className="h-4 w-4" />
                  My Orders
                </Link>

                <Link
                  href="/wishlist"
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[#3D1F0D] transition hover:bg-[#FFF7ED]"
                >
                  <Heart className="h-4 w-4" />
                  Wishlist
                </Link>

                <Link
                  href="/offers"
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[#3D1F0D] transition hover:bg-[#FFF7ED]"
                >
                  <Ticket className="h-4 w-4" />
                  Coupons
                </Link>
              </nav>

              <div className="mt-6 rounded-[26px] bg-gradient-to-br from-[#3D1F0D] via-[#6B3520] to-[#C9943A] p-5 text-white">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Special Offer</p>
                <h3 className="mt-2 text-xl font-black leading-tight">Coffee Merch Sale</h3>
                <p className="mt-2 text-sm font-medium text-white/80">Up to 30% Off</p>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="mt-4 rounded-full bg-white px-5 py-2 text-xs font-black uppercase tracking-wider text-[#3D1F0D]"
                >
                  Shop Now
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <section className="merch-center-scroll">
            {/* Top Search Bar */}
            <div className="mb-4 rounded-[28px] border border-[#E6C7A8] bg-white p-3 shadow-[0_14px_40px_rgba(61,31,13,0.07)]">
              <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9B6B50]" />
                  <input
                    type="text"
                    placeholder="Search products, coffee powder, mugs and more..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#F1D8C0] bg-[#FFF7ED] pl-11 pr-4 text-sm font-bold text-[#3D1F0D] outline-none transition placeholder:text-[#A98A74] focus:border-[#C9943A]"
                  />
                </div>
                <Link
                  href="/wishlist"
                  className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF7ED] text-[#3D1F0D] transition hover:bg-[#3D1F0D] hover:text-white sm:flex"
                >
                  <Heart className="h-5 w-5" />
                </Link>
                <Link
                  href="/cart"
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3D1F0D] text-white transition hover:bg-[#6B3520]"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCountValue > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#A92517] px-1 text-[10px] font-black text-white">
                      {cartCountValue}
                    </span>
                  )}
                </Link>
              </div>
              </form>
            </div>

            {/* Internal Links */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {SHOP_INTERNAL_LINKS.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-[#E6C7A8] bg-white px-4 py-1.5 text-xs font-black text-[#3D1F0D] transition hover:border-[#C9943A] hover:bg-[#FFF7ED]"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="inline-flex items-center rounded-full border border-[#E6C7A8] bg-white px-4 py-1.5 text-xs font-black text-[#3D1F0D] transition hover:border-[#C9943A] hover:bg-[#FFF7ED]"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* Hero Banner */}
            <div className="mb-6 overflow-hidden rounded-[34px] border border-[#E6C7A8] bg-gradient-to-br from-[#FFF7ED] via-[#F4DDC6] to-[#DDB77F] shadow-[0_20px_60px_rgba(61,31,13,0.12)]">
              <div className="merch-hero-grid grid min-h-[300px] items-center lg:grid-cols-[1.05fr_0.95fr]">
                <div className="p-7 md:p-10 lg:p-12">
                  <span className="merch-hero-eyebrow inline-flex rounded-full border border-white/60 bg-white/55 px-4 py-2 font-black uppercase tracking-[0.18em] text-[#6B3520]">
                    {banner?.eyebrow || 'New Collection'}
                  </span>

                  <h1 className="merch-hero-title font-heading">
                    {banner?.title && banner.title.trim().length > 3
                      ? banner.title
                      : 'Take the Big Bean Café Experience Home'}
                  </h1>

                  <p className="merch-hero-subtitle">
                    {banner?.subtitle ||
                      'Shop coffee beans, mugs, brewing tools, apparel, and exclusive café merchandise.'}
                  </p>

                  <Link
                    href={banner?.button_url || '/merchandise'}
                    className="merch-hero-action mt-7 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 font-black uppercase tracking-wider text-[#3D1F0D] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#3D1F0D] hover:text-white"
                  >
                    {banner?.button_text || 'Shop Now'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="relative h-[300px] lg:h-full">
                  {bannerImage ? (
                    <img
                      src={bannerImage}
                      alt={banner?.title || 'Merchandise Banner'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#3D1F0D] to-[#6B3520]">
                      <div className="text-center">
                        <Coffee className="mx-auto h-24 w-24 text-[#C9943A]" />
                        <p className="mt-4 text-sm font-black uppercase tracking-[0.24em] text-white/70">
                          Big Bean Merch
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Category Icons Row */}
            <h2 className="merch-subsection-title font-heading mb-3">Shop by Category</h2>
            <div className="mb-6 rounded-[28px] border border-[#E6C7A8] bg-white p-4 shadow-[0_14px_40px_rgba(61,31,13,0.07)]">
              <div className="flex gap-4 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`flex min-w-[105px] flex-col items-center gap-3 rounded-[22px] px-4 py-4 text-center transition ${
                    selectedCategory === 'all'
                      ? 'bg-[#3D1F0D] text-white'
                      : 'bg-[#FFF7ED] text-[#3D1F0D] hover:bg-[#F4DDC6]'
                  }`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#C9943A] shadow-sm">
                    <ShoppingBag className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-black">All</span>
                </button>

                {categories.map((category) => {
                  const active = selectedCategory === String(category.id)
                  const categoryImage = getImageUrl(category.image)

                  return (
                    <Link
                      key={category.id}
                      href={getCategoryHref(category)}
                      className={`flex min-w-[105px] flex-col items-center gap-3 rounded-[22px] px-4 py-4 text-center transition ${
                        active
                          ? 'bg-[#3D1F0D] text-white'
                          : 'bg-[#FFF7ED] text-[#3D1F0D] hover:bg-[#F4DDC6]'
                      }`}
                    >
                      <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white text-[#C9943A] shadow-sm">
                        {categoryImage ? (
                          <img src={categoryImage} alt={category.name} className="h-full w-full object-cover" />
                        ) : (
                          categoryIcon(category.name, 20)
                        )}
                      </span>
                      <span className="text-xs font-black">{category.name}</span>
                    </Link>
                  )
                })}

                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="flex min-w-[105px] flex-col items-center gap-3 rounded-[22px] bg-[#FFF7ED] px-4 py-4 text-center text-[#3D1F0D] transition hover:bg-[#F4DDC6]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#C9943A] shadow-sm">
                    <Percent className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-black">More</span>
                </button>
              </div>
            </div>

            {/* Promo Cards */}
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-[#E6C7A8] bg-[#FFE2D6] p-5 shadow-[0_12px_35px_rgba(61,31,13,0.06)]">
                <p className="text-xs font-black uppercase tracking-wider text-[#A92517]">Fresh Roast</p>
                <h3 className="mt-2 text-lg font-black text-[#3D1F0D]">Coffee Powder & Beans</h3>
                <p className="mt-1 text-sm font-semibold text-[#6B3520]">Bring café aroma home</p>
              </div>
              <div className="rounded-[24px] border border-[#E6C7A8] bg-[#EFE8D6] p-5 shadow-[0_12px_35px_rgba(61,31,13,0.06)]">
                <p className="text-xs font-black uppercase tracking-wider text-[#6B3520]">Gift Ready</p>
                <h3 className="mt-2 text-lg font-black text-[#3D1F0D]">Premium Hampers</h3>
                <p className="mt-1 text-sm font-semibold text-[#6B3520]">Perfect for coffee lovers</p>
              </div>
              <div className="rounded-[24px] border border-[#E6C7A8] bg-[#F4DFCC] p-5 shadow-[0_12px_35px_rgba(61,31,13,0.06)]">
                <p className="text-xs font-black uppercase tracking-wider text-[#C9943A]">New Arrivals</p>
                <h3 className="mt-2 text-lg font-black text-[#3D1F0D]">Mugs & Brewing Tools</h3>
                <p className="mt-1 text-sm font-semibold text-[#6B3520]">Shop daily brew essentials</p>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="merch-product-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div key={item} className="h-[410px] animate-pulse rounded-[22px] border border-[#E6C7A8] bg-white/70" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-[30px] border border-[#E6C7A8] bg-white px-6 py-20 text-center shadow-[0_14px_40px_rgba(61,31,13,0.07)]">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF7ED]">
                  <ShoppingBag className="h-9 w-9 text-[#C9943A]" />
                </div>
                <h2 className="merch-subsection-title font-heading mt-6">Merchandise collection is brewing</h2>
                <p className="mt-2 text-sm font-semibold text-[#9B6B50]">
                  New Big Bean Café products will be available soon.
                </p>
              </div>
            ) : (
              <>
                {bestDeals.length > 0 && (
                  <section className="mb-9">
                    <div className="mb-4 flex items-end justify-between">
                      <div>
                        <h2 className="merch-section-title font-heading">Our Best Sellers</h2>
                        <p className="merch-section-subtitle">Fresh picks with special pricing</p>
                      </div>
                    </div>
                    <div className="merch-product-grid">
                      {bestDeals.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <h2 className="merch-section-title font-heading">
                        {bestDeals.length > 0 ? 'Recommended for You' : 'Best Picks for You'}
                      </h2>
                      <p className="merch-section-subtitle">
                        {filteredProducts.length} products available
                      </p>
                    </div>
                  </div>
                  <div className="merch-product-grid">
                    {recommendedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Benefits */}
            <div className="mt-9 grid gap-4 rounded-[28px] border border-[#E6C7A8] bg-white p-5 shadow-[0_14px_40px_rgba(61,31,13,0.07)] md:grid-cols-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-7 w-7 text-[#C9943A]" />
                <div>
                  <h4 className="text-sm font-black text-[#3D1F0D]">Secure Payment</h4>
                  <p className="text-xs font-semibold text-[#9B6B50]">100% safe checkout</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-7 w-7 text-[#C9943A]" />
                <div>
                  <h4 className="text-sm font-black text-[#3D1F0D]">Easy Returns</h4>
                  <p className="text-xs font-semibold text-[#9B6B50]">Simple support process</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Headphones className="h-7 w-7 text-[#C9943A]" />
                <div>
                  <h4 className="text-sm font-black text-[#3D1F0D]">24/7 Support</h4>
                  <p className="text-xs font-semibold text-[#9B6B50]">Dedicated café team</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-7 w-7 text-[#C9943A]" />
                <div>
                  <h4 className="text-sm font-black text-[#3D1F0D]">Fast Delivery</h4>
                  <p className="text-xs font-semibold text-[#9B6B50]">Nearby outlet delivery</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Side Panel */}
          <aside className="merch-right-sidebar hidden xl:block">
            <div className="merch-right-sidebar-stack space-y-6">
              {/* You might also like */}
              <div className="rounded-[30px] border border-[#E6C7A8] bg-white p-5 shadow-[0_16px_45px_rgba(61,31,13,0.08)]">
                <h3 className="mb-4 text-sm font-black text-[#3D1F0D]">You might also like</h3>
                {mightAlsoLike.length > 0 ? (
                  <div className="space-y-4">
                    {mightAlsoLike.map((product) => (
                      <Link key={product.id} href={`/merchandise/${product.slug}`} className="flex items-center gap-3 group">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#FFF7ED]">
                          {getImageUrl(product.image) ? (
                            <img src={getImageUrl(product.image)!} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <ShoppingBag className="h-6 w-6 text-[#C9943A]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-[#3D1F0D] group-hover:text-[#C9943A]">{product.name}</p>
                          <p className="mt-0.5 text-xs font-black text-[#C9943A]">₹{Number(product.price).toFixed(0)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-[#9B6B50]">Add products from admin to show recommendations.</p>
                )}
              </div>

              {/* Recently Viewed */}
              <div className="rounded-[30px] border border-[#E6C7A8] bg-white p-5 shadow-[0_16px_45px_rgba(61,31,13,0.08)]">
                <h3 className="mb-4 text-sm font-black text-[#3D1F0D]">Recently Viewed</h3>
                {recentlyViewed.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {recentlyViewed.map((product) => (
                      <Link key={product.id} href={`/merchandise/${product.slug}`} className="group overflow-hidden rounded-xl bg-[#FFF7ED]">
                        {getImageUrl(product.image) ? (
                          <img src={getImageUrl(product.image)!} alt={product.name} className="h-16 w-full object-cover" />
                        ) : (
                          <div className="flex h-16 w-full items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-[#C9943A]" />
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-[#9B6B50]">Explore products to see recent views here.</p>
                )}
              </div>

              {/* Big Bean Club */}
              <div className="rounded-[30px] bg-gradient-to-br from-[#3D1F0D] via-[#6B3520] to-[#C9943A] p-5 text-white shadow-[0_16px_45px_rgba(61,31,13,0.12)]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Big Bean Club</p>
                <h3 className="mt-2 text-xl font-black leading-tight">Join Big Bean Rewards</h3>
                <p className="mt-2 text-sm font-medium text-white/80">Earn Big Coins on every order.</p>
                <Link
                  href="/app"
                  className="mt-5 inline-block rounded-full bg-white px-5 py-2 text-xs font-black uppercase tracking-wider text-[#3D1F0D] transition hover:-translate-y-0.5"
                >
                  Join Now
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function MobileSidebarContent({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: Category[]
  selectedCategory: string
  onSelectCategory: (id: string) => void
}) {
  return (
    <nav className="space-y-2">
      <Link href="/" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[#3D1F0D] transition hover:bg-[#FFF7ED]">
        <Home className="h-4 w-4" />
        Home
      </Link>

      <h2 className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#9B6B50]">Categories</h2>

      <Link
        href="/merchandise"
        onClick={() => onSelectCategory('all')}
        className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
          selectedCategory === 'all'
            ? 'bg-[#3D1F0D] text-white shadow-lg'
            : 'text-[#3D1F0D] hover:bg-[#FFF7ED]'
        }`}
      >
        <ShoppingBag className="h-4 w-4" />
        All Products
      </Link>

      {categories.map((category) => {
        const active = selectedCategory === String(category.id)

        return (
          <Link
            key={category.id}
            href={getCategoryHref(category)}
            onClick={() => onSelectCategory(String(category.id))}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
              active
                ? 'bg-[#3D1F0D] text-white shadow-lg'
                : 'text-[#3D1F0D] hover:bg-[#FFF7ED]'
            }`}
          >
            {categoryIcon(category.name)}
            {category.name}
          </Link>
        )
      })}

      <div className="px-4 pt-4 pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#9B6B50]">My Account</div>

      <Link href="/orders" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[#3D1F0D] transition hover:bg-[#FFF7ED]">
        <Package className="h-4 w-4" />
        My Orders
      </Link>
      <Link href="/wishlist" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[#3D1F0D] transition hover:bg-[#FFF7ED]">
        <Heart className="h-4 w-4" />
        Wishlist
      </Link>
      <Link href="/offers" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[#3D1F0D] transition hover:bg-[#FFF7ED]">
        <Ticket className="h-4 w-4" />
        Coupons
      </Link>
    </nav>
  )
}
