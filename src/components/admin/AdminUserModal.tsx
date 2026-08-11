'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiRequest } from '@/lib/api'
import { isSuperAdmin, ADMIN_PERMISSION_MODULES, DATA_SCOPE_OPTIONS } from '@/lib/adminPermissions'

interface Permission {
  id: number
  module_key: string
  module_name: string
  permission_key: string
  permission_name: string
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
  can_export: boolean
  data_scope: 'all' | 'assigned' | 'own'
}

interface AdminUserModalProps {
  isOpen: boolean
  onClose: () => void
  user?: any | null
  onSaved: () => void
  mode?: 'edit' | 'permissions'
}

interface Role {
  id: number
  role_name: string
  role_key: string
  is_active: number
}

export default function AdminUserModal({ isOpen, onClose, user, onSaved, mode = 'edit' }: AdminUserModalProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [userPermissions, setUserPermissions] = useState<Record<string, Permission>>({})
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [rolesError, setRolesError] = useState(false)
  const [activePresetId, setActivePresetId] = useState<number | null>(null)
  const [formData, setFormData] = useState<{
    name: string; email: string; phone: string; password: string
    confirm_password: string; role_id: number | null; status: string
  }>({ name: '', email: '', phone: '', password: '', confirm_password: '', role_id: null, status: 'active' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  const isEdit = !!user
  const isSuperAdminUser = user?.role_key === 'super_admin' || user?.is_super_admin

  useEffect(() => {
    if (!isOpen) return
    setActiveTab(mode === 'permissions' ? 'permissions' : 'basic')
    fetchAllPermissions()
    fetchRoles()
  }, [isOpen, mode])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        confirm_password: '',
        role_id: user.role_id || null,
        status: user.status || 'active'
      })
      setActivePresetId(user.role_id || null)
      if (user.id) fetchUserPermissions(user.id)
    } else {
      setFormData({ name: '', email: '', phone: '', password: '', confirm_password: '', role_id: null, status: 'active' })
      setUserPermissions({})
      setActivePresetId(null)
    }
  }, [user])

  const fetchAllPermissions = async () => {
    setFetching(true)
    try {
      const res = await apiRequest('/admin-permissions')
      if (res.ok) {
        const data = await res.json()
        setAllPermissions(data.data || [])
      }
    } catch (err) {
      console.error('Fetch permissions error:', err)
    } finally {
      setFetching(false)
    }
  }

  const fetchRoles = async () => {
    setRolesLoading(true)
    setRolesError(false)
    try {
      const res = await apiRequest('/admin-roles')
      if (!res.ok) throw new Error()
      const data = await res.json()
      const all: Role[] = data.data || []
      setRoles(all.filter(r => r.is_active === 1 && (isSuperAdmin() || r.role_key !== 'super_admin')))
    } catch {
      setRolesError(true)
    } finally {
      setRolesLoading(false)
    }
  }

  const applyRolePreset = async (roleId: number) => {
    if (isSuperAdminUser) return
    setActivePresetId(roleId)
    try {
      const res = await apiRequest(`/admin-roles/${roleId}/permissions`)
      if (!res.ok) return
      const data = await res.json()
      const newMap: Record<string, Permission> = {}
      allPermissions.forEach(p => {
        newMap[p.module_key] = { ...p, can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, data_scope: 'assigned' }
      })
      ;(data.data || []).forEach((rp: any) => {
        if (newMap[rp.module_key]) {
          newMap[rp.module_key] = {
            ...newMap[rp.module_key],
            can_view: !!rp.can_view,
            can_create: !!rp.can_create,
            can_edit: !!rp.can_edit,
            can_delete: !!rp.can_delete,
            can_export: !!rp.can_export,
            data_scope: rp.data_scope || 'assigned'
          }
        }
      })
      setUserPermissions(newMap)
    } catch (err) {
      console.error('Apply role preset error:', err)
    }
  }

  const handleRoleSelect = (roleId: number | null) => {
    setFormData(prev => ({ ...prev, role_id: roleId }))
    if (roleId) applyRolePreset(roleId)
    else setActivePresetId(null)
  }

  const fetchUserPermissions = async (userId: number) => {
    setFetching(true)
    try {
      const res = await apiRequest(`/admin-users/${userId}`)
      if (res.ok) {
        const data = await res.json()
        const map: Record<string, Permission> = {}
        ;(data.data.permissions || []).forEach((p: any) => {
          const existing = map[p.module_key] || { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, data_scope: 'assigned' }
          map[p.module_key] = {
            id: p.id,
            module_key: p.module_key,
            module_name: p.module_name,
            permission_key: p.permission_key,
            permission_name: p.permission_name,
            can_view: existing.can_view || !!p.can_view,
            can_create: existing.can_create || !!p.can_create,
            can_edit: existing.can_edit || !!p.can_edit,
            can_delete: existing.can_delete || !!p.can_delete,
            can_export: existing.can_export || !!p.can_export,
            data_scope: p.can_view ? (p.data_scope || 'assigned') : existing.data_scope
          }
        })
        setUserPermissions(map)
      }
    } catch (err) {
      console.error('Fetch user permissions error:', err)
    } finally {
      setFetching(false)
    }
  }

  const getPermission = (moduleKey: string): Permission => {
    const base = allPermissions.find(p => p.module_key === moduleKey)
    if (userPermissions[moduleKey]) return userPermissions[moduleKey]
    return {
      id: base?.id || 0,
      module_key: moduleKey,
      module_name: base?.module_name || moduleKey,
      permission_key: `${moduleKey}.view`,
      permission_name: base?.module_name || moduleKey,
      can_view: false,
      can_create: false,
      can_edit: false,
      can_delete: false,
      can_export: false,
      data_scope: 'assigned'
    }
  }

  const updatePermission = (moduleKey: string, field: keyof Permission, value: any) => {
    setUserPermissions(prev => {
      const current = prev[moduleKey] || getPermission(moduleKey)
      return {
        ...prev,
        [moduleKey]: { ...current, [field]: value } as Permission
      }
    })
  }

  const clearAll = () => {
    if (isSuperAdminUser) return
    setActivePresetId(null)
    const newMap: Record<string, Permission> = {}
    allPermissions.forEach(p => {
      newMap[p.module_key] = {
        id: p.id,
        module_key: p.module_key,
        module_name: p.module_name,
        permission_key: p.permission_key,
        permission_name: p.permission_name,
        can_view: false,
        can_create: false,
        can_edit: false,
        can_delete: false,
        can_export: false,
        data_scope: 'assigned'
      }
    })
    setUserPermissions(newMap)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.password && !isEdit) {
      toast.error('Password is required')
      return
    }
    if (formData.password && formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const permissions = allPermissions.map((p: any) => {
        const action = p.permission_key.split('.').pop() as 'view' | 'create' | 'edit' | 'delete' | 'export'
        const userPerm = userPermissions[p.module_key]
        const isAction = action === 'view' || action === 'create' || action === 'edit' || action === 'delete' || action === 'export'
        const canAction = isAction ? userPerm?.[`can_${action}`] === true : false
        return {
          permission_id: p.id,
          module_key: p.module_key,
          can_view: action === 'view' ? (userPerm?.can_view ? 1 : 0) : (canAction ? 0 : 0),
          can_create: action === 'create' ? (canAction ? 1 : 0) : 0,
          can_edit: action === 'edit' ? (canAction ? 1 : 0) : 0,
          can_delete: action === 'delete' ? (canAction ? 1 : 0) : 0,
          can_export: action === 'export' ? (canAction ? 1 : 0) : 0,
          data_scope: userPerm?.data_scope || 'assigned'
        }
      })

      const payload = { ...formData, permissions }

      const res = await apiRequest(`/admin-users${isEdit ? `/${user.id}` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to save user')
      }

      onSaved()
      onClose()
      setActiveTab('basic')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save user')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-[#DCE8E3] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#DCE8E3] px-6 py-4">
          <h2 className="text-xl font-black text-[#0F1F1A]">{isEdit ? 'Edit Admin User' : 'Add Admin User'}</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-[#F3F8F6]">
            <X className="h-5 w-5 text-[#5F6F68]" />
          </button>
        </div>

        <div className="flex border-b border-[#DCE8E3]">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-3 text-sm font-bold ${activeTab === 'basic' ? 'border-b-2 border-[#2FBF9B] text-[#2FBF9B]' : 'text-[#5F6F68]'}`}
          >
            Basic Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`px-6 py-3 text-sm font-bold ${activeTab === 'permissions' ? 'border-b-2 border-[#2FBF9B] text-[#2FBF9B]' : 'text-[#5F6F68]'}`}
          >
            Permissions
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'basic' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-[#5F6F68]">Name</label>
                  <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm outline-none focus:border-[#2FBF9B]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#5F6F68]">Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm outline-none focus:border-[#2FBF9B]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#5F6F68]">Phone</label>
                  <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm outline-none focus:border-[#2FBF9B]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#5F6F68]">Password {isEdit && '(leave blank to keep)'}</label>
                  <input type="password" required={!isEdit} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm outline-none focus:border-[#2FBF9B]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#5F6F68]">Confirm Password {isEdit && '(leave blank to keep)'}</label>
                  <input type="password" required={!isEdit} value={formData.confirm_password} onChange={e => setFormData({ ...formData, confirm_password: e.target.value })} className="w-full rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm outline-none focus:border-[#2FBF9B]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#5F6F68]">Admin Role</label>
                  <p className="mb-1.5 text-xs text-[#9CB3AC]">Select a permission preset for this admin user.</p>
                  {rolesLoading ? (
                    <div className="flex h-10 items-center rounded-xl border border-[#DCE8E3] px-4 text-sm text-[#9CB3AC]">Loading roles…</div>
                  ) : rolesError ? (
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-500">
                      Unable to load admin roles.
                      <button type="button" onClick={fetchRoles} className="font-bold underline hover:no-underline">Retry</button>
                    </div>
                  ) : (
                    <select
                      value={formData.role_id ?? ''}
                      onChange={e => handleRoleSelect(e.target.value ? Number(e.target.value) : null)}
                      className="w-full rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm outline-none focus:border-[#2FBF9B]"
                    >
                      <option value="">— No role assigned —</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.role_name}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#5F6F68]">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm outline-none focus:border-[#2FBF9B]">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {!isSuperAdminUser && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#5F6F68]">Presets:</span>
                    {rolesLoading && <span className="text-xs text-[#9CB3AC]">Loading…</span>}
                    {!rolesLoading && roles.filter(r => r.role_key !== 'super_admin').map(role => {
                      const isActive = activePresetId === role.id
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => applyRolePreset(role.id)}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition ${
                            isActive
                              ? 'bg-[#2FBF9B] text-white shadow-sm'
                              : 'bg-[#EAF8F3] text-[#167E68] hover:bg-[#2FBF9B] hover:text-white'
                          }`}
                        >
                          {isActive && <span>✓</span>}{role.role_name}
                        </button>
                      )
                    })}
                    {!rolesLoading && roles.filter(r => r.role_key !== 'super_admin').length === 0 && (
                      <span className="text-xs text-[#9CB3AC]">No presets available</span>
                    )}
                    <button type="button" onClick={clearAll} className="ml-auto rounded-full bg-[#FDE8E8] px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white">
                      Clear All
                    </button>
                  </div>
                )}

                {isSuperAdminUser && (
                  <div className="rounded-xl bg-[#EAF8F3] p-4 text-sm font-bold text-[#167E68]">
                    Super Admin has full access. Permissions cannot be edited.
                  </div>
                )}

                {fetching ? (
                  <div className="text-center text-sm text-[#5F6F68]">Loading permissions...</div>
                ) : (
                  ADMIN_PERMISSION_MODULES.map(group => (
                    <div key={group.group}>
                      <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-[#0F1F1A]">{group.group}</h3>
                      <div className="overflow-hidden rounded-xl border border-[#DCE8E3]">
                        <table className="w-full text-sm">
                          <thead className="bg-[#F3F8F6]">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-bold text-[#5F6F68]">Module</th>
                              <th className="px-2 py-2 text-center text-xs font-bold text-[#5F6F68]">View</th>
                              <th className="px-2 py-2 text-center text-xs font-bold text-[#5F6F68]">Create</th>
                              <th className="px-2 py-2 text-center text-xs font-bold text-[#5F6F68]">Edit</th>
                              <th className="px-2 py-2 text-center text-xs font-bold text-[#5F6F68]">Delete</th>
                              <th className="px-2 py-2 text-center text-xs font-bold text-[#5F6F68]">Export</th>
                              <th className="px-4 py-2 text-left text-xs font-bold text-[#5F6F68]">Data Scope</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#DCE8E3]">
                            {group.modules.map(moduleKey => {
                              const perm = getPermission(moduleKey)
                              const disabled = isSuperAdminUser
                              return (
                                <tr key={moduleKey} className="hover:bg-[#F9FDFB]">
                                  <td className="px-4 py-2 font-bold text-[#0F1F1A]">{perm.module_name}</td>
                                  {(['view', 'create', 'edit', 'delete', 'export'] as const).map(action => (
                                    <td key={action} className="px-2 py-2 text-center">
                                      <input
                                        type="checkbox"
                                        checked={perm[`can_${action}` as keyof Permission] as boolean}
                                        disabled={disabled}
                                        onChange={e => updatePermission(moduleKey, `can_${action}` as keyof Permission, e.target.checked)}
                                        className="h-4 w-4 accent-[#2FBF9B]"
                                      />
                                    </td>
                                  ))}
                                  <td className="px-4 py-2">
                                    <select
                                      value={perm.data_scope}
                                      disabled={disabled || !perm.can_view}
                                      onChange={e => updatePermission(moduleKey, 'data_scope', e.target.value)}
                                      className="rounded-lg border border-[#DCE8E3] px-2 py-1 text-xs outline-none focus:border-[#2FBF9B]"
                                    >
                                      {DATA_SCOPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-[#DCE8E3] px-6 py-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-[#DCE8E3] px-5 py-2.5 text-sm font-bold text-[#0F1F1A] hover:bg-[#F3F8F6]">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-xl bg-[#2FBF9B] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#167E68] disabled:opacity-50">
              {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
