'use client'

import { useState } from 'react'
import { BarChart3, Download, Calendar, TrendingUp, Users, DollarSign, ShoppingBag } from 'lucide-react'

export default function AdminReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedReport, setSelectedReport] = useState('overview')

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'sales', name: 'Sales Report', icon: DollarSign },
    { id: 'customers', name: 'Customer Analytics', icon: Users },
    { id: 'products', name: 'Product Performance', icon: ShoppingBag }
  ]

  const periods = [
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'year', name: 'This Year' }
  ]

  const generateReport = () => {
    // Mock report generation
    alert('Generating report... This would download a PDF/Excel file in production.')
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">View and download business reports</p>
      </div>

      {/* Report Controls */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                {reportTypes.map(report => (
                  <option key={report.id} value={report.id}>{report.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                {periods.map(period => (
                  <option key={period.id} value={period.id}>{period.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={generateReport}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">₹856,420</p>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">+15% from last period</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Orders</h3>
            <ShoppingBag className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">1,247</p>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">+12% from last period</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">5,432</p>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">+8% from last period</span>
          </div>
        </div>
      </div>

      {/* Detailed Report */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {reportTypes.find(r => r.id === selectedReport)?.name} Report
        </h2>
        
        {/* Placeholder for charts and detailed data */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chart visualization would be displayed here</p>
              <p className="text-sm text-gray-500 mt-2">
                Integration with charting library (Chart.js, Recharts) needed for actual charts
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Data Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">2024-06-25</td>
                    <td className="px-4 py-3 text-sm text-gray-900">45</td>
                    <td className="px-4 py-3 text-sm text-gray-900">₹12,450</td>
                    <td className="px-4 py-3 text-sm text-gray-900">38</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">2024-06-24</td>
                    <td className="px-4 py-3 text-sm text-gray-900">52</td>
                    <td className="px-4 py-3 text-sm text-gray-900">₹15,320</td>
                    <td className="px-4 py-3 text-sm text-gray-900">45</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">2024-06-23</td>
                    <td className="px-4 py-3 text-sm text-gray-900">38</td>
                    <td className="px-4 py-3 text-sm text-gray-900">₹10,890</td>
                    <td className="px-4 py-3 text-sm text-gray-900">32</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
