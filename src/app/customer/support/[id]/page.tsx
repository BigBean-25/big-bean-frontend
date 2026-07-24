'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import CustomerSidebar from '@/components/customer/CustomerSidebar'
import CustomerStatusBadge from '@/components/customer/CustomerStatusBadge'
import CustomerToast, { ToastData } from '@/components/customer/CustomerToast'
import { isCustomerLoggedIn, customerFetch } from '@/lib/customerAuth'
import { ArrowLeft, Send, RefreshCw, Tag, AlertCircle, CheckCircle, Clock, MessageSquare, User, Shield } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

type Message = { id: number; sender_type: 'customer' | 'admin' | 'system'; sender_name: string | null; message: string; created_at: string }
type Ticket = {
  id: number; ticket_number: string; subject: string; category: string
  priority: string; status: string; created_at: string; messages: Message[]
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  open:             { label: 'Open',           color: 'bg-amber-100 text-amber-700' },
  in_progress:      { label: 'In Progress',     color: 'bg-blue-100 text-blue-700' },
  waiting_customer: { label: 'Awaiting Reply',  color: 'bg-purple-100 text-purple-700' },
  resolved:         { label: 'Resolved',        color: 'bg-green-100 text-green-700' },
  closed:           { label: 'Closed',          color: 'bg-gray-100 text-gray-600' },
}
const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low:    { label: 'Low',    color: 'bg-gray-100 text-gray-500' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  high:   { label: 'High',   color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
}

export default function SupportTicketDetail() {
  const router  = useRouter()
  const params  = useParams()
  const id      = params?.id as string

  const [ticket, setTicket]       = useState<Ticket | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [reply, setReply]         = useState('')
  const [sending, setSending]     = useState(false)
  const [toast, setToast]         = useState<ToastData | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchTicket = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const r = await customerFetch(`${API_URL}/customer-support/tickets/${id}`)
      const d = await r.json()
      if (d.success) { setTicket(d.data); setError('') }
      else setError(d.message || 'Ticket not found')
    } catch { setError('Could not load ticket') }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => {
    if (!isCustomerLoggedIn()) { router.push('/login'); return }
    fetchTicket()
  }, [router, fetchTicket])

  useEffect(() => {
    if (ticket) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [ticket?.messages?.length])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    try {
      const r = await customerFetch(`${API_URL}/customer-support/tickets/${id}/messages`, {
        method: 'POST', body: JSON.stringify({ message: reply.trim() })
      })
      const d = await r.json()
      if (d.success) { setReply(''); fetchTicket(true); setToast({ msg: 'Reply sent!', type: 'success' }) }
      else setToast({ msg: d.message || 'Failed to send', type: 'error' })
    } catch { setToast({ msg: 'Network error', type: 'error' }) }
    finally { setSending(false) }
  }

  const fmtDate = (d: string) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const isTerminal = ticket && ['resolved', 'closed'].includes(ticket.status)

  return (
    <div className="min-h-screen bg-[#FFF7ED]">
      <Header />
      <CustomerToast toast={toast} onClose={() => setToast(null)} />
      <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <CustomerSidebar />
          <div className="flex-1 min-w-0 space-y-5">

            {/* Back + refresh */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <Link href="/customer/support"
                className="flex items-center gap-1.5 text-sm font-bold text-[#7A5A48] hover:text-[#3D1F0D] transition">
                <ArrowLeft className="w-4 h-4" /> Back to Tickets
              </Link>
              <button onClick={() => fetchTicket(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E6C7A8] bg-white text-sm font-semibold text-[#3D1F0D] hover:border-[#C9943A] transition">
                <RefreshCw className="w-4 h-4 text-[#C9943A]" /> Refresh
              </button>
            </div>

            {loading ? (
              <div className="py-24 text-center">
                <RefreshCw className="w-10 h-10 mx-auto text-[#C9943A] animate-spin mb-4" />
              </div>
            ) : error ? (
              <div className="py-24 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
                <p className="font-semibold text-red-600">{error}</p>
                <Link href="/customer/support" className="mt-3 inline-block text-sm font-black text-[#C9943A] hover:underline">← Back</Link>
              </div>
            ) : ticket && (
              <>
                {/* Ticket header */}
                <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm overflow-hidden">
                  <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg,#120905,#3D1F0D)' }}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-xs font-black tracking-widest text-[#C9943A] mb-1">TICKET</p>
                        <p className="text-lg font-black text-[#FFF7ED]">#{ticket.ticket_number}</p>
                        <p className="text-sm font-semibold text-[#E6C7A8] mt-1">{ticket.subject}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <CustomerStatusBadge value={ticket.status} type="ticket" />
                        <CustomerStatusBadge value={ticket.priority} type="priority" />
                        <span className="text-[9px] text-[#C0A080] font-semibold bg-[#3D1F0D]/50 border border-[#7A5A48] px-2.5 py-1 rounded-full flex items-center gap-0.5">
                          <Tag className="w-2.5 h-2.5" />{ticket.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#C0A080] mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Opened {fmtDate(ticket.created_at)}
                    </p>
                  </div>
                </div>

                {/* Resolved notice */}
                {isTerminal && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-green-700">This ticket is {ticket.status}.</p>
                      <p className="text-sm text-green-600 mt-0.5">
                        Need more help?{' '}
                        <Link href="/customer/support" className="font-black underline hover:no-underline">Create a new ticket</Link>
                      </p>
                    </div>
                  </div>
                )}

                {/* Conversation */}
                <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#F5E6D3] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#C9943A]" />
                    <h2 className="font-black text-[#3D1F0D]">Conversation ({ticket.messages?.length || 0})</h2>
                  </div>
                  <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
                    {(ticket.messages || []).map(msg => {
                      const isAdmin  = msg.sender_type === 'admin'
                      const isSystem = msg.sender_type === 'system'
                      if (isSystem) return (
                        <div key={msg.id} className="text-center">
                          <span className="text-xs text-[#9B6B50] bg-[#FFF7ED] px-3 py-1 rounded-full border border-[#E6C7A8]">{msg.message}</span>
                        </div>
                      )
                      return (
                        <div key={msg.id} className={`flex gap-3 ${isAdmin ? '' : 'flex-row-reverse'}`}>
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? 'bg-[#3D1F0D]' : 'bg-[#C9943A]'}`}>
                            {isAdmin ? <Shield className="w-4 h-4 text-[#C9943A]" /> : <User className="w-4 h-4 text-[#120905]" />}
                          </div>
                          <div className={`max-w-[75%] ${isAdmin ? '' : 'items-end flex flex-col'}`}>
                            <div className={`rounded-2xl px-4 py-3 text-sm ${
                              isAdmin
                                ? 'bg-[#FFF7ED] border border-[#E6C7A8] text-[#3D1F0D] rounded-tl-sm'
                                : 'bg-[#3D1F0D] text-[#FFF7ED] rounded-tr-sm'
                            }`}>
                              <p className={`text-[10px] font-black mb-1 ${isAdmin ? 'text-[#C9943A]' : 'text-[#C9943A]'}`}>
                                {isAdmin ? (msg.sender_name || 'Big Bean Support') : 'You'}
                              </p>
                              <p className="leading-relaxed">{msg.message}</p>
                            </div>
                            <p className="text-[10px] text-[#9B6B50] mt-1 px-1">{fmtDate(msg.created_at)}</p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {/* Reply box */}
                  {!isTerminal && (
                    <div className="border-t border-[#F5E6D3] p-5">
                          <form onSubmit={handleSend} className="flex gap-3">
                        <textarea
                          value={reply} onChange={e => setReply(e.target.value)}
                          rows={3} placeholder="Type your reply…"
                          className="flex-1 px-4 py-2.5 rounded-xl border border-[#E6C7A8] text-sm text-[#3D1F0D] resize-none focus:outline-none focus:ring-2 focus:ring-[#C9943A]/30"
                          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend(e as unknown as React.FormEvent) }}
                        />
                        <button type="submit" disabled={sending || !reply.trim()}
                          className="self-end flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3D1F0D] text-sm font-bold text-[#FFF7ED] hover:bg-[#C9943A] hover:text-[#120905] transition disabled:opacity-50">
                          <Send className="w-4 h-4" /> {sending ? 'Sending…' : 'Send'}
                        </button>
                      </form>
                      <p className="text-[10px] text-[#9B6B50] mt-2">Ctrl+Enter to send</p>
                    </div>
                  )}
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
