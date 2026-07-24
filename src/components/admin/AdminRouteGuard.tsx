'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ShieldOff } from 'lucide-react'
import {
  getAdminToken, isSuperAdmin, canAccessRoute, hasPermission
} from '@/lib/adminPermissions'

interface AdminRouteGuardProps {
  children: React.ReactNode
  requiredPermission?: { module: string; action: 'view' | 'create' | 'edit' | 'delete' | 'export' }
}

export default function AdminRouteGuard({ children, requiredPermission }: AdminRouteGuardProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading')

  useEffect(() => {
    const token = getAdminToken()

    // No token — let the layout handle the redirect to login
    if (!token) {
      router.replace('/admin/login')
      return
    }

    // Super Admin bypasses all permission checks
    if (isSuperAdmin()) {
      setStatus('allowed')
      return
    }

    // Check route-level access
    if (!canAccessRoute(pathname)) {
      setStatus('denied')
      return
    }

    // Check specific permission if required
    if (requiredPermission) {
      const { module, action } = requiredPermission
      if (!hasPermission(module, action)) {
        setStatus('denied')
        return
      }
    }

    setStatus('allowed')
  }, [pathname, requiredPermission, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2FBF9B] border-t-transparent" />
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <ShieldOff className="h-8 w-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#0F1F1A]">Access Denied</h2>
          <p className="mt-1 text-sm text-[#5F6F68]">
            You do not have permission to access this page.
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="rounded-xl bg-[#2FBF9B] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#167E68]"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return <>{children}</>
}
