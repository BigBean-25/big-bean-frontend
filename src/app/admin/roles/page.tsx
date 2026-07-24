'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield, Plus, Edit, Trash2, Search, Check, X, MoreVertical,
  Lock, Unlock, Users, ChevronDown, ChevronUp
} from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { isSuperAdmin } from '@/lib/adminPermissions'
import AdminRouteGuard from '@/components/admin/AdminRouteGuard'

interface Role {
  id: number
  role_name: string
  role_key: string
  description: string | null
  is_system: number
  is_active: number
  user_count: number
}

interface Permission {
  id: number
  module_key: string
  module_name: string
  permission_key: string
  permission_name: string
  permission_group: string
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
  can_export: boolean
}

export default function RolesPage() {
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Record<string, Permission[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [formData, setFormData] = useState({
    role_name: '',
    role_key: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!isSuperAdmin()) {
      router.push('/admin/dashboard')
      return
    }
    fetchRoles()
  }, [router])

  const fetchRoles = async () => {
    try {
      const res = await apiRequest('/admin-roles')
      if (!res.ok) throw new Error('Failed to fetch roles')
      const data = await res.json()
      if (data.success) {
        setRoles(data.data)
      }
    } catch (error) {
      console.error('Fetch roles error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRolePermissions = async (roleId: number) => {
    try {
      const res = await apiRequest(`/admin-roles/${roleId}/permissions`)
      if (!res.ok) throw new Error('Failed to fetch permissions')
      const data = await res.json()
      if (data.success) {
        // Group permissions by module
        const grouped: Record<string, Permission[]> = {}
        data.data.forEach((perm: Permission) => {
          if (!grouped[perm.permission_group]) {
            grouped[perm.permission_group] = []
          }
          grouped[perm.permission_group].push(perm)
        })
        setPermissions(grouped)
        // Expand all groups by default
        const expanded: Record<string, boolean> = {}
        Object.keys(grouped).forEach(group => expanded[group] = true)
        setExpandedGroups(expanded)
      }
    } catch (error) {
      console.error('Fetch permissions error:', error)
    }
  }

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await apiRequest('/admin-roles', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed to create role')
      const data = await res.json()
      if (data.success) {
        setShowAddModal(false)
        setFormData({ role_name: '', role_key: '', description: '' })
        fetchRoles()
      }
    } catch (error) {
      console.error('Create role error:', error)
      alert('Failed to create role')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return
    setSubmitting(true)
    try {
      const res = await apiRequest(`/admin-roles/${selectedRole.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed to update role')
      const data = await res.json()
      if (data.success) {
        setShowEditModal(false)
        setSelectedRole(null)
        setFormData({ role_name: '', role_key: '', description: '' })
        fetchRoles()
      }
    } catch (error) {
      console.error('Update role error:', error)
      alert('Failed to update role')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRole = async (id: number) => {
    try {
      const res = await apiRequest(`/admin-roles/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete role')
      const data = await res.json()
      if (data.success) {
        setDeleteConfirm(null)
        fetchRoles()
      }
    } catch (error) {
      console.error('Delete role error:', error)
      alert('Failed to delete role')
    }
  }

  const handleUpdatePermissions = async () => {
    if (!selectedRole) return
    setSubmitting(true)
    try {
      const flatPermissions = Object.values(permissions).flat()
      const res = await apiRequest(`/admin-roles/${selectedRole.id}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions: flatPermissions })
      })
      if (!res.ok) throw new Error('Failed to update permissions')
      const data = await res.json()
      if (data.success) {
        setShowPermissionModal(false)
        setSelectedRole(null)
        fetchRoles()
      }
    } catch (error) {
      console.error('Update permissions error:', error)
      alert('Failed to update permissions')
    } finally {
      setSubmitting(false)
    }
  }

  const togglePermission = (group: string, permIndex: number, field: 'can_view' | 'can_create' | 'can_edit' | 'can_delete' | 'can_export') => {
    setPermissions(prev => ({
      ...prev,
      [group]: prev[group].map((perm, idx) =>
        idx === permIndex ? { ...perm, [field]: !perm[field] } : perm
      )
    }))
  }

  const openEditModal = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      role_name: role.role_name,
      role_key: role.role_key,
      description: role.description || ''
    })
    setShowEditModal(true)
  }

  const openPermissionModal = (role: Role) => {
    setSelectedRole(role)
    fetchRolePermissions(role.id)
    setShowPermissionModal(true)
  }

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2FBF9B] border-t-transparent" />
      </div>
    )
  }

  return (
    <AdminRouteGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#0F1F1A]">Permission Presets</h1>
            <p className="text-sm text-[#5F6F68]">Create reusable permission templates for admin users</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2FBF9B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#167E68]"
          >
            <Plus className="h-4 w-4" />
            Add Preset
          </button>
        </div>

        {/* Presets Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="relative overflow-hidden rounded-2xl border border-[#DCE8E3] bg-white p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9943A] to-[#8B4513] text-white">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#0F1F1A]">{role.role_name}</h3>
                    <p className="text-xs text-[#8AA89F]">{role.role_key}</p>
                  </div>
                </div>
                {role.is_system === 1 && (
                  <Lock className="h-4 w-4 text-[#8AA89F]" />
                )}
              </div>
              
              {role.description && (
                <p className="mt-3 text-sm text-[#5F6F68] line-clamp-2">{role.description}</p>
              )}
              
              <div className="mt-4 flex items-center gap-4 text-sm text-[#8AA89F]">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{role.user_count} users</span>
                </div>
                <div className="flex items-center gap-1">
                  {role.is_active === 1 ? (
                    <Unlock className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-red-600" />
                  )}
                  <span>{role.is_active === 1 ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openPermissionModal(role)}
                  className="flex-1 rounded-xl bg-[#F3F8F6] px-3 py-2 text-xs font-bold text-[#0F1F1A] hover:bg-[#EAF8F3]"
                >
                  Permissions
                </button>
                {role.is_system === 0 && (
                  <>
                    <button
                      onClick={() => openEditModal(role)}
                      className="rounded-xl bg-[#F3F8F6] p-2 text-[#0F1F1A] hover:bg-[#EAF8F3]"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(role.id)}
                      className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Role Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-[#DCE8E3] bg-white p-6">
              <h2 className="text-xl font-black text-[#0F1F1A]">Add Preset</h2>
              <form onSubmit={handleAddRole} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#5F6F68]">Role Name</label>
                  <input
                    type="text"
                    required
                    value={formData.role_name}
                    onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                    className="w-full rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm outline-none focus:border-[#2FBF9B]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#5F6F68]">Role Key</label>
                  <input
                    type="text"
                    required
                    value={formData.role_key}
                    onChange={(e) => setFormData({ ...formData, role_key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    className="w-full rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm outline-none focus:border-[#2FBF9B]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#5F6F68]">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm outline-none focus:border-[#2FBF9B]"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm font-bold text-[#0F1F1A] hover:bg-[#F3F8F6]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-[#2FBF9B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#167E68] disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Preset'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Role Modal */}
        {showEditModal && selectedRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-[#DCE8E3] bg-white p-6">
              <h2 className="text-xl font-black text-[#0F1F1A]">Edit Preset</h2>
              <form onSubmit={handleEditRole} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#5F6F68]">Role Name</label>
                  <input
                    type="text"
                    required
                    value={formData.role_name}
                    onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                    className="w-full rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm outline-none focus:border-[#2FBF9B]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#5F6F68]">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm outline-none focus:border-[#2FBF9B]"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setSelectedRole(null) }}
                    className="flex-1 rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm font-bold text-[#0F1F1A] hover:bg-[#F3F8F6]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-[#2FBF9B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#167E68] disabled:opacity-50"
                  >
                    {submitting ? 'Updating...' : 'Update Preset'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Permissions Modal */}
        {showPermissionModal && selectedRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#DCE8E3] bg-white flex flex-col">
              <div className="flex items-center justify-between border-b border-[#DCE8E3] p-6">
                <div>
                  <h2 className="text-xl font-black text-[#0F1F1A]">Permissions: {selectedRole.role_name}</h2>
                  <p className="text-sm text-[#5F6F68]">Configure access for this role</p>
                </div>
                <button
                  onClick={() => { setShowPermissionModal(false); setSelectedRole(null) }}
                  className="rounded-xl p-2 text-[#5F6F68] hover:bg-[#F3F8F6]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {Object.entries(permissions).map(([group, perms]) => (
                  <div key={group} className="mb-4">
                    <button
                      onClick={() => toggleGroup(group)}
                      className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#5F6F68] hover:text-[#0F1F1A]"
                    >
                      {expandedGroups[group] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      {group}
                    </button>
                    
                    {expandedGroups[group] && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-[#DCE8E3]">
                        <table className="w-full">
                          <thead className="bg-[#F3F8F6]">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-bold text-[#5F6F68]">Module</th>
                              <th className="px-4 py-2 text-center text-xs font-bold text-[#5F6F68]">View</th>
                              <th className="px-4 py-2 text-center text-xs font-bold text-[#5F6F68]">Create</th>
                              <th className="px-4 py-2 text-center text-xs font-bold text-[#5F6F68]">Edit</th>
                              <th className="px-4 py-2 text-center text-xs font-bold text-[#5F6F68]">Delete</th>
                              <th className="px-4 py-2 text-center text-xs font-bold text-[#5F6F68]">Export</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#DCE8E3]">
                            {perms.map((perm, idx) => (
                              <tr key={perm.id} className="hover:bg-[#F3F8F6]">
                                <td className="px-4 py-2 text-sm font-bold text-[#0F1F1A]">{perm.module_name}</td>
                                <td className="px-4 py-2 text-center">
                                  <button
                                    onClick={() => togglePermission(group, idx, 'can_view')}
                                    className={`rounded-lg p-1 ${perm.can_view ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                                  >
                                    {perm.can_view ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                  </button>
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <button
                                    onClick={() => togglePermission(group, idx, 'can_create')}
                                    className={`rounded-lg p-1 ${perm.can_create ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                                  >
                                    {perm.can_create ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                  </button>
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <button
                                    onClick={() => togglePermission(group, idx, 'can_edit')}
                                    className={`rounded-lg p-1 ${perm.can_edit ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                                  >
                                    {perm.can_edit ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                  </button>
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <button
                                    onClick={() => togglePermission(group, idx, 'can_delete')}
                                    className={`rounded-lg p-1 ${perm.can_delete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                                  >
                                    {perm.can_delete ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                  </button>
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <button
                                    onClick={() => togglePermission(group, idx, 'can_export')}
                                    className={`rounded-lg p-1 ${perm.can_export ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                                  >
                                    {perm.can_export ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 border-t border-[#DCE8E3] p-6">
                <button
                  onClick={() => { setShowPermissionModal(false); setSelectedRole(null) }}
                  className="rounded-xl border border-[#DCE8E3] px-6 py-2.5 text-sm font-bold text-[#0F1F1A] hover:bg-[#F3F8F6]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePermissions}
                  disabled={submitting}
                  className="rounded-xl bg-[#2FBF9B] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#167E68] disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Permissions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-[#DCE8E3] bg-white p-6">
              <h2 className="text-xl font-black text-[#0F1F1A]">Delete Preset</h2>
              <p className="mt-2 text-sm text-[#5F6F68]">Are you sure you want to delete this preset? This action cannot be undone.</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm font-bold text-[#0F1F1A] hover:bg-[#F3F8F6]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteRole(deleteConfirm)}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminRouteGuard>
  )
}
