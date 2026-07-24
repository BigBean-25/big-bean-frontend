// Admin Permission Helper Functions

// ── Standardized localStorage keys ──────────────────────────
export const ADMIN_TOKEN_KEY = 'admin_token'
export const ADMIN_USER_KEY = 'admin_user'
export const ADMIN_PERMISSIONS_KEY = 'admin_permissions'
export const ADMIN_MENU_ACCESS_KEY = 'admin_menu_access'

export const ADMIN_PERMISSION_MODULES = [
  { group: 'Main', modules: ['dashboard', 'notifications', 'reports', 'settings', 'site_settings', 'admin_users', 'roles_permissions', 'customers'] },
  { group: 'Website Content', modules: ['home_banners', 'about_hero', 'menu_hero', 'offers_hero', 'outlet_hero', 'reservation_hero', 'career_hero', 'corporate_hero', 'franchise_hero', 'gallery_hero', 'blog_hero', 'contact_hero'] },
  { group: 'Menu', modules: ['menu_items', 'menu_combos', 'categories'] },
  { group: 'Merchandise', modules: ['merchandise', 'merchandise_categories', 'merchandise_banners', 'merchandise_orders', 'merchandise_reviews'] },
  { group: 'Enquiries', modules: ['contact_enquiries', 'corporate_enquiries', 'franchise_enquiries', 'career_applications', 'career_jobs', 'reservations', 'support_tickets'] },
  { group: 'Marketing', modules: ['offers', 'blog_posts', 'blog', 'gallery', 'events', 'event_bookings', 'instagram_media', 'newsletter_subscribers', 'app_promos', 'testimonials', 'seo_pages', 'seo', 'legal_pages'] },
]

export const DATA_SCOPE_OPTIONS = [
  { value: 'all', label: 'All Data' },
  { value: 'assigned', label: 'Assigned Only' },
  { value: 'own', label: 'Own Created Only' },
]

export interface AdminUser {
  id: number
  name: string
  email: string
  role_id: number | null
  role_name: string | null
  role_key: string | null
  status: string
  is_super_admin?: boolean
}

export interface Permission {
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

// ── Storage helpers ──────────────────────────────────────────

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return (
    localStorage.getItem(ADMIN_TOKEN_KEY) ||
    localStorage.getItem('adminToken') ||
    null
  )
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null
  const userData =
    localStorage.getItem(ADMIN_USER_KEY) ||
    localStorage.getItem('adminUser')
  if (!userData) return null
  try { return JSON.parse(userData) } catch { return null }
}

export function getAdminPermissions(): Permission[] {
  if (typeof window === 'undefined') return []
  const perms =
    localStorage.getItem(ADMIN_PERMISSIONS_KEY) ||
    localStorage.getItem('adminPermissions')
  if (!perms) return []
  try { return JSON.parse(perms) } catch { return [] }
}

export function getAdminMenuAccess(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  const menuAccess =
    localStorage.getItem(ADMIN_MENU_ACCESS_KEY) ||
    localStorage.getItem('adminMenuAccess')
  if (!menuAccess) return {}
  try { return JSON.parse(menuAccess) } catch { return {} }
}

export function saveAdminAuthData(
  token: string,
  user: AdminUser,
  permissions: Permission[] = [],
  menuAccess: Record<string, boolean> = {}
) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user))
  localStorage.setItem(ADMIN_PERMISSIONS_KEY, JSON.stringify(permissions))
  localStorage.setItem(ADMIN_MENU_ACCESS_KEY, JSON.stringify(menuAccess))
  // Clean up legacy keys
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
  localStorage.removeItem('adminPermissions')
  localStorage.removeItem('adminMenuAccess')
}

export function clearAdminAuthData() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  localStorage.removeItem(ADMIN_USER_KEY)
  localStorage.removeItem(ADMIN_PERMISSIONS_KEY)
  localStorage.removeItem(ADMIN_MENU_ACCESS_KEY)
  // Also clear legacy keys
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
  localStorage.removeItem('adminPermissions')
  localStorage.removeItem('adminMenuAccess')
}

// ── Permission checks ────────────────────────────────────────

export function isSuperAdmin(): boolean {
  const user = getAdminUser()
  return user?.role_key === 'super_admin' || user?.is_super_admin === true
}

