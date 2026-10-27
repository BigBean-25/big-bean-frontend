'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import apiRequest from '@/lib/api'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, Mail, Phone, User,
  FileText, Sparkles, Loader2, Trash2,
} from 'lucide-react'
import { STATUS_META, OCCASION_LABELS } from '@/lib/privateEventMeta'

interface Enquiry {
  id: number
  enquiry_reference: string
  full_name: string
  phone: string
  email: string | null
  outlet_id: number | null
  outlet_slug: string | null
  outlet_name: string | null
  occasion: string
  event_date: string | null
  date_not_decided: number
  preferred_time: string | null
  duration: string | null
  guest_count: number | null
  food_preferences: string | null
  requirements: string | null
  venue_visit_requested: number
  enquiry_intent: string
  consent: number
  status: string
  assigned_to: number | null
  assigned_name: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

const fmt = (d: string | null, withTime = false) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}) }) : '—'

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#C9943A]">{label}</p>
    <p className="mt-1 text-sm font-semibold text-[#3D1F0D]">{children}</p>
  </div>
)

export default function PrivateEventEnquiryDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiRequest(`/admin/private-event-enquiries/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setEnquiry(d.data)
          setStatus(d.data.status)
          setNotes(d.data.admin_notes || '')
        } else {
          toast.error('Enquiry not found')
        }
      })
      .catch(() => toast.error('Failed to load enquiry'))
      .finally(() => setLoading(false))
  }, [id])

  const save = async () => {
    setSaving(true)
    try {
      const res = await apiRequest(`/admin/private-event-enquiries/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, admin_notes: notes }),
      })
      if (!res.ok) throw new Error()
      toast.success('Enquiry updated')
      setEnquiry((e) => (e ? { ...e, status, admin_notes: notes } : e))
    } catch {
      toast.error('Failed to update')
    }
    setSaving(false)
  }

  const remove = async () => {
    if (!confirm('Delete this enquiry? This cannot be undone.')) return
    try {
      await apiRequest(`/admin/private-event-enquiries/${id}`, { method: 'DELETE' })
      toast.success('Deleted')
      router.push('/admin/private-event-enquiries')
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-[#EAE2D6] bg-white py-20 text-center text-[#8A7059]">Loading…</div>
  }
  if (!enquiry) {
    return (
      <div className="rounded-2xl border border-[#EAE2D6] bg-white py-20 text-center">
        <p className="font-semibold text-[#6B4F3A]">Enquiry not found.</p>
        <Link href="/admin/private-event-enquiries" className="mt-4 inline-block text-sm font-bold text-[#C9943A] hover:underline">Back to enquiries</Link>
      </div>
    )
  }

  const meta = STATUS_META[enquiry.status] || { label: enquiry.status, cls: 'bg-[#F1EAE2] text-[#8A7059]' }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/private-event-enquiries" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#8A7059] transition hover:text-[#3D1F0D]">
        <ArrowLeft className="h-4 w-4" /> Back to Private Event Enquiries
      </Link>

      <div className="rounded-2xl border border-[#EAE2D6] bg-white p-6 shadow-[0_8px_30px_rgba(61,31,13,0.05)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#F1E6D6] pb-6">
          <div>
            <p className="font-mono text-xs font-bold text-[#8B4A2F]">{enquiry.enquiry_reference}</p>
            <h1 className="mt-1 font-heading text-2xl font-black text-[#3D1F0D]">{enquiry.full_name}</h1>
            <p className="mt-1 text-xs text-[#8A7059]">Received {fmt(enquiry.created_at, true)}</p>
          </div>
          <span className={`inline-flex rounded-full px-3.5 py-1.5 text-xs font-bold ${meta.cls}`}>{meta.label}</span>
        </div>

        <div className="grid gap-x-8 gap-y-5 py-6 sm:grid-cols-2">
          <Field label="Phone"><span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[#C9943A]" />{enquiry.phone}</span></Field>
          <Field label="Email"><span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-[#C9943A]" />{enquiry.email || '—'}</span></Field>
          <Field label="Preferred outlet"><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#C9943A]" />{enquiry.outlet_name || '—'}</span></Field>
          <Field label="Occasion"><span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-[#C9943A]" />{OCCASION_LABELS[enquiry.occasion] || enquiry.occasion}</span></Field>
          <Field label="Preferred date"><span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-[#C9943A]" />{enquiry.date_not_decided ? 'Date not decided' : fmt(enquiry.event_date)}</span></Field>
          <Field label="Guests"><span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-[#C9943A]" />{enquiry.guest_count ?? '—'}</span></Field>
          <Field label="Preferred time"><span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[#C9943A]" />{enquiry.preferred_time || '—'}</span></Field>
          <Field label="Duration"><span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[#C9943A]" />{enquiry.duration || '—'}</span></Field>
          <Field label="Intent"><span className="capitalize">{(enquiry.enquiry_intent || 'general').replace('-', ' ')}</span></Field>
          <Field label="Venue visit">{enquiry.venue_visit_requested ? 'Requested' : 'Not requested'}</Field>
          {enquiry.assigned_name && <Field label="Assigned to"><span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-[#C9943A]" />{enquiry.assigned_name}</span></Field>}
        </div>

        {(enquiry.food_preferences || enquiry.requirements) && (
          <div className="space-y-4 border-t border-[#F1E6D6] py-6">
            {enquiry.food_preferences && (
              <Field label="Food preferences"><span className="whitespace-pre-wrap font-normal text-[#6B4F3A]">{enquiry.food_preferences}</span></Field>
            )}
            {enquiry.requirements && (
              <Field label="Requirements"><span className="whitespace-pre-wrap font-normal text-[#6B4F3A]">{enquiry.requirements}</span></Field>
            )}
          </div>
        )}

        <div className="grid gap-4 border-t border-[#F1E6D6] pt-6 sm:grid-cols-[1fr_220px]">
          <div>
            <label htmlFor="pe-notes" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#C9943A]">
              <FileText className="h-3.5 w-3.5" /> Admin notes
            </label>
            <textarea
              id="pe-notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes — call outcome, quote details, next steps…"
              className="w-full rounded-xl border border-[#E4D5BF] bg-white px-3.5 py-2.5 text-sm text-[#3D1F0D] placeholder-[#B09880] focus:border-[#C9943A] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/25"
            />
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label htmlFor="pe-status" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#C9943A]">Status</label>
              <select
                id="pe-status" value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-[#E4D5BF] bg-white px-3.5 py-2.5 text-sm focus:border-[#C9943A] focus:outline-none"
              >
                {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <button
              onClick={save} disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3D1F0D] px-5 py-2.5 text-sm font-bold text-[#FFF7ED] transition hover:bg-[#5A2D1D] disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
            </button>
            <button
              onClick={remove}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
