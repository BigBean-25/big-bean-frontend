'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isCustomerLoggedIn } from '@/lib/customerAuth'

export default function WishlistRedirect() {
  const router = useRouter()

  useEffect(() => {
    if (isCustomerLoggedIn()) {
      router.replace('/customer/wishlist')
    } else {
      router.replace('/login?redirect=/customer/wishlist')
    }
  }, [router])

  return null
}
