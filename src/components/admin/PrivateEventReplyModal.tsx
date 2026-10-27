'use client'

import { useEffect, useState } from 'react'
import { X, Mail, Send, Loader2, AlertCircle } from 'lucide-react'
import apiRequest from '@/lib/api'
import toast from 'react-hot-toast'
import { OCCASION_LABELS } from '@/lib/privateEventMeta'

export interface ReplyEnquiry {
  id: number
  enquiry_reference: string
  full_name: string
  email: string | null
  occasion?: string
  outlet_name?: string | null
  status?: string
}

export default function PrivateEventReplyModal({
  enquiry,
  onClose,
  onSent,
}: {
  enquiry: ReplyEnquiry | null
  onClose: () => void
  onSent?: (newStatus?: string) => void
}) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!enquiry) return
    const occasion = OCCASION_LABELS[enquiry.occasion || ''] || enquiry.occasion || 'your event'
    const outlet = enquiry.outlet_name || 'the selected outlet'
    setSubject(`Re: Your Big Bean Cafe Event Enquiry – ${enquiry.enquiry_reference}`)
    setMessage(
      `Hi ${enquiry.full_name},\n\n` +
      `Thank you for your event enquiry with Big Bean Cafe.\n\n` +
      `We have received your requirements for ${occasion} at ${outlet}. Our team will review the details and get back to you regarding availability, seating and arrangements.\n\n` +
      `Regards,\nBig Bean Cafe Team`
    )
  }, [enquiry])

  useEffect(() => {
    if (!enquiry) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [enquiry, onClose])

  if (!enquiry) return null

  const canSend = Boolean(enquiry.email) && subject.trim().length > 0 && message.trim().length > 0 && !sending

  const send = async () => {
    if (!canSend) return
    setSending(true)
    try {
      const res = await apiRequest(`/admin/private-event-enquiries/${enquiry.id}/send-email`, {
        method: 'POST',
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        toast.success(data.message || 'Email sent successfully')
        onSent?.(data.status)
        onClose()
      } else {
        toast.error(data.message || 'Could not send the email. Please try again.')
      }
    } catch {
      toast.error('Could not send the email. Please try again.')
    }
    setSending(false)
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true" aria-label="Reply to Event Enquiry"
    >
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-[24px] border border-[#EAE2D6] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#F1E6D6] px-6 py-5">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-heading text-lg font-black text-[#3D1F0D]">
              <Mail className="h-5 w-5 shrink-0 text-[#C9943A]" /> Reply to Event Enquiry
            </h2>
            <p className="mt-1 truncate text-xs text-[#8A7059]">
              {enquiry.full_name} · {enquiry.email || 'No email on record'} · <span className="font-mono font-bold text-[#8B4A2F]">{enquiry.enquiry_reference}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#B09880] transition hover:bg-[#F6F3EE] hover:text-[#3D1F0D]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#C9943A]">To</label>
            <input
              type="text" readOnly value={enquiry.email || ''}
              className="w-full cursor-not-allowed rounded-xl border border-[#EAE2D6] bg-[#FAF5EE] px-3.5 py-2.5 text-sm text-[#8A7059]"
            />
          </div>
          {!enquiry.email && (
            <p className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> No email address on record — the reply cannot be sent.
            </p>
          )}
          <div>
            <label htmlFor="pe-reply-subject" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#C9943A]">Subject</label>
            <input
              id="pe-reply-subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-[#E4D5BF] bg-white px-3.5 py-2.5 text-sm text-[#3D1F0D] focus:border-[#C9943A] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/25"
            />
          </div>
          <div>
            <label htmlFor="pe-reply-message" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#C9943A]">Message</label>
            <textarea
              id="pe-reply-message" rows={9} value={message} onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-y rounded-xl border border-[#E4D5BF] bg-white px-3.5 py-2.5 text-sm leading-relaxed text-[#3D1F0D] focus:border-[#C9943A] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/25"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#F1E6D6] px-6 py-4">
          <button
            onClick={onClose} disabled={sending}
            className="rounded-xl border border-[#E4D5BF] px-5 py-2.5 text-sm font-bold text-[#6B4F3A] transition hover:bg-[#FAF5EE] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={send} disabled={!canSend}
            className="inline-flex items-center gap-2 rounded-xl bg-[#3D1F0D] px-5 py-2.5 text-sm font-bold text-[#FFF7ED] transition hover:bg-[#5A2D1D] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? 'Sending…' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  )
}
