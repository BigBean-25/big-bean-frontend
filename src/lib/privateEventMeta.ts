export const STATUS_META: Record<string, { label: string; cls: string }> = {
  new:        { label: 'New',        cls: 'bg-[#EAF8F3] text-[#167E68]' },
  contacted:  { label: 'Contacted',  cls: 'bg-[#FFF3D9] text-[#8B4A2F]' },
  qualified:  { label: 'Qualified',  cls: 'bg-[#E9EDF9] text-[#37509C]' },
  quote_sent: { label: 'Quote Sent', cls: 'bg-[#F5EBDD] text-[#8B4A2F]' },
  confirmed:  { label: 'Confirmed',  cls: 'bg-[#DFF1DC] text-[#3E6B34]' },
  closed:     { label: 'Closed',     cls: 'bg-[#F1EAE2] text-[#8A7059]' },
}

export const OCCASION_LABELS: Record<string, string> = {
  birthday: 'Birthday party', anniversary: 'Anniversary', family: 'Family get-together',
  reunion: 'Friends / reunion', corporate: 'Corporate / team event', farewell: 'Farewell / office celebration',
  'baby-shower': 'Baby shower', engagement: 'Engagement / pre-wedding', workshop: 'Workshop / meetup',
  'group-dining': 'Group lunch / dinner', other: 'Other',
}
