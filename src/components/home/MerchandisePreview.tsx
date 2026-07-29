'use client'

import { useEffect, useState, type ElementType } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  Star,
  ArrowRight,
  ShoppingCart,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  BadgeCheck,
} from 'lucide-react'
import { addToCart } from '@/lib/cart'

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
  status: string
  category: string | null
  category_name: string | null
}

function getImageUrl(img: string | null) {
  if (!img) return null
  const trimmed = String(img).trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `${API_BASE}/${trimmed.replace(/^\/+/, '')}`
}

function ProductImage({
  src,
  alt,
  className = '',
  placeholderClass = '',
}: {
  src: string | null
  alt: string
  className?: string
  placeholderClass?: string
}) {
  const url = getImageUrl(src)
  if (url) {
    return <img src={url} alt={alt} className={className} loading="lazy" />
  }
  return (
    <div className={placeholderClass}>
      <ShoppingBag className="w-10 h-10 opacity-40" style={{ color: '#C9943A' }} />
    </div>
  )
}

export default function MerchandisePreview() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState<number | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/merchandise/active`)
      .then((r) => r.json())
      .then((d) => setProducts((d.data || []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAddToCart = (p: Product) => {
    if (p.stock === 0) return
    addToCart({ id: p.id, name: p.name, price: p.price, image: p.image, slug: p.slug })
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bigbean-cart-updated'))
    }
    setAdded(p.id)
    setTimeout(() => setAdded(null), 1800)
  }

  const featured = products[0]
  const remaining = products.slice(1)

  return (
    <section className="relative overflow-hidden" style={{ background: '#FBF4EC' }}>
      <style dangerouslySetInnerHTML={{ __html: FLOAT_CSS }} />
      <DecorativeBackground />

      <div className="relative z-10 container-custom py-16 md:py-24">
        <Header />

        {loading ? (
          <LoadingSkeleton />
        ) : products.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_1fr]">
              <FeaturedCard product={featured} isAdded={added === featured.id} onAdd={handleAddToCart} />
              <div className="flex flex-col gap-5">
                {remaining.map((p) => (
                  <CompactCard key={p.id} product={p} isAdded={added === p.id} onAdd={handleAddToCart} />
                ))}
              </div>
            </div>
            <BenefitsBar />
          </>
        )}
      </div>
    </section>
  )
}

function FeaturedCard({ product, isAdded, onAdd }: { product: Product; isAdded: boolean; onAdd: (p: Product) => void }) {
  const discount = product.mrp && product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : null
  const outOfStock = product.stock === 0

  return (
    <div className="group relative h-[440px] overflow-hidden rounded-[34px] border border-[#E6C7A8] bg-[#3D1F0D] shadow-[0_28px_80px_rgba(61,31,13,0.18)] transition md:h-[520px] lg:h-[560px]">
      <div className="absolute inset-0">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          placeholderClass="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#3D1F0D] to-[#6B3520]"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(26,13,7,0.95) 0%, rgba(61,31,13,0.55) 45%, rgba(61,31,13,0.05) 70%)' }}
        />
      </div>

      <div className="absolute top-5 left-5 right-5 z-10 flex justify-between">
        <span className="rounded-full bg-[#C9943A] px-3.5 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-[#FFF7ED]">
          {product.badge_text || 'BEST SELLER'}
        </span>
        {discount && (
          <span className="rounded-full bg-[#A92517] px-3 py-1.5 text-[0.65rem] font-extrabold text-[#FFF7ED]">
            -{discount}%
          </span>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 text-[#FFF7ED] md:p-8">
        <Link href={`/merchandise/${product.slug}`}>
          <h3 className="font-heading mb-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight transition hover:text-[#C9943A]">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p
            className="mb-3 text-sm text-[#E6C7A8] md:text-base"
            style={{ lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {product.description}
          </p>
        )}

        <RatingStars rating={product.rating} size={16} dark />

        <div className="mb-5 mt-3 flex items-center gap-3">
          <span className="text-2xl font-black text-[#FFF7ED]">₹{Number(product.price).toFixed(0)}</span>
          {product.mrp && Number(product.mrp) > Number(product.price) && (
            <span className="text-sm text-[#C7A489] line-through">₹{Number(product.mrp).toFixed(0)}</span>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={outOfStock}
            className="flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-extrabold uppercase tracking-wider transition sm:flex-none"
            style={{
              background: isAdded ? '#22863a' : outOfStock ? '#9B6B50' : '#C9943A',
              color: isAdded ? '#fff' : '#0E0704',
              cursor: outOfStock ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => { if (!outOfStock && !isAdded) (e.currentTarget as HTMLElement).style.background = '#FFF7ED' }}
            onMouseLeave={(e) => { if (!outOfStock && !isAdded) (e.currentTarget as HTMLElement).style.background = '#C9943A' }}
          >
            {outOfStock ? 'Out of Stock' : isAdded ? <><Check className="h-4 w-4" /> Added!</> : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>}
          </button>
          <Link
            href={`/merchandise/${product.slug}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#E6C7A8] px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-[#E6C7A8] transition hover:bg-[#FFF7ED] hover:text-[#3D1F0D] sm:flex-none"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

