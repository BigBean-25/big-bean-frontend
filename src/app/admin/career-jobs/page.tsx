'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Search, Star, Briefcase } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  closed: 'bg-red-100 text-red-600'
}

interface CareerJob {
  id: number; title: string; department: string | null; location: string
  outlet_name: string | null; experience: string | null; job_type: string
  salary_range: string | null; status: string; is_featured: number; sort_order: number
}

export default function AdminCareerJobs() {
  const [jobs, setJobs] = useState<CareerJob[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => { fetchJobs() }, [search, filterStatus])

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      const res = await apiRequest(`/career-jobs?${params}`, {})
      const data = await res.json()
      if (data.success) setJobs(data.data || [])
    } catch { } finally { setLoading(false) }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    await apiRequest(`/career-jobs/${id}`, { method: 'DELETE',})
    fetchJobs()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-gray-900">Career Job Openings</h1><p className="text-gray-500 text-sm mt-1">{jobs.length} job{jobs.length !== 1 ? 's' : ''}</p></div>
        <Link href="/admin/career-jobs/add" className="flex items-center gap-2 bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 text-sm">
          <Plus className="w-4 h-4" /> Add Job
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : jobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No jobs found</p>
          <Link href="/admin/career-jobs/add" className="mt-3 inline-block text-[#C9943A] font-semibold hover:underline text-sm">Add your first job →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Title</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Department</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Location</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Type</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Salary</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.map(j => (
                <tr key={j.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {j.is_featured ? <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400 flex-shrink-0" /> : null}
                      <div>
                        <p className="font-semibold text-gray-800">{j.title}</p>
                        {j.experience && <p className="text-xs text-gray-400 mt-0.5">{j.experience}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{j.department || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{j.outlet_name || j.location}</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#8B4A2F]">{j.job_type}</span></td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{j.salary_range || '—'}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[j.status] || 'bg-gray-100 text-gray-500'}`}>{j.status}</span></td>
                  <td className="px-6 py-4"><div className="flex justify-end gap-1">
                    <Link href={`/admin/career-jobs/${j.id}/edit`} className="p-2 hover:bg-blue-50 rounded-lg text-blue-500"><Edit2 className="w-4 h-4" /></Link>
                    <button onClick={() => handleDelete(j.id, j.title)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
