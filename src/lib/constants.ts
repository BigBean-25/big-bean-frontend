// API Constants
export const API_ENDPOINTS = {
  HOME_BANNERS: '/home-banners',
  MENU: '/menu',
  OUTLETS: '/outlets',
  OFFERS: '/offers',
  MERCHANDISE: '/merchandise',
  EVENTS: '/events',
  RESERVATIONS: '/reservations',
  FRANCHISE: '/franchise',
  CONTACT: '/contact',
  CORPORATE: '/corporate',
  BLOGS: '/blogs',
  GALLERY: '/gallery',
  CAREERS: '/careers',
  TESTIMONIALS: '/testimonials',
  SEO: '/seo',
  USERS: '/users',
  SETTINGS: '/settings',
  DASHBOARD: '/dashboard',
  AUTH: '/auth'
} as const

// Status Constants
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

// Role Constants
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff'
} as const

// File Upload Constants
export const UPLOAD_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  RESUME: 'resume'
} as const

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
} as const

// Store URL
export const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || 'https://bigbeancafe.store'
