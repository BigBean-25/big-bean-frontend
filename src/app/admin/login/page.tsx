'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Eye, EyeOff, AlertCircle, ShieldCheck, Mail,
  Bell, Search, Users, ShoppingBag, Store,
  TrendingUp, CalendarDays, BarChart3, ArrowLeft,
  Sparkles, Lock
} from 'lucide-react'
import { apiRequest } from '@/utils/api'
import { saveAdminAuthData } from '@/lib/adminPermissions'

/* ── static data for preview panel ─────────────────────── */
const STATS = [
  { label: 'Outlets',   value: '7+',  Icon: Store,       color: 'text-[#2FBF9B]', bg: 'bg-[#DFF7EF]' },
  { label: 'Orders',    value: '128', Icon: ShoppingBag,  color: 'text-[#C9943A]', bg: 'bg-[#FFF3DE]' },
  { label: 'Customers', value: '2.4k',Icon: Users,        color: 'text-[#3D7FBF]', bg: 'bg-[#E3EFFE]' },
  { label: 'Enquiries', value: '18',  Icon: TrendingUp,   color: 'text-[#9B59B6]', bg: 'bg-[#F3E8FF]' },
]

const BARS   = [65, 80, 50, 90, 70, 95, 60]
const DAYS   = ['M','T','W','T','F','S','S']
const DATES  = Array.from({ length: 30 }, (_, i) => i + 1)
const ACTIVE = [4, 9, 15, 22, 28]

const ACTIVITY = [
  { text: 'New customer registered',    time: '2m ago',  dot: 'bg-[#2FBF9B]' },
  { text: 'Merchandise order received', time: '18m ago', dot: 'bg-[#C9943A]' },
  { text: 'Franchise enquiry received', time: '45m ago', dot: 'bg-[#3D7FBF]' },
  { text: 'Blog post updated',          time: '1h ago',  dot: 'bg-[#9B59B6]' },
]

