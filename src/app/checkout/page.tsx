'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import {
  ShoppingBag, Check, ArrowRight, ShoppingCart, AlertCircle, X,
  User, Phone, Mail, MapPin, StickyNote, CreditCard, Truck,
  ShieldCheck, Headphones, PackageCheck, CheckCircle, Lock, Wifi, Banknote, MessageCircle
} from 'lucide-react'
import { getCart, clearCart, CartItem } from '@/lib/cart'
import { getCustomerToken } from '@/lib/customerAuth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

const getImageUrl = (img?: string | null): string | null => {
  if (!img) return null
  const clean = String(img).trim()
  if (!clean) return null
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean
  if (clean.startsWith('/uploads')) return `${API_BASE}${clean}`
  if (clean.startsWith('uploads')) return `${API_BASE}/${clean}`
  return `${API_BASE}/${clean.replace(/^\/+/, '')}`
}

// ── Payment config type ───────────────────────────────────────────────────────
type PaymentConfig = {
  payment_enabled: string
  online_payment_enabled: string
  cod_enabled: string
  payment_provider: string
  payment_mode: string
  currency: string
  razorpay_key_id: string
}

const DEFAULT_CONFIG: PaymentConfig = {
  payment_enabled: '0',
  online_payment_enabled: '0',
  cod_enabled: '1',
  payment_provider: 'razorpay',
  payment_mode: 'test',
  currency: 'INR',
  razorpay_key_id: '',
}

