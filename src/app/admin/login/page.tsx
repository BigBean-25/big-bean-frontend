'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Eye, EyeOff, AlertCircle, ShieldCheck, Mail,
  Bell, Search, Users, ShoppingBag, Store,
  TrendingUp, CalendarDays, BarChart3, ArrowLeft,
  Lock
} from 'lucide-react'
import { apiRequest } from '@/utils/api'
import { saveAdminAuthData } from '@/lib/adminPermissions'
import styles from './page.module.css'

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

  return (
    <div className={styles.page}>

      {/* ── background decorations ── */}
      <div className={styles.bgDecor}>
        <div className={styles.dotGrid} />
        <div className={styles.blobGreen} />
        <div className={styles.blobBrown} />
        <div className={styles.blobDark} />
      </div>

      <div className={styles.grid}>

        {/* ════════════════════ LEFT — LOGIN CARD ════════════════════ */}
        <div className={styles.leftPanel}>
          <div className={styles.loginCard}>

            {/* logo + badge */}
            <div className={styles.logoBar}>
              <div className={styles.logoWrap}>
                <Image
                  src="/logo/big-bean-cafe-logo-transparent.png"
                  alt="Big Bean Café"
                  width={500}
                  height={300}
                  className={styles.logoImg}
                  priority
                />
              </div>
              <span className={styles.badge}>
                <ShieldCheck className="h-3 w-3 text-[#2FBF9B]" />
                Big Bean Admin
              </span>
            </div>

            <h1 className={styles.welcomeTitle}>Welcome Admin</h1>
            <p className={styles.welcomeDesc}>
              Manage outlets, menu, orders, customers and website content from one place.
            </p>

            {/* error */}
            {error && (
              <div className={styles.errorBox}>
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <span className={styles.errorText}>{error}</span>
              </div>
            )}

            {/* form */}
            <form onSubmit={handleSubmit} autoComplete="on" className={styles.form}>
              {/* email */}
              <div className={styles.field}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrap}>
                  <Mail className={styles.inputIcon} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="username"
                    placeholder="Enter your email address"
                    className={styles.input}
                  />
                </div>
              </div>

              {/* password */}
              <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrap}>
                  <Lock className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.eyeBtn}
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              {/* submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitBtn}
              >
                {isLoading ? 'Signing in…' : 'Sign In to Admin'}
              </button>
            </form>

            {/* security + back */}
            <div className={styles.securityRow}>
              <p className={styles.securityText}>
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#2FBF9B]" />
                Secure portal. Unauthorized access is prohibited.
              </p>
              <Link href="/" className={styles.backLink}>
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Website
              </Link>
            </div>
          </div>
        </div>

        {/* ════════════════════ RIGHT — DASHBOARD PREVIEW ════════════════════ */}
        <div className={styles.rightPanel}>
          <div className={styles.dashboard}>

            {/* fake admin top bar */}
            <div className={styles.topBar}>
              <div className={styles.searchPill}>
                <Search className="h-3.5 w-3.5 shrink-0" />
                <span>Search anything…</span>
              </div>
              <div className={styles.topIcons}>
                <div className={styles.iconCircle}>
                  <Bell className="h-4 w-4" />
                  <span className={styles.notiDot} />
                </div>
                <div className={styles.avatar}>A</div>
              </div>
            </div>

            {/* hero label */}
            <div className="mb-4">
              <p className={styles.heroLabel}>Big Bean Control Center</p>
              <h2 className={styles.heroTitle}>Operations Overview</h2>
              <p className={styles.heroDate}>Saturday, July 2026</p>
            </div>

            {/* stat cards */}
            <div className={styles.statGrid}>
              {STATS.map(({ label, value, Icon, color, bg }) => (
                <div key={label} className={styles.statCard}>
                  <div className={`${styles.statIconWrap} ${bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  <p className={styles.statValue}>{value}</p>
                  <p className={styles.statLabel}>{label}</p>
                </div>
              ))}
            </div>

            {/* chart + calendar row */}
            <div className={styles.chartRow}>

              {/* bar chart */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <p className={styles.chartTitle}>Performance</p>
                  <BarChart3 className="h-3.5 w-3.5 text-[#9DB0A1]" />
                </div>
                <div className={styles.chartBars}>
                  {BARS.map((h, i) => (
                    <div key={i} className={styles.barWrap}>
                      <div
                        className={styles.bar}
                        style={{
                          height: `${h * 0.64}%`,
                          background: h === 95
                            ? 'linear-gradient(180deg,#2FBF9B,#1a8f76)'
                            : 'linear-gradient(180deg,#DFF7EF,#c5edde)'
                        }}
                      />
                      <span className={styles.barDay}>{DAYS[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* mini calendar */}
              <div className={styles.calendarCard}>
                <div className={styles.calendarHeader}>
                  <p className={styles.calendarTitle}>July 2026</p>
                  <CalendarDays className="h-3.5 w-3.5 text-[#9DB0A1]" />
                </div>
                <div className={styles.calendarGrid}>
                  {['M','T','W','T','F','S','S'].map((d, i) => (
                    <span key={i} className={styles.dayLabel}>{d}</span>
                  ))}
                  {/* offset for July 2026 starting Tuesday */}
                  <span />
                  {DATES.map(d => (
                    <span
                      key={d}
                      className={d === 5 ? styles.dayToday : (ACTIVE.includes(d) ? styles.dayActive : styles.dayCell)}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* recent activity */}
            <div className={styles.activityCard}>
              <p className={styles.activityTitle}>Recent Activity</p>
              <div className={styles.activityList}>
                {ACTIVITY.map((a, i) => (
                  <div key={i} className={styles.activityItem}>
                    <span className={`${styles.activityDot} ${a.dot}`} />
                    <span className={styles.activityText}>{a.text}</span>
                    <span className={styles.activityTime}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* floating mini cards */}
            <div className={styles.floatingCardTop}>
              <p className={styles.floatingLabel}>Today Sales</p>
              <p className={styles.floatingValue}>₹18,420</p>
              <div className={`${styles.floatingTrend} text-[#2FBF9B]`}>
                <TrendingUp className="h-3 w-3" />
                +12.4% vs yesterday
              </div>
            </div>

            <div className={styles.floatingCardBottom}>
              <p className={styles.floatingLabel}>Customer Growth</p>
              <p className={styles.floatingValue}>+148</p>
              <div className={`${styles.floatingTrend} text-[#C9943A]`}>
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
