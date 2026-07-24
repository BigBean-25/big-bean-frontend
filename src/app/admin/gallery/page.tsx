'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search, Image as ImageIcon, Video, Instagram, Star } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

interface GalleryItem {
  id: number
  title: string
  category: string
  media_type: 'image' | 'video' | 'instagram'
  image: string | null
  video: string | null
  instagram_url: string | null
  status: string
  is_featured: number
  sort_order: number
}

const CATEGORIES = ['all', 'outlets', 'events', 'coffee', 'food', 'customers', 'team', 'reels', 'general']
const TYPES = ['all', 'image', 'video', 'instagram']

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    try {
      const res = await apiRequest('/gallery-items', {})
      const data = await res.json()
      if (data.success) setItems(data.data || [])
    } catch { }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this gallery item?')) return
    try {
      await apiRequest(`/gallery-items/${id}`, {
        method: 'DELETE',})
      fetchItems()
    } catch { }
  }

  const getImageUrl = (img: string | null) => {
    if (!img) return null
    if (img.startsWith('http')) return img
    return `${API_BASE}/${img.replace(/^\/+/, '')}`
  }

  const filtered = items.filter(i => {
    const s = search.toLowerCase()
    const matchSearch = !s || i.title.toLowerCase().includes(s) || i.category.includes(s)
    const matchCat = catFilter === 'all' || i.category === catFilter
    const matchType = typeFilter === 'all' || i.media_type === typeFilter
    return matchSearch && matchCat && matchType
  })

  const mediaTypeIcon = (t: string) => {
    if (t === 'video') return <Video className="w-4 h-4 text-purple-500" />
    if (t === 'instagram') return <Instagram className="w-4 h-4 text-pink-500" />
    return <ImageIcon className="w-4 h-4 text-blue-500" />
  }

  const mediaTypeBadge = (t: string) => {
    if (t === 'video') return 'bg-purple-100 text-purple-700'
    if (t === 'instagram') return 'bg-pink-100 text-pink-700'
    return 'bg-blue-100 text-blue-700'
  }

  const ic = 'border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 bg-white'

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery Items</h1>
          <p className="text-gray-500 text-sm mt-1">Manage photos, videos and Instagram reels</p>
        </div>
        <Link href="/admin/gallery/add"
          className="flex items-center gap-2 bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm">
          <Plus className="w-4 h-4" /> Add Item
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search gallery items..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={ic}>
            {TYPES.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className={ic}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No gallery items found.</p>
          <Link href="/admin/gallery/add" className="mt-4 inline-block text-[#C9943A] font-semibold hover:underline text-sm">Add First Item →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Preview</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Title</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Type</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Category</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Featured</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {item.media_type === 'instagram' ? (
                      <div className="w-12 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
                        <Instagram className="w-5 h-5 text-white" />
                      </div>
                    ) : getImageUrl(item.image) ? (
                      <img src={getImageUrl(item.image)!} alt={item.title} className="w-12 h-10 object-cover rounded-lg" />
                    ) : (
                      <div className="w-12 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.media_type === 'video' ? <Video className="w-4 h-4 text-gray-400" /> : <ImageIcon className="w-4 h-4 text-gray-400" />}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{item.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${mediaTypeBadge(item.media_type)}`}>
                      {mediaTypeIcon(item.media_type)} {item.media_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{item.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.is_featured ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/gallery/${item.id}/edit`} className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
