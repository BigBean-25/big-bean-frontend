'use client'

import { useState, useEffect } from 'react'
import { apiRequest } from '@/lib/api'
import Link from 'next/link'
import {
  Star, CheckCircle, XCircle, Trash2, Search, Filter,
  ChevronLeft, ChevronRight, Package, User, Mail
} from 'lucide-react'

interface Review {
  id: number
  merchandise_id: number
  customer_name: string
  customer_email: string
  rating: number
  review_title: string | null
  review_message: string
  status: 'pending' | 'approved' | 'rejected'
  is_verified_purchase: number
  created_at: string
  product_name: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function MerchandiseReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      })
      const res = await apiRequest(`/merchandise-reviews/admin?${params}`)
      if (!res.ok) throw new Error('Failed to fetch reviews')
      const data = await res.json()
      if (data.success) {
        setReviews(data.reviews || [])
        setPagination(data.pagination || pagination)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [pagination.page, statusFilter, searchTerm])

  const handleStatusUpdate = async (reviewId: number, status: 'approved' | 'rejected') => {
    setActionLoading(reviewId)
    try {
      const res = await apiRequest(`/merchandise-reviews/admin/${reviewId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Failed to update status')
      fetchReviews()
    } catch (error) {
      console.error('Error updating review status:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    setActionLoading(reviewId)
    try {
      const res = await apiRequest(`/merchandise-reviews/admin/${reviewId}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete review')
      fetchReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Merchandise Reviews</h1>
          <p className="mt-2 text-gray-600">Manage customer product reviews</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by customer, title, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reviews found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{review.product_name}</h3>
                        {getStatusBadge(review.status)}
                        {review.is_verified_purchase && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <CheckCircle className="w-3 h-3" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{review.customer_name}</span>
                        </div>
                        {review.customer_email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{review.customer_email}</span>
                          </div>
                        )}
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating)}
                      </div>
                      {review.review_title && (
                        <h4 className="font-medium text-gray-900 mb-1">{review.review_title}</h4>
                      )}
                      <p className="text-gray-700">{review.review_message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(review.id, 'approved')}
                          disabled={actionLoading === review.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(review.id, 'rejected')}
                          disabled={actionLoading === review.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={actionLoading === review.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && reviews.length > 0 && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
