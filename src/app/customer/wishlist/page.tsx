'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import CustomerSidebar from '@/components/customer/CustomerSidebar'
import CustomerToast, { ToastData } from '@/components/customer/CustomerToast'
import { isCustomerLoggedIn, customerFetch } from '@/lib/customerAuth'
import { Heart, Trash2, RefreshCw, ShoppingBag, ExternalLink } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')
type WItem = Record<string, string | number | null>

function getImg(img: string | number | null): string | null {
  if (!img) return null
  const s = String(img).trim()
  if (s.startsWith('http')) return s
  return `${API_BASE}/${s.replace(/^\/+/, '')}`
}

export default function CustomerWishlist() {
  const router = useRouter()
  const [items, setItems]         = useState<WItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [toast, setToast]         = useState<ToastData | null>(null)

  const load = useCallback(async () => {
    try {
      const r = await customerFetch(`${API_URL}/customer-dashboard/wishlist`)
      const d = await r.json()
      if (d.success) setItems(d.data || [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!isCustomerLoggedIn()) { router.push('/login'); return }
    load()
  }, [router, load])

  const remove = async (mid: number) => {
    setRemovingId(mid)
    try {
      await customerFetch(`${API_URL}/customer-dashboard/wishlist/${mid}`, { method:'DELETE' })
      setItems(prev => prev.filter(i => i.merchandise_id !== mid))
      setToast({ msg: 'Removed from wishlist', type: 'success' })
    } finally { setRemovingId(null) }
  }

  return (
    <div className="min-h-screen bg-[#FFF7ED]">
      <Header />
      <CustomerToast toast={toast} onClose={() => setToast(null)} />
      <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <CustomerSidebar />
          <div className="flex-1 min-w-0 space-y-5">

            <div className="flex items-center justify-between rounded-2xl border border-[#E6C7A8] bg-white px-6 py-4 shadow-sm">
              <div>
                <h1 className="text-xl font-black text-[#3D1F0D]">My Wishlist</h1>
                <p className="text-xs text-[#7A5A48] mt-0.5">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
              </div>
              <Link href="/merchandise"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E6C7A8] text-sm font-bold text-[#3D1F0D] hover:border-[#C9943A] hover:bg-[#FFF7ED] transition">
                <ShoppingBag className="w-4 h-4 text-[#C9943A]" /> Browse More
              </Link>
            </div>

            {loading ? (
              <div className="py-20 text-center"><RefreshCw className="w-8 h-8 mx-auto text-[#C9943A] animate-spin" /></div>
            ) : !items.length ? (
              <div className="rounded-2xl border border-[#E6C7A8] bg-white py-16 text-center shadow-sm">
                <Heart className="h-14 w-14 mx-auto text-[#E6C7A8] mb-3" />
                <p className="font-black text-[#3D1F0D]">Your wishlist is empty</p>
                <p className="text-sm text-[#7A5A48] mt-1">Save products you love for later.</p>
                <Link href="/merchandise"
                  className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3D1F0D] text-sm font-black text-[#FFF7ED] hover:bg-[#C9943A] hover:text-[#120905] transition">
                  <ShoppingBag className="w-4 h-4" /> Browse Merchandise
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, i) => {
                  const imgUrl = getImg(item.image || item.product_image || item.thumbnail || null)
                  const price = item.price ? Number(item.price) : null
                  const slug = item.slug || item.merchandise_id
                  return (
                    <div key={i} className="group rounded-2xl border border-[#E6C7A8] bg-white shadow-sm hover:shadow-md hover:border-[#C9943A] transition-all overflow-hidden">
                      {/* Image */}
                      <div className="relative h-44 bg-[#FFF7ED] flex items-center justify-center overflow-hidden">
                        {imgUrl ? (
                          <Image src={imgUrl} alt={String(item.name || 'Product')} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:640px) 100vw, 33vw" />
                        ) : (
                          <ShoppingBag className="w-12 h-12 text-[#E6C7A8]" />
                        )}
                        <button onClick={() => remove(item.merchandise_id as number)} disabled={removingId === item.merchandise_id}
                          title="Remove from wishlist"
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-white transition disabled:opacity-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <p className="font-black text-[#3D1F0D] leading-tight line-clamp-2">{String(item.name || `Product #${item.merchandise_id}`)}</p>
                        {price !== null && (
                          <p className="mt-1 text-lg font-black text-[#C9943A]">₹{price.toLocaleString('en-IN')}</p>
                        )}
                        {item.stock_quantity !== undefined && (
                          <p className={`text-xs font-semibold mt-0.5 ${Number(item.stock_quantity) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {Number(item.stock_quantity) > 0 ? `In Stock (${item.stock_quantity})` : 'Out of Stock'}
                          </p>
                        )}
                        <div className="mt-3 flex gap-2">
                          <Link href={`/merchandise/${slug}`}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#3D1F0D] py-2 text-xs font-black text-[#FFF7ED] hover:bg-[#C9943A] hover:text-[#120905] transition">
                            <ExternalLink className="w-3.5 h-3.5" /> View Product
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
