'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, User, Instagram, Linkedin, Phone, Mail } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace(/\/api$/, '')

const getImageUrl = (img?: string | null) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

export default function AboutFounderList() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'success' | 'error'>('success')

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    try {
      const res = await apiRequest('/about-founders', {})
      const data = await res.json()
      setItems(data.data || [])
    } catch { setMsg('Failed to load founders'); setMsgType('error') }
    finally { setLoading(false) }
  }

  const deleteItem = async (id: number, name: string) => {
    if (!confirm(`Delete founder "${name}"? This cannot be undone.`)) return
    try {
      const res = await apiRequest(`/about-founders/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id))
        setMsg('Founder deleted successfully'); setMsgType('success')
        setTimeout(() => setMsg(''), 3000)
      } else {
        setMsg('Delete failed'); setMsgType('error')
      }
    } catch { setMsg('Delete failed'); setMsgType('error') }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Founder Management</h1>
          <p className="text-gray-600 mt-1">Manage founder profiles displayed on the About page</p>
        </div>
        <Link
          href="/admin/about-founders/add"
          className="flex items-center gap-2 bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Founder
        </Link>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium border ${
          msgType === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>{msg}</div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No founders yet.</p>
          <Link href="/admin/about-founders/add" className="mt-4 inline-block text-[#C9943A] font-semibold hover:underline">
            Add your first founder
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Photo</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Role</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Contact</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Social</th>
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
                        <img src={imgUrl} alt={item.name} className="w-12 h-12 object-cover rounded-full border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3D1F0D] to-[#C9943A] flex items-center justify-center">
                          <User className="w-5 h-5 text-white/70" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-[#C9943A] font-medium max-w-[180px] truncate">{item.role}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-gray-500">
                        {item.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {item.phone}
                          </span>
                        )}
                        {item.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {item.email}
                          </span>
                        )}
                        {!item.phone && !item.email && <span className="text-gray-300">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.instagram_url && (
                          <a href={item.instagram_url} target="_blank" rel="noopener noreferrer"
                            className="text-pink-500 hover:text-pink-700 transition-colors" title="Instagram">
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                        {item.linkedin_url && (
                          <a href={item.linkedin_url} target="_blank" rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors" title="LinkedIn">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {!item.instagram_url && !item.linkedin_url && <span className="text-gray-300 text-xs">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.sort_order}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/about-founders/${item.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteItem(item.id, item.name)}
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
