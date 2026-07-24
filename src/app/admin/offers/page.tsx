'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search, Tag } from 'lucide-react'
import apiRequest from '@/utils/api'

interface Offer {
  id: number
  title: string
  discount_text: string | null
  offer_code: string | null
  start_date: string | null
  end_date: string | null
  image: string | null
  status: string
  sort_order: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

const getImageUrl = (image?: string | null): string | null => {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${API_BASE}/${image.replace(/^\/+/, '')}`
}

const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

export default function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  const fetchOffers = () => {
    apiRequest('/offers')
      .then(r => r.json())
      .then(d => setOffers(d.data || []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOffers() }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this offer?')) return
    setDeleting(id)
    await apiRequest(`/offers/${id}`, { method: 'DELETE' })
    setDeleting(null)
    fetchOffers()
  }

  const filtered = offers.filter(o => o.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-coffee-950">Offer Management</h1>
          <p className="text-coffee-700">Manage special offers and discounts</p>
        </div>
        <Link href="/admin/offers/add" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /><span>Add Offer</span>
        </Link>
      </div>

      <div className="w-full p-4 bg-white rounded-xl shadow-md border border-coffee-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search offers..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading offers...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No offers found. <Link href="/admin/offers/add" className="text-coffee-600 underline">Add one</Link>.</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(offer => {
                  const imgUrl = getImageUrl(offer.image)
                  return (
                    <tr key={offer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {imgUrl ? (
                          <img src={imgUrl} alt={offer.title} className="w-14 h-10 object-cover rounded-lg" />
                        ) : (
                          <div className="w-14 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-amber-600" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{offer.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{offer.discount_text || '—'}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-700">{offer.offer_code || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{fmt(offer.end_date)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${offer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {offer.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/offers/${offer.id}/edit`} className="text-blue-600 hover:text-blue-700">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(offer.id)} disabled={deleting === offer.id}
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
