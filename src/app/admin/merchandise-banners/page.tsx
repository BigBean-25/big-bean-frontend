'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search, Image as ImageIcon } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

interface Banner {
  id: number
  eyebrow: string | null
  title: string
  subtitle: string | null
  button_text: string | null
  button_url: string | null
  image: string | null
  status: string
  sort_order: number
}

const getImageUrl = (img: string | null) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

export default function AdminMerchandiseBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    apiRequest('/merchandise-banners')
      .then(r => r.json())
      .then(d => setBanners(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete banner "${title}"?`)) return
    setDeleting(id)
    await apiRequest(`/merchandise-banners/${id}`, { method: 'DELETE' })
    setBanners(b => b.filter(x => x.id !== id))
    setDeleting(null)
  }

  const filtered = banners.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.subtitle || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Merch Banners</h1>
          <p className="text-gray-600">Manage merchandise hero banners</p>
        </div>
        <Link href="/admin/merchandise-banners/add" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Banner
        </Link>
      </div>

      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search banners..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 text-sm" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{searchTerm ? 'No banners match your search.' : 'No banners yet.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Button</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sort</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(b => {
                  const imgUrl = getImageUrl(b.image)
                  return (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {imgUrl ? (
                          <img src={imgUrl} alt={b.title} className="w-16 h-10 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="w-16 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-amber-600" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        <div className="truncate max-w-[180px]">{b.title}</div>
                        {b.eyebrow && <div className="text-xs text-gray-500">{b.eyebrow}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{b.button_text || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${b.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{b.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{b.sort_order}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/merchandise-banners/${b.id}/edit`} className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(b.id, b.title)} disabled={deleting === b.id}
                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 disabled:opacity-40">
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
    </div>
  )
}
