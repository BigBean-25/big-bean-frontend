'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiRequest } from '@/lib/api'
import PopupForm from '../../PopupForm'

export default function EditPopupPage() {
  const params = useParams()
  const id = Number(params.id)

  const [data,    setData]    = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!id) return
    apiRequest(`/admin/website-popups/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.data)
        else setError(d.message || 'Failed to load popup')
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="py-20 text-center text-sm text-[#9DB0A1]">Loading popup…</div>
  if (error)   return <div className="py-20 text-center text-sm text-red-500">{error}</div>
  if (!data)   return <div className="py-20 text-center text-sm text-[#9DB0A1]">Popup not found.</div>

  return <PopupForm mode="edit" initialData={data} popupId={id} />
}
