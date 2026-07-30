'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { saveCustomerSession } from '@/lib/customerAuth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const inputCls =
  'w-full rounded-2xl border border-[#E6C7A8] bg-[#FFF7ED]/90 px-4 text-sm font-semibold text-[#3D1F0D] outline-none transition placeholder:text-[#A98A74] focus:border-[#C9943A] focus:ring-4 focus:ring-[#C9943A]/10'

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
    if (!form.full_name.trim())                  { setError('Full name is required'); return }
    if (!form.email && !form.phone)              { setError('Email or mobile number is required'); return }
    if (form.password.length < 6)                { setError('Password must be at least 6 characters'); return }
    if (form.password !== form.confirm_password) { setError('Passwords do not match'); return }

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
    /* Root: position fixed + inset 0 = guaranteed exact viewport */
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
            Create Your Account
          </h1>
          <p style={{ fontSize: 11, color: '#7A5A48', marginBottom: 8, lineHeight: 1.4 }}>
            Join Big Bean Café — manage orders, rewards and your profile.
          </p>

          {/* Messages */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700"
              style={{ marginBottom: 6 }}>{error}</div>
          )}
          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700"
              style={{ marginBottom: 6 }}>{success}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-black text-[#3D1F0D]" style={{ marginBottom: 3 }}>Full Name *</label>
              <input type="text" value={form.full_name} required
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Your full name" className={inputCls} style={{ height: 44 }} />
            </div>

            {/* Email + Phone — 2 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label className="block text-xs font-black text-[#3D1F0D]" style={{ marginBottom: 3 }}>Email</label>
                <input type="email" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="your@email.com" className={inputCls} style={{ height: 44 }} />
              </div>
              <div>
                <label className="block text-xs font-black text-[#3D1F0D]" style={{ marginBottom: 3 }}>Mobile</label>
                <input type="tel" value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="9999999999" className={inputCls} style={{ height: 44 }} />
              </div>
            </div>

            {/* Password + Confirm — 2 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label className="block text-xs font-black text-[#3D1F0D]" style={{ marginBottom: 3 }}>Password *</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password} required
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min 6 chars" className={inputCls + ' pr-10'} style={{ height: 44 }} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A98A74] hover:text-[#3D1F0D]">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-[#3D1F0D]" style={{ marginBottom: 3 }}>Confirm *</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} value={form.confirm_password} required
                    onChange={e => setForm(p => ({ ...p, confirm_password: e.target.value }))}
                    placeholder="Re-enter" className={inputCls + ' pr-10'} style={{ height: 44 }} />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A98A74] hover:text-[#3D1F0D]">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={submitting}
              className="w-full rounded-full bg-[#3D1F0D] text-sm font-black tracking-wide text-[#FFF7ED] transition hover:bg-[#C9943A] hover:text-[#120905] disabled:opacity-60"
              style={{ height: 46 }}>
              {submitting ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, color: '#A98A74' }}>🔒 Secure registration.</span>
            <span style={{ fontSize: 12, color: '#7A5A48' }}>
              Have an account?{' '}
              <Link href="/login" className="font-black text-[#3D1F0D] hover:underline">Login</Link>
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
