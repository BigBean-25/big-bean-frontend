'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Download, Eye, X, ChevronDown, MessageCircle } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  hired: 'bg-purple-100 text-purple-700'
}

interface Application {
  id: number; job_id: number | null; job_title: string | null
  full_name: string; email: string; phone: string
  experience: string | null; education: string | null; skills: string | null
  expected_salary: string | null; notice_period: string | null
  cover_letter: string | null; resume_file: string | null
  status: string; admin_notes: string | null; created_at: string
}

export default function AdminCareerApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selected, setSelected] = useState<Application | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => { fetchApplications() }, [search, filterStatus])

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      const res = await apiRequest(`/career-applications?${params}`, {})
      const data = await res.json()
      if (data.success) setApplications(data.data || [])
    } catch { } finally { setLoading(false) }
  }

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id)
    try {
      await apiRequest(`/career-applications/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
      fetchApplications()
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)
    } catch { } finally { setUpdatingId(null) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this application?')) return
    await apiRequest(`/career-applications/${id}`, { method: 'DELETE',})
    fetchApplications()
    if (selected?.id === id) setSelected(null)
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const getResumeUrl = (path: string | null) => path ? `${API_BASE_URL}/${path.replace(/^\/+/, '')}` : null

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-gray-900">Career Applications</h1><p className="text-gray-500 text-sm mt-1">{applications.length} application{applications.length !== 1 ? 's' : ''}</p></div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search name, email, phone, position..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'new', 'reviewed', 'shortlisted', 'rejected', 'hired'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${filterStatus === s ? 'text-white shadow-sm' : 'border border-gray-200 hover:border-[#C9943A] text-gray-600'}`}
              style={{ background: filterStatus === s ? 'linear-gradient(to right,#C9943A,#8B4A2F)' : 'white' }}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="font-semibold text-gray-500">No applications found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Candidate</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Position</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Salary / Notice</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Resume</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Date</th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map(a => {
                  const resumeUrl = getResumeUrl(a.resume_file)
                  return (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">{a.full_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{a.email}</p>
                        <p className="text-xs text-gray-400">{a.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-700 max-w-[160px]"><p className="truncate">{a.job_title || '—'}</p></td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-700">{a.expected_salary || '—'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{a.notice_period || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {resumeUrl ? (
                          <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#C9943A] hover:underline">
                            <Download className="w-3 h-3" />Resume
                          </a>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative group">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize cursor-pointer ${STATUS_STYLES[a.status] || 'bg-gray-100 text-gray-500'}`}>
                            {a.status}
                          </span>
                          <div className="absolute left-0 top-7 z-10 hidden group-hover:flex flex-col bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden min-w-[130px]">
                            {['new', 'reviewed', 'shortlisted', 'rejected', 'hired'].map(s => (
                              <button key={s} onClick={() => updateStatus(a.id, s)} disabled={updatingId === a.id}
                                className={`px-4 py-2 text-xs text-left capitalize hover:bg-gray-50 transition-colors font-semibold ${a.status === s ? 'text-[#C9943A]' : 'text-gray-700'}`}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">{formatDate(a.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1 items-center">
                          {a.phone && (
                            <a href={`https://wa.me/${a.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${a.full_name}, thank you for applying to Big Bean Café! Our HR team will review and get back to you. ☕`)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="p-2 hover:bg-green-50 rounded-lg text-green-500" title="WhatsApp">
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                          <button onClick={() => setSelected(a)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Quick view">
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link href={`/admin/career-applications/${a.id}`}
                            className="px-3 py-1.5 bg-[#3D1F0D] text-white text-xs font-semibold rounded-lg hover:bg-[#C9943A] transition-colors whitespace-nowrap">
                            View / Reply
                          </Link>
                          <button onClick={() => handleDelete(a.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500" title="Delete">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selected.full_name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selected.job_title || 'General Application'}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p><p className="text-gray-800">{selected.email}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p><p className="text-gray-800">{selected.phone}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expected Salary</p><p className="text-gray-800">{selected.expected_salary || '—'}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Notice Period</p><p className="text-gray-800">{selected.notice_period || '—'}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Applied</p><p className="text-gray-800">{formatDate(selected.created_at)}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
                </div>
              </div>
              {selected.experience && <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Experience</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.experience}</p></div>}
              {selected.education && <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Education</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.education}</p></div>}
              {selected.skills && <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Skills</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.skills}</p></div>}
              {selected.cover_letter && <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cover Letter</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.cover_letter}</p></div>}
              {selected.resume_file && (
                <a href={getResumeUrl(selected.resume_file)!} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
                  style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                  <Download className="w-4 h-4" />Download Resume
                </a>
              )}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {['new', 'reviewed', 'shortlisted', 'rejected', 'hired'].map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={updatingId === selected.id}
                      className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all ${selected.status === s ? 'text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:border-[#C9943A]'}`}
                      style={{ background: selected.status === s ? 'linear-gradient(to right,#C9943A,#8B4A2F)' : 'white' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
