'use client'

import { useEffect, useMemo, useState } from 'react'
import { Mail, MessageSquare, Copy, Send, Check, RefreshCw, AlertCircle } from 'lucide-react'
import apiRequest from '@/lib/api'
import toast from 'react-hot-toast'

interface Template {
  id: number
  template_key: string
  template_name: string
  subject: string | null
  email_body: string | null
  whatsapp_body: string | null
  status: 'active' | 'inactive'
}

interface OutletLike {
  name?: string
  address?: string
  city?: string
  outlet_name?: string
  outlet_address?: string
}

interface BookingLike {
  id: number
  booking_number: string
  customer_name?: string
  customer_email?: string | null
  customer_phone?: string
  event_title?: string
  quantity?: number
  total_amount?: number
  event_date?: string
  start_time?: string
  end_time?: string
  outlet?: OutletLike | null
  booking_status?: string
  payment_status?: string
}

interface Props {
  booking: BookingLike
  defaultTemplateKey?: string
}

const PLACEHOLDERS = [
  'customer_name', 'event_title', 'booking_id', 'event_date',
  'event_time', 'venue', 'quantity', 'amount', 'status'
]

const fmtDate = (d?: string) => {
  if (!d) return '—'
  return new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const fmtTime = (t?: string) => {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hh = parseInt(h, 10)
  const am = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh % 12 || 12
  return `${h12}:${m} ${am}`
}

export default function EventBookingCommunication({ booking, defaultTemplateKey }: Props) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKey, setSelectedKey] = useState(defaultTemplateKey || '')
  const [emailCustom, setEmailCustom] = useState('')
  const [whatsappCustom, setWhatsappCustom] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false)

  useEffect(() => {
    if (defaultTemplateKey) setSelectedKey(defaultTemplateKey)
  }, [defaultTemplateKey])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const res = await apiRequest('/admin/event-message-templates')
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed')
      const list = (data.data || []).filter((t: Template) => t.status === 'active')
      setTemplates(list)
      if (!selectedKey && list.length) setSelectedKey(list[0].template_key)
    } catch (err: any) {
      console.error('Load templates error', err)
      toast.error(err.message || 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedTemplate = useMemo(() => templates.find(t => t.template_key === selectedKey), [templates, selectedKey])

  const venue = useMemo(() => {
    const o = booking.outlet || {}
    return [o.outlet_name || o.name, o.outlet_address || o.address, o.city]
      .filter(Boolean)
      .join(', ')
  }, [booking.outlet])

  const values = useMemo(() => ({
    customer_name: booking.customer_name || '',
    event_title: booking.event_title || '',
    booking_id: booking.booking_number || String(booking.id),
    event_date: fmtDate(booking.event_date),
    event_time: booking.start_time
      ? `${fmtTime(booking.start_time)}${booking.end_time ? ` - ${fmtTime(booking.end_time)}` : ''}`
      : '',
    venue,
    quantity: String(booking.quantity || 1),
    amount: `₹${Number(booking.total_amount || 0).toFixed(2)}`,
    status: booking.booking_status || '',
  }), [booking, venue])

  const render = (text = '') => {
    return PLACEHOLDERS.reduce((acc, key) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      return acc.replace(regex, (values as any)[key] || '')
    }, text)
  }

  const emailBody = render(emailCustom || selectedTemplate?.email_body || '')
  const emailSubject = render(selectedTemplate?.subject || '')
  const whatsappBody = render(whatsappCustom || selectedTemplate?.whatsapp_body || '')

  const handleSendEmail = async () => {
    if (!booking.customer_email) {
      toast.error('Customer email is missing')
      return
    }
    setSendingEmail(true)
    try {
      const res = await apiRequest(`/admin/event-bookings/${booking.id}/send-email`, {
        method: 'POST',
        body: JSON.stringify({ template_key: selectedKey, custom_message: emailCustom || undefined }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed')
      toast.success(data.message || 'Email sent successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send email')
    } finally {
      setSendingEmail(false)
    }
  }

  const handleSendWhatsApp = async () => {
    if (!booking.customer_phone) {
      toast.error('Customer phone is missing')
      return
    }
    setSendingWhatsapp(true)
    try {
      const res = await apiRequest(`/admin/event-bookings/${booking.id}/send-whatsapp`, {
        method: 'POST',
        body: JSON.stringify({ template_key: selectedKey, custom_message: whatsappCustom || undefined }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed')
      if (data.whatsapp_url) {
        window.open(data.whatsapp_url, '_blank')
        toast.success(data.message || 'WhatsApp message opened')
      } else {
        toast.success(data.message || 'WhatsApp message sent')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send WhatsApp')
    } finally {
      setSendingWhatsapp(false)
    }
  }

  const handleCopyWhatsApp = async () => {
    try {
      await navigator.clipboard.writeText(whatsappBody)
      toast.success('WhatsApp message copied')
    } catch {
      toast.error('Copy failed')
    }
  }

  return (
    <div className="rounded-[28px] border border-[#DCE8E3] bg-white p-5 shadow-[0_18px_45px_rgba(31,42,36,0.06)]">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-[#0F1F1A]">
        <Mail className="h-5 w-5 text-[#C9943A]" /> Customer Communication
      </h3>

      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-black uppercase text-[#5F6F68]">Select Template</label>
        <div className="flex items-center gap-2">
          <select
            value={selectedKey}
            onChange={e => { setSelectedKey(e.target.value); setEmailCustom(''); setWhatsappCustom('') }}
            disabled={loading}
            className="w-full rounded-xl border border-[#DCE8E3] bg-[#F9FDFB] px-4 py-2.5 text-sm text-[#0F1F1A] focus:border-[#2FBF9B] focus:outline-none"
          >
            {loading ? (
              <option>Loading templates...</option>
            ) : templates.length === 0 ? (
              <option value="">No active templates</option>
            ) : (
              templates.map(t => (
                <option key={t.template_key} value={t.template_key}>{t.template_name}</option>
              ))
            )}
          </select>
          <button
            onClick={loadTemplates}
            disabled={loading}
            title="Refresh templates"
            className="rounded-xl border border-[#DCE8E3] bg-white p-2.5 text-[#5F6F68] hover:bg-[#F3F8F6] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {selectedTemplate && (
        <>
          <div className="mb-5 rounded-xl bg-[#F9FDFB] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#0F1F1A]">
              <Mail className="h-4 w-4 text-[#9CB3AC]" /> Email Preview
            </div>
            <div className="mb-2 text-sm font-bold text-[#5F6F68]">Subject: {emailSubject}</div>
            <div
              className="prose prose-sm max-w-none text-sm text-[#5F6F68]"
              dangerouslySetInnerHTML={{ __html: emailBody }}
            />
            <textarea
              value={emailCustom}
              onChange={e => setEmailCustom(e.target.value)}
              placeholder="Optional: override email body (plain text / HTML). Leave blank to use template."
              rows={3}
              className="mt-3 w-full rounded-xl border border-[#DCE8E3] bg-white px-3 py-2 text-xs text-[#0F1F1A] focus:border-[#2FBF9B] focus:outline-none"
            />
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#167E68] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0F1F1A] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {sendingEmail ? 'Sending...' : 'Send Email'}
            </button>
            {!booking.customer_email && (
              <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" /> Customer email is missing
              </p>
            )}
          </div>

          <div className="rounded-xl bg-[#F9FDFB] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#0F1F1A]">
              <MessageSquare className="h-4 w-4 text-[#9CB3AC]" /> WhatsApp Preview
            </div>
            <pre className="whitespace-pre-wrap rounded-lg bg-white p-3 text-sm text-[#5F6F68]">{whatsappBody}</pre>
            <textarea
              value={whatsappCustom}
              onChange={e => setWhatsappCustom(e.target.value)}
              placeholder="Optional: override WhatsApp message. Leave blank to use template."
              rows={3}
              className="mt-3 w-full rounded-xl border border-[#DCE8E3] bg-white px-3 py-2 text-xs text-[#0F1F1A] focus:border-[#2FBF9B] focus:outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={handleSendWhatsApp}
                disabled={sendingWhatsapp}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <MessageSquare className="h-4 w-4" />
                {sendingWhatsapp ? 'Opening...' : 'Send WhatsApp'}
              </button>
              <button
                onClick={handleCopyWhatsApp}
                className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8E3] bg-white px-4 py-2.5 text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6]"
              >
                <Copy className="h-4 w-4" /> Copy Message
              </button>
            </div>
            {!booking.customer_phone && (
              <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" /> Customer phone is missing
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
