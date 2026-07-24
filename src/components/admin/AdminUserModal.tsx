'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
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
}

const DESIGNATIONS = [
  'Store Manager',
  'Event Host',
  'Marketing',
  'Support',
  'Accounts',
  'Custom Admin'
]

const PRESETS: Record<string, any> = {
  'Event Host': {
    permissions: { dashboard: ['view'], notifications: ['view'], events: ['view', 'create', 'edit'], reservations: ['view', 'edit'] },
    data_scope: { events: 'assigned', reservations: 'assigned' }
  },
  'Store Manager': {
    permissions: { dashboard: ['view'], notifications: ['view'], merchandise: ['view', 'create', 'edit'], merchandise_orders: ['view', 'edit', 'export'], reservations: ['view', 'edit'] },
    data_scope: { merchandise_orders: 'all', reservations: 'assigned' }
  },
  'Marketing': {
    permissions: { dashboard: ['view'], notifications: ['view'], offers: ['view', 'create', 'edit'], blog: ['view', 'create', 'edit'], events: ['view', 'create', 'edit'], instagram_media: ['view', 'edit'], newsletter_subscribers: ['view', 'create', 'edit'], app_promos: ['view', 'create', 'edit'], testimonials: ['view', 'create', 'edit'], seo: ['view', 'create', 'edit'], seo_pages: ['view', 'create', 'edit'], legal_pages: ['view', 'create', 'edit'] },
    data_scope: {}
  },
  'Support': {
    permissions: { dashboard: ['view'], notifications: ['view'], support_tickets: ['view', 'create', 'edit'], contact_enquiries: ['view', 'edit'], corporate_enquiries: ['view', 'edit'], franchise_enquiries: ['view', 'edit'] },
    data_scope: { support_tickets: 'assigned', contact_enquiries: 'assigned', corporate_enquiries: 'assigned', franchise_enquiries: 'assigned' }
  },
  'Accounts': {
    permissions: { dashboard: ['view'], reports: ['view', 'export'], merchandise_orders: ['view', 'edit', 'export'], corporate_orders: ['view', 'export'] },
    data_scope: { merchandise_orders: 'all' }
  },
  'View Only': {
    permissions: { dashboard: ['view'], notifications: ['view'] },
    data_scope: {}
  }
}

export default function AdminUserModal({ isOpen, onClose, user, onSaved }: AdminUserModalProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [userPermissions, setUserPermissions] = useState<Record<string, Permission>>({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    designation: '',
    status: 'active'
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  const isEdit = !!user
  const isSuperAdminUser = user?.role_key === 'super_admin' || user?.is_super_admin

  useEffect(() => {
    if (!isOpen) return
    fetchAllPermissions()
  }, [isOpen])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        confirm_password: '',
        designation: user.designation || '',
        status: user.status || 'active'
      })
      if (user.id) fetchUserPermissions(user.id)
    } else {
      setFormData({ name: '', email: '', phone: '', password: '', confirm_password: '', designation: '', status: 'active' })
      setUserPermissions({})
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

  const applyPreset = (presetName: string) => {
    if (isSuperAdminUser) return
    const preset = PRESETS[presetName]
    if (!preset) return
    const newMap: Record<string, Permission> = {}
    allPermissions.forEach(p => {
      const actions = preset.permissions[p.module_key] || []
      newMap[p.module_key] = {
        id: p.id,
        module_key: p.module_key,
        module_name: p.module_name,
        permission_key: p.permission_key,
        permission_name: p.permission_name,
        can_view: actions.includes('view'),
        can_create: actions.includes('create'),
        can_edit: actions.includes('edit'),
        can_delete: actions.includes('delete'),
        can_export: actions.includes('export'),
        data_scope: preset.data_scope[p.module_key] || 'assigned'
      }
    })
    setUserPermissions(newMap)
  }

  const clearAll = () => {
    if (isSuperAdminUser) return
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
      alert('Password is required')
      return
    }
    if (formData.password && formData.password !== formData.confirm_password) {
      alert('Passwords do not match')
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
      alert(err.message || 'Failed to save user')
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
                  <label className="mb-1 block text-xs font-bold text-[#5F6F68]">Designation / Access Label</label>
                  <select value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} className="w-full rounded-xl border border-[#DCE8E3] px-4 py-2.5 text-sm outline-none focus:border-[#2FBF9B]">
                    <option value="">Select Designation</option>
                    {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
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
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-bold text-[#5F6F68]">Presets:</span>
                    {Object.keys(PRESETS).map(preset => (
                      <button key={preset} type="button" onClick={() => applyPreset(preset)} className="rounded-full bg-[#EAF8F3] px-3 py-1 text-xs font-bold text-[#167E68] hover:bg-[#2FBF9B] hover:text-white">
                        {preset}
                      </button>
                    ))}
                    <button type="button" onClick={clearAll} className="rounded-full bg-[#FDE8E8] px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white">
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
