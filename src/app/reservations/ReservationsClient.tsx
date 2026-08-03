'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { Calendar, Clock, Users, MapPin, CheckCircle, Phone, Loader2, Navigation } from 'lucide-react'
import { getPublicSettings, formatPhoneForTel, CONTACT_DEFAULTS, type PublicContactSettings } from '@/lib/publicSettings'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace(/\/api$/, '')


interface Outlet {
  id: number
  name: string
  address: string
  phone?: string | null
  email?: string | null
  opening_hours?: string | null
  latitude?: number | null
  longitude?: number | null
  image?: string | null
  status: string
  sort_order: number
}

interface ReservationHero {
  eyebrow: string
  title: string
  highlight_text: string | null
  subtitle: string | null
  button_primary_text: string
  button_primary_url: string
  button_secondary_text: string
  button_secondary_url: string
  image: string | null
  stat_1_value: string
  stat_1_label: string
  stat_2_value: string
  stat_2_label: string
  stat_3_value: string
  stat_3_label: string
}

export default function Reservations() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    outlet: '',
    date: '',
    time: '',
    numberOfPeople: '2',
    specialRequests: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedReservation, setSubmittedReservation] = useState<any>(null)
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [outletsLoading, setOutletsLoading] = useState(true)
  const [outletsError, setOutletsError] = useState(false)
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null)
  const [hero, setHero] = useState<ReservationHero | null>(null)
  const [heroLoading, setHeroLoading] = useState(true)
  const [pubSettings, setPubSettings] = useState<PublicContactSettings>(CONTACT_DEFAULTS)

  useEffect(() => {
    fetchOutlets()
    fetchHero()
    getPublicSettings().then(setPubSettings).catch(() => {})
  }, [])

  const fetchOutlets = async () => {
    try {
      const res = await fetch(`${API_URL}/outlets`)
      const data = await res.json()
      if (data.success) {
        const activeOutlets = (data.data || [])
          .filter((o: Outlet) => o.status === 'active')
          .sort((a: Outlet, b: Outlet) => a.sort_order - b.sort_order || a.id - b.id)
        setOutlets(activeOutlets)
      }
    } catch (error) {
      console.error('Failed to fetch outlets:', error)
      setOutletsError(true)
    } finally {
      setOutletsLoading(false)
    }
  }

  const fetchHero = async () => {
    try {
      const res = await fetch(`${API_URL}/reservation-hero/active`)
      const data = await res.json()
      if (data.success && data.data) {
        setHero(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch hero:', error)
    } finally {
      setHeroLoading(false)
    }
  }

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'outlet') {
      const outlet = outlets.find(o => o.id === parseInt(value))
      setSelectedOutlet(outlet || null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const selectedOutletObj = outlets.find(o => o.id === parseInt(formData.outlet))
      const response = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          outlet_id: parseInt(formData.outlet),
          outlet_name: selectedOutletObj?.name,
          reservation_date: formData.date,
          reservation_time: formData.time,
          guests: parseInt(formData.numberOfPeople),
          special_requests: formData.specialRequests
        })
      })

      const data = await response.json()
      if (data.success) {
        // Store submitted reservation before resetting form
        setSubmittedReservation({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          outletName: selectedOutletObj?.name,
          date: formData.date,
          time: formData.time,
          guests: formData.numberOfPeople
        })
        setIsSubmitted(true)
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          outlet: '',
          date: '',
          time: '',
          numberOfPeople: '2',
          specialRequests: ''
        })
      } else {
        alert(data.message || 'Failed to submit reservation')
      }
    } catch (error) {
      console.error('Error submitting reservation:', error)
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    return maxDate.toISOString().split('T')[0]
  }

  if (isSubmitted && submittedReservation) {
    return (
      <div className="reservations-page min-h-screen" style={{ background: 'linear-gradient(to bottom, #FFF7ED, #F5E6D3, #FFF7ED)' }}>
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="font-heading mb-4" style={{ color: '#2A120B', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, lineHeight: 1.1 }}>Reservation Request Received!</h1>
            <p className="mb-6" style={{ color: '#7A5A48', fontSize: '0.9rem', lineHeight: 1.7 }}>Your reservation request has been received. Our team will confirm shortly.</p>
            <div className="bg-white rounded-2xl p-6 mb-6 text-left shadow-lg border border-[#E6C7A8]">
              <h3 className="font-bold mb-3" style={{ color: '#2A120B', fontSize: '1.05rem' }}>Reservation Details:</h3>
              <p className="mb-2" style={{ color: '#7A5A48', fontSize: '0.85rem', overflowWrap: 'anywhere' }}><strong>Name:</strong> {submittedReservation.name}</p>
              <p className="mb-2" style={{ color: '#7A5A48', fontSize: '0.85rem', overflowWrap: 'anywhere' }}><strong>Outlet:</strong> {submittedReservation.outletName}</p>
              <p className="mb-2" style={{ color: '#7A5A48', fontSize: '0.85rem', overflowWrap: 'anywhere' }}><strong>Date:</strong> {submittedReservation.date}</p>
              <p className="mb-2" style={{ color: '#7A5A48', fontSize: '0.85rem', overflowWrap: 'anywhere' }}><strong>Time:</strong> {submittedReservation.time}</p>
              <p className="mb-2" style={{ color: '#7A5A48', fontSize: '0.85rem', overflowWrap: 'anywhere' }}><strong>Guests:</strong> {submittedReservation.guests}</p>
              {submittedReservation.phone && <p className="mb-2" style={{ color: '#7A5A48', fontSize: '0.85rem', overflowWrap: 'anywhere' }}><strong>Phone:</strong> {submittedReservation.phone}</p>}
            </div>
            <button 
              onClick={() => { setIsSubmitted(false); setSubmittedReservation(null) }}
              className="px-8 py-3 rounded-xl font-semibold text-white transition-opacity"
              style={{ background: 'linear-gradient(to right, #3D1F0D, #8B4A2F)', fontSize: '0.78rem', minHeight: '46px' }}
            >
              Make Another Reservation
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const getImageUrl = (image?: string | null): string | null => {
    if (!image) return null
    if (image.startsWith('http')) return image
    return `${API_BASE_URL}/${image.replace(/^\/+/, '')}`
  }

  return (
    <>
      <style>{`
        .reservations-page {
          width: 100%;
          overflow-x: clip;
        }

        .reservations-page,
        .reservations-page * {
          box-sizing: border-box;
        }

        .reservations-hero {
          min-height: 620px;
        }

        .reservations-hero-inner {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 4rem clamp(1.5rem, 5vw, 6rem) 3.25rem;
        }

        .reservations-hero-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1.15fr)
            minmax(320px, 0.85fr);
          gap: 3.5rem;
          align-items: center;
        }

        .reservations-hero-copy {
          width: 100%;
          max-width: 900px;
          min-width: 0;
        }

        .reservations-hero-eyebrow {
          color: #C9943A;
          font-size: 0.72rem;
          font-weight: 900;
          line-height: 1;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .reservations-hero-title {
          margin: 0 0 1rem;
          color: #FFF7ED;
          font-family: var(--font-heading);
          font-size: clamp(2.5rem, 3.8vw, 4.25rem);
          font-weight: 900;
          line-height: 0.98;
          letter-spacing: -0.025em;
          text-wrap: balance;
        }

        .reservations-hero-highlight {
          display: block;
          margin-top: 0.15em;
          font-size: clamp(2.25rem, 3.15vw, 3.55rem);
          line-height: 1.05;
          letter-spacing: -0.025em;
          background: linear-gradient(90deg, #F6D58D, #C9943A);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .reservations-hero-subtitle {
          max-width: 650px;
          margin-bottom: 1.75rem;
          color: #F5D7BF;
          font-size: clamp(0.92rem, 1.1vw, 1.05rem);
          line-height: 1.75;
        }

        .reservations-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .reservations-hero-actions a {
          min-height: 46px;
          font-size: 0.78rem;
        }

        .reservations-hero-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.75rem;
          width: 100%;
        }

        .reservations-hero-stat {
          min-width: 0;
          padding: 1rem 0.7rem;
          border: 1px solid rgba(201,148,58,0.3);
          border-radius: 20px;
          background: rgba(18,9,5,0.62);
          backdrop-filter: blur(14px);
          text-align: center;
        }

        .reservations-hero-stat-value {
          color: #F6D58D;
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 900;
          line-height: 1.2;
        }

        .reservations-hero-stat-label {
          margin-top: 0.25rem;
          color: #F5D7BF;
          font-size: 0.58rem;
          font-weight: 800;
          line-height: 1.4;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .reservations-floating-card {
          padding: 1.25rem;
          border: 1px solid rgba(201,148,58,0.38);
          border-radius: 22px;
          background: rgba(18,9,5,0.74);
          backdrop-filter: blur(18px);
          box-shadow: 0 22px 60px rgba(18,9,5,0.36);
        }

        .reservations-floating-title {
          color: #FFF7ED;
          font-size: 0.92rem;
          font-weight: 900;
          line-height: 1.35;
        }

        .reservations-floating-text {
          color: #F5D7BF;
          font-size: 0.78rem;
          line-height: 1.55;
        }

        .reservations-section-title {
          color: #3D1F0D;
          font-family: var(--font-heading);
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.015em;
          text-wrap: balance;
        }

        .reservations-section-subtitle {
          color: #6B3520;
          font-size: 0.9rem;
          line-height: 1.7;
        }

        .reservations-card-title {
          color: #3D1F0D;
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-weight: 900;
          line-height: 1.35;
        }

        .reservations-body-text {
          color: #6B3520;
          font-size: 0.88rem;
          line-height: 1.7;
        }

        .reservations-supporting-text {
          color: #6B3520;
          font-size: 0.8rem;
          line-height: 1.6;
        }

        .reservations-form-label {
          display: block;
          margin-bottom: 0.5rem;
          color: #3D1F0D;
          font-size: 0.75rem;
          font-weight: 800;
          line-height: 1.4;
        }

        .reservations-form-control {
          width: 100%;
          min-height: 46px;
          color: #3D1F0D;
          font-size: 0.875rem;
        }

        .reservations-time-slot {
          min-height: 40px;
          font-size: 0.78rem;
        }

        .reservations-action {
          min-height: 44px;
          font-size: 0.78rem;
        }

        @media (max-width: 1199px) {
          .reservations-hero {
            min-height: 560px;
          }

          .reservations-hero-inner {
            padding:
              3.5rem
              clamp(1.5rem, 4vw, 3rem)
              3rem;
          }

          .reservations-hero-grid {
            grid-template-columns:
              minmax(0, 1.1fr)
              minmax(280px, 0.9fr);
            gap: 2.5rem;
          }

          .reservations-hero-title {
            font-size: clamp(2.5rem, 5vw, 3.75rem);
          }

          .reservations-hero-highlight {
            font-size: clamp(2.15rem, 4.25vw, 3.15rem);
          }
        }

        @media (max-width: 899px) {
          .reservations-hero {
            min-height: auto;
          }

          .reservations-hero-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 2.25rem;
          }

          .reservations-hero-copy {
            max-width: 680px;
          }

          .reservations-floating-card {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          .reservations-hero {
            min-height: auto;
            align-items: flex-start !important;
          }

          .reservations-hero-inner {
            padding: 3rem 1.25rem 2.5rem;
          }

          .reservations-hero-eyebrow {
            font-size: 0.65rem;
          }

          .reservations-hero-title {
            font-size: clamp(2.15rem, 11vw, 3rem);
            line-height: 1;
            letter-spacing: -0.02em;
          }

          .reservations-hero-highlight {
            margin-top: 0.22em;
            font-size: clamp(1.9rem, 9.5vw, 2.65rem);
            line-height: 1.06;
            white-space: normal;
          }

          .reservations-hero-subtitle {
            max-width: 100%;
            font-size: 0.9rem;
            line-height: 1.7;
          }

          .reservations-hero-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 0.65rem;
          }

          .reservations-hero-actions a {
            width: 100%;
            justify-content: center;
          }

          .reservations-hero-stats {
            gap: 0.5rem;
          }

          .reservations-hero-stat {
            padding: 0.75rem 0.35rem;
            border-radius: 16px;
          }

          .reservations-hero-stat-value {
            font-size: 1.05rem;
          }

          .reservations-hero-stat-label {
            font-size: 0.52rem;
            letter-spacing: 0.05em;
          }

          .reservations-section-title {
            font-size: clamp(1.7rem, 8vw, 2.15rem);
          }

          .reservations-card-title {
            font-size: 1rem;
          }

          .reservations-body-text {
            font-size: 0.86rem;
          }

          .reservations-form-card {
            padding: 1.25rem !important;
            border-radius: 24px !important;
          }

          .reservations-side-card {
            padding: 1.25rem !important;
            border-radius: 24px !important;
          }

          .reservations-time-slots {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0.5rem !important;
          }

          .reservations-time-slot {
            width: 100%;
            padding-left: 0.35rem !important;
            padding-right: 0.35rem !important;
          }
        }

        @media (max-width: 374px) {
          .reservations-hero-inner {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .reservations-hero-title {
            font-size: 2rem;
          }

          .reservations-hero-highlight {
            font-size: 1.75rem;
          }

          .reservations-time-slots {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
      <div
        className="reservations-page min-h-screen"
        style={{
          background:
            'linear-gradient(to bottom,#FFF7ED,#F5E6D3,#FFF7ED)'
        }}
      >
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="reservations-hero relative flex items-center overflow-hidden">
          {/* Background: image if uploaded, else gradient */}
          {getImageUrl(hero?.image) ? (
            <>
              <img
                src={getImageUrl(hero!.image)!}
                alt={hero?.title || 'Reservation Hero'}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.9, filter: 'brightness(1.05) contrast(1.08) saturate(1.08)' }}
              />
              <div className="absolute inset-0" style={{ background: 'rgba(20, 8, 3, 0.62)' }} />
            </>
          ) : (
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1A0D07 0%, #3D1F0D 50%, #6B3520 100%)' }} />
          )}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #C9943A 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="reservations-hero-inner">
            <div className="reservations-hero-grid">
              <div className="reservations-hero-copy">
                <p className="reservations-hero-eyebrow mb-4">
                  {hero?.eyebrow || 'TABLE RESERVATIONS'}
                </p>
                <h1 className="reservations-hero-title">
                  {hero?.title || 'Reserve Your'}
                  <span className="reservations-hero-highlight">
                    {hero?.highlight_text || 'Perfect Café Moment'}
                  </span>
                </h1>
                <p className="reservations-hero-subtitle">
                  {hero?.subtitle || 'Book your table at your nearby Big Bean Café outlet and enjoy fresh coffee, food and warm conversations.'}
                </p>
                <div className="reservations-hero-actions">
                  <a 
                    href="#reservation-form"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(to right, #C9943A, #8B4A2F)' }}
                  >
                    {hero?.button_primary_text || 'Reserve Table'}
                  </a>
                  <a 
                    href={hero?.button_secondary_url || '/outlets'}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold border-2 transition-all hover:bg-white/10"
                    style={{ borderColor: '#C9943A', color: '#FFF7ED' }}
                  >
                    {hero?.button_secondary_text || 'View Outlets'}
                  </a>
                </div>
              </div>
              
              {/* Stats Glass Strip */}
              <div className="reservations-hero-stats">
                {[
                  { value: hero?.stat_1_value || '7+', label: hero?.stat_1_label || 'Outlets' },
                  { value: hero?.stat_2_value || '30 Days', label: hero?.stat_2_label || 'Advance Booking' },
                  { value: hero?.stat_3_value || 'Fast', label: hero?.stat_3_label || 'Confirmation' }
                ].map((stat, i) => (
                  <div key={i} className="reservations-hero-stat">
                    <p className="reservations-hero-stat-value">{stat.value}</p>
                    <p className="reservations-hero-stat-label">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Floating Card */}
            <div className="reservations-floating-card hidden xl:block absolute right-0 top-1/2 -translate-y-1/2 max-w-xs">
              <p className="reservations-floating-title mb-2">Table booking made easy</p>
              <p className="reservations-floating-text">Choose outlet • Date • Time • Guests</p>
            </div>
          </div>
        </section>

        {/* Reservation Form */}
        <section id="reservation-form" className="py-16" style={{ background: 'transparent' }}>
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form Card */}
              <div className="reservations-form-card bg-white rounded-[34px] border border-[#E6C7A8] shadow-xl p-8">
                <div className="text-center mb-8">
                  <h2 className="reservations-section-title mb-2">Reserve Your Table</h2>
                  <p className="reservations-section-subtitle">Fill in the details below to reserve your table</p>
                </div>

                {outletsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" style={{ color: '#C9943A' }} />
                    <span style={{ color: '#6B3520' }}>Loading outlets...</span>
                  </div>
                ) : outletsError ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
                    <p className="text-red-700 text-sm">Unable to load outlets. Please try again or call us.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="reservations-form-label">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="reservations-form-control px-4 py-3 rounded-xl border border-[#E6C7A8] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 focus:border-[#C9943A] transition-all bg-white"
                          placeholder="Your full name"
                        />
                      </div>

                      <div>
                        <label className="reservations-form-label">Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="reservations-form-control px-4 py-3 rounded-xl border border-[#E6C7A8] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 focus:border-[#C9943A] transition-all bg-white"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="reservations-form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-[#E6C7A8] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 focus:border-[#C9943A] transition-all bg-white text-sm"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="reservations-form-label">Select Outlet *</label>
                      <select
                        name="outlet"
                        value={formData.outlet}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[#E6C7A8] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 focus:border-[#C9943A] transition-all bg-white text-sm"
                      >
                        <option value="">Choose an outlet</option>
                        {outlets.map(outlet => (
                          <option key={outlet.id} value={outlet.id}>
                            {outlet.name} — {outlet.address.substring(0, 30)}...
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="reservations-form-label">Reservation Date *</label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          required
                          min={getMinDate()}
                          max={getMaxDate()}
                          className="reservations-form-control px-4 py-3 rounded-xl border border-[#E6C7A8] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 focus:border-[#C9943A] transition-all bg-white"
                        />
                      </div>

                      <div>
                        <label className="reservations-form-label">Guests *</label>
                        <select
                          name="numberOfPeople"
                          value={formData.numberOfPeople}
                          onChange={handleInputChange}
                          required
                          className="reservations-form-control px-4 py-3 rounded-xl border border-[#E6C7A8] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 focus:border-[#C9943A] transition-all bg-white"
                        >
                          {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1} Guest{i !== 0 ? 's' : ''}</option>
                          ))}
                          <option value="10">10+ Guests - Please call outlet</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="reservations-form-label">Time *</label>
                      <div className="reservations-time-slots flex flex-wrap gap-2">
                        {timeSlots.map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, time }))}
                            className={`reservations-time-slot px-4 py-2 rounded-full font-medium transition-all ${
                              formData.time === time
                                ? 'text-white'
                                : 'border border-[#E6C7A8] hover:border-[#C9943A]'
                            }`}
                            style={{
                              background: formData.time === time ? 'linear-gradient(to right, #C9943A, #8B4A2F)' : 'white',
                              color: formData.time === time ? 'white' : '#3D1F0D'
                            }}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="reservations-form-label">Special Requests</label>
                      <textarea
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        rows={3}
                        className="reservations-form-control px-4 py-3 rounded-xl border border-[#E6C7A8] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 focus:border-[#C9943A] transition-all bg-white resize-none"
                        placeholder="Any special requirements or preferences..."
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="reservations-action w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(to right, #3D1F0D, #8B4A2F)' }}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </span>
                      ) : 'Reserve Table'}
                    </button>
                  </form>
                )}
              </div>

              {/* Outlet Preview Card */}
              <div className="space-y-6">
                {selectedOutlet ? (
                  <div className="reservations-side-card bg-white rounded-[34px] border border-[#E6C7A8] shadow-xl p-6">
                    {selectedOutlet.image && (
                      <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-gray-100">
                        <img 
                          src={selectedOutlet.image.startsWith('http') ? selectedOutlet.image : `${API_BASE_URL}/${selectedOutlet.image.replace(/^\/+/, '')}`}
                          alt={selectedOutlet.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="reservations-card-title mb-2">{selectedOutlet.name}</h3>
                    <p className="reservations-body-text mb-4">{selectedOutlet.address}</p>
                    
                    <div className="space-y-3 mb-6">
                      {selectedOutlet.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5" style={{ color: '#C9943A' }} />
                          <span style={{ fontSize: '0.85rem', color: '#3D1F0D' }}>{selectedOutlet.phone}</span>
                        </div>
                      )}
                      {selectedOutlet.opening_hours && (
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5" style={{ color: '#C9943A' }} />
                          <span style={{ fontSize: '0.85rem', color: '#3D1F0D' }}>{selectedOutlet.opening_hours}</span>
                        </div>
                      )}
                    </div>

                    <a
                      href={selectedOutlet.latitude && selectedOutlet.longitude
                        ? `https://www.google.com/maps?q=${selectedOutlet.latitude},${selectedOutlet.longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOutlet.address)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="reservations-action inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(to right, #C9943A, #8B4A2F)' }}
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </a>
                  </div>
                ) : (
                  <div className="reservations-side-card bg-white rounded-[34px] border border-[#E6C7A8] shadow-xl p-8 text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-4" style={{ color: '#E6C7A8' }} />
                    <h3 className="reservations-card-title mb-2">Choose Your Outlet</h3>
                    <p className="reservations-body-text">Select your preferred Big Bean Café outlet to see details</p>
                  </div>
                )}

                {/* Quick Guidelines */}
                <div className="reservations-side-card bg-white rounded-[34px] border border-[#E6C7A8] shadow-xl p-6">
                  <h3 className="reservations-card-title mb-4">Quick Guidelines</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#C9943A' }} />
                      <p className="reservations-body-text">Book up to 30 days in advance</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#C9943A' }} />
                      <p className="reservations-body-text">Confirmation via call/message</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#C9943A' }} />
                      <p className="reservations-body-text">Tables held for 15 minutes</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#C9943A' }} />
                      <p className="reservations-body-text">10+ guests: call outlet directly</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reservation Guidelines */}
        <section className="py-16" style={{ background: '#F5E6D3' }}>
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="reservations-section-title mb-3">Reservation Guidelines</h2>
              <p className="reservations-section-subtitle">Everything you need to know about booking your table</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Advance Booking',
                  description: 'Reservations can be made up to 30 days in advance for your convenience.'
                },
                {
                  title: 'Confirmation',
                  description: 'You will receive confirmation via call or message with all reservation details.'
                },
                {
                  title: 'Late Arrival',
                  description: 'Tables are held for 15 minutes past your reservation time.'
                },
                {
                  title: 'Large Groups',
                  description: 'For groups of 10 or more, please call the outlet directly to arrange.'
                },
                {
                  title: 'Special Occasions',
                  description: 'Let us know if you are celebrating a birthday, anniversary, or special event.'
                },
                {
                  title: 'Cancellation',
                  description: 'Please notify us at least 2 hours before your reservation time.'
                }
              ].map((guideline, i) => (
                <div 
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6C7A8] hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(to right, #C9943A, #8B4A2F)' }}>
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="reservations-card-title mb-2">{guideline.title}</h3>
                  <p className="reservations-body-text">{guideline.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Help Section */}
        <section className="py-16" style={{ background: 'transparent' }}>
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="reservations-section-title mb-3">Need Help with Reservations?</h2>
              <p className="reservations-section-subtitle">Our team is here to assist you with any questions</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#E6C7A8]">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(to right, #C9943A, #8B4A2F)' }}>
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <h3 className="reservations-card-title mb-2">Call Us</h3>
                <p className="reservations-body-text mb-4">{selectedOutlet?.phone || pubSettings.reservations_phone}</p>
                <a 
                  href={`tel:${formatPhoneForTel(selectedOutlet?.phone || pubSettings.reservations_phone)}`}
                  className="reservations-action inline-block px-6 py-2 rounded-full font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(to right, #C9943A, #8B4A2F)' }}
                >
                  Call Now
                </a>
              </div>
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#E6C7A8]">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(to right, #C9943A, #8B4A2F)' }}>
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <h3 className="reservations-card-title mb-2">Visit Outlet</h3>
                <p className="reservations-body-text mb-4">Any Big Bean Café location</p>
                <a 
                  href="/outlets"
                  className="reservations-action inline-block px-6 py-2 rounded-full font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(to right, #C9943A, #8B4A2F)' }}
                >
                  View Outlets
                </a>
              </div>
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#E6C7A8]">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(to right, #C9943A, #8B4A2F)' }}>
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="reservations-card-title mb-2">Opening Hours</h3>
                <p className="reservations-body-text mb-4">{selectedOutlet?.opening_hours || '7:00 AM - 11:00 PM'}</p>
                <a 
                  href="https://bigbeancafe.store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="reservations-action inline-block px-6 py-2 rounded-full font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(to right, #C9943A, #8B4A2F)' }}
                >
                  Order Online
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
    </>
  )
}
