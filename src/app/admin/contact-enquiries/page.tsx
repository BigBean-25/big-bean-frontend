'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Mail, Phone, MessageCircle, Filter, Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import apiRequest from '@/utils/api'
import Can from '@/components/admin/Can'


interface ContactEnquiry {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: string
  created_at: string
}

export default function AdminContactEnquiries() {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiry | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const fetchEnquiries = async () => {
    try {
      const res = await apiRequest('/contact-enquiries')
      const data = await res.json()
      if (data.success) {
        setEnquiries(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch enquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await apiRequest(`/contact-enquiries/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (data.success) {
        fetchEnquiries()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const deleteEnquiry = async (id: number) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return
    try {
      const res = await apiRequest(`/contact-enquiries/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        fetchEnquiries()
      }
    } catch (error) {
      console.error('Failed to delete enquiry:', error)
    }
  }

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = (enquiry.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (enquiry.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (enquiry.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || enquiry.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    }
    const label = status?.replace('_', ' ') || status
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {label}
      </span>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contact Enquiries</h1>
        <p className="text-gray-600">Manage customer contact requests and feedback</p>
      </div>

      {/* Search and Filter */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search enquiries..."
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

      {/* Enquiries Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading enquiries...</div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No enquiries found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEnquiries.map(enquiry => (
                  <tr key={enquiry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{enquiry.name}</p>
                        <p className="text-xs text-gray-500">{enquiry.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{enquiry.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{enquiry.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(enquiry.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(enquiry.status)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-2">
                        {enquiry.phone && (
                          <a href={`https://wa.me/${enquiry.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${enquiry.name}, thank you for contacting Big Bean Café! We received your message and will get back to you shortly. ☕`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="WhatsApp">
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => { setSelectedEnquiry(enquiry); setShowModal(true) }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link href={`/admin/contact-enquiries/${enquiry.id}`}
                          className="px-2.5 py-1 bg-[#3D1F0D] text-white text-xs font-semibold rounded-lg hover:bg-[#C9943A] transition-colors whitespace-nowrap">
                          View / Reply
                        </Link>
                        <Can module="contact_enquiries" action="edit">
                          {enquiry.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(enquiry.id, 'in_progress')}
                              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"
                              title="Mark as in progress"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          )}
                          {enquiry.status !== 'completed' && (
                            <button
                              onClick={() => updateStatus(enquiry.id, 'completed')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Mark as completed"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </Can>
                        <Can module="contact_enquiries" action="delete">
                          <button
                            onClick={() => deleteEnquiry(enquiry.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Enquiry Details</h2>
                <button
                  onClick={() => { setShowModal(false); setSelectedEnquiry(null) }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
                  <p className="text-sm text-gray-900">{selectedEnquiry.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                    <p className="text-sm text-gray-900">{selectedEnquiry.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Phone</label>
                    <p className="text-sm text-gray-900">{selectedEnquiry.phone || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Subject</label>
                  <p className="text-sm text-gray-900">{selectedEnquiry.subject}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Message</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedEnquiry.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                    {getStatusBadge(selectedEnquiry.status)}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Date</label>
                    <p className="text-sm text-gray-900">{new Date(selectedEnquiry.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

