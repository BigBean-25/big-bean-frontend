import type { Metadata } from 'next'
import { Fraunces, Manrope, Sora } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import GlobalSeoScripts from '@/components/common/GlobalSeoScripts'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-nav',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bigbeancafe.in'),
  title: 'Big Bean Café Coffee Roasters',
  description: 'Premium coffee, café dining, events and franchise opportunities.',
  keywords: 'coffee, café, big bean café, coffee roasters, premium coffee, bangalore café',
  icons: {
    icon: [
      { url: '/logo/big-bean-cafe-logo-transparent.png', type: 'image/png' },
    ],
    apple: [
      { url: '/logo/big-bean-cafe-logo-transparent.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/logo/big-bean-cafe-logo-transparent.png',
  },
  openGraph: {
    title: 'Big Bean Café - Premium Coffee Roasters',
    description: 'Experience the finest coffee at Big Bean Café',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Big Bean Café - Premium Coffee Roasters',
    description: 'Experience the finest coffee at Big Bean Café',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <GlobalSeoScripts />
      </head>
      <body className={`${fraunces.variable} ${manrope.variable} ${sora.variable}`}>
        <div className="min-h-screen bg-cream-50">
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#8B250F',
              color: '#fff',
            },
            success: {
              style: {
                background: '#6E1D0D',
              },
            },
            error: {
              style: {
                background: '#dc2626',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
