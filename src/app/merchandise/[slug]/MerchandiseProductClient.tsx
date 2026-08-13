'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { addToCart } from '@/lib/cart'
import {
  ArrowLeft, BadgeCheck, Check, CreditCard, Gift, Headphones,
  Heart, Minus, Package, PackageCheck, Plus, RotateCcw, Share2,
  ShieldCheck, ShoppingBag, Star, Truck,
} from 'lucide-react'

const API_URL      = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace(/\/api$/, '')

interface ReviewData {
  average_rating: number
  total_reviews: number
  breakdown: Record<string, { count: number; percentage: number }>
  reviews: Review[]
}

interface Review {
  id: number
  customer_name: string
  rating: number
  review_title: string | null
  review_message: string
  is_verified_purchase: number
  created_at: string
}

function getImageUrl(img?: string | null): string {
  if (!img) return '/images/placeholder.jpg'
  if (img.startsWith('http')) return img
  return `${API_BASE_URL}/${img.replace(/^\/+/, '')}`
}

interface Product {
  id: number
  name: string
  slug: string
  description: string | null
  price: number
  mrp?: number | null
  original_price?: number | null
  sku: string | null
  stock: number
  stock_quantity: number
  image: string | null
  images: string | null
  category_id: number | null
  category_name: string | null
  status: string
  is_featured?: number
  weight?: string | null
  dimensions?: string | null
  tags?: string | null
}

// Reads whichever stock field the API returns
const getStockQty = (product: Product): number => {
  const raw = product?.stock_quantity ?? product?.stock ?? 0
  const qty = Number(raw)
  return Number.isFinite(qty) ? qty : 0
}

