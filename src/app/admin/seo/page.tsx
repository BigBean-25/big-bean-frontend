'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, Plus, Edit, Trash2, Globe, CheckCircle, XCircle,
  AlertTriangle, Info, Settings
} from 'lucide-react'
import { adminApiFetch } from '@/utils/api'

interface SeoPage {
  id: number
  page_key: string
  page_name: string
  page_path: string
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  canonical_url: string | null
  robots_index: number
  robots_follow: number
  status: string
}

function healthScore(p: SeoPage): number {
  let score = 0
  if (p.meta_title)       score += 20
  if (p.meta_title && p.meta_title.length >= 50 && p.meta_title.length <= 60) score += 15
  if (p.meta_description) score += 20
  if (p.meta_description && p.meta_description.length >= 140 && p.meta_description.length <= 160) score += 15
  if (p.og_image)         score += 15
  if (p.canonical_url)    score += 5
  if (p.robots_index)     score += 5
  if (p.robots_follow)    score += 5
  return score
}

type HealthTier = 'good' | 'needs-work' | 'poor'

function getTier(score: number): HealthTier {
  if (score >= 80) return 'good'
  if (score >= 50) return 'needs-work'
  return 'poor'
}

const TIER_STYLE: Record<HealthTier, { label: string; bg: string; text: string; border: string }> = {
  'good':       { label: 'Good',       bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  'needs-work': { label: 'Needs Work', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  'poor':       { label: 'Poor',       bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
}

type FilterTab = 'all' | HealthTier

export default function AdminSeo() {
  const [pages, setPages]     = useState<SeoPage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [tab, setTab]         = useState<FilterTab>('all')

  const load = async () => {
    setLoading(true)
    try {
      const data = await adminApiFetch('/seo-pages')
      setPages(data.success ? data.data : [])
    } catch { setPages([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete SEO for "${name}"?`)) return
    try {
      await adminApiFetch(`/seo-pages/${id}`, { method: 'DELETE' })
      load()
    } catch { /* error handled by adminApiFetch */ }
  }

  const withScores = pages.map(p => ({ ...p, score: healthScore(p), tier: getTier(healthScore(p)) }))

  const counts = {
    all:          withScores.length,
    good:         withScores.filter(p => p.tier === 'good').length,
    'needs-work': withScores.filter(p => p.tier === 'needs-work').length,
    poor:         withScores.filter(p => p.tier === 'poor').length,
  }

  const filtered = withScores.filter(p => {
    const matchSearch = p.page_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.meta_title || '').toLowerCase().includes(search.toLowerCase()) ||
      p.page_path.toLowerCase().includes(search.toLowerCase())
    const matchTab = tab === 'all' || p.tier === tab
    return matchSearch && matchTab
  })

  const CARD = 'rounded-[28px] border border-[#DCE8E3] bg-white shadow-[0_18px_45px_rgba(31,42,36,0.06)]'

  const TABS: { key: FilterTab; label: string; color: string }[] = [
    { key: 'all',        label: `All (${counts.all})`,                   color: 'text-[#0F1F1A]' },
    { key: 'good',       label: `Good (${counts.good})`,                 color: 'text-green-700' },
    { key: 'needs-work', label: `Needs Work (${counts['needs-work']})`,  color: 'text-yellow-700' },
    { key: 'poor',       label: `Poor (${counts.poor})`,                 color: 'text-red-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F1F1A]">SEO Management</h1>
          <p className="text-sm text-[#5F6F68] mt-0.5">Manage meta titles, descriptions, schemas and social sharing for every page.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/seo/settings"
            className="flex items-center gap-2 rounded-full border border-[#DCE8E3] bg-white px-4 py-2.5 text-sm font-bold text-[#3D1F0D] hover:bg-[#F3F8F6] transition-colors">
            <Settings className="h-4 w-4" /> SEO Settings
          </Link>
          <Link href="/admin/seo/add"
            className="flex items-center gap-2 rounded-full bg-[#3D1F0D] px-5 py-2.5 text-sm font-black text-white hover:bg-[#2FBF9B] transition-colors">
            <Plus className="h-4 w-4" /> Add SEO Page
          </Link>
        </div>
      </div>

      {/* SEO Checklist Note */}
      <div className={`${CARD} p-4 flex gap-3 items-start`}>
        <Info className="w-4 h-4 text-[#2FBF9B] mt-0.5 shrink-0" />
        <div className="text-xs text-[#5F6F68] space-y-0.5">
          <p className="font-bold text-[#0F1F1A]">SEO Image Alt Text Reminder</p>
          <p>Every uploaded image should have meaningful alt text — home banners, blog images, gallery, merchandise, and outlet images all benefit from descriptive alt attributes for accessibility and SEO. Edit those sections individually to add alt text fields.</p>
        </div>
      </div>

      {/* Search + Tabs */}
      <div className={`${CARD} p-4 space-y-3`}>
        <div className="flex items-center gap-2.5 rounded-full border border-[#DCE8E3] bg-[#F3F8F6] px-4 py-2.5">
          <Search className="h-4 w-4 text-[#9CB3AC]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search pages..."
            className="flex-1 bg-transparent text-sm text-[#0F1F1A] outline-none placeholder:text-[#9CB3AC]" />
        </div>
        <div className="flex flex-wrap gap-2">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-black border transition-all ${
                tab === t.key
                  ? 'bg-[#3D1F0D] text-white border-[#3D1F0D]'
                  : `bg-white ${t.color} border-[#DCE8E3] hover:border-[#3D1F0D]`
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={`${CARD} overflow-hidden`}>
        {loading ? (
          <div className="p-8 text-center text-sm text-[#9CB3AC]">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DCE8E3] bg-[#F9FDFB]">
                  {['Page', 'Path', 'Meta Title', 'Description', 'Health', 'Flags', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-[#9CB3AC]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-[#9CB3AC]">No SEO pages found.</td></tr>
                )}
                {filtered.map(p => {
                  const ts = TIER_STYLE[p.tier]
                  const titleOk  = !!p.meta_title && p.meta_title.length >= 50 && p.meta_title.length <= 60
                  const descOk   = !!p.meta_description && p.meta_description.length >= 140 && p.meta_description.length <= 160
                  const titleLen = p.meta_title?.length ?? 0
                  const descLen  = p.meta_description?.length ?? 0
                  return (
                    <tr key={p.id} className="border-b border-[#F3F8F6] hover:bg-[#F9FDFB] transition-colors">

                      {/* Page */}
                      <td className="px-5 py-3.5 font-black text-[#0F1F1A] whitespace-nowrap">{p.page_name}</td>

                      {/* Path */}
                      <td className="px-5 py-3.5 text-[#5F6F68]">
                        <a href={p.page_path} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-[#2FBF9B] whitespace-nowrap">
                          <Globe className="h-3.5 w-3.5 shrink-0" />{p.page_path}
                        </a>
                      </td>

                      {/* Meta Title */}
                      <td className="px-5 py-3.5 max-w-[200px]">
                        {p.meta_title
                          ? <><p className="truncate text-[#0F1F1A]">{p.meta_title}</p>
                              <p className={`text-[10px] mt-0.5 font-bold ${titleOk ? 'text-[#2FBF9B]' : titleLen > 60 ? 'text-red-500' : 'text-yellow-600'}`}>
                                {titleLen}/60
                              </p></>
                          : <span className="text-[#9CB3AC] text-xs">Missing</span>
                        }
                      </td>

                      {/* Description */}
                      <td className="px-5 py-3.5">
                        {p.meta_description
                          ? <span className={`text-xs font-bold ${descOk ? 'text-[#2FBF9B]' : descLen > 160 ? 'text-red-500' : 'text-yellow-600'}`}>
                              {descLen} chars
                            </span>
                          : <span className="text-[#9CB3AC] text-xs">Missing</span>
                        }
                      </td>

                      {/* Health Score */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black border ${ts.bg} ${ts.text} ${ts.border}`}>
                            {p.score}% {ts.label}
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-[#E5EDE9] overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${p.tier === 'good' ? 'bg-green-500' : p.tier === 'needs-work' ? 'bg-yellow-400' : 'bg-red-400'}`}
                              style={{ width: `${p.score}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Flags */}
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5 items-center flex-wrap">
                          {p.robots_index ? <CheckCircle className="h-4 w-4 text-[#2FBF9B]" aria-label="Indexed" /> : <XCircle className="h-4 w-4 text-red-400" aria-label="Not Indexed" />}
                          {p.og_image ? <CheckCircle className="h-3.5 w-3.5 text-[#2FBF9B]" aria-label="OG Image" /> : <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" aria-label="No OG Image" />}
                          {p.canonical_url ? <CheckCircle className="h-3.5 w-3.5 text-[#2FBF9B]" aria-label="Canonical" /> : <AlertTriangle className="h-3.5 w-3.5 text-gray-300" aria-label="No Canonical" />}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/seo/${p.id}/edit`}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors">
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button onClick={() => handleDelete(p.id, p.page_name)}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Score Legend */}
      <div className={`${CARD} p-4`}>
        <p className="text-xs font-black text-[#0F1F1A] mb-3">Health Score Breakdown</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-[#5F6F68]">
          {[
            { label: 'Meta title exists',          pts: '+20' },
            { label: 'Title 50–60 chars',          pts: '+15' },
            { label: 'Meta description exists',    pts: '+20' },
            { label: 'Description 140–160 chars',  pts: '+15' },
            { label: 'OG image exists',            pts: '+15' },
            { label: 'Canonical URL set',          pts: '+5'  },
            { label: 'Index enabled',              pts: '+5'  },
            { label: 'Follow enabled',             pts: '+5'  },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between bg-[#F3F8F6] rounded-xl px-3 py-2">
              <span>{item.label}</span>
              <span className="font-black text-[#2FBF9B]">{item.pts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
