'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, MapPin, Briefcase, StickyNote, Hash } from 'lucide-react'
import apiRequest from '@/utils/api'
import ReplyPanel from '@/components/admin/ReplyPanel'

const STATUS_STYLE: Record<string, string> = {
  new: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  profile_review: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  meeting_scheduled: 'bg-purple-50 text-purple-700 border-purple-200',
  proposal_sent: 'bg-amber-50 text-amber-700 border-amber-200',
  converted: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'profile_review', label: 'Profile Review' },
  { value: 'meeting_scheduled', label: 'Meeting Scheduled' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
  { value: 'rejected', label: 'Rejected' },
]

const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 w-36 flex-shrink-0">{label}</span>
    <span className="text-xs text-gray-700 text-right font-medium">{value || '—'}</span>
  </div>
)

export default function FranchiseEnquiryDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [enquiry, setEnquiry] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiRequest(`/franchise-enquiries/${id}`)
      const data = await res.json()
      if (data.success) setEnquiry(data.data)
    } catch { /* silent */ }
    setLoading(false)
  }, [id])

  useEffect(() => { if (id) load() }, [id, load])

  const buildTemplates = (r: any) => [
    {
      key: 'default_reply', label: 'Default Reply',
      subject: 'Thank you for your Franchise Enquiry - Big Bean Café',
      message: `Hi ${r?.full_name || r?.name || ''},\n\nThank you for your interest in partnering with Big Bean Café.\n\nOur franchise team has received your enquiry. We will review the details and get back to you with the next steps.\n\nRegards,\nBig Bean Café Coffee Roasters`,
      whatsapp: `Hi ${r?.full_name || r?.name || ''}, thank you for your interest in a Big Bean Café franchise! Our team has received your enquiry and will be in touch with the next steps. ☕`,
    },
    {
      key: 'meeting_scheduled', label: 'Meeting Scheduled',
      subject: 'Franchise Meeting Scheduled - Big Bean Café',
      message: `Hi ${r?.full_name || r?.name || ''},\n\nThank you for your continued interest in the Big Bean Café franchise opportunity.\n\nWe have scheduled a meeting to discuss further. Our team will confirm the time and details shortly.\n\nRegards,\nBig Bean Café Coffee Roasters`,
      whatsapp: `Hi ${r?.full_name || r?.name || ''}, we've scheduled a meeting to discuss your Big Bean Café franchise interest. Our team will confirm the details shortly. ☕`,
    },
  ]

  if (loading) return (
    <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C9943A] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!enquiry) return (
    <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center">
      <p className="text-gray-500">Enquiry not found. <Link href="/admin/franchise-enquiries" className="text-[#C9943A] hover:underline">← Back</Link></p>
    </div>
  )

  const status = enquiry.status || 'new'

  return (
    <div className="min-h-screen bg-[#f7f3ee] px-4 py-6 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/admin/franchise-enquiries" className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#3D1F0D]">{enquiry.full_name || enquiry.name}</h1>
            <p className="text-xs text-gray-400">Franchise Enquiry #{enquiry.id} · {fmtDate(enquiry.created_at)}</p>
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
                <h2 className="text-sm font-semibold text-gray-800">Applicant Details</h2>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="Name" value={enquiry.full_name || enquiry.name} />
                <InfoRow label="Email" value={enquiry.email} />
                <InfoRow label="Phone" value={enquiry.phone} />
                <InfoRow label="City" value={enquiry.city} />
                <InfoRow label="State" value={enquiry.state} />
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#C9943A]" />
                <h2 className="text-sm font-semibold text-gray-800">Franchise Interest</h2>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="Investment Range" value={enquiry.investment_range || enquiry.investment} />
                <InfoRow label="Preferred Location" value={enquiry.preferred_location} />
                <InfoRow label="Business Experience" value={enquiry.business_experience} />
              </div>
            </div>

            {enquiry.message && (
              <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-[#C9943A]" />
                  <h2 className="text-sm font-semibold text-gray-800">Message</h2>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{enquiry.message}</p>
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
                <InfoRow label="Submitted" value={fmtDate(enquiry.created_at)} />
                <InfoRow label="Updated" value={fmtDate(enquiry.updated_at)} />
              </div>
            </div>
          </div>

          <div>
            <ReplyPanel
              moduleName="franchise-enquiries"
              recordId={enquiry.id}
              name={enquiry.full_name || enquiry.name}
              email={enquiry.email}
              phone={enquiry.phone}
              defaultSubject={`Re: Franchise Enquiry — Big Bean Café`}
              defaultMessage={`Hi ${enquiry.full_name || enquiry.name},\n\nThank you for your interest in our franchise.\n\nRegards,\nBig Bean Café`}
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