export function hasPermission(
  moduleKey: string,
  action: 'view' | 'create' | 'edit' | 'delete' | 'export'
): boolean {
  if (isSuperAdmin()) return true
  const permissions = getAdminPermissions()
  const permissionKey = `${moduleKey}.${action}`
  const permission = permissions.find(p => p.permission_key === permissionKey)
  if (!permission) return false
  switch (action) {
    case 'view':   return !!permission.can_view
    case 'create': return !!permission.can_create
    case 'edit':   return !!permission.can_edit
    case 'delete': return !!permission.can_delete
    case 'export': return !!permission.can_export
    default:       return false
  }
}

export function hasAnyPermission(permissionKeys: string[]): boolean {
  if (isSuperAdmin()) return true
  for (const permKey of permissionKeys) {
    const [moduleKey, action] = permKey.split('.') as [string, 'view' | 'create' | 'edit' | 'delete' | 'export']
    if (hasPermission(moduleKey, action)) return true
  }
  return false
}

// ── Route access ──────────────────────────────────────────────

const ROUTE_MODULE_MAP: Record<string, string> = {
  '/admin/dashboard':                  'dashboard',
  '/admin/notifications':              'notifications',
  '/admin/reports':                    'reports',
  '/admin/settings':                   'settings',
  '/admin/users':                      'admin_users',
  '/admin/roles':                      'roles_permissions',
  '/admin/customers':                  'customers',

  // Hero banners
  '/admin/home-banners':               'home_banners',
  '/admin/about-hero':                 'about_hero',
  '/admin/menu-hero':                  'menu_hero',
  '/admin/offers-hero':                'offers_hero',
  '/admin/outlet-hero':                'outlet_hero',
  '/admin/reservation-hero':           'reservation_hero',
  '/admin/career-hero':                'career_hero',
  '/admin/corporate-hero':             'corporate_hero',
  '/admin/franchise-hero':             'franchise_hero',
  '/admin/gallery-hero':               'gallery_hero',
  '/admin/blog-hero':                  'blog_hero',
  '/admin/contact-hero':               'contact_hero',
  '/admin/events-hero':                'events',

  // Menu
  '/admin/menu-categories':            'menu_categories',
  '/admin/menu-combos':                'menu_combos',
  '/admin/menu':                       'menu_items',

  // Merchandise
  '/admin/merchandise-categories':     'merchandise_categories',
  '/admin/merchandise-banners':        'merchandise_banners',
  '/admin/merchandise-orders':         'merchandise_orders',
  '/admin/merchandise-reviews':        'merchandise_reviews',
  '/admin/merchandise':                'merchandise',

  // Enquiries — must match actual page paths exactly
  '/admin/contact-enquiries':          'contact_enquiries',
  '/admin/corporate-enquiries':        'corporate_enquiries',
  '/admin/franchise-enquiries':        'franchise_enquiries',
  '/admin/career-applications':        'career_applications',
  '/admin/career-jobs':                'career_jobs',

  // Business
  '/admin/reservations':               'reservations',
  '/admin/support-tickets':            'support_tickets',
  '/admin/corporate-orders':           'corporate_orders',
  '/admin/outlets':                    'outlets',

  // Content
  '/admin/offers':                     'offers',
  '/admin/blogs':                      'blog',
  '/admin/blog':                       'blog',
  '/admin/gallery':                    'gallery',
  '/admin/events':                     'events',
  '/admin/event-bookings':             'event_bookings',
  '/admin/event-checkin':              'event_bookings',
  '/admin/event-message-templates':    'event_bookings',
  '/admin/instagram-media':            'instagram_media',
  '/admin/newsletter-subscribers':     'newsletter_subscribers',
  '/admin/app-promos':                 'app_promos',
  '/admin/testimonials':               'testimonials',
  '/admin/seo':                        'seo_pages',
  '/admin/seo/settings':               'seo_pages',
  '/admin/legal-pages':                'legal_pages',
  '/admin/site-settings':              'site_settings',
}

export function canAccessRoute(pathname: string): boolean {
  if (isSuperAdmin()) return true
  // Sort by length descending so more specific paths match first
  const routes = Object.keys(ROUTE_MODULE_MAP).sort((a, b) => b.length - a.length)
  for (const route of routes) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return hasPermission(ROUTE_MODULE_MAP[route], 'view')
    }
  }
  // Route not in the map — allow by default to prevent false Access Denied screens
  return true
}

export function filterMenuByPermissions(menuGroups: any[]): any[] {
  if (isSuperAdmin()) return menuGroups
  return menuGroups
    .map(group => ({
      ...group,
      items: group.items.filter((item: any) => {
        const moduleKey = ROUTE_MODULE_MAP[item.href] || ''
        if (!moduleKey) return true
        return hasPermission(moduleKey, item.action || 'view')
      })
    }))
    .filter(group => group.items.length > 0)
}
