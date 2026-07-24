'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, Package, Calendar, StickyNote, Hash } from 'lucide-react'
import apiRequest from '@/utils/api'
import ReplyPanel from '@/components/admin/ReplyPanel'

const STATUS_STYLE: Record<string, string> = {
  new: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  proposal_sent: 'bg-purple-50 text-purple-700 border-purple-200',
  follow_up: 'bg-amber-50 text-amber-700 border-amber-200',
  converted: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
  { value: 'rejected', label: 'Rejected' },
]

const TEMPLATES = [
  {
    key: 'default_reply', label: 'Default Reply',
    subject: 'Thank you for your Corporate Order Enquiry - Big Bean Café',
    message: `Hi {name},\n\nThank you for reaching out to Big Bean Café for corporate orders.\n\nOur team has received your enquiry and will contact you shortly with menu options, pricing and available packages.\n\nFor urgent support, you can reply to this email or contact us directly.\n\nRegards,\nBig Bean Café Coffee Roasters`,
    whatsapp: `Hi {name}, thank you for your corporate order enquiry to Big Bean Café! Our team has received your request and will get back to you shortly. ☕`,
  },
  {
    key: 'proposal_sent', label: 'Proposal Sent',
    subject: 'Corporate Order Proposal - Big Bean Café',
    message: `Hi {name},\n\nThank you for your interest in Big Bean Café for your corporate requirements.\n\nPlease find attached our proposal for your review. We would love to discuss this further at your convenience.\n\nRegards,\nBig Bean Café Coffee Roasters`,
    whatsapp: `Hi {name}, we've sent across our corporate order proposal. Please check your email and let us know if you have questions! ☕`,
  },
]

const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 w-32 flex-shrink-0">{label}</span>
    <span className="text-xs text-gray-700 text-right font-medium">{value || '—'}</span>
  </div>
)

export default function CorporateEnquiryDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [enquiry, setEnquiry] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiRequest(`/corporate-enquiries/${id}`)
      const data = await res.json()
      if (data.success) setEnquiry(data.data)
    } catch { /* silent */ }
    setLoading(false)
  }, [id])

  useEffect(() => { if (id) load() }, [id, load])

  // Apply template vars
  const applyTemplateVars = (templates: typeof TEMPLATES, record: any) =>
    templates.map(t => ({
      ...t,
      message: t.message.replace(/{name}/g, record?.contact_person || record?.company_name || ''),
      whatsapp: t.whatsapp.replace(/{name}/g, record?.contact_person || record?.company_name || ''),
    }))

  if (loading) return (
    <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C9943A] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!enquiry) return (
    <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center">
      <div className="text-center space-y-3">
        <p className="text-gray-500">Enquiry not found</p>
        <Link href="/admin/corporate-enquiries" className="text-[#C9943A] text-sm hover:underline">← Back to list</Link>
      </div>
    </div>
  )

  const status = enquiry.status || 'new'

  return (
    <div className="min-h-screen bg-[#f7f3ee] px-4 py-6 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/admin/corporate-enquiries"
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#3D1F0D]">{enquiry.company_name}</h1>
            <p className="text-xs text-gray-400">Corporate Enquiry #{enquiry.id} · {fmtDate(enquiry.created_at)}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLE[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {STATUS_OPTIONS.find(s => s.value === status)?.label || status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Details */}
          <div className="space-y-4">
            {/* Company Info */}
            <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C9943A]" />
                <h2 className="text-sm font-semibold text-gray-800">Company Details</h2>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="Company" value={enquiry.company_name} />
                <InfoRow label="Contact Person" value={enquiry.contact_person} />
                <InfoRow label="Email" value={enquiry.email} />
                <InfoRow label="Phone" value={enquiry.phone} />
                <InfoRow label="Budget Range" value={enquiry.budget_range} />
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#C9943A]" />
                <h2 className="text-sm font-semibold text-gray-800">Order Details</h2>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="Order Type" value={enquiry.order_type} />
                <InfoRow label="Quantity" value={enquiry.quantity} />
                <InfoRow label="Delivery Date" value={enquiry.delivery_date ? String(enquiry.delivery_date).split('T')[0] : null} />
                <InfoRow label="Delivery Address" value={enquiry.delivery_address} />
              </div>
            </div>

            {/* Requirements */}
            {enquiry.requirements && (
              <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-[#C9943A]" />
                  <h2 className="text-sm font-semibold text-gray-800">Requirements</h2>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{enquiry.requirements}</p>
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#C9943A]" />
                <h2 className="text-sm font-semibold text-gray-800">Record Info</h2>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="Enquiry ID" value={`#${enquiry.id}`} />
                <InfoRow label="Created" value={fmtDate(enquiry.created_at)} />
                <InfoRow label="Updated" value={fmtDate(enquiry.updated_at)} />
                <InfoRow label="Current Status" value={STATUS_OPTIONS.find(s => s.value === status)?.label || status} />
              </div>
            </div>
          </div>

          {/* Right: Reply Panel */}
          <div>
            <ReplyPanel
              moduleName="corporate-enquiries"
              recordId={enquiry.id}
              name={enquiry.contact_person || enquiry.company_name}
              email={enquiry.email}
              phone={enquiry.phone}
              defaultSubject={`Re: Corporate Order Enquiry — ${enquiry.company_name}`}
              defaultMessage={`Hi ${enquiry.contact_person || enquiry.company_name},\n\nThank you for your enquiry.\n\nRegards,\nBig Bean Café`}
              templates={applyTemplateVars(TEMPLATES, enquiry)}
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
