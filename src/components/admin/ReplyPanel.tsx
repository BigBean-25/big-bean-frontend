'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mail, MessageCircle, Copy, Check, ChevronDown, RefreshCw, Send, Clock, AlertCircle, ExternalLink } from 'lucide-react'
import apiRequest from '@/utils/api'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ReplyTemplate {
  key: string
  label: string
  subject?: string
  message: string
  whatsapp: string
}

export interface CommLog {
  id: number
  channel: 'email' | 'whatsapp' | 'sms' | 'manual'
  recipient_name: string | null
  recipient_email: string | null
  recipient_phone: string | null
  subject: string | null
  message: string | null
  status: 'sent' | 'failed' | 'opened' | 'copied' | 'pending'
  error_message: string | null
  sent_at: string
}

export interface ReplyPanelProps {
  moduleName: string       // e.g. 'corporate-enquiries'
  recordId: number | string
  name: string
  email?: string | null
  phone?: string | null
  defaultSubject?: string
  defaultMessage?: string
  templates?: ReplyTemplate[]
  currentStatus?: string
  statusOptions?: { value: string; label: string }[]
  onStatusUpdated?: () => void
}

// ── helpers ────────────────────────────────────────────────────────────────────
const fmtDate = (d?: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  email: <Mail className="w-3.5 h-3.5 text-blue-500" />,
  whatsapp: <MessageCircle className="w-3.5 h-3.5 text-green-500" />,
  manual: <Copy className="w-3.5 h-3.5 text-gray-400" />,
}

