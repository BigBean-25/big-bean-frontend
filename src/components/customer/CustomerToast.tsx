'use client'

import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error'
export interface ToastData { msg: string; type: ToastType }

interface Props { toast: ToastData | null; onClose: () => void }

export default function CustomerToast({ toast, onClose }: Props) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 4500)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null

  return (
    <div className={`fixed bottom-6 right-4 z-[200] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border max-w-sm w-[calc(100vw-2rem)] sm:w-auto transition-all
      ${toast.type === 'success'
        ? 'bg-green-50 border-green-200 text-green-800'
        : 'bg-red-50 border-red-200 text-red-800'}`}>
      {toast.type === 'success'
        ? <CheckCircle className="w-5 h-5 shrink-0 text-green-600 mt-0.5" />
        : <XCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />}
      <p className="text-sm font-semibold flex-1">{toast.msg}</p>
      <button onClick={onClose} className="shrink-0 text-gray-400 hover:text-gray-600 transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