function CompactCard({ product, isAdded, onAdd }: { product: Product; isAdded: boolean; onAdd: (p: Product) => void }) {
  const discount = product.mrp && product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : null
  const category = product.category_name || product.category || 'Merchandise'
  const outOfStock = product.stock === 0

  return (
    <div className="group flex flex-col overflow-hidden rounded-[26px] border border-[#E6C7A8] bg-white shadow-[0_14px_40px_rgba(61,31,13,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(61,31,13,0.14)] sm:flex-row">
      <Link href={`/merchandise/${product.slug}`} className="relative block h-48 w-full overflow-hidden sm:h-auto sm:w-[150px] sm:min-w-[150px]">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          placeholderClass="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFF7ED] to-[#F6E6D1]"
        />
        {product.badge_text && (
          <span className="absolute top-3 left-3 rounded-full bg-[#C9943A] px-2.5 py-1 text-[0.6rem] font-extrabold uppercase tracking-wider text-[#FFF7ED]">
            {product.badge_text}
          </span>
        )}
        {discount && (
          <span className="absolute bottom-3 left-3 rounded-full bg-[#A92517] px-2.5 py-1 text-[0.6rem] font-extrabold text-[#FFF7ED]">
            -{discount}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-center p-5">
        <p className="mb-1 text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-[#C9943A]">{category}</p>
        <Link href={`/merchandise/${product.slug}`} className="group/link">
          <h3 className="font-heading mb-1 text-lg font-bold leading-tight text-[#3D1F0D] transition group-hover/link:text-[#8B4A2F]">
            {product.name}
          </h3>
        </Link>
        <RatingStars rating={product.rating} size={12} />
        {product.description && (
          <p
            className="mt-2 mb-3 text-sm text-[#6B3520]"
            style={{ lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-[#3D1F0D]">₹{Number(product.price).toFixed(0)}</span>
            {product.mrp && Number(product.mrp) > Number(product.price) && (
              <span className="text-xs text-[#9B6B50] line-through">₹{Number(product.mrp).toFixed(0)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={outOfStock}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#FFF7ED] transition"
            style={{
              background: isAdded ? '#22863a' : outOfStock ? '#C7A489' : '#3D1F0D',
              cursor: outOfStock ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => { if (!outOfStock && !isAdded) (e.currentTarget as HTMLElement).style.background = '#8B4A2F' }}
            onMouseLeave={(e) => { if (!outOfStock && !isAdded) (e.currentTarget as HTMLElement).style.background = '#3D1F0D' }}
            aria-label={outOfStock ? 'Out of stock' : isAdded ? 'Added' : 'Add to cart'}
          >
            {outOfStock ? <ShoppingCart className="h-4 w-4 opacity-50" /> : isAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

function RatingStars({ rating, size = 14, dark = false }: { rating: number | null; size?: number; dark?: boolean }) {
  const value = Math.min(5, Math.max(0, Math.round(rating || 4.8)))
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          style={{ width: size, height: size }}
          className={s <= value ? 'text-[#C9943A] fill-[#C9943A]' : dark ? 'text-[#C7A489]' : 'text-[#E6C7A8]'}
        />
      ))}
      <span className={dark ? 'ml-1 text-xs text-[#E6C7A8]' : 'ml-1 text-xs text-[#9B6B50]'}>{Number(rating || 4.8).toFixed(1)}</span>
    </div>
  )
}

const FLOAT_CSS = `
  @keyframes floatBean1 { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-20px) } }
  @keyframes floatBean2 { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
  @keyframes floatBean3 { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-24px) } }
`

const BEANS = [
  { top: '8%', left: '5%', size: 28, rotate: 25, opacity: 0.14, color: '#C9943A', anim: 'floatBean1', duration: '8s', delay: '0s' },
  { top: '18%', left: '92%', size: 22, rotate: -20, opacity: 0.12, color: '#8B5A3C', anim: 'floatBean2', duration: '9s', delay: '1s' },
  { top: '55%', left: '3%', size: 18, rotate: 40, opacity: 0.1, color: '#C9943A', anim: 'floatBean3', duration: '7s', delay: '0.5s' },
  { top: '70%', left: '93%', size: 26, rotate: -35, opacity: 0.13, color: '#6B3520', anim: 'floatBean1', duration: '10s', delay: '2s' },
  { top: '40%', left: '10%', size: 16, rotate: 15, opacity: 0.09, color: '#8B5A3C', anim: 'floatBean2', duration: '8s', delay: '1.5s' },
  { top: '85%', left: '22%', size: 20, rotate: -10, opacity: 0.11, color: '#C9943A', anim: 'floatBean3', duration: '9s', delay: '0.2s' },
]

function CoffeeBean({ size, color = '#C9943A', rotate = 0, opacity = 0.18 }: { size: number; color?: string; rotate?: number; opacity?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size * 1.45,
        background: color,
        borderRadius: '50%',
        opacity,
        transform: `rotate(${rotate}deg)`,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '10%',
          bottom: '10%',
          left: '50%',
          width: 2,
          background: 'rgba(61,31,13,0.35)',
          borderRadius: 2,
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  )
}

function DecorativeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, #F6E6D1 0%, transparent 70%)', opacity: 0.3 }}
      />
      <div
        className="absolute -bottom-[10%] -right-[10%] h-[600px] w-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, #FFF7ED 0%, transparent 70%)', opacity: 0.3 }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, #E6C7A8 0%, transparent 70%)', opacity: 0.2 }}
      />
      {BEANS.map((b, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: b.top,
            left: b.left,
            animation: `${b.anim} ${b.duration} ease-in-out infinite`,
            animationDelay: b.delay,
          }}
        >
          <CoffeeBean size={b.size} color={b.color} rotate={b.rotate} opacity={b.opacity} />
        </div>
      ))}
    </div>
  )
}

function Header() {
  return (
    <div className="mb-12 text-center md:mb-16">
      <p className="mb-3 text-[0.7rem] font-extrabold uppercase tracking-[0.25em] text-[#C9943A]">BIG BEAN CAFE</p>
      <h2 className="font-heading mx-auto mb-4 max-w-3xl text-[clamp(1.8rem,4vw,3rem)] font-bold leading-tight text-[#3D1F0D]">
        Buy Coffee Beans & Merchandise Online
      </h2>
      <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-[#6B3520] md:text-base">
        Premium coffee essentials & merchandise, crafted for true coffee lovers.
      </p>
      <Link
        href="/merchandise"
        className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[#FFF7ED] shadow-lg transition hover:shadow-xl"
        style={{ background: 'linear-gradient(135deg, #3D1F0D 0%, #6B3520 100%)' }}
      >
        Explore All Merchandise <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_1fr]">
      <div className="h-[440px] animate-pulse rounded-[34px] bg-[#E6C7A8]/40 md:h-[520px]" />
      <div className="flex flex-col gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-[26px] bg-[#E6C7A8]/40 sm:h-40" />
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-xl rounded-[34px] border border-[#E6C7A8] bg-white p-10 text-center shadow-[0_12px_48px_rgba(61,31,13,0.08)]">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#FFF7ED] to-[#F6E6D1]">
        <ShoppingBag className="h-9 w-9 text-[#C9943A]" />
      </div>
      <h3 className="font-heading mb-2 text-2xl font-extrabold text-[#3D1F0D]">Merchandise collection is brewing</h3>
      <p className="mb-6 text-[#6B3520]">New Big Bean Café merchandise will be available soon.</p>
      <Link
        href="/merchandise"
        className="inline-flex items-center gap-2 rounded-full bg-[#3D1F0D] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#FFF7ED] transition hover:bg-[#8B4A2F]"
      >
        Explore Merchandise <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function BenefitsBar() {
  const items = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹999' },
    { icon: RotateCcw, title: '30 Days Return', desc: 'Easy returns & exchanges' },
    { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
    { icon: BadgeCheck, title: 'Premium Quality', desc: 'Only the best for you' },
  ]
  return (
    <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <BenefitItem key={item.title} icon={item.icon} title={item.title} desc={item.desc} />
      ))}
    </div>
  )
}

function BenefitItem({ icon: Icon, title, desc }: { icon: ElementType; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#E6C7A8] bg-white/70 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3D1F0D] to-[#6B3520] text-[#C9943A]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-[#3D1F0D]">{title}</p>
        <p className="text-xs text-[#6B3520]">{desc}</p>
      </div>
    </div>
  )
}
