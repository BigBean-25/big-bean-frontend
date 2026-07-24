'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

interface FranchiseHero {
  id: number; eyebrow: string; title: string; highlight_text: string | null
  subtitle: string | null; image: string | null; status: string; sort_order: number
  stat_1_value: string; stat_1_label: string
  stat_2_value: string; stat_2_label: string
  stat_3_value: string; stat_3_label: string
}

export default function AdminFranchiseHero() {
  const [banners, setBanners] = useState<FranchiseHero[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchBanners() }, [])

  const fetchBanners = async () => {
    try {
      const res = await apiRequest('/franchise-hero', {})
      const data = await res.json()
      if (data.success) setBanners(data.data || [])
    } catch { } finally { setLoading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this banner?')) return
    await apiRequest(`/franchise-hero/${id}`, { method: 'DELETE',})
    fetchBanners()
  }

  const toggleStatus = async (b: FranchiseHero) => {
    const newStatus = b.status === 'active' ? 'inactive' : 'active'
    const fd = new FormData(); fd.append('title', b.title); fd.append('status', newStatus)
    await apiRequest(`/franchise-hero/${b.id}`, { method: 'PUT', body: fd })
    fetchBanners()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-gray-900">Franchise Hero</h1><p className="text-gray-500 text-sm mt-1">{banners.length} banner{banners.length !== 1 ? 's' : ''}</p></div>
        <Link href="/admin/franchise-hero/add" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm" style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
          <Plus className="w-4 h-4" />Add Banner
        </Link>
      </div>

      {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : banners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="font-semibold text-gray-500">No banners yet</p>
          <Link href="/admin/franchise-hero/add" className="mt-4 inline-block text-sm text-[#C9943A] font-semibold hover:underline">Add your first banner</Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {banners.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row">
              {b.image ? (
                <div className="w-full sm:w-48 h-36 flex-shrink-0 overflow-hidden">
                  <img src={`${API_BASE}/${b.image}`} alt={b.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full sm:w-48 h-36 flex-shrink-0 bg-gradient-to-br from-[#3D1F0D] to-[#6B3520] flex items-center justify-center">
                  <span className="text-white/40 text-sm">No image</span>
                </div>
              )}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-[#C9943A] uppercase tracking-widest mb-1">{b.eyebrow}</p>
                  <h3 className="text-lg font-bold text-gray-900">{b.title} {b.highlight_text && <span className="text-[#C9943A]">{b.highlight_text}</span>}</h3>
                  {b.subtitle && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{b.subtitle}</p>}
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>{b.stat_1_value} {b.stat_1_label}</span>
                    <span>{b.stat_2_value} {b.stat_2_label}</span>
                    <span>{b.stat_3_value} {b.stat_3_label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${b.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{b.status}</span>
                  <button onClick={() => toggleStatus(b)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400" title="Toggle status">{b.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  <Link href={`/admin/franchise-hero/${b.id}/edit`} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500"><Edit className="w-4 h-4" /></Link>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
