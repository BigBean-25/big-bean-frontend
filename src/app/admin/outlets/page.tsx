'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search, MapPin } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

function getImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null
  if (imagePath.startsWith('http')) return imagePath
  return `${API_BASE}/${imagePath.replace(/^\/+/, '')}`
}

interface Outlet {
  id: number
  name: string
  address: string
  phone?: string
  status: string
  image?: string | null
}

export default function AdminOutlets() {
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOutlets()
  }, [])

  const fetchOutlets = async () => {
    try {
      const res = await apiRequest('/outlets', {})
      const data = await res.json()
      if (data.success) setOutlets(data.data)
    } catch (err) {
      console.error('Failed to fetch outlets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this outlet?')) return
    try {
      const res = await apiRequest(`/outlets/${id}`, {
        method: 'DELETE',})
      if (res.ok) setOutlets(prev => prev.filter(o => o.id !== id))
      else alert('Failed to delete outlet')
    } catch {
      alert('Network error')
    }
  }

  const filteredOutlets = outlets.filter(outlet =>
    outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (outlet.address || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Outlet Management</h1>
          <p className="text-gray-600">Manage café outlets and locations</p>
        </div>
        <Link href="/admin/outlets/add" className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Outlet</span>
        </Link>
      </div>

      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search outlets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading outlets...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOutlets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No outlets found</td>
                  </tr>
                ) : filteredOutlets.map(outlet => {
                  const imgUrl = getImageUrl(outlet.image)
                  return (
                    <tr key={outlet.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {imgUrl ? (
                          <img src={imgUrl} alt={outlet.name} className="w-12 h-12 object-cover rounded-lg" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4A2518,#C9943A)' }}>
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{outlet.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{outlet.address}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{outlet.phone || '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          outlet.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {outlet.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <Link href={`/admin/outlets/${outlet.id}/edit`} className="text-blue-600 hover:text-blue-700">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(outlet.id)} className="text-red-600 hover:text-red-700">
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
