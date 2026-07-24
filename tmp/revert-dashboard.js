const fs = require('fs')
const f = 'src/app/admin/dashboard/page.tsx'
let s = fs.readFileSync(f, 'utf8')

// Remove the QUICK_ACTIONS constant and block I added
s = s.replace(/\n  const QUICK_ACTIONS = \[[\s\S]*?\]\n/, '\n')
s = s.replace(/\n          \{\/\* quick actions \*\/\}[\s\S]*?\n          \{\/\* promo \*\/\}/, '\n          {/* promo */}')

// Remove the latest enquiries block I added after calendar
s = s.replace(/\n          \{\/\* calendar \*\/\}[\s\S]*?\n          \{\/\* latest enquiries \*\/\}[\s\S]*?\n          \{\/\* recent notifications \*\/\}/,
              '\n          {/* calendar */}\n          </div>\n\n          {/* recent notifications */}')

// Revert CARD / HOVER shadows
s = s.replace(
  "const CARD = 'rounded-[28px] border border-[#E8D8C7] bg-white shadow-[0_18px_50px_rgba(61,31,13,0.08)]'",
  "const CARD = 'rounded-[28px] border border-[#DCE8E3] bg-white shadow-[0_18px_45px_rgba(31,42,36,0.06)]'"
)
s = s.replace(
  "const HOVER = 'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(61,31,13,0.12)]'",
  "const HOVER = 'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(31,42,36,0.10)]'"
)

// Revert pill function
s = s.replace(
  /\/\* Status pill \*\/\nconst pill = \(s: string\) => \{[\s\S]*?\n\}/,
  `/* Status pill */\nconst pill = (s: string) => {\n  const map: Record<string, string> = {\n    pending:   'bg-yellow-50 text-yellow-700 border border-yellow-200',\n    confirmed: 'bg-green-50 text-green-700 border border-green-200',\n    delivered: 'bg-blue-50 text-blue-700 border border-blue-200',\n    cancelled: 'bg-red-50 text-red-700 border border-red-200',\n    completed: 'bg-green-50 text-green-700 border border-green-200'\n  }\n  return map[s?.toLowerCase()] || 'bg-gray-50 text-gray-600 border border-gray-200'\n}`
)

// Revert getNotificationColor map
s = s.replace(
  /  const getNotificationColor = \(type: string\) => \{[\s\S]*?    return colors\[type\] \|\| 'text-\[#7A6A60\] bg-\[#F7F4F1\]'\n  \}/,
  `  const getNotificationColor = (type: string) => {\n    const colors: Record<string, string> = {\n      new_order: 'text-amber-600 bg-amber-50',\n      payment_success: 'text-green-600 bg-green-50',\n      payment_failed: 'text-red-600 bg-red-50',\n      support_ticket: 'text-blue-600 bg-blue-50',\n      support_reply: 'text-purple-600 bg-purple-50',\n      contact_enquiry: 'text-orange-600 bg-orange-50',\n      reservation: 'text-emerald-600 bg-emerald-50',\n      corporate_enquiry: 'text-indigo-600 bg-indigo-50',\n      franchise_enquiry: 'text-yellow-600 bg-yellow-50',\n      career_application: 'text-cyan-600 bg-cyan-50',\n      newsletter: 'text-gray-600 bg-gray-50',\n      low_stock: 'text-red-600 bg-red-50',\n      merchandise_review: 'text-yellow-500 bg-yellow-50',\n    }\n    return colors[type] || 'text-gray-600 bg-gray-50'\n  }`
)

