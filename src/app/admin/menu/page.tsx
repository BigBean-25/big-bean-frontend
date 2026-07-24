'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react'

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: 'Signature Espresso', category: 'Coffee', price: 180, status: 'active' },
    { id: 2, name: 'Cappuccino Deluxe', category: 'Coffee', price: 220, status: 'active' },
    { id: 3, name: 'Chocolate Croissant', category: 'Pastries', price: 150, status: 'active' }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  const categories = ['all', 'Coffee', 'Tea', 'Pastries', 'Sandwiches', 'Desserts']

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="w-full space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-coffee-950">Menu Management</h1>
          <p className="text-coffee-700">Manage menu items and pricing</p>
        </div>
        <Link href="/admin/menu/add" className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Item</span>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="w-full p-4 bg-white rounded-xl shadow-md border border-coffee-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="w-full overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">₹{item.price}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/menu/${item.id}/edit`} className="text-blue-600 hover:text-blue-700">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
