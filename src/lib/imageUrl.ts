const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const BACKEND_ORIGIN = API_URL.replace('/api', '')

export function getImageUrl(image?: string | null, fallback = '/images/highlights/coffee.jpg') {
  if (!image) return fallback
  const img = String(image).trim()
  if (!img) return fallback
  if (img.startsWith('http://') || img.startsWith('https://')) return img
  if (img.startsWith('/uploads')) return `${BACKEND_ORIGIN}${img}`
  if (img.startsWith('uploads/')) return `${BACKEND_ORIGIN}/${img}`
  return img
}
