'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { Calendar, Clock, User, Search, ArrowRight, Star } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

interface BlogHero {
  eyebrow: string; title: string; highlight_text: string | null; subtitle: string | null
  button_primary_text: string; button_primary_url: string
  button_secondary_text: string; button_secondary_url: string
  image: string | null
  stat_1_value: string; stat_1_label: string
  stat_2_value: string; stat_2_label: string
  stat_3_value: string; stat_3_label: string
}

interface BlogPost {
  id: number; title: string; slug: string; excerpt: string | null
  author: string; category: string; featured_image: string | null
  read_time: string; is_featured: number; published_at: string | null; tags: string | null
}

const CATEGORIES = [
  { id: 'all', label: 'All Posts' },
  { id: 'coffee-culture', label: 'Coffee Culture' },
  { id: 'brewing-tips', label: 'Brewing Tips' },
  { id: 'company-news', label: 'Company News' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'events', label: 'Events' },
  { id: 'food', label: 'Food' },
  { id: 'offers', label: 'Offers' },
]

const CAT_COLORS: Record<string, string> = {
  'coffee-culture': '#6B3520', 'brewing-tips': '#3D6B20',
  'company-news': '#1F3D6B', 'lifestyle': '#6B3D6B',
  'events': '#6B5A20', 'food': '#6B2020', 'offers': '#20616B'
}

