'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search, Users, Star } from 'lucide-react'

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([
    { id: 1, name: 'John Doe', role: 'Regular Customer', rating: 5, status: 'active', date: '2024-06-25' },
    { id: 2, name: 'Jane Smith', role: 'Coffee Enthusiast', rating: 4, status: 'active', date: '2024-06-24' },
    { id: 3, name: 'Mike Johnson', role: 'Business Owner', rating: 5, status: 'inactive', date: '2024-06-23' }
  ])
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTestimonials = testimonials.filter(testimonial =>
    testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonials Management</h1>
          <p className="text-gray-600">Manage customer testimonials and reviews</p>
        </div>
        <Link href="/admin/testimonials/add" className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Testimonial</span>
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search testimonials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
          />
        </div>
      </div>

      {/* Testimonials Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTestimonials.map(testimonial => (
                <tr key={testimonial.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{testimonial.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{testimonial.role}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{testimonial.date}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      testimonial.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {testimonial.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/testimonials/${testimonial.id}/edit`} className="text-blue-600 hover:text-blue-700">
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
