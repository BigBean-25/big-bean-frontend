'use client'

const ORDER_STATUS: Record<string, { label: string; cls: string; dot: string }> = {
  received:  { label: 'Order Received',  cls: 'bg-amber-100 text-amber-800 border-amber-200',   dot: 'bg-amber-500' },
  confirmed: { label: 'Confirmed',       cls: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  packing:   { label: 'Being Packed',    cls: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  ready:     { label: 'Ready',           cls: 'bg-teal-100 text-teal-700 border-teal-200',       dot: 'bg-teal-500' },
  delivered: { label: 'Delivered',       cls: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500' },
  cancelled: { label: 'Cancelled',       cls: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-500' },
}
const PAYMENT_STATUS: Record<string, { label: string; cls: string }> = {
  paid:        { label: 'Paid',        cls: 'bg-green-100 text-green-700 border-green-200' },
  pending:     { label: 'Pending',     cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  failed:      { label: 'Failed',      cls: 'bg-red-100 text-red-700 border-red-200' },
  cod_pending: { label: 'COD Pending', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
}
const TICKET_STATUS: Record<string, { label: string; cls: string }> = {
  open:             { label: 'Open',           cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  in_progress:      { label: 'In Progress',    cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  waiting_customer: { label: 'Awaiting Reply', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  resolved:         { label: 'Resolved',       cls: 'bg-green-100 text-green-700 border-green-200' },
  closed:           { label: 'Closed',         cls: 'bg-gray-100 text-gray-500 border-gray-200' },
}
const PRIORITY: Record<string, { label: string; cls: string }> = {
  low:    { label: 'Low',    cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  high:   { label: 'High',   cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  urgent: { label: 'Urgent', cls: 'bg-red-100 text-red-700 border-red-200' },
}

type BadgeType = 'order' | 'payment' | 'ticket' | 'priority'

interface Props { value: string; type: BadgeType; showDot?: boolean; size?: 'xs' | 'sm' }

export default function CustomerStatusBadge({ value, type, showDot = false, size = 'xs' }: Props) {
  let meta: { label: string; cls: string; dot?: string } = { label: value, cls: 'bg-gray-100 text-gray-500 border-gray-200' }
  if (type === 'order')    meta = ORDER_STATUS[value]   || meta
  if (type === 'payment')  meta = PAYMENT_STATUS[value] || meta
  if (type === 'ticket')   meta = TICKET_STATUS[value]  || meta
  if (type === 'priority') meta = PRIORITY[value]       || meta

  const textSize = size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-[10px] px-2 py-0.5'

  return (
    <span className={`inline-flex items-center gap-1 font-bold uppercase rounded-full border ${textSize} ${meta.cls}`}>
      {showDot && (meta as { dot?: string }).dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${(meta as { dot?: string }).dot}`} />
      )}
      {meta.label}
    </span>
  )
}
