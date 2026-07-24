'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Settings, Globe, Palette, FileText, Share2, Smartphone, CreditCard,
  Mail, MessageCircle, Store, UtensilsCrossed, Tag, Search,
  Briefcase, Users2, Building2, Image, Newspaper, Users, Shield,
  Database, ScrollText, Save, Check, AlertCircle, ChevronRight,
  ExternalLink, Eye, EyeOff, RefreshCw, Download, Send, X, Menu,
  Facebook, Instagram, Youtube, Linkedin, Twitter,
} from 'lucide-react'
import apiRequest from '@/utils/api'

// ─── Tab definitions ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'general',          label: 'General',           icon: Globe,          desc: 'Site name, URL, contact' },
  { id: 'branding',         label: 'Branding',          icon: Palette,        desc: 'Logo, colors, favicon' },
  { id: 'website_content',  label: 'Website Content',   icon: FileText,       desc: 'Notice, footer, links' },
  { id: 'social_media',     label: 'Social Media',      icon: Share2,         desc: 'Platform links' },
  { id: 'app_promo',        label: 'App Promo',         icon: Smartphone,     desc: 'App download banner' },
  { id: 'payment_gateway',  label: 'Payment Gateway',   icon: CreditCard,     desc: 'Razorpay, COD' },
  { id: 'email_smtp',       label: 'Email / SMTP',      icon: Mail,           desc: 'Mail server config' },
  { id: 'sms_whatsapp',     label: 'SMS / WhatsApp',    icon: MessageCircle,  desc: 'SMS & WhatsApp alerts' },
  { id: 'outlets',          label: 'Outlets',           icon: Store,          desc: 'Outlet display settings' },
  { id: 'menu',             label: 'Menu',              icon: UtensilsCrossed, desc: 'Menu display options' },
  { id: 'offers_coupons',   label: 'Offers & Coupons',  icon: Tag,            desc: 'Coupon & offer settings' },
  { id: 'seo',              label: 'SEO',               icon: Search,         desc: 'Analytics, meta, robots' },
  { id: 'career',           label: 'Career',            icon: Briefcase,      desc: 'Career page settings' },
  { id: 'franchise',        label: 'Franchise',         icon: Users2,         desc: 'Franchise enquiry settings' },
  { id: 'corporate_orders', label: 'Corporate Orders',  icon: Building2,      desc: 'Corporate order config' },
  { id: 'gallery',          label: 'Gallery',           icon: Image,          desc: 'Gallery & Instagram feed' },
  { id: 'blog',             label: 'Blog',              icon: Newspaper,      desc: 'Blog settings' },
  { id: 'users_roles',      label: 'Users & Roles',     icon: Users,          desc: 'Admin access settings' },
  { id: 'security',         label: 'Security',          icon: Shield,         desc: 'Maintenance, captcha' },
  { id: 'backup',           label: 'Backup',            icon: Database,       desc: 'Backup & export' },
  { id: 'logs',             label: 'Logs',              icon: ScrollText,     desc: 'Settings change history' },
]

type SettingRow = { setting_key: string; setting_value: string; input_type: string; is_secret: number; setting_group: string }
type GroupedSettings = Record<string, Record<string, SettingRow>>
type FlatValues = Record<string, string>

// ─── Field helpers ────────────────────────────────────────────────────────────
const ic = 'w-full px-3 py-2 rounded-lg border border-[#DCE8E3] bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9943A]/30 focus:border-[#C9943A] transition'
const lc = 'block text-sm font-semibold text-gray-700 mb-1.5'

