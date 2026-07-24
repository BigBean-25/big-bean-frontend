'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RefreshCw, Edit, AlertCircle, Mail } from 'lucide-react'
import apiRequest from '@/lib/api'
import { isSuperAdmin, hasPermission } from '@/lib/adminPermissions'
import toast from 'react-hot-toast'

interface Template {
  id: number
  template_key: string
  template_name: string
  subject: string | null
  status: 'active' | 'inactive'
  updated_at: string
}

const card = 'rounded-[28px] border border-[#DCE8E3] bg-white shadow-[0_18px_45px_rgba(31,42,36,0.06)]'

export default function EventMessageTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    setCanEdit(isSuperAdmin() || hasPermission('event_bookings', 'edit'))
  }, [])

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await apiRequest('/admin/event-message-templates')
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed')
      setTemplates(data.data || [])
    } catch (err: any) {
      console.error('Load templates error', err)
      setError(true)
      toast.error(err.message || 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0F1F1A] sm:text-3xl">Event Message Templates</h1>
          <p className="text-sm text-[#5F6F68]">Manage email and WhatsApp message templates for event bookings.</p>
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

      <div className={`${card} overflow-hidden`}>
        {loading ? (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FDFB]">
                  <tr>
                    {['Template Name', 'Template Key', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-black uppercase text-[#5F6F68]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F8F6]">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 4 }).map((__, j) => (
                        <td key={j} className="px-5 py-3"><div className="h-4 w-24 animate-pulse rounded bg-[#DCE8E3]" /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto mb-3 h-12 w-12 text-[#E85D4C]" />
            <p className="text-lg font-black text-[#0F1F1A]">Unable to load templates</p>
            <button onClick={load} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#167E68] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0F1F1A]">
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="mx-auto mb-3 h-12 w-12 text-[#DCE8E3]" />
            <p className="text-lg font-black text-[#0F1F1A]">No templates found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FDFB]">
                <tr>
                  {['Template Name', 'Template Key', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-black uppercase text-[#5F6F68]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F8F6]">
                {templates.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F9FDFB]">
                    <td className="px-5 py-3 text-sm font-bold text-[#0F1F1A]">{t.template_name}</td>
                    <td className="px-5 py-3 text-sm text-[#5F6F68]">{t.template_key}</td>
                    <td className="px-5 py-3 text-sm">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${t.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {canEdit ? (
                        <Link
                          href={`/admin/event-message-templates/${t.template_key}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#167E68] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0F1F1A]"
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </Link>
                      ) : (
                        <span className="text-xs text-[#9CB3AC]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
