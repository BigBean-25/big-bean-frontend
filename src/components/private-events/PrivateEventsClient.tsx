'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Outlet } from '@/lib/outlets'
import EnquiryForm, { type EnquiryPrefill } from './EnquiryForm'
import {
  ArrowRight, MapPin, Phone, Cake, Users, Heart, Briefcase,
  Users2, HeartHandshake, PartyPopper, Baby, Gem, Presentation,
  UtensilsCrossed, ChevronDown, X,
  CalendarRange, Quote,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace(/\/api$/, '')

const imgUrl = (img?: string | null) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag(...args)
  }
}

interface Hero {
  eyebrow: string | null
  heading: string
  description: string | null
  supporting_text: string | null
  primary_cta_text: string | null
  secondary_cta_text: string | null
  image: string | null
  mobile_image: string | null
  image_alt: string | null
}

interface GalleryItem {
  id: number
  image: string
  outlet_slug: string | null
  outlet_name: string | null
  caption: string | null
  alt_text: string | null
  status?: string | null
  sort_order?: number | null
}

type PageOutlet = Outlet & { _label?: string }

/* ── Event types — approved PDF copy ─────────────────────────────── */
const EVENT_TYPES: { key: string; label: string; desc: string; Icon: any }[] = [
  { key: 'birthday',    label: 'Birthday Parties',                        desc: 'Bring friends and family together for a birthday party with food, conversation and time to celebrate. Share your guest count, preferred outlet and date, along with any cake or decoration requests, so the team can confirm what can be arranged before you book.', Icon: Cake },
  { key: 'corporate',   label: 'Corporate Meetings & Team Events',        desc: 'Plan a team lunch, an informal office get-together or a small business gathering at a location convenient for your group. Include your timings, seating needs and any presentation or equipment requirements in the enquiry so the outlet can advise on suitability.', Icon: Briefcase },
  { key: 'family',      label: 'Family Get-Togethers & Celebrations',     desc: 'Make time for an anniversary, a family catch-up or another occasion worth sharing. Tell us about your group, the kind of meal you have in mind and any access or dietary needs that will help you plan the visit.', Icon: Users },
  { key: 'reunion',     label: "Friends' Get-Togethers & Reunions",       desc: 'Bring your friends, classmates or extended group together for a reunion or catch-up. Share your expected numbers and food preferences so seating and meal arrangements can be discussed before the day.', Icon: HeartHandshake },
  { key: 'anniversary', label: 'Anniversary Celebrations',                desc: 'Celebrate a relationship milestone with the people closest to you. Enquire about the outlet, seating and food arrangements for an anniversary lunch, dinner or gathering.', Icon: Heart },
  { key: 'farewell',    label: 'Farewell Parties & Office Celebrations',  desc: "Arrange a farewell, a colleague's birthday, a work anniversary or a team milestone. Share the occasion, timings and group size so the outlet can review your celebration plans.", Icon: PartyPopper },
  { key: 'baby-shower', label: 'Baby Showers & Family Occasions',         desc: 'Enquire about a baby shower or another small family occasion. Include your seating, decoration and access requests so the team can confirm whether the selected outlet suits the gathering.', Icon: Baby },
  { key: 'engagement',  label: 'Small Engagement & Pre-Wedding Gatherings', desc: 'Bring close family and friends together for a small engagement celebration or a pre-wedding get-together. Discuss your guest count, timing and setup requests with the team before confirming the venue.', Icon: Gem },
  { key: 'workshop',    label: 'Workshops & Community Meetups',           desc: 'Looking for a cafe setting for a workshop, club gathering or community session? Send the activity details, attendance, duration and any equipment needs so the team can confirm the arrangements available.', Icon: Presentation },
  { key: 'group-dining', label: 'Group Lunches, Dinners & Other Occasions', desc: 'For a group meal or an occasion that does not fit the categories above, tell us what you are planning. Start with your preferred outlet and numbers, then discuss the seating and food arrangements for the date.', Icon: UtensilsCrossed },
]

/* ── Per-outlet copy — approved PDF text ─────────────────────────── */
const OUTLET_NOTES: Record<string, string> = {
  koramangala:
    'Planning a larger gathering in Koramangala? Big Bean Cafe on 80 Feet Road has a dedicated first-floor event space with a 100-seat capacity. Enquire for birthdays, team gatherings, family celebrations and group dining, and discuss the seating layout and food arrangements for your occasion.',
  'hsr-layout':
    'Bring your birthday party, team gathering or get-together to our HSR Layout outlet on 19th Main Road in Sector 1. Share your preferred date, guest count and event requirements so the team can discuss the seating and arrangements for your occasion.',
  indiranagar:
    'Considering Indiranagar for your next group meal or get-together? Our outlet is on 12th Main Road in HAL 2nd Stage. Share your date, preferred time and guest count to discuss the seating and group arrangements available at this location.',
  jayanagar:
    'For a gathering around Jayanagar, enquire at our 8th Block outlet on 2nd Main Road, 40th Cross. Tell us whether you are bringing family, friends or colleagues, and include your group size and food preferences to help the team review your request.',
  kammanahalli:
    'Looking at Kammanahalli or HRBR Layout for your gathering? Our outlet is at VN Heights on 5th Main Road, opposite Kailash Parbat. Send your preferred date and group details to discuss a cafe visit, group meal or celebration enquiry at this location.',
  'rajarajeshwari-nagar':
    'Our RR Nagar outlet is at YGR Signature Mall in Halagevaderahalli. If this location works for your guests, share your preferred date, occasion and expected numbers so the team can confirm suitable group arrangements.',
  'electronic-city':
    'Planning around Electronic City? Find Big Bean Cafe on the third floor of M5 Ecity Mall on Hosur Road. Send your group size, date and timing preferences to check the arrangements available for a team gathering or group meal.',
  'jp-nagar':
    'Planning a birthday party, a family get-together or a team event in JP Nagar? Choose our JP Nagar outlet and share your preferred date, guest count and food preferences. Discuss the seating and event arrangements for your group directly with the team.',
}

