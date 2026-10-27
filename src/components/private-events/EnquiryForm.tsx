'use client'

import { useEffect, useRef, useState } from 'react'
import type { Outlet } from '@/lib/outlets'
import { CheckCircle2, Loader2, Send } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface EnquiryPrefill {
  occasion?: string
  outlet?: string
  intent?: string
  venueVisit?: boolean
}

const OCCASION_OPTIONS: { value: string; label: string }[] = [
  { value: 'birthday', label: 'Birthday party' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'family', label: 'Family get-together' },
  { value: 'reunion', label: 'Friends / reunion' },
  { value: 'corporate', label: 'Corporate meeting / team event' },
  { value: 'farewell', label: 'Farewell / office celebration' },
  { value: 'baby-shower', label: 'Baby shower' },
  { value: 'engagement', label: 'Engagement / pre-wedding gathering' },
  { value: 'workshop', label: 'Workshop / community meetup' },
  { value: 'group-dining', label: 'Group lunch / dinner' },
  { value: 'other', label: 'Other' },
]

const TIME_OPTIONS = ['', 'Time not decided', 'Morning', 'Afternoon', 'Evening']
const DURATION_OPTIONS = ['', '1–2 hours', '2–3 hours', '3–4 hours', 'Half day', 'Full day']

interface FormState {
  full_name: string
  phone: string
  email: string
  outlet_slug: string
  occasion: string
  event_date: string
  date_not_decided: boolean
  preferred_time: string
  duration: string
  guest_count: string
  food_preferences: string
  requirements: string
  venue_visit_requested: boolean
  consent: boolean
  website: string // honeypot
}

const EMPTY: FormState = {
  full_name: '', phone: '', email: '', outlet_slug: '', occasion: '',
  event_date: '', date_not_decided: false, preferred_time: '', duration: '',
  guest_count: '', food_preferences: '', requirements: '',
  venue_visit_requested: false, consent: false, website: '',
}

const inputCls =
  'w-full rounded-xl border border-[#E4D5BF] bg-white px-4 py-3 text-base text-[#3D1F0D] placeholder-[#B09880] transition focus:border-[#C9943A] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/25 sm:text-sm'
const labelCls = 'mb-1.5 block text-xs font-black uppercase tracking-[0.08em] text-[#6B4F3A]'
const errCls = 'mt-1 text-xs font-semibold text-[#A92517]'
const fieldErr = 'border-[#A92517] focus:border-[#A92517] focus:ring-[#A92517]/20'

type FormOutlet = Outlet & { _label?: string }

