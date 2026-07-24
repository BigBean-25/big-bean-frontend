'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Smartphone } from 'lucide-react'
import apiRequest from '@/utils/api'

interface AppPromo {
  id: number
  title: string
  eyebrow: string | null
  status: string
  sort_order: number
  mockup_image: string | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

const getImageUrl = (image?: string | null): string | null => {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${API_BASE}/${image.replace(/^\/+/, '')}`
}

export default function AdminAppPromos() {
  const [promos, setPromos] = useState<AppPromo[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  const fetchPromos = () => {
    apiRequest('/app-promos')
      .then(r => r.json())
      .then(d => setPromos(d.data || []))
      .catch(() => setPromos([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPromos() }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this app promo?')) return
    setDeleting(id)
    await apiRequest(`/app-promos/${id}`, { method: 'DELETE' })
    setDeleting(null)
    fetchPromos()
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-coffee-950">App Promo</h1>
          <p className="text-coffee-700">Manage app promo banners shown on homepage and /app page</p>
        </div>
        <Link href="/admin/app-promos/add" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /><span>Add Promo</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : promos.length === 0 ? (
        <div className="text-center py-12">
          <Smartphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No app promos found. <Link href="/admin/app-promos/add" className="text-coffee-600 underline">Add one</Link>.</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eyebrow</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {promos.map(promo => {
                  const imgUrl = getImageUrl(promo.mockup_image)
                  return (
                    <tr key={promo.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {imgUrl ? (
                          <img src={imgUrl} alt={promo.title} className="w-16 h-10 object-cover rounded-lg" />
                        ) : (
                          <div className="w-16 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-amber-600" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{promo.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{promo.eyebrow || '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${promo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {promo.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{promo.sort_order}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/app-promos/${promo.id}/edit`} className="text-blue-600 hover:text-blue-700">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(promo.id)} disabled={deleting === promo.id}
                            className="text-red-600 hover:text-red-700 disabled:opacity-40">
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
        </div>
      )}
    </div>
  )
}
