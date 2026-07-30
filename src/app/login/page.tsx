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
  'w-full rounded-2xl border border-[#E6C7A8] bg-[#FFF7ED]/90 px-4 text-sm font-semibold text-[#3D1F0D] outline-none transition placeholder:text-[#A98A74] focus:border-[#C9943A] focus:ring-4 focus:ring-[#C9943A]/10'

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
    /* Root: position fixed + inset 0 = guaranteed exact viewport, no parent overflow ever */
    <div
      className="bg-[#FFF7ED] min-[900px]:grid min-[900px]:grid-cols-[50%_50%] min-[1180px]:grid-cols-[42%_58%]"
      style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}
    >

      {/* ── Left panel ── */}
      <div
        style={{
          height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '18px 22px', overflow: 'hidden', position: 'relative',
        }}
      >
        {/* Mobile background */}
        <img src="/images/auth/customer-auth-bg.png" alt="" aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-right min-[900px]:hidden" />
        <div className="absolute inset-0 bg-[#FFF7ED]/93 min-[900px]:hidden" />

        {/* Card */}
        <div
          className="relative z-10 w-full max-w-[520px] rounded-[20px] border border-[#E6C7A8]/70 bg-white/93 shadow-[0_16px_50px_rgba(61,31,13,0.12)] backdrop-blur-xl"
          style={{
            maxHeight: 'calc(100vh - 36px)', overflow: 'hidden',
            padding: 'clamp(14px, 1.6vw, 22px)', boxSizing: 'border-box',
          }}
        >

          {/* Badge + Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="rounded-full border border-[#E6C7A8] bg-[#FFF7ED] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.13em] text-[#6B3520]">
              Big Bean Café Customer
            </span>
            <Image
              src="/logo/big-bean-cafe-logo-transparent.png" alt="Big Bean Café"
              width={120} height={54} priority
              className="object-contain"
              style={{ width: 'clamp(76px, 7.5vw, 120px)', height: 'auto', maxWidth: 120 }}
            />
          </div>

          {/* Title */}
          <h1 className="font-heading font-black leading-tight text-[#2A120B]"
            style={{ fontSize: 'clamp(18px, 1.6vw, 22px)', marginBottom: 4 }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: 11, color: '#7A5A48', marginBottom: 6, lineHeight: 1.4 }}>
            Login to continue your Big Bean Café experience.
          </p>

          {/* Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {CHIPS.map(({ label, Icon }) => (
              <span key={label}
                className="inline-flex items-center gap-1 rounded-full border border-[#E6C7A8] bg-[#FFF7ED] px-2 py-[2px] text-[9px] font-black text-[#6B3520]">
                <Icon className="h-2 w-2 shrink-0" />{label}
              </span>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700"
              style={{ marginBottom: 6 }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            <div>
              <label className="block text-xs font-black text-[#3D1F0D]" style={{ marginBottom: 3 }}>
                Email / Mobile Number
              </label>
              <input type="text" value={form.identifier} required
                onChange={e => setForm(p => ({ ...p, identifier: e.target.value }))}
                placeholder="your@email.com or 9999999999"
                className={inputCls} style={{ height: 44 }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <label className="text-xs font-black text-[#3D1F0D]">Password</label>
                <Link href="/forgot-password" className="text-[10px] font-bold text-[#C9943A] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} required
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  className={inputCls + ' pr-10'} style={{ height: 44 }} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A98A74] hover:text-[#3D1F0D]">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full rounded-full bg-[#3D1F0D] text-sm font-black tracking-wide text-[#FFF7ED] transition hover:bg-[#C9943A] hover:text-[#120905] disabled:opacity-60"
              style={{ height: 46 }}>
              {submitting ? 'Logging in…' : 'Login to My Account'}
            </button>

            <a href="https://bigbeancafe.store" target="_blank" rel="noopener noreferrer"
              className="block w-full rounded-full border-2 border-[#3D1F0D] text-center text-sm font-black text-[#3D1F0D] transition hover:bg-[#FFF7ED]"
              style={{ height: 46, lineHeight: '42px' }}>
              Continue as Guest
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="h-px flex-1 bg-[#E6C7A8]" />
              <span style={{ fontSize: 9, color: '#A98A74', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                or continue with
              </span>
              <div className="h-px flex-1 bg-[#E6C7A8]" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button type="button" onClick={() => handleComingSoon('Google')}
                className="flex items-center justify-center gap-2 rounded-full border border-[#E6C7A8] bg-white/90 text-xs font-black text-[#3D1F0D] hover:bg-[#FFF7ED]"
                style={{ height: 42 }}>
                <img src="/images/icons/google.svg" alt="Google" className="h-4 w-4 object-contain" />
                Google
              </button>
              <button type="button" onClick={() => handleComingSoon('Facebook')}
                className="flex items-center justify-center gap-2 rounded-full border border-[#E6C7A8] bg-white/90 text-xs font-black text-[#3D1F0D] hover:bg-[#FFF7ED]"
                style={{ height: 42 }}>
                <img src="/images/icons/facebook.svg" alt="Facebook" className="h-4 w-4 object-contain" />
                Facebook
              </button>
            </div>
          </form>

          {socialMsg && (
            <div className="rounded-xl border border-[#E6C7A8] bg-[#FFF7ED] px-3 py-1.5 text-xs font-bold text-[#6B3520]"
              style={{ marginTop: 6 }}>
              {socialMsg}
            </div>
          )}

          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, color: '#A98A74' }}>🔒 Secure login.</span>
            <span style={{ fontSize: 12, color: '#7A5A48' }}>
              No account?{' '}
              <Link href="/register" className="font-black text-[#3D1F0D] hover:underline">Register</Link>
            </span>
          </div>
          <div style={{ marginTop: 4, textAlign: 'center' }}>
            <Link href="/" className="text-[10px] font-semibold text-[#A98A74] hover:text-[#3D1F0D] hover:underline">
              ← Back to Big Bean Café
            </Link>
          </div>

        </div>
      </div>

      {/* ── Right panel — desktop only ── */}
      <div style={{ height: '100vh', overflow: 'hidden', position: 'relative', display: 'none' }}
        className="min-[900px]:block">
        <img
          src="/images/auth/customer-auth-bg.png" alt="Big Bean Café"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '65% center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#FFF7ED]/20" />
      </div>

    </div>
  )
}
