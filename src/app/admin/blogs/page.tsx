'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search, FileText } from 'lucide-react'

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([
    { id: 1, title: 'The Art of Perfect Espresso', author: 'John Doe', category: 'brewing-tips', status: 'published', date: '2024-06-15' },
    { id: 2, title: 'Sustainable Coffee Journey', author: 'Jane Smith', category: 'company-news', status: 'published', date: '2024-06-10' },
    { id: 3, title: 'Coffee Culture Around the World', author: 'Mike Johnson', category: 'coffee-culture', status: 'draft', date: '2024-06-05' }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || blog.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">Manage blog posts and articles</p>
        </div>
        <Link href="/admin/blogs/add" className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Blog Post</span>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBlogs.map(blog => (
                <tr key={blog.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{blog.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{blog.author}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{blog.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{blog.date}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/blogs/${blog.id}/edit`} className="text-blue-600 hover:text-blue-700">
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