const KORAMANGALA_SLUG = 'koramangala'

const outletDisplayName = (o: PageOutlet) =>
  (o._label ?? o.name ?? '').replace(/^Big Bean Cafe\s*[-–—]\s*/i, '') || 'This outlet'

const FAQ_ITEMS: { q: string; a: string; link?: string }[] = [
  {
    q: 'Which Big Bean Cafe locations can I enquire about?',
    a: 'You can enquire for any active Big Bean Cafe outlet listed on this page. Select the location that works best for your guests, or choose Help me choose.',
  },
  {
    q: 'What is the seating capacity for events?',
    a: 'Big Bean Cafe outlet seating capacities range from 50 to 100, depending on the location. Koramangala has a dedicated first-floor event space with a 100-seat capacity. Ask the team to confirm the exact capacity and suitable layout for your chosen outlet. Exclusive use must be discussed separately.',
  },
  {
    q: 'What types of events can I enquire about?',
    a: 'Enquire about birthday parties, anniversaries, family get-togethers, reunions, corporate meetings, team events, farewells, baby showers, small engagement gatherings, workshops, community meetups and group meals. Include your preferred outlet, date and guest count so the team can confirm suitability and arrangements.',
  },
  {
    q: 'How much does an event booking cost?',
    a: 'Request a quotation for your chosen outlet, date, duration, guest count and food requirements. Review the proposed inclusions and applicable charges with the team before confirming your booking.',
  },
  {
    q: 'Can I request specific food, decorations or equipment?',
    a: 'Include these requests in your enquiry, along with any dietary or allergy requirements. The team will confirm what is available and permitted at the selected outlet; a request is not an agreed inclusion until confirmed.',
  },
  {
    q: 'Can I visit the space before booking?',
    a: 'Contact the team to request a venue visit and agree a suitable time before you travel. If anyone in your group has access requirements, mention them in advance, particularly for a first-floor space.',
  },
  {
    q: 'Does an enquiry confirm my booking?',
    a: 'No. The enquiry starts a discussion about availability and arrangements. Your booking is confirmed separately with the team after the details and terms are agreed.',
  },
  {
    q: 'Where can I find upcoming public events?',
    a: 'Visit our Events page for public activities, workshops and other listed events. Use this page when you want to arrange your own gathering or group visit.',
    link: '/events',
  },
]

const STEPS = [
  { n: 1, title: 'Choose a location', desc: 'Select the outlet that works for your guests, or ask us to help you choose.' },
  { n: 2, title: 'Share your plans', desc: 'Send your date, timings, group size, occasion and any specific requirements.' },
  { n: 3, title: 'Discuss the details', desc: 'Check outlet suitability, seating, food choices, available arrangements and the quotation with the team.' },
  { n: 4, title: 'Confirm your booking', desc: 'Finalise the agreed arrangements and booking terms directly with the team.' },
]

/* ── Decorative coffee beans — pure inline SVG + CSS animation ──────
   Bean positions/visibility per breakpoint live in the <style> block;
   this table only carries size, palette, opacity, rotation and motion. */
const PE_BEANS = [
  { cls: 'pe-bean-1',  size: 46, color: '#3D1F0D', groove: '#170B05', opacity: 0.92, rot: -16, anim: 'pe-anim-a', delay: '0s'    },
  { cls: 'pe-bean-2',  size: 62, color: '#6B3520', groove: '#3D1F0D', opacity: 0.88, rot: 22,  anim: 'pe-anim-b', delay: '-3s'   },
  { cls: 'pe-bean-3',  size: 36, color: '#C9943A', groove: '#8B5A1E', opacity: 0.62, rot: -30, anim: 'pe-anim-c', delay: '-7s'   },
  { cls: 'pe-bean-4',  size: 52, color: '#4A2518', groove: '#241109', opacity: 0.82, rot: 12,  anim: 'pe-anim-a', delay: '-5s'   },
  { cls: 'pe-bean-5',  size: 34, color: '#8B4A2F', groove: '#542A16', opacity: 0.55, rot: -8,  anim: 'pe-anim-b', delay: '-9s'   },
  { cls: 'pe-bean-6',  size: 44, color: '#C9943A', groove: '#9A6E24', opacity: 0.48, rot: 30,  anim: 'pe-anim-c', delay: '-2s'   },
  { cls: 'pe-bean-7',  size: 28, color: '#B97855', groove: '#6B3B22', opacity: 0.42, rot: 40,  anim: 'pe-anim-b', delay: '-6s'   },
  { cls: 'pe-bean-8',  size: 34, color: '#3D1F0D', groove: '#170B05', opacity: 0.6,  rot: -24, anim: 'pe-anim-a', delay: '-11s'  },
  { cls: 'pe-bean-9',  size: 26, color: '#8B5A3C', groove: '#4A2E1B', opacity: 0.4,  rot: 55,  anim: 'pe-anim-c', delay: '-4s'   },
  { cls: 'pe-bean-10', size: 42, color: '#3D1F0D', groove: '#170B05', opacity: 0.95, rot: -10, anim: 'pe-anim-d', delay: '-8s'   },
  { cls: 'pe-bean-11', size: 26, color: '#C9943A', groove: '#9A6E24', opacity: 0.75, rot: 34,  anim: 'pe-anim-none', delay: '0s' },
]