export default function MerchandiseProductClient() {
  const params    = useParams()
  const router    = useRouter()
  const slug      = params.slug as string
  const [product, setProduct]   = useState<Product | null>(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [qty, setQty]           = useState(1)
  const [added, setAdded]       = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    customer_name: '',
    customer_email: '',
    rating: 5,
    review_title: '',
    review_message: ''
  })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/merchandise/slug/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          setProduct(data.data)
          fetchReviews(data.data.id)
          try {
            const raw = localStorage.getItem('bigbean_recently_viewed_products')
            const existing: string[] = raw ? JSON.parse(raw) : []
            const updated = [data.data.slug, ...existing.filter((s: string) => s !== data.data.slug)].slice(0, 8)
            localStorage.setItem('bigbean_recently_viewed_products', JSON.stringify(updated))
          } catch {}
        }
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  const fetchReviews = async (productId: number) => {
    setReviewLoading(true)
    try {
      const res = await fetch(`${API_URL}/merchandise-reviews/product/${productId}`)
      if (!res.ok) throw new Error('Failed to fetch reviews')
      const data = await res.json()
      if (data.success) {
        setReviewData(data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setReviewLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '',
      slug: product.slug,
    }, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    
    if (!reviewForm.customer_name.trim() || !reviewForm.customer_email.trim() || !reviewForm.review_message.trim()) {
      alert('Please fill all required fields')
      return
    }
    
    setSubmittingReview(true)
    try {
      const res = await fetch(`${API_URL}/merchandise-reviews/product/${product.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      })
      const data = await res.json()
      if (data.success) {
        setReviewSubmitted(true)
        setReviewForm({
          customer_name: '',
          customer_email: '',
          rating: 5,
          review_title: '',
          review_message: ''
        })
        setShowReviewForm(false)
        setTimeout(() => setReviewSubmitted(false), 5000)
      } else {
        alert(data.message || 'Failed to submit review')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => interactive && onChange && onChange(i + 1)}
            className={`${interactive ? 'hover:scale-110 transition-transform' : ''}`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                i < rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF7ED]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#C9943A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-[#8B4A2F]">Loading product…</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-[#FFF7ED]">
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-4">
            <p className="text-6xl font-bold mb-4 text-[#E6C7A8]">404</p>
            <h1 className="text-2xl font-bold mb-2 text-[#3D1F0D]">Product Not Found</h1>
            <p className="mb-6 text-sm text-[#8B4A2F]">This product does not exist or may have been removed.</p>
            <Link href="/merchandise"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white"
              style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
              <ArrowLeft className="w-4 h-4" /> Back to Merchandise
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const images: string[] = (() => {
    try {
      const parsed = product.images ? JSON.parse(product.images) : []
      return Array.isArray(parsed) && parsed.length ? parsed : (product.image ? [product.image] : [])
    } catch {
      return product.image ? [product.image] : []
    }
  })()

  const mainImage = images[activeImg] || product.image
  const mrp = product.original_price || product.mrp
  const discount  = mrp && mrp > product.price
    ? Math.round(((mrp - product.price) / mrp) * 100)
    : null
  const tags = product.tags ? product.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const stockQty = getStockQty(product)
  const isActive = String(product?.status || '').toLowerCase() === 'active'
  const inStock = isActive && stockQty > 0

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom,#FFF7ED,#F5E6D3,#FFF7ED)' }}>
      <style>{`
        @keyframes mpFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mpFadeIn{from{opacity:0}to{opacity:1}}
        .mp-fade-up{animation:mpFadeUp .45s ease-out both}
        .mp-fade-up-1{animation:mpFadeUp .45s ease-out .05s both}
        .mp-fade-up-2{animation:mpFadeUp .45s ease-out .1s both}
        .mp-fade-up-3{animation:mpFadeUp .45s ease-out .15s both}
        .mp-fade-in{animation:mpFadeIn .5s ease-out both}
        .mp-lift{transition:transform .3s ease,box-shadow .3s ease}
        .mp-lift:hover{transform:translateY(-2px)}
        .mp-thumb-scroll{scrollbar-width:none;-ms-overflow-style:none}
        .mp-thumb-scroll::-webkit-scrollbar{display:none}
        @media(prefers-reduced-motion:reduce){
          .mp-fade-up,.mp-fade-up-1,.mp-fade-up-2,.mp-fade-up-3,.mp-fade-in{animation:none;opacity:1;transform:none}
          .mp-lift,.mp-lift:hover{transition:none;transform:none}
          .mp-img-hover{transition:none!important;transform:none!important}
        }
      `}</style>
      <Header />
      <main className="pt-9 md:pt-11 lg:pt-14 pb-12 md:pb-16">
        <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <nav className="mp-fade-in flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-[#8B4A2F] mb-6 md:mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#3D1F0D] transition-colors shrink-0">Home</Link>
            <span className="shrink-0">/</span>
            <Link href="/merchandise" className="hover:text-[#3D1F0D] transition-colors shrink-0">Merchandise</Link>
            <span className="shrink-0">/</span>
            <span className="text-[#3D1F0D] font-semibold truncate min-w-0 max-w-[160px] sm:max-w-[240px]">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[48%_52%] gap-7 md:gap-8 lg:gap-14">

            {/* ── Images ── */}
            <div className="mp-fade-up space-y-4">
              <div className="mp-lift relative rounded-[30px] overflow-hidden bg-white border border-[#E6C7A8] shadow-[0_10px_30px_-12px_rgba(61,31,13,0.14)] aspect-square p-4 sm:p-6">
                {mainImage ? (
                  <img src={getImageUrl(mainImage)} alt={product.name}
                    className="mp-img-hover w-full h-full object-contain transition-transform duration-500 ease-out hover:scale-[1.02]" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-[22px] bg-gradient-to-br from-[#3D1F0D] to-[#C9943A]">
                    <Package className="w-20 h-20 text-white/40" />
                  </div>
                )}
                {discount && (
                  <span className="mp-fade-in absolute top-4 left-4 bg-[#B42318] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
                    -{discount}% OFF
                  </span>
                )}
              </div>
              {images.length > 1 && (
                <div className="mp-thumb-scroll flex gap-2.5 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`shrink-0 w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 bg-white p-1 transition-all duration-300 ${
                        i === activeImg ? 'border-[#C9943A] shadow-md -translate-y-0.5' : 'border-[#E6C7A8] opacity-75 hover:opacity-100 hover:border-[#C9943A]/60'
                      }`}>
                      <img src={getImageUrl(img)} alt="" className="w-full h-full object-contain rounded-xl" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info ── */}
            <div className="mp-fade-up-1 space-y-5 sm:space-y-6 lg:sticky lg:top-24 self-start">
              {product.category_name && (
                <span className="mp-fade-up inline-block px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.12em] text-[#6B3520] bg-[#F5E6D3] border border-[#E6C7A8]">
                  {product.category_name}
                </span>
              )}
              <h1 className="text-[26px] sm:text-3xl lg:text-4xl xl:text-[42px] font-bold text-[#1A0D07] leading-tight break-words">{product.name}</h1>

              {/* Price */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-2xl sm:text-3xl font-black text-[#3D1F0D]">₹{product.price.toLocaleString('en-IN')}</span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-base sm:text-lg text-[#8B4A2F] line-through">₹{product.original_price.toLocaleString('en-IN')}</span>
                )}
                {discount && (
                  <span className="text-xs sm:text-sm font-black text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Stock badge */}
              {inStock && stockQty > 10 ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
                  <Check className="w-4 h-4" /> In Stock
                </div>
              ) : inStock && stockQty <= 10 ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-sm font-semibold">
                  <Package className="w-4 h-4" /> Only {stockQty} left!
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
                  <Package className="w-4 h-4" /> Out of Stock
                </div>
              )}

              {product.description && (
                <p className="max-w-xl text-[15px] text-[#5A3A22] leading-[1.8]">{product.description}</p>
              )}

              {/* Qty + Cart + Buy Now */}
              {inStock ? (
                <div className="space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center rounded-full border border-[#E6C7A8] bg-white overflow-hidden self-start">
                      <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity"
                        className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center text-[#3D1F0D] hover:bg-[#F5E6D3] active:scale-95 transition-all">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-11 sm:w-10 text-center font-black text-[#3D1F0D]">{qty}</span>
                      <button onClick={() => setQty(q => Math.min(stockQty, q + 1))} aria-label="Increase quantity"
                        className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center text-[#3D1F0D] hover:bg-[#F5E6D3] active:scale-95 transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button onClick={handleAddToCart}
                      className="flex-1 flex items-center justify-center gap-2 min-h-[50px] sm:min-h-[46px] py-3 px-6 rounded-full font-black text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] shadow-[0_10px_24px_-10px_rgba(139,74,47,0.45)]"
                      style={{ background: added ? '#16a34a' : 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                      {added ? <><Check className="w-4 h-4" /> Added!</> : <><ShoppingBag className="w-4 h-4" /> Add to Cart</>}
                    </button>
                  </div>
                  <button
                    onClick={() => { handleAddToCart(); setTimeout(() => { window.location.href = '/checkout' }, 100) }}
                    className="w-full flex items-center justify-center gap-2 min-h-[50px] sm:min-h-[46px] py-3 px-6 rounded-full font-black border-2 border-[#3D1F0D] text-[#3D1F0D] hover:bg-[#3D1F0D] hover:text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]">
                    <CreditCard className="w-4 h-4" /> Buy Now
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button disabled
                    className="flex-1 flex items-center justify-center gap-2 min-h-[50px] py-3 px-6 rounded-full font-black text-white bg-[#C7A489] opacity-60 cursor-not-allowed">
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </button>
                  <button disabled
                    className="flex-1 flex items-center justify-center gap-2 min-h-[50px] py-3 px-6 rounded-full font-black border-2 border-[#E6C7A8] text-[#C7A489] opacity-60 cursor-not-allowed">
                    <CreditCard className="w-4 h-4" /> Buy Now
                  </button>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[#E6C7A8] text-[#6B3520] bg-[#FBF4EC] break-all">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 pt-1">
                {[
                  { icon: Truck,        label: 'Free shipping over ₹500' },
                  { icon: RotateCcw,    label: 'Easy 7-day returns' },
                  { icon: ShieldCheck,  label: 'Secure checkout' },
                  { icon: Headphones,   label: 'Customer support' },
                ].map(({ icon: Icon, label }, i) => (
                  <div key={label} className={`mp-fade-up-${Math.min(i,3)} mp-lift flex items-center gap-2.5 rounded-2xl border border-[#E6C7A8] bg-white px-3.5 py-3 shadow-[0_4px_14px_-8px_rgba(61,31,13,0.1)]`}>
                    <Icon className="w-4 h-4 text-[#C9943A] shrink-0" />
                    <span className="text-xs font-semibold text-[#4A2810]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="mt-10 md:mt-14 border-t border-[#E6C7A8] pt-8 md:pt-10">
            <h2 className="mb-5 md:mb-7 text-xl md:text-2xl font-bold text-[#3D1F0D]">Product Details</h2>
            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="mp-lift rounded-[22px] border border-[#E6C7A8] bg-white/90 p-5 shadow-[0_6px_20px_-10px_rgba(61,31,13,0.1)]">
                <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-[#C9943A]">Coffee Origin</h3>
                <p className="text-sm leading-relaxed text-[#4A2810]">Sourced and roasted for the Big Bean Café coffee experience.</p>
              </div>
              <div className="mp-lift rounded-[22px] border border-[#E6C7A8] bg-white/90 p-5 shadow-[0_6px_20px_-10px_rgba(61,31,13,0.1)]">
                <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-[#C9943A]">Roast Level</h3>
                <p className="text-sm leading-relaxed text-[#4A2810]">Medium roast. As mentioned on product packaging.</p>
              </div>
              <div className="mp-lift rounded-[22px] border border-[#E6C7A8] bg-white/90 p-5 shadow-[0_6px_20px_-10px_rgba(61,31,13,0.1)]">
                <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-[#C9943A]">Brewing Guide</h3>
                <p className="text-sm leading-relaxed text-[#4A2810]">Use as per preferred brewing method. For best taste, store in an airtight container after opening.</p>
              </div>
              <div className="mp-lift rounded-[22px] border border-[#E6C7A8] bg-white/90 p-5 shadow-[0_6px_20px_-10px_rgba(61,31,13,0.1)]">
                <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-[#C9943A]">Ingredients</h3>
                <p className="text-sm leading-relaxed text-[#4A2810]">
                  {(product.category_name || '').toLowerCase().includes('coffee') ? 'Coffee' : 'See product details'}
                </p>
              </div>
              <div className="mp-lift rounded-[22px] border border-[#E6C7A8] bg-white/90 p-5 shadow-[0_6px_20px_-10px_rgba(61,31,13,0.1)]">
                <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-[#C9943A]">Specifications</h3>
                <dl className="space-y-1.5 text-sm text-[#4A2810]">
                  <div className="flex justify-between gap-3"><dt className="font-semibold shrink-0">Price</dt><dd className="text-right">₹{product.price.toLocaleString('en-IN')}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="font-semibold shrink-0">Status</dt><dd className="text-right">{inStock ? 'In Stock' : 'Out of Stock'}</dd></div>
                  {product.category_name && <div className="flex justify-between gap-3"><dt className="font-semibold shrink-0">Category</dt><dd className="text-right">{product.category_name}</dd></div>}
                  {product.sku && <div className="flex justify-between gap-3"><dt className="font-semibold shrink-0">SKU</dt><dd className="text-right break-all">{product.sku}</dd></div>}
                  {product.weight && <div className="flex justify-between gap-3"><dt className="font-semibold shrink-0">Weight</dt><dd className="text-right">{product.weight}</dd></div>}
                </dl>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="mt-10 md:mt-12 text-center">
            <Link href="/merchandise"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#E6C7A8] font-semibold text-[#3D1F0D] hover:bg-[#F5E6D3] transition-all duration-300 hover:-translate-y-0.5">
              <ArrowLeft className="w-4 h-4" /> Back to Merchandise
            </Link>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-10 md:mt-14 py-8 md:py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ background: '#fff7ea' }}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 md:mb-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3" style={{ color: '#3b1f12', fontFamily: 'var(--font-heading)' }}>Customer Reviews</h2>
                <p className="text-sm" style={{ color: '#8B4A2F' }}>Real feedback from Big Bean Café customers.</p>
              </div>

              {reviewSubmitted && (
                <div className="mp-fade-in mb-6 md:mb-8 p-4 rounded-2xl bg-green-50 border border-green-200 text-center">
                  <p className="text-green-800 font-semibold text-sm">Thank you! Your review has been submitted for approval.</p>
                </div>
              )}

              {reviewLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-[#C58B3A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm text-[#8B4A2F]">Loading reviews...</p>
                </div>
              ) : reviewData ? (
                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 lg:gap-8 items-start">
                  {/* Review Summary Card */}
                  <div className="mp-lift bg-white border border-[#ead3b5] rounded-[24px] shadow-[0_8px_24px_-12px_rgba(61,31,13,0.12)] p-5 sm:p-6">
                    <div className="text-center mb-5 sm:mb-6">
                      <div className="text-4xl font-bold mb-2" style={{ color: '#C58B3A' }}>{reviewData.average_rating}</div>
                      <div className="flex justify-center mb-2">{renderStars(Math.round(reviewData.average_rating))}</div>
                      <p className="text-sm text-gray-600">Based on {reviewData.total_reviews} reviews</p>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      {[5, 4, 3, 2, 1].map(star => {
                        const starData = reviewData.breakdown[star] || { count: 0, percentage: 0 }
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 w-3 shrink-0">{star}</span>
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden min-w-0">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${starData.percentage}%`,
                                  background: 'linear-gradient(to right, #C58B3A, #8B4513)'
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 w-10 text-right shrink-0">{starData.percentage}%</span>
                          </div>
                        )
                      })}
                    </div>
                    
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="w-full min-h-[46px] py-3 rounded-full font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                      style={{ background: 'linear-gradient(to right, #C58B3A, #8B4513)' }}
                    >
                      Write a Review
                    </button>
                  </div>

                  {/* Review List */}
                  <div className="space-y-4 min-w-0">
                    {reviewData.reviews.length > 0 ? (
                      reviewData.reviews.map((review) => (
                        <div key={review.id} className="mp-lift bg-white border border-[#ead3b5] rounded-[22px] shadow-[0_6px_18px_-10px_rgba(61,31,13,0.1)] p-4 sm:p-6">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#C58B3A] to-[#8B4513] flex items-center justify-center text-white font-bold shrink-0 text-sm sm:text-base">
                              {review.customer_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                                <h4 className="font-semibold break-words" style={{ color: '#3b1f12' }}>{review.customer_name}</h4>
                                {review.is_verified_purchase && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 shrink-0">
                                    <BadgeCheck className="w-3 h-3" />
                                    Verified Buyer
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                                {renderStars(review.rating)}
                                <span className="text-xs text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              {review.review_title && (
                                <h5 className="font-medium mb-1 break-words" style={{ color: '#3b1f12' }}>{review.review_title}</h5>
                              )}
                              <p className="text-sm text-gray-700 break-words leading-relaxed">{review.review_message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-white border border-[#ead3b5] rounded-[22px] shadow-sm">
                        <p className="text-gray-600">No reviews yet. Be the first to review this product.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No reviews yet. Be the first to review this product.</p>
                </div>
              )}

              {/* Review Form */}
              {showReviewForm && (
                <div className="mp-fade-in mt-6 md:mt-8 bg-white border border-[#ead3b5] rounded-[24px] shadow-[0_8px_24px_-12px_rgba(61,31,13,0.12)] p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6" style={{ color: '#3b1f12' }}>Write a Review</h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#3b1f12' }}>Name *</label>
                        <input
                          type="text"
                          value={reviewForm.customer_name}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, customer_name: e.target.value }))}
                          className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-[#ead3b5] focus:outline-none focus:ring-2 focus:ring-[#C58B3A]/40 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#3b1f12' }}>Email *</label>
                        <input
                          type="email"
                          value={reviewForm.customer_email}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, customer_email: e.target.value }))}
                          className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-[#ead3b5] focus:outline-none focus:ring-2 focus:ring-[#C58B3A]/40 text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#3b1f12' }}>Rating *</label>
                      {renderStars(reviewForm.rating, true, (rating) => setReviewForm(prev => ({ ...prev, rating })))}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#3b1f12' }}>Review Title</label>
                      <input
                        type="text"
                        value={reviewForm.review_title}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, review_title: e.target.value }))}
                        className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-[#ead3b5] focus:outline-none focus:ring-2 focus:ring-[#C58B3A]/40 text-sm"
                        placeholder="Summarize your experience"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#3b1f12' }}>Review Message *</label>
                      <textarea
                        value={reviewForm.review_message}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, review_message: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#ead3b5] focus:outline-none focus:ring-2 focus:ring-[#C58B3A]/40 text-sm"
                        rows={4}
                        placeholder="Share your thoughts about this product..."
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="flex-1 min-h-[48px] py-3 rounded-full font-semibold text-white transition-all duration-300 disabled:opacity-50 hover:enabled:-translate-y-0.5 active:enabled:scale-[0.98]"
                        style={{ background: 'linear-gradient(to right, #C58B3A, #8B4513)' }}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="min-h-[48px] px-6 py-3 rounded-full font-semibold border-2 transition-all duration-300 hover:-translate-y-0.5"
                        style={{ borderColor: '#C58B3A', color: '#C58B3A' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
