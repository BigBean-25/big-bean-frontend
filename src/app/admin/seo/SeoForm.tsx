'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Info, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { adminApiFetch } from '@/utils/api'

interface SeoFormData {
  page_key: string
  page_name: string
  page_path: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  canonical_url: string
  og_title: string
  og_description: string
  twitter_title: string
  twitter_description: string
  robots_index: boolean
  robots_follow: boolean
  schema_json: string
  faq_schema_json: string
  status: string
}

const EMPTY: SeoFormData = {
  page_key: '', page_name: '', page_path: '', meta_title: '', meta_description: '',
  meta_keywords: '', canonical_url: '', og_title: '', og_description: '',
  twitter_title: '', twitter_description: '', robots_index: true, robots_follow: true,
  schema_json: '', faq_schema_json: '', status: 'active',
}

const CARD = 'rounded-[28px] border border-[#DCE8E3] bg-white shadow-[0_18px_45px_rgba(31,42,36,0.06)] p-6'

function CharCounter({ value, max, warn }: { value: string; max: number; warn: number }) {
  const len = value.length
  const color = len > warn ? 'text-red-500' : len > 0 ? 'text-[#2FBF9B]' : 'text-[#9CB3AC]'
  return (
    <span className={`text-[11px] font-bold ${color}`}>
      {len}/{max} {len > warn && '⚠ Too long'}
    </span>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-black text-[#0F1F1A]">{label}</label>
      {hint && <p className="mb-1.5 text-[11px] text-[#5F6F68]">{hint}</p>}
      {children}
    </div>
  )
}

const inputCls = 'w-full rounded-2xl border border-[#DCE8E3] bg-[#F9FDFB] px-4 py-2.5 text-sm text-[#0F1F1A] outline-none focus:border-[#2FBF9B] focus:ring-2 focus:ring-[#2FBF9B]/20 transition'
const textaCls = inputCls + ' resize-y'

interface FaqItem { question: string; answer: string }

function parseFaq(json: string): FaqItem[] {
  try { const p = JSON.parse(json); return Array.isArray(p) ? p : [] }
  catch { return [] }
}

function normalizeSeoForm(d?: (Partial<SeoFormData> & { id?: number }) | null): SeoFormData {
  return {
    page_key: d?.page_key ?? '',
    page_name: d?.page_name ?? '',
    page_path: d?.page_path ?? '',
    meta_title: d?.meta_title ?? '',
    meta_description: d?.meta_description ?? '',
    meta_keywords: d?.meta_keywords ?? '',
    canonical_url: d?.canonical_url ?? '',
    og_title: d?.og_title ?? '',
    og_description: d?.og_description ?? '',
    twitter_title: d?.twitter_title ?? '',
    twitter_description: d?.twitter_description ?? '',
    robots_index: !!d?.robots_index,
    robots_follow: !!d?.robots_follow,
    schema_json: d?.schema_json ?? '',
    faq_schema_json: d?.faq_schema_json ?? '',
    status: d?.status ?? 'active',
  }
}

interface Props {
  initialData?: Partial<SeoFormData> & { id?: number }
  mode: 'add' | 'edit'
}

export default function SeoForm({ initialData, mode }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<SeoFormData>(() => normalizeSeoForm({ ...EMPTY, ...initialData }))
  const [faqs, setFaqs] = useState<FaqItem[]>(() => parseFaq((initialData as Record<string, string>)?.faq_schema_json || ''))
  const [ogImageFile, setOgImageFile]         = useState<File | null>(null)
  const [twitterImageFile, setTwitterImageFile] = useState<File | null>(null)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const set = (k: keyof SeoFormData, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  const addFaq    = () => setFaqs(f => [...f, { question: '', answer: '' }])
  const removeFaq = (i: number) => setFaqs(f => f.filter((_, idx) => idx !== i))
  const setFaq    = (i: number, field: 'question' | 'answer', val: string) =>
    setFaqs(f => f.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      const faqJson = faqs.filter(f => f.question.trim()).length
        ? JSON.stringify(faqs.filter(f => f.question.trim()))
        : ''
      form.faq_schema_json = faqJson
      Object.entries(form).forEach(([k, v]) => {
        if (typeof v === 'boolean') fd.append(k, v ? '1' : '0')
        else fd.append(k, v as string)
      })
      if (ogImageFile)      fd.append('og_image',      ogImageFile)
      if (twitterImageFile) fd.append('twitter_image', twitterImageFile)

      const data = mode === 'add'
        ? await adminApiFetch('/seo-pages', { method: 'POST', body: fd })
        : await adminApiFetch(`/seo-pages/${initialData?.id}`, { method: 'PUT', body: fd })

      if (!data.success) { setError(data.message || 'Failed to save'); return }
      router.push('/admin/seo')
    } catch { setError('Network error') }
    finally { setSaving(false) }
  }

  const googlePreviewTitle = form.og_title || form.meta_title || 'Page Title'
  const googlePreviewDesc  = form.og_description || form.meta_description || 'Page description will appear here in Google search results.'
  const googlePreviewUrl   = form.canonical_url || `https://www.bigbeancafe.in${form.page_path || '/'}`

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/seo" className="rounded-xl p-2 text-[#5F6F68] hover:bg-[#F3F8F6] transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#0F1F1A]">
            {mode === 'add' ? 'Add SEO Page' : `Edit SEO — ${form.page_name}`}
          </h1>
          <p className="text-sm text-[#5F6F68]">Configure meta tags, Open Graph and social sharing.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Tips banner */}
      <div className="rounded-[20px] border border-[#DCE8E3] bg-gradient-to-r from-[#EAF8F3] to-[#FFF7ED] px-5 py-4">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 shrink-0 text-[#2FBF9B] mt-0.5" />
          <div className="text-xs text-[#42564D] space-y-0.5">
            <p><strong>Meta Title:</strong> 50–60 characters recommended. Unique for every page.</p>
            <p><strong>Meta Description:</strong> 140–160 characters. Describe the page clearly — no keyword stuffing.</p>
            <p><strong>OG Title/Description:</strong> Used for Facebook, WhatsApp link previews.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-5">

          {/* Page identity */}
          <div className={CARD}>
            <p className="mb-4 text-sm font-black uppercase tracking-wider text-[#9CB3AC]">Page Identity</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Page Key *" hint="Unique identifier e.g. about">
                <input required value={form.page_key ?? ''} onChange={e => set('page_key', e.target.value)}
                  className={inputCls} placeholder="about" />
              </Field>
              <Field label="Page Name *">
                <input required value={form.page_name ?? ''} onChange={e => set('page_name', e.target.value)}
                  className={inputCls} placeholder="About Us" />
              </Field>
              <Field label="Page Path *">
                <input required value={form.page_path ?? ''} onChange={e => set('page_path', e.target.value)}
                  className={inputCls} placeholder="/about" />
              </Field>
            </div>
          </div>

          {/* Core SEO */}
          <div className={CARD}>
            <p className="mb-4 text-sm font-black uppercase tracking-wider text-[#9CB3AC]">Core SEO</p>
            <div className="space-y-4">
              <Field label="Meta Title">
                <input value={form.meta_title ?? ''} onChange={e => set('meta_title', e.target.value)}
                  className={inputCls} placeholder="Big Bean Café | Best Café in Bengaluru" maxLength={120} />
                <div className="mt-1 flex justify-between">
                  <CharCounter value={form.meta_title ?? ''} max={60} warn={65} />
                </div>
              </Field>
              <Field label="Meta Description">
                <textarea rows={3} value={form.meta_description ?? ''} onChange={e => set('meta_description', e.target.value)}
                  className={textaCls} placeholder="Visit Big Bean Café for handcrafted coffee, fresh food and cozy café experiences..." maxLength={300} />
                <div className="mt-1 flex justify-between">
                  <CharCounter value={form.meta_description ?? ''} max={160} warn={170} />
                </div>
              </Field>
              <Field label="Meta Keywords" hint="Comma-separated. Optional.">
                <input value={form.meta_keywords ?? ''} onChange={e => set('meta_keywords', e.target.value)}
                  className={inputCls} placeholder="coffee, café, Bengaluru, espresso" />
              </Field>
              <Field label="Canonical URL" hint="Leave blank to auto-generate.">
                <input value={form.canonical_url ?? ''} onChange={e => set('canonical_url', e.target.value)}
                  className={inputCls} placeholder="https://www.bigbeancafe.in/about" />
              </Field>
            </div>
          </div>

          {/* Open Graph */}
          <div className={CARD}>
            <p className="mb-4 text-sm font-black uppercase tracking-wider text-[#9CB3AC]">Open Graph (Facebook / WhatsApp)</p>
            <div className="space-y-4">
              <Field label="OG Title">
                <input value={form.og_title ?? ''} onChange={e => set('og_title', e.target.value)}
                  className={inputCls} placeholder="Falls back to Meta Title if empty" />
              </Field>
              <Field label="OG Description">
                <textarea rows={2} value={form.og_description ?? ''} onChange={e => set('og_description', e.target.value)}
                  className={textaCls} placeholder="Falls back to Meta Description if empty" />
              </Field>
              <Field label="OG Image" hint="Recommended: 1200×630px">
                <input type="file" accept="image/*" onChange={e => setOgImageFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-[#5F6F68] file:mr-3 file:rounded-full file:border-0 file:bg-[#EAF8F3] file:px-4 file:py-2 file:text-xs file:font-black file:text-[#167E68]" />
              </Field>
            </div>
          </div>

          {/* Twitter */}
          <div className={CARD}>
            <p className="mb-4 text-sm font-black uppercase tracking-wider text-[#9CB3AC]">Twitter Card</p>
            <div className="space-y-4">
              <Field label="Twitter Title">
                <input value={form.twitter_title ?? ''} onChange={e => set('twitter_title', e.target.value)}
                  className={inputCls} placeholder="Falls back to OG Title" />
              </Field>
              <Field label="Twitter Description">
                <textarea rows={2} value={form.twitter_description ?? ''} onChange={e => set('twitter_description', e.target.value)}
                  className={textaCls} placeholder="Falls back to OG Description" />
              </Field>
              <Field label="Twitter Image" hint="Recommended: 1200×628px">
                <input type="file" accept="image/*" onChange={e => setTwitterImageFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-[#5F6F68] file:mr-3 file:rounded-full file:border-0 file:bg-[#EAF8F3] file:px-4 file:py-2 file:text-xs file:font-black file:text-[#167E68]" />
              </Field>
            </div>
          </div>

          {/* FAQ Schema */}
          <div className={CARD}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-black uppercase tracking-wider text-[#9CB3AC]">FAQ Schema (Optional)</p>
              <button type="button" onClick={addFaq}
                className="flex items-center gap-1.5 rounded-full bg-[#EAF8F3] px-3 py-1.5 text-xs font-black text-[#167E68] hover:bg-[#2FBF9B] hover:text-white transition">
                <Plus className="h-3.5 w-3.5" /> Add FAQ
              </button>
            </div>
            {faqs.length === 0 && (
              <p className="text-xs text-[#9CB3AC] text-center py-4">No FAQs yet — click Add FAQ to build a FAQPage schema for this page.</p>
            )}
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-2xl border border-[#DCE8E3] bg-[#F9FDFB] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#5F6F68]">Q{i + 1}</span>
                    <button type="button" onClick={() => removeFaq(i)}
                      className="rounded-lg p-1 text-red-400 hover:bg-red-50 transition">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input value={faq.question ?? ''} onChange={e => setFaq(i, 'question', e.target.value)}
                    className={inputCls} placeholder="e.g. Where is Big Bean Café located?" />
                  <textarea rows={2} value={faq.answer ?? ''} onChange={e => setFaq(i, 'answer', e.target.value)}
                    className={textaCls} placeholder="e.g. Big Bean Café has multiple outlets across Bengaluru." />
                </div>
              ))}
            </div>
          </div>

          {/* Advanced */}
          <div className={CARD}>
            <p className="mb-4 text-sm font-black uppercase tracking-wider text-[#9CB3AC]">Advanced</p>
            <div className="space-y-4">
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.robots_index} onChange={e => set('robots_index', e.target.checked)}
                    className="h-4 w-4 accent-[#2FBF9B]" />
                  <span className="text-sm font-bold text-[#0F1F1A]">Allow Index</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.robots_follow} onChange={e => set('robots_follow', e.target.checked)}
                    className="h-4 w-4 accent-[#2FBF9B]" />
                  <span className="text-sm font-bold text-[#0F1F1A]">Allow Follow</span>
                </label>
              </div>
              <Field label="Schema JSON" hint="Optional JSON-LD structured data.">
                <textarea rows={4} value={form.schema_json ?? ''} onChange={e => set('schema_json', e.target.value)}
                  className={textaCls + ' font-mono text-xs'} placeholder='{ "@context": "https://schema.org", ... }' />
              </Field>
              <Field label="Status">
                <select value={form.status ?? 'active'} onChange={e => set('status', e.target.value)} className={inputCls}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
            </div>
          </div>
        </div>

        {/* Right column — Google Preview */}
        <div className="space-y-5">
          <div className={CARD}>
            <p className="mb-3 text-sm font-black uppercase tracking-wider text-[#9CB3AC] flex items-center gap-2">
              <Eye className="h-4 w-4" /> Google Preview
            </p>
            <div className="rounded-2xl border border-[#DCE8E3] bg-[#F9FDFB] p-4 space-y-1">
              <p className="text-[13px] text-[#1A0DAB] font-medium leading-snug line-clamp-2">
                {googlePreviewTitle || 'Page Title'}
              </p>
              <p className="text-[12px] text-[#006621] truncate">
                {googlePreviewUrl}
              </p>
              <p className="text-[12px] text-[#545454] leading-relaxed line-clamp-3">
                {googlePreviewDesc}
              </p>
            </div>
            <div className="mt-3 space-y-1.5 text-[11px] text-[#5F6F68]">
              <p className={form.meta_title.length > 65 ? 'text-red-500 font-bold' : ''}>
                Title: {form.meta_title.length} chars {form.meta_title.length > 65 ? '— too long!' : '(aim for 50–60)'}
              </p>
              <p className={form.meta_description.length > 170 ? 'text-red-500 font-bold' : ''}>
                Desc: {form.meta_description.length} chars {form.meta_description.length > 170 ? '— too long!' : '(aim for 140–160)'}
              </p>
            </div>
          </div>

          {/* Save */}
          <div className={CARD + ' flex flex-col gap-3'}>
            <button type="submit" disabled={saving}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#3D1F0D] px-6 py-3 text-sm font-black text-white transition hover:bg-[#2FBF9B] disabled:opacity-60">
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : mode === 'add' ? 'Create SEO Page' : 'Save Changes'}
            </button>
            <Link href="/admin/seo"
              className="flex items-center justify-center rounded-2xl border border-[#DCE8E3] px-6 py-3 text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6] transition">
              Cancel
            </Link>
          </div>

          {/* Example tips */}
          <div className="rounded-[20px] border border-[#DCE8E3] bg-[#F9FDFB] p-4 space-y-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-[#9CB3AC]">Good Examples</p>
            <div>
              <p className="text-[10px] font-black text-[#2FBF9B] uppercase">Title</p>
              <p className="text-[11px] text-[#0F1F1A]">Big Bean Café Coffee Roasters | Best Café in Bengaluru</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#2FBF9B] uppercase">Description</p>
              <p className="text-[11px] text-[#0F1F1A]">Visit Big Bean Café for handcrafted coffee, fresh food, desserts and cozy café experiences across Bengaluru outlets.</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
