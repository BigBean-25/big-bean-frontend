'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, ImageIcon } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

const getImageUrl = (img?: string | null) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

export default function AboutHeroList() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    try {
      const res = await apiRequest('/about-hero', {})
      const data = await res.json()
      setItems(data.data || [])
    } catch { setMsg('Failed to load') }
    finally { setLoading(false) }
  }

  const deleteItem = async (id: number) => {
    if (!confirm('Delete this hero banner?')) return
    try {
      const res = await apiRequest(`/about-hero/${id}`, {
        method: 'DELETE',})
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id))
        setMsg('Deleted successfully')
        setTimeout(() => setMsg(''), 3000)
      }
    } catch { setMsg('Delete failed') }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">About Page Hero Banner</h1>
          <p className="text-gray-600 mt-1">Manage the hero banner displayed on the About page</p>
        </div>
        <Link
          href="/admin/about-hero/add"
          className="flex items-center gap-2 bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Hero Banner
        </Link>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">{msg}</div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No hero banners yet.</p>
          <Link href="/admin/about-hero/add" className="mt-4 inline-block text-[#C9943A] font-semibold hover:underline">Add your first one</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Image</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Eyebrow</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Title</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Highlight</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Sort</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => {
                const imgUrl = getImageUrl(item.image)
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.title} className="w-20 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-[#3D1F0D] to-[#C9943A] flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-white/60" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 uppercase text-xs tracking-wider font-semibold">{item.eyebrow}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900 max-w-[180px] truncate">{item.title}</td>
                    <td className="px-6 py-4 text-[#C9943A] max-w-[150px] truncate">{item.highlight_text}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.sort_order}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/about-hero/${item.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
