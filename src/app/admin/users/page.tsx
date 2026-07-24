'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Search, Shield, MoreVertical, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Lock, UserCog } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { isSuperAdmin, hasPermission } from '@/lib/adminPermissions'
import AdminRouteGuard from '@/components/admin/AdminRouteGuard'
import AdminUserModal from '@/components/admin/AdminUserModal'
import Can from '@/components/admin/Can'

interface AdminUser {
  id: number
  name: string
  email: string
  phone: string | null
  role_id: number | null
  role_name: string | null
  role_key: string | null
  status: string
  last_login_at: string | null
  created_at: string
  designation: string | null
  permission_count: number
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'active': return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700"><CheckCircle className="h-3 w-3" /> Active</span>
    case 'inactive': return <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700"><XCircle className="h-3 w-3" /> Inactive</span>
    case 'blocked': return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700"><AlertCircle className="h-3 w-3" /> Blocked</span>
    default: return <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">{status}</span>
  }
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const canViewUsers = isSuperAdmin() || hasPermission('admin_users', 'view')
  const canCreateUser = isSuperAdmin() || hasPermission('admin_users', 'create')
  const canEditUser = isSuperAdmin() || hasPermission('admin_users', 'edit')
  const canDeleteUser = isSuperAdmin() || hasPermission('admin_users', 'delete')

  useEffect(() => {
    if (!canViewUsers) {
      router.push('/admin/dashboard')
      return
    }
    fetchUsers()
  }, [router, canViewUsers])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiRequest('/admin-users')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to fetch users')
      }
      const data = await res.json()
      if (data.success) setUsers(data.data)
    } catch (error: any) {
      console.error('Fetch users error:', error)
      setError('Unable to load admin users. Please check backend logs.')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name + ' ' + user.email).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: number) => {
    try {
      const res = await apiRequest(`/admin-users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete user')
      setDeleteConfirm(null)
      fetchUsers()
    } catch (error) {
      console.error('Delete user error:', error)
      alert('Failed to delete user')
    }
  }

  const handleStatus = async (id: number, status: string) => {
    try {
      const res = await apiRequest(`/admin-users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
      if (!res.ok) throw new Error('Failed to update status')
      fetchUsers()
    } catch (error) {
      console.error('Status error:', error)
      alert('Failed to update status')
    }
  }

  const openEdit = (user: AdminUser) => {
    setSelectedUser(user)
    setShowModal(true)
    setOpenDropdown(null)
  }

  const openChangePassword = (user: AdminUser) => {
    const password = prompt(`Enter new password for ${user.name}:`)
    if (password && password.length >= 6) {
      apiRequest(`/admin-users/${user.id}/password`, { method: 'PUT', body: JSON.stringify({ password }) })
        .then(res => res.ok ? alert('Password updated') : alert('Failed to update password'))
    }
    setOpenDropdown(null)
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2FBF9B] border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <AdminRouteGuard>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-base font-semibold text-red-700">{error}</p>
        </div>
      </AdminRouteGuard>
    )
  }

  return (
    <AdminRouteGuard>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#0F1F1A]">Admin Users</h1>
            <p className="text-sm text-[#5F6F68]">Manage admin users and custom permissions</p>
          </div>
          <Can module="admin_users" action="create">
            <button
              onClick={() => { setSelectedUser(null); setShowModal(true) }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2FBF9B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#167E68]"
            >
              <UserPlus className="h-4 w-4" />
              Add Admin User
            </button>
          </Can>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-[#DCE8E3] bg-white p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CB3AC]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[#DCE8E3] bg-[#F3F8F6] py-2.5 pl-10 pr-4 text-sm text-[#0F1F1A] outline-none focus:border-[#2FBF9B]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[#DCE8E3] bg-[#F3F8F6] px-4 py-2.5 text-sm text-[#0F1F1A] outline-none focus:border-[#2FBF9B]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#DCE8E3] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F3F8F6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-[#5F6F68]">User</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-[#5F6F68]">Designation / Access</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-[#5F6F68]">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-[#5F6F68]">Created Date</th>
                  <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-wider text-[#5F6F68]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE8E3]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#5F6F68]">No admin users found</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[#F3F8F6]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C9943A] to-[#8B4513] text-sm font-black text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#0F1F1A]">{user.name}</p>
                            <p className="truncate text-xs text-[#5F6F68]">{user.email}</p>
                            {user.phone && <p className="text-xs text-[#8AA89F]">{user.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-[#0F1F1A]">{user.designation || user.role_name || 'Custom Admin'}</span>
                          <span className="text-xs text-[#8AA89F]">{user.permission_count} permission(s)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{statusBadge(user.status)}</td>
                      <td className="px-6 py-4 text-sm text-[#5F6F68]">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        {(canEditUser || canDeleteUser) && (
                        <div className="relative inline-block" ref={openDropdown === user.id ? dropdownRef : null}>
                          <button
                            onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                            className="rounded-lg p-2 text-[#5F6F68] hover:bg-[#F3F8F6]"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openDropdown === user.id && (
                            <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-[#DCE8E3] bg-white py-1 shadow-2xl">
                              <Can module="admin_users" action="edit">
                                <button onClick={() => openEdit(user)} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#0F1F1A] hover:bg-[#F3F8F6]">
                                  <Edit className="h-3.5 w-3.5" /> Edit
                                </button>
                                <button onClick={() => { setSelectedUser(user); setShowModal(true); setOpenDropdown(null) }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#0F1F1A] hover:bg-[#F3F8F6]">
                                  <UserCog className="h-3.5 w-3.5" /> Permissions
                                </button>
                                <button onClick={() => openChangePassword(user)} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#0F1F1A] hover:bg-[#F3F8F6]">
                                  <Lock className="h-3.5 w-3.5" /> Change Password
                                </button>
                                {user.status === 'active' ? (
                                  <button onClick={() => { handleStatus(user.id, 'inactive'); setOpenDropdown(null) }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#0F1F1A] hover:bg-[#F3F8F6]">
                                    <XCircle className="h-3.5 w-3.5" /> Deactivate
                                  </button>
                                ) : (
                                  <button onClick={() => { handleStatus(user.id, 'active'); setOpenDropdown(null) }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#0F1F1A] hover:bg-[#F3F8F6]">
                                    <CheckCircle className="h-3.5 w-3.5" /> Activate
                                  </button>
                                )}
                              </Can>
                              <Can module="admin_users" action="delete">
                                <button onClick={() => { setDeleteConfirm(user.id); setOpenDropdown(null) }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                  <Trash2 className="h-3.5 w-3.5" /> Delete
                                </button>
                              </Can>
                            </div>
                          )}
                        </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AdminUserModal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setSelectedUser(null) }}
          user={selectedUser}
          onSaved={fetchUsers}
        />

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-[#DCE8E3] bg-white p-6">
              <h2 className="text-xl font-black text-[#0F1F1A]">Delete Admin User</h2>
              <p className="mt-2 text-sm text-[#5F6F68]">Are you sure? This action cannot be undone.</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm font-bold text-[#0F1F1A] hover:bg-[#F3F8F6]">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminRouteGuard>
  )
}
