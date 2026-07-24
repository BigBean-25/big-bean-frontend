'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import {
  ShoppingCart, ShoppingBag, ArrowRight, Plus, Minus, Trash2,
  Truck, ShieldCheck, Headphones, Tag, CheckCircle, Sparkles, PackageCheck
} from 'lucide-react'
import { getCart, updateQty, removeFromCart, addToCart, CartItem } from '@/lib/cart'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

interface MerchProduct {
  id: number
  name: string
  slug: string
  price: number | string
  sale_price?: number | null
  mrp?: number | string | null
  image?: string | null
  image_url?: string | null
  featured_image?: string | null
  main_image?: string | null
  thumbnail?: string | null
  product_image?: string | null
  images?: unknown
  gallery_images?: unknown
  status?: string
}

const getImageUrl = (img?: string | null): string | null => {
  if (!img) return null
  const clean = String(img).trim()
  if (!clean) return null
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean
  if (clean.startsWith('/uploads')) return `${API_BASE_URL}${clean}`
  if (clean.startsWith('uploads')) return `${API_BASE_URL}/${clean}`
  return `${API_BASE_URL}/${clean.replace(/^\/+/, '')}`
}

const getProductImage = (p: MerchProduct): string | null => {
  if (p.image) return p.image
  if (p.image_url) return p.image_url
  if (p.featured_image) return p.featured_image
  if (p.main_image) return p.main_image
  if (p.thumbnail) return p.thumbnail
  if (p.product_image) return p.product_image
  const imgs = p.images ?? p.gallery_images
  if (Array.isArray(imgs) && imgs.length > 0) {
    const first = imgs[0]
    if (typeof first === 'string') return first
    if (first && typeof first === 'object') {
      const f = first as Record<string, unknown>
      return (f.image ?? f.image_url ?? f.url ?? f.path ?? null) as string | null
    }
  }
  if (typeof imgs === 'string' && imgs) {
    try {
      const parsed = JSON.parse(imgs)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0]
        if (typeof first === 'string') return first
        if (first && typeof first === 'object') {
          const f = first as Record<string, unknown>
          return (f.image ?? f.image_url ?? f.url ?? f.path ?? null) as string | null
        }
      }
    } catch { return imgs }
  }
  return null
}

// ── sub-components ────────────────────────────────────────────────────────────

