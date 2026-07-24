'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

interface CareerHeroBanner {
  id: number; eyebrow: string; title: string; highlight_text: string | null
  image: string | null; status: string; sort_order: number
}

export default function AdminCareerHero() {
  const [banners, setBanners] = useState<CareerHeroBanner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchBanners() }, [])

  const fetchBanners = async () => {
    try {
      const res = await apiRequest('/career-hero', {})
      const data = await res.json()
      if (data.success) setBanners(data.data || [])
    } catch { } finally { setLoading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this banner?')) return
    await apiRequest(`/career-hero/${id}`, { method: 'DELETE',})
    fetchBanners()
  }

  const getImg = (img: string | null) => {
    if (!img) return null
    return img.startsWith('http') ? img : `${API_BASE_URL}/${img.replace(/^\/+/, '')}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-gray-900">Career Hero Banners</h1><p className="text-gray-500 text-sm mt-1">Manage the hero section for the careers page</p></div>
        <Link href="/admin/career-hero/add" className="flex items-center gap-2 bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 text-sm">
          <Plus className="w-4 h-4" /> Add Banner
        </Link>
      </div>
      {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : banners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No banners yet</p>
          <Link href="/admin/career-hero/add" className="mt-3 inline-block text-[#C9943A] font-semibold hover:underline text-sm">Add your first banner →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Image</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Title</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Eyebrow</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Order</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {banners.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{getImg(b.image) ? <img src={getImg(b.image)!} alt={b.title} className="w-16 h-10 object-cover rounded-lg" /> : <div className="w-16 h-10 rounded-lg bg-gradient-to-br from-[#3D1F0D] to-[#8B4A2F] flex items-center justify-center"><ImageIcon className="w-4 h-4 text-white/60" /></div>}</td>
                  <td className="px-6 py-4"><p className="font-semibold text-gray-800 truncate max-w-[220px]">{b.title}</p>{b.highlight_text && <p className="text-xs text-[#C9943A] mt-0.5">{b.highlight_text}</p>}</td>
                  <td className="px-6 py-4 text-gray-500">{b.eyebrow}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${b.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{b.status}</span></td>
                  <td className="px-6 py-4 text-gray-500">{b.sort_order}</td>
                  <td className="px-6 py-4"><div className="flex justify-end gap-1">
                    <Link href={`/admin/career-hero/${b.id}/edit`} className="p-2 hover:bg-blue-50 rounded-lg text-blue-500"><Edit2 className="w-4 h-4" /></Link>
                    <button onClick={() => handleDelete(b.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
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
