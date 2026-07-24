'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Calendar, Clock, Users, Filter, Eye, CheckCircle, XCircle, Trash2, Phone, MessageCircle } from 'lucide-react'
import apiRequest from '@/utils/api'
import Can from '@/components/admin/Can'


interface Reservation {
  id: number
  full_name: string
  email: string | null
  phone: string
  outlet_id: number | null
  outlet_name: string | null
  reservation_date: string
  reservation_time: string
  guests: number
  special_requests: string | null
  status: string
  admin_notes: string | null
  created_at: string
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      const res = await apiRequest('/reservations')
      const data = await res.json()
      if (data.success) {
        setReservations(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: number, status: string, admin_notes?: string) => {
    try {
      const res = await apiRequest(`/reservations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes })
      })
      const data = await res.json()
      if (data.success) {
        fetchReservations()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const deleteReservation = async (id: number) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return
    try {
      const res = await apiRequest(`/reservations/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        fetchReservations()
      }
    } catch (error) {
      console.error('Failed to delete reservation:', error)
    }
  }

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = (reservation.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reservation.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reservation.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reservation.outlet_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reservation Management</h1>
        <p className="text-gray-600">Manage table reservations and bookings</p>
      </div>

      {/* Search and Filter */}
      <div className="w-full p-4 bg-white rounded-xl shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reservations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9943A]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9943A]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="w-full overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading reservations...</div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No reservations found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outlet</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReservations.map(reservation => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{reservation.full_name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{reservation.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{reservation.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{reservation.outlet_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{reservation.reservation_date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{reservation.reservation_time}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{reservation.guests}</td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(reservation.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(reservation.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <a href={`https://wa.me/${reservation.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${reservation.full_name}, your reservation at Big Bean Café has been received. We will confirm shortly. ☕`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="WhatsApp">
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => { setSelectedReservation(reservation); setShowModal(true) }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link href={`/admin/reservations/${reservation.id}`}
                          className="px-2.5 py-1 bg-[#3D1F0D] text-white text-xs font-semibold rounded-lg hover:bg-[#C9943A] transition-colors whitespace-nowrap">
                          View / Reply
                        </Link>
                        <Can module="reservations" action="edit">
                          {reservation.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(reservation.id, 'confirmed')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Confirm"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                            <button
                              onClick={() => updateStatus(reservation.id, 'cancelled')}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Cancel"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          {reservation.status === 'confirmed' && (
                            <button
                              onClick={() => updateStatus(reservation.id, 'completed')}
                              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded"
                              title="Mark as completed"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </Can>
                        <Can module="reservations" action="delete">
                          <button
                            onClick={() => deleteReservation(reservation.id)}
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
      {showModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Reservation Details</h2>
                <button
                  onClick={() => { setShowModal(false); setSelectedReservation(null) }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Customer Name</label>
                  <p className="text-sm text-gray-900">{selectedReservation.full_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Phone</label>
                    <p className="text-sm text-gray-900">{selectedReservation.phone}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                    <p className="text-sm text-gray-900">{selectedReservation.email || '-'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Outlet</label>
                    <p className="text-sm text-gray-900">{selectedReservation.outlet_name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Guests</label>
                    <p className="text-sm text-gray-900">{selectedReservation.guests}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Date</label>
                    <p className="text-sm text-gray-900">{selectedReservation.reservation_date}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Time</label>
                    <p className="text-sm text-gray-900">{selectedReservation.reservation_time}</p>
                  </div>
                </div>
                {selectedReservation.special_requests && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Special Requests</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedReservation.special_requests}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                    {getStatusBadge(selectedReservation.status)}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Created</label>
                    <p className="text-sm text-gray-900">{new Date(selectedReservation.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {selectedReservation.admin_notes && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Admin Notes</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedReservation.admin_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
