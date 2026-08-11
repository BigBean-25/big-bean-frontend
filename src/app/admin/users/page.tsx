'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Search, MoreVertical, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Lock, UserCog, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
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

const accessLabel = (user: AdminUser) => {
  if (user.role_key === 'super_admin') {
    return <span className="inline-flex items-center gap-1 text-xs font-bold text-[#C9943A]"><Shield className="h-3 w-3" /> Full Access</span>
  }
  const count = user.permission_count || 0
  return <span className="text-xs text-[#8AA89F]">{count} permission{count === 1 ? '' : 's'}</span>
}

const SkeletonRow = () => (
  <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#E8E0D8] bg-white p-4 md:grid-cols-[1.2fr_0.9fr_120px_120px_60px] md:items-center md:p-5">
    <div className="flex items-center gap-3">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-[#F7EFE7]" />
      <div className="w-full max-w-[14rem] space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#F7EFE7]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#F7EFE7]" />
      </div>
    </div>
    <div className="h-8 w-24 animate-pulse rounded bg-[#F7EFE7]" />
    <div className="h-6 w-16 animate-pulse rounded-full bg-[#F7EFE7]" />
    <div className="h-4 w-20 animate-pulse rounded bg-[#F7EFE7]" />
    <div className="h-8 w-8 animate-pulse rounded bg-[#F7EFE7]" />
  </div>
)

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
  const [modalMode, setModalMode] = useState<'edit' | 'permissions'>('edit')
  const [showChangePw, setShowChangePw] = useState(false)
  const [changePwUser, setChangePwUser] = useState<AdminUser | null>(null)
  const [changePw, setChangePw] = useState('')
  const [changePwConfirm, setChangePwConfirm] = useState('')
  const [changePwLoading, setChangePwLoading] = useState(false)
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
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenDropdown(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
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
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to delete user')
      setDeleteConfirm(null)
      toast.success('Admin user deleted')
      fetchUsers()
    } catch (error: any) {
      console.error('Delete user error:', error)
      toast.error(error.message || 'Failed to delete user')
    }
  }

  const handleStatus = async (id: number, status: string) => {
    try {
      const res = await apiRequest(`/admin-users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to update status')
      fetchUsers()
    } catch (error: any) {
      console.error('Status error:', error)
      toast.error(error.message || 'Failed to update status')
    }
  }

  const openEdit = (user: AdminUser) => {
    setModalMode('edit')
    setSelectedUser(user)
    setShowModal(true)
    setOpenDropdown(null)
  }

  const openChangePw = (user: AdminUser) => {
    setChangePwUser(user)
    setChangePw('')
    setChangePwConfirm('')
    setShowChangePw(true)
    setOpenDropdown(null)
  }

  const handleChangePassword = async () => {
    if (!changePwUser) return
    if (changePw.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (changePw !== changePwConfirm) { toast.error('Passwords do not match'); return }
    setChangePwLoading(true)
    try {
      const res = await apiRequest(`/admin-users/${changePwUser.id}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password: changePw })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to update password')
      toast.success('Password updated successfully')
      setShowChangePw(false)
      setChangePwUser(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setChangePwLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminRouteGuard>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#3D1F0D]">Admin Users</h1>
              <p className="text-sm text-[#9CB3AC]">Manage admin users and custom permissions</p>
            </div>
          </div>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </AdminRouteGuard>
    )
  }

  if (error) {
    return (
      <AdminRouteGuard>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#A92517]/20 bg-[#FFF7ED] p-8 text-center">
          <AlertCircle className="h-10 w-10 text-[#A92517]" />
          <p className="text-base font-semibold text-[#A92517]">{error}</p>
          <button onClick={fetchUsers} className="rounded-xl bg-[#C9943A] px-4 py-2 text-sm font-bold text-white hover:bg-[#8B4513]">Retry</button>
        </div>
      </AdminRouteGuard>
    )
  }

  return (
    <AdminRouteGuard>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#3D1F0D]">Admin Users</h1>
            <p className="text-sm text-[#9CB3AC]">Manage admin users and custom permissions</p>
          </div>
          <Can module="admin_users" action="create">
            <button
              onClick={() => { setModalMode('edit'); setSelectedUser(null); setShowModal(true) }}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2FBF9B] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#167E68]"
            >
              <UserPlus className="h-4 w-4" />
              Add Admin User
            </button>
          </Can>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-[#E8E0D8] bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:gap-3 sm:p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CB3AC]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#E8E0D8] bg-[#F7EFE7] pl-10 pr-4 text-sm text-[#3D1F0D] outline-none transition focus:border-[#2FBF9B] focus:bg-white"
            />
          </div>
          <div className="sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#E8E0D8] bg-[#F7EFE7] px-4 text-sm text-[#3D1F0D] outline-none focus:border-[#2FBF9B]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* Column headers (desktop only) */}
        <div className="hidden rounded-2xl border-b border-[#E8E0D8] bg-[#FFF7ED] px-5 pb-3 pt-4 text-xs font-black uppercase tracking-wider text-[#9CB3AC] md:grid md:grid-cols-[1.2fr_0.9fr_120px_120px_60px]">
          <div>User</div>
          <div>Role &amp; Access</div>
          <div>Status</div>
          <div>Created</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-[#E8E0D8] bg-white p-12 text-center text-sm text-[#9CB3AC]">
              {searchTerm ? 'No users match your search' : 'No admin users found'}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="group relative grid grid-cols-1 items-start gap-4 rounded-2xl border border-[#E8E0D8] bg-white p-4 shadow-sm transition hover:shadow-md md:grid-cols-[1.2fr_0.9fr_120px_120px_60px] md:items-center md:p-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C9943A] to-[#8B4513] text-sm font-black text-white shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#3D1F0D]">{user.name}</p>
                    <p className="truncate text-xs text-[#9CB3AC]">{user.email}</p>
                    {user.phone && <p className="text-xs text-[#8AA89F]">{user.phone}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-1 md:min-w-0">
                  <span className="truncate text-sm font-bold text-[#3D1F0D]">{user.designation || user.role_name || 'Custom Admin'}</span>
                  {accessLabel(user)}
                </div>

                <div className="flex items-center gap-2 md:col-span-1">
                  {statusBadge(user.status)}
                </div>

                <div className="text-sm text-[#9CB3AC]">{new Date(user.created_at).toLocaleDateString()}</div>

                <div className="flex items-center justify-end">
                  {(canEditUser || canDeleteUser) && (
                    <div className="relative" ref={openDropdown === user.id ? dropdownRef : undefined}>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                        aria-label="Open admin user actions"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#9CB3AC] transition hover:bg-[#F7EFE7] hover:text-[#3D1F0D] focus:outline-none focus:ring-2 focus:ring-[#2FBF9B]"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {openDropdown === user.id && (
                        <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-[#E8E0D8] bg-[#FFF7ED] py-2 shadow-2xl">
                          <Can module="admin_users" action="edit">
                            <button onClick={() => openEdit(user)} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#3D1F0D] transition hover:bg-[#F7EFE7]">
                              <Edit className="h-4 w-4 text-[#9CB3AC]" /> Edit
                            </button>
                            {user.role_key !== 'super_admin' && (
                              <button onClick={() => { setModalMode('permissions'); setSelectedUser(user); setShowModal(true); setOpenDropdown(null) }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#3D1F0D] transition hover:bg-[#F7EFE7]">
                                <UserCog className="h-4 w-4 text-[#9CB3AC]" /> Permissions
                              </button>
                            )}
                            <button onClick={() => openChangePw(user)} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#3D1F0D] transition hover:bg-[#F7EFE7]">
                              <Lock className="h-4 w-4 text-[#9CB3AC]" /> Change Password
                            </button>
                            {user.role_key !== 'super_admin' && (
                              user.status === 'active' ? (
                                <button onClick={() => { handleStatus(user.id, 'inactive'); setOpenDropdown(null) }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#3D1F0D] transition hover:bg-[#F7EFE7]">
                                  <XCircle className="h-4 w-4 text-[#9CB3AC]" /> Deactivate
                                </button>
                              ) : (
                                <button onClick={() => { handleStatus(user.id, 'active'); setOpenDropdown(null) }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#3D1F0D] transition hover:bg-[#F7EFE7]">
                                  <CheckCircle className="h-4 w-4 text-[#9CB3AC]" /> Activate
                                </button>
                              )
                            )}
                          </Can>
                          {user.role_key !== 'super_admin' && (
                            <Can module="admin_users" action="delete">
                              <div className="mt-1 border-t border-[#E8E0D8] pt-1">
                                <button onClick={() => { setDeleteConfirm(user.id); setOpenDropdown(null) }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#A92517] transition hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" /> Delete
                                </button>
                              </div>
                            </Can>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <AdminUserModal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setSelectedUser(null); setModalMode('edit') }}
          user={selectedUser}
          onSaved={fetchUsers}
          mode={modalMode}
        />

        {showChangePw && changePwUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-[#E8E0D8] bg-[#FFF7ED] p-6 shadow-2xl">
              <h2 className="text-xl font-black text-[#3D1F0D]">Change Password</h2>
              <p className="mt-1 text-sm text-[#9CB3AC]">{changePwUser.name}</p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#9CB3AC]">New Password</label>
                  <input
                    type="password"
                    value={changePw}
                    onChange={e => setChangePw(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#E8E0D8] bg-white px-4 text-sm text-[#3D1F0D] outline-none focus:border-[#2FBF9B]"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#9CB3AC]">Confirm Password</label>
                  <input
                    type="password"
                    value={changePwConfirm}
                    onChange={e => setChangePwConfirm(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#E8E0D8] bg-white px-4 text-sm text-[#3D1F0D] outline-none focus:border-[#2FBF9B]"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => { setShowChangePw(false); setChangePwUser(null) }}
                  className="flex-1 rounded-xl border border-[#E8E0D8] px-4 py-2.5 text-sm font-bold text-[#3D1F0D] hover:bg-[#F7EFE7]"
                >Cancel</button>
                <button
                  disabled={changePwLoading}
                  onClick={handleChangePassword}
                  className="flex-1 rounded-xl bg-[#C9943A] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#8B4513] disabled:opacity-50"
                >{changePwLoading ? 'Updating...' : 'Update Password'}</button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-[#E8E0D8] bg-[#FFF7ED] p-6 shadow-2xl">
              <h2 className="text-xl font-black text-[#3D1F0D]">Delete Admin User</h2>
              <p className="mt-2 text-sm text-[#9CB3AC]">Are you sure? This action cannot be undone.</p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl border border-[#E8E0D8] px-4 py-2.5 text-sm font-bold text-[#3D1F0D] hover:bg-[#F7EFE7]">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 rounded-xl bg-[#A92517] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#8b1c12]">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminRouteGuard>
  )
}
