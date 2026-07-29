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

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface Category {
  id: number
  name: string
  slug: string | null
  description: string | null
  image: string | null
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
  category_id: number | null
  category_name: string | null
  category_slug: string | null
}

async function fetchCategory(slug: string): Promise<Category | null> {
  try {
    const res = await fetch(`${API_URL}/merchandise-categories/active`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    const categories: Category[] = data.data || []
    return (
      categories.find((c) => (c.slug || createSlug(c.name)) === slug) ?? null
    )
  } catch {
    return null
  }
}

async function fetchProducts(category: Category): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/merchandise/active`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    const all: Product[] = data.data || []
    const catSlug = category.slug || createSlug(category.name)
    return all.filter(
      (p) =>
        p.category_id === category.id ||
        p.category_slug === catSlug ||
        (p.category_name || '').toLowerCase() === category.name.toLowerCase(),
    )
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const category = await fetchCategory(params.slug)
  if (!category) {
    return { title: 'Category Not Found | Big Bean Café' }
  }
  return {
    title: `${category.name} | Big Bean Café Merchandise`,
    description: `Shop ${category.name} products from Big Bean Café, including coffee merchandise, brewing essentials, gifts and café favourites.`,
    alternates: {
      canonical: `https://www.bigbeancafe.in/merchandise/category/${params.slug}`,
    },
    openGraph: {
      title: `${category.name} | Big Bean Café Merchandise`,
      description: `Shop ${category.name} products from Big Bean Café.`,
      url: `https://www.bigbeancafe.in/merchandise/category/${params.slug}`,
      siteName: 'Big Bean Café Coffee Roasters',
      type: 'website',
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const category = await fetchCategory(params.slug)

  if (!category) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#F7EFE7]">
          <div className="mx-auto max-w-6xl px-4 py-20 text-center">
            <ShoppingBag className="mx-auto h-14 w-14 text-[#C9943A]" />
            <h1 className="mt-5 text-2xl font-black text-[#3D1F0D]">Category Not Found</h1>
            <p className="mt-2 text-sm text-[#9B6B50]">
              This category does not exist or may have been removed.
            </p>
            <Link
              href="/merchandise"
              className="mt-6 inline-flex items-center rounded-full bg-[#3D1F0D] px-6 py-3 text-sm font-black text-white transition hover:bg-[#6B3520]"
            >
              Browse All Products
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const products = await fetchProducts(category)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F7EFE7]">
        <div className="mx-auto max-w-6xl px-4 py-10">

          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-[#8B4A2F]">
            <Link href="/" className="transition-colors hover:text-[#3D1F0D]">Home</Link>
            <span>/</span>
            <Link href="/merchandise" className="transition-colors hover:text-[#3D1F0D]">Merchandise</Link>
            <span>/</span>
            <span className="font-semibold text-[#3D1F0D]">{category.name}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C9943A]">
              Big Bean Café Shop
            </p>
            <h1 className="mt-1 text-3xl font-black text-[#3D1F0D]">
              {category.name} | Big Bean Café
            </h1>
            {category.description && (
              <p className="mt-2 max-w-xl text-sm text-[#9B6B50]">{category.description}</p>
            )}
            <p className="mt-1 text-sm text-[#9B6B50]">
              {products.length} product{products.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {/* Products */}
          {products.length === 0 ? (
            <div className="rounded-[30px] border border-[#E6C7A8] bg-white px-6 py-20 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-[#C9943A]" />
              <h2 className="mt-4 text-xl font-black text-[#3D1F0D]">
                No products found in this category.
              </h2>
              <p className="mt-2 text-sm text-[#9B6B50]">
                Check back soon for new {category.name} products.
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
                      {product.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#FFF7ED]/80">
                          <span className="rounded-full bg-[#3D1F0D] px-4 py-2 text-xs font-black uppercase tracking-wider text-white">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      {product.category_name && (
                        <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-[#C9943A]">
                          {product.category_name}
                        </p>
                      )}
                      <h2 className="min-h-[40px] text-sm font-black leading-snug text-[#3D1F0D]">
                        {product.name}
                      </h2>
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
