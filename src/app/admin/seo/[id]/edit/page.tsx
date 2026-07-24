'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import SeoForm from '../../SeoForm'
import { adminApiFetch } from '@/utils/api'

export default function EditSeoPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<Parameters<typeof SeoForm>[0]['initialData'] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    adminApiFetch(`/seo-pages/${id}`)
      .then(j => { if (j.success) setData({ ...j.data, id: Number(id) }) })
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-center text-sm text-[#9CB3AC]">Loading…</div>
  if (!data)   return <div className="p-8 text-center text-sm text-red-500">Page not found.</div>
  return <SeoForm mode="edit" initialData={data} />
}
