'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { saveCustomerSession } from '@/lib/customerAuth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const inputCls =
  'w-full rounded-2xl border border-[#E6C7A8] bg-[#FFF7ED]/90 px-4 py-2.5 text-sm font-semibold text-[#3D1F0D] outline-none transition placeholder:text-[#A98A74] focus:border-[#C9943A] focus:ring-4 focus:ring-[#C9943A]/10'

export default function CustomerRegister() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' })
  const [showPw, setShowPw]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')

  // Lock body scroll while on this page
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

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
    /* h-screen + overflow-hidden — no page scroll */
    <div className="relative h-screen w-full overflow-hidden bg-[#FFF7ED]">

      {/* Full-screen background */}
      <img
        src="/images/auth/customer-auth-bg.png"
        alt="Big Bean Café Register"
        className="absolute inset-0 h-full w-full object-cover object-right"
      />

      {/* Soft left overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FFF7ED]/96 via-[#FFF7ED]/78 to-transparent" />

      {/* Centred form column — left half */}
      <div className="relative z-10 flex h-screen items-center px-4 sm:px-6 lg:px-10">
        <div className="w-full max-w-[500px] lg:ml-[6vw]">

          {/* Card — inner scroll on very small screens */}
          <div className="max-h-[92vh] overflow-y-auto rounded-[28px] border border-[#E6C7A8]/70 bg-white/72 p-5 shadow-[0_24px_70px_rgba(61,31,13,0.16)] backdrop-blur-xl sm:p-6 lg:p-7">

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
              Create Your Account
            </h1>
            <p className="mt-1 text-xs text-[#7A5A48]">
              Join Big Bean Café and manage your orders, rewards and profile.
            </p>

            {/* Messages */}
            {error && (
              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700">{error}</div>
            )}
            {success && (
              <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700">{success}</div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">

              {/* Full Name — full width */}
              <div>
                <label className="mb-1 block text-sm font-black text-[#3D1F0D]">Full Name *</label>
                <input type="text" value={form.full_name}
                  onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Your full name" required className={inputCls} />
              </div>

              {/* Email + Phone — 2 columns on sm+ */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-black text-[#3D1F0D]">Email</label>
                  <input type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="your@email.com" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-black text-[#3D1F0D]">Mobile Number</label>
                  <input type="tel" value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="9999999999" className={inputCls} />
                </div>
              </div>

              {/* Password + Confirm — 2 columns on sm+ */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-black text-[#3D1F0D]">Password *</label>
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
                  <label className="mb-1 block text-sm font-black text-[#3D1F0D]">Confirm Password *</label>
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

            {/* Trust + links */}
            <p className="mt-4 text-center text-[11px] text-[#A98A74]">🔒 Secure customer registration for Big Bean Café.</p>
            <p className="mt-2.5 text-center text-sm text-[#7A5A48]">
              Already have an account?{' '}
              <Link href="/login" className="font-black text-[#3D1F0D] hover:underline">Login</Link>
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
