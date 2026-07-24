'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import CustomerSidebar from '@/components/customer/CustomerSidebar'
import CustomerToast, { ToastData } from '@/components/customer/CustomerToast'
import { isCustomerLoggedIn, customerFetch } from '@/lib/customerAuth'
import { MapPin, Plus, Trash2, X, Home, Briefcase, RefreshCw } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
type Addr = Record<string, string | number | null>

const EMPTY = { label:'Home', full_name:'', phone:'', address_line_1:'', address_line_2:'', landmark:'', city:'Bengaluru', state:'Karnataka', pincode:'', is_default: false }

const ic = 'w-full px-3 py-2.5 rounded-xl border border-[#E6C7A8] text-sm text-[#3D1F0D] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9943A]/30 focus:border-[#C9943A] transition'

export default function CustomerAddresses() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Addr[]>([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [toast, setToast]         = useState<ToastData | null>(null)

  const load = useCallback(async () => {
    try {
      const r = await customerFetch(`${API_URL}/customer-dashboard/addresses`)
      const d = await r.json()
      if (d.success) setAddresses(d.data || [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!isCustomerLoggedIn()) { router.push('/login'); return }
    load()
  }, [router, load])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await customerFetch(`${API_URL}/customer-dashboard/addresses`, { method:'POST', body: JSON.stringify(form) })
      const d = await res.json()
      if (d.success) { setShowModal(false); setForm(EMPTY); load(); setToast({ msg: 'Address saved!', type: 'success' }) }
      else setToast({ msg: d.message || 'Failed to save', type: 'error' })
    } catch { setToast({ msg: 'Network error', type: 'error' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await customerFetch(`${API_URL}/customer-dashboard/addresses/${id}`, { method:'DELETE' })
      load(); setToast({ msg: 'Address deleted', type: 'success' })
    } finally { setDeletingId(null) }
  }

  const FIELDS = [
    { label:'Label (Home / Work)', key:'label', type:'text', full: false },
    { label:'Full Name', key:'full_name', type:'text', full: false },
    { label:'Phone', key:'phone', type:'tel', full: false },
    { label:'Address Line 1', key:'address_line_1', type:'text', full: true },
    { label:'Address Line 2 (optional)', key:'address_line_2', type:'text', full: true },
    { label:'Landmark', key:'landmark', type:'text', full: false },
    { label:'City', key:'city', type:'text', full: false },
    { label:'State', key:'state', type:'text', full: false },
    { label:'Pincode', key:'pincode', type:'text', full: false },
  ] as const

  return (
    <div className="min-h-screen bg-[#FFF7ED]">
      <Header />
      <CustomerToast toast={toast} onClose={() => setToast(null)} />
      <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <CustomerSidebar />
          <div className="flex-1 min-w-0 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between rounded-2xl border border-[#E6C7A8] bg-white px-6 py-4 shadow-sm">
              <div>
                <h1 className="text-xl font-black text-[#3D1F0D]">My Addresses</h1>
                <p className="text-xs text-[#7A5A48] mt-0.5">{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</p>
              </div>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[#3D1F0D] px-4 py-2 text-sm font-black text-[#FFF7ED] hover:bg-[#C9943A] hover:text-[#120905] transition">
                <Plus className="h-4 w-4" /> Add New
              </button>
            </div>

            {/* Address grid */}
            {loading ? (
              <div className="py-20 text-center"><RefreshCw className="w-8 h-8 mx-auto text-[#C9943A] animate-spin" /></div>
            ) : !addresses.length ? (
              <div className="rounded-2xl border border-[#E6C7A8] bg-white py-16 text-center shadow-sm">
                <MapPin className="h-14 w-14 mx-auto text-[#E6C7A8] mb-3" />
                <p className="font-black text-[#3D1F0D]">No addresses saved yet</p>
                <p className="text-sm text-[#7A5A48] mt-1">Add your delivery address to make checkout faster.</p>
                <button onClick={() => setShowModal(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3D1F0D] text-sm font-black text-[#FFF7ED] hover:bg-[#C9943A] hover:text-[#120905] transition">
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {addresses.map((a, i) => {
                  const isDefault = Boolean(a.is_default)
                  const label = String(a.label || 'Home').toLowerCase()
                  const LabelIcon = label.includes('work') || label.includes('office') ? Briefcase : Home
                  return (
                    <div key={i} className={`relative rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                      isDefault ? 'border-[#C9943A] ring-1 ring-[#C9943A]/20' : 'border-[#E6C7A8]'
                    }`}>
                      {isDefault && (
                        <span className="absolute top-3 right-3 text-[9px] font-black uppercase bg-[#C9943A] text-[#120905] px-2.5 py-1 rounded-full">Default</span>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] border border-[#E6C7A8] flex items-center justify-center">
                          <LabelIcon className="w-4 h-4 text-[#C9943A]" />
                        </div>
                        <p className="font-black text-[#3D1F0D] text-sm capitalize">{String(a.label || 'Home')}</p>
                      </div>
                      {a.full_name && <p className="text-sm font-semibold text-[#3D1F0D]">{String(a.full_name)}</p>}
                      <p className="text-sm text-[#7A5A48] mt-1">
                        {String(a.address_line_1 || '')}{a.address_line_2 ? `, ${String(a.address_line_2)}` : ''}
                      </p>
                      {a.landmark && <p className="text-xs text-[#9B6B50] mt-0.5">Near: {String(a.landmark)}</p>}
                      <p className="text-xs text-[#7A5A48] mt-0.5">{String(a.city || '')}, {String(a.state || '')} {String(a.pincode || '')}</p>
                      {a.phone && <p className="text-xs text-[#7A5A48] mt-1 flex items-center gap-1">
                        <span>📞</span> {String(a.phone)}
                      </p>}
                      <button onClick={() => handleDelete(a.id as number)} disabled={deletingId === a.id}
                        className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition disabled:opacity-50">
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === a.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E6C7A8] w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5E6D3]">
              <h2 className="font-black text-[#3D1F0D] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C9943A]" /> New Address
              </h2>
              <button onClick={() => { setShowModal(false); setForm(EMPTY) }}
                className="rounded-full p-1.5 text-[#7A5A48] hover:bg-[#FFF7ED] transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="overflow-y-auto px-6 py-4 space-y-3 flex-1">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {FIELDS.map(f => (
                  <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-black uppercase tracking-wide text-[#7A5A48] mb-1">{f.label}</label>
                    <input type={f.type} value={(form as unknown as Record<string,string>)[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className={ic}
                      required={f.key === 'address_line_1'}
                    />
                  </div>
                ))}
              </div>
            </form>
            <div className="flex gap-3 px-6 py-4 border-t border-[#F5E6D3]">
              <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY) }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E6C7A8] text-sm font-bold text-[#3D1F0D] hover:bg-[#FFF7ED] transition">
                Cancel
              </button>
              <button onClick={handleAdd} disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#3D1F0D] text-sm font-black text-[#FFF7ED] hover:bg-[#C9943A] hover:text-[#120905] transition disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
