export default function CustomerLoading() {
  return (
    <div className="min-h-screen bg-[#FFF7ED]">
      {/* Skeleton topbar */}
      <div className="h-[78px] border-b border-[#E6C7A8] bg-[#FFF7ED]/95 animate-shimmer" />
      <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar skeleton */}
          <div className="hidden lg:block w-[260px] shrink-0">
            <div className="rounded-2xl border border-[#E6C7A8] bg-white p-4 space-y-3">
              <div className="h-14 rounded-xl bg-[#F5E6D3] animate-shimmer" />
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-[#F5E6D3] animate-shimmer" />
              ))}
            </div>
          </div>
          {/* Content skeleton */}
          <div className="flex-1 space-y-4">
            <div className="h-20 rounded-2xl bg-[#F5E6D3] animate-shimmer" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-[#F5E6D3] animate-shimmer" />
              ))}
            </div>
            <div className="h-48 rounded-2xl bg-[#F5E6D3] animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  )
}
