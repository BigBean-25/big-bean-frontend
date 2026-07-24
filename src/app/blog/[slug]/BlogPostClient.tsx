'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { Calendar, Clock, User, ArrowLeft, Share2, ExternalLink } from 'lucide-react'

const API_URL      = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

const CATEGORIES: Record<string, string> = {
  'coffee-culture': 'Coffee Culture', 'brewing-tips': 'Brewing Tips',
  'company-news': 'Company News', 'lifestyle': 'Lifestyle',
  'events': 'Events', 'food': 'Food', 'offers': 'Offers'
}

const CAT_COLORS: Record<string, string> = {
  'coffee-culture': '#6B3520', 'brewing-tips': '#3D6B20',
  'company-news': '#1F3D6B', 'lifestyle': '#6B3D6B',
  'events': '#6B5A20', 'food': '#6B2020', 'offers': '#20616B'
}

function getImgUrl(img?: string | null): string | null {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE_URL}/${img.replace(/^\/+/, '')}`
}

function formatDate(d: string | null): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

interface BlogPost {
  id: number; title: string; slug: string; excerpt: string | null
  content: string | null; author: string; category: string
  featured_image: string | null; read_time: string
  published_at: string | null; tags: string | null
  meta_title: string | null; meta_description: string | null
}

export default function BlogPostClient() {
  const params   = useParams()
  const slug     = params.slug as string
  const [post, setPost]       = useState<BlogPost | null>(null)
  const [related, setRelated] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/blog-posts/slug/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) setPost(data.data)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!post) return
    fetch(`${API_URL}/blog-posts/published`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setRelated((data.data as BlogPost[])
            .filter(p => p.slug !== post.slug && p.category === post.category)
            .slice(0, 3))
        }
      })
      .catch(() => {})
  }, [post])

  const handleShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const renderContent = (content: string | null) => {
    if (!content) return null
    if (/<[a-z][\s\S]*>/i.test(content))
      return <div className="prose-content" dangerouslySetInnerHTML={{ __html: content }} />
    return (
      <div className="space-y-4">
        {content.split(/\n\n+/).map((para, i) => (
          <p key={i} className="leading-relaxed" style={{ color: '#2D1407' }}>{para.trim()}</p>
        ))}
      </div>
    )
  }

  if (loading) return (
    <div className="min-h-screen" style={{ background: '#FFF7ED' }}>
      <Header />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#C9943A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm" style={{ color: '#8B4A2F' }}>Loading story...</p>
        </div>
      </div>
      <Footer />
    </div>
  )

  if (notFound || !post) return (
    <div className="min-h-screen" style={{ background: '#FFF7ED' }}>
      <Header />
      <main className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-4">
          <p className="text-6xl font-bold font-heading mb-4" style={{ color: '#E6C7A8' }}>404</p>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#3D1F0D' }}>Story Not Found</h1>
          <p className="mb-6 text-sm" style={{ color: '#8B4A2F' }}>This blog post doesn&apos;t exist or may have been removed.</p>
          <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white"
            style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )

  const imgUrl = getImgUrl(post.featured_image)
  const tags   = post.tags ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : []

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom,#FFF7ED,#F5E6D3,#FFF7ED)' }}>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[420px] flex items-end pt-[5.5rem] pb-12 overflow-hidden">
          {imgUrl ? (
            <>
              <img src={imgUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.82 }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(18,9,5,0.92) 0%,rgba(18,9,5,0.35) 60%,transparent 100%)' }} />
            </>
          ) : (
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#120905 0%,#3D1F0D 50%,#6B3520 100%)' }} />
          )}
          <div className="container-custom relative z-10 max-w-4xl">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold mb-6 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/10" style={{ color: '#F5E6D3' }}>
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            <span className="block mb-4 px-3 py-1 rounded-full text-xs font-bold text-white w-fit"
              style={{ background: CAT_COLORS[post.category] || '#6B3520' }}>
              {CATEGORIES[post.category] || post.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold font-heading mb-5" style={{ color: '#FFF7ED', lineHeight: 1.15 }}>
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: '#F5E6D3' }}>
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</span>
              {post.published_at && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(post.published_at)}</span>}
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.read_time}</span>
              <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto px-4 py-1.5 rounded-full border border-white/30 hover:bg-white/10 text-xs font-semibold">
                <Share2 className="w-3.5 h-3.5" />{copied ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>
        </section>

        {/* Body */}
        <article className="py-12">
          <div className="container-custom max-w-4xl">
            <div className="bg-white rounded-[28px] border border-[#E6C7A8] shadow-sm p-8 md:p-12 text-base leading-relaxed" style={{ color: '#2D1407' }}>
              {post.excerpt && (
                <p className="text-lg font-medium italic mb-8 pb-8 border-b border-[#F5E6D3]" style={{ color: '#6B3520' }}>{post.excerpt}</p>
              )}
              <div className="blog-content">{renderContent(post.content)}</div>
              {tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-[#F5E6D3]">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#C9943A' }}>Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold border border-[#E6C7A8]" style={{ color: '#6B3520', background: '#FFF7ED' }}>#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="mt-8 rounded-[28px] p-8 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#3D1F0D,#6B3520)' }}>
              <div className="relative z-10">
                <p className="font-bold text-lg font-heading mb-2" style={{ color: '#FFF7ED' }}>Visit Big Bean Café Today</p>
                <p className="text-sm mb-6" style={{ color: '#F5E6D3' }}>Experience the same passion in every cup at your nearest outlet.</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href="/outlets" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-white text-sm"
                    style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                    Find Outlet <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <Link href="/reservations" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm border border-white/30 hover:bg-white/10" style={{ color: '#FFF7ED' }}>
                    Reserve a Table
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section className="py-12 border-t border-[#E6C7A8]">
            <div className="container-custom max-w-4xl">
              <h2 className="text-2xl font-bold font-heading mb-8" style={{ color: '#1A0D07' }}>More from {CATEGORIES[post.category] || 'Our Blog'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map(rp => {
                  const rImg = getImgUrl(rp.featured_image)
                  return (
                    <Link key={rp.id} href={`/blog/${rp.slug}`}>
                      <article className="group rounded-[20px] overflow-hidden border border-[#E6C7A8] bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="h-36 overflow-hidden">
                          {rImg ? <img src={rImg} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            : <div className="w-full h-full" style={{ background: 'linear-gradient(135deg,#3D1F0D,#C9943A)' }} />}
                        </div>
                        <div className="p-4">
                          <p className="font-bold text-sm font-heading line-clamp-2 mb-2" style={{ color: '#1A0D07' }}>{rp.title}</p>
                          <p className="text-xs flex items-center gap-1" style={{ color: '#C9943A' }}><Clock className="w-3 h-3" />{rp.read_time}</p>
                        </div>
                      </article>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
