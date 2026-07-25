'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Mail, Phone, Globe, Send, ArrowRight } from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaEnvelope, FaPhone, FaGlobe, FaWhatsapp } from 'react-icons/fa'
import s from './Footer.module.css'
import SocialFlipButton, { SocialItem } from '@/components/ui/social-flip-button'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

type PublicSettings = Record<string, string>

const DEFAULTS: PublicSettings = {
  site_name: 'Big Bean Café',
  footer_description: 'Fresh coffee, handcrafted beverages, café bites, desserts, and cozy café moments across Big Bean Café outlets.',
  contact_phone: '8073601065',
  contact_email: 'info@bigbeancafe.in',
  address: 'Bengaluru, Karnataka',
  website_url: 'https://www.bigbeancafe.in',
  store_url: 'https://bigbeancafe.store',
  social_facebook: '',
  social_instagram: '',
  social_linkedin: '',
  social_youtube: '',
  social_twitter: '',
  social_zomato: '',
  social_swiggy: '',
  social_threads: '',
  copyright_text: '© {year} Big Bean Café Coffee Roasters. All rights reserved.',
  terms_url: '/terms-and-conditions',
  privacy_url: '/privacy-policy',
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [settings, setSettings] = useState<PublicSettings>(DEFAULTS)

  useEffect(() => {
    fetch(`${API_URL}/site-settings/public`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setSettings({ ...DEFAULTS, ...d.data }) })
      .catch(() => {})
  }, [])

  const g = (key: string) => settings[key] ?? DEFAULTS[key] ?? ''
  const copyright = g('copyright_text').replace('{year}', String(new Date().getFullYear()))

  const cleanUrl = (url: string) => {
    const v = (url || '').trim()
    if (!v) return ''
    if (v.startsWith('http://') || v.startsWith('https://')) return v
    return `https://${v}`
  }

  const cleanPhone = g('contact_phone').replace(/\D/g, '')
  const whatsappNumber = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : ''

  const footerFlipItems: SocialItem[] = [
    { letter: 'B', icon: <FaInstagram />, label: 'Instagram', href: cleanUrl(g('social_instagram')) },
    { letter: 'I', icon: <FaFacebook />,  label: 'Facebook',  href: cleanUrl(g('social_facebook')) },
    { letter: 'G', icon: <FaLinkedin />,  label: 'LinkedIn',  href: cleanUrl(g('social_linkedin')) },
    { letter: 'B', icon: <FaEnvelope />,  label: 'Email',     href: g('contact_email') ? `mailto:${g('contact_email')}` : '' },
    { letter: 'E', icon: <FaPhone />,     label: 'Call',      href: cleanPhone ? `tel:${cleanPhone}` : '' },
    { letter: 'A', icon: <FaWhatsapp />,  label: 'WhatsApp',  href: whatsappNumber ? `https://wa.me/91${whatsappNumber}` : '' },
    { letter: 'N', icon: <FaGlobe />,     label: 'Website',   href: cleanUrl(g('website_url')) },
  ].filter(item => Boolean(item.href))

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'footer' }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setMessage(data.message || 'Subscribed successfully!')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.message || 'Please enter a valid email.')
      }
    } catch {
      setStatus('error')
      setMessage('Unable to subscribe. Please try again.')
    }
  }

  return (
    <footer className={s.footer}>
      <div className={s.footerGlow} />
      <div className={s.footerDots} />

      <div className={s.footerInner}>
        <div className={s.footerGrid}>
          {/* Brand */}
          <div className={s.brandCol}>
            <Link href="/" className={s.logoLink}>
              <Image
                src="/logo/big-bean-cafe-logo-transparent.png"
                alt="Big Bean Café"
                width={160}
                height={83}
                className={s.footerLogo}
                priority
              />
            </Link>
            <p className={s.footerDescription}>{g('footer_description')}</p>
            {footerFlipItems.length > 0 && (
              <div className={s.brandFlipWrap}>
                <p className={s.brandFlipLabel}>Connect with Big Bean</p>
                <SocialFlipButton
                  items={footerFlipItems}
                  className={s.brandFlipButton}
                  itemClassName={s.brandFlipItem}
                  frontClassName={s.brandFlipFront}
                  backClassName={s.brandFlipBack}
                />
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={s.footerHeading}>Quick Links</h3>
            <ul className={s.footerLinks}>
              {[
                { label: 'Home', href: '/' },
                { label: 'About', href: '/about' },
                { label: 'Our Story', href: '/our-story' },
                { label: 'Menu', href: '/menu' },
                { label: 'Outlets', href: '/outlets' },
                { label: 'Offers', href: '/offers' },
                { label: 'Contact', href: '/contact' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={s.footerLink}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h3 className={s.footerHeading}>Explore</h3>
            <ul className={s.footerLinks}>
              {[
                { label: 'Events', href: '/events' },
                { label: 'Reservations', href: '/reservations' },
                { label: 'Gallery', href: '/gallery' },
                { label: 'Blog', href: '/blog' },
                { label: 'Merchandise', href: '/merchandise' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={s.footerLink}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Business */}
          <div className={s.businessCol}>
            <h3 className={s.footerHeading}>Business</h3>
            <ul className={s.footerLinks}>
              <li><Link href="/careers" className={s.footerLink}>Careers</Link></li>
              <li><Link href="/corporate-orders" className={s.footerLink}>Corporate Orders</Link></li>
              <li><Link href="/franchise" className={s.footerLink}>Franchise</Link></li>
              {g('store_url') && (
                <li>
                  <a href={g('store_url')} target="_blank" rel="noopener noreferrer" className={s.footerLink}>
                    Order Online <ArrowRight size={14} />
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Contact + Subscribe */}
          <div className={s.contactCol}>
            <h3 className={s.footerHeading}>Contact Us</h3>
            <div className={s.contactList}>
              {g('address') && (
                <div className={s.contactItem}>
                  <MapPin className={s.contactIcon} />
                  <span>{g('address')}</span>
                </div>
              )}
              {g('contact_phone') && (
                <div className={s.contactItem}>
                  <Phone className={s.contactIcon} />
                  <a href={`tel:${g('contact_phone').replace(/\s+/g, '')}`}>{g('contact_phone')}</a>
                </div>
              )}
              {g('contact_email') && (
                <div className={s.contactItem}>
                  <Mail className={s.contactIcon} />
                  <a href={`mailto:${g('contact_email')}`}>{g('contact_email')}</a>
                </div>
              )}
              {g('website_url') && (
                <div className={s.contactItem}>
                  <Globe className={s.contactIcon} />
                  <a href={g('website_url')} target="_blank" rel="noopener noreferrer">
                    {g('website_url').replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>

            {/* Subscribe box */}
            <div className={s.newsletterBox}>
              <h4 className={s.newsletterTitle}>Stay in the Bean Loop</h4>
              <p className={s.newsletterSub}>New offers, events and café stories.</p>

              {status === 'success' ? (
                <p className={s.newsletterSuccess}>✓ {message}</p>
              ) : (
                <form onSubmit={handleSubscribe} className={s.newsletterForm}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setStatus('idle') }}
                    placeholder="Your email"
                    required
                    className={s.newsletterInput}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className={s.newsletterBtn}
                  >
                    <Send size={14} />
                    Join
                  </button>
                </form>
              )}
              {status === 'error' && (
                <p className={s.newsletterError}>{message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={s.footerBottom}>
          <p className={s.copyright}>{copyright}</p>
          <div className={s.legalLinks}>
            <Link href={g('privacy_url') || '/privacy-policy'} className={s.legalLink}>Privacy Policy</Link>
            <Link href={g('terms_url') || '/terms-and-conditions'} className={s.legalLink}>Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
