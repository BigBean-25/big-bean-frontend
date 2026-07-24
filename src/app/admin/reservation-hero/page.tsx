'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

interface ReservationHero {
  id: number
  eyebrow: string
  title: string
  highlight_text: string | null
  image: string | null
  status: string
  sort_order: number
}

const getImg = (img?: string | null) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

export default function ReservationHeroList() {
  const [items, setItems] = useState<ReservationHero[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await apiRequest('/reservation-hero', {})
      const data = await res.json()
      setItems(data.data || [])
    } catch { }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this reservation hero banner?')) return
    await apiRequest(`/reservation-hero/${id}`, {
      method: 'DELETE',})
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservation Hero Banners</h1>
          <p className="text-gray-500 text-sm mt-1">Manage the Reservations page hero banner</p>
        </div>
        <Link href="/admin/reservation-hero/add"
          className="flex items-center gap-2 bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm">
          <Plus className="w-4 h-4" /> Add Banner
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No banners yet</p>
          <Link href="/admin/reservation-hero/add" className="mt-4 inline-block text-sm text-[#C9943A] font-semibold hover:underline">Add your first banner</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Image</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Eyebrow</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Title</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Highlight</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Order</th>
                <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const img = getImg(item.image)
                return (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      {img ? (
                        <img src={img} alt="" className="w-16 h-10 object-cover rounded-lg border border-gray-200" />
                      ) : (
                        <div className="w-16 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{item.eyebrow}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800">{item.title}</td>
                    <td className="px-5 py-3 text-gray-500">{item.highlight_text || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{item.sort_order}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/admin/reservation-hero/${item.id}/edit`}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4 text-blue-500" />
                        </Link>
                        <button onClick={() => handleDelete(item.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400" />
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
