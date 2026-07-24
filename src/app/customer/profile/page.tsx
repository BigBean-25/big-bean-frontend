'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import CustomerSidebar from '@/components/customer/CustomerSidebar'
import CustomerToast, { ToastData } from '@/components/customer/CustomerToast'
import { isCustomerLoggedIn, customerFetch, saveCustomerSession, getCustomerToken } from '@/lib/customerAuth'
import { User, Lock, Save, RefreshCw, ShieldCheck, Calendar, Phone, Mail, UserCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

function InputField({ label, icon: Icon, children }: { label: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-wide text-[#7A5A48] mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9943A] pointer-events-none" />}
        {children}
      </div>
    </div>
  )
}

export default function CustomerProfile() {
  const router = useRouter()
  const [form, setForm]     = useState({ full_name: '', email: '', phone: '', date_of_birth: '', gender: '' })
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [toast, setToast]       = useState<ToastData | null>(null)
  const [memberSince, setMemberSince] = useState('')
  const [loginCount, setLoginCount]   = useState(0)
  const [initials, setInitials]       = useState('C')

  const load = useCallback(async () => {
    try {
      const r = await customerFetch(`${API_URL}/customer-auth/me`)
      const d = await r.json()
      if (d.success) {
        const c = d.data
        setForm({ full_name: c.full_name||'', email: c.email||'', phone: c.phone||'', date_of_birth: c.date_of_birth?.split('T')[0]||'', gender: c.gender||'' })
        setMemberSince(c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN',{month:'long',year:'numeric'}) : '—')
        setLoginCount(c.login_count ?? 0)
        setInitials(c.full_name ? c.full_name.split(' ').map((w: string) => w[0]).slice(0,2).join('').toUpperCase() : 'C')
      }
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!isCustomerLoggedIn()) { router.push('/login'); return }
    load()
  }, [router, load])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await customerFetch(`${API_URL}/customer-auth/profile`, { method: 'PUT', body: JSON.stringify(form) })
      const d = await res.json()
      if (d.success) {
        setToast({ msg: 'Profile updated successfully!', type: 'success' })
        const t = getCustomerToken(); if (t) saveCustomerSession(t, d.data)
        setInitials(d.data.full_name ? d.data.full_name.split(' ').map((w: string) => w[0]).slice(0,2).join('').toUpperCase() : 'C')
      } else setToast({ msg: d.message || 'Update failed', type: 'error' })
    } catch { setToast({ msg: 'Network error. Please try again.', type: 'error' }) }
    finally { setSaving(false) }
  }

  const handlePw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) { setToast({ msg: 'Passwords do not match', type: 'error' }); return }
    if (pwForm.new_password.length < 6) { setToast({ msg: 'New password must be at least 6 characters', type: 'error' }); return }
    setSavingPw(true)
    try {
      const res = await customerFetch(`${API_URL}/customer-auth/change-password`, { method: 'PUT', body: JSON.stringify({ old_password: pwForm.old_password, new_password: pwForm.new_password }) })
      const d = await res.json()
      setToast({ msg: d.message || (d.success ? 'Password changed!' : 'Failed'), type: d.success ? 'success' : 'error' })
      if (d.success) setPwForm({ old_password: '', new_password: '', confirm: '' })
    } catch { setToast({ msg: 'Network error', type: 'error' }) }
    finally { setSavingPw(false) }
  }

  const ic = 'w-full px-4 py-2.5 rounded-xl border border-[#E6C7A8] text-sm text-[#3D1F0D] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9943A]/30 focus:border-[#C9943A] transition'

  return (
    <div className="min-h-screen bg-[#FFF7ED]">
      <Header />
      <CustomerToast toast={toast} onClose={() => setToast(null)} />
      <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <CustomerSidebar />
          <div className="flex-1 min-w-0 space-y-5">

            {loading ? (
              <div className="py-24 text-center"><RefreshCw className="w-8 h-8 mx-auto text-[#C9943A] animate-spin" /></div>
            ) : (
              <>
                {/* Profile header */}
                <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm overflow-hidden">
                  <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg,#120905,#3D1F0D)' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black text-[#FFF7ED] shrink-0 shadow-lg"
                        style={{ background: 'linear-gradient(135deg,#C9943A,#E6B84A)' }}>
                        {initials}
                      </div>
                      <div>
                        <h1 className="text-xl font-black text-[#FFF7ED]">{form.full_name || 'My Profile'}</h1>
                        <p className="text-xs text-[#C0A080] mt-0.5">{form.email || form.phone || '—'}</p>
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-black uppercase tracking-widest text-[#C9943A] bg-[#C9943A]/10 border border-[#C9943A]/30 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-2.5 h-2.5" /> Big Bean Member
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-3 flex flex-wrap items-center gap-5 border-t border-[#2D1008] bg-[#1A0C06]">
                    <div className="flex items-center gap-1.5 text-xs text-[#C0A080]">
                      <Calendar className="w-3.5 h-3.5 text-[#C9943A]" /> Member since {memberSince}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#C0A080]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C9943A]" /> {loginCount} total logins
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {/* Personal Information */}
                  <form onSubmit={handleSave} className="rounded-2xl border border-[#E6C7A8] bg-white p-6 shadow-sm space-y-4">
                    <h2 className="font-black text-[#3D1F0D] flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-[#C9943A]" /> Personal Information
                    </h2>
                    <InputField label="Full Name" icon={UserCircle}>
                      <input type="text" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                        className={ic + ' pl-9'} placeholder="Your full name" />
                    </InputField>
                    <InputField label="Email" icon={Mail}>
                      <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className={ic + ' pl-9'} placeholder="your@email.com" />
                    </InputField>
                    <InputField label="Phone" icon={Phone}>
                      <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        className={ic + ' pl-9'} placeholder="+91 XXXXX XXXXX" />
                    </InputField>
                    <InputField label="Date of Birth">
                      <input type="date" value={form.date_of_birth} onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))}
                        className={ic} />
                    </InputField>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wide text-[#7A5A48] mb-1.5">Gender</label>
                      <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className={ic}>
                        <option value="">Prefer not to say</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <button type="submit" disabled={saving}
                      className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#3D1F0D] text-sm font-black text-[#FFF7ED] hover:bg-[#C9943A] hover:text-[#120905] transition disabled:opacity-60">
                      <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </form>

                  {/* Change Password */}
                  <form onSubmit={handlePw} className="rounded-2xl border border-[#E6C7A8] bg-white p-6 shadow-sm space-y-4">
                    <h2 className="font-black text-[#3D1F0D] flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-[#C9943A]" /> Change Password
                    </h2>
                    {([{ label: 'Current Password', key: 'old_password' }, { label: 'New Password', key: 'new_password' }, { label: 'Confirm New Password', key: 'confirm' }] as const).map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-black uppercase tracking-wide text-[#7A5A48] mb-1.5">{f.label}</label>
                        <input type="password" value={pwForm[f.key]}
                          onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                          className={ic} placeholder="••••••••" />
                      </div>
                    ))}
                    <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
                      Password must be at least 6 characters.
                    </div>
                    <button type="submit" disabled={savingPw}
                      className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#3D1F0D] text-sm font-black text-[#FFF7ED] hover:bg-[#C9943A] hover:text-[#120905] transition disabled:opacity-60">
                      <Lock className="w-4 h-4" />{savingPw ? 'Changing…' : 'Change Password'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
