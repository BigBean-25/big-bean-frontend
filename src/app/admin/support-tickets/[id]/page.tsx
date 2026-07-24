'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, RefreshCw, Tag, AlertCircle, User, Shield, Settings, Mail, Phone } from 'lucide-react'
import { apiRequest } from '@/lib/api'

type Message = { id: number; sender_type: 'customer' | 'admin' | 'system'; sender_name: string | null; message: string; created_at: string }
type Ticket = {
  id: number; ticket_number: string; subject: string; category: string; priority: string; status: string
  customer_id: number | null; customer_name: string | null; customer_email: string | null; customer_phone: string | null
  created_at: string; updated_at: string; messages: Message[]
}

const VALID_STATUSES = ['open','in_progress','waiting_customer','resolved','closed']
const STATUS_LABELS: Record<string, string> = {
  open: 'Open', in_progress: 'In Progress', waiting_customer: 'Awaiting Customer',
  resolved: 'Resolved', closed: 'Closed'
}
const STATUS_META: Record<string, string> = {
  open: 'bg-amber-100 text-amber-700', in_progress: 'bg-blue-100 text-blue-700',
  waiting_customer: 'bg-purple-100 text-purple-700', resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-600'
}
const PRIORITY_META: Record<string, string> = {
  low: 'bg-gray-100 text-gray-500', medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700'
}


