'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isCustomerLoggedIn } from '@/lib/customerAuth'

export default function OrdersRedirect() {
  const router = useRouter()

  useEffect(() => {
    if (isCustomerLoggedIn()) {
      router.replace('/customer/orders')
    } else {
      router.replace('/login?redirect=/customer/orders')
    }
  }, [router])

  return null
}
