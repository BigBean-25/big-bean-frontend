import { getAdminToken, clearAdminAuthData } from '@/lib/adminPermissions'

// API utility for consistent backend API calls
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Use standardized admin_token key (fallback to legacy adminToken for compatibility)
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('admin_token') || localStorage.getItem('adminToken'))
    : null
  const isFormData = options.body instanceof FormData

  const headers: Record<string, string> = {
    // Don't set Content-Type for FormData — browser sets multipart boundary automatically
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Only 401 Unauthorized (invalid/expired token) should clear auth and redirect
  // 403 Forbidden (no permission) should NOT clear auth
  if (response.status === 401 &&
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/admin') &&
      !window.location.pathname.includes('/admin/login')) {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_permissions')
    localStorage.removeItem('admin_menu_access')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('adminPermissions')
    localStorage.removeItem('adminMenuAccess')
    window.location.href = '/admin/login'
  }

  return response
}

// Admin fetch wrapper — always sends Bearer token and returns parsed JSON.
// Redirects to /admin/login on 401.
export async function adminApiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken()
  const isFormData = options.body instanceof FormData

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  }

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers })

  if (res.status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.includes('/admin/login')) {
    clearAdminAuthData()
    window.location.href = '/admin/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }

  return res.json()
}

export default apiRequest
