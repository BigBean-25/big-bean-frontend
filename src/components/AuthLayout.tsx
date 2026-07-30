import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-[#FFF7ED]">
      {/* Full-page background — boy/barista image anchored to right */}
      <img
        src="/images/auth/customer-auth-bg.png"
        alt=""
        aria-hidden="true"
        className="fixed inset-0 h-full w-full object-cover object-right"
      />
      {/* Gradient: opaque cream on left fades to transparent on right, revealing the image */}
      <div className="fixed inset-0 bg-gradient-to-r from-[#FFF7ED]/96 via-[#FFF7ED]/78 to-transparent" />

      {/* Scrollable content layer */}
      <div className="relative z-10 flex min-h-screen items-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-[560px] lg:ml-[6vw]">
          {children}
        </div>
      </div>
    </div>
  )
}
