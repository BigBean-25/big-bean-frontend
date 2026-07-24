'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Pencil, Globe } from 'lucide-react'
import apiRequest from '@/utils/api'
import { getImageUrl } from '@/lib/imageUrl'

interface PageHero {
  page_key: string
  page_name: string
  title: string
  status: string
  hero_image: string | null
}

export default function PageHeroesList() {
  const [items, setItems] = useState<PageHero[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiRequest('/admin/page-heroes', {})
        const data = await res.json()
        const filtered = (data.data || []).filter((item: PageHero) => item.page_key !== 'contact')
        setItems(filtered)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Page Heroes</h1>
        <p className="mt-1 text-sm text-gray-500">Manage hero sections for public pages</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-gray-100">
          <Globe className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No page heroes found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Image</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Page Name</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Page Key</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Title</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Status</th>
                <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const img = item.hero_image ? getImageUrl(item.hero_image) : null
                return (
                  <tr key={item.page_key} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      {img ? (
                        <img src={img} alt="" className="w-16 h-10 object-cover rounded-lg border border-gray-200" />
                      ) : (
                        <div className="w-16 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Globe className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-800">{item.page_name}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{item.page_key}</td>
                    <td className="px-5 py-3 text-gray-600">{item.title}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/admin/page-heroes/${item.page_key}`} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4 text-blue-500" />
                        </Link>
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
