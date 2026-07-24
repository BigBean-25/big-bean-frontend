'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search, Tag } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

interface Category {
  id: number
  name: string
  slug: string | null
  description: string | null
  icon: string | null
  image: string | null
  status: string
  sort_order: number
}

const getImageUrl = (img: string | null) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

export default function AdminMerchandiseCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    apiRequest('/merchandise-categories')
      .then(r => r.json())
      .then(d => setCategories(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return
    setDeleting(id)
    await apiRequest(`/merchandise-categories/${id}`, { method: 'DELETE' })
    setCategories(c => c.filter(x => x.id !== id))
    setDeleting(null)
  }

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Merch Categories</h1>
          <p className="text-gray-600">Manage merchandise categories</p>
        </div>
        <Link href="/admin/merchandise-categories/add" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Link>
      </div>

      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search categories..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 text-sm" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{searchTerm ? 'No categories match your search.' : 'No categories yet.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sort</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(c => {
                  const imgUrl = getImageUrl(c.image)
                  return (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {imgUrl ? (
                          <img src={imgUrl} alt={c.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                            <Tag className="w-5 h-5 text-amber-600" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.slug || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.sort_order}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/merchandise-categories/${c.id}/edit`} className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(c.id, c.name)} disabled={deleting === c.id}
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
