// API utility function with fallback URL
export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
}

const API_URL = getApiUrl()

// Common fetch wrapper without auth
export const apiFetch = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API fetch error for ${endpoint}:`, error)
    throw error
  }
}

// Admin authenticated fetch wrapper
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('admin_token') || localStorage.getItem('adminToken'))
    : null
  const isFormData = options.body instanceof FormData

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // 401 Unauthorized = invalid/expired token → clear session and redirect to login
  // 403 Forbidden    = valid token but no permission → do NOT clear or redirect
  if (response.status === 401 &&
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/admin') &&
      !window.location.pathname.includes('/admin/login')) {
    ;['admin_token','admin_user','admin_permissions','admin_menu_access',
      'adminToken','adminUser','adminPermissions','adminMenuAccess'].forEach(k =>
      localStorage.removeItem(k)
    )
    window.location.href = '/admin/login'
  }

  if (response.status === 403) {
    throw new Error('Access denied. You do not have permission.')
  }

  return response
}

export default apiRequest
