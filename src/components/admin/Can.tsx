'use client'

import { isSuperAdmin, hasPermission } from '@/lib/adminPermissions'

interface CanProps {
  module: string
  action: 'view' | 'create' | 'edit' | 'delete' | 'export'
  children?: React.ReactNode
  fallback?: React.ReactNode
}

export default function Can({ module, action, children, fallback = null }: CanProps) {
  if (isSuperAdmin() || hasPermission(module, action)) {
    return <>{children}</>
  }
  return <>{fallback}</>
}
