'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Search, Star, FileText } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

const CATEGORIES: Record<string, string> = {
  'coffee-culture': 'Coffee Culture', 'brewing-tips': 'Brewing Tips',
  'company-news': 'Company News', 'lifestyle': 'Lifestyle',
  'events': 'Events', 'food': 'Food', 'offers': 'Offers'
}

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  inactive: 'bg-gray-100 text-gray-500'
}

interface BlogPost {
  id: number
  title: string
  slug: string
  author: string
  category: string
  featured_image: string | null
  status: string
  is_featured: number
  published_at: string | null
  read_time: string
  created_at: string
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCat, setFilterCat] = useState('all')

  useEffect(() => { fetchPosts() }, [search, filterStatus, filterCat])

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (filterCat !== 'all') params.set('category', filterCat)
      const res = await apiRequest(`/blog-posts?${params}`, {})
      const data = await res.json()
      if (data.success) setPosts(data.data || [])
    } catch { }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    try {
      await apiRequest(`/blog-posts/${id}`, {
        method: 'DELETE',})
      fetchPosts()
    } catch { }
  }

  const getImageUrl = (img: string | null) => {
    if (!img) return null
    if (img.startsWith('http')) return img
    return `${API_BASE_URL}/${img.replace(/^\/+/, '')}`
  }

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-500 text-sm mt-1">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/blog/add"
          className="flex items-center gap-2 bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm">
          <Plus className="w-4 h-4" /> Add Post
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40">
          <option value="all">All Categories</option>
          {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No posts found</p>
          <Link href="/admin/blog/add" className="mt-3 inline-block text-[#C9943A] font-semibold hover:underline text-sm">
            Add your first post →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Post</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Category</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Author</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Published</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map(p => {
                const imgUrl = getImageUrl(p.featured_image)
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {imgUrl ? (
                          <img src={imgUrl} alt={p.title} className="w-12 h-9 object-cover rounded-lg flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-[#3D1F0D] to-[#C9943A] flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-white/60" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {p.is_featured ? <Star className="w-3 h-3 text-yellow-500 fill-yellow-400 flex-shrink-0" /> : null}
                            <p className="font-semibold text-gray-800 truncate max-w-[200px]">{p.title}</p>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">/blog/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#8B4A2F]">
                        {CATEGORIES[p.category] || p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.author}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-500'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(p.published_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <Link href={`/blog/${p.slug}`} target="_blank"
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 text-xs">View</Link>
                        <Link href={`/admin/blog/${p.id}/edit`}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-500">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(p.id, p.title)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500">
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
