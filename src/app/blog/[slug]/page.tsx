import { Metadata } from 'next'
import { getImageUrl } from '@/lib/seo'
import BlogPostClient from './BlogPostClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

async function getBlogPost(slug: string) {
  try {
    const res = await fetch(`${API_URL}/blog-posts/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data?.data || null
  } catch { return null }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPost(params.slug)
  const title       = post?.meta_title       || post?.title       || 'Big Bean Café Blog'
  const description = post?.meta_description || post?.excerpt     || 'Read the latest from Big Bean Café Coffee Roasters.'
  const ogImage     = post?.featured_image ? getImageUrl(post.featured_image) : undefined
  const canonical   = `https://www.bigbeancafe.in/blog/${params.slug}`
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
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  }
}

export default function Page() {
  return <BlogPostClient />
}

