'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, MessageSquare, Hash, Tag } from 'lucide-react'
import apiRequest from '@/utils/api'
import ReplyPanel from '@/components/admin/ReplyPanel'

const STATUS_STYLE: Record<string, string> = {
  new: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  replied: 'bg-blue-50 text-blue-700 border-blue-200',
  follow_up: 'bg-purple-50 text-purple-700 border-purple-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
  spam: 'bg-red-50 text-red-600 border-red-200',
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'replied', label: 'Replied' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'spam', label: 'Spam' },
]

const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 w-28 flex-shrink-0">{label}</span>
    <span className="text-xs text-gray-700 text-right font-medium">{value || '—'}</span>
  </div>
)

export default function ContactEnquiryDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [enquiry, setEnquiry] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiRequest(`/contact-enquiries/${id}`)
      const data = await res.json()
      if (data.success) setEnquiry(data.data)
    } catch { /* silent */ }
    setLoading(false)
  }, [id])

  useEffect(() => { if (id) load() }, [id, load])

  const buildTemplates = (r: any) => {
    const name = r?.name || ''
    return [
      {
        key: 'default_reply', label: 'Default Reply',
        subject: 'Thank you for contacting Big Bean Café',
        message: `Hi ${name},\n\nThank you for contacting Big Bean Café.\n\nOur team has received your message and will get back to you shortly.\n\nRegards,\nBig Bean Café Coffee Roasters`,
        whatsapp: `Hi ${name}, thank you for contacting Big Bean Café! We received your message and will get back to you shortly. ☕`,
      },
      {
        key: 'resolved', label: 'Resolved',
        subject: 'Your enquiry has been resolved - Big Bean Café',
        message: `Hi ${name},\n\nThank you for reaching out to Big Bean Café.\n\nWe are happy to let you know that your enquiry has been resolved. Please feel free to contact us again if you need further assistance.\n\nRegards,\nBig Bean Café Coffee Roasters`,
        whatsapp: `Hi ${name}, your enquiry with Big Bean Café has been resolved. Feel free to reach out if you need anything else. ☕`,
      },
    ]
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C9943A] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!enquiry) return (
    <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center">
      <p className="text-gray-500">Enquiry not found. <Link href="/admin/contact-enquiries" className="text-[#C9943A] hover:underline">← Back</Link></p>
    </div>
  )

  const status = enquiry.status || 'new'

  return (
    <div className="min-h-screen bg-[#f7f3ee] px-4 py-6 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/admin/contact-enquiries" className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#3D1F0D]">{enquiry.name}</h1>
            <p className="text-xs text-gray-400">Contact Enquiry #{enquiry.id} · {fmtDate(enquiry.created_at)}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLE[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {STATUS_OPTIONS.find(s => s.value === status)?.label || status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                <User className="w-4 h-4 text-[#C9943A]" />
                <h2 className="text-sm font-semibold text-gray-800">Contact Details</h2>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="Name" value={enquiry.name} />
                <InfoRow label="Email" value={enquiry.email} />
                <InfoRow label="Phone" value={enquiry.phone} />
                <InfoRow label="Category" value={enquiry.category} />
                <InfoRow label="Priority" value={enquiry.priority} />
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#C9943A]" />
                <h2 className="text-sm font-semibold text-gray-800">Subject</h2>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm font-semibold text-gray-800">{enquiry.subject || '—'}</p>
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#C9943A]" />
                <h2 className="text-sm font-semibold text-gray-800">Message</h2>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{enquiry.message || '—'}</p>
              </div>
            </div>

            {enquiry.notes && (
              <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#C9943A]" />
                  <h2 className="text-sm font-semibold text-gray-800">Admin Notes</h2>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-gray-600 leading-relaxed">{enquiry.notes}</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#C9943A]" />
                <h2 className="text-sm font-semibold text-gray-800">Record Info</h2>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="ID" value={`#${enquiry.id}`} />
                <InfoRow label="Received" value={fmtDate(enquiry.created_at)} />
                <InfoRow label="Updated" value={fmtDate(enquiry.updated_at)} />
              </div>
            </div>
          </div>

          <div>
            <ReplyPanel
              moduleName="contact-enquiries"
              recordId={enquiry.id}
              name={enquiry.name}
              email={enquiry.email}
              phone={enquiry.phone}
              defaultSubject={`Re: ${enquiry.subject || 'Your Enquiry'}`}
              defaultMessage={`Hi ${enquiry.name},\n\nThank you for contacting Big Bean Café.\n\nRegards,\nBig Bean Café`}
              templates={buildTemplates(enquiry)}
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