function ToggleField({ label, desc, fieldKey, values, onChange }: {
  label: string; desc?: string; fieldKey: string
  values: FlatValues; onChange: (k: string, v: string) => void
}) {
  const on = values[fieldKey] === '1'
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button type="button" onClick={() => onChange(fieldKey, on ? '0' : '1')}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${on ? 'bg-[#C9943A]' : 'bg-gray-200'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

function TextField({ label, fieldKey, values, onChange, type = 'text', placeholder = '', hint = '' }: {
  label: string; fieldKey: string; values: FlatValues
  onChange: (k: string, v: string) => void
  type?: string; placeholder?: string; hint?: string
}) {
  const [show, setShow] = useState(false)
  const isSecret = type === 'password'
  const inputType = isSecret ? (show ? 'text' : 'password') : type
  return (
    <div>
      <label className={lc}>{label}</label>
      <div className="relative">
        <input type={inputType} value={values[fieldKey] ?? ''} placeholder={placeholder}
          onChange={e => onChange(fieldKey, e.target.value)}
          className={ic + (isSecret ? ' pr-10' : '')} />
        {isSecret && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

function TextareaField({ label, fieldKey, values, onChange, rows = 3, hint = '' }: {
  label: string; fieldKey: string; values: FlatValues
  onChange: (k: string, v: string) => void; rows?: number; hint?: string
}) {
  return (
    <div>
      <label className={lc}>{label}</label>
      <textarea rows={rows} value={values[fieldKey] ?? ''} onChange={e => onChange(fieldKey, e.target.value)}
        className={ic + ' resize-none'} />
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

function ColorField({ label, fieldKey, values, onChange }: {
  label: string; fieldKey: string; values: FlatValues; onChange: (k: string, v: string) => void
}) {
  const val = values[fieldKey] || '#000000'
  return (
    <div>
      <label className={lc}>{label}</label>
      <div className="flex items-center gap-3">
        <input type="color" value={val} onChange={e => onChange(fieldKey, e.target.value)}
          className="h-9 w-14 rounded-lg border border-[#DCE8E3] cursor-pointer p-0.5" />
        <input type="text" value={val} onChange={e => onChange(fieldKey, e.target.value)}
          className={ic + ' flex-1'} placeholder="#000000" />
      </div>
    </div>
  )
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-sm p-6 space-y-5">
      {title && <h3 className="font-bold text-gray-900 text-base pb-2 border-b border-gray-100">{title}</h3>}
      {children}
    </div>
  )
}

// ─── Tab panels ───────────────────────────────────────────────────────────────
function GeneralTab({ v, set }: { v: FlatValues; set: (k: string, val: string) => void }) {
  return (
    <div className="space-y-5">
      <Card title="Site Information">
        <TextField label="Site Name" fieldKey="site_name" values={v} onChange={set} placeholder="Big Bean Café" />
        <TextareaField label="Site Description" fieldKey="site_description" values={v} onChange={set} rows={2} />
        <TextField label="Website URL" fieldKey="website_url" values={v} onChange={set} placeholder="https://www.bigbeancafe.in" />
        <TextField label="Store / Order URL" fieldKey="store_url" values={v} onChange={set} placeholder="https://bigbeancafe.store" />
        <TextField label="Business Type" fieldKey="business_type" values={v} onChange={set} />
      </Card>
      <Card title="Contact Details">
        <TextField label="Contact Email" fieldKey="contact_email" values={v} onChange={set} type="email" />
        <TextField label="Contact Phone" fieldKey="contact_phone" values={v} onChange={set} placeholder="+91 98765 43210" />
        <TextareaField label="Address" fieldKey="address" values={v} onChange={set} rows={2} />
      </Card>
      <Card title="Localisation">
        <TextField label="Timezone" fieldKey="timezone" values={v} onChange={set} placeholder="Asia/Kolkata" />
        <TextField label="Currency" fieldKey="currency" values={v} onChange={set} placeholder="INR" />
        <TextField label="Language" fieldKey="language" values={v} onChange={set} placeholder="en" />
      </Card>
    </div>
  )
}

function BrandingTab({ v, set }: { v: FlatValues; set: (k: string, val: string) => void }) {
  return (
    <div className="space-y-5">
      <Card title="Logo & Images">
        <TextField label="Logo URL" fieldKey="logo_url" values={v} onChange={set} hint="Path or full URL to main logo" />
        <TextField label="Footer Logo URL" fieldKey="footer_logo_url" values={v} onChange={set} hint="Leave blank to use main logo" />
        <TextField label="Favicon URL" fieldKey="favicon_url" values={v} onChange={set} placeholder="/favicon.ico" />
        <TextField label="Default OG / Social Share Image" fieldKey="default_og_image" values={v} onChange={set} hint="Used when page has no custom image" />
      </Card>
      <Card title="Brand Colours">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ColorField label="Primary" fieldKey="primary_color" values={v} onChange={set} />
          <ColorField label="Secondary" fieldKey="secondary_color" values={v} onChange={set} />
          <ColorField label="Accent" fieldKey="accent_color" values={v} onChange={set} />
        </div>
        <div className="flex gap-4 pt-2">
          {['primary_color','secondary_color','accent_color'].map(k => (
            <div key={k} className="flex-1 h-10 rounded-xl border border-gray-100 shadow-inner"
              style={{ background: v[k] || '#eee' }} />
          ))}
        </div>
      </Card>
    </div>
  )
}

function WebsiteContentTab({ v, set }: { v: FlatValues; set: (k: string, val: string) => void }) {
  return (
    <div className="space-y-5">
      <Card title="Homepage">
        <TextareaField label="Homepage Notice / Banner Text" fieldKey="homepage_notice" values={v} onChange={set} rows={2} hint="Shown as a sitewide notice bar. Leave blank to hide." />
      </Card>
      <Card title="Header">
        <TextField label="Order Button Text" fieldKey="header_order_button_text" values={v} onChange={set} placeholder="Order Online" />
        <TextField label="Order Button URL" fieldKey="header_order_button_url" values={v} onChange={set} placeholder="https://bigbeancafe.store" />
      </Card>
      <Card title="Footer">
        <TextareaField label="Footer Description" fieldKey="footer_description" values={v} onChange={set} rows={3} />
        <TextField label="Copyright Text" fieldKey="copyright_text" values={v} onChange={set} hint="Use {year} for dynamic year" />
      </Card>
      <Card title="Legal Links">
        <TextField label="Terms & Conditions URL" fieldKey="terms_url" values={v} onChange={set} placeholder="/terms-and-conditions" />
        <TextField label="Privacy Policy URL" fieldKey="privacy_url" values={v} onChange={set} placeholder="/privacy-policy" />
      </Card>
    </div>
  )
}

function SocialMediaTab({ v, set }: { v: FlatValues; set: (k: string, val: string) => void }) {
  const socials = [
    { key: 'social_facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/bigbeancafe' },
    { key: 'social_instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/bigbeancafe.in' },
    { key: 'social_linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/company/...' },
    { key: 'social_youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@...' },
    { key: 'social_twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/bigbeancafe' },
    { key: 'social_zomato', label: 'Zomato', icon: ExternalLink, placeholder: 'https://zomato.com/...' },
    { key: 'social_swiggy', label: 'Swiggy', icon: ExternalLink, placeholder: 'https://swiggy.com/...' },
    { key: 'social_threads', label: 'Threads', icon: Share2, placeholder: 'https://threads.net/@...' },
  ]
  return (
    <div className="space-y-5">
      <Card title="Social Profiles">
        <p className="text-xs text-gray-400 -mt-2 mb-1">Leave blank to hide icon in footer. Changes reflect on website footer after save.</p>
        {socials.map(s => (
          <div key={s.key} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F3F8F6] flex items-center justify-center flex-shrink-0">
              <s.icon className="w-4 h-4 text-[#C9943A]" />
            </div>
            <div className="flex-1">
              <input type="url" value={v[s.key] ?? ''} onChange={e => set(s.key, e.target.value)}
                placeholder={s.placeholder} className={ic} />
            </div>
            {v[s.key] && (
              <a href={v[s.key]} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#C9943A]"><ExternalLink className="w-4 h-4" /></a>
            )}
          </div>
        ))}
      </Card>
    </div>
  )
}

function AppPromoTab({ v, set }: { v: FlatValues; set: (k: string, val: string) => void }) {
  return (
    <div className="space-y-5">
      <Card>
        <ToggleField label="Enable App Promo Banner" desc="Show app download section on website" fieldKey="app_promo_enabled" values={v} onChange={set} />
      </Card>
      <Card title="App Content">
        <TextField label="Download Title" fieldKey="app_download_title" values={v} onChange={set} placeholder="Get the App" />
        <TextareaField label="Description" fieldKey="app_download_description" values={v} onChange={set} rows={2} />
        <TextField label="Android App URL (Play Store)" fieldKey="android_app_url" values={v} onChange={set} />
        <TextField label="iOS App URL (App Store)" fieldKey="ios_app_url" values={v} onChange={set} />
        <TextField label="App QR Image URL" fieldKey="app_qr_image" values={v} onChange={set} />
        <TextField label="App Banner Image URL" fieldKey="app_banner_image" values={v} onChange={set} />
      </Card>
    </div>
  )
}

function PaymentTab({ v, set, onTest }: { v: FlatValues; set: (k: string, val: string) => void; onTest: () => void }) {
  return (
    <div className="space-y-5">
      <Card>
        <ToggleField label="Enable Payments" desc="Master switch for all payment processing" fieldKey="payment_enabled" values={v} onChange={set} />
        <ToggleField label="COD Enabled" desc="Allow cash on delivery" fieldKey="cod_enabled" values={v} onChange={set} />
        <ToggleField label="Online Payment Enabled" desc="Accept card/UPI via gateway" fieldKey="online_payment_enabled" values={v} onChange={set} />
      </Card>
      <Card title="Razorpay Config">
        <div className="flex gap-3 mb-1">
          <div className="flex-1">
            <label className={lc}>Payment Mode</label>
            <select value={v['payment_mode'] || 'test'} onChange={e => set('payment_mode', e.target.value)}
              className={ic + ' bg-white'}>
              <option value="test">Test / Sandbox</option>
              <option value="live">Live / Production</option>
            </select>
          </div>
        </div>
        <TextField label="Razorpay Key ID" fieldKey="razorpay_key_id" values={v} onChange={set} placeholder="rzp_test_..." hint="Safe to show in frontend" />
        <TextField label="Razorpay Key Secret" fieldKey="razorpay_key_secret" values={v} onChange={set} type="password" hint="Never exposed to frontend. Leave blank to keep existing." />
        <TextField label="Razorpay Webhook Secret" fieldKey="razorpay_webhook_secret" values={v} onChange={set} type="password" hint="Leave blank to keep existing." />
        <button type="button" onClick={onTest}
          className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#F3F8F6] border border-[#DCE8E3] rounded-xl text-sm font-semibold text-gray-700 hover:bg-[#DCE8E3] transition">
          <RefreshCw className="w-4 h-4" /> Test Payment Config
        </button>
      </Card>
    </div>
  )
}

function EmailTab({ v, set, onTest }: { v: FlatValues; set: (k: string, val: string) => void; onTest: () => void }) {
  const [testing, setTesting] = useState(false)
  const handleTest = async () => {
    setTesting(true)
    await onTest()
    setTesting(false)
  }
  return (
    <div className="space-y-5">
      <Card>
        <ToggleField label="Enable SMTP Email" desc="Send emails via your mail server" fieldKey="smtp_enabled" values={v} onChange={set} />
      </Card>

      <Card title="Gmail Recommended Setup">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1">
          <p className="font-semibold">Gmail / Google Workspace SMTP</p>
          <p>Host: <code className="font-mono bg-amber-100 px-1 rounded">smtp.gmail.com</code> &nbsp; Port: <code className="font-mono bg-amber-100 px-1 rounded">587</code> &nbsp; Secure: <code className="font-mono bg-amber-100 px-1 rounded">false (STARTTLS)</code></p>
          <p className="text-amber-700">⚠️ You must use a <strong>Gmail App Password</strong>, not your normal Gmail password.</p>
          <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 underline hover:text-amber-900">
            Generate App Password at Google Account → Security → App passwords
          </a>
        </div>
      </Card>

      <Card title="SMTP Settings">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <TextField label="SMTP Host" fieldKey="smtp_host" values={v} onChange={set} placeholder="smtp.gmail.com" />
          </div>
          <div>
            <TextField label="Port" fieldKey="smtp_port" values={v} onChange={set} placeholder="587" />
          </div>
        </div>
        <div>
          <label className={lc}>SMTP Secure (TLS/SSL)</label>
          <select value={v['smtp_secure'] ?? 'false'} onChange={e => set('smtp_secure', e.target.value)}
            className={ic + ' bg-white'}>
            <option value="false">false — STARTTLS (use with port 587) ✓ Recommended for Gmail</option>
            <option value="true">true — SSL/TLS (use with port 465)</option>
          </select>
          <p className="mt-1 text-xs text-gray-400">Use <strong>false</strong> for port 587 (STARTTLS). Use <strong>true</strong> for port 465 (SSL).</p>
        </div>
        <TextField label="SMTP Username" fieldKey="smtp_user" values={v} onChange={set} placeholder="your@gmail.com" />
        <TextField label="SMTP Password / App Password" fieldKey="smtp_password" values={v} onChange={set} type="password"
          placeholder="Leave blank to keep existing password"
          hint="For Gmail: use App Password from Google Account → Security → App passwords" />
        <TextField label="From Name" fieldKey="mail_from_name" values={v} onChange={set} placeholder="Big Bean Café" />
        <TextField label="From Email" fieldKey="mail_from_email" values={v} onChange={set} type="email" />
        <TextField label="Admin Notification Email" fieldKey="admin_notification_email" values={v} onChange={set} type="email"
          hint="Test emails and order/enquiry notifications are sent here" />
        <div className="pt-2">
          <button type="button" onClick={handleTest} disabled={testing}
            className="flex items-center gap-2 px-4 py-2 bg-[#F3F8F6] border border-[#DCE8E3] rounded-xl text-sm font-semibold text-gray-700 hover:bg-[#DCE8E3] transition disabled:opacity-50">
            {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {testing ? 'Sending test email...' : 'Send Test Email'}
          </button>
          <p className="mt-1.5 text-xs text-gray-400">Sends a test email to the Admin Notification Email above. Save settings first before testing.</p>
        </div>
      </Card>
    </div>
  )
}

function SmsTab({ v, set, onTest }: { v: FlatValues; set: (k: string, val: string) => void; onTest: () => void }) {
  return (
    <div className="space-y-5">
      <Card>
        <ToggleField label="Enable SMS" fieldKey="sms_enabled" values={v} onChange={set} />
        <ToggleField label="Enable WhatsApp" fieldKey="whatsapp_enabled" values={v} onChange={set} />
      </Card>
      <Card title="MSG91 (SMS)">
        <TextField label="SMS Provider" fieldKey="sms_provider" values={v} onChange={set} placeholder="msg91" />
        <TextField label="MSG91 Auth Key" fieldKey="msg91_auth_key" values={v} onChange={set} type="password" hint="Leave blank to keep existing." />
        <TextField label="Sender ID" fieldKey="msg91_sender_id" values={v} onChange={set} placeholder="BIGBEA" />
        <TextField label="Template ID" fieldKey="msg91_template_id" values={v} onChange={set} />
      </Card>
      <Card title="WhatsApp">
        <TextField label="WhatsApp Provider" fieldKey="whatsapp_provider" values={v} onChange={set} />
        <TextField label="WhatsApp API Key" fieldKey="whatsapp_api_key" values={v} onChange={set} type="password" hint="Leave blank to keep existing." />
        <TextField label="WhatsApp Business Number" fieldKey="whatsapp_business_number" values={v} onChange={set} placeholder="+919876543210" />
      </Card>
      <button type="button" onClick={onTest}
        className="flex items-center gap-2 px-4 py-2 bg-[#F3F8F6] border border-[#DCE8E3] rounded-xl text-sm font-semibold text-gray-700 hover:bg-[#DCE8E3] transition">
        <Send className="w-4 h-4" /> Send Test SMS
      </button>
    </div>
  )
}

function SimpleTogglesCard({ title, fields, v, set }: {
  title: string; v: FlatValues; set: (k: string, val: string) => void
  fields: { key: string; label: string; desc?: string }[]
}) {
  return (
    <Card title={title}>
      {fields.map(f => <ToggleField key={f.key} label={f.label} desc={f.desc} fieldKey={f.key} values={v} onChange={set} />)}
    </Card>
  )
}

function SeoTab({ v, set }: { v: FlatValues; set: (k: string, val: string) => void }) {
  return (
    <div className="space-y-5">
      <Card title="Analytics & Tracking">
        <TextField label="Google Analytics ID" fieldKey="google_analytics_id" values={v} onChange={set} placeholder="G-XXXXXXXXXX" />
        <TextField label="Google Tag Manager ID" fieldKey="google_tag_manager_id" values={v} onChange={set} placeholder="GTM-XXXXXXX" />
        <TextField label="Google Search Console Verification" fieldKey="google_search_console_verification" values={v} onChange={set} />
        <TextField label="Facebook Pixel ID" fieldKey="facebook_pixel_id" values={v} onChange={set} />
        <TextField label="Bing Verification" fieldKey="bing_verification" values={v} onChange={set} />
      </Card>
      <Card title="Default Meta">
        <TextField label="Default Meta Title" fieldKey="default_meta_title" values={v} onChange={set} />
        <TextareaField label="Default Meta Description" fieldKey="default_meta_description" values={v} onChange={set} rows={3} />
        <ToggleField label="Index pages by default" desc="Sets default robots tag to index, follow" fieldKey="robots_index_default" values={v} onChange={set} />
      </Card>
    </div>
  )
}

function SecurityTab({ v, set }: { v: FlatValues; set: (k: string, val: string) => void }) {
  return (
    <div className="space-y-5">
      <Card>
        <ToggleField label="Maintenance Mode" desc="Shows banner on public website. Admin is unaffected." fieldKey="maintenance_enabled" values={v} onChange={set} />
        {v['maintenance_enabled'] === '1' && (
          <TextareaField label="Maintenance Message" fieldKey="maintenance_message" values={v} onChange={set} rows={2} />
        )}
        <ToggleField label="Rate Limiting" desc="Protect APIs from abuse" fieldKey="rate_limit_enabled" values={v} onChange={set} />
        <ToggleField label="CAPTCHA Enabled" fieldKey="captcha_enabled" values={v} onChange={set} />
      </Card>
      {v['captcha_enabled'] === '1' && (
        <Card title="CAPTCHA (Google reCAPTCHA)">
          <TextField label="Site Key" fieldKey="captcha_site_key" values={v} onChange={set} />
          <TextField label="Secret Key" fieldKey="captcha_secret_key" values={v} onChange={set} type="password" hint="Leave blank to keep existing." />
        </Card>
      )}
      <Card title="Access Control">
        <TextareaField label="Admin IP Whitelist" fieldKey="admin_ip_whitelist" values={v} onChange={set} rows={3} hint="One IP per line. Leave blank to allow all." />
      </Card>
    </div>
  )
}

function BackupTab({ v, set, onBackup, backupStatus }: {
  v: FlatValues; set: (k: string, val: string) => void
  onBackup: () => void; backupStatus: string
}) {
  return (
    <div className="space-y-5">
      <Card>
        <ToggleField label="Auto Backup Enabled" fieldKey="auto_backup_enabled" values={v} onChange={set} />
        <div>
          <label className={lc}>Backup Frequency</label>
          <select value={v['backup_frequency'] || 'daily'} onChange={e => set('backup_frequency', e.target.value)} className={ic + ' bg-white'}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <TextField label="Backup Email" fieldKey="backup_email" values={v} onChange={set} type="email" hint="Backup report sent here" />
        {v['last_backup_at'] && <p className="text-xs text-gray-400">Last backup: {v['last_backup_at']}</p>}
      </Card>
      <Card title="Manual Backup">
        <p className="text-sm text-gray-600">Export all site settings and recent logs as a JSON file for safekeeping.</p>
        {backupStatus && <p className="text-sm text-green-600 font-semibold">{backupStatus}</p>}
        <button type="button" onClick={onBackup}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition">
          <Download className="w-4 h-4" /> Download Backup JSON
        </button>
      </Card>
    </div>
  )
}

function LogsTab({ logs }: { logs: any[] }) {
  return (
    <div className="space-y-5">
      <Card title="Recent Settings Changes">
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No logs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-2 font-semibold text-gray-500 pr-4">Date</th>
                  <th className="pb-2 font-semibold text-gray-500 pr-4">Admin</th>
                  <th className="pb-2 font-semibold text-gray-500 pr-4">Key</th>
                  <th className="pb-2 font-semibold text-gray-500 pr-4">Action</th>
                  <th className="pb-2 font-semibold text-gray-500">New Value</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l: any) => (
                  <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-400 whitespace-nowrap">{new Date(l.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className="py-2 pr-4 text-gray-600">{l.admin_name || 'System'}</td>
                    <td className="py-2 pr-4 font-mono text-[#C9943A]">{l.setting_key}</td>
                    <td className="py-2 pr-4"><span className="px-2 py-0.5 rounded-full bg-[#F3F8F6] text-gray-600 font-semibold">{l.action}</span></td>
                    <td className="py-2 text-gray-500 max-w-[200px] truncate">{l.new_value || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [values, setValues] = useState<FlatValues>({})
  const [savedValues, setSavedValues] = useState<FlatValues>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [backupStatus, setBackupStatus] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()

  const isDirty = JSON.stringify(values) !== JSON.stringify(savedValues)

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiRequest('/site-settings')
      const data = await res.json()
      if (data.success) {
        const flat: FlatValues = {}
        Object.values(data.data as GroupedSettings).forEach(group => {
          Object.values(group).forEach((row: SettingRow) => {
            flat[row.setting_key] = row.setting_value ?? ''
          })
        })
        setValues(flat)
        setSavedValues(flat)
      }
    } catch {
      showToast('error', 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      const res = await apiRequest('/site-settings/logs')
      const data = await res.json()
      if (data.success) setLogs(data.data || [])
    } catch {}
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { if (activeTab === 'logs') fetchLogs() }, [activeTab, fetchLogs])

  const set = (k: string, v: string) => setValues(prev => ({ ...prev, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await apiRequest('/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: values }),
      })
      const data = await res.json()
      if (data.success) {
        setSavedValues({ ...values })
        showToast('success', 'Settings saved successfully!')
        if (activeTab === 'logs') fetchLogs()
      } else {
        showToast('error', data.message || 'Save failed')
      }
    } catch {
      showToast('error', 'Network error — could not save')
    } finally {
      setSaving(false)
    }
  }

  const testAction = async (endpoint: string, label: string) => {
    try {
      const res = await apiRequest(`/site-settings/${endpoint}`, { method: 'POST' })
      const d = await res.json()
      showToast(d.success ? 'success' : 'error', d.message)
    } catch {
      showToast('error', `${label} test failed`)
    }
  }

  const handleBackup = async () => {
    try {
      const res = await apiRequest('/site-settings/backup', { method: 'POST' })
      const d = await res.json()
      if (d.success) {
        const blob = new Blob([JSON.stringify(d.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bigbeancafe-settings-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        setBackupStatus('Backup downloaded!')
        setTimeout(() => setBackupStatus(''), 3000)
      } else {
        showToast('error', d.message)
      }
    } catch {
      showToast('error', 'Backup failed')
    }
  }

  const activeTabDef = TABS.find(t => t.id === activeTab)!

  const renderPanel = () => {
    if (loading) return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-[#C9943A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
    switch (activeTab) {
      case 'general':          return <GeneralTab v={values} set={set} />
      case 'branding':         return <BrandingTab v={values} set={set} />
      case 'website_content':  return <WebsiteContentTab v={values} set={set} />
      case 'social_media':     return <SocialMediaTab v={values} set={set} />
      case 'app_promo':        return <AppPromoTab v={values} set={set} />
      case 'payment_gateway':  return <PaymentTab v={values} set={set} onTest={() => testAction('test-payment', 'Payment')} />
      case 'email_smtp':       return <EmailTab v={values} set={set} onTest={() => testAction('test-mail', 'Mail')} />
      case 'sms_whatsapp':     return <SmsTab v={values} set={set} onTest={() => testAction('test-sms', 'SMS')} />
      case 'outlets':          return (
        <div className="space-y-5">
          <SimpleTogglesCard title="Outlet Display" v={values} set={set} fields={[
            { key: 'show_outlet_status', label: 'Show Open/Closed Status' },
            { key: 'show_outlet_map', label: 'Show Map on Outlet Page' },
            { key: 'enable_outlet_slug_pages', label: 'Enable Individual Outlet Pages' },
          ]} />
          <Card title="Outlet SEO">
            <TextField label="Outlet Page SEO Suffix" fieldKey="outlet_page_seo_suffix" values={values} onChange={set} placeholder="| Big Bean Café" />
          </Card>
        </div>
      )
      case 'menu':             return (
        <SimpleTogglesCard title="Menu Display Options" v={values} set={set} fields={[
          { key: 'menu_download_enabled', label: 'Enable Menu PDF Download' },
          { key: 'show_menu_prices', label: 'Show Prices' },
          { key: 'show_menu_images', label: 'Show Item Images' },
          { key: 'show_veg_nonveg_indicators', label: 'Show Veg/Non-Veg Indicators' },
          { key: 'menu_order_button_enabled', label: 'Show Order Button on Menu' },
        ]} />
      )
      case 'offers_coupons':   return (
        <div className="space-y-5">
          <SimpleTogglesCard title="Offers & Coupons" v={values} set={set} fields={[
            { key: 'coupons_enabled', label: 'Enable Coupons' },
            { key: 'show_expired_offers', label: 'Show Expired Offers' },
            { key: 'offer_banner_enabled', label: 'Show Offer Banner' },
          ]} />
          <Card title="Coupon Settings">
            <TextField label="First Order Coupon Code" fieldKey="first_order_coupon_code" values={values} onChange={set} />
            <TextareaField label="Default Coupon Terms" fieldKey="default_coupon_terms" values={values} onChange={set} rows={2} />
          </Card>
        </div>
      )
      case 'seo':              return <SeoTab v={values} set={set} />
      case 'career':           return (
        <div className="space-y-5">
          <Card>
            <ToggleField label="Career Page Enabled" fieldKey="career_enabled" values={values} onChange={set} />
            <ToggleField label="Resume Upload Required" fieldKey="career_resume_required" values={values} onChange={set} />
            <ToggleField label="Auto Reply Enabled" fieldKey="career_auto_reply_enabled" values={values} onChange={set} />
          </Card>
          <Card title="Career Settings">
            <TextField label="Applications Email" fieldKey="career_apply_email" values={values} onChange={set} type="email" />
            <TextareaField label="Auto Reply Message" fieldKey="career_auto_reply_message" values={values} onChange={set} rows={3} />
          </Card>
        </div>
      )
      case 'franchise':        return (
        <div className="space-y-5">
          <Card>
            <ToggleField label="Franchise Page Enabled" fieldKey="franchise_enabled" values={values} onChange={set} />
            <ToggleField label="Auto Reply Enabled" fieldKey="franchise_auto_reply_enabled" values={values} onChange={set} />
          </Card>
          <Card title="Franchise Settings">
            <TextField label="Notification Email" fieldKey="franchise_notification_email" values={values} onChange={set} type="email" />
            <TextareaField label="Auto Reply Message" fieldKey="franchise_auto_reply_message" values={values} onChange={set} rows={3} />
          </Card>
        </div>
      )
      case 'corporate_orders': return (
        <div className="space-y-5">
          <Card>
            <ToggleField label="Corporate Orders Enabled" fieldKey="corporate_orders_enabled" values={values} onChange={set} />
            <ToggleField label="Auto Reply Enabled" fieldKey="corporate_auto_reply_enabled" values={values} onChange={set} />
          </Card>
          <Card title="Corporate Settings">
            <TextField label="Notification Email" fieldKey="corporate_notification_email" values={values} onChange={set} type="email" />
            <TextField label="Minimum Order Value (₹)" fieldKey="minimum_corporate_order_value" values={values} onChange={set} placeholder="2000" />
          </Card>
        </div>
      )
      case 'gallery':          return (
        <div className="space-y-5">
          <SimpleTogglesCard title="Gallery Settings" v={values} set={set} fields={[
            { key: 'gallery_enabled', label: 'Gallery Enabled' },
            { key: 'instagram_feed_enabled', label: 'Instagram Feed Enabled' },
            { key: 'gallery_auto_approve', label: 'Auto Approve Gallery Items' },
          ]} />
          <Card title="Instagram">
            <TextField label="Instagram Access Token" fieldKey="instagram_access_token" values={values} onChange={set} type="password" hint="Leave blank to keep existing." />
          </Card>
        </div>
      )
      case 'blog':             return (
        <div className="space-y-5">
          <SimpleTogglesCard title="Blog Settings" v={values} set={set} fields={[
            { key: 'blog_enabled', label: 'Blog Enabled' },
            { key: 'blog_comments_enabled', label: 'Comments Enabled' },
          ]} />
          <Card title="Blog Defaults">
            <TextField label="Default Author" fieldKey="blog_author_default" values={values} onChange={set} placeholder="Big Bean Café Team" />
            <TextField label="Blog SEO Title Suffix" fieldKey="blog_seo_suffix" values={values} onChange={set} placeholder="| Big Bean Café Blog" />
          </Card>
        </div>
      )
      case 'users_roles':      return (
        <div className="space-y-5">
          <SimpleTogglesCard title="Admin Access" v={values} set={set} fields={[
            { key: 'allow_multiple_admins', label: 'Allow Multiple Admins' },
            { key: 'two_factor_enabled', label: 'Two-Factor Authentication' },
          ]} />
          <Card title="Session">
            <TextField label="Default Admin Role" fieldKey="default_admin_role" values={values} onChange={set} />
            <TextField label="Session Timeout (minutes)" fieldKey="session_timeout_minutes" values={values} onChange={set} placeholder="480" />
          </Card>
        </div>
      )
      case 'security':         return <SecurityTab v={values} set={set} />
      case 'backup':           return <BackupTab v={values} set={set} onBackup={handleBackup} backupStatus={backupStatus} />
      case 'logs':             return <LogsTab logs={logs} />
      default:                 return null
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F8F6]">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold transition-all
          ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#DCE8E3] shadow-sm">
        <div className="flex items-center justify-between px-4 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100" onClick={() => setSidebarOpen(o => !o)}>
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3D1F0D] to-[#8B4A2F] flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">Settings</h1>
              <p className="text-xs text-gray-400 mt-0.5">{activeTabDef.label} — {activeTabDef.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Unsaved changes
              </span>
            )}
            <button onClick={handleSave} disabled={saving || !isDirty}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 lg:top-[73px] z-20 lg:z-auto
          h-screen lg:h-[calc(100vh-73px)] overflow-y-auto
          w-64 bg-white border-r border-[#DCE8E3] shadow-sm flex-shrink-0
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="p-3 space-y-0.5">
            {TABS.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group
                    ${active
                      ? 'bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-[#F3F8F6] hover:text-gray-900'
                    }`}>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#C9943A]' : 'text-gray-400 group-hover:text-[#C9943A]'}`} />
                  <span className="text-sm font-semibold leading-none">{tab.label}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main panel */}
        <main className="flex-1 min-w-0 p-4 lg:p-8">
          <div className="max-w-3xl">
            {renderPanel()}

            {/* Bottom save bar */}
            {activeTab !== 'logs' && (
              <div className="mt-8 pt-6 border-t border-[#DCE8E3] flex items-center justify-between">
                {isDirty ? (
                  <p className="text-sm font-semibold text-amber-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> You have unsaved changes
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">All changes saved.</p>
                )}
                <button onClick={handleSave} disabled={saving || !isDirty}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
