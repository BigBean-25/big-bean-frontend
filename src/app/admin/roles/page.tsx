'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield, Plus, Edit, Trash2, Search, Check, X, MoreVertical,
  Lock, Unlock, Users, ChevronDown, ChevronUp
} from 'lucide-react'
import toast from 'react-hot-toast'
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
  can_view?: boolean
  can_create?: boolean
  can_edit?: boolean
  can_delete?: boolean
  can_export?: boolean
}

interface ModulePermission {
  module_key: string
  module_name: string
  permission_group: string
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
  can_export: boolean
  data_scope: string
  view_id?: number
  create_id?: number
  edit_id?: number
  delete_id?: number
  export_id?: number
}

export default function RolesPage() {
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [modulePerms, setModulePerms] = useState<Record<string, ModulePermission[]>>({})
  const [permLoading, setPermLoading] = useState(false)
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

  const fetchRolePermissions = async (roleId: number, role: Role) => {
    setPermLoading(true)
    try {
      const [catalogRes, assignRes] = await Promise.all([
        apiRequest('/admin-permissions'),
        apiRequest(`/admin-roles/${roleId}/permissions`)
      ])
      if (!catalogRes.ok) throw new Error('Failed to fetch permission catalog')
      const catalogData = await catalogRes.json()
      const allCatalog: Permission[] = catalogData.data || []

      // Build module-level map (one entry per unique module_key)
      const moduleMap: Record<string, ModulePermission> = {}
      allCatalog.forEach(p => {
        if (!moduleMap[p.module_key]) {
          moduleMap[p.module_key] = {
            module_key: p.module_key,
            module_name: p.module_name,
            permission_group: p.permission_group,
            can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false,
            data_scope: 'assigned'
          }
        }
        const action = p.permission_key.split('.').pop()
        if (action === 'view')   moduleMap[p.module_key].view_id   = p.id
        if (action === 'create') moduleMap[p.module_key].create_id = p.id
        if (action === 'edit')   moduleMap[p.module_key].edit_id   = p.id
        if (action === 'delete') moduleMap[p.module_key].delete_id = p.id
        if (action === 'export') moduleMap[p.module_key].export_id = p.id
      })

      // Overlay role's current assignments onto module map
      if (assignRes.ok) {
        const assignData = await assignRes.json()
        const assigned: any[] = assignData.data || []
        assigned.forEach(rp => {
          const m = moduleMap[rp.module_key]
          if (!m) return
          const action = rp.permission_key?.split('.').pop()
          if (action === 'view'   && rp.can_view)   m.can_view   = true
          if (action === 'create' && rp.can_create) m.can_create = true
          if (action === 'edit'   && rp.can_edit)   m.can_edit   = true
          if (action === 'delete' && rp.can_delete) m.can_delete = true
          if (action === 'export' && rp.can_export) m.can_export = true
          if (rp.data_scope) m.data_scope = rp.data_scope
        })
      }

      // Super Admin: mark every available action as checked (read-only display)
      if (role.role_key === 'super_admin') {
        Object.values(moduleMap).forEach(m => {
          if (m.view_id)   m.can_view   = true
          if (m.create_id) m.can_create = true
          if (m.edit_id)   m.can_edit   = true
          if (m.delete_id) m.can_delete = true
          if (m.export_id) m.can_export = true
          m.data_scope = 'all'
        })
      }

      // Group collapsed modules by permission_group for display
      const grouped: Record<string, ModulePermission[]> = {}
      Object.values(moduleMap).forEach(m => {
        const g = m.permission_group || 'Other'
        if (!grouped[g]) grouped[g] = []
        grouped[g].push(m)
      })
      setModulePerms(grouped)

      // Expand all groups by default
      const expanded: Record<string, boolean> = {}
      Object.keys(grouped).forEach(g => { expanded[g] = true })
      setExpandedGroups(expanded)
    } catch (error) {
      console.error('Fetch permissions error:', error)
      toast.error('Failed to load permission catalog')
    } finally {
      setPermLoading(false)
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
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to create role')
      if (data.success) {
        setShowAddModal(false)
        setFormData({ role_name: '', role_key: '', description: '' })
        fetchRoles()
      }
    } catch (error: any) {
      console.error('Create role error:', error)
      toast.error(error.message || 'Failed to create role')
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
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to update role')
      if (data.success) {
        setShowEditModal(false)
        setSelectedRole(null)
        setFormData({ role_name: '', role_key: '', description: '' })
        fetchRoles()
      }
    } catch (error: any) {
      console.error('Update role error:', error)
      toast.error(error.message || 'Failed to update role')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRole = async (id: number) => {
    try {
      const res = await apiRequest(`/admin-roles/${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to delete role')
      if (data.success) {
        setDeleteConfirm(null)
        fetchRoles()
      }
    } catch (error: any) {
      console.error('Delete role error:', error)
      toast.error(error.message || 'Failed to delete role')
    }
  }

  const togglePermission = (group: string, moduleKey: string, field: 'can_view' | 'can_create' | 'can_edit' | 'can_delete' | 'can_export') => {
    if (selectedRole?.role_key === 'super_admin') return
    setModulePerms(prev => ({
      ...prev,
      [group]: prev[group].map(m =>
        m.module_key === moduleKey ? { ...m, [field]: !m[field] } : m
      )
    }))
  }

  const handleUpdatePermissions = async () => {
    if (!selectedRole || selectedRole.role_key === 'super_admin') return
    setSubmitting(true)
    try {
      const actions = ['view', 'create', 'edit', 'delete', 'export'] as const
      const payload: any[] = []
      Object.values(modulePerms).flat().forEach(m => {
        actions.forEach(action => {
          const permId = (m as any)[`${action}_id`] as number | undefined
          if (!permId) return
          if (m[`can_${action}`]) {
            payload.push({
              permission_id: permId,
              can_view:   action === 'view'   ? 1 : 0,
              can_create: action === 'create' ? 1 : 0,
              can_edit:   action === 'edit'   ? 1 : 0,
              can_delete: action === 'delete' ? 1 : 0,
              can_export: action === 'export' ? 1 : 0,
              data_scope: m.data_scope || 'assigned'
            })
          }
        })
      })
      const res = await apiRequest(`/admin-roles/${selectedRole.id}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions: payload })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to update permissions')
      if (data.success) {
        toast.success('Permissions saved')
        setShowPermissionModal(false)
        setSelectedRole(null)
        fetchRoles()
      }
    } catch (error: any) {
      console.error('Update permissions error:', error)
      toast.error(error.message || 'Failed to update permissions')
    } finally {
      setSubmitting(false)
    }
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
    setModulePerms({})
    fetchRolePermissions(role.id, role)
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
            <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#DCE8E3] bg-white" style={{ maxHeight: '90vh' }}>

              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-[#DCE8E3] px-6 py-5">
                <div>
                  <h2 className="text-xl font-black text-[#0F1F1A]">Permissions: {selectedRole.role_name}</h2>
                  <p className="text-sm text-[#5F6F68]">Configure access for this role</p>
                </div>
                <div className="flex items-center gap-3">
                  {selectedRole.role_key === 'super_admin' && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">Full System Access</span>
                  )}
                  <button
                    onClick={() => { setShowPermissionModal(false); setSelectedRole(null) }}
                    className="rounded-xl p-2 text-[#5F6F68] hover:bg-[#F3F8F6]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Super Admin banner */}
              {selectedRole.role_key === 'super_admin' && (
                <div className="shrink-0 border-b border-amber-100 bg-amber-50 px-6 py-3">
                  <p className="text-sm font-bold text-amber-800">
                    Super Admin bypasses all permission checks and always has full system access. The matrix below is read-only.
                  </p>
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {permLoading ? (
                  <div className="flex min-h-[220px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2FBF9B] border-t-transparent" />
                  </div>
                ) : Object.keys(modulePerms).length === 0 ? (
                  <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
                    <Shield className="h-10 w-10 text-[#9CB3AC]" />
                    <p className="text-sm font-bold text-[#5F6F68]">No permission modules found</p>
                    <p className="text-xs text-[#9CB3AC]">Ensure the admin_permissions table is seeded.</p>
                  </div>
                ) : (
                  <>
                    {selectedRole.role_key !== 'super_admin' &&
                      Object.values(modulePerms).flat().every(m => !m.can_view && !m.can_create && !m.can_edit && !m.can_delete && !m.can_export) && (
                      <div className="mb-4 rounded-xl bg-[#F3F8F6] px-4 py-3 text-sm text-[#5F6F68]">
                        No permissions are selected for this role yet. Use the checkboxes below to configure access.
                      </div>
                    )}
                    {Object.entries(modulePerms).map(([group, mods]) => (
                      <div key={group} className="mb-4">
                        <button
                          onClick={() => toggleGroup(group)}
                          className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#5F6F68] hover:text-[#0F1F1A]"
                        >
                          {expandedGroups[group] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          {group}
                          <span className="ml-1 rounded-full bg-[#EAF8F3] px-2 py-0.5 text-[10px] font-black text-[#167E68]">{mods.length}</span>
                        </button>
                        {expandedGroups[group] && (
                          <div className="mt-3 overflow-x-auto rounded-xl border border-[#DCE8E3]">
                            <table className="w-full min-w-[560px]">
                              <thead className="bg-[#F3F8F6]">
                                <tr>
                                  <th className="px-4 py-2.5 text-left text-xs font-bold text-[#5F6F68]">Module</th>
                                  <th className="px-4 py-2.5 text-center text-xs font-bold text-[#5F6F68]">View</th>
                                  <th className="px-4 py-2.5 text-center text-xs font-bold text-[#5F6F68]">Create</th>
                                  <th className="px-4 py-2.5 text-center text-xs font-bold text-[#5F6F68]">Edit</th>
                                  <th className="px-4 py-2.5 text-center text-xs font-bold text-[#5F6F68]">Delete</th>
                                  <th className="px-4 py-2.5 text-center text-xs font-bold text-[#5F6F68]">Export</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#DCE8E3]">
                                {mods.map(m => (
                                  <tr key={m.module_key} className="hover:bg-[#F3F8F6]">
                                    <td className="px-4 py-2.5 text-sm font-bold text-[#0F1F1A]">{m.module_name}</td>
                                    {(['view', 'create', 'edit', 'delete', 'export'] as const).map(action => {
                                      const permId = (m as any)[`${action}_id`] as number | undefined
                                      const enabled = m[`can_${action}`]
                                      return (
                                        <td key={action} className="px-4 py-2.5 text-center">
                                          {permId ? (
                                            <button
                                              onClick={() => togglePermission(group, m.module_key, `can_${action}`)}
                                              disabled={selectedRole.role_key === 'super_admin'}
                                              title={selectedRole.role_key === 'super_admin' ? 'Super Admin has full access' : undefined}
                                              className={`rounded-lg p-1 transition ${
                                                enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                              } ${
                                                selectedRole.role_key === 'super_admin'
                                                  ? 'cursor-default'
                                                  : 'hover:ring-2 hover:ring-[#2FBF9B]/40'
                                              }`}
                                            >
                                              {enabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                            </button>
                                          ) : (
                                            <span className="text-xs text-[#DCE8E3]">—</span>
                                          )}
                                        </td>
                                      )
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex shrink-0 justify-end gap-2 border-t border-[#DCE8E3] px-6 py-4">
                <button
                  onClick={() => { setShowPermissionModal(false); setSelectedRole(null) }}
                  className="rounded-xl border border-[#DCE8E3] px-6 py-2.5 text-sm font-bold text-[#0F1F1A] hover:bg-[#F3F8F6]"
                >
                  {selectedRole.role_key === 'super_admin' ? 'Close' : 'Cancel'}
                </button>
                {selectedRole.role_key !== 'super_admin' && (
                  <button
                    onClick={handleUpdatePermissions}
                    disabled={submitting || permLoading}
                    className="rounded-xl bg-[#2FBF9B] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#167E68] disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Permissions'}
                  </button>
                )}
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
