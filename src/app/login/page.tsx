'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LayoutDashboard, Package, Star, HeadphonesIcon } from 'lucide-react'
import { saveCustomerSession } from '@/lib/customerAuth'
import AuthLayout from '@/components/AuthLayout'

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
        <h1 className="font-heading text-2xl font-black leading-tight text-[#2A120B]">Welcome Back</h1>
        <p className="mt-1 text-sm text-[#7A5A48]">Login to continue your Big Bean Café experience.</p>

        {/* Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {CHIPS.map(({ label, Icon }) => (
            <span key={label}
              className="inline-flex items-center gap-1 rounded-full border border-[#E6C7A8] bg-[#FFF7ED] px-2.5 py-1 text-[10px] font-black text-[#6B3520]">
              <Icon className="h-3 w-3 shrink-0" />{label}
            </span>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">

          <div>
            <label className="mb-1 block text-xs font-black text-[#3D1F0D]">Email / Mobile Number</label>
            <input type="text" value={form.identifier} required
              onChange={e => setForm(p => ({ ...p, identifier: e.target.value }))}
              placeholder="your@email.com or 9999999999"
              className={inputCls} />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-black text-[#3D1F0D]">Password</label>
              <Link href="/forgot-password" className="text-[11px] font-bold text-[#C9943A] hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} required
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Enter your password"
                className={inputCls + ' pr-10'} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A98A74] hover:text-[#3D1F0D]">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="mt-1 w-full rounded-full bg-[#3D1F0D] py-3 text-sm font-black tracking-wide text-[#FFF7ED] transition hover:bg-[#C9943A] hover:text-[#120905] disabled:opacity-60">
            {submitting ? 'Logging in…' : 'Login to My Account'}
          </button>

          <a href="https://bigbeancafe.store" target="_blank" rel="noopener noreferrer"
            className="block w-full rounded-full border-2 border-[#3D1F0D] py-3 text-center text-sm font-black text-[#3D1F0D] transition hover:bg-[#FFF7ED]">
            Continue as Guest
          </a>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-[#E6C7A8]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A98A74]">or continue with</span>
            <div className="h-px flex-1 bg-[#E6C7A8]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => handleComingSoon('Google')}
              className="flex items-center justify-center gap-2 rounded-full border border-[#E6C7A8] bg-white/90 py-2.5 text-xs font-black text-[#3D1F0D] hover:bg-[#FFF7ED]">
              <img src="/images/icons/google.svg" alt="Google" className="h-4 w-4 object-contain" />
              Google
            </button>
            <button type="button" onClick={() => handleComingSoon('Facebook')}
              className="flex items-center justify-center gap-2 rounded-full border border-[#E6C7A8] bg-white/90 py-2.5 text-xs font-black text-[#3D1F0D] hover:bg-[#FFF7ED]">
              <img src="/images/icons/facebook.svg" alt="Facebook" className="h-4 w-4 object-contain" />
              Facebook
            </button>
          </div>
        </form>

        {socialMsg && (
          <div className="mt-3 rounded-xl border border-[#E6C7A8] bg-[#FFF7ED] px-3 py-2 text-xs font-bold text-[#6B3520]">{socialMsg}</div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] text-[#A98A74]">🔒 Secure login.</span>
          <span className="text-sm text-[#7A5A48]">
            No account?{' '}
            <Link href="/register" className="font-black text-[#3D1F0D] hover:underline">Register</Link>
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
