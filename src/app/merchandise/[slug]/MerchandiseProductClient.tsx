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
const API_BASE_URL = API_URL.replace('/api', '')

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
          // Fetch reviews after product is loaded
          fetchReviews(data.data.id)
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
      <Header />
      <main className="pt-[5.5rem] pb-16">
        <div className="container-custom max-w-6xl">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#8B4A2F] mb-8">
            <Link href="/" className="hover:text-[#3D1F0D] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/merchandise" className="hover:text-[#3D1F0D] transition-colors">Merchandise</Link>
            <span>/</span>
            <span className="text-[#3D1F0D] font-semibold truncate max-w-[200px]">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* ── Images ── */}
            <div className="space-y-4">
              <div className="relative rounded-[28px] overflow-hidden bg-white border border-[#E6C7A8] shadow-sm aspect-square">
                {mainImage ? (
                  <img src={getImageUrl(mainImage)} alt={product.name}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#3D1F0D] to-[#C9943A]">
                    <Package className="w-20 h-20 text-white/40" />
                  </div>
                )}
                {discount && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full">
                    -{discount}% OFF
                  </span>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                        i === activeImg ? 'border-[#C9943A] shadow-md' : 'border-[#E6C7A8] opacity-70 hover:opacity-100'
                      }`}>
                      <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info ── */}
            <div className="space-y-6">
              {product.category_name && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#6B3520] bg-[#F5E6D3] border border-[#E6C7A8]">
                  {product.category_name}
                </span>
              )}
              <h1 className="text-3xl font-bold text-[#1A0D07] leading-tight">{product.name}</h1>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-[#3D1F0D]">₹{product.price.toLocaleString('en-IN')}</span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-lg text-[#8B4A2F] line-through">₹{product.original_price.toLocaleString('en-IN')}</span>
                )}
                {discount && (
                  <span className="text-sm font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Stock badge */}
              {inStock && stockQty > 10 ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
                  <Check className="w-4 h-4" /> In Stock
                </div>
              ) : inStock && stockQty <= 10 ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-sm font-semibold">
                  <Package className="w-4 h-4" /> Only {stockQty} left!
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
                  <Package className="w-4 h-4" /> Out of Stock
                </div>
              )}

              {product.description && (
                <p className="text-[#4A2810] leading-relaxed">{product.description}</p>
              )}

              {/* Qty + Cart + Buy Now */}
              {inStock ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 rounded-full border border-[#E6C7A8] bg-white overflow-hidden">
                      <button onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="w-10 h-10 flex items-center justify-center text-[#3D1F0D] hover:bg-[#F5E6D3] transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-black text-[#3D1F0D]">{qty}</span>
                      <button onClick={() => setQty(q => Math.min(stockQty, q + 1))}
                        className="w-10 h-10 flex items-center justify-center text-[#3D1F0D] hover:bg-[#F5E6D3] transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button onClick={handleAddToCart}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full font-black text-white transition-all"
                      style={{ background: added ? '#16a34a' : 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                      {added ? <><Check className="w-4 h-4" /> Added!</> : <><ShoppingBag className="w-4 h-4" /> Add to Cart</>}
                    </button>
                  </div>
                  <button
                    onClick={() => { handleAddToCart(); setTimeout(() => { window.location.href = '/checkout' }, 100) }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full font-black border-2 border-[#3D1F0D] text-[#3D1F0D] hover:bg-[#3D1F0D] hover:text-white transition-all">
                    <CreditCard className="w-4 h-4" /> Buy Now
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button disabled
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full font-black text-white bg-[#C7A489] cursor-not-allowed">
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </button>
                  <button disabled
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full font-black border-2 border-[#E6C7A8] text-[#C7A489] cursor-not-allowed">
                    <CreditCard className="w-4 h-4" /> Buy Now
                  </button>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold border border-[#E6C7A8] text-[#6B3520] bg-[#FFF7ED]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { icon: Truck,        label: 'Free shipping over ₹500' },
                  { icon: RotateCcw,    label: 'Easy 7-day returns' },
                  { icon: ShieldCheck,  label: 'Secure checkout' },
                  { icon: Headphones,   label: 'Customer support' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 rounded-2xl border border-[#E6C7A8] bg-white px-3 py-2.5">
                    <Icon className="w-4 h-4 text-[#C9943A] shrink-0" />
                    <span className="text-xs font-semibold text-[#4A2810]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="mt-12 text-center">
            <Link href="/merchandise"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#E6C7A8] font-semibold text-[#3D1F0D] hover:bg-[#F5E6D3] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Merchandise
            </Link>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-14 md:mt-20 py-10 md:py-14" style={{ background: '#fff7ea' }}>
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#3b1f12', fontFamily: 'var(--font-heading)' }}>Customer Reviews</h2>
                <p className="text-sm" style={{ color: '#8B4A2F' }}>Real feedback from Big Bean Café customers.</p>
              </div>

              {reviewSubmitted && (
                <div className="mb-8 p-4 rounded-2xl bg-green-50 border border-green-200 text-center">
                  <p className="text-green-800 font-semibold">Thank you! Your review has been submitted for approval.</p>
                </div>
              )}

              {reviewLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-[#C58B3A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm text-[#8B4A2F]">Loading reviews...</p>
                </div>
              ) : reviewData ? (
                <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
                  {/* Review Summary Card */}
                  <div className="bg-white/80 border border-[#ead3b5] rounded-[28px] shadow-sm p-6">
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold mb-2" style={{ color: '#C58B3A' }}>{reviewData.average_rating}</div>
                      <div className="flex justify-center mb-2">{renderStars(Math.round(reviewData.average_rating))}</div>
                      <p className="text-sm text-gray-600">Based on {reviewData.total_reviews} reviews</p>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      {[5, 4, 3, 2, 1].map(star => {
                        const starData = reviewData.breakdown[star] || { count: 0, percentage: 0 }
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 w-3">{star}</span>
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${starData.percentage}%`,
                                  background: 'linear-gradient(to right, #C58B3A, #8B4513)'
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 w-10 text-right">{starData.percentage}%</span>
                          </div>
                        )
                      })}
                    </div>
                    
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="w-full py-3 rounded-full font-semibold text-white transition-all"
                      style={{ background: 'linear-gradient(to right, #C58B3A, #8B4513)' }}
                    >
                      Write a Review
                    </button>
                  </div>

                  {/* Review List */}
                  <div className="space-y-4">
                    {reviewData.reviews.length > 0 ? (
                      reviewData.reviews.map((review) => (
                        <div key={review.id} className="bg-white/80 border border-[#ead3b5] rounded-[28px] shadow-sm p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C58B3A] to-[#8B4513] flex items-center justify-center text-white font-bold">
                              {review.customer_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold" style={{ color: '#3b1f12' }}>{review.customer_name}</h4>
                                {review.is_verified_purchase && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <BadgeCheck className="w-3 h-3" />
                                    Verified Buyer
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                {renderStars(review.rating)}
                                <span className="text-xs text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              {review.review_title && (
                                <h5 className="font-medium mb-1" style={{ color: '#3b1f12' }}>{review.review_title}</h5>
                              )}
                              <p className="text-sm text-gray-700">{review.review_message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-white/80 border border-[#ead3b5] rounded-[28px] shadow-sm">
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
                <div className="mt-8 bg-white/80 border border-[#ead3b5] rounded-[28px] shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-6" style={{ color: '#3b1f12' }}>Write a Review</h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#3b1f12' }}>Name *</label>
                        <input
                          type="text"
                          value={reviewForm.customer_name}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, customer_name: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-[#ead3b5] focus:outline-none focus:ring-2 focus:ring-[#C58B3A]/40"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#3b1f12' }}>Email *</label>
                        <input
                          type="email"
                          value={reviewForm.customer_email}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, customer_email: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-[#ead3b5] focus:outline-none focus:ring-2 focus:ring-[#C58B3A]/40"
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
                        className="w-full px-4 py-2 rounded-xl border border-[#ead3b5] focus:outline-none focus:ring-2 focus:ring-[#C58B3A]/40"
                        placeholder="Summarize your experience"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#3b1f12' }}>Review Message *</label>
                      <textarea
                        value={reviewForm.review_message}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, review_message: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl border border-[#ead3b5] focus:outline-none focus:ring-2 focus:ring-[#C58B3A]/40"
                        rows={4}
                        placeholder="Share your thoughts about this product..."
                        required
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="flex-1 py-3 rounded-full font-semibold text-white transition-all disabled:opacity-50"
                        style={{ background: 'linear-gradient(to right, #C58B3A, #8B4513)' }}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-6 py-3 rounded-full font-semibold border-2 transition-all"
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
