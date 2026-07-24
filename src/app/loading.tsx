export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-[#E6C7A8]" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#C9943A] animate-spin" />
        </div>
        <p className="text-sm font-bold text-[#7A5A48] animate-pulse">Loading…</p>
      </div>
    </div>
  )
}