function ProgressStrip() {
  const steps = ['Cart', 'Checkout', 'Confirmation']
  return (
    <div className="bg-[#FFF7ED] border-b border-[#E6C7A8]">
      <div className="max-w-[1180px] mx-auto px-4 py-3 flex items-center justify-center gap-0">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-0">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                ${i === 0 ? 'bg-[#C9943A] border-[#C9943A] text-[#120905]' : 'bg-white border-[#E6C7A8] text-[#9B6B50]'}`}>
                {i === 0 ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${i === 0 ? 'text-[#C9943A]' : 'text-[#9B6B50]'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-10 sm:w-16 h-px mx-2 ${i === 0 ? 'bg-[#C9943A]' : 'bg-[#E6C7A8]'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CartItemCard({
  item, onQty, onRemove
}: {
  item: CartItem
  onQty: (id: number, qty: number) => void
  onRemove: (id: number) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const imgUrl = getImageUrl(item.image)
  const itemTotal = Number(item.price) * item.quantity

  const handleRemoveClick = () => {
    if (confirming) {
      onRemove(item.id)
      setConfirming(false)
    } else {
      setConfirming(true)
    }
  }

  return (
    <div className="bg-white rounded-[24px] border border-[#E6C7A8] shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 p-4 sm:p-5">
      <div className="flex gap-4 items-start">
        {/* Image */}
        <a href={`/merchandise/${item.slug}`} className="flex-shrink-0 group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFF7ED] to-[#F5E6D3] border border-[#E6C7A8]">
            {imgUrl ? (
              <img src={imgUrl} alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-9 h-9 text-[#C9943A] opacity-40" />
              </div>
            )}
          </div>
        </a>

        {/* Info + controls */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <a href={`/merchandise/${item.slug}`} className="no-underline">
                <h3 className="text-sm sm:text-base font-bold text-[#3D1F0D] leading-snug hover:text-[#C9943A] transition-colors line-clamp-2">
                  {item.name}
                </h3>
              </a>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#FBF4EC', color: '#8B4A2F' }}>
                  Merchandise
                </span>
                <span className="text-xs text-green-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> In stock
                </span>
              </div>
              <p className="text-xs text-[#9B6B50] mt-1">₹{Number(item.price).toFixed(0)} per item</p>
            </div>
            {/* Item total — desktop */}
            <div className="hidden sm:block text-right flex-shrink-0">
              <p className="text-lg font-black text-[#3D1F0D]">₹{itemTotal.toFixed(0)}</p>
            </div>
          </div>

          {/* Controls row */}
          <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
            {/* Qty selector */}
            <div className="inline-flex items-center border-2 border-[#E6C7A8] rounded-full overflow-hidden">
              <button
                onClick={() => onQty(item.id, item.quantity - 1)}
                className="w-8 h-8 flex items-center justify-center text-[#3D1F0D] hover:bg-[#FBF4EC] transition-colors disabled:opacity-30"
                disabled={item.quantity <= 1}
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-9 text-center text-sm font-bold text-[#3D1F0D]">{item.quantity}</span>
              <button
                onClick={() => onQty(item.id, item.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-[#3D1F0D] hover:bg-[#FBF4EC] transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Item total — mobile */}
              <span className="sm:hidden text-base font-black text-[#3D1F0D]">₹{itemTotal.toFixed(0)}</span>
              {/* Remove */}
              {confirming ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleRemoveClick}
                    className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full transition-colors"
                  >
                    Confirm Remove
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="text-xs font-semibold text-[#9B6B50] hover:text-[#3D1F0D] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRemoveClick}
                  className="flex items-center gap-1 text-xs font-semibold text-[#A92517] hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1 rounded-full transition-all"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-[#9B6B50] mt-2 flex items-center gap-1">
            <Truck className="w-3 h-3 text-[#C9943A]" /> Delivery available
          </p>
        </div>
      </div>
    </div>
  )
}

function OrderSummary({ cart, subtotal }: { cart: CartItem[]; subtotal: number }) {
  const [coupon, setCoupon] = useState('')
  const [couponMsg, setCouponMsg] = useState('')
  const itemCount = cart.reduce((s, c) => s + c.quantity, 0)

  const handleCoupon = () => {
    if (!coupon.trim()) { setCouponMsg('Please enter a coupon code.'); return }
    setCouponMsg('Coupon feature coming soon.')
    setTimeout(() => setCouponMsg(''), 3000)
  }

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="bg-white rounded-[28px] border border-[#E6C7A8] shadow-xl overflow-hidden lg:sticky lg:top-[110px]">
        <div className="px-6 py-4 border-b border-[#E6C7A8]" style={{ background: 'linear-gradient(135deg,#120905,#3D1F0D)' }}>
          <p className="text-xs font-bold tracking-widest text-[#C9943A] mb-0.5">ORDER SUMMARY</p>
          <p className="text-xs text-[#E6C7A8]">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
        </div>

        <div className="p-6 space-y-3">
          <div className="flex justify-between text-sm text-[#6B3520]">
            <span>Subtotal ({itemCount} items)</span>
            <span className="font-bold text-[#3D1F0D]">₹{subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm text-[#6B3520]">
            <span>Delivery</span>
            <span className="font-bold text-green-700">Free</span>
          </div>
          <div className="flex justify-between text-sm text-[#6B3520]">
            <span>Packaging</span>
            <span className="font-bold text-[#3D1F0D]">₹0</span>
          </div>
          <div className="flex justify-between text-sm text-[#6B3520]">
            <span>Discount</span>
            <span className="font-bold text-green-700">₹0</span>
          </div>
          <div className="h-px bg-[#E6C7A8]" />
          <div className="flex justify-between text-base font-black text-[#120905]">
            <span>Total</span>
            <span>₹{subtotal.toFixed(0)}</span>
          </div>
          <p className="text-xs text-green-700 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> You saved on delivery today!
          </p>
        </div>

        <div className="px-6 pb-6 space-y-3">
          <a href="/checkout"
            className="flex items-center justify-center gap-2 w-full bg-[#C9943A] hover:bg-[#120905] text-[#120905] hover:text-[#FFF7ED] rounded-full py-3.5 text-sm font-black uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-lg">
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </a>
          <a href="/merchandise"
            className="block text-center text-xs font-semibold text-[#9B6B50] hover:text-[#3D1F0D] transition-colors py-1">
            ← Continue Shopping
          </a>
        </div>

        {/* Trust badges */}
        <div className="border-t border-[#E6C7A8] px-6 py-4 grid grid-cols-3 gap-3">
          {[
            [ShieldCheck, 'Secure'],
            [PackageCheck, 'Quality'],
            [Headphones, 'Support'],
          ].map(([Icon, label], i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Icon className="w-4 h-4 text-[#C9943A]" />
              <span className="text-[10px] font-semibold text-[#9B6B50]">{label as string}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coupon card */}
      <div className="bg-white rounded-[24px] border border-[#E6C7A8] p-5 lg:sticky lg:top-[420px]">
        <p className="text-sm font-bold text-[#3D1F0D] flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-[#C9943A]" /> Apply Offer
        </p>
        <div className="flex gap-2">
          <input
            value={coupon}
            onChange={e => setCoupon(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 px-4 py-2.5 text-sm rounded-full border border-[#E6C7A8] bg-[#FBF4EC] text-[#3D1F0D] placeholder:text-[#C0A080] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/30"
          />
          <button
            onClick={handleCoupon}
            className="px-4 py-2.5 rounded-full text-xs font-bold text-[#120905] bg-[#C9943A] hover:bg-[#3D1F0D] hover:text-[#FFF7ED] transition-all whitespace-nowrap"
          >
            Apply
          </button>
        </div>
        {couponMsg && <p className="text-xs text-[#8B4A2F] mt-2">{couponMsg}</p>}
      </div>

      {/* Delivery promise */}
      <div className="bg-white rounded-[24px] border border-[#E6C7A8] p-5 lg:sticky lg:top-[540px]">
        <p className="text-sm font-bold text-[#3D1F0D] mb-3">Delivery &amp; Support</p>
        <div className="space-y-2.5">
          {[
            [Truck, 'Free delivery on eligible orders'],
            [PackageCheck, 'Packed with care by our team'],
            [Headphones, 'Support from Big Bean Café'],
          ].map(([Icon, text], i) => (
            <div key={i} className="flex items-center gap-3 text-xs text-[#6B3520]">
              <Icon className="w-4 h-4 text-[#C9943A] flex-shrink-0" />
              <span>{text as string}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyCart() {
  const placeholders = [
    { label: 'Coffee Mug', icon: '☕' },
    { label: 'T-Shirt', icon: '👕' },
    { label: 'Coffee Beans', icon: '🫘' },
  ]
  return (
    <div className="animate-fade-up">
      <div className="max-w-2xl mx-auto text-center py-16 px-6">
        <div className="w-28 h-28 rounded-full mx-auto mb-8 flex items-center justify-center shadow-xl"
          style={{ background: 'radial-gradient(circle,rgba(201,148,58,0.18),rgba(201,148,58,0.04))', border: '2px solid rgba(201,148,58,0.3)' }}>
          <ShoppingBag className="w-12 h-12 text-[#C9943A] animate-float-soft" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-[#3D1F0D] mb-3">
          Your cart is waiting for something special
        </h2>
        <p className="text-[#9B6B50] mb-8 text-base">
          Explore Big Bean Café merchandise and add your favourites.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <a href="/merchandise"
            className="inline-flex items-center gap-2 bg-[#C9943A] hover:bg-[#3D1F0D] text-[#120905] hover:text-[#FFF7ED] rounded-full px-7 py-3 text-sm font-black uppercase tracking-wider transition-all shadow-md">
            <ShoppingCart className="w-4 h-4" /> Shop Merchandise
          </a>
          <a href="/menu"
            className="inline-flex items-center gap-2 border-2 border-[#E6C7A8] hover:border-[#C9943A] text-[#3D1F0D] rounded-full px-7 py-3 text-sm font-bold uppercase tracking-wider transition-all">
            Explore Café Menu
          </a>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {placeholders.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E6C7A8] p-5 text-center shadow-sm">
              <p className="text-3xl mb-2">{p.icon}</p>
              <p className="text-xs font-semibold text-[#6B3520]">{p.label}</p>
              <p className="text-xs text-[#C9943A] mt-1">Big Bean Store</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RecommendedProducts({ cartIds }: { cartIds: number[] }) {
  const [products, setProducts] = useState<MerchProduct[]>([])

  useEffect(() => {
    fetch(`${API_URL}/merchandise/active`)
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data)) {
          const filtered = (d.data as MerchProduct[])
            .filter(p => !cartIds.includes(p.id))
            .slice(0, 4)
          setProducts(filtered)
        }
      })
      .catch(() => {})
  }, [cartIds.join(',')])

  if (!products.length) return null

  return (
    <section className="mt-10 mb-4">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="w-5 h-5 text-[#C9943A]" />
        <h2 className="text-lg font-bold text-[#3D1F0D]">You may also like</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(p => {
          const img = getImageUrl(getProductImage(p))
          const price = p.sale_price ?? p.price
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-[#E6C7A8] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
              <a href={`/merchandise/${p.slug}`} className="block">
                <div className="relative aspect-square bg-gradient-to-br from-[#FFF7ED] to-[#F5E6D3] overflow-hidden">
                  {img && (
                    <img
                      src={img}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { e.currentTarget.style.display = 'none'; const fb = e.currentTarget.nextElementSibling as HTMLElement | null; if (fb) fb.style.display = 'flex' }}
                    />
                  )}
                  <div
                    className="absolute inset-0 items-center justify-center bg-gradient-to-br from-[#FFF7ED] to-[#F5E6D3]"
                    style={{ display: img ? 'none' : 'flex' }}
                  >
                    <ShoppingBag className="w-10 h-10 text-[#C9943A] opacity-30" />
                  </div>
                </div>
              </a>
              <div className="p-3">
                <a href={`/merchandise/${p.slug}`} className="no-underline">
                  <p className="text-xs font-bold text-[#3D1F0D] line-clamp-2 hover:text-[#C9943A] transition-colors">{p.name}</p>
                </a>
                <p className="text-sm font-black text-[#3D1F0D] mt-1">₹{Number(price).toFixed(0)}</p>
                <div className="mt-2 flex gap-1.5">
                  <a href={`/merchandise/${p.slug}`}
                    className="flex-1 text-center text-[10px] font-bold rounded-full py-1.5 border-2 border-[#C9943A] text-[#C9943A] hover:bg-[#C9943A] hover:text-[#120905] transition-all">
                    View
                  </a>
                  <button
                    onClick={() => {
                      addToCart({ id: p.id, name: p.name, price: Number(price), image: getProductImage(p), slug: p.slug })
                      window.dispatchEvent(new Event('bigbean-cart-updated'))
                    }}
                    className="flex-1 text-[10px] font-bold rounded-full py-1.5 bg-[#3D1F0D] text-[#FFF7ED] hover:bg-[#C9943A] hover:text-[#120905] transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function MobileCheckoutBar({ subtotal, itemCount }: { subtotal: number; itemCount: number }) {
  if (itemCount === 0) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E6C7A8] shadow-2xl px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#9B6B50] font-medium">Total</p>
          <p className="text-xl font-black text-[#120905]">₹{subtotal.toFixed(0)}</p>
        </div>
        <a href="/checkout"
          className="flex-1 flex items-center justify-center gap-2 bg-[#C9943A] hover:bg-[#120905] text-[#120905] hover:text-[#FFF7ED] rounded-full py-3.5 text-sm font-black uppercase tracking-wider transition-all">
          Checkout <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => { setCart(getCart()) }, [])

  const handleQty = (id: number, qty: number) => {
    const updated = qty <= 0 ? removeFromCart(id) : updateQty(id, qty)
    setCart(updated)
  }

  const handleRemove = (id: number) => {
    setCart(removeFromCart(id))
  }

  const subtotal = cart.reduce((s, c) => s + Number(c.price) * c.quantity, 0)
  const itemCount = cart.reduce((s, c) => s + c.quantity, 0)

  return (
    <div className="min-h-screen bg-[#FBF4EC]">
      <Header />
      <main className="pb-28 md:pb-0">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#120905 0%,#1A0D07 50%,#3D1F0D 100%)', minHeight: 220, paddingTop: '5.5rem', paddingBottom: '3rem' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(201,148,58,0.07) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 50%,rgba(201,148,58,0.10),transparent 55%)' }} />

          <div className="relative z-10 max-w-[1180px] mx-auto px-6 flex items-center justify-between gap-8">
            <div className="animate-fade-up">
              <p className="text-xs font-black tracking-[0.28em] text-[#C9943A] mb-3 flex items-center gap-2">
                <ShoppingCart className="w-3.5 h-3.5" /> YOUR CART
              </p>
              <h1 className="font-heading text-3xl md:text-5xl font-bold text-[#FFF7ED] leading-tight mb-3">
                Review Your Order
              </h1>
              <p className="text-sm text-[#E6C7A8] max-w-md mb-5">
                Check your Big Bean Café merchandise before moving to checkout.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  [`${itemCount} item${itemCount !== 1 ? 's' : ''} in cart`, ShoppingBag],
                  ['Free delivery', Truck],
                  ['Secure checkout', ShieldCheck],
                ].map(([label, Icon], i) => (
                  <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(201,148,58,0.12)', border: '1px solid rgba(201,148,58,0.28)', color: '#F5E6D3' }}>
                    <Icon className="w-3 h-3 text-[#C9943A]" />{label as string}
                  </div>
                ))}
              </div>
            </div>

            {/* Floating card — desktop only */}
            <div className="hidden lg:block flex-shrink-0 animate-float-soft">
              <div className="rounded-3xl p-5 w-56"
                style={{ background: 'rgba(201,148,58,0.10)', border: '1px solid rgba(201,148,58,0.28)', backdropFilter: 'blur(14px)' }}>
                <p className="text-xs font-bold text-[#C9943A] mb-2">Fresh picks from</p>
                <p className="text-sm font-black text-[#FFF7ED] mb-1">Big Bean Café</p>
                <p className="text-xs text-[#E6C7A8]">Merchandise • Coffee essentials • Lifestyle</p>
                <div className="mt-3 flex gap-2">
                  {['☕', '👕', '🫘'].map((e, i) => (
                    <span key={i} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-base">{e}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROGRESS STRIP ── */}
        <ProgressStrip />

        {/* ── MAIN CONTENT ── */}
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-8">
          {cart.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">

              {/* Left: items */}
              <div className="space-y-4 animate-fade-up">
                {/* Cart header */}
                <div className="bg-white rounded-2xl border border-[#E6C7A8] px-5 py-4 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="font-bold text-[#3D1F0D]">Shopping Cart</p>
                    <p className="text-xs text-[#9B6B50] mt-0.5">{itemCount} item{itemCount !== 1 ? 's' : ''} added</p>
                  </div>
                  <a href="/merchandise"
                    className="text-xs font-bold text-[#C9943A] hover:text-[#3D1F0D] transition-colors flex items-center gap-1">
                    Continue Shopping <ArrowRight className="w-3 h-3" />
                  </a>
                </div>

                {cart.map((item, idx) => (
                  <div key={item.id} className="animate-fade-up" style={{ animationDelay: `${idx * 60}ms` }}>
                    <CartItemCard item={item} onQty={handleQty} onRemove={handleRemove} />
                  </div>
                ))}
              </div>

              {/* Right: summary */}
              <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
                <OrderSummary cart={cart} subtotal={subtotal} />
              </div>
            </div>
          )}

          {/* Recommended */}
          {cart.length > 0 && (
            <RecommendedProducts cartIds={cart.map(c => c.id)} />
          )}
        </div>

      </main>
      <Footer />
      <MobileCheckoutBar subtotal={subtotal} itemCount={itemCount} />
    </div>
  )
}
