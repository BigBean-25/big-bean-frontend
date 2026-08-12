'use client'

import { ShieldOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getFirstAllowedAdminRoute } from '@/lib/adminPermissions'

export default function AccessRestricted() {
  const router = useRouter()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50">
        <ShieldOff className="h-9 w-9 text-red-400" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-[#0F1F1A]">Access Restricted</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#5F6F68]">
          You don&apos;t have permission to access this section. Contact a Super Admin if you believe this is incorrect.
        </p>
      </div>
      <button
        onClick={() => router.push(getFirstAllowedAdminRoute())}
        className="rounded-2xl bg-[#2FBF9B] px-7 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#167E68] active:scale-95 transition-all"
      >
        Go to Allowed Page
      </button>
    </div>
  )
}