const STATUS_DOT: Record<string, string> = {
  sent: 'bg-green-400',
  failed: 'bg-red-400',
  copied: 'bg-amber-400',
  opened: 'bg-blue-400',
  pending: 'bg-gray-300',
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function ReplyPanel({
  moduleName, recordId, name, email, phone,
  defaultSubject = '', defaultMessage = '',
  templates = [], currentStatus, statusOptions = [],
  onStatusUpdated,
}: ReplyPanelProps) {
  const [tab, setTab] = useState<'email' | 'whatsapp'>('email')
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.key || '')
  const [subject, setSubject] = useState(defaultSubject)
  const [message, setMessage] = useState(defaultMessage)
  const [waMessage, setWaMessage] = useState(templates[0]?.whatsapp || defaultMessage)
  const [loading, setLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [logs, setLogs] = useState<CommLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [newStatus, setNewStatus] = useState(currentStatus || statusOptions[0]?.value || '')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [logsOpen, setLogsOpen] = useState(false)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4500)
  }

  const loadLogs = useCallback(async () => {
    setLogsLoading(true)
    try {
      const res = await apiRequest(`/${moduleName}/${recordId}/logs`)
      const data = await res.json()
      if (data.success) setLogs(data.data || [])
    } catch { /* silent */ }
    setLogsLoading(false)
  }, [moduleName, recordId])

  useEffect(() => { if (logsOpen) loadLogs() }, [logsOpen, loadLogs])

  // Apply template selection
  const applyTemplate = (key: string) => {
    const t = templates.find(t => t.key === key)
    if (!t) return
    setSelectedTemplate(key)
    if (t.subject) setSubject(t.subject)
    setMessage(t.message)
    setWaMessage(t.whatsapp)
  }

  const handleSendEmail = async () => {
    if (!email) return showToast('Email address is missing for this record.', 'error')
    setLoading('email')
    try {
      const res = await apiRequest(`/${moduleName}/${recordId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, template_key: selectedTemplate }),
      })
      const data = await res.json()
      if (data.success) { showToast(data.message || 'Email sent successfully'); loadLogs() }
      else showToast(data.message || 'Failed to send email', 'error')
    } catch { showToast('Network error — could not send email', 'error') }
    setLoading(null)
  }

  const handleSendWhatsApp = async () => {
    if (!phone) return showToast('Phone number is missing for this record.', 'error')
    setLoading('whatsapp')
    try {
      const res = await apiRequest(`/${moduleName}/${recordId}/send-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: waMessage, template_key: selectedTemplate }),
      })
      const data = await res.json()
      if (data.whatsapp_web_url) {
        window.open(data.whatsapp_web_url, '_blank')
        showToast('WhatsApp Web opened in new tab')
        loadLogs()
      } else if (data.success) {
        showToast(data.message || 'WhatsApp message sent')
        loadLogs()
      } else {
        showToast(data.message || 'Failed to send WhatsApp', 'error')
      }
    } catch { showToast('Network error — could not send WhatsApp', 'error') }
    setLoading(null)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tab === 'email' ? message : waMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      // Log copy action silently
      apiRequest(`/${moduleName}/${recordId}/send-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: tab === 'email' ? message : waMessage, template_key: 'copied' }),
      }).catch(() => {})
    } catch { showToast('Failed to copy', 'error') }
  }

  const handleStatusUpdate = async () => {
    if (!newStatus) return
    setUpdatingStatus(true)
    try {
      const res = await apiRequest(`/${moduleName}/${recordId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        showToast(`Status updated to "${statusOptions.find(s => s.value === newStatus)?.label || newStatus}"`)
        onStatusUpdated?.()
      } else {
        showToast(data.message || 'Failed to update status', 'error')
      }
    } catch { showToast('Network error — could not update status', 'error') }
    setUpdatingStatus(false)
  }

  const normalizePhone = (p = '') => {
    const clean = p.replace(/[\s\-()+]/g, '')
    if (clean.length === 10) return '91' + clean
    return clean
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium shadow-sm border ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.type === 'success' && <Check className="w-4 h-4 flex-shrink-0" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Status Update */}
      {statusOptions.length > 0 && (
        <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9943A]" />
            <h3 className="text-sm font-semibold text-gray-800">Update Status</h3>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {statusOptions.map(s => (
                <button key={s.value} onClick={() => setNewStatus(s.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    newStatus === s.value
                      ? 'bg-[#3D1F0D] text-white border-[#3D1F0D]'
                      : 'border-gray-200 text-gray-600 hover:border-[#C9943A] hover:text-[#C9943A]'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
            <button onClick={handleStatusUpdate}
              disabled={updatingStatus || newStatus === currentStatus}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#3D1F0D] text-white text-sm font-semibold hover:bg-[#C9943A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {updatingStatus ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {updatingStatus ? 'Updating…' : 'Save Status'}
            </button>
          </div>
        </div>
      )}

      {/* Reply Panel */}
      <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#DCE8E3] flex items-center gap-2">
          <Send className="w-4 h-4 text-[#C9943A]" />
          <h3 className="text-sm font-semibold text-gray-800">Notify Customer</h3>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#DCE8E3]">
          {(['email', 'whatsapp'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors ${
                tab === t
                  ? 'border-b-2 border-[#C9943A] text-[#C9943A] bg-[#fff8f0]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t === 'email' ? <Mail className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
              {t === 'email' ? 'Email' : 'WhatsApp'}
              {t === 'email' && !email && <span className="text-red-400 text-[10px]">no email</span>}
              {t === 'whatsapp' && !phone && <span className="text-red-400 text-[10px]">no phone</span>}
            </button>
          ))}
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* Template picker */}
          {templates.length > 0 && (
            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <select value={selectedTemplate} onChange={e => applyTemplate(e.target.value)}
                className="w-full appearance-none text-xs px-3 py-2 pr-8 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:border-[#C9943A]">
                {templates.map(t => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </div>
          )}

          {tab === 'email' ? (
            <>
              <input value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="Email subject…"
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#C9943A] text-gray-700" />
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={7}
                placeholder="Email message…"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#C9943A] text-gray-700 resize-none" />
              {!email && (
                <p className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  No email address on record. Email cannot be sent.
                </p>
              )}
              <div className="flex gap-2">
                <button onClick={handleSendEmail} disabled={loading === 'email' || !email}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading === 'email' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  Send Email
                </button>
                <button onClick={handleCopy}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </>
          ) : (
            <>
              <textarea value={waMessage} onChange={e => setWaMessage(e.target.value)} rows={5}
                placeholder="WhatsApp message…"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#C9943A] text-gray-700 resize-none" />
              {!phone && (
                <p className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  No phone number on record.
                </p>
              )}
              <div className="flex gap-2">
                <button onClick={handleSendWhatsApp} disabled={loading === 'whatsapp' || !phone}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading === 'whatsapp' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
                  Open WhatsApp
                </button>
                <button onClick={handleCopy}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              {phone && (
                <a href={`https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(waMessage)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-green-200 bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open wa.me directly
                </a>
              )}
            </>
          )}
        </div>
      </div>

      {/* Communication History */}
      <div className="bg-white rounded-[20px] border border-[#DCE8E3] shadow-sm overflow-hidden">
        <button onClick={() => setLogsOpen(o => !o)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C9943A]" />
            <span className="text-sm font-semibold text-gray-800">Communication History</span>
            {logs.length > 0 && (
              <span className="px-2 py-0.5 bg-[#C9943A]/10 text-[#C9943A] text-xs font-bold rounded-full">{logs.length}</span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${logsOpen ? 'rotate-180' : ''}`} />
        </button>

        {logsOpen && (
          <div className="border-t border-[#DCE8E3]">
            {logsLoading ? (
              <div className="px-5 py-6 flex justify-center">
                <RefreshCw className="w-4 h-4 animate-spin text-[#C9943A]" />
              </div>
            ) : logs.length === 0 ? (
              <div className="px-5 py-6 text-center text-xs text-gray-400">No communication history yet.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {logs.map(log => (
                  <div key={log.id} className="px-5 py-3 flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 mt-0.5">
                      {CHANNEL_ICON[log.channel] || <Mail className="w-3.5 h-3.5 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-700 capitalize">{log.channel}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[log.status] || 'bg-gray-300'}`} />
                        <span className="text-[11px] text-gray-400 capitalize">{log.status}</span>
                        <span className="text-[10px] text-gray-300 ml-auto">{fmtDate(log.sent_at)}</span>
                      </div>
                      {log.subject && <p className="text-xs text-gray-600 mt-0.5 font-medium truncate">{log.subject}</p>}
                      {log.message && <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{log.message}</p>}
                      {log.error_message && (
                        <p className="text-[11px] text-red-400 mt-0.5 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          {log.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
