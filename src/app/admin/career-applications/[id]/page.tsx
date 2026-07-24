'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Briefcase, GraduationCap, FileText, StickyNote, Hash, Download } from 'lucide-react'
import apiRequest from '@/utils/api'
import ReplyPanel from '@/components/admin/ReplyPanel'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')

const STATUS_STYLE: Record<string, string> = {
  new: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
  shortlisted: 'bg-green-50 text-green-700 border-green-200',
  interview_scheduled: 'bg-purple-50 text-purple-700 border-purple-200',
  selected: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
  on_hold: 'bg-gray-100 text-gray-600 border-gray-200',
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'selected', label: 'Selected' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'on_hold', label: 'On Hold' },
]

const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 w-36 flex-shrink-0">{label}</span>
    <span className="text-xs text-gray-700 text-right font-medium">{value || '—'}</span>
  </div>
)

export default function CareerApplicationDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiRequest(`/career-applications/${id}`)
      const data = await res.json()
      if (data.success) setApp(data.data)
    } catch { /* silent */ }
    setLoading(false)
  }, [id])

  useEffect(() => { if (id) load() }, [id, load])

  const buildTemplates = (r: any) => {
    const name = r?.full_name || r?.name || ''
    const pos = r?.job_title || r?.position || 'the position'
    return [
      {
        key: 'application_received', label: 'Application Received',
        subject: 'Application Received - Big Bean Café',
        message: `Hi ${name},\n\nThank you for applying to Big Bean Café.\n\nWe have received your application for ${pos}. Our team will review your profile and contact you if shortlisted.\n\nRegards,\nBig Bean Café HR Team`,
        whatsapp: `Hi ${name}, we've received your application for ${pos} at Big Bean Café. Our HR team will review and get back to you. ☕`,
      },
      {
        key: 'shortlisted', label: 'Shortlisted',
        subject: 'You have been shortlisted - Big Bean Café',
        message: `Hi ${name},\n\nCongratulations! You have been shortlisted for the next step at Big Bean Café.\n\nOur team will contact you shortly for interview scheduling.\n\nRegards,\nBig Bean Café HR Team`,
        whatsapp: `Hi ${name}, congratulations! You have been shortlisted at Big Bean Café. Our HR team will contact you shortly. ☕`,
      },
      {
        key: 'interview_scheduled', label: 'Interview Scheduled',
        subject: 'Interview Scheduled - Big Bean Café',
        message: `Hi ${name},\n\nThank you for your interest in joining Big Bean Café.\n\nYour interview has been scheduled. Our team will contact you with the details shortly.\n\nRegards,\nBig Bean Café HR Team`,
        whatsapp: `Hi ${name}, your interview at Big Bean Café has been scheduled! Our team will share the details shortly. ☕`,
      },
      {
        key: 'rejected', label: 'Application Update',
        subject: 'Update on your application - Big Bean Café',
        message: `Hi ${name},\n\nThank you for your interest in Big Bean Café.\n\nAfter careful review, we are unable to proceed with your application at this time. We appreciate your time and wish you the very best.\n\nRegards,\nBig Bean Café HR Team`,
        whatsapp: `Hi ${name}, thank you for applying to Big Bean Café. After review, we're unable to proceed at this time. We wish you the best. ☕`,
      },
      {
        key: 'selected', label: 'Selected / Offer',
        subject: 'Welcome to Big Bean Café!',
        message: `Hi ${name},\n\nCongratulations! We are pleased to inform you that you have been selected to join the Big Bean Café team.\n\nOur HR team will contact you shortly with offer details.\n\nRegards,\nBig Bean Café HR Team`,
        whatsapp: `Hi ${name}, congratulations! You've been selected to join Big Bean Café! Our HR team will reach out with the offer details. ☕🎉`,
      },
    ]
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C9943A] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!app) return (
    <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center">
      <p className="text-gray-500">Application not found. <Link href="/admin/career-applications" className="text-[#C9943A] hover:underline">← Back</Link></p>
    </div>
  )

  const status = app.status || 'new'

  return (
    <div className="min-h-screen bg-[#f7f3ee] px-4 py-6 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/admin/career-applications" className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#3D1F0D]">{app.full_name || app.name}</h1>
            <p className="text-xs text-gray-400">Application #{app.id} · {app.job_title || app.position || 'Open Application'} · {fmtDate(app.created_at)}</p>
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
                <h2 className="text-sm font-semibold text-gray-800">Applicant</h2>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="Name" value={app.full_name || app.name} />
                <InfoRow label="Email" value={app.email} />
                <InfoRow label="Phone" value={app.phone} />
                <InfoRow label="Applied For" value={app.job_title || app.position} />
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#C9943A]" />
                <h2 className="text-sm font-semibold text-gray-800">Professional Details</h2>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="Experience" value={app.experience} />
                <InfoRow label="Expected Salary" value={app.expected_salary} />
                <InfoRow label="Notice Period" value={app.notice_period} />
              </div>
            </div>

            {app.education && (
              <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#C9943A]" />
                  <h2 className="text-sm font-semibold text-gray-800">Education</h2>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-gray-600 leading-relaxed">{app.education}</p>
                </div>
              </div>
            )}

            {app.skills && (
              <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#C9943A]" />
                  <h2 className="text-sm font-semibold text-gray-800">Skills</h2>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-gray-600 leading-relaxed">{app.skills}</p>
                </div>
              </div>
            )}

            {app.cover_letter && (
              <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C9943A]" />
                  <h2 className="text-sm font-semibold text-gray-800">Cover Letter</h2>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{app.cover_letter}</p>
                </div>
              </div>
            )}

            {app.resume_file && (
              <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C9943A]" />
                    <span className="text-sm font-semibold text-gray-800">Resume</span>
                  </div>
                  <a href={`${API_BASE}/${app.resume_file}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#C9943A] font-semibold hover:underline">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              </div>
            )}
          </div>

          <div>
            <ReplyPanel
              moduleName="career-applications"
              recordId={app.id}
              name={app.full_name || app.name}
              email={app.email}
              phone={app.phone}
              defaultSubject={`Re: Application for ${app.job_title || app.position || 'position'}`}
              defaultMessage={`Hi ${app.full_name || app.name},\n\nThank you for applying to Big Bean Café.\n\nRegards,\nBig Bean Café HR Team`}
              templates={buildTemplates(app)}
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
