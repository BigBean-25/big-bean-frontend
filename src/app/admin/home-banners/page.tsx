'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight, Search, Filter } from 'lucide-react'
import apiRequest from '@/utils/api'

export default function HomeBanners() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await apiRequest('/home-banners', {})
      
      if (response.ok) {
        const data = await response.json()
        setBanners(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      const response = await apiRequest(`/home-banners/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
          },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        setBanners(banners.map(banner => 
          banner.id === id ? { ...banner, status: newStatus } : banner
        ))
      }
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  const deleteBanner = async (id: number) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    
    try {
      const response = await apiRequest(`/home-banners/${id}`, {
        method: 'DELETE'})
      
      if (response.ok) {
        setBanners(banners.filter(banner => banner.id !== id))
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
    }
  }

  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || banner.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coffee-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading banners...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-coffee-950">Home Banners</h1>
          <p className="text-coffee-700">Manage hero banners for the homepage</p>
        </div>
        <Link
          href="/admin/home-banners/add"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Banner</span>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="w-full p-4 bg-white rounded-xl shadow-md border border-coffee-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Banners Table */}
      <div className="w-full overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Banner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Media Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sort Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBanners.map((banner: any) => (
                <tr key={banner.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="w-20 h-12 bg-gradient-to-br from-coffee-200 to-coffee-300 rounded flex items-center justify-center">
                      <span className="text-xs text-coffee-600 font-medium">
                        {banner.media_type === 'video' ? 'Video' : 'Image'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{banner.title}</p>
                      {banner.subtitle && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{banner.subtitle}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      banner.media_type === 'video' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {banner.media_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(banner.id, banner.status)}
                      className="flex items-center space-x-1"
                    >
                      {banner.status === 'active' ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-400">Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">{banner.sort_order}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/home-banners/${banner.id}/edit`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteBanner(banner.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredBanners.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Eye className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No banners found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first banner'
              }
            </p>
            {(!searchTerm && filterStatus === 'all') && (
              <Link
                href="/admin/home-banners/add"
                className="btn-primary"
              >
                Add Your First Banner
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{banners.length}</p>
          <p className="text-sm text-gray-600">Total Banners</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {banners.filter((b: any) => b.status === 'active').length}
          </p>
          <p className="text-sm text-gray-600">Active Banners</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-400">
            {banners.filter((b: any) => b.status === 'inactive').length}
          </p>
          <p className="text-sm text-gray-600">Inactive Banners</p>
        </div>
      </div>
    </div>
  )
}
