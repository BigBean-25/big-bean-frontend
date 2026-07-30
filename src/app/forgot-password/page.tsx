'use client'

import Link from 'next/link'
import Image from 'next/image'
import { HeadphonesIcon, ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPassword() {
  return (
    <div className="relative min-h-screen w-full bg-[#FFF7ED]">

      {/* Background */}
      <img
        src="/images/auth/customer-auth-bg.png"
        alt="Big Bean Café"
        className="fixed inset-0 h-full w-full object-cover object-right"
      />
      <div className="fixed inset-0 bg-gradient-to-r from-[#FFF7ED]/96 via-[#FFF7ED]/78 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-[480px] lg:ml-[6vw]">

          <div className="rounded-[28px] border border-[#E6C7A8]/70 bg-white/72 p-6 shadow-[0_24px_70px_rgba(61,31,13,0.16)] backdrop-blur-xl sm:p-7">

            {/* Badge + Logo */}
            <div className="mb-5 flex items-center justify-between">
              <span className="rounded-full border border-[#E6C7A8] bg-[#FFF7ED] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#6B3520]">
                Big Bean Café
              </span>
              <Image
                src="/logo/big-bean-cafe-logo-transparent.png"
                alt="Big Bean Café"
                width={160}
                height={72}
                className="h-auto w-[90px] sm:w-[130px] lg:w-[160px] max-w-[160px] object-contain"
                priority
              />
            </div>

            {/* Icon */}
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF7ED] border border-[#E6C7A8]">
              <HeadphonesIcon className="h-7 w-7 text-[#C9943A]" />
            </div>

            {/* Title */}
            <h1 className="font-heading text-2xl font-black leading-tight text-[#2A120B]">
              Forgot Password?
            </h1>
            <p className="mt-2 text-sm text-[#7A5A48]">
              Password reset is currently handled by our support team.
            </p>

            {/* Info box */}
            <div className="mt-5 rounded-2xl border border-[#E6C7A8] bg-[#FFF7ED] p-4">
              <p className="text-sm font-bold text-[#3D1F0D]">
                Please contact Big Bean Café support to reset your password.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <a
                  href="mailto:support@bigbeancafe.in"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#C9943A] hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  support@bigbeancafe.in
                </a>
              </div>
            </div>

            {/* Back to login */}
            <Link
              href="/login"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#3D1F0D] py-3 text-sm font-black tracking-wide text-[#FFF7ED] transition hover:bg-[#C9943A] hover:text-[#120905]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>

            <div className="mt-3 text-center">
              <Link href="/" className="text-xs font-semibold text-[#A98A74] hover:text-[#3D1F0D] hover:underline">
                ← Back to Big Bean Café
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