function PeBean({ bean }: { bean: (typeof PE_BEANS)[number] }) {
  return (
    <span
      className={`pe-bean ${bean.cls} ${bean.anim}`}
      style={{ width: bean.size, opacity: bean.opacity, animationDelay: bean.delay }}
    >
      <svg
        viewBox="0 0 64 44"
        width={bean.size}
        height={Math.round(bean.size * 0.6875)}
        focusable="false"
        style={{ transform: `rotate(${bean.rot}deg)` }}
      >
        <ellipse cx="32" cy="22" rx="30" ry="19" fill={bean.color} />
        <ellipse cx="21" cy="15" rx="12" ry="6.5" fill="#FFF7ED" opacity="0.1" />
        <path
          d="M32 5 C 24 13, 41 31, 32 39"
          stroke={bean.groove}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
    </span>
  )
}

export default function PrivateEventsClient({
  hero,
  gallery,
  outlets,
}: {
  hero: Hero | null
  gallery: GalleryItem[]
  outlets: PageOutlet[]
}) {
  const [prefill, setPrefill] = useState<EnquiryPrefill>({})
  const [formVisible, setFormVisible] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)
  const [storyImgErr, setStoryImgErr] = useState(false)
  const sectionRefs = useRef<HTMLDivElement>(null)

  const heroImg = imgUrl(hero?.image)
  const heroMobileImg = imgUrl(hero?.mobile_image) || heroImg

  // Only ever show active CMS gallery images, honouring admin sort order.
  const galleryItems = [...gallery]
    .filter((g) => g.image && g.status !== 'inactive')
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id)

  /* Scroll-reveal: unobtrusive IntersectionObserver */
  useEffect(() => {
    const els = sectionRefs.current?.querySelectorAll('.pe-reveal') || []
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('pe-in')),
      { threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  /* Hide mobile sticky CTA while the enquiry section is on screen */
  useEffect(() => {
    const target = document.getElementById('event-enquiry')
    if (!target) return
    const io = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting), { threshold: 0.05 })
    io.observe(target)
    return () => io.disconnect()
  }, [])

  const enquire = (patch: EnquiryPrefill) => {
    setPrefill((p) => ({ ...p, ...patch }))
    document.getElementById('event-enquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={sectionRefs}>
      <style>{`
        .pe-reveal { opacity: 0; transform: translateY(26px); transition: opacity .7s ease, transform .7s cubic-bezier(.22,.61,.36,1); }
        .pe-reveal.pe-in { opacity: 1; transform: translateY(0); }
        .pe-card { transition: transform .35s ease, box-shadow .35s ease, border-color .35s ease; }
        .pe-card:hover { transform: translateY(-6px); box-shadow: 0 18px 44px rgba(61,31,13,0.10); border-color: rgba(201,148,58,.55); }
        .pe-card:hover .pe-ico { transform: scale(1.08) rotate(-3deg); }
        .pe-ico { transition: transform .35s ease; }
        .pe-arrow { transition: transform .25s ease; }
        a:hover .pe-arrow, button:hover .pe-arrow { transform: translateX(4px); }
        .pe-faq-body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s ease; }
        .pe-faq-body.open { grid-template-rows: 1fr; }
        .pe-faq-inner { overflow: hidden; }
        /* ── HERO — split editorial layout (CSS-only, no animation library) ──
           One-time entrance: staggered opacity/translateY on copy, clip-path
           wipe on the right image pane. Base styles = final states, so the
           hero is fully visible even if animations never run. */
        @keyframes pe-hin {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pe-hin { animation: pe-hin .75s cubic-bezier(.22,.61,.36,1) both; }
        @keyframes pe-hero-media-fade {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pe-hero-clip {
          from { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); }
          to { clip-path: polygon(18% 0, 100% 0, 100% 100%, 0% 100%); }
        }

        .pe-hero { display: flex; flex-direction: column; }
        .pe-hero-copy { padding: 3.25rem 1.5rem 0; order: 1; }
        .pe-hero-media {
          order: 2; position: relative; margin-top: 2.5rem;
          height: clamp(250px, 52vw, 330px);
          clip-path: polygon(0% 7%, 100% 0%, 100% 100%, 0% 100%);
          overflow: hidden; background: #EFE3D2;
          animation: pe-hero-media-fade .9s cubic-bezier(.22,.61,.36,1) .15s both;
        }
        .pe-hero-media picture { display: block; width: 100%; height: 100%; }
        .pe-hero-img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 38%; display: block; }
        .pe-hero-edge { position: absolute; inset: 0; pointer-events: none; }
        .pe-hero-info {
          order: 3; display: flex; flex-wrap: wrap;
          gap: 1.25rem 2.25rem;
          padding: 1.75rem 1.5rem 2.5rem;
          border-top: 1px solid #EADCC8;
        }
        .pe-hero-h1 {
          margin-top: 1.5rem; max-width: 29rem;
          font-size: clamp(2.35rem, 3.1vw + 1rem, 3.9rem); line-height: 1.06;
        }

        @media (min-width: 1024px) {
          .pe-hero {
            display: grid; grid-template-columns: 58% 42%; grid-template-rows: 1fr auto;
            min-height: clamp(620px, 78vh, 760px);
          }
          .pe-hero-copy {
            grid-column: 1; grid-row: 1;
            display: flex; flex-direction: column; justify-content: center;
            padding: clamp(3rem, 7vh, 5rem) 3.5rem clamp(1.75rem, 3vh, 2.5rem) max(2.5rem, calc((100vw - 80rem) / 2 + 2.5rem));
          }
          .pe-hero-media {
            grid-column: 2; grid-row: 1 / 3; margin-top: 0; height: auto;
            clip-path: polygon(18% 0, 100% 0, 100% 100%, 0% 100%);
            animation: pe-hero-clip 1.05s cubic-bezier(.22,.61,.36,1) .15s both;
          }
          .pe-hero-edge {
            background: linear-gradient(90deg, rgba(253,248,241,.72) 0%, rgba(253,248,241,.18) 16%, rgba(253,248,241,0) 30%);
          }
          .pe-hero-info {
            grid-column: 1; grid-row: 2; align-self: end;
            gap: 1.5rem 2.5rem;
            margin: 0 3.5rem 2.75rem max(2.5rem, calc((100vw - 80rem) / 2 + 2.5rem));
            padding: 1.75rem 0 0;
          }
        }

        /* ── Decorative coffee beans (enquiry section, left column) ──
           Inline SVG + transform/opacity only — no JS, no network, no layout anim. */
        .pe-beans { position: relative; height: 76px; margin-top: 1.5rem; pointer-events: none; }
        .pe-bean { position: absolute; display: none; line-height: 0; will-change: transform; }
        .pe-bean svg { display: block; }
        .pe-aroma { display: none; }

        .pe-anim-a { animation: pe-bean-a 11s ease-in-out infinite; }
        .pe-anim-b { animation: pe-bean-b 14s ease-in-out infinite; }
        .pe-anim-c { animation: pe-bean-c 16s ease-in-out infinite; }
        .pe-anim-d { animation: pe-bean-drift 20s ease-in-out infinite; }
        .pe-anim-none { animation: none; }
        @keyframes pe-bean-a {
          0%, 100% { transform: translate3d(0,0,0) rotate(-2deg); }
          50% { transform: translate3d(7px,-13px,0) rotate(3deg); }
        }
        @keyframes pe-bean-b {
          0%, 100% { transform: translate3d(0,0,0) rotate(2deg); }
          50% { transform: translate3d(-8px,-10px,0) rotate(-3deg); }
        }
        @keyframes pe-bean-c {
          0%, 100% { transform: translate3d(0,0,0) rotate(0deg); }
          50% { transform: translate3d(5px,-16px,0) rotate(4deg); }
        }
        @keyframes pe-bean-drift {
          0%, 100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(3px,-4px,0) rotate(1deg); }
        }

        /* Mobile: 3 subtle beans in a small strip below the copy — no overlap, no big gap */
        .pe-bean-1 { display: block; right: 8%;  top: 4px; }
        .pe-bean-2 { display: block; right: 26%; top: 34px; }
        .pe-bean-3 { display: block; right: 44%; top: 12px; }

        /* Tablet: 6 beans spread across the strip */
        @media (min-width: 640px) {
          .pe-beans { height: 84px; }
          .pe-bean-1 { right: 6%;  top: 8px; }
          .pe-bean-2 { right: 18%; top: 42px; }
          .pe-bean-3 { right: 30%; top: 12px; }
          .pe-bean-4 { display: block; right: 46%; top: 40px; }
          .pe-bean-5 { display: block; right: 60%; top: 10px; }
          .pe-bean-6 { display: block; right: 74%; top: 36px; }
        }

        /* Desktop: beans overlay the empty lower-left column (copy stays centered) */
        @media (min-width: 1024px) {
          .pe-beans { position: absolute; inset: 0; height: auto; margin-top: 0; }
          .pe-aroma { display: block; position: absolute; left: 0; bottom: 2%; width: 82%; height: 52%; }
          .pe-bean-1 { left: 7%;  top: 63%; right: auto; }
          .pe-bean-2 { left: 24%; top: 72%; right: auto; }
          .pe-bean-3 { left: 43%; top: 58%; right: auto; }
          .pe-bean-4 { left: 59%; top: 76%; right: auto; }
          .pe-bean-5 { left: 77%; top: 59%; right: auto; }
          .pe-bean-6 { left: 91%; top: 72%; right: auto; }
          .pe-bean-7 { display: block; left: 35%; top: 88%; }
          .pe-bean-8 { display: block; left: 70%; top: 90%; }
          .pe-bean-9 { display: block; left: 88%; top: 40%; }
          .pe-bean-10 { display: block; left: 1.5%; top: 83%; }
          .pe-bean-11 { display: block; left: 11%; top: 90%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pe-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
          .pe-card, .pe-ico, .pe-arrow, .pe-faq-body { animation: none !important; transition: none !important; }
          .pe-hin, .pe-hero-media { animation: none !important; }
          .pe-bean { animation: none !important; }
        }
      `}</style>

      <main>
        {/* ── SECTION 1 · HERO — split editorial layout ───────── */}
        <section className="pe-hero relative overflow-hidden">
          {/* Copy — left ~58% on desktop, full width on mobile */}
          <div className="pe-hero-copy">
            <p className="pe-hin text-[11px] font-black uppercase tracking-[0.26em] text-[#8B4A2F]" style={{ animationDelay: '.08s' }}>
              Private Events
            </p>
            <p className="pe-hin mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8A7059]" style={{ animationDelay: '.14s' }}>
              {hero?.eyebrow || 'Birthdays. Team gatherings. Time together.'}
            </p>
            <h1 className="pe-hin pe-hero-h1 font-heading font-black text-[#3D1F0D]" style={{ animationDelay: '.16s' }}>
              {hero?.heading || 'Event Spaces & Group Bookings in Bengaluru'}
            </h1>
            <span className="pe-hin mt-7 block h-[3px] w-[78px] rounded-full bg-[#C9943A]" style={{ animationDelay: '.24s' }} aria-hidden="true" />
            <p className="pe-hin mt-7 max-w-lg text-base leading-relaxed text-[#6B4F3A] sm:text-[17px]" style={{ animationDelay: '.32s' }}>
              {hero?.description ||
                'Bring your people together for a birthday, family celebration, team event or get-together at Big Bean Cafe. Choose a Bengaluru location that works for your guests, with seating capacities ranging from 50 to 100 depending on the outlet.'}
            </p>
            <div className="pe-hin mt-9 flex flex-wrap items-center gap-x-7 gap-y-4" style={{ animationDelay: '.4s' }}>
              <button
                type="button"
                onClick={() => { gtag('event', 'event_enquiry_click', { location: 'hero' }); enquire({ intent: 'general' }) }}
                className="inline-flex h-[50px] items-center justify-center gap-2 rounded-full bg-[#C9943A] px-8 text-xs font-black uppercase tracking-[0.14em] text-[#3D1F0D] shadow-[0_12px_30px_rgba(201,148,58,0.32)] transition hover:-translate-y-0.5 hover:bg-[#DBA851] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D1F0D] focus-visible:ring-offset-2"
              >
                {hero?.primary_cta_text || 'Enquire About Your Event'}
                <ArrowRight className="pe-arrow h-4 w-4" />
              </button>
              <a
                href="#outlet-locations"
                className="inline-flex items-center gap-1.5 rounded-sm text-[13px] font-bold text-[#8B4A2F] underline-offset-4 transition hover:text-[#3D1F0D] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9943A]"
              >
                {hero?.secondary_cta_text || 'Explore Outlet Locations'}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Media — full-height right pane with diagonal reveal on desktop;
              stacked below the copy with a subtle angled top edge on mobile */}
          <div className="pe-hero-media">
            {heroImg ? (
              <picture>
                {heroMobileImg && heroMobileImg !== heroImg && (
                  <source media="(max-width: 768px)" srcSet={heroMobileImg} />
                )}
                <img
                  src={heroImg}
                  alt={hero?.image_alt || 'Big Bean Cafe event space set for a private gathering'}
                  className="pe-hero-img"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#3D1F0D] via-[#5A2D1D] to-[#8B4A2F]">
                <div className="text-center">
                  <CalendarRange className="mx-auto h-14 w-14 text-[#C9943A]/60" />
                  <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-[#F6D58D]/70">Big Bean Cafe</p>
                </div>
              </div>
            )}
            <span className="pe-hero-edge" aria-hidden="true" />
          </div>

          {/* Info row — bottom of the left column on desktop, below the image on mobile */}
          <div className="pe-hin pe-hero-info" style={{ animationDelay: '.5s' }}>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 flex-shrink-0 text-[#C9943A]" aria-hidden="true" />
              <span className="text-sm font-bold text-[#3D1F0D]">
                {outlets.length > 0
                  ? `${outlets.length} Bengaluru Location${outlets.length === 1 ? '' : 's'}`
                  : 'Bengaluru Locations'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 flex-shrink-0 text-[#C9943A]" aria-hidden="true" />
              <span>
                <span className="block text-sm font-bold text-[#3D1F0D]">50–100 Seats</span>
                <span className="block text-xs text-[#8A7059]">Depending on outlet</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <PartyPopper className="h-5 w-5 flex-shrink-0 text-[#C9943A]" aria-hidden="true" />
              <span className="text-sm font-bold text-[#3D1F0D]">Celebrations &amp; Team Events</span>
            </div>
          </div>
        </section>

        {/* ── SECTION 2 · STAT STRIP ───────────────────────────── */}
        <section className="border-y border-[#EADCC8] bg-[#F5EBDD]">
          <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { big: `${outlets.length || '—'} outlet locations`, small: "Across Bengaluru's neighbourhoods" },
                { big: '50–100 seats', small: 'Depending on outlet' },
                { big: 'Parties & celebrations', small: 'Birthdays, anniversaries & more' },
                { big: 'Corporate events & get-togethers', small: 'Team gatherings & meetings' },
              ].map((s, i) => (
                <div key={i} className="pe-reveal text-center sm:text-left" style={{ transitionDelay: `${i * 0.09}s` }}>
                  <p className="font-heading text-2xl font-black text-[#3D1F0D]">{s.big}</p>
                  <p className="mt-1 text-sm text-[#8A7059]">{s.small}</p>
                </div>
              ))}
            </div>
            <p className="pe-reveal mt-6 text-center text-xs text-[#8A7059] sm:text-left">
              Exact seating capacity, event arrangements and booking availability vary by outlet.
            </p>
          </div>
        </section>

        {/* ── SECTION 3 · VENUE INTRO ──────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
          <p className="pe-reveal text-[11px] font-black uppercase tracking-[0.24em] text-[#C9943A]">The Space</p>
          <h2 className="pe-reveal font-heading mt-4 text-3xl font-black leading-tight text-[#3D1F0D] sm:text-4xl" style={{ transitionDelay: '.08s' }}>
            A Cafe Setting for Your Next Gathering
          </h2>
          <p className="pe-reveal mt-6 text-base leading-relaxed text-[#6B4F3A]" style={{ transitionDelay: '.14s' }}>
            Some gatherings need room for a celebration; others need a place for everyone to sit down, share a meal
            and catch up. Big Bean Cafe offers outlet seating capacities of 50–100 across Bengaluru, depending on
            the location. Start with your occasion, guest count and preferred neighbourhood.
          </p>
          <p className="pe-reveal mt-4 text-base leading-relaxed text-[#6B4F3A]" style={{ transitionDelay: '.2s' }}>
            For a larger gathering, explore the dedicated first-floor event space at Koramangala, which has a
            100-seat capacity. For other locations, share your plans so our team can confirm whether the outlet
            and available seating suit your event.
          </p>
        </section>

        {/* ── SECTION 4 · EVENT TYPES ──────────────────────────── */}
        <section className="mx-auto max-w-7xl px-6 pb-16 sm:px-10 sm:pb-20">
          <div className="pe-reveal mb-10 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#C9943A]">Occasions</p>
            <h2 className="font-heading mt-3 text-3xl font-black text-[#3D1F0D] sm:text-4xl">What Are You Planning?</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-[#8A7059]">
              Choose your occasion — the enquiry form will pick it up automatically.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {EVENT_TYPES.map(({ key, label, desc, Icon }, i) => (
              <button
                key={label}
                type="button"
                onClick={() => { gtag('event', 'outlet_select', { type: 'occasion', value: key }); enquire({ occasion: key }) }}
                className="pe-card pe-reveal rounded-3xl border border-[#EADCC8] bg-white p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9943A]"
                style={{ transitionDelay: `${(i % 4) * 0.06}s` }}
                aria-label={`Enquire about ${label}`}
              >
                <span className="pe-ico inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#C9943A]/30 bg-[#C9943A]/10 text-[#8B4A2F]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-black text-[#3D1F0D]">{label}</h3>
                <p className="mt-1 hidden text-xs leading-relaxed text-[#8A7059] sm:block">{desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ── SECTION 5 · OUTLET LOCATIONS ─────────────────────── */}
        <section id="outlet-locations" className="scroll-mt-24 border-y border-[#EADCC8] bg-[#F5EBDD] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="pe-reveal mb-10 text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#C9943A]">Locations</p>
              <h2 className="font-heading mt-3 text-3xl font-black text-[#3D1F0D] sm:text-4xl">Explore Our Bengaluru Outlet Locations</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-[#8A7059]">
                Choose your preferred neighbourhood below. Outlet seating capacities range from 50 to 100; the team
                will confirm the exact capacity and arrangement at your selected location. Exclusive use is discussed
                separately.
              </p>
            </div>
            <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {outlets.map((o, i) => {
                const img = imgUrl(o.image)
                const isKoram = o.slug === KORAMANGALA_SLUG
                const label = outletDisplayName(o)
                return (
                  <article
                    key={o.slug || `outlet-${i}`}
                    id={o.slug || undefined}
                    className="pe-card pe-reveal flex scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-[#EADCC8] bg-white"
                    style={{ transitionDelay: `${(i % 4) * 0.07}s` }}
                  >
                    <div className="relative h-36 overflow-hidden bg-[#EFE3D2]">
                      {img ? (
                        <img src={img} alt={`${label} — Big Bean Cafe`} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#5A2D1D] to-[#8B4A2F]">
                          <MapPin className="h-8 w-8 text-[#F6D58D]/60" />
                        </div>
                      )}
                      {isKoram && (
                        <span className="absolute left-3 top-3 rounded-full bg-[#C9943A] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#3D1F0D]">
                          Event Space
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-heading text-lg font-black text-[#3D1F0D]">{label}</h3>
                      {isKoram && (
                        <p className="mt-1 text-xs font-bold text-[#8B4A2F]">
                          Dedicated first-floor event space · 100-seat capacity
                        </p>
                      )}
                      {o.address && (
                        <p className="mt-2 line-clamp-2 flex items-start gap-1.5 text-xs leading-relaxed text-[#8A7059]">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#C9943A]" />
                          {o.address}
                        </p>
                      )}
                      {o.phone && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#8A7059]">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0 text-[#C9943A]" />
                          {o.phone}
                        </p>
                      )}
                      {OUTLET_NOTES[o.slug || ''] && (
                        <p className="mt-2 text-xs leading-relaxed text-[#8A7059]">{OUTLET_NOTES[o.slug || '']}</p>
                      )}
                      <div className="flex-1" />
                      <div className="mt-4 flex gap-2 border-t border-[#F1E6D6] pt-4">
                        <button
                          type="button"
                          onClick={() => { gtag('event', 'outlet_select', { outlet: o.slug }); enquire({ outlet: o.slug || undefined }) }}
                          className="inline-flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-full bg-[#3D1F0D] px-3 text-[11px] font-black uppercase tracking-[0.1em] text-[#FFF7ED] transition hover:bg-[#5A2D1D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9943A]"
                        >
                          Enquire
                        </button>
                        {o.slug && (
                          <Link
                            href={`/outlets/${o.slug}`}
                            className="inline-flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-full border border-[#C9943A] px-3 text-[11px] font-black uppercase tracking-[0.1em] text-[#8B4A2F] transition hover:bg-[#C9943A]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9943A]"
                          >
                            View Outlet
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION 6 · VISUAL STORY ─────────────────────────── */}
        <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="pe-reveal relative overflow-hidden rounded-[32px] border border-[#EADCC8] bg-[#EFE3D2]">
              {/* Dedicated static asset — never sourced from Hero or Gallery CMS.
                  Falls back to the branded placeholder instead of broken-image alt text. */}
              {storyImgErr ? (
                <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#3D1F0D] to-[#8B4A2F]">
                  <UtensilsCrossed className="h-14 w-14 text-[#F6D58D]/50" />
                </div>
              ) : (
                <img
                  src="/images/highlights/delicious-food.webp"
                  alt="Big Bean Cafe dishes and drinks served for a group gathering"
                  loading="lazy"
                  onError={() => setStoryImgErr(true)}
                  className="aspect-[4/3] w-full object-cover"
                />
              )}
            </div>
            <div>
              <p className="pe-reveal text-[11px] font-black uppercase tracking-[0.24em] text-[#C9943A]">Food</p>
              <h2 className="pe-reveal font-heading mt-4 text-3xl font-black leading-tight text-[#3D1F0D] sm:text-4xl" style={{ transitionDelay: '.08s' }}>
                Food &amp; Dining for Your Gathering
              </h2>
              <p className="pe-reveal mt-5 text-base leading-relaxed text-[#6B4F3A]" style={{ transitionDelay: '.14s' }}>
                Start with the menu at your chosen outlet and tell us what your group has in mind. Share whether you
                are planning lunch, dinner, snacks or a celebration with desserts, together with any dietary or
                allergy requirements.
              </p>
              <p className="pe-reveal mt-4 text-sm leading-relaxed text-[#6B4F3A]" style={{ transitionDelay: '.22s' }}>
                The outlet team can discuss available choices and the arrangements for your date. Your event
                quotation should confirm the selected items, quantities, service arrangements and any agreed
                inclusions before you finalise the booking.
              </p>
              <div className="pe-reveal mt-6 flex flex-col gap-3 sm:flex-row" style={{ transitionDelay: '.3s' }}>
                <Link
                  href="/menu"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#3D1F0D] px-6 text-[11px] font-black uppercase tracking-[0.12em] text-[#FFF7ED] transition hover:bg-[#5A2D1D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9943A]"
                >
                  Explore Our Menu <ArrowRight className="pe-arrow h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 7 · GALLERY (admin-managed real photos only) ── */}
        <section className="border-y border-[#EADCC8] bg-[#F5EBDD] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
              <div className="pe-reveal mb-10 text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#C9943A]">Gallery</p>
                <h2 className="font-heading mt-3 text-3xl font-black text-[#3D1F0D] sm:text-4xl">See the Space Before You Decide</h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#8A7059]">
                  Explore photographs of the outlet you are considering, including its seating and gathering areas.
                  For Koramangala, view the dedicated first-floor event space and discuss the layout for your group.
                  If you would like to see an outlet in person, include a visit request in your enquiry.
                </p>
                <button
                  type="button"
                  onClick={() => enquire({ intent: 'venue-visit', venueVisit: true })}
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-[#C9943A] px-6 text-[11px] font-black uppercase tracking-[0.12em] text-[#8B4A2F] transition hover:bg-[#C9943A] hover:text-[#3D1F0D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9943A]"
                >
                  Enquire About a Venue Visit
                </button>
              </div>
            {galleryItems.length > 0 && (
              <div className={
                galleryItems.length === 1
                  ? 'mx-auto max-w-4xl'
                  : galleryItems.length === 2
                    ? 'mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2'
                    : 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4'
              }>
                {galleryItems.map((g, i) => {
                  const src = imgUrl(g.image)
                  if (!src) return null
                  const aspect =
                    galleryItems.length === 1 ? 'aspect-[16/10]'
                    : galleryItems.length === 2 ? 'aspect-[4/3]'
                    : i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setLightbox(g)}
                      className="pe-card pe-reveal group relative block w-full overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9943A]"
                      style={{ transitionDelay: `${(i % 4) * 0.06}s` }}
                      aria-label={g.alt_text || g.caption || `Gallery image ${i + 1}`}
                    >
                      <img
                        src={src}
                        alt={g.alt_text || g.caption || 'Big Bean Cafe space'}
                        loading="lazy"
                        className={`w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] ${aspect}`}
                      />
                      {(g.caption || g.outlet_name) && (
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#120905]/80 to-transparent p-3 pt-8 text-left">
                          <span className="block text-[11px] font-bold text-[#FFF7ED]">{g.caption || g.outlet_name}</span>
                          {g.outlet_name && g.caption && (
                            <span className="block text-[10px] text-[#F6D58D]/80">{g.outlet_name}</span>
                          )}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
            </div>
          </section>

        {/* ── SECTION 8 · QUOTE CTA ────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
          <div className="pe-reveal relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#2A120B] via-[#3D1F0D] to-[#5A2D1D] px-6 py-14 text-center sm:px-12">
            <Quote className="mx-auto h-10 w-10 text-[#C9943A]/50" />
            <h2 className="font-heading mt-5 text-3xl font-black text-[#FFF7ED] sm:text-4xl">
              Request a Quote for Your Gathering
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#F6D58D]/85">
              Tell us your preferred outlet, event date, time and expected number of guests. Include the occasion,
              food preferences and any setup requests so the team can discuss a quotation for your plans.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-[#F6D58D]/70">
              Before confirming, review the agreed venue arrangements, duration, food inclusions, applicable
              charges and booking terms with the team.
            </p>
            <button
              type="button"
              onClick={() => { gtag('event', 'event_enquiry_click', { location: 'quote' }); enquire({ intent: 'quote' }) }}
              className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#C9943A] px-8 text-xs font-black uppercase tracking-[0.14em] text-[#3D1F0D] shadow-[0_10px_28px_rgba(201,148,58,0.3)] transition hover:-translate-y-0.5 hover:bg-[#DBA851] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF7ED]"
            >
              Request an Event Quote <ArrowRight className="pe-arrow h-4 w-4" />
            </button>
          </div>
        </section>

        {/* ── SECTION 9 · PLANNING STEPS ───────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 pb-16 sm:px-10 sm:pb-20">
          <div className="pe-reveal mb-12 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#C9943A]">How It Works</p>
            <h2 className="font-heading mt-3 text-3xl font-black text-[#3D1F0D] sm:text-4xl">How to Plan Your Event with Big Bean Cafe</h2>
          </div>
          <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <span className="absolute left-1/2 top-8 hidden h-px w-[72%] -translate-x-1/2 border-t border-dashed border-[#C9943A]/50 lg:block" aria-hidden="true" />
            {STEPS.map((s, i) => (
              <li key={s.n} className="pe-reveal relative flex gap-4 lg:flex-col lg:items-center lg:text-center" style={{ transitionDelay: `${i * 0.12}s` }}>
                <span className="relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#C9943A] bg-[#FDF8F1] font-heading text-xl font-black text-[#8B4A2F] shadow-[0_8px_20px_rgba(201,148,58,0.18)]">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-base font-black text-[#3D1F0D]">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#8A7059]">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="pe-reveal mx-auto mt-10 max-w-lg rounded-2xl border border-[#C9943A]/40 bg-[#C9943A]/10 px-5 py-3.5 text-center text-xs font-bold leading-relaxed text-[#8B4A2F]" style={{ transitionDelay: '.5s' }}>
            Submitting an enquiry does not reserve a date or confirm a booking.
          </p>
        </section>

        {/* ── SECTION 10 · FAQ ─────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-6 pb-16 sm:pb-20">
          <div className="pe-reveal mb-10 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#C9943A]">Questions</p>
            <h2 className="font-heading mt-3 text-3xl font-black text-[#3D1F0D] sm:text-4xl">Questions About Events &amp; Group Bookings</h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((f, i) => {
              const open = openFaq === i
              return (
                <div key={i} className="pe-reveal overflow-hidden rounded-2xl border border-[#EADCC8] bg-white" style={{ transitionDelay: `${i * 0.04}s` }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    aria-controls={`pe-faq-${i}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C9943A]"
                  >
                    <span className="text-sm font-bold text-[#3D1F0D] sm:text-base">{f.q}</span>
                    <ChevronDown className={`h-4 w-4 flex-shrink-0 text-[#C9943A] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                  </button>
                  <div id={`pe-faq-${i}`} className={`pe-faq-body ${open ? 'open' : ''}`}>
                    <div className="pe-faq-inner">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-[#6B4F3A]">
                        {f.a}
                        {f.link && (
                          <>
                            {' '}
                            <Link href={f.link} className="font-bold text-[#C9943A] underline-offset-2 hover:underline">
                              Visit the Events page
                            </Link>
                            .
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── SECTION 11 · ENQUIRY FORM ────────────────────────── */}
        <section id="event-enquiry" className="scroll-mt-24 border-t border-[#EADCC8] bg-[#F5EBDD] py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:px-10 lg:grid-cols-[42%_58%]">
            <div className="relative flex flex-col justify-center">
              <p className="pe-reveal text-[11px] font-black uppercase tracking-[0.24em] text-[#C9943A]">Get in Touch</p>
              <h2 className="pe-reveal font-heading mt-4 text-3xl font-black leading-tight text-[#3D1F0D] sm:text-4xl" style={{ transitionDelay: '.08s' }}>
                Tell Us About Your Gathering
              </h2>
              <p className="pe-reveal mt-5 max-w-md text-base leading-relaxed text-[#6B4F3A]" style={{ transitionDelay: '.14s' }}>
                Choose your preferred outlet and share a few details. Our team will use your enquiry to discuss
                availability, seating, food and the arrangements for your occasion.
              </p>
              <p className="pe-reveal mt-4 max-w-md text-sm leading-relaxed text-[#8A7059]" style={{ transitionDelay: '.2s' }}>
                Email <a href="mailto:info@bigbeancafe.in" className="font-bold text-[#8B4A2F] underline-offset-2 hover:underline">info@bigbeancafe.in</a>. For a
                branch-specific question, use the phone number on the relevant outlet card.
              </p>

              {/* Decorative coffee-bean composition — fills the empty lower-left
                  column on desktop; a small subtle strip on stacked layouts. */}
              <div className="pe-beans" aria-hidden="true">
                <svg className="pe-aroma" viewBox="0 0 400 260" fill="none" focusable="false" preserveAspectRatio="xMidYMax meet">
                  <path d="M36 226 C 104 168, 148 196, 208 128 S 322 66, 366 30" stroke="#C9943A" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                  <path d="M18 168 C 76 116, 154 138, 238 84" stroke="#8B4A2F" strokeWidth="1.3" strokeLinecap="round" opacity="0.14" />
                </svg>
                {PE_BEANS.map((b) => (
                  <PeBean key={b.cls} bean={b} />
                ))}
              </div>
            </div>
            <div className="pe-reveal" style={{ transitionDelay: '.16s' }}>
              <EnquiryForm
                outlets={outlets}
                prefill={prefill}
                onSubmitted={() => gtag('event', 'generate_lead', { page: 'private-events' })}
              />
            </div>
          </div>
        </section>

        {/* ── SECTION 12 · CLOSING CTA ─────────────────────────── */}
        <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20">
          <div className="pe-reveal text-center">
            <h2 className="font-heading mx-auto max-w-2xl text-2xl font-black leading-snug text-[#3D1F0D] sm:text-3xl">
              Your occasion, your people and a place to come together. Start planning your next gathering with Big Bean Cafe.
            </h2>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => { gtag('event', 'event_enquiry_click', { location: 'closing' }); enquire({}) }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#3D1F0D] px-8 text-xs font-black uppercase tracking-[0.14em] text-[#FFF7ED] shadow-[0_10px_28px_rgba(61,31,13,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5A2D1D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9943A] focus-visible:ring-offset-2"
              >
                Enquire About Your Event <ArrowRight className="pe-arrow h-4 w-4" />
              </button>
              <Link
                href="/events"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-7 text-[11px] font-black uppercase tracking-[0.12em] text-[#8B4A2F] transition hover:text-[#3D1F0D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9943A]"
              >
                See Public Events <ArrowRight className="pe-arrow h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#120905]/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.alt_text || 'Gallery image'}
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === 'Escape' && setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Close image viewer"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-full bg-[#FFF7ED]/10 p-3 text-[#FFF7ED] transition hover:bg-[#FFF7ED]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9943A]"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={imgUrl(lightbox.image) || ''}
            alt={lightbox.alt_text || lightbox.caption || 'Big Bean Cafe space'}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
          />
          {(lightbox.caption || lightbox.outlet_name) && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-[#120905]/70 px-5 py-2 text-xs font-bold text-[#FFF7ED]">
              {lightbox.caption}{lightbox.outlet_name ? ` · ${lightbox.outlet_name}` : ''}
            </p>
          )}
        </div>
      )}

      {/* ── Mobile sticky CTA ────────────────────────────────── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-[#EADCC8] bg-[#FFF7ED]/95 px-4 py-3 backdrop-blur transition-transform duration-300 sm:hidden ${formVisible ? 'translate-y-full' : 'translate-y-0'}`}
        aria-hidden={formVisible}
      >
        <button
          type="button"
          tabIndex={formVisible ? -1 : 0}
          onClick={() => enquire({})}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3D1F0D] text-xs font-black uppercase tracking-[0.14em] text-[#FFF7ED] shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9943A]"
        >
          Enquire About Your Event <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
