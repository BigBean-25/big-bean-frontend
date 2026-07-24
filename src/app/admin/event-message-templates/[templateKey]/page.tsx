'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  AlertCircle, ArrowLeft, Save, Mail, MessageSquare, RefreshCw
} from 'lucide-react'
import apiRequest from '@/lib/api'
import { isSuperAdmin, hasPermission } from '@/lib/adminPermissions'
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

const PLACEHOLDERS = [
  '{{customer_name}}', '{{event_title}}', '{{booking_id}}', '{{event_date}}',
  '{{event_time}}', '{{venue}}', '{{quantity}}', '{{amount}}', '{{status}}'
]

const card = 'rounded-[28px] border border-[#DCE8E3] bg-white shadow-[0_18px_45px_rgba(31,42,36,0.06)]'

export default function EditEventMessageTemplate() {
  const { templateKey } = useParams() as { templateKey: string }
  const router = useRouter()
  const [template, setTemplate] = useState<Template | null>(null)
  const [form, setForm] = useState({
    template_name: '',
    subject: '',
    email_body: '',
    whatsapp_body: '',
    status: 'active',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    setCanEdit(isSuperAdmin() || hasPermission('event_bookings', 'edit'))
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await apiRequest(`/admin/event-message-templates/${templateKey}`)
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed')
      setTemplate(data.data)
      setForm({
        template_name: data.data.template_name || '',
        subject: data.data.subject || '',
        email_body: data.data.email_body || '',
        whatsapp_body: data.data.whatsapp_body || '',
        status: data.data.status || 'active',
      })
    } catch (err: any) {
      console.error('Load template error', err)
      toast.error(err.message || 'Failed to load template')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [templateKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) return
    if (!form.template_name.trim()) {
      toast.error('Template name is required')
      return
    }
    setSaving(true)
    try {
      const res = await apiRequest(`/admin/event-message-templates/${templateKey}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed')
      toast.success(data.message || 'Template updated')
      router.push('/admin/event-message-templates')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/event-message-templates')}
            className="rounded-xl border border-[#DCE8E3] bg-white p-2.5 text-[#5F6F68] hover:bg-[#F3F8F6]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#0F1F1A] sm:text-3xl">Edit Message Template</h1>
            <p className="text-sm text-[#5F6F68]">{template?.template_key || templateKey}</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8E3] bg-white px-4 py-2.5 text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className={`${card} p-12 text-center`}>
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-[#2FBF9B]" />
          <p className="mt-4 text-sm text-[#5F6F68]">Loading template...</p>
        </div>
      ) : !template ? (
        <div className={`${card} p-12 text-center`}>
          <AlertCircle className="mx-auto mb-3 h-12 w-12 text-[#E85D4C]" />
          <p className="text-lg font-black text-[#0F1F1A]">Template not found</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className={`${card} p-6`}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-[#0F1F1A]">
                <Mail className="h-5 w-5 text-[#C9943A]" /> Email Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase text-[#5F6F68]">Template Name *</label>
                  <input
                    type="text"
                    value={form.template_name}
                    onChange={e => setForm({ ...form, template_name: e.target.value })}
                    disabled={!canEdit || saving}
                    className="w-full rounded-xl border border-[#DCE8E3] bg-[#F9FDFB] px-4 py-3 text-sm text-[#0F1F1A] focus:border-[#2FBF9B] focus:outline-none disabled:opacity-60"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase text-[#5F6F68]">Email Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    disabled={!canEdit || saving}
                    className="w-full rounded-xl border border-[#DCE8E3] bg-[#F9FDFB] px-4 py-3 text-sm text-[#0F1F1A] focus:border-[#2FBF9B] focus:outline-none disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase text-[#5F6F68]">Email Body (HTML)</label>
                  <textarea
                    value={form.email_body}
                    onChange={e => setForm({ ...form, email_body: e.target.value })}
                    disabled={!canEdit || saving}
                    rows={8}
                    className="w-full rounded-xl border border-[#DCE8E3] bg-[#F9FDFB] px-4 py-3 text-sm text-[#0F1F1A] focus:border-[#2FBF9B] focus:outline-none disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <div className={`${card} p-6`}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-[#0F1F1A]">
                <MessageSquare className="h-5 w-5 text-[#C9943A]" /> WhatsApp Settings
              </h2>
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase text-[#5F6F68]">WhatsApp Body</label>
                <textarea
                  value={form.whatsapp_body}
                  onChange={e => setForm({ ...form, whatsapp_body: e.target.value })}
                  disabled={!canEdit || saving}
                  rows={8}
                  className="w-full rounded-xl border border-[#DCE8E3] bg-[#F9FDFB] px-4 py-3 text-sm text-[#0F1F1A] focus:border-[#2FBF9B] focus:outline-none disabled:opacity-60"
                />
              </div>
            </div>

            <div className={`${card} p-6`}>
              <h2 className="mb-4 text-lg font-black text-[#0F1F1A]">Status</h2>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={form.status === 'active'}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    disabled={!canEdit || saving}
                    className="h-4 w-4 accent-[#167E68]"
                  />
                  <span className="text-sm font-bold text-[#0F1F1A]">Active</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={form.status === 'inactive'}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    disabled={!canEdit || saving}
                    className="h-4 w-4 accent-[#167E68]"
                  />
                  <span className="text-sm font-bold text-[#0F1F1A]">Inactive</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`${card} p-6`}>
              <h2 className="mb-4 text-lg font-black text-[#0F1F1A]">Available Placeholders</h2>
              <p className="mb-3 text-sm text-[#5F6F68]">Use these placeholders in email and WhatsApp bodies:</p>
              <div className="flex flex-wrap gap-2">
                {PLACEHOLDERS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => navigator.clipboard.writeText(p).then(() => toast.success(`Copied ${p}`))}
                    className="rounded-lg bg-[#F9FDFB] px-2.5 py-1.5 text-xs font-bold text-[#167E68] hover:bg-[#EAF8F3]"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {canEdit && (
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#167E68] px-5 py-3 text-sm font-bold text-white hover:bg-[#0F1F1A] disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