// Revert KPI_CARDS to original colors
s = s.replace(
  /  const KPI_CARDS = \[[\s\S]*?  \]/,
  `  const KPI_CARDS = [\n    { label: 'Total Customers',     value: kpi.customers,    icon: Users,        href: '/admin/customers',             color: 'text-[#2FBF9B]', bg: 'bg-[#DFF7EF]', trend: '+12%' },\n    { label: 'Merchandise Orders',  value: kpi.orders,       icon: ShoppingBag,  href: '/admin/merchandise-orders',    color: 'text-[#C9943A]', bg: 'bg-[#FFF3DE]', trend: '+8%'  },\n    { label: 'Unread Notifications',value: unreadCount,      icon: Bell,         href: '/admin/notifications',         color: 'text-[#E85D4C]', bg: 'bg-[#FDE8E8]', trend: unreadCount > 0 ? 'Alert' : '0' },\n    { label: 'Contact Enquiries',   value: kpi.contacts,     icon: MessageSquare,href: '/admin/contact-enquiries',     color: 'text-[#3D7FBF]', bg: 'bg-[#E3EFFE]', trend: 'New'  },\n    { label: 'Reservations',        value: kpi.reservations, icon: CalendarDays, href: '/admin/reservations',          color: 'text-[#9B59B6]', bg: 'bg-[#F3E8FF]', trend: '+5%'  },\n    { label: 'Career Applications', value: kpi.careers,      icon: UserCheck,    href: '/admin/career-applications',   color: 'text-[#E74C3C]', bg: 'bg-[#FDE8E8]', trend: 'New'  },\n    { label: 'Corporate Enquiries', value: kpi.corporate,    icon: Briefcase,    href: '/admin/corporate-enquiries',   color: 'text-[#1ABC9C]', bg: 'bg-[#E2F9F4]', trend: '+3'   },\n    { label: 'Franchise Leads',     value: kpi.franchise,    icon: TrendingUp,   href: '/admin/franchise-enquiries',   color: 'text-[#F39C12]', bg: 'bg-[#FEF3DA]', trend: '+2'   },\n    { label: 'Active Outlets',      value: kpi.outlets,      icon: Store,        href: '/admin/outlets',               color: 'text-[#8E44AD]', bg: 'bg-[#F5EEF8]', trend: 'Live' },\n  ]`
)

// Revert event snapshot colors
s = s.replace(
  /              <div className="rounded-2xl bg-\[#FFF3DE\] p-3">\n                <CreditCard className="h-4 w-4 text-\[#C9943A\]" \/>/,
  '              <div className="rounded-2xl bg-[#E3EFFE] p-3">\n                <CreditCard className="h-4 w-4 text-[#3D7FBF]" />'
)
s = s.replace(
  /              <div className="rounded-2xl bg-\[#F7EFE7\] p-3">\n                <UserCheck className="h-4 w-4 text-\[#6B3520\]" \/>/,
  '              <div className="rounded-2xl bg-[#F3E8FF] p-3">\n                <UserCheck className="h-4 w-4 text-[#8E44AD]" />'
)

// Revert revenue chart colors
s = s.replace(
  "<BarGroup bars={REVENUE_BARS} colors={['#E8D8C7','#0F8A5F']} labels={BAR_LABELS} />",
  "<BarGroup bars={REVENUE_BARS} colors={['#DCE8E3','#2FBF9B']} labels={BAR_LABELS} />"
)

// Revert monthly earnings sparkline color
s = s.replace(
  '<SparkLine values={[32,45,38,55,50,68,60,75,58,80]} color="#0F8A5F" />',
  '<SparkLine values={[32,45,38,55,50,68,60,75,58,80]} color="#2FBF9B" />'
)

// Revert monthly earnings trend badge
s = s.replace(
  '<span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#EAF7F1] px-2.5 py-0.5 text-xs font-black text-[#0F8A5F]">',
  '<span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#EAF8F3] px-2.5 py-0.5 text-xs font-black text-[#167E68]">'
)

// Revert KPI trend badge
s = s.replace(
  '<span className="rounded-full bg-[#EAF7F1] px-2 py-0.5 text-[10px] font-black text-[#0F8A5F]">{trend}</span>',
  '<span className="rounded-full bg-[#FFF3DE] px-2 py-0.5 text-[10px] font-black text-[#8B4513]">{trend}</span>'
)

// Revert greeting mini metric Enquiries color
s = s.replace(
  "{ label: 'Enquiries', value: kpi.contacts,  color: '#6B3520' }",
  "{ label: 'Enquiries', value: kpi.contacts,  color: '#3D7FBF' }"
)

// Revert View all orders link
s = s.replace(
  'className="mt-4 flex items-center gap-1.5 text-xs font-black text-[#C9943A] hover:underline"',
  'className="mt-4 flex items-center gap-1.5 text-xs font-black text-[#0F8A5F] hover:underline"'
)
s = s.replace(
  'className="flex items-center gap-1 text-xs font-black text-[#C9943A] hover:underline"',
  'className="flex items-center gap-1 text-xs font-black text-[#0F8A5F] hover:underline"'
)

