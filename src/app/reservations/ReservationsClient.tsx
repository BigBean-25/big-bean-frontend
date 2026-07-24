'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { Calendar, Clock, Users, MapPin, CheckCircle, Phone, Loader2, Navigation } from 'lucide-react'
import { getPublicSettings, formatPhoneForTel, CONTACT_DEFAULTS, type PublicContactSettings } from '@/lib/publicSettings'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')


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
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #FFF7ED, #F5E6D3, #FFF7ED)' }}>
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold font-heading mb-4" style={{ color: '#2A120B' }}>Reservation Request Received!</h1>
            <p className="mb-6" style={{ color: '#7A5A48' }}>Your reservation request has been received. Our team will confirm shortly.</p>
            <div className="bg-white rounded-2xl p-6 mb-6 text-left shadow-lg border border-[#E6C7A8]">
              <h3 className="font-bold mb-3" style={{ color: '#2A120B' }}>Reservation Details:</h3>
              <p className="text-sm mb-2" style={{ color: '#7A5A48' }}><strong>Name:</strong> {submittedReservation.name}</p>
              <p className="text-sm mb-2" style={{ color: '#7A5A48' }}><strong>Outlet:</strong> {submittedReservation.outletName}</p>
              <p className="text-sm mb-2" style={{ color: '#7A5A48' }}><strong>Date:</strong> {submittedReservation.date}</p>
              <p className="text-sm mb-2" style={{ color: '#7A5A48' }}><strong>Time:</strong> {submittedReservation.time}</p>
              <p className="text-sm mb-2" style={{ color: '#7A5A48' }}><strong>Guests:</strong> {submittedReservation.guests}</p>
              {submittedReservation.phone && <p className="text-sm mb-2" style={{ color: '#7A5A48' }}><strong>Phone:</strong> {submittedReservation.phone}</p>}
            </div>
            <button 
              onClick={() => { setIsSubmitted(false); setSubmittedReservation(null) }}
              className="px-8 py-3 rounded-xl font-semibold text-white transition-opacity"
              style={{ background: 'linear-gradient(to right, #3D1F0D, #8B4A2F)' }}
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #FFF7ED, #F5E6D3, #FFF7ED)' }}>
      <Header />
      
      <main>
        {/* Hero Section */}
        <section 
          className="relative min-h-[520px] md:min-h-[520px] flex items-center pt-[5.5rem] pb-16 overflow-hidden"
        >
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
          <div className="container-custom relative z-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-sm font-bold tracking-[0.22em] uppercase mb-4" style={{ color: '#C9943A' }}>
                  {hero?.eyebrow || 'TABLE RESERVATIONS'}
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-4" style={{ color: '#FFF7ED', lineHeight: 1.1 }}>
                  {hero?.title || 'Reserve Your'}{' '}
                  <span style={{ color: '#C9943A' }}>{hero?.highlight_text || 'Perfect Café Moment'}</span>
                </h1>
                <p className="text-lg mb-8" style={{ color: '#F5E6D3', maxWidth: '500px' }}>
                  {hero?.subtitle || 'Book your table at your nearby Big Bean Café outlet and enjoy fresh coffee, food and warm conversations.'}
                </p>
                <div className="flex flex-wrap gap-4">
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
              <div className="hidden md:flex flex-wrap gap-4">
                {[
                  { value: hero?.stat_1_value || '7+', label: hero?.stat_1_label || 'Outlets' },
                  { value: hero?.stat_2_value || '30 Days', label: hero?.stat_2_label || 'Advance Booking' },
                  { value: hero?.stat_3_value || 'Fast', label: hero?.stat_3_label || 'Confirmation' }
                ].map((stat, i) => (
                  <div 
                    key={i}
                    className="flex-1 min-w-[120px] bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                  >
                    <p className="text-2xl font-bold font-heading" style={{ color: '#C9943A' }}>{stat.value}</p>
                    <p className="text-sm" style={{ color: '#F5E6D3' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Floating Card */}
            <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-[#E6C7A8] max-w-xs">
              <p className="text-sm font-semibold mb-2" style={{ color: '#3D1F0D' }}>Table booking made easy</p>
              <p className="text-xs" style={{ color: '#6B3520' }}>Choose outlet • Date • Time • Guests</p>
            </div>
          </div>
        </section>

        {/* Reservation Form */}
        <section id="reservation-form" className="py-16" style={{ background: 'transparent' }}>
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form Card */}
              <div className="bg-white rounded-[34px] border border-[#E6C7A8] shadow-xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold font-heading mb-2" style={{ color: '#3D1F0D' }}>Reserve Your Table</h2>
                  <p style={{ color: '#6B3520' }}>Fill in the details below to reserve your table</p>
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
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#3D1F0D' }}>Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-[#E6C7A8] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 focus:border-[#C9943A] transition-all bg-white text-sm"
                          placeholder="Your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#3D1F0D' }}>Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-[#E6C7A8] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 focus:border-[#C9943A] transition-all bg-white text-sm"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#3D1F0D' }}>Email</label>
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
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#3D1F0D' }}>Select Outlet *</label>
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
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#3D1F0D' }}>Reservation Date *</label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          required
                          min={getMinDate()}
                          max={getMaxDate()}
                          className="w-full px-4 py-3 rounded-xl border border-[#E6C7A8] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 focus:border-[#C9943A] transition-all bg-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#3D1F0D' }}>Guests *</label>
                        <select
                          name="numberOfPeople"
                          value={formData.numberOfPeople}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-[#E6C7A8] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 focus:border-[#C9943A] transition-all bg-white text-sm"
                        >
                          {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1} Guest{i !== 0 ? 's' : ''}</option>
                          ))}
                          <option value="10">10+ Guests - Please call outlet</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-3" style={{ color: '#3D1F0D' }}>Time *</label>
                      <div className="flex flex-wrap gap-2">
                        {timeSlots.map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, time }))}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#3D1F0D' }}>Special Requests</label>
                      <textarea
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-[#E6C7A8] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 focus:border-[#C9943A] transition-all bg-white text-sm resize-none"
                        placeholder="Any special requirements or preferences..."
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="bg-white rounded-[34px] border border-[#E6C7A8] shadow-xl p-6">
                    {selectedOutlet.image && (
                      <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-gray-100">
                        <img 
                          src={selectedOutlet.image.startsWith('http') ? selectedOutlet.image : `${API_BASE_URL}/${selectedOutlet.image.replace(/^\/+/, '')}`}
                          alt={selectedOutlet.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-bold font-heading mb-2" style={{ color: '#3D1F0D' }}>{selectedOutlet.name}</h3>
                    <p className="text-sm mb-4" style={{ color: '#6B3520' }}>{selectedOutlet.address}</p>
                    
                    <div className="space-y-3 mb-6">
                      {selectedOutlet.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5" style={{ color: '#C9943A' }} />
                          <span className="text-sm" style={{ color: '#3D1F0D' }}>{selectedOutlet.phone}</span>
                        </div>
                      )}
                      {selectedOutlet.opening_hours && (
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5" style={{ color: '#C9943A' }} />
                          <span className="text-sm" style={{ color: '#3D1F0D' }}>{selectedOutlet.opening_hours}</span>
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
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(to right, #C9943A, #8B4A2F)' }}
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </a>
                  </div>
                ) : (
                  <div className="bg-white rounded-[34px] border border-[#E6C7A8] shadow-xl p-8 text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-4" style={{ color: '#E6C7A8' }} />
                    <h3 className="text-lg font-bold font-heading mb-2" style={{ color: '#3D1F0D' }}>Choose Your Outlet</h3>
                    <p className="text-sm" style={{ color: '#6B3520' }}>Select your preferred Big Bean Café outlet to see details</p>
                  </div>
                )}

                {/* Quick Guidelines */}
                <div className="bg-white rounded-[34px] border border-[#E6C7A8] shadow-xl p-6">
                  <h3 className="text-lg font-bold font-heading mb-4" style={{ color: '#3D1F0D' }}>Quick Guidelines</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#C9943A' }} />
                      <p className="text-sm" style={{ color: '#6B3520' }}>Book up to 30 days in advance</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#C9943A' }} />
                      <p className="text-sm" style={{ color: '#6B3520' }}>Confirmation via call/message</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#C9943A' }} />
                      <p className="text-sm" style={{ color: '#6B3520' }}>Tables held for 15 minutes</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#C9943A' }} />
                      <p className="text-sm" style={{ color: '#6B3520' }}>10+ guests: call outlet directly</p>
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
              <h2 className="text-3xl font-bold font-heading mb-3" style={{ color: '#3D1F0D' }}>Reservation Guidelines</h2>
              <p style={{ color: '#6B3520' }}>Everything you need to know about booking your table</p>
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
                  <h3 className="text-lg font-bold font-heading mb-2" style={{ color: '#3D1F0D' }}>{guideline.title}</h3>
                  <p className="text-sm" style={{ color: '#6B3520' }}>{guideline.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Help Section */}
        <section className="py-16" style={{ background: 'transparent' }}>
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-heading mb-3" style={{ color: '#3D1F0D' }}>Need Help with Reservations?</h2>
              <p style={{ color: '#6B3520' }}>Our team is here to assist you with any questions</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#E6C7A8]">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(to right, #C9943A, #8B4A2F)' }}>
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold font-heading mb-2" style={{ color: '#3D1F0D' }}>Call Us</h3>
                <p className="text-sm mb-4" style={{ color: '#6B3520' }}>{selectedOutlet?.phone || pubSettings.reservations_phone}</p>
                <a 
                  href={`tel:${formatPhoneForTel(selectedOutlet?.phone || pubSettings.reservations_phone)}`}
                  className="inline-block px-6 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(to right, #C9943A, #8B4A2F)' }}
                >
                  Call Now
                </a>
              </div>
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#E6C7A8]">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(to right, #C9943A, #8B4A2F)' }}>
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold font-heading mb-2" style={{ color: '#3D1F0D' }}>Visit Outlet</h3>
                <p className="text-sm mb-4" style={{ color: '#6B3520' }}>Any Big Bean Café location</p>
                <a 
                  href="/outlets"
                  className="inline-block px-6 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(to right, #C9943A, #8B4A2F)' }}
                >
                  View Outlets
                </a>
              </div>
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#E6C7A8]">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(to right, #C9943A, #8B4A2F)' }}>
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold font-heading mb-2" style={{ color: '#3D1F0D' }}>Opening Hours</h3>
                <p className="text-sm mb-4" style={{ color: '#6B3520' }}>{selectedOutlet?.opening_hours || '7:00 AM - 11:00 PM'}</p>
                <a 
                  href="https://bigbeancafe.store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
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
  )
}
