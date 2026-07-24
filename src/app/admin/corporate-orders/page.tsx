'use client'

import { useState } from 'react'
import { Search, Briefcase, Filter } from 'lucide-react'

export default function AdminCorporateOrders() {
  const [orders, setOrders] = useState([
    { id: 1, company: 'ABC Corporation', contact: 'John Doe', type: 'coffee-beans', quantity: '10kg', status: 'pending', date: '2024-06-25' },
    { id: 2, company: 'XYZ Tech', contact: 'Jane Smith', type: 'equipment', quantity: '2 machines', status: 'in_progress', date: '2024-06-24' },
    { id: 3, company: 'Global Solutions', contact: 'Mike Johnson', type: 'catering', quantity: '50 people', status: 'completed', date: '2024-06-23' }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.contact.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Corporate Orders</h1>
        <p className="text-gray-600">Manage corporate coffee orders and solutions</p>
      </div>

      {/* Search and Filter */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
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
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.company}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{order.contact}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{order.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{order.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{order.date}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
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
