'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { saveCustomerSession } from '@/lib/customerAuth'
import AuthLayout from '@/components/AuthLayout'

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
    <AuthLayout>
      <div className="rounded-[28px] border border-[#E6C7A8]/70 bg-white/72 p-6 shadow-[0_24px_70px_rgba(61,31,13,0.16)] backdrop-blur-xl sm:p-7">

        {/* Badge + Logo */}
        <div className="mb-5 flex items-center justify-between">
          <span className="rounded-full border border-[#E6C7A8] bg-[#FFF7ED] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#6B3520]">
            Big Bean Café Customer
          </span>
          <Image
            src="/logo/big-bean-cafe-logo-transparent.png"
            alt="Big Bean Café"
            width={160} height={72} priority
            className="h-auto w-[80px] sm:w-[95px] lg:w-[120px] object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="font-heading text-2xl font-black leading-tight text-[#2A120B]">Create Your Account</h1>
        <p className="mt-1 text-sm text-[#7A5A48]">Join Big Bean Café — manage orders, rewards and your profile.</p>

        {/* Messages */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</div>
        )}
        {success && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-green-700">{success}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">

          {/* Full Name */}
          <div>
            <label className="mb-1 block text-xs font-black text-[#3D1F0D]">Full Name *</label>
            <input type="text" value={form.full_name} required
              onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Your full name" className={inputCls} />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-black text-[#3D1F0D]">Email</label>
              <input type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="your@email.com" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-black text-[#3D1F0D]">Mobile</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="9999999999" className={inputCls} />
            </div>
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-black text-[#3D1F0D]">Password *</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} required
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min 6 chars" className={inputCls + ' pr-10'} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A98A74] hover:text-[#3D1F0D]">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-black text-[#3D1F0D]">Confirm *</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={form.confirm_password} required
                  onChange={e => setForm(p => ({ ...p, confirm_password: e.target.value }))}
                  placeholder="Re-enter" className={inputCls + ' pr-10'} />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A98A74] hover:text-[#3D1F0D]">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="mt-1 w-full rounded-full bg-[#3D1F0D] py-3 text-sm font-black tracking-wide text-[#FFF7ED] transition hover:bg-[#C9943A] hover:text-[#120905] disabled:opacity-60">
            {submitting ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] text-[#A98A74]">🔒 Secure registration.</span>
          <span className="text-sm text-[#7A5A48]">
            Have an account?{' '}
            <Link href="/login" className="font-black text-[#3D1F0D] hover:underline">Login</Link>
          </span>
        </div>
        <div className="mt-2 text-center">
          <Link href="/" className="text-xs font-semibold text-[#A98A74] hover:text-[#3D1F0D] hover:underline">
            ← Back to Big Bean Café
          </Link>
        </div>

      </div>
    </AuthLayout>
  )
}
