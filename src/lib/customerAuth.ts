const TOKEN_KEY = 'bigbean_customer_token'
const CUSTOMER_KEY = 'bigbean_customer'

export interface Customer {
  id: number
  full_name: string
  email: string | null
  phone: string | null
  status: string
  last_login_at: string | null
  login_count: number
  date_of_birth?: string | null
  gender?: string | null
  created_at?: string
}

export function saveCustomerSession(token: string, customer: Customer) {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer))
  window.dispatchEvent(new Event('bigbean-customer-auth-updated'))
}

export function getCustomerToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getCustomer(): Customer | null {
  if (typeof window === 'undefined') return null
  try {
    const s = localStorage.getItem(CUSTOMER_KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export function clearCustomerSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CUSTOMER_KEY)
  window.dispatchEvent(new Event('bigbean-customer-auth-updated'))
}

export function isCustomerLoggedIn(): boolean {
  return !!getCustomerToken() && !!getCustomer()
}

export async function customerFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getCustomerToken()
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
}
