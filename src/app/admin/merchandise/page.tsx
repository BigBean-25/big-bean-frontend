'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search, ShoppingBag, Package } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

interface Product {
  id: number
  name: string
  category: string | null
  category_name: string | null
  category_slug: string | null
  price: number
  mrp: number | null
  stock: number
  image: string | null
  status: string
  sort_order: number
  badge_text: string | null
}

const getImageUrl = (img: string | null) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

export default function AdminMerchandise() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    apiRequest('/merchandise')
      .then(r => r.json())
      .then(d => setProducts(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    setDeleting(id)
    await apiRequest(`/merchandise/${id}`, { method: 'DELETE' })
    setProducts(p => p.filter(x => x.id !== id))
    setDeleting(null)
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Merchandise</h1>
          <p className="text-gray-600">Manage products and inventory</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/merchandise-orders" className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Package className="w-4 h-4" /> Orders
          </Link>
          <Link href="/admin/merchandise/add" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search products..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 text-sm" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{searchTerm ? 'No products match your search.' : 'No products yet.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(p => {
                  const imgUrl = getImageUrl(p.image)
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {imgUrl ? (
                          <img src={imgUrl} alt={p.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-amber-600" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[200px]">
                        <div className="truncate">{p.name}</div>
                        {p.badge_text && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded mt-0.5 inline-block">{p.badge_text}</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.category_name || p.category || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>₹{Number(p.price).toFixed(2)}</div>
                        {p.mrp && <div className="text-xs text-gray-400 line-through">₹{Number(p.mrp).toFixed(2)}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-medium ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-amber-600' : 'text-gray-900'}`}>{p.stock}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/merchandise/${p.id}/edit`} className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(p.id, p.name)} disabled={deleting === p.id}
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