export default function AdminTicketDetail() {
  const params = useParams()
  const id = params?.id as string

  const [ticket, setTicket]         = useState<Ticket | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [reply, setReply]           = useState('')
  const [replyStatus, setReplyStatus] = useState('waiting_customer')
  const [sending, setSending]       = useState(false)
  const [sendErr, setSendErr]       = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchTicket = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const r = await apiRequest(`/admin-support/tickets/${id}`)
      const d = await r.json()
      if (d.success) { setTicket(d.data); setError('') }
      else setError(d.message || 'Ticket not found')
    } catch { setError('Could not load ticket') }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetchTicket() }, [fetchTicket])
  useEffect(() => {
    if (ticket) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [ticket?.messages?.length])

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const r = await apiRequest(`/admin-support/tickets/${id}/status`, {
        method: 'PUT', body: JSON.stringify({ status: newStatus })
      })
      const d = await r.json()
      if (d.success) fetchTicket(true)
      else alert(d.message || 'Failed to update status')
    } finally { setUpdatingStatus(false) }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true); setSendErr('')
    try {
      const r = await apiRequest(`/admin-support/tickets/${id}/reply`, {
        method: 'POST', body: JSON.stringify({ message: reply.trim(), status: replyStatus })
      })
      const d = await r.json()
      if (d.success) { setReply(''); fetchTicket(true) }
      else setSendErr(d.message || 'Failed to send')
    } catch { setSendErr('Network error') }
    finally { setSending(false) }
  }

  const fmtDate = (d: string) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  if (loading) return (
    <div className="py-24 text-center">
      <RefreshCw className="w-10 h-10 mx-auto text-[#2FBF9B] animate-spin mb-4" />
    </div>
  )

  if (error || !ticket) return (
    <div className="py-24 text-center">
      <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
      <p className="font-semibold text-red-600">{error || 'Ticket not found'}</p>
      <Link href="/admin/support-tickets" className="mt-3 inline-block text-sm font-semibold text-[#2FBF9B] hover:underline">← Back to Tickets</Link>
    </div>
  )

  return (
    <div>
      {/* Back */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link href="/admin/support-tickets" className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Tickets
        </Link>
        <button onClick={() => fetchTicket(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* ── LEFT: Conversation ── */}
        <div className="space-y-5">

          {/* Ticket header */}
          <div className="card p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">{ticket.ticket_number}</p>
                <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
                <p className="text-sm text-gray-500 mt-1">Opened {fmtDate(ticket.created_at)}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${STATUS_META[ticket.status] || 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABELS[ticket.status] || ticket.status}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full capitalize ${PRIORITY_META[ticket.priority] || 'bg-gray-100 text-gray-600'}`}>
                  {ticket.priority}
                </span>
                <span className="text-[10px] text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" />{ticket.category}
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 font-semibold text-gray-900">
              Conversation ({ticket.messages?.length || 0} messages)
            </div>
            <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
              {(ticket.messages || []).map(msg => {
                const isAdmin  = msg.sender_type === 'admin'
                const isSystem = msg.sender_type === 'system'
                if (isSystem) return (
                  <div key={msg.id} className="text-center">
                    <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">{msg.message}</span>
                  </div>
                )
                return (
                  <div key={msg.id} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? 'bg-[#2FBF9B]' : 'bg-amber-100'}`}>
                      {isAdmin ? <Shield className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-amber-700" />}
                    </div>
                    <div className={`max-w-[75%] ${isAdmin ? 'items-end flex flex-col' : ''}`}>
                      <div className={`rounded-2xl px-4 py-3 text-sm ${
                        isAdmin
                          ? 'bg-[#EAF8F3] border border-[#B2E8D8] text-[#0F1F1A] rounded-tr-sm'
                          : 'bg-amber-50 border border-amber-200 text-gray-900 rounded-tl-sm'
                      }`}>
                        <p className="text-[10px] font-bold mb-1 text-gray-400">
                          {isAdmin ? (msg.sender_name || 'Admin') : (msg.sender_name || 'Customer')}
                        </p>
                        <p className="leading-relaxed">{msg.message}</p>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 px-1">{fmtDate(msg.created_at)}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Reply box */}
            <div className="border-t border-gray-100 p-5 bg-gray-50/50">
              {sendErr && <p className="text-sm text-red-600 mb-3 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{sendErr}</p>}
              <form onSubmit={handleReply} className="space-y-3">
                <div className="flex gap-3 items-start">
                  <textarea value={reply} onChange={e => setReply(e.target.value)}
                    rows={4} placeholder="Type your reply to the customer…"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#2FBF9B]/40"
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleReply(e as unknown as React.FormEvent) }}
                  />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Status after reply</label>
                    <select value={replyStatus} onChange={e => setReplyStatus(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#2FBF9B]/40">
                      {VALID_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                  <button type="submit" disabled={sending || !reply.trim()}
                    className="self-end flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2FBF9B] text-sm font-bold text-white hover:bg-[#27A886] transition disabled:opacity-50">
                    <Send className="w-4 h-4" /> {sending ? 'Sending…' : 'Send Reply'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">Ctrl+Enter to send</p>
              </form>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Details ── */}
        <div className="space-y-5">

          {/* Status control */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#2FBF9B]" /> Update Status
            </h2>
            <div className="space-y-2">
              {VALID_STATUSES.map(s => (
                <button key={s} onClick={() => handleStatusUpdate(s)} disabled={ticket.status === s || updatingStatus}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-left transition ${
                    ticket.status === s
                      ? 'bg-[#EAF8F3] border-[#2FBF9B] text-[#167E68]'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  } disabled:opacity-60`}>
                  {ticket.status === s && <span className="inline-block w-2 h-2 rounded-full bg-[#2FBF9B] mr-2" />}
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Customer info */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#2FBF9B]" /> Customer
            </h2>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900">{ticket.customer_name || 'Guest'}</p>
              {ticket.customer_email && (
                <a href={`mailto:${ticket.customer_email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#2FBF9B] transition">
                  <Mail className="w-4 h-4" /> {ticket.customer_email}
                </a>
              )}
              {ticket.customer_phone && (
                <a href={`tel:${ticket.customer_phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#2FBF9B] transition">
                  <Phone className="w-4 h-4" /> {ticket.customer_phone}
                </a>
              )}
              {ticket.customer_id && (
                <Link href={`/admin/customers`}
                  className="text-xs text-[#2FBF9B] hover:underline">View in Customers →</Link>
              )}
            </div>
          </div>

          {/* Ticket meta */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-3">Ticket Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-semibold capitalize">{ticket.category}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Priority</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${PRIORITY_META[ticket.priority] || 'bg-gray-100 text-gray-600'}`}>{ticket.priority}</span>
              </div>
              <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="font-semibold">{fmtDate(ticket.created_at)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Updated</span><span className="font-semibold">{fmtDate(ticket.updated_at)}</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