function getImageUrl(img?: string | null): string | null {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE_URL}/${img.replace(/^\/+/, '')}`
}

function formatDate(d: string | null): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function CoffeePlaceholder({ className }: { className?: string }) {
  return (
    <div className={`w-full h-full flex items-center justify-center ${className || ''}`}
      style={{ background: 'linear-gradient(135deg, #3D1F0D 0%, #8B4A2F 50%, #C9943A 100%)' }}>
      <svg viewBox="0 0 60 60" className="w-12 h-12 opacity-30" fill="white">
        <path d="M10 20h40v5c0 11-9 20-20 20S10 36 10 25v-5z" />
        <path d="M45 22c5 0 8 3 8 7s-3 7-8 7" strokeWidth="2" stroke="white" fill="none" />
        <rect x="18" y="10" width="24" height="12" rx="4" />
      </svg>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-[24px] overflow-hidden bg-white border border-[#E6C7A8]">
      <div className="h-48 animate-shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 rounded animate-shimmer" />
        <div className="h-5 w-full rounded animate-shimmer" />
        <div className="h-4 w-4/5 rounded animate-shimmer" />
        <div className="h-3 w-1/2 rounded animate-shimmer" />
      </div>
    </div>
  )
}

export default function Blog() {
  const [hero, setHero] = useState<BlogHero | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [subLoading, setSubLoading] = useState(false)
  const [subMessage, setSubMessage] = useState('')

  useEffect(() => {
    Promise.allSettled([
      fetch(`${API_URL}/blog-hero/active`).then(r => r.json()),
      fetch(`${API_URL}/blog-posts/published`).then(r => r.json()),
    ]).then(([heroRes, postsRes]) => {
      if (heroRes.status === 'fulfilled' && heroRes.value.success) setHero(heroRes.value.data)
      if (postsRes.status === 'fulfilled' && postsRes.value.success) setPosts(postsRes.value.data || [])
      setLoading(false)
    })
  }, [])

  const filtered = posts.filter(p => {
    if (activeFilter !== 'all' && p.category !== activeFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return p.title.toLowerCase().includes(s) ||
        (p.excerpt || '').toLowerCase().includes(s) ||
        (p.tags || '').toLowerCase().includes(s)
    }
    return true
  })

  const featuredPosts = filtered.filter(p => p.is_featured)
  const heroBigPost = featuredPosts[0] || null
  const featuredRest = featuredPosts.slice(1, 3)
  const allPosts = filtered

  const heroImageUrl = getImageUrl(hero?.image)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #FFF7ED, #F5E6D3, #FFF7ED)' }}>
      <Header />
      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative min-h-[520px] flex items-center pt-[5.5rem] pb-16 overflow-hidden">
          {heroImageUrl ? (
            <>
              <img src={heroImageUrl} alt="Blog Hero"
                className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
                style={{ opacity: 0.85 }} />
              <div className="absolute inset-0" style={{ background: 'rgba(18,9,5,0.68)' }} />
            </>
          ) : (
            <div className="absolute inset-0 animate-slow-zoom" style={{ background: 'linear-gradient(135deg,#120905 0%,#3D1F0D 50%,#6B3520 100%)' }} />
          )}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle,#C9943A 1px,transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="container-custom relative z-10">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="animate-fade-up">
                <p className="text-sm font-bold tracking-[0.22em] uppercase mb-4" style={{ color: '#C9943A' }}>
                  {hero?.eyebrow || 'BIG BEAN CAFÉ BLOG'}
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-5" style={{ color: '#FFF7ED', lineHeight: 1.1 }}>
                  {hero?.title || 'Coffee Stories,'}{' '}
                  <span style={{ color: '#C9943A' }}>{hero?.highlight_text || 'Freshly Brewed'}</span>
                </h1>
                <p className="text-lg mb-8" style={{ color: '#F5E6D3', maxWidth: '480px' }}>
                  {hero?.subtitle || 'Explore coffee culture, brewing tips, café updates, lifestyle stories and behind-the-scenes moments from Big Bean Café.'}
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href={hero?.button_primary_url || '#blog-list'}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                    {hero?.button_primary_text || 'Read Stories'} <ArrowRight className="w-4 h-4" />
                  </a>
                  <Link href={hero?.button_secondary_url || '/outlets'}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold border-2 transition-all hover:bg-white/10"
                    style={{ borderColor: '#C9943A', color: '#FFF7ED' }}>
                    {hero?.button_secondary_text || 'Visit Café'}
                  </Link>
                </div>
              </div>

              <div className="hidden md:flex flex-wrap gap-4 animate-fade-up-delay">
                {[
                  { value: hero?.stat_1_value || 'Coffee', label: hero?.stat_1_label || 'Stories' },
                  { value: hero?.stat_2_value || 'Tips', label: hero?.stat_2_label || 'Brewing Guides' },
                  { value: hero?.stat_3_value || 'News', label: hero?.stat_3_label || 'Café Updates' },
                ].map((s, i) => (
                  <div key={i} className="flex-1 min-w-[120px] bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 animate-float-soft"
                    style={{ animationDelay: `${i * 0.8}s` }}>
                    <p className="text-2xl font-bold font-heading" style={{ color: '#C9943A' }}>{s.value}</p>
                    <p className="text-sm" style={{ color: '#F5E6D3' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Filter + Search ───────────────────────────────────── */}
        <section id="blog-list" className="py-8 sticky top-0 z-20"
          style={{ background: 'rgba(255,247,237,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E6C7A8' }}>
          <div className="container-custom">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#C9943A' }} />
                <input type="text" placeholder="Search stories..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#E6C7A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 bg-white" />
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setActiveFilter(c.id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeFilter === c.id ? 'text-white shadow-md' : 'border border-[#E6C7A8] hover:border-[#C9943A]'}`}
                    style={{ background: activeFilter === c.id ? 'linear-gradient(to right,#C9943A,#8B4A2F)' : 'white', color: activeFilter === c.id ? 'white' : '#3D1F0D' }}>
                    {c.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 flex-shrink-0 hidden lg:block">{filtered.length} post{filtered.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </section>

        {/* ── Blog Content ──────────────────────────────────────── */}
        <section className="py-16">
          <div className="container-custom">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-2xl font-bold font-heading mb-2" style={{ color: '#3D1F0D' }}>No posts found</p>
                <p className="text-sm" style={{ color: '#6B3520' }}>Try a different filter or search term</p>
              </div>
            ) : (
              <>
                {/* Featured hero editorial (first featured) */}
                {heroBigPost && (
                  <div className="mb-12 animate-fade-up">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px flex-1" style={{ background: '#E6C7A8' }} />
                      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#C9943A' }}>Featured Story</span>
                      <div className="h-px flex-1" style={{ background: '#E6C7A8' }} />
                    </div>
                    <Link href={`/blog/${heroBigPost.slug}`}>
                      <div className="group grid md:grid-cols-2 gap-0 rounded-[32px] overflow-hidden border border-[#E6C7A8] shadow-lg hover:shadow-2xl transition-all duration-500 bg-white">
                        <div className="relative h-64 md:h-auto overflow-hidden">
                          {getImageUrl(heroBigPost.featured_image) ? (
                            <img src={getImageUrl(heroBigPost.featured_image)!} alt={heroBigPost.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          ) : <CoffeePlaceholder />}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                          <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                            style={{ background: CAT_COLORS[heroBigPost.category] || '#6B3520' }}>
                            {CATEGORIES.find(c => c.id === heroBigPost.category)?.label || heroBigPost.category}
                          </span>
                        </div>
                        <div className="flex flex-col justify-center p-8 md:p-10">
                          <div className="flex items-center gap-2 mb-4">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                            <span className="text-xs font-bold tracking-wider uppercase" style={{ color: '#C9943A' }}>Featured</span>
                          </div>
                          <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 group-hover:opacity-80 transition-opacity" style={{ color: '#1A0D07', lineHeight: 1.2 }}>
                            {heroBigPost.title}
                          </h2>
                          {heroBigPost.excerpt && (
                            <p className="text-sm leading-relaxed mb-6" style={{ color: '#6B3520' }}>
                              {heroBigPost.excerpt.slice(0, 160)}{heroBigPost.excerpt.length > 160 ? '…' : ''}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-xs mb-6" style={{ color: '#8B4A2F' }}>
                            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{heroBigPost.author}</span>
                            {heroBigPost.published_at && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(heroBigPost.published_at)}</span>}
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{heroBigPost.read_time}</span>
                          </div>
                          <span className="inline-flex items-center gap-2 font-semibold text-sm group-hover:gap-3 transition-all" style={{ color: '#C9943A' }}>
                            Read Story <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Featured rest — 2-column row */}
                {featuredRest.length > 0 && (
                  <div className={`grid gap-6 mb-12 ${featuredRest.length === 1 ? 'grid-cols-1 max-w-lg' : 'grid-cols-1 md:grid-cols-2'}`}>
                    {featuredRest.map(p => <BlogCard key={p.id} post={p} />)}
                  </div>
                )}

                {/* All posts grid */}
                {allPosts.length > 0 && (
                  <>
                    {(heroBigPost || featuredRest.length > 0) && (
                      <div className="flex items-center gap-3 mb-8">
                        <div className="h-px flex-1" style={{ background: '#E6C7A8' }} />
                        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#8B4A2F' }}>All Posts</span>
                        <div className="h-px flex-1" style={{ background: '#E6C7A8' }} />
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {allPosts.map(p => <BlogCard key={p.id} post={p} />)}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>

        {/* ── Newsletter ────────────────────────────────────────── */}
        <section className="py-16">
          <div className="container-custom">
            <div className="rounded-[36px] p-10 md:p-16 text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#120905 0%,#3D1F0D 60%,#1a0a06 100%)' }}>
              <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 50%,#C9943A 0%,transparent 70%)' }} />
              <div className="relative z-10">
                <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: '#C9943A' }}>Stay Updated</p>
                <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4" style={{ color: '#FFF7ED' }}>
                  Stay Updated with Coffee Stories
                </h2>
                <p className="text-base mb-8 max-w-md mx-auto" style={{ color: '#F5E6D3' }}>
                  Get brewing tips, café updates, offers and stories from Big Bean Café.
                </p>
                {subscribed ? (
                  <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white"
                    style={{ background: 'rgba(201,148,58,0.2)', border: '1.5px solid #C9943A' }}>
                    <span style={{ color: '#C9943A' }}>✓</span>
                    <span style={{ color: '#FFF7ED' }}>Thank you for subscribing!</span>
                  </div>
                ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    setSubLoading(true)
                    setSubMessage('')
                    try {
                      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, source: 'blog' }),
                      })
                      const d = await res.json()
                      if (d.success) { setSubscribed(true); setEmail(''); setSubMessage(d.message || 'Subscribed!') }
                      else { setSubMessage(d.message || 'Please enter a valid email.') }
                    } catch { setSubMessage('Unable to subscribe. Please try again.') }
                    finally { setSubLoading(false) }
                  }}
                    className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input type="email" required placeholder="Enter your email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="flex-1 px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#C9943A]/60 text-sm backdrop-blur-sm" />
                    <button type="submit"
                      className="px-8 py-3 rounded-full font-bold text-white transition-all hover:opacity-90 hover:scale-105 text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                      {subLoading ? "Joining..." : "Subscribe"}
                    </button>
                  </form>
                )}
                {subMessage && !subscribed && (
                  <p className="mt-3 text-sm font-semibold text-[#C9943A]">{subMessage}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function BlogCard({ post }: { post: BlogPost }) {
  const imgUrl = getImageUrl(post.featured_image)
  const catLabel = CATEGORIES.find(c => c.id === post.category)?.label || post.category

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group rounded-[24px] overflow-hidden border border-[#E6C7A8] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 bg-white h-full flex flex-col">
        <div className="relative h-52 overflow-hidden flex-shrink-0">
          {imgUrl ? (
            <img src={imgUrl} alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : <CoffeePlaceholder />}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {post.is_featured ? <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900">Featured</span> : null}
            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: CAT_COLORS[post.category] || '#6B3520' }}>{catLabel}</span>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold font-heading text-base mb-2 group-hover:opacity-75 transition-opacity line-clamp-2" style={{ color: '#1A0D07' }}>
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm leading-relaxed mb-4 line-clamp-3 flex-1" style={{ color: '#6B3520' }}>
              {post.excerpt}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs mt-auto pt-3 border-t border-[#F5E6D3]" style={{ color: '#8B4A2F' }}>
            <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
            {post.published_at && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.published_at)}</span>}
            <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" />{post.read_time}</span>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all" style={{ color: '#C9943A' }}>
            Read More <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </article>
    </Link>
  )
}