export default function AdminLogin() {
  const [formData, setFormData]       = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState('')
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (response.ok && data.success) {
        const token = data.token
        const user  = data.user
        // permissions & menuAccess are now at top level of response
        const permissions = data.permissions || []
        const menuAccess  = data.menuAccess  || data.menu_access || {}

        saveAdminAuthData(token, user, permissions, menuAccess)
        router.replace('/admin/dashboard')
      } else {
        setError(data.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputBase =
    'w-full rounded-2xl border bg-[#F8FBF7] px-4 py-3 text-sm font-semibold text-[#1F2A24] outline-none transition placeholder:text-[#9DB0A1] focus:ring-4'

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#EEF4EF]">

      {/* ── background decorations ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* dot grid */}
        <div className="absolute inset-0 opacity-[0.045]"
          style={{ backgroundImage: 'radial-gradient(circle, #1F2A24 1.2px, transparent 1.2px)', backgroundSize: '24px 24px' }} />
        {/* blobs */}
        <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-[#2FBF9B] opacity-[0.09] blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-80px] h-[420px] w-[420px] rounded-full bg-[#C9943A] opacity-[0.08] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3D1F0D] opacity-[0.05] blur-3xl" />
      </div>

      {/* ── two-column grid ── */}
      <div className="relative z-10 grid min-h-screen items-center gap-8 px-5 py-8
                      lg:grid-cols-[0.9fr_1.1fr] lg:px-12 xl:px-20">

        {/* ════════════════════ LEFT — LOGIN CARD ════════════════════ */}
        <div className="mx-auto w-full max-w-[480px]">
          <div className="rounded-[34px] border border-white/80 bg-white/85
                          p-6 shadow-[0_28px_80px_rgba(31,42,36,0.12)] backdrop-blur-xl sm:p-8">

            {/* logo + badge */}
            <div className="mb-5 flex items-center justify-between">
              <Image
                src="/logo/big-bean-cafe-logo-transparent.png"
                alt="Big Bean Café"
                width={140}
                height={80}
                className="h-auto w-[120px] object-contain"
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE8DD]
                               bg-[#EEF4EF] px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#607064]">
                <ShieldCheck className="h-3 w-3 text-[#2FBF9B]" />
                Big Bean Admin
              </span>
            </div>

            {/* title */}
            <h1 className="font-heading text-[28px] font-black leading-tight text-[#1F2A24]">
              Welcome Admin
            </h1>
            <p className="mt-1.5 text-sm text-[#607064]">
              Manage outlets, menu, orders, customers and website content from one place.
            </p>

            {/* error */}
            {error && (
              <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <span className="text-sm font-bold text-red-700">{error}</span>
              </div>
            )}

            {/* form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* email */}
              <div>
                <label className="mb-1.5 block text-sm font-black text-[#1F2A24]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9DB0A1]" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="admin@bigbeancafe.in"
                    className={inputBase + ' border-[#DDE8DD] pl-11 focus:border-[#2FBF9B] focus:ring-[#2FBF9B]/15'}
                  />
                </div>
              </div>

              {/* password */}
              <div>
                <label className="mb-1.5 block text-sm font-black text-[#1F2A24]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9DB0A1]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your password"
                    className={inputBase + ' border-[#DDE8DD] pl-11 pr-12 focus:border-[#2FBF9B] focus:ring-[#2FBF9B]/15'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#9DB0A1]
                               transition hover:bg-[#EEF4EF] hover:text-[#1F2A24]"
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              {/* submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 w-full rounded-full bg-[#3D1F0D] py-3.5 text-sm font-black
                           tracking-wide text-[#FFF7ED] shadow-lg transition
                           hover:bg-[#2FBF9B] hover:text-[#120905] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Signing in…' : 'Sign In to Admin'}
              </button>
            </form>

            {/* demo credentials */}
            <div className="mt-5 rounded-[22px] border border-[#E6C7A8] bg-[#FFF7ED] p-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#6B3520]">
                <Sparkles className="h-3 w-3" />
                Demo Credentials
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-[#7A5A48]">
                  <span className="w-16 text-xs font-black uppercase tracking-wide text-[#9B7B65]">Email</span>
                  <code className="rounded-lg bg-white/80 px-2 py-0.5 text-xs font-bold text-[#3D1F0D]">
                    admin@bigbeancafe.in
                  </code>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#7A5A48]">
                  <span className="w-16 text-xs font-black uppercase tracking-wide text-[#9B7B65]">Password</span>
                  <code className="rounded-lg bg-white/80 px-2 py-0.5 text-xs font-bold text-[#3D1F0D]">
                    admin123
                  </code>
                </div>
              </div>
            </div>

            {/* security + back */}
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-[11px] text-[#9DB0A1]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#2FBF9B]" />
                Secure portal. Unauthorized access is prohibited.
              </p>
              <Link href="/"
                className="flex items-center gap-1 text-xs font-bold text-[#607064] transition hover:text-[#1F2A24]">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Website
              </Link>
            </div>
          </div>
        </div>

        {/* ════════════════════ RIGHT — DASHBOARD PREVIEW ════════════════════ */}
        <div className="hidden lg:block">
          <div className="relative rounded-[38px] border border-white/80 bg-white/60
                          p-6 shadow-xl backdrop-blur-xl">

            {/* fake admin top bar */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex flex-1 items-center gap-2 rounded-full border border-[#DDE8DD]
                              bg-[#F8FBF7] px-3.5 py-2 text-xs text-[#9DB0A1]">
                <Search className="h-3.5 w-3.5 shrink-0" />
                <span>Search anything…</span>
              </div>
              <div className="ml-3 flex items-center gap-2.5">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full
                                bg-[#EEF4EF] text-[#607064]">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#C9943A]" />
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full
                                bg-[#3D1F0D] text-xs font-black text-[#FFF7ED]">A</div>
              </div>
            </div>

            {/* hero label */}
            <div className="mb-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#2FBF9B]">
                Big Bean Control Center
              </p>
              <h2 className="font-heading text-xl font-black text-[#1F2A24]">Operations Overview</h2>
              <p className="mt-0.5 text-xs text-[#607064]">
                Saturday, July 2026
              </p>
            </div>

            {/* stat cards */}
            <div className="mb-4 grid grid-cols-4 gap-2.5">
              {STATS.map(({ label, value, Icon, color, bg }) => (
                <div key={label}
                  className="rounded-[18px] border border-[#DDE8DD] bg-white p-3 shadow-sm">
                  <div className={`mb-2 inline-flex rounded-xl p-1.5 ${bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  <p className="text-base font-black text-[#1F2A24]">{value}</p>
                  <p className="text-[10px] text-[#9DB0A1]">{label}</p>
                </div>
              ))}
            </div>

            {/* chart + calendar row */}
            <div className="mb-4 grid grid-cols-[1.4fr_1fr] gap-3">

              {/* bar chart */}
              <div className="rounded-[22px] border border-[#DDE8DD] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-black text-[#1F2A24]">Performance</p>
                  <BarChart3 className="h-3.5 w-3.5 text-[#9DB0A1]" />
                </div>
                <div className="flex items-end gap-1.5 h-[64px]">
                  {BARS.map((h, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md transition-all"
                        style={{
                          height: `${h * 0.64}px`,
                          background: h === 95
                            ? 'linear-gradient(180deg,#2FBF9B,#1a8f76)'
                            : 'linear-gradient(180deg,#DFF7EF,#c5edde)'
                        }}
                      />
                      <span className="text-[9px] text-[#9DB0A1]">{DAYS[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* mini calendar */}
              <div className="rounded-[22px] border border-[#DDE8DD] bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-black text-[#1F2A24]">July 2026</p>
                  <CalendarDays className="h-3.5 w-3.5 text-[#9DB0A1]" />
                </div>
                <div className="grid grid-cols-7 gap-[3px]">
                  {['M','T','W','T','F','S','S'].map((d, i) => (
                    <span key={i} className="text-center text-[8px] font-black text-[#9DB0A1]">{d}</span>
                  ))}
                  {/* offset for July 2026 starting Tuesday */}
                  <span />
                  {DATES.map(d => (
                    <span key={d}
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold mx-auto
                        ${d === 5 ? 'bg-[#3D1F0D] text-white' : ACTIVE.includes(d) ? 'bg-[#DFF7EF] text-[#2FBF9B]' : 'text-[#607064]'}`}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* recent activity */}
            <div className="rounded-[22px] border border-[#DDE8DD] bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-black text-[#1F2A24]">Recent Activity</p>
              <div className="space-y-2.5">
                {ACTIVITY.map((a, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${a.dot}`} />
                    <span className="flex-1 text-[11px] text-[#1F2A24]">{a.text}</span>
                    <span className="text-[10px] text-[#9DB0A1]">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* floating mini cards */}
            <div className="absolute -right-5 top-24 w-[140px] rounded-2xl border border-white/90
                            bg-white p-3.5 shadow-[0_12px_40px_rgba(31,42,36,0.13)]">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#9DB0A1]">Today Sales</p>
              <p className="mt-1 text-xl font-black text-[#1F2A24]">₹18,420</p>
              <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-[#2FBF9B]">
                <TrendingUp className="h-3 w-3" />
                +12.4% vs yesterday
              </div>
            </div>

            <div className="absolute -right-5 bottom-32 w-[140px] rounded-2xl border border-white/90
                            bg-white p-3.5 shadow-[0_12px_40px_rgba(31,42,36,0.13)]">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#9DB0A1]">Customer Growth</p>
              <p className="mt-1 text-xl font-black text-[#1F2A24]">+148</p>
              <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-[#C9943A]">
                <Users className="h-3 w-3" />
                This month
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
