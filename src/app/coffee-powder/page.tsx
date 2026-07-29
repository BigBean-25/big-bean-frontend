import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { ShoppingBag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Coffee Powder | Big Bean Café',
  description:
    'Shop Big Bean Café coffee powder, fresh roast coffee and café-style coffee products for home brewing.',
  alternates: { canonical: 'https://www.bigbeancafe.in/coffee-powder' },
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace(/\/api$/, '')

function getImageUrl(img?: string | null): string | null {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  mrp: number | null
  image: string | null
  slug: string
  stock: number
  category_name: string | null
  category_slug: string | null
  category: string | null
}

export default async function CoffeePowderPage() {
  let products: Product[] = []
  try {
    const res = await fetch(`${API_URL}/merchandise/active`, { cache: 'no-store' })
    const data = await res.json()
    const all: Product[] = data.data || []
    products = all.filter((p) => {
      const cat = (p.category_name || p.category || p.category_slug || '').toLowerCase()
      const name = p.name.toLowerCase()
      return (
        cat.includes('coffee') ||
        cat.includes('powder') ||
        cat.includes('bean') ||
        name.includes('coffee') ||
        name.includes('powder') ||
        name.includes('roast')
      )
    })
  } catch {}

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F7EFE7]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C9943A]">
              Big Bean Café Shop
            </p>
            <h1 className="mt-1 text-3xl font-black text-[#3D1F0D]">
              Big Bean Café Coffee Powder
            </h1>
            <p className="mt-2 text-sm text-[#9B6B50]">
              Fresh roast coffee powder and beans for home brewing.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-[30px] border border-[#E6C7A8] bg-white px-6 py-20 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-[#C9943A]" />
              <h2 className="mt-4 text-xl font-black text-[#3D1F0D]">Coming Soon</h2>
              <p className="mt-2 text-sm text-[#9B6B50]">
                Coffee powder products will be available soon.
              </p>
              <Link
                href="/merchandise"
                className="mt-6 inline-flex items-center rounded-full bg-[#3D1F0D] px-6 py-3 text-sm font-black text-white transition hover:bg-[#6B3520]"
              >
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const imageUrl = getImageUrl(product.image)
                const mrp = product.mrp ? Number(product.mrp) : null
                const price = Number(product.price)
                const discount =
                  mrp && mrp > price ? Math.round((1 - price / mrp) * 100) : null
                return (
                  <Link
                    key={product.id}
                    href={`/merchandise/${product.slug}`}
                    className="group overflow-hidden rounded-[22px] border border-[#E6C7A8] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-[200px] overflow-hidden bg-[#FFF7ED]">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`Big Bean Cafe ${product.name}`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-10 w-10 text-[#C9943A]" />
                        </div>
                      )}
                      {discount && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-[#A92517] px-3 py-1 text-[10px] font-black text-white">
                          -{discount}%
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      {product.category_name && (
                        <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-[#C9943A]">
                          {product.category_name}
                        </p>
                      )}
                      <h3 className="text-sm font-black text-[#3D1F0D]">{product.name}</h3>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-lg font-black text-[#3D1F0D]">
                          ₹{price.toFixed(0)}
                        </span>
                        {mrp && mrp > price && (
                          <span className="pb-0.5 text-sm text-[#A98A74] line-through">
                            ₹{mrp.toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
