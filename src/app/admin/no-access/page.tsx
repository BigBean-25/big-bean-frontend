'use client'

import { ShieldOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { clearAdminAuthData } from '@/lib/adminPermissions'

export default function NoAccessPage() {
  const router = useRouter()

  const handleLogout = () => {
    clearAdminAuthData()
    router.replace('/admin/login')
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-50">
        <ShieldOff className="h-11 w-11 text-amber-400" />
      </div>
      <div className="max-w-md">
        <h1 className="text-3xl font-black text-[#0F1F1A]">No Modules Assigned</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#5F6F68]">
          No admin modules have been assigned to your account.
          Please contact a Super Admin to configure your permissions.
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="rounded-2xl bg-red-600 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition-all"
      >
        Logout
      </button>
    </div>
  )
}
