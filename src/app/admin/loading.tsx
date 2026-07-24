export default function AdminLoading() {
  return (
    <div className="min-h-[calc(100vh-68px)] p-5 lg:p-8 space-y-6">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded-xl bg-[#E8F0ED] animate-pulse" />
        <div className="h-9 w-28 rounded-xl bg-[#E8F0ED] animate-pulse" />
      </div>
      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-[#E8F0ED] animate-pulse" />
        ))}
      </div>
      {/* Table skeleton */}
      <div className="rounded-2xl border border-[#DCE8E3] bg-white p-4 space-y-3">
        <div className="h-10 w-full rounded-xl bg-[#E8F0ED] animate-pulse" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 w-full rounded-xl bg-[#F3F8F6] animate-pulse" />
        ))}
      </div>
    </div>
  )
}
