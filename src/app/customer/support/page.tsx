'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import CustomerSidebar from '@/components/customer/CustomerSidebar'
import CustomerStatusBadge from '@/components/customer/CustomerStatusBadge'
import CustomerToast, { ToastData } from '@/components/customer/CustomerToast'
import { isCustomerLoggedIn, customerFetch } from '@/lib/customerAuth'
import { Headphones, Plus, X, ChevronRight, MessageSquare, RefreshCw, Tag, Send } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

type Ticket = {
  id: number; ticket_number: string; subject: string; category: string
  priority: string; status: string; created_at: string; updated_at: string
  message_count: number; last_message: string | null; last_sender_type: string | null
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  open:             { label: 'Open',             color: 'bg-amber-100 text-amber-700' },
  in_progress:      { label: 'In Progress',       color: 'bg-blue-100 text-blue-700' },
  waiting_customer: { label: 'Awaiting Reply',    color: 'bg-purple-100 text-purple-700' },
  resolved:         { label: 'Resolved',          color: 'bg-green-100 text-green-700' },
  closed:           { label: 'Closed',            color: 'bg-gray-100 text-gray-600' },
}
const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low:    { label: 'Low',    color: 'bg-gray-100 text-gray-500' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  high:   { label: 'High',   color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
}
const CATEGORIES = ['general','order','payment','delivery','refund','product','technical']
const PRIORITIES = ['low','medium','high','urgent']

const initForm = { subject: '', message: '', category: 'general', priority: 'medium' }

export default function CustomerSupport() {
  const router = useRouter()
  const [tickets, setTickets]   = useState<Ticket[]>([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState(initForm)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState<ToastData | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await customerFetch(`${API_URL}/customer-support/tickets`)
      const d = await r.json()
      if (d.success) setTickets(d.data || [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!isCustomerLoggedIn()) { router.push('/login'); return }
    load()
  }, [router, load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const r = await customerFetch(`${API_URL}/customer-support/tickets`, { method: 'POST', body: JSON.stringify(form) })
      const d = await r.json()
      if (d.success) { setShowModal(false); setForm(initForm); load(); setToast({ msg: 'Ticket submitted! We\'ll get back to you soon.', type: 'success' }) }
      else setToast({ msg: d.message || 'Failed to create ticket', type: 'error' })
    } catch { setToast({ msg: 'Network error', type: 'error' }) }
    finally { setSaving(false) }
  }

  const sf = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  const ic = 'w-full px-4 py-2.5 rounded-xl border border-[#E6C7A8] text-sm text-[#3D1F0D] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9943A]/30 focus:border-[#C9943A] transition'

  return (
    <div className="min-h-screen bg-[#FFF7ED]">
      <Header />
      <CustomerToast toast={toast} onClose={() => setToast(null)} />
      <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <CustomerSidebar />
          <div className="flex-1 min-w-0 space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between rounded-2xl border border-[#E6C7A8] bg-white px-6 py-4 shadow-sm flex-wrap gap-3">
              <div>
                <h1 className="text-xl font-black text-[#3D1F0D]">Support Tickets</h1>
                <p className="text-xs text-[#7A5A48] mt-0.5">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} &middot; We respond within 24 hours</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => load()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E6C7A8] text-sm font-semibold text-[#3D1F0D] hover:border-[#C9943A] transition">
                  <RefreshCw className="w-3.5 h-3.5 text-[#C9943A]" />
                </button>
                <button onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#3D1F0D] px-4 py-2 text-sm font-black text-[#FFF7ED] hover:bg-[#C9943A] hover:text-[#120905] transition">
                  <Plus className="h-4 w-4" /> New Ticket
                </button>
              </div>
            </div>

            {/* Ticket list */}
            {loading ? (
              <div className="py-16 text-center rounded-2xl border border-[#E6C7A8] bg-white shadow-sm">
                <RefreshCw className="w-7 h-7 mx-auto text-[#C9943A] animate-spin mb-3" />
                <p className="text-sm text-[#7A5A48]">Loading tickets…</p>
              </div>
            ) : !tickets.length ? (
              <div className="rounded-2xl border border-[#E6C7A8] bg-white py-16 text-center shadow-sm">
                <Headphones className="h-14 w-14 mx-auto text-[#E6C7A8] mb-3" />
                <p className="font-black text-[#3D1F0D]">No support tickets yet</p>
                <p className="text-sm text-[#7A5A48] mt-1">Create a ticket and our team will get back to you within 24 hours.</p>
                <button onClick={() => setShowModal(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3D1F0D] text-sm font-black text-[#FFF7ED] hover:bg-[#C9943A] hover:text-[#120905] transition">
                  <Plus className="w-4 h-4" /> Create Ticket
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map(t => {
                  const hasAdminReply = t.last_sender_type === 'admin'
                  const isOpen = ['open','in_progress','waiting_customer'].includes(t.status)
                  return (
                    <div key={t.id} className={`rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-all ${
                      isOpen && hasAdminReply ? 'border-[#C9943A]' : 'border-[#E6C7A8] hover:border-[#C9943A]'
                    }`}>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-black text-[#9B6B50]">#{t.ticket_number}</span>
                            <CustomerStatusBadge value={t.status} type="ticket" />
                            <CustomerStatusBadge value={t.priority} type="priority" />
                            <span className="text-[9px] text-[#9B6B50] font-semibold bg-[#FFF7ED] border border-[#E6C7A8] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Tag className="w-2.5 h-2.5" />{t.category}
                            </span>
                          </div>
                          <p className="font-black text-[#3D1F0D]">{t.subject}</p>
                          <p className="text-xs text-[#7A5A48] mt-0.5">{fmtDate(t.created_at)} · {t.message_count || 0} message{Number(t.message_count) !== 1 ? 's' : ''}</p>
                          {t.last_message && (
                            <p className={`mt-2 text-xs line-clamp-1 ${hasAdminReply ? 'text-[#C9943A] font-semibold' : 'text-[#7A5A48]'}`}>
                              {hasAdminReply ? '💬 Support: ' : 'You: '}{t.last_message}
                            </p>
                          )}
                        </div>
                        <Link href={`/customer/support/${t.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#C9943A] text-xs font-bold text-[#C9943A] hover:bg-[#C9943A] hover:text-[#120905] transition shrink-0">
                          <MessageSquare className="w-3.5 h-3.5" /> Open <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E6C7A8] w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5E6D3]">
              <h2 className="font-black text-[#3D1F0D] flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#C9943A]" /> New Support Ticket
              </h2>
              <button onClick={() => setShowModal(false)} className="rounded-full p-1.5 text-[#7A5A48] hover:bg-[#FFF7ED] transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-[#7A5A48] mb-1.5">Subject *</label>
                <input required value={form.subject} onChange={e => sf('subject', e.target.value)}
                  className={ic} placeholder="Briefly describe your issue" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-[#7A5A48] mb-1.5">Category</label>
                  <select value={form.category} onChange={e => sf('category', e.target.value)} className={ic}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-[#7A5A48] mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => sf('priority', e.target.value)} className={ic}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-[#7A5A48] mb-1.5">Message *</label>
                <textarea required value={form.message} onChange={e => sf('message', e.target.value)}
                  rows={5} className={ic + ' resize-none'}
                  placeholder="Describe your issue in detail. Include order number if applicable." />
              </div>
            </form>
            <div className="flex gap-3 px-6 py-4 border-t border-[#F5E6D3]">
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E6C7A8] text-sm font-bold text-[#3D1F0D] hover:bg-[#FFF7ED] transition">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3D1F0D] text-sm font-black text-[#FFF7ED] hover:bg-[#C9943A] hover:text-[#120905] transition disabled:opacity-60">
                <Send className="w-4 h-4" />{saving ? 'Submitting…' : 'Submit Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
