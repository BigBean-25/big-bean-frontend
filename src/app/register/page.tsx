'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { saveCustomerSession } from '@/lib/customerAuth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const inputCls =
  'w-full rounded-2xl border border-[#E6C7A8] bg-[#FFF7ED]/90 px-4 py-3 text-sm font-semibold text-[#3D1F0D] outline-none transition placeholder:text-[#A98A74] focus:border-[#C9943A] focus:ring-4 focus:ring-[#C9943A]/10'

export default function CustomerRegister() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' })
  const [showPw, setShowPw]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('')
    if (!form.full_name.trim())                      { setError('Full name is required'); return }
    if (!form.email && !form.phone)                  { setError('Email or mobile number is required'); return }
    if (form.password.length < 6)                    { setError('Password must be at least 6 characters'); return }
    if (form.password !== form.confirm_password)     { setError('Passwords do not match'); return }

    setSubmitting(true)
    try {
      const res  = await fetch(`${API_URL}/customer-auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email:     form.email  || undefined,
          phone:     form.phone  || undefined,
          password:  form.password,
        }),
      })
      const data = await res.json()
      if (data.success) {
        if (data.token) {
          saveCustomerSession(data.token, data.data)
          window.dispatchEvent(new Event('bigbean-customer-auth-updated'))
          router.push('/customer/dashboard')
        } else {
          setSuccess('Account created! Redirecting to login…')
          setTimeout(() => router.push('/login'), 1500)
        }
      } else {
        setError(data.message || 'Registration failed. Please try again.')
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
            Create Your Account
          </h1>
          <p className="mt-0.5 text-[11px] leading-snug text-[#7A5A48]">
            Join Big Bean Café and manage your orders, rewards and profile.
          </p>

          {/* Messages */}
          {error && (
            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</div>
          )}
          {success && (
            <div className="mt-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-green-700">{success}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-2 space-y-2">

            {/* Full Name */}
            <div>
              <label className="mb-0.5 block text-xs font-black text-[#3D1F0D]">Full Name *</label>
              <input type="text" value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Your full name" required className={inputCls} />
            </div>

            {/* Email + Phone — 2 columns */}
            <div className="grid gap-2 grid-cols-2">
              <div>
                <label className="mb-0.5 block text-xs font-black text-[#3D1F0D]">Email</label>
                <input type="email" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="your@email.com" className={inputCls} />
              </div>
              <div>
                <label className="mb-0.5 block text-xs font-black text-[#3D1F0D]">Mobile</label>
                <input type="tel" value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="9999999999" className={inputCls} />
              </div>
            </div>

            {/* Password + Confirm — 2 columns */}
            <div className="grid gap-2 grid-cols-2">
              <div>
                <label className="mb-0.5 block text-xs font-black text-[#3D1F0D]">Password *</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min 6 chars" required className={inputCls + ' pr-10'} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A98A74] hover:text-[#3D1F0D]">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-0.5 block text-xs font-black text-[#3D1F0D]">Confirm *</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} value={form.confirm_password}
                    onChange={e => setForm(p => ({ ...p, confirm_password: e.target.value }))}
                    placeholder="Re-enter" required className={inputCls + ' pr-10'} />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A98A74] hover:text-[#3D1F0D]">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={submitting}
              className="w-full rounded-full bg-[#3D1F0D] py-3 text-sm font-black tracking-wide text-[#FFF7ED] transition hover:bg-[#C9943A] hover:text-[#120905] disabled:opacity-60">
              {submitting ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[10px] text-[#A98A74]">🔒 Secure registration.</p>
            <p className="text-xs text-[#7A5A48]">
              Have an account?{' '}
              <Link href="/login" className="font-black text-[#3D1F0D] hover:underline">Login</Link>
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
