'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, RefreshCw } from 'lucide-react'

export default function AdminDateTime() {
  const router = useRouter()
  const [now, setNow] = useState<Date | null>(null)
  const [spinning, setSpinning] = useState(false)

  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setSpinning(true)
    // Try soft Next.js data refresh first, then reload the route as fallback.
    try {
      router.refresh()
    } catch {
      // ignore
    }
    window.location.reload()
  }

  if (!now) return null

  const day = now.toLocaleDateString('en-GB', { weekday: 'long' })
  const date = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <div className="hidden items-center gap-2 rounded-full border border-[#EAE2D6] bg-[#F8F5EF] px-3 py-1.5 text-sm text-[#4A3B2C] md:flex">
        <Calendar className="h-3.5 w-3.5 text-[#8B4A2F]" />
        <span className="hidden font-semibold lg:inline">{day}, {date}</span>
        <span className="font-semibold lg:hidden">{date}</span>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-[#EAE2D6] bg-[#F8F5EF] px-3 py-1.5 text-sm text-[#4A3B2C]">
        <Clock className="h-3.5 w-3.5 text-[#C9943A]" />
        <span className="font-semibold tabular-nums">{time}</span>
      </div>

      <button
        type="button"
        onClick={handleRefresh}
        title="Refresh page"
        className="rounded-full border border-[#EAE2D6] bg-[#F8F5EF] p-2 text-[#8A7B6C] hover:bg-[#FDF1DC] hover:text-[#8B4A2F]"
      >
        <RefreshCw className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
      </button>

      <div className="hidden items-center gap-1.5 rounded-full border border-[#EAE2D6] bg-[#F8F5EF] px-3 py-1.5 text-xs font-bold text-[#167E68] sm:flex">
        <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
        Live
      </div>
    </div>
  )
}