// ── Razorpay script loader ────────────────────────────────────────────────────
const loadRazorpay = (): Promise<boolean> =>
  new Promise(resolve => {
    if (typeof window === 'undefined') return resolve(false)
    if ((window as unknown as Record<string, unknown>).Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressSteps({ active }: { active: 'cart' | 'checkout' | 'confirmation' }) {
  const steps = [
    { id: 'cart', label: 'Cart', href: '/cart' },
    { id: 'checkout', label: 'Checkout', href: null },
    { id: 'confirmation', label: 'Confirmation', href: null },
  ]
  return (
    <div className="bg-[#FFF7ED] border-b border-[#E6C7A8]">
      <div className="max-w-[1180px] mx-auto px-4 py-3 flex items-center justify-center">
        {steps.map((s, i) => {
          const isActive = s.id === active
          const isDone = steps.findIndex(x => x.id === active) > i
          return (
            <div key={s.id} className="flex items-center">
              <div className="flex items-center gap-2">
                {s.href && !isActive ? (
                  <a href={s.href} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                      ${isDone ? 'bg-[#C9943A] border-[#C9943A] text-[#120905]' : 'bg-white border-[#E6C7A8] text-[#9B6B50]'}`}>
                      {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className="text-xs font-semibold hidden sm:block text-[#9B6B50] hover:text-[#C9943A] transition-colors">{s.label}</span>
                  </a>
                ) : (
                  <>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                      ${isActive ? 'bg-[#C9943A] border-[#C9943A] text-[#120905]' : isDone ? 'bg-[#C9943A] border-[#C9943A] text-[#120905]' : 'bg-white border-[#E6C7A8] text-[#9B6B50]'}`}>
                      {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : isActive ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${isActive ? 'text-[#C9943A]' : 'text-[#9B6B50]'}`}>{s.label}</span>
                  </>
                )}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-10 sm:w-16 h-px mx-2 ${isDone || isActive ? 'bg-[#C9943A]' : 'bg-[#E6C7A8]'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EmptyCheckout() {
  return (
    <div className="animate-fade-up max-w-2xl mx-auto text-center py-16 px-6">
      <div className="w-28 h-28 rounded-full mx-auto mb-8 flex items-center justify-center shadow-xl"
        style={{ background: 'radial-gradient(circle,rgba(201,148,58,0.18),rgba(201,148,58,0.04))', border: '2px solid rgba(201,148,58,0.3)' }}>
        <ShoppingBag className="w-12 h-12 text-[#C9943A] animate-float-soft" />
      </div>
      <h2 className="font-heading text-3xl font-bold text-[#3D1F0D] mb-3">Your cart is empty</h2>
      <p className="text-[#9B6B50] mb-8">Add your favourite Big Bean Café merchandise before checkout.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <a href="/merchandise"
          className="inline-flex items-center gap-2 bg-[#C9943A] hover:bg-[#3D1F0D] text-[#120905] hover:text-[#FFF7ED] rounded-full px-7 py-3 text-sm font-black uppercase tracking-wider transition-all shadow-md">
          <ShoppingCart className="w-4 h-4" /> Shop Merchandise
        </a>
        <a href="/cart"
          className="inline-flex items-center gap-2 border-2 border-[#E6C7A8] hover:border-[#C9943A] text-[#3D1F0D] rounded-full px-7 py-3 text-sm font-bold uppercase tracking-wider transition-all">
          Back to Cart
        </a>
      </div>
    </div>
  )
}

function FieldInput({ label, icon: Icon, type = 'text', required, value, onChange, placeholder }: {
  label: string; icon: React.ElementType; type?: string
  required?: boolean; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label className="block text-xs font-bold text-[#3D1F0D] mb-1.5">
        {label}{required && <span className="text-[#C9943A] ml-0.5">*</span>}
      </label>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 bg-[#FFF7ED] transition-all duration-200
        ${focused ? 'border-[#C9943A] shadow-[0_0_0_3px_rgba(201,148,58,0.12)]' : 'border-[#E6C7A8]'}`}>
        <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${focused ? 'text-[#C9943A]' : 'text-[#9B6B50]'}`} />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent text-sm text-[#3D1F0D] placeholder:text-[#C0A080] focus:outline-none"
        />
      </div>
    </div>
  )
}

function FieldTextarea({ label, icon: Icon, rows = 3, value, onChange, placeholder }: {
  label: string; icon: React.ElementType; rows?: number
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label className="block text-xs font-bold text-[#3D1F0D] mb-1.5">{label}</label>
      <div className={`flex gap-3 px-4 py-3 rounded-2xl border-2 bg-[#FFF7ED] transition-all duration-200
        ${focused ? 'border-[#C9943A] shadow-[0_0_0_3px_rgba(201,148,58,0.12)]' : 'border-[#E6C7A8]'}`}>
        <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-colors ${focused ? 'text-[#C9943A]' : 'text-[#9B6B50]'}`} />
        <textarea
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent text-sm text-[#3D1F0D] placeholder:text-[#C0A080] focus:outline-none resize-none"
        />
      </div>
    </div>
  )
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[24px] border border-[#E6C7A8] shadow-sm p-6 animate-fade-up">
      <div className="mb-5">
        <h2 className="font-heading text-lg font-bold text-[#3D1F0D]">{title}</h2>
        {subtitle && <p className="text-xs text-[#9B6B50] mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function ErrorAlert({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl border border-red-200 bg-red-50 mb-5 animate-fade-up">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm text-red-700 font-medium">{message}</p>
      <button onClick={onClose} className="text-red-400 hover:text-red-600 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

function CheckoutSummary({
  cart, subtotal, submitting, payMethod, onlineEnabled
}: { cart: CartItem[]; subtotal: number; submitting: boolean; payMethod: 'online' | 'cod'; onlineEnabled: boolean }) {
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
      <div className="bg-white rounded-[30px] border border-[#E6C7A8] shadow-xl overflow-hidden lg:sticky lg:top-[110px]">
        <div className="px-6 py-4 border-b border-[#E6C7A8]" style={{ background: 'linear-gradient(135deg,#120905,#3D1F0D)' }}>
          <p className="text-xs font-bold tracking-widest text-[#C9943A] mb-0.5">ORDER SUMMARY</p>
          <p className="text-xs text-[#E6C7A8]">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
        </div>

        {/* Item list */}
        <div className="px-5 pt-4 max-h-[280px] overflow-y-auto space-y-3">
          {cart.map(item => {
            const img = getImageUrl(item.image)
            return (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFF7ED] to-[#F5E6D3] border border-[#E6C7A8] flex-shrink-0">
                  {img ? (
                    <img src={img} alt={item.name} className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.style.display = 'none' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-[#C9943A] opacity-40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#3D1F0D] line-clamp-1">{item.name}</p>
                  <p className="text-xs text-[#9B6B50]">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-[#3D1F0D] flex-shrink-0">₹{(Number(item.price) * item.quantity).toFixed(0)}</p>
              </div>
            )
          })}
        </div>

        <div className="px-5 py-4 space-y-2.5 border-t border-[#E6C7A8] mt-3">
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
          <div className="h-px bg-[#E6C7A8]" />
          <div className="flex justify-between text-base font-black text-[#120905]">
            <span>Total</span>
            <span>₹{subtotal.toFixed(0)}</span>
          </div>
          <p className="text-xs text-green-700 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> You saved on delivery today!
          </p>
        </div>

        <div className="px-5 pb-5 space-y-2">
          <button type="submit" form="checkout-form" disabled={submitting}
            className={`w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-black uppercase tracking-widest transition-all duration-200 shadow-md
              ${submitting ? 'bg-[#9B6B50] cursor-not-allowed text-[#FFF7ED]' : 'bg-[#C9943A] hover:bg-[#120905] text-[#120905] hover:text-[#FFF7ED] hover:shadow-lg'}`}>
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> {payMethod === 'online' ? 'Processing…' : 'Placing Order…'}</>
            ) : payMethod === 'online' && onlineEnabled ? (
              <><Lock className="w-4 h-4" /> Pay Securely</>
            ) : (
              <><Check className="w-4 h-4" /> Place Order</>
            )}
          </button>
          <a href="/cart" className="block text-center text-xs font-semibold text-[#9B6B50] hover:text-[#3D1F0D] transition-colors py-1">
            ← Back to Cart
          </a>
        </div>

        {/* Trust badges */}
        <div className="border-t border-[#E6C7A8] px-5 py-3 grid grid-cols-3 gap-2">
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
      <div className="bg-white rounded-[24px] border border-[#E6C7A8] p-4 lg:sticky lg:top-[490px]">
        <p className="text-sm font-bold text-[#3D1F0D] flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-[#C9943A]" /> Apply Offer
        </p>
        <div className="flex gap-2">
          <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 px-4 py-2 text-sm rounded-full border border-[#E6C7A8] bg-[#FBF4EC] text-[#3D1F0D] placeholder:text-[#C0A080] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/30" />
          <button onClick={handleCoupon}
            className="px-4 py-2 rounded-full text-xs font-bold text-[#120905] bg-[#C9943A] hover:bg-[#3D1F0D] hover:text-[#FFF7ED] transition-all whitespace-nowrap">
            Apply
          </button>
        </div>
        {couponMsg && <p className="text-xs text-[#8B4A2F] mt-2">{couponMsg}</p>}
      </div>
    </div>
  )
}

function TrustStrip() {
  const items = [
    [PackageCheck, 'Packed with Care', 'Every order packed by our team'],
    [ShieldCheck, 'Secure Checkout', '100% safe and encrypted'],
    [Headphones, 'Big Bean Support', 'We are here to help'],
    [Truck, 'Free Delivery', 'On eligible merchandise orders'],
  ]
  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(([Icon, title, desc], i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#E6C7A8] p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
          <Icon className="w-6 h-6 text-[#C9943A] mb-2" />
          <p className="text-xs font-bold text-[#3D1F0D]">{title as string}</p>
          <p className="text-[10px] text-[#9B6B50] mt-0.5">{desc as string}</p>
        </div>
      ))}
    </div>
  )
}

function SuccessScreen({ orderNumber, payMethod, email, phone }: {
  orderNumber: string; payMethod: 'online' | 'cod'; email: string; phone: string
}) {
  const isPaid = payMethod === 'online'
  const timeline = [
    { label: 'Order Received', done: true },
    { label: isPaid ? 'Payment Confirmed' : 'COD — Pay on Delivery', done: isPaid },
    { label: 'Team Confirmation', done: false },
    { label: 'Packing', done: false },
    { label: 'Ready / Delivery Update', done: false },
  ]
  return (
    <div className="min-h-screen bg-[#FBF4EC]">
      <Header />
      <main className="max-w-[600px] mx-auto px-6 py-16 text-center animate-fade-up">
        <div className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl"
          style={{ background: 'linear-gradient(135deg,#22863a,#2d9e47)', boxShadow: '0 8px 40px rgba(34,134,58,0.35)' }}>
          <Check className="w-10 h-10 text-white" />
        </div>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#3D1F0D] mb-3">
          Order Placed Successfully!
        </h1>
        <p className="text-[#6B3520] mb-2">
          Thank you for your order. Our team will confirm your merchandise order shortly.
        </p>

        {/* Payment status */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 mt-1 ${
          isPaid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {isPaid ? <><Check className="w-3.5 h-3.5" /> Payment Confirmed</> : <><Banknote className="w-3.5 h-3.5" /> Cash on Delivery</>}
        </div>

        {/* Order number badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 mt-1 block"
          style={{ background: 'rgba(201,148,58,0.12)', border: '1.5px solid rgba(201,148,58,0.4)' }}>
          <Lock className="w-3.5 h-3.5 text-[#C9943A]" />
          <span className="text-sm font-bold text-[#3D1F0D]">Order Number: </span>
          <span className="text-sm font-black text-[#C9943A]">#{orderNumber}</span>
        </div>

        {/* Notification info */}
        {(email || phone) && (
          <div className="bg-white rounded-2xl border border-[#E6C7A8] p-4 mb-6 text-left space-y-2 shadow-sm">
            <p className="text-xs font-bold tracking-widest text-[#C9943A] mb-2">YOU WILL RECEIVE UPDATES</p>
            {email && (
              <div className="flex items-center gap-2 text-sm text-[#6B3520]">
                <Mail className="w-4 h-4 text-[#C9943A] flex-shrink-0" />
                <span>Confirmation email sent to <strong>{email}</strong></span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-2 text-sm text-[#6B3520]">
                <MessageCircle className="w-4 h-4 text-[#C9943A] flex-shrink-0" />
                <span>WhatsApp updates may be sent to <strong>{phone}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-[24px] border border-[#E6C7A8] p-6 mb-8 text-left shadow-sm">
          <p className="text-xs font-bold tracking-widest text-[#C9943A] mb-4">ORDER STATUS</p>
          <div className="space-y-0">
            {timeline.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2
                    ${step.done ? 'bg-green-500 border-green-500' : 'bg-white border-[#E6C7A8]'}`}>
                    {step.done ? <Check className="w-3.5 h-3.5 text-white" /> : <span className="w-2 h-2 rounded-full bg-[#E6C7A8] block" />}
                  </div>
                  {i < timeline.length - 1 && <div className={`w-0.5 h-6 ${step.done ? 'bg-green-200' : 'bg-[#E6C7A8]'}`} />}
                </div>
                <p className={`text-sm pt-1 font-semibold ${step.done ? 'text-green-700' : 'text-[#9B6B50]'}`}>{step.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/merchandise"
            className="inline-flex items-center gap-2 bg-[#3D1F0D] hover:bg-[#C9943A] text-[#FFF7ED] hover:text-[#120905] rounded-full px-7 py-3 text-sm font-black uppercase tracking-wider transition-all shadow-md">
            <ShoppingCart className="w-4 h-4" /> Shop More
          </a>
          <a href="/"
            className="inline-flex items-center gap-2 border-2 border-[#C9943A] text-[#C9943A] hover:bg-[#C9943A] hover:text-[#120905] rounded-full px-7 py-3 text-sm font-bold uppercase tracking-wider transition-all">
            Go Home <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function MobilePlaceOrderBar({ subtotal, submitting, payMethod, onlineEnabled }: { subtotal: number; submitting: boolean; payMethod: 'online' | 'cod'; onlineEnabled: boolean }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-[#E6C7A8] shadow-2xl px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#9B6B50] font-medium">Total</p>
          <p className="text-xl font-black text-[#120905]">₹{subtotal.toFixed(0)}</p>
        </div>
        <button type="submit" form="checkout-form" disabled={submitting}
          className={`flex-1 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-black uppercase tracking-wider transition-all
            ${submitting ? 'bg-[#9B6B50] cursor-not-allowed text-[#FFF7ED]' : 'bg-[#C9943A] hover:bg-[#120905] text-[#120905] hover:text-[#FFF7ED]'}`}>
          {submitting ? (payMethod === 'online' ? 'Processing…' : 'Placing…') : payMethod === 'online' && onlineEnabled ? <><Lock className="w-4 h-4" /> Pay Securely</> : <><Check className="w-4 h-4" /> Place Order</>}
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [successPayMethod, setSuccessPayMethod] = useState<'online' | 'cod'>('cod')
  const [error, setError] = useState('')
  const [payConfig, setPayConfig] = useState<PaymentConfig>(DEFAULT_CONFIG)
  const [payMethod, setPayMethod] = useState<'online' | 'cod'>('cod')
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    address: '',
    notes: '',
  })

  useEffect(() => {
    setCart(getCart())
    fetch(`${API_URL}/payments/public-config`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setPayConfig(d.data)
          // default to online if enabled, else cod
          if (d.data.online_payment_enabled === '1' && d.data.payment_enabled === '1') {
            setPayMethod('online')
          } else {
            setPayMethod('cod')
          }
        }
      })
      .catch(() => {})
  }, [])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const subtotal = cart.reduce((s, c) => s + Number(c.price) * c.quantity, 0)

  const onlineEnabled = payConfig.payment_enabled === '1' && payConfig.online_payment_enabled === '1'
  const codEnabled = payConfig.cod_enabled === '1'

  // ── Create the merchandise order record first ─────────────────────────────
  const createMerchandiseOrder = async (paymentMethod: string) => {
    const customerToken = getCustomerToken()
    const res = await fetch(`${API_URL}/merchandise-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
      },
      body: JSON.stringify({
        ...form,
        payment_method: paymentMethod,
        items: cart.map(c => ({
          merchandise_id: c.id > 0 ? c.id : null,
          product_name: c.name,
          quantity: c.quantity,
          price: c.price,
        })),
      }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.success) throw new Error(data?.message || 'Unable to place order.')
    return data.data
  }

  // ── Helper: show success after confirmed payment/order ───────────────────
  const finishOrder = (orderNum: string, method: 'online' | 'cod') => {
    clearCart()
    setCart([])
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('bigbean-cart-updated'))
    setSuccessPayMethod(method)
    setOrderNumber(orderNum)
    setSubmitting(false)
  }

  // ── Online payment via Razorpay ───────────────────────────────────────────
  const handleOnlinePayment = async (orderData: { id: number; order_number: string }) => {
    // 1. Validate payment config before creating Razorpay order
    const validateRes = await fetch(`${API_URL}/payments/validate-config`)
    const validateData = await validateRes.json().catch(() => null)
    if (!validateData?.success) {
      // Mark order as payment failed
      await fetch(`${API_URL}/merchandise-orders/${orderData.id}/payment-failed`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: validateData?.message || 'Payment configuration validation failed' })
      }).catch(() => {})
      throw new Error(validateData?.message || 'Unable to start Razorpay payment. Please try again or choose COD.')
    }

    // 2. Create Razorpay order on backend
    const rzpRes = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderData.id, amount: subtotal, currency: payConfig.currency || 'INR' }),
    })
    const rzpData = await rzpRes.json().catch(() => null)
    if (!rzpData?.success) {
      // Mark order as payment failed
      await fetch(`${API_URL}/merchandise-orders/${orderData.id}/payment-failed`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rzpData?.message || 'Razorpay order creation failed' })
      }).catch(() => {})
      throw new Error(rzpData?.message || 'Payment is currently unavailable. Please try again later.')
    }

    if (!rzpData.data?.razorpay_order_id || !rzpData.data?.key_id) {
      // Mark order as payment failed
      await fetch(`${API_URL}/merchandise-orders/${orderData.id}/payment-failed`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Payment configuration is incomplete' })
      }).catch(() => {})
      throw new Error('Payment configuration is incomplete. Please contact support.')
    }

    // 3. Open Razorpay popup — success page only inside handler after verify
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzp = new (window as any).Razorpay({
      key: rzpData.data.key_id,
      amount: rzpData.data.amount,
      currency: rzpData.data.currency || 'INR',
      order_id: rzpData.data.razorpay_order_id,
      name: 'Big Bean Café',
      description: `Order ${orderData.order_number}`,
      prefill: {
        name: form.customer_name,
        email: form.customer_email || '',
        contact: form.customer_phone,
      },
      theme: { color: '#C9943A' },
      handler: async (response: Record<string, string>) => {
        try {
          const verRes = await fetch(`${API_URL}/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: orderData.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })
          const verData = await verRes.json().catch(() => null)
          if (verData?.success) {
            finishOrder(orderData.order_number, 'online')
          } else {
            setError(verData?.message || 'Payment verification failed. Please contact support.')
            setSubmitting(false)
          }
        } catch {
          setError('Payment verification failed. Please contact support.')
          setSubmitting(false)
        }
      },
      modal: {
        ondismiss: () => {
          setError('Payment cancelled. Your order is saved. You can retry payment from your orders page.')
          setSubmitting(false)
        },
      },
    })
    rzp.open()
    // Do NOT resolve/return here — success handled inside handler above
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customer_name.trim()) { setError('Please enter your full name.'); return }
    if (!form.customer_phone.trim() || form.customer_phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number (at least 10 digits).')
      return
    }
    if (cart.length === 0) { setError('Your cart is empty.'); return }
    if (!onlineEnabled && !codEnabled) {
      setError('Payments are temporarily unavailable. Please contact support.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      if (payMethod === 'online' && onlineEnabled) {
        // Load Razorpay SDK first
        const loaded = await loadRazorpay()
        if (!loaded) {
          setError('Unable to load Razorpay. Please check your internet connection.')
          setSubmitting(false)
          return
        }
        // 1. Create merchandise order with pending status
        const orderData = await createMerchandiseOrder('online')
        // 2 & 3: Open Razorpay — this returns immediately; success handled in rzp.handler
        await handleOnlinePayment(orderData)
        // NOTE: do NOT call finishOrder here — handled inside rzp.handler
        return
      }

      // COD path
      const orderData = await createMerchandiseOrder('cod')
      finishOrder(orderData.order_number, 'cod')
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to place order right now. Please try again.'
      setError(errorMsg)
      setSubmitting(false)
      // Do NOT clear cart on error - customer can retry
    }
  }

  if (orderNumber) return <SuccessScreen orderNumber={orderNumber} payMethod={successPayMethod} email={form.customer_email} phone={form.customer_phone} />

  return (
    <div className="min-h-screen bg-[#FBF4EC]">
      <Header />
      <main className="pb-28 lg:pb-0">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#120905 0%,#1A0D07 50%,#3D1F0D 100%)', minHeight: 220, paddingTop: '5.5rem', paddingBottom: '3rem' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(201,148,58,0.07) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 75% 50%,rgba(201,148,58,0.10),transparent 55%)' }} />

          <div className="relative z-10 max-w-[1180px] mx-auto px-6 flex items-center justify-between gap-8">
            <div className="animate-fade-up">
              <p className="text-xs font-black tracking-[0.28em] text-[#C9943A] mb-3 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> ALMOST THERE
              </p>
              <h1 className="font-heading text-3xl md:text-5xl font-bold text-[#FFF7ED] leading-tight mb-3">
                Secure Checkout
              </h1>
              <p className="text-sm text-[#E6C7A8] max-w-md mb-5">
                Review your details and place your Big Bean Café merchandise order.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  ['Secure Order', ShieldCheck],
                  ['Free Delivery', Truck],
                  ['Easy Support', Headphones],
                ].map(([label, Icon], i) => (
                  <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(201,148,58,0.12)', border: '1px solid rgba(201,148,58,0.28)', color: '#F5E6D3' }}>
                    <Icon className="w-3 h-3 text-[#C9943A]" />{label as string}
                  </div>
                ))}
              </div>
            </div>

            {/* Floating card — desktop */}
            <div className="hidden lg:block flex-shrink-0 animate-float-soft">
              <div className="rounded-3xl p-5 w-56"
                style={{ background: 'rgba(201,148,58,0.10)', border: '1px solid rgba(201,148,58,0.28)', backdropFilter: 'blur(14px)' }}>
                <p className="text-xs font-bold text-[#C9943A] mb-2">You are checking out</p>
                <p className="text-sm font-black text-[#FFF7ED] mb-1">Big Bean Café</p>
                <p className="text-xs text-[#E6C7A8] mb-3">Merchandise order</p>
                <div className="flex items-center gap-2 text-xs text-[#E6C7A8]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C9943A]" /> 100% Secure
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROGRESS ── */}
        <ProgressSteps active="checkout" />

        {/* ── MAIN CONTENT ── */}
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-8">
          {cart.length === 0 ? (
            <EmptyCheckout />
          ) : (
            <>
              <form id="checkout-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-6 lg:gap-8 items-start">

                  {/* ── LEFT: form sections ── */}
                  <div className="space-y-5">
                    {error && <ErrorAlert message={error} onClose={() => setError('')} />}

                    {/* Contact */}
                    <SectionCard title="Contact Details" subtitle="We will use these details to confirm your order.">
                      <div className="space-y-4">
                        <FieldInput label="Full Name" icon={User} required
                          value={form.customer_name} onChange={v => set('customer_name', v)} placeholder="Your full name" />
                        <FieldInput label="Phone Number" icon={Phone} type="tel" required
                          value={form.customer_phone} onChange={v => set('customer_phone', v)} placeholder="10-digit mobile number" />
                        <FieldInput label="Email (optional)" icon={Mail} type="email"
                          value={form.customer_email} onChange={v => set('customer_email', v)} placeholder="your@email.com" />
                      </div>
                    </SectionCard>

                    {/* Delivery */}
                    <SectionCard title="Delivery / Pickup Details" subtitle="Merchandise orders will be confirmed by our team.">
                      <div className="space-y-4">
                        <FieldTextarea label="Delivery Address (optional)" icon={MapPin} rows={3}
                          value={form.address} onChange={v => set('address', v)} placeholder="Street, City, State, PIN" />
                        <FieldTextarea label="Notes (optional)" icon={StickyNote} rows={2}
                          value={form.notes} onChange={v => set('notes', v)} placeholder="Any special instructions…" />
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FBF4EC] border border-[#E6C7A8]">
                          <Truck className="w-4 h-4 text-[#C9943A] flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-[#6B3520]">Merchandise orders will be confirmed by our team. Delivery timelines will be shared upon confirmation.</p>
                        </div>
                      </div>
                    </SectionCard>

                    {/* Payment */}
                    <SectionCard title="Payment Method" subtitle="Choose how you want to pay.">
                      {!onlineEnabled && !codEnabled ? (
                        <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50">
                          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-700 font-medium">Payments are temporarily unavailable. Please contact support.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {onlineEnabled && (
                            <button type="button" onClick={() => setPayMethod('online')}
                              className={`text-left rounded-2xl p-4 border-2 transition-all duration-200 hover:shadow-md
                                ${payMethod === 'online' ? 'border-[#C9943A] bg-[#FFF7ED] shadow-md' : 'border-[#E6C7A8] bg-white hover:border-[#C9943A]/50'}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Wifi className="w-4 h-4 text-[#C9943A]" />
                                    <p className={`text-sm font-bold ${payMethod === 'online' ? 'text-[#C9943A]' : 'text-[#3D1F0D]'}`}>Online Payment</p>
                                  </div>
                                  <p className="text-xs text-[#9B6B50] leading-relaxed">Pay securely via UPI, Card or Net Banking.</p>
                                  {payConfig.payment_mode === 'test' && (
                                    <span className="inline-block mt-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">TEST MODE</span>
                                  )}
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center
                                  ${payMethod === 'online' ? 'border-[#C9943A] bg-[#C9943A]' : 'border-[#E6C7A8] bg-white'}`}>
                                  {payMethod === 'online' && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                              </div>
                            </button>
                          )}
                          {codEnabled && (
                            <button type="button" onClick={() => setPayMethod('cod')}
                              className={`text-left rounded-2xl p-4 border-2 transition-all duration-200 hover:shadow-md
                                ${payMethod === 'cod' ? 'border-[#C9943A] bg-[#FFF7ED] shadow-md' : 'border-[#E6C7A8] bg-white hover:border-[#C9943A]/50'}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Banknote className="w-4 h-4 text-[#C9943A]" />
                                    <p className={`text-sm font-bold ${payMethod === 'cod' ? 'text-[#C9943A]' : 'text-[#3D1F0D]'}`}>Cash on Delivery</p>
                                  </div>
                                  <p className="text-xs text-[#9B6B50] leading-relaxed">Pay when your order is delivered.</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center
                                  ${payMethod === 'cod' ? 'border-[#C9943A] bg-[#C9943A]' : 'border-[#E6C7A8] bg-white'}`}>
                                  {payMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                              </div>
                            </button>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-[#9B6B50] mt-3 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#C9943A]" />
                        Your payment information is encrypted and secure.
                      </p>
                    </SectionCard>
                  </div>

                  {/* ── RIGHT: summary ── */}
                  <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
                    <CheckoutSummary cart={cart} subtotal={subtotal} submitting={submitting} payMethod={payMethod} onlineEnabled={onlineEnabled} />
                  </div>

                </div>
              </form>

              <TrustStrip />
            </>
          )}
        </div>

      </main>
      <Footer />
      {cart.length > 0 && <MobilePlaceOrderBar subtotal={subtotal} submitting={submitting} payMethod={payMethod} onlineEnabled={onlineEnabled} />}
    </div>
  )
}
