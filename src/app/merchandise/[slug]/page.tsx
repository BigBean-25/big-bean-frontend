import { Metadata } from 'next'
import { getImageUrl } from '@/lib/seo'
import MerchandiseProductClient from './MerchandiseProductClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/merchandise/slug/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data?.data || null
  } catch { return null }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug)
  const title       = product ? `${product.name} | Big Bean Café Merchandise` : 'Big Bean Café Merchandise'
  const description = product?.description || 'Shop Big Bean Café merchandise including coffee mugs, beans, accessories and café-inspired gifts.'
  const ogImage     = product?.image ? getImageUrl(product.image) : undefined
  const canonical   = `https://www.bigbeancafe.in/merchandise/${params.slug}`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Big Bean Café Coffee Roasters',
      images: ogImage ? [{ url: ogImage }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  }
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')

function getProductImageUrl(img?: string | null): string | null {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

export default async function Page({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)

  const imageUrl = getProductImageUrl(product?.image)

  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: imageUrl ? [imageUrl] : [],
        description: product.description || `Shop ${product.name} from Big Bean Café.`,
        brand: { '@type': 'Brand', name: 'Big Bean Café Coffee Roasters' },
        offers: {
          '@type': 'Offer',
          price: Number(product.price),
          priceCurrency: 'INR',
          availability:
            product.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          url: `https://www.bigbeancafe.in/merchandise/${product.slug}`,
        },
        ...(product.rating
          ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(product.rating) } }
          : {}),
      }
    : null

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <MerchandiseProductClient />
    </>
  )
}
