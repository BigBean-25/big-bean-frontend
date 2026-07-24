'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface LegalPage {
  id: number; page_type: string; title: string; highlight_text: string | null
  effective_date: string | null; status: string; updated_at: string
}

const PAGE_TYPE_LABELS: Record<string, string> = {
  privacy_policy: 'Privacy Policy',
  terms_conditions: 'Terms & Conditions'
}

export default function AdminLegalPages() {
  const [pages, setPages] = useState<LegalPage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPages() }, [])

  const fetchPages = async () => {
    try {
      const res = await apiRequest('/legal-pages', {})
      const data = await res.json()
      if (data.success) setPages(data.data || [])
    } catch { } finally { setLoading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this legal page?')) return
    await apiRequest(`/legal-pages/${id}`, {
      method: 'DELETE',})
    fetchPages()
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Legal Pages</h1>
          <p className="text-gray-500 text-sm mt-1">Manage Privacy Policy and Terms & Conditions content</p>
        </div>
        <Link href="/admin/legal-pages/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all"
          style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
          <Plus className="w-4 h-4" /> Add Legal Page
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : pages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="font-semibold text-gray-500">No legal pages found</p>
          <Link href="/admin/legal-pages/add" className="mt-4 inline-block text-sm font-bold" style={{ color: '#C9943A' }}>Add first page</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">Page Type</th>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">Title</th>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">Effective Date</th>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">Updated</th>
                <th className="text-right px-5 py-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pages.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#FBF4EC', color: '#8B4A2F' }}>
                      {PAGE_TYPE_LABELS[p.page_type] || p.page_type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800">{p.title}</p>
                    {p.highlight_text && <p className="text-xs text-gray-400 mt-0.5">{p.highlight_text}</p>}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">{fmtDate(p.effective_date)}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">{fmt(p.updated_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/legal-pages/${p.id}/edit`} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Pencil className="w-4 h-4" /></Link>
                      <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
