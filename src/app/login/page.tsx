'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LayoutDashboard, Package, Star, HeadphonesIcon } from 'lucide-react'
import { saveCustomerSession } from '@/lib/customerAuth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const CHIPS = [
  { label: 'Customer Dashboard', Icon: LayoutDashboard },
  { label: 'Order History',      Icon: Package         },
  { label: 'Big Coins',          Icon: Star            },
  { label: 'Quick Support',      Icon: HeadphonesIcon  },
]

const inputCls =
  'w-full rounded-2xl border border-[#E6C7A8] bg-[#FFF7ED]/90 px-4 py-2.5 text-sm font-semibold text-[#3D1F0D] outline-none transition placeholder:text-[#A98A74] focus:border-[#C9943A] focus:ring-4 focus:ring-[#C9943A]/10'

export default function CustomerLogin() {
  const router = useRouter()
  const [form, setForm]             = useState({ identifier: '', password: '' })
  const [showPw, setShowPw]         = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [socialMsg, setSocialMsg]   = useState('')

  const handleComingSoon = (provider: string) => {
    setSocialMsg(`${provider} login will be available soon.`)
    setTimeout(() => setSocialMsg(''), 2500)
  }

  // Lock body scroll while on this page
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.identifier.trim() || !form.password) { setError('Please enter email/phone and password'); return }
    setSubmitting(true); setError('')
    try {
      const res  = await fetch(`${API_URL}/customer-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: form.identifier.trim(), password: form.password }),
      })
      const data = await res.json()
      if (data.success) {
        saveCustomerSession(data.token, data.data)
        window.dispatchEvent(new Event('bigbean-customer-auth-updated'))
        router.push('/customer/dashboard')
      } else {
        setError(data.message || 'Login failed. Please try again.')
      }
    } catch {
      setError('Unable to connect. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    /* h-[100svh] + overflow-hidden — no page scroll */
    <div className="relative h-[100svh] w-full overflow-hidden bg-[#FFF7ED]">

      {/* Full-screen background */}
      <img
        src="/images/auth/customer-auth-bg.png"
        alt="Big Bean Café Customer Login"
        className="absolute inset-0 h-full w-full object-cover object-right"
      />

      {/* Soft left overlay — right character stays clear */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FFF7ED]/96 via-[#FFF7ED]/78 to-transparent" />

      {/* Centred form column — left half */}
      <div className="relative z-10 flex h-[100svh] items-center px-4 sm:px-6 lg:px-10">
        <div className="w-full max-w-[500px] lg:ml-[6vw]">

          {/* Card — inner scroll on very small screens */}
          <div className="max-h-[92vh] max-h-[calc(100svh-32px)] overflow-y-auto rounded-[28px] border border-[#E6C7A8]/70 bg-white/72 p-5 shadow-[0_24px_70px_rgba(61,31,13,0.16)] backdrop-blur-xl sm:max-h-[92vh] sm:p-6 lg:p-7">

            {/* Badge + Logo */}
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full border border-[#E6C7A8] bg-[#FFF7ED] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#6B3520]">
                Big Bean Café Customer
              </span>
              <Image
                src="/logo/big-bean-cafe-logo-transparent.png"
                alt="Big Bean Café"
                width={105}
                height={48}
                className="w-[90px] md:w-[105px] object-contain"
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            </div>

            {/* Title */}
            <h1 className="font-heading text-2xl font-black leading-tight text-[#2A120B]">
              Welcome Back
            </h1>
            <p className="mt-1 text-xs text-[#7A5A48]">
              Login to continue your Big Bean Café experience.
            </p>

            {/* Benefit chips — hidden on mobile to save height */}
            <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
              {CHIPS.map(({ label, Icon }) => (
                <span key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E6C7A8] bg-[#FFF7ED] px-2.5 py-0.5 text-[10px] font-black text-[#6B3520]">
                  <Icon className="h-2.5 w-2.5 shrink-0" />
                  {label}
                </span>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1 block text-sm font-black text-[#3D1F0D]">Email / Mobile Number</label>
                <input
                  type="text"
                  value={form.identifier}
                  onChange={e => setForm(p => ({ ...p, identifier: e.target.value }))}
                  placeholder="your@email.com or 9999999999"
                  required
                  className={inputCls}
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-black text-[#3D1F0D]">Password</label>
                  <Link href="/forgot-password" className="text-xs font-bold text-[#C9943A] hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Enter your password"
                    required
                    className={inputCls + ' pr-10'}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A98A74] transition hover:text-[#3D1F0D]">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Login */}
              <button type="submit" disabled={submitting}
                className="w-full rounded-full bg-[#3D1F0D] py-3 text-sm font-black tracking-wide text-[#FFF7ED] transition hover:bg-[#C9943A] hover:text-[#120905] disabled:opacity-60">
                {submitting ? 'Logging in…' : 'Login to My Account'}
              </button>

              {/* Guest */}
              <a href="https://bigbeancafe.store" target="_blank" rel="noopener noreferrer"
                className="block w-full rounded-full border-2 border-[#3D1F0D] py-3 text-center text-sm font-black text-[#3D1F0D] transition hover:bg-[#FFF7ED]">
                Continue as Guest
              </a>

              {/* Divider */}
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#E6C7A8]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A98A74]">or continue with</span>
                <div className="h-px flex-1 bg-[#E6C7A8]" />
              </div>

              {/* Google */}
              <button type="button" onClick={() => handleComingSoon('Google')}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-[#E6C7A8] bg-white/90 px-5 py-3 text-sm font-black text-[#3D1F0D] transition hover:-translate-y-0.5 hover:bg-[#FFF7ED] hover:shadow-md">
                <img src="/images/icons/google.svg" alt="Google" className="h-5 w-5 object-contain" />
                <span>Continue with Google</span>
              </button>

              {/* Facebook */}
              <button type="button" onClick={() => handleComingSoon('Facebook')}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-[#E6C7A8] bg-white/90 px-5 py-3 text-sm font-black text-[#3D1F0D] transition hover:-translate-y-0.5 hover:bg-[#FFF7ED] hover:shadow-md">
                <img src="/images/icons/facebook.svg" alt="Facebook" className="h-5 w-5 object-contain" />
                <span>Continue with Facebook</span>
              </button>
            </form>

            {/* Social coming soon */}
            {socialMsg && (
              <div className="mt-3 rounded-2xl border border-[#E6C7A8] bg-[#FFF7ED] px-4 py-2.5 text-sm font-bold text-[#6B3520]">
                {socialMsg}
              </div>
            )}

            {/* Trust + links */}
            <p className="mt-4 text-center text-[11px] text-[#A98A74]">🔒 Secure customer login for Big Bean Café.</p>
            <p className="mt-2.5 text-center text-sm text-[#7A5A48]">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-black text-[#3D1F0D] hover:underline">Register</Link>
            </p>
            <div className="mt-2 text-center">
              <Link href="/" className="text-xs font-semibold text-[#A98A74] hover:text-[#3D1F0D] hover:underline">
                ← Back to Big Bean Café
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