export default function EnquiryForm({
  outlets,
  prefill,
  onSubmitted,
}: {
  outlets: FormOutlet[]
  prefill: EnquiryPrefill
  onSubmitted?: () => void
}) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitLock, setSubmitLock] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const submittingRef = useRef(false)

  // Card clicks / CTAs push prefill values into the form
  useEffect(() => {
    if (!prefill || Object.keys(prefill).length === 0) return
    setForm((f) => ({
      ...f,
      occasion: prefill.occasion ?? f.occasion,
      outlet_slug: prefill.outlet ?? f.outlet_slug,
      venue_visit_requested: prefill.venueVisit ? true : f.venue_visit_requested,
    }))
  }, [prefill])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => (e[key] ? { ...e, [key]: '' } : e))
  }

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {}
    if (form.full_name.trim().length < 2) e.full_name = 'Enter your name.'
    if (!/^[+]?[\d\s()-]{8,20}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number with country code.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address.'
    if (!form.outlet_slug) e.outlet_slug = 'Choose an outlet or Help me choose.'
    if (!form.occasion) e.occasion = 'Choose what you are planning.'
    if (!form.date_not_decided && !form.event_date) e.event_date = 'Choose a date or Date not decided.'
    const guests = parseInt(form.guest_count, 10)
    if (!Number.isInteger(guests) || guests < 1 || guests > 500) e.guest_count = 'Enter an expected guest count.'
    if (!form.consent) e.consent = 'Please agree to be contacted about this enquiry.'
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (submittingRef.current) return
    setServerError(null)

    const clientErrors = validate()
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors)
      const first = document.querySelector('[data-error="true"]')
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/private-event-enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          phone: form.phone,
          email: form.email.trim(),
          outlet_slug: form.outlet_slug,
          occasion: form.occasion,
          event_date: form.date_not_decided ? undefined : form.event_date,
          date_not_decided: form.date_not_decided,
          preferred_time: form.preferred_time || undefined,
          duration: form.duration || undefined,
          guest_count: parseInt(form.guest_count, 10),
          food_preferences: form.food_preferences || undefined,
          requirements: form.requirements || undefined,
          venue_visit_requested: form.venue_visit_requested,
          enquiry_intent: prefill.intent || 'general',
          consent: form.consent,
          website: form.website, // honeypot
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok && data?.success) {
        setSuccess(data?.data?.reference || '')
        setErrors({})
        onSubmitted?.() // fires GA4 generate_lead — only after confirmed storage
        return
      }
      if (res.status === 422 && data?.errors) {
        const map: Record<string, string> = {}
        const alias: Record<string, string> = { outlet: 'outlet_slug' }
        for (const [k, v] of Object.entries(data.errors)) {
          map[alias[k] || k] = String(v)
        }
        setErrors(map)
        setServerError(null)
        return
      }
      if (res.status === 409) {
        setSuccess(data?.data?.reference || 'existing')
        setErrors({})
        return
      }
      setServerError(data?.message || 'We could not send your enquiry. Please try again or email info@bigbeancafe.in.')
    } catch {
      setServerError('We could not send your enquiry. Please try again or email info@bigbeancafe.in.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
      setSubmitLock(true)
      setTimeout(() => setSubmitLock(false), 3000) // block rapid resubmits
    }
  }

  if (success !== null) {
    return (
      <div className="rounded-[32px] border border-[#C9DFB5] bg-white p-8 text-center shadow-[0_24px_70px_rgba(61,31,13,0.08)] sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF8F3]">
          <CheckCircle2 className="h-8 w-8 text-[#167E68]" />
        </span>
        <h3 className="font-heading mt-6 text-2xl font-black text-[#3D1F0D]">
          Your event enquiry has been received.
        </h3>
        {success && success !== 'existing' && (
          <p className="mt-2 inline-block rounded-full bg-[#F5EBDD] px-4 py-1.5 font-mono text-xs font-bold text-[#8B4A2F]">
            Ref: {success}
          </p>
        )}
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#6B4F3A]">
          Thank you for sharing your plans. Our team will contact you using the details provided to discuss your
          preferred outlet and arrangements. Your booking is not confirmed yet.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-[32px] border border-[#EADCC8] bg-white p-6 shadow-[0_24px_70px_rgba(61,31,13,0.08)] sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Honeypot — invisible to humans */}
        <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="pe-website">Website</label>
          <input
            id="pe-website" type="text" name="website" tabIndex={-1} autoComplete="off"
            value={form.website} onChange={(e) => set('website', e.target.value)}
          />
        </div>

        <div className="sm:col-span-2" data-error={!!errors.full_name || undefined}>
          <label htmlFor="pe-name" className={labelCls}>Full name *</label>
          <input
            id="pe-name" type="text" autoComplete="name" required
            value={form.full_name} onChange={(e) => set('full_name', e.target.value)}
            className={`${inputCls} ${errors.full_name ? fieldErr : ''}`} placeholder="Your full name"
          />
          {errors.full_name && <p className={errCls} role="alert">{errors.full_name}</p>}
        </div>

        <div data-error={!!errors.phone || undefined}>
          <label htmlFor="pe-phone" className={labelCls}>Phone number with country code *</label>
          <input
            id="pe-phone" type="tel" autoComplete="tel" inputMode="tel" required
            value={form.phone} onChange={(e) => set('phone', e.target.value)}
            className={`${inputCls} ${errors.phone ? fieldErr : ''}`} placeholder="+91 98765 43210"
          />
          {errors.phone && <p className={errCls} role="alert">{errors.phone}</p>}
        </div>

        <div data-error={!!errors.email || undefined}>
          <label htmlFor="pe-email" className={labelCls}>Email *</label>
          <input
            id="pe-email" type="email" autoComplete="email" required
            value={form.email} onChange={(e) => set('email', e.target.value)}
            className={`${inputCls} ${errors.email ? fieldErr : ''}`} placeholder="you@example.com"
          />
          {errors.email && <p className={errCls} role="alert">{errors.email}</p>}
        </div>

        <div data-error={!!errors.outlet_slug || undefined}>
          <label htmlFor="pe-outlet" className={labelCls}>Preferred outlet *</label>
          <select
            id="pe-outlet" required
            value={form.outlet_slug} onChange={(e) => set('outlet_slug', e.target.value)}
            className={`${inputCls} ${errors.outlet_slug ? fieldErr : ''}`}
          >
            <option value="">Select an outlet</option>
            {outlets.map((o, i) => (
              <option key={o.slug || `outlet-${i}`} value={o.slug || ''}>{o._label || o.name}</option>
            ))}
            <option value="help-me-choose">Help me choose</option>
          </select>
          {errors.outlet_slug && <p className={errCls} role="alert">{errors.outlet_slug}</p>}
        </div>

        <div data-error={!!errors.occasion || undefined}>
          <label htmlFor="pe-occasion" className={labelCls}>What are you planning? *</label>
          <select
            id="pe-occasion" required
            value={form.occasion} onChange={(e) => set('occasion', e.target.value)}
            className={`${inputCls} ${errors.occasion ? fieldErr : ''}`}
          >
            <option value="">Select an occasion</option>
            {OCCASION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.occasion && <p className={errCls} role="alert">{errors.occasion}</p>}
        </div>

        <div data-error={!!errors.event_date || undefined}>
          <label htmlFor="pe-date" className={labelCls}>Preferred event date *</label>
          <input
            id="pe-date" type="date" required={!form.date_not_decided}
            disabled={form.date_not_decided}
            value={form.event_date} onChange={(e) => set('event_date', e.target.value)}
            className={`${inputCls} disabled:cursor-not-allowed disabled:opacity-50 ${errors.event_date ? fieldErr : ''}`}
          />
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#6B4F3A]">
            <input
              type="checkbox"
              checked={form.date_not_decided}
              onChange={(e) => { set('date_not_decided', e.target.checked); if (e.target.checked) set('event_date', '') }}
              className="h-4 w-4 rounded border-[#E4D5BF] text-[#C9943A] focus:ring-[#C9943A]/40"
            />
            Date not decided yet
          </label>
          {errors.event_date && <p className={errCls} role="alert">{errors.event_date}</p>}
        </div>

        <div data-error={!!errors.guest_count || undefined}>
          <label htmlFor="pe-guests" className={labelCls}>Expected number of guests *</label>
          <input
            id="pe-guests" type="number" min={1} max={500} inputMode="numeric" required
            value={form.guest_count} onChange={(e) => set('guest_count', e.target.value)}
            className={`${inputCls} ${errors.guest_count ? fieldErr : ''}`} placeholder="e.g. 40"
          />
          {errors.guest_count && <p className={errCls} role="alert">{errors.guest_count}</p>}
        </div>

        <div>
          <label htmlFor="pe-time" className={labelCls}>Preferred start time</label>
          <select
            id="pe-time" value={form.preferred_time}
            onChange={(e) => set('preferred_time', e.target.value)} className={inputCls}
          >
            {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t || 'Any time'}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="pe-duration" className={labelCls}>Duration</label>
          <select
            id="pe-duration" value={form.duration}
            onChange={(e) => set('duration', e.target.value)} className={inputCls}
          >
            {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d || 'Flexible'}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="pe-food" className={labelCls}>Food preferences</label>
          <textarea
            id="pe-food" rows={2}
            value={form.food_preferences} onChange={(e) => set('food_preferences', e.target.value)}
            className={`${inputCls} resize-y`} placeholder="e.g. Mostly vegetarian, coffee pairings, dessert table…"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="pe-req" className={labelCls}>Anything else we should know?</label>
          <textarea
            id="pe-req" rows={3}
            value={form.requirements} onChange={(e) => set('requirements', e.target.value)}
            className={`${inputCls} resize-y`} placeholder="Anything we should know — allergies, layout, access needs, equipment…"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-3 text-sm font-semibold text-[#6B4F3A]">
            <input
              type="checkbox"
              checked={form.venue_visit_requested}
              onChange={(e) => set('venue_visit_requested', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[#E4D5BF] text-[#C9943A] focus:ring-[#C9943A]/40"
            />
            I would like to visit the venue before deciding
          </label>
        </div>

        <div className="sm:col-span-2" data-error={!!errors.consent || undefined}>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-[#6B4F3A]">
            <input
              type="checkbox" required
              checked={form.consent}
              onChange={(e) => set('consent', e.target.checked)}
              className={`mt-0.5 h-4 w-4 rounded border-[#E4D5BF] text-[#C9943A] focus:ring-[#C9943A]/40 ${errors.consent ? 'outline outline-1 outline-[#A92517]' : ''}`}
            />
            <span>
              I agree to be contacted about this enquiry and have read the{' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-bold text-[#8B4A2F] underline-offset-2 hover:underline">
                Privacy Policy
              </a>
              . *
            </span>
          </label>
          {errors.consent && <p className={errCls} role="alert">{errors.consent}</p>}
        </div>
      </div>

      {serverError && (
        <p className="mt-4 rounded-xl border border-[#A92517]/30 bg-[#A92517]/5 px-4 py-3 text-sm font-semibold text-[#A92517]" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || submitLock}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3D1F0D] text-xs font-black uppercase tracking-[0.14em] text-[#FFF7ED] shadow-[0_10px_28px_rgba(61,31,13,0.25)] transition hover:bg-[#5A2D1D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9943A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending your enquiry...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Send Event Enquiry
          </>
        )}
      </button>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-[#8A7059]">
        Share your preferred outlet and gathering details. Availability and arrangements will be discussed with
        you before a booking is confirmed.
      </p>
    </form>
  )
}
