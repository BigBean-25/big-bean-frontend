'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const lc = 'block text-sm font-semibold text-gray-700 mb-1.5'
const ic = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 bg-white'

interface Outlet { id: number; name: string; city: string }

export default function EditCareerJob() {
  const router = useRouter(); const { id } = useParams()
  const [saving, setSaving] = useState(false); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [form, setForm] = useState({
    title: '', department: '', location: 'Bangalore', outlet_id: '', outlet_name: '',
    experience: '', job_type: 'Full-time', salary_range: '',
    short_description: '', responsibilities: '', requirements: '', benefits: '',
    status: 'active', is_featured: false, sort_order: '0'
  })

  useEffect(() => {
    apiRequest('/outlets').then(r => r.json()).then(d => { if (d.success) setOutlets(d.data || []) }).catch(() => {})
    apiRequest(`/career-jobs/${id}`)
      .then(r => r.json()).then(data => {
        if (data.success && data.data) {
          const d = data.data
          setForm({
            title: d.title || '', department: d.department || '', location: d.location || 'Bangalore',
            outlet_id: d.outlet_id ? String(d.outlet_id) : '', outlet_name: d.outlet_name || '',
            experience: d.experience || '', job_type: d.job_type || 'Full-time', salary_range: d.salary_range || '',
            short_description: d.short_description || '', responsibilities: d.responsibilities || '',
            requirements: d.requirements || '', benefits: d.benefits || '',
            status: d.status || 'active', is_featured: !!d.is_featured, sort_order: String(d.sort_order ?? 0)
          })
        }
      }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleOutletChange = (outletId: string) => {
    const outlet = outlets.find(o => String(o.id) === outletId)
    set('outlet_id', outletId); set('outlet_name', outlet ? outlet.name : '')
    if (outlet) set('location', outlet.city || outlet.name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) { setError('Title is required'); return }
    setSaving(true); setError('')
    try {
      const body: any = { ...form, is_featured: form.is_featured ? '1' : '0' }
      const res = await apiRequest(`/career-jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.success) router.push('/admin/career-jobs')
      else setError(data.message || 'Failed to update job')
    } catch { setError('Network error') } finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>

  const taHint = 'text-xs text-gray-400 mt-1'

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/career-jobs" className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5 text-gray-600" /></Link>
        <div><h1 className="text-3xl font-bold text-gray-900">Edit Job Opening</h1><p className="text-gray-500 text-sm mt-1">Update job details and content</p></div>
      </div>
      <form onSubmit={handleSubmit}>
        {error && <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-800 text-base">Job Details</h2>
              <div><label className={lc}>Job Title <span className="text-red-500">*</span></label><input className={ic} value={form.title} onChange={e => set('title', e.target.value)} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lc}>Department</label><input className={ic} value={form.department} onChange={e => set('department', e.target.value)} /></div>
                <div><label className={lc}>Experience</label><input className={ic} value={form.experience} onChange={e => set('experience', e.target.value)} /></div>
                <div><label className={lc}>Job Type</label>
                  <select className={ic} value={form.job_type} onChange={e => set('job_type', e.target.value)}>
                    <option value="Full-time">Full-time</option><option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option><option value="Contract">Contract</option>
                  </select>
                </div>
                <div><label className={lc}>Salary Range</label><input className={ic} value={form.salary_range} onChange={e => set('salary_range', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lc}>Outlet</label>
                  <select className={ic} value={form.outlet_id} onChange={e => handleOutletChange(e.target.value)}>
                    <option value="">All / Any Outlet</option>
                    {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
                <div><label className={lc}>Location</label><input className={ic} value={form.location} onChange={e => set('location', e.target.value)} /></div>
              </div>
              <div><label className={lc}>Short Description</label><textarea className={ic} rows={3} value={form.short_description} onChange={e => set('short_description', e.target.value)} /></div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-800 text-base">Job Content</h2>
              <div><label className={lc}>Responsibilities</label><textarea className={`${ic} font-mono text-xs`} rows={6} value={form.responsibilities} onChange={e => set('responsibilities', e.target.value)} /><p className={taHint}>Each line = one bullet point</p></div>
              <div><label className={lc}>Requirements</label><textarea className={`${ic} font-mono text-xs`} rows={6} value={form.requirements} onChange={e => set('requirements', e.target.value)} /><p className={taHint}>Each line = one bullet point</p></div>
              <div><label className={lc}>Benefits</label><textarea className={`${ic} font-mono text-xs`} rows={4} value={form.benefits} onChange={e => set('benefits', e.target.value)} /><p className={taHint}>Each line = one bullet point</p></div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-gray-800 text-base">Settings</h2>
              <div><label className={lc}>Status</label>
                <select className={ic} value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Active</option><option value="inactive">Inactive</option><option value="closed">Closed</option>
                </select>
              </div>
              <div><label className={lc}>Sort Order</label><input type="number" className={ic} value={form.sort_order} onChange={e => set('sort_order', e.target.value)} /></div>
              <div className="flex items-center gap-3 pt-1">
                <input type="checkbox" id="is_featured" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#C9943A] focus:ring-[#C9943A]" />
                <label htmlFor="is_featured" className="text-sm font-semibold text-gray-700 cursor-pointer">Mark as Featured</label>
              </div>
            </div>
            <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
