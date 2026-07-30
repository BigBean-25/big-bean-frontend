'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LayoutDashboard, Package, Star, HeadphonesIcon } from 'lucide-react'
import { saveCustomerSession } from '@/lib/customerAuth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const CHIPS = [
  { label: 'Dashboard', Icon: LayoutDashboard },
  { label: 'Orders',    Icon: Package         },
  { label: 'Big Coins', Icon: Star            },
  { label: 'Support',   Icon: HeadphonesIcon  },
]

const inputCls =
  'w-full rounded-2xl border border-[#E6C7A8] bg-[#FFF7ED]/90 px-4 py-3 text-sm font-semibold text-[#3D1F0D] outline-none transition placeholder:text-[#A98A74] focus:border-[#C9943A] focus:ring-4 focus:ring-[#C9943A]/10'

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
    /* Root — exact 100vh, no overflow, two-column grid on 900px+ */
    <div
      className="w-full bg-[#FFF7ED] min-[900px]:grid min-[900px]:grid-cols-[42%_58%]"
      style={{ height: '100vh', overflow: 'hidden' }}
    >

      {/* ── Left panel ── */}
      <div
        className="relative flex h-full items-center justify-center overflow-hidden"
        style={{ padding: 'clamp(14px, 2vw, 28px)' }}
      >
        {/* Background image — single-column view only (< 900px) */}
        <img
          src="/images/auth/customer-auth-bg.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-right min-[900px]:hidden"
        />
        <div className="absolute inset-0 bg-[#FFF7ED]/93 min-[900px]:hidden" />

        {/* Form card */}
        <div
          className="relative z-10 w-full max-w-[520px] rounded-[22px] border border-[#E6C7A8]/70 bg-white/92 shadow-[0_20px_60px_rgba(61,31,13,0.13)] backdrop-blur-xl"
          style={{ maxHeight: 'calc(100vh - 48px)', overflow: 'hidden', padding: 'clamp(18px, 2vw, 26px)', boxSizing: 'border-box' }}
        >

          {/* Badge + Logo */}
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-full border border-[#E6C7A8] bg-[#FFF7ED] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#6B3520]">
              Big Bean Café Customer
            </span>
            <Image
              src="/logo/big-bean-cafe-logo-transparent.png"
              alt="Big Bean Café"
              width={140}
              height={64}
              className="object-contain"
              style={{ width: 'clamp(80px, 9vw, 140px)', height: 'auto', maxWidth: '140px' }}
              priority
            />
          </div>

          {/* Title + subtitle */}
          <h1 className="font-heading text-xl font-black leading-tight text-[#2A120B] sm:text-2xl">
            Welcome Back
          </h1>
          <p className="mt-0.5 text-[11px] leading-snug text-[#7A5A48]">
            Login to continue your Big Bean Café experience.
          </p>

          {/* Benefit chips */}
          <div className="mt-1.5 flex flex-wrap gap-1">
            {CHIPS.map(({ label, Icon }) => (
              <span key={label}
                className="inline-flex items-center gap-1 rounded-full border border-[#E6C7A8] bg-[#FFF7ED] px-2 py-[3px] text-[9px] font-black text-[#6B3520]">
                <Icon className="h-2 w-2 shrink-0" />
                {label}
              </span>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-2 space-y-2">
            <div>
              <label className="mb-0.5 block text-xs font-black text-[#3D1F0D]">Email / Mobile Number</label>
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
              <div className="mb-0.5 flex items-center justify-between">
                <label className="text-xs font-black text-[#3D1F0D]">Password</label>
                <Link href="/forgot-password" className="text-[10px] font-bold text-[#C9943A] hover:underline">
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
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-[#E6C7A8]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#A98A74]">or continue with</span>
              <div className="h-px flex-1 bg-[#E6C7A8]" />
            </div>

            {/* Social — side-by-side to save vertical space */}
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => handleComingSoon('Google')}
                className="flex items-center justify-center gap-2 rounded-full border border-[#E6C7A8] bg-white/90 py-2.5 text-xs font-black text-[#3D1F0D] transition hover:bg-[#FFF7ED]">
                <img src="/images/icons/google.svg" alt="Google" className="h-4 w-4 object-contain" />
                Google
              </button>
              <button type="button" onClick={() => handleComingSoon('Facebook')}
                className="flex items-center justify-center gap-2 rounded-full border border-[#E6C7A8] bg-white/90 py-2.5 text-xs font-black text-[#3D1F0D] transition hover:bg-[#FFF7ED]">
                <img src="/images/icons/facebook.svg" alt="Facebook" className="h-4 w-4 object-contain" />
                Facebook
              </button>
            </div>
          </form>

          {/* Social coming soon */}
          {socialMsg && (
            <div className="mt-2 rounded-xl border border-[#E6C7A8] bg-[#FFF7ED] px-3 py-1.5 text-xs font-bold text-[#6B3520]">
              {socialMsg}
            </div>
          )}

          {/* Footer */}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[10px] text-[#A98A74]">🔒 Secure login.</p>
            <p className="text-xs text-[#7A5A48]">
              No account?{' '}
              <Link href="/register" className="font-black text-[#3D1F0D] hover:underline">Register</Link>
            </p>
          </div>
          <div className="mt-1 text-center">
            <Link href="/" className="text-[10px] font-semibold text-[#A98A74] hover:text-[#3D1F0D] hover:underline">
              ← Back to Big Bean Café
            </Link>
          </div>

        </div>
      </div>

      {/* ── Right panel — image, desktop only ── */}
      <div
        className="relative hidden h-full overflow-hidden min-[900px]:block"
      >
        <img
          src="/images/auth/customer-auth-bg.png"
          alt="Big Bean Café"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#FFF7ED]/25" />
      </div>

    </div>
  )
}