// Revert notification/event snapshot "View all"/"View Bookings" links
s = s.replace(
  'className="text-xs font-bold text-[#C9943A] hover:underline">View all</Link>',
  'className="text-xs font-bold text-[#0F8A5F] hover:underline">View all</Link>'
)
s = s.replace(
  'className="text-xs font-bold text-[#C9943A] hover:underline">View Bookings</Link>',
  'className="text-xs font-bold text-[#0F8A5F] hover:underline">View Bookings</Link>'
)

// Revert Recent Notifications title
s = s.replace(
  '<p className="text-sm font-black text-[#3D1F0D]">Recent Notifications</p>',
  '<p className="text-sm font-black text-[#0F1F1A]">Recent Notifications</p>'
)

// Revert activity text colors
s = s.replace(
  '<p className="text-xs font-semibold text-[#3D1F0D]">{a.text}</p>',
  '<p className="text-xs font-semibold text-[#0F1F1A]">{a.text}</p>'
)

// Revert activity dots
s = s.replace(
  "custArr.slice(0, 2).forEach(c => acts.push({ text: `Customer ${c.full_name || c.email} registered`, time: fmt(c.created_at as string), dot: 'bg-[#0F8A5F]' }))",
  "custArr.slice(0, 2).forEach(c => acts.push({ text: `Customer ${c.full_name || c.email} registered`, time: fmt(c.created_at as string), dot: 'bg-[#2FBF9B]' }))"
)
s = s.replace(
  ";(get(contacts, []) as Order[]).slice(0, 1).forEach(c => acts.push({ text: `Contact enquiry from ${c.name || 'visitor'}`, time: fmt(c.created_at as string), dot: 'bg-[#1F7A8C]' }))",
  ";(get(contacts, []) as Order[]).slice(0, 1).forEach(c => acts.push({ text: `Contact enquiry from ${c.name || 'visitor'}`, time: fmt(c.created_at as string), dot: 'bg-[#3D7FBF]' }))"
)

// Revert loading skeleton color
s = s.replace(/bg-\[#E8D8C7\]/g, 'bg-[#DCE8E3]')

// Revert table header/tr color
s = s.replace(
  '<tr className="bg-[#FFF8EF]">',
  '<tr className="border-y border-[#DCE8E3] bg-[#F9FDFB]">'
)

// Revert orders table row border
s = s.replace(
  '<tr key={i} className="border-b border-[#F7EFE7] hover:bg-[#FFF8EF] transition-colors">',
  '<tr key={i} className="border-b border-[#F3F8F6] hover:bg-[#F9FDFB] transition-colors">'
)

// Revert orders table text colors
s = s.replace(
  '<td className="px-5 py-3.5 font-black text-[#3D1F0D]">#{o.order_number || o.id}</td>',
  '<td className="px-5 py-3.5 font-black text-[#0F1F1A]">#{o.order_number || o.id}</td>'
)
s = s.replace(
  '<td className="px-5 py-3.5 text-[#5A4A42]">{o.customer_name || o.customer_email || \'—\'}</td>',
  '<td className="px-5 py-3.5 text-[#42564D]">{o.customer_name || o.customer_email || \'—\'}</td>'
)
s = s.replace(
  '<td className="px-5 py-3.5 font-black text-[#3D1F0D]">₹{o.total_amount || 0}</td>',
  '<td className="px-5 py-3.5 font-black text-[#0F1F1A]">₹{o.total_amount || 0}</td>'
)
s = s.replace(
  '<td className="px-5 py-3.5 text-xs text-[#9B8B7F]">',
  '<td className="px-5 py-3.5 text-xs text-[#9CB3AC]">'
)

// Revert "No orders yet" color
s = s.replace(
  '<tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-[#9B8B7F]">No orders yet.</td></tr>',
  '<tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-[#9CB3AC]">No orders yet.</td></tr>'
)

// Remove Settings import if only used by quick actions
s = s.replace(
  '  Rocket, Bell, CreditCard, AlertTriangle, Headphones, MessageCircle,\n  Building2, Send, AlertCircle, Settings\n} from \'lucide-react\'',
  '  Rocket, Bell, CreditCard, AlertTriangle, Headphones, MessageCircle,\n  Building2, Send, AlertCircle\n} from \'lucide-react\''
)

fs.writeFileSync(f, s, 'utf8')
console.log('dashboard reverted')
