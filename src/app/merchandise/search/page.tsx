import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { ShoppingBag } from 'lucide-react'

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
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string }
}): Promise<Metadata> {
  const q = (searchParams.q || '').trim()
  return {
    title: q
      ? `Search "${q}" | Big Bean Café Merchandise`
      : 'Search | Big Bean Café Merchandise',
    description: q
      ? `Browse Big Bean Café products matching ${q}, including coffee powder, mugs, brewing tools and more.`
      : 'Search Big Bean Café merchandise products.',
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const q = (searchParams.q || '').trim()

  let products: Product[] = []
  if (q) {
    try {
      const res = await fetch(`${API_URL}/merchandise/active`, { cache: 'no-store' })
      const data = await res.json()
      const all: Product[] = data.data || []
      const lq = q.toLowerCase()
      products = all.filter(
        (p) =>
          p.name.toLowerCase().includes(lq) ||
          (p.description || '').toLowerCase().includes(lq) ||
          (p.category_name || '').toLowerCase().includes(lq),
      )
    } catch {}
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F7EFE7] px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C9943A]">
              Search Results
            </p>
            <h1 className="mt-1 text-3xl font-black text-[#3D1F0D]">
              {q ? `Results for "${q}"` : 'Search Products'}
            </h1>
            {q && (
              <p className="mt-1 text-sm text-[#9B6B50]">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          {!q ? (
            <p className="text-sm text-[#9B6B50]">Enter a search term to find products.</p>
          ) : products.length === 0 ? (
            <div className="rounded-[30px] border border-[#E6C7A8] bg-white px-6 py-20 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-[#C9943A]" />
              <h2 className="mt-4 text-xl font-black text-[#3D1F0D]">No products found</h2>
              <p className="mt-2 text-sm text-[#9B6B50]">
                No Big Bean Café products match &quot;{q}&quot;. Try a different term.
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
