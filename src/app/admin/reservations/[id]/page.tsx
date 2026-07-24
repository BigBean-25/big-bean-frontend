'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Calendar, Clock, Users, MapPin, StickyNote, Hash } from 'lucide-react'
import apiRequest from '@/utils/api'
import ReplyPanel from '@/components/admin/ReplyPanel'

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  no_show: 'bg-gray-100 text-gray-600 border-gray-200',
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
  { value: 'no_show', label: 'No Show' },
]

const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const fmtDay = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'
const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 w-32 flex-shrink-0">{label}</span>
    <span className="text-xs text-gray-700 text-right font-medium">{value || '—'}</span>
  </div>
)

export default function ReservationDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [reservation, setReservation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiRequest(`/reservations/${id}`)
      const data = await res.json()
      if (data.success) setReservation(data.data)
    } catch { /* silent */ }
    setLoading(false)
  }, [id])

  useEffect(() => { if (id) load() }, [id, load])

  const buildTemplates = (r: any) => {
    const name = r?.full_name || r?.name || ''
    const date = r?.reservation_date ? String(r.reservation_date).split('T')[0] : ''
    const time = r?.reservation_time || ''
    const guests = r?.guests || ''
    return [
      {
        key: 'confirmed', label: 'Confirmation',
        subject: 'Reservation Confirmed - Big Bean Café',
        message: `Hi ${name},\n\nYour reservation at Big Bean Café is confirmed.\n\nReservation Date: ${date}\nTime: ${time}\nGuests: ${guests}\n\nWe look forward to welcoming you. Please arrive a few minutes early.\n\nRegards,\nBig Bean Café Coffee Roasters`,
        whatsapp: `Hi ${name}, your reservation at Big Bean Café is confirmed! 📅 Date: ${date} | Time: ${time} | Guests: ${guests}. We look forward to seeing you! ☕`,
      },
      {
        key: 'reminder', label: 'Reminder',
        subject: 'Reservation Reminder - Big Bean Café',
        message: `Hi ${name},\n\nThis is a friendly reminder about your upcoming reservation at Big Bean Café.\n\nDate: ${date}\nTime: ${time}\nGuests: ${guests}\n\nWe look forward to seeing you!\n\nRegards,\nBig Bean Café Coffee Roasters`,
        whatsapp: `Hi ${name}, reminder: your Big Bean Café reservation is coming up! 📅 Date: ${date} | Time: ${time}. See you soon! ☕`,
      },
      {
        key: 'cancelled', label: 'Cancellation',
        subject: 'Reservation Update - Big Bean Café',
        message: `Hi ${name},\n\nYour reservation request could not be confirmed or has been cancelled.\n\nWe apologize for the inconvenience. Please contact us or book another slot at your convenience.\n\nRegards,\nBig Bean Café Coffee Roasters`,
        whatsapp: `Hi ${name}, we regret that your Big Bean Café reservation could not be confirmed. Please contact us to book another slot. ☕`,
      },
    ]
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C9943A] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!reservation) return (
    <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center">
      <p className="text-gray-500">Reservation not found. <Link href="/admin/reservations" className="text-[#C9943A] hover:underline">← Back</Link></p>
    </div>
  )

  const status = reservation.status || 'pending'
  const r = reservation

  return (
    <div className="min-h-screen bg-[#f7f3ee] px-4 py-6 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/admin/reservations" className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#3D1F0D]">{r.full_name || r.name}</h1>
            <p className="text-xs text-gray-400">Reservation #{r.id} · {r.outlet_name || 'Big Bean Café'} · {fmtDate(r.created_at)}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLE[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {STATUS_OPTIONS.find(s => s.value === status)?.label || status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            {/* Reservation Summary */}
            <div className="bg-gradient-to-br from-[#3D1F0D] to-[#6b3520] rounded-[20px] p-5 text-white shadow-sm">
              <div className="flex items-center gap-2 mb-3 opacity-70">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Reservation</span>
              </div>
              <p className="text-xl font-bold mb-1">{fmtDay(r.reservation_date)}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 opacity-70" />{r.reservation_time}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 opacity-70" />{r.guests} guests</span>
                {r.outlet_name && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 opacity-70" />{r.outlet_name}</span>}
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                <User className="w-4 h-4 text-[#C9943A]" />
                <h2 className="text-sm font-semibold text-gray-800">Guest Details</h2>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="Name" value={r.full_name || r.name} />
                <InfoRow label="Email" value={r.email} />
                <InfoRow label="Phone" value={r.phone} />
              </div>
            </div>

            {r.special_requests && (
              <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-[#C9943A]" />
                  <h2 className="text-sm font-semibold text-gray-800">Special Requests</h2>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-gray-600 leading-relaxed">{r.special_requests}</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#C9943A]" />
                <h2 className="text-sm font-semibold text-gray-800">Record Info</h2>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="ID" value={`#${r.id}`} />
                <InfoRow label="Submitted" value={fmtDate(r.created_at)} />
                <InfoRow label="Updated" value={fmtDate(r.updated_at)} />
                {r.admin_notes && <InfoRow label="Admin Notes" value={r.admin_notes} />}
              </div>
            </div>
          </div>

          <div>
            <ReplyPanel
              moduleName="reservations"
              recordId={r.id}
              name={r.full_name || r.name}
              email={r.email}
              phone={r.phone}
              defaultSubject={`Reservation Confirmation — Big Bean Café`}
              defaultMessage={`Hi ${r.full_name || r.name},\n\nYour reservation at Big Bean Café has been ${status}.\n\nRegards,\nBig Bean Café`}
              templates={buildTemplates(r)}
              currentStatus={status}
              statusOptions={STATUS_OPTIONS}
              onStatusUpdated={load}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
