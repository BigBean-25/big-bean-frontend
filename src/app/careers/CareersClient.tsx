'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import {
  Briefcase, MapPin, Clock, Users, Search, ArrowRight,
  CheckCircle, Upload, Mail, Phone, Star, ChevronDown, X
} from 'lucide-react'
import { getPublicSettings, formatPhoneForTel, CONTACT_DEFAULTS, type PublicContactSettings } from '@/lib/publicSettings'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

const getImageUrl = (image?: string | null): string | null => {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${API_BASE_URL}/${image.replace(/^\/+/, '')}`
}

interface CareerHero {
  eyebrow: string; title: string; highlight_text: string | null; subtitle: string | null
  button_primary_text: string; button_primary_url: string
  button_secondary_text: string; button_secondary_url: string
  image: string | null
  stat_1_value: string; stat_1_label: string
  stat_2_value: string; stat_2_label: string
  stat_3_value: string; stat_3_label: string
}

interface CareerJob {
  id: number; title: string; department: string | null; location: string
  outlet_name: string | null; experience: string | null; job_type: string
  salary_range: string | null; short_description: string | null
  responsibilities: string | null; requirements: string | null; benefits: string | null
  is_featured: number
}

const CULTURE_CARDS = [
  { icon: '☕', title: 'Learn Coffee Craft', text: 'Get trained by expert baristas and learn specialty coffee from bean to cup.' },
  { icon: '🤝', title: 'Growing Teams', text: 'Work alongside passionate people in a collaborative, supportive environment.' },
  { icon: '⭐', title: 'Customer First', text: 'Deliver memorable experiences — every customer, every visit, every time.' },
  { icon: '🚀', title: 'Career Growth', text: 'We promote from within. Your growth journey starts from day one.' },
]

const BENEFITS_DATA = [
  { icon: '💰', title: 'Competitive Salary', text: 'Industry-leading pay with regular reviews and performance bonuses.' },
  { icon: '☕', title: 'Free Coffee & Meals', text: 'Unlimited coffee and complimentary meals on every shift.' },
  { icon: '📚', title: 'Training & Development', text: 'Certified barista training, leadership programs, and skill workshops.' },
  { icon: '📈', title: 'Career Growth', text: 'Fast-track career paths from barista to management roles.' },
  { icon: '👥', title: 'Team Culture', text: 'Inclusive, fun team culture with regular events and celebrations.' },
  { icon: '🏷️', title: 'Staff Discounts', text: 'Exclusive discounts on all merchandise and café products.' },
]

const HIRING_STEPS = [
  { step: '01', title: 'Apply Online', text: 'Submit your application and resume through our form below.' },
  { step: '02', title: 'HR Review', text: 'Our HR team reviews your profile within 5 working days.' },
  { step: '03', title: 'Interview', text: 'Shortlisted candidates are called for a café-based interview.' },
  { step: '04', title: 'Trial / Discussion', text: 'Experience a trial shift or final discussion with the team.' },
  { step: '05', title: 'Offer & Joining', text: 'Receive your offer letter and join the Big Bean Café family!' },
]

function splitBullets(text: string | null): string[] {
  if (!text) return []
  return text.split('\n').map(l => l.trim()).filter(Boolean)
}

function JobCard({ job, onApply }: { job: CareerJob; onApply: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const responsibilities = splitBullets(job.responsibilities).slice(0, 4)
  const requirements = splitBullets(job.requirements).slice(0, 4)

  return (
    <div className={`group bg-white rounded-[24px] border transition-all duration-300 shadow-sm hover:shadow-xl ${job.is_featured ? 'border-[#C9943A]' : 'border-[#E6C7A8]'}`}>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {!!job.is_featured && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />Featured
                </span>
              )}
              {job.job_type && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#FFF7ED', color: '#8B4A2F' }}>{job.job_type}</span>
              )}
            </div>
            <h3 className="font-bold text-xl font-heading mb-2" style={{ color: '#1A0D07' }}>{job.title}</h3>
            <div className="flex flex-wrap gap-4 text-xs" style={{ color: '#8B4A2F' }}>
              {job.department && <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{job.department}</span>}
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.outlet_name || job.location}</span>
              {job.experience && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{job.experience}</span>}
              {job.salary_range && <span className="flex items-center gap-1.5"><span className="text-xs">₹</span>{job.salary_range}</span>}
            </div>
          </div>
          <button onClick={onApply}
            className="flex-shrink-0 px-6 py-2.5 rounded-full font-bold text-white text-sm transition-all hover:opacity-90 hover:scale-105"
            style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
            Apply Now
          </button>
        </div>

        {job.short_description && (
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#6B3520' }}>{job.short_description}</p>
        )}

        {expanded && (
          <div className="grid sm:grid-cols-2 gap-5 pt-4 border-t border-[#F5E6D3]">
            {responsibilities.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#C9943A' }}>Responsibilities</p>
                <ul className="space-y-1.5">
                  {responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: '#6B3520' }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#C9943A' }} />{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {requirements.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#C9943A' }}>Requirements</p>
                <ul className="space-y-1.5">
                  {requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: '#6B3520' }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#C9943A' }} />{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {(job.responsibilities || job.requirements) && (
          <button onClick={() => setExpanded(!expanded)}
            className="mt-4 flex items-center gap-1.5 text-xs font-semibold transition-colors hover:opacity-75"
            style={{ color: '#C9943A' }}>
            {expanded ? 'Show Less' : 'View Details'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function Careers() {
  const [hero, setHero] = useState<CareerHero | null>(null)
  const [jobs, setJobs] = useState<CareerJob[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterLocation, setFilterLocation] = useState('all')
  const [selectedJob, setSelectedJob] = useState<CareerJob | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedApplication, setSubmittedApplication] = useState<{ name: string; jobTitle: string; email: string; phone: string } | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', experience: '',
    education: '', skills: '', expectedSalary: '', noticePeriod: '', coverLetter: ''
  })
  const [pubSettings, setPubSettings] = useState<PublicContactSettings>(CONTACT_DEFAULTS)

  useEffect(() => {
    Promise.allSettled([
      fetch(`${API_URL}/career-hero/active`).then(r => r.json()),
      fetch(`${API_URL}/career-jobs/active`).then(r => r.json()),
    ]).then(([heroRes, jobsRes]) => {
      if (heroRes.status === 'fulfilled' && heroRes.value.success) setHero(heroRes.value.data)
      if (jobsRes.status === 'fulfilled' && jobsRes.value.success) setJobs(jobsRes.value.data || [])
      setLoading(false)
    })
    getPublicSettings().then(setPubSettings).catch(() => {})
  }, [])

  const departments = ['all', ...Array.from(new Set(jobs.map(j => j.department).filter(Boolean) as string[]))]
  const jobTypes = ['all', ...Array.from(new Set(jobs.map(j => j.job_type).filter(Boolean)))]
  const locations = ['all', ...Array.from(new Set(jobs.map(j => j.outlet_name || j.location).filter(Boolean)))]

  const filteredJobs = jobs.filter(j => {
    if (filterDept !== 'all' && j.department !== filterDept) return false
    if (filterType !== 'all' && j.job_type !== filterType) return false
    if (filterLocation !== 'all' && (j.outlet_name || j.location) !== filterLocation) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        j.title.toLowerCase().includes(s) ||
        (j.department || '').toLowerCase().includes(s) ||
        (j.short_description || '').toLowerCase().includes(s)
      )
    }
    return true
  })

  const handleApplyClick = (job: CareerJob) => {
    setSelectedJob(job)
    setTimeout(() => {
      document.getElementById('career-application')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setSubmitError('Name, email and phone are required.')
      return
    }
    if (!selectedJob) {
      setSubmitError('Please select a position to apply for.')
      return
    }
    setIsSubmitting(true)
    setSubmitError('')
    try {
      const payload = new FormData()
      payload.append('job_id', selectedJob ? String(selectedJob.id) : '')
      payload.append('job_title', selectedJob ? selectedJob.title : '')
      payload.append('full_name', formData.name)
      payload.append('email', formData.email)
      payload.append('phone', formData.phone)
      payload.append('experience', formData.experience)
      payload.append('education', formData.education)
      payload.append('skills', formData.skills)
      payload.append('expected_salary', formData.expectedSalary)
      payload.append('notice_period', formData.noticePeriod)
      payload.append('cover_letter', formData.coverLetter)
      if (resumeFile) payload.append('resume', resumeFile)

      const res = await fetch(`${API_URL}/career-applications`, { method: 'POST', body: payload })
      const data = await res.json()
      if (data.success) {
        setSubmittedApplication({
          name: formData.name,
          jobTitle: selectedJob?.title || '',
          email: formData.email,
          phone: formData.phone
        })
        setIsSubmitted(true)
        setFormData({ name: '', email: '', phone: '', experience: '', education: '', skills: '', expectedSalary: '', noticePeriod: '', coverLetter: '' })
        setResumeFile(null)
        setSelectedJob(null)
      } else {
        setSubmitError(data.message || 'Failed to submit application. Please try again.')
      }
    } catch {
      setSubmitError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const heroImageUrl = getImageUrl(hero?.image)
  const lc = 'block text-sm font-semibold mb-1.5'
  const ic = 'w-full px-4 py-3 rounded-2xl border border-[#E6C7A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 bg-white'

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom,#FFF7ED,#F5E6D3,#FFF7ED)' }}>
      <Header />
      <main>

        {/* Hero */}
        <section className="relative min-h-[520px] md:min-h-[560px] flex items-center pt-[5.5rem] pb-16 overflow-hidden">
          {heroImageUrl ? (
            <>
              <img src={heroImageUrl} alt="Careers Hero" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.8 }} />
              <div className="absolute inset-0" style={{ background: 'rgba(14,7,3,0.70)' }} />
            </>
          ) : (
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#0e0703 0%,#3D1F0D 55%,#6B3520 100%)' }} />
          )}
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle,#C9943A 1px,transparent 1px)', backgroundSize: '30px 30px' }} />

          <div className="container-custom relative z-10">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-xs font-bold tracking-[0.25em] uppercase mb-5" style={{ color: '#C9943A' }}>
                  {hero?.eyebrow || 'CAREERS AT BIG BEAN CAFÉ'}
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-5" style={{ color: '#FFF7ED', lineHeight: 1.1 }}>
                  {hero?.title || 'Build Your Career'}{' '}
                  <span style={{ color: '#C9943A' }}>{hero?.highlight_text || 'With Big Bean Café'}</span>
                </h1>
                <p className="text-lg mb-8 leading-relaxed" style={{ color: '#F5E6D3', maxWidth: '500px' }}>
                  {hero?.subtitle || 'Join a passionate café team where coffee, people, learning and growth come together every day.'}
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href={hero?.button_primary_url || '#job-openings'}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                    {hero?.button_primary_text || 'View Openings'} <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href={hero?.button_secondary_url || '#career-application'}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold border-2 transition-all hover:bg-white/10"
                    style={{ borderColor: '#C9943A', color: '#FFF7ED' }}>
                    {hero?.button_secondary_text || 'Apply Now'}
                  </a>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-7 border border-white/20">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#C9943A,#8B4A2F)' }}>
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-white font-heading">Grow with Big Bean Café</p>
                      <p className="text-xs" style={{ color: '#F5E6D3' }}>Coffee • People • Learning • Leadership</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: hero?.stat_1_value || '7+', label: hero?.stat_1_label || 'Outlets' },
                      { value: hero?.stat_2_value || 'Team', label: hero?.stat_2_label || 'Growth' },
                      { value: hero?.stat_3_value || 'Coffee', label: hero?.stat_3_label || 'Culture' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/10 rounded-2xl p-4 text-center">
                        <p className="text-xl font-bold font-heading" style={{ color: '#C9943A' }}>{s.value}</p>
                        <p className="text-xs mt-1" style={{ color: '#F5E6D3' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Culture Strip */}
        <section className="py-16">
          <div className="container-custom">
            <div className="text-center mb-10">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#C9943A' }}>Life at Big Bean</p>
              <h2 className="text-3xl md:text-4xl font-bold font-heading" style={{ color: '#1A0D07' }}>More Than a Job — A Café Culture</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {CULTURE_CARDS.map((c, i) => (
                <div key={i} className="rounded-[24px] p-6 border border-[#E6C7A8] bg-white hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-center">
                  <div className="text-4xl mb-4">{c.icon}</div>
                  <h3 className="font-bold text-base font-heading mb-2" style={{ color: '#1A0D07' }}>{c.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B3520' }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Job Openings */}
        <section id="job-openings" className="py-16" style={{ background: 'linear-gradient(to bottom,#FBF4EC,#FFF7ED)' }}>
          <div className="container-custom">
            <div className="text-center mb-10">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#C9943A' }}>Join Our Team</p>
              <h2 className="text-3xl md:text-4xl font-bold font-heading" style={{ color: '#1A0D07' }}>Current Openings</h2>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              {/* Filters */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-[20px] border border-[#E6C7A8] p-5 shadow-sm sticky top-24">
                  <h3 className="font-bold text-sm mb-4" style={{ color: '#3D1F0D' }}>Filter Jobs</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input type="text" placeholder="Search roles..." value={search} onChange={e => setSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E6C7A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 bg-white" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Department</label>
                      <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E6C7A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 bg-white">
                        {departments.map(d => <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Job Type</label>
                      <select value={filterType} onChange={e => setFilterType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E6C7A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 bg-white">
                        {jobTypes.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Location</label>
                      <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E6C7A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 bg-white">
                        {locations.map(l => <option key={l} value={l}>{l === 'all' ? 'All Locations' : l}</option>)}
                      </select>
                    </div>
                    {(search || filterDept !== 'all' || filterType !== 'all' || filterLocation !== 'all') && (
                      <button onClick={() => { setSearch(''); setFilterDept('all'); setFilterType('all'); setFilterLocation('all') }}
                        className="w-full text-xs font-semibold py-2 rounded-xl border border-[#E6C7A8] hover:border-[#C9943A] transition-colors"
                        style={{ color: '#8B4A2F' }}>
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div className="lg:col-span-3 space-y-5">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="h-48 rounded-[24px] bg-gray-100 animate-pulse" />
                  ))
                ) : filteredJobs.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[24px] border border-[#E6C7A8]">
                    <p className="text-xl font-bold font-heading mb-2" style={{ color: '#3D1F0D' }}>No Current Openings</p>
                    <p className="text-sm mb-6" style={{ color: '#8B4A2F' }}>No jobs match your filters. You can still share your profile with us.</p>
                    <button onClick={() => document.getElementById('career-application')?.scrollIntoView({ behavior: 'smooth' })}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm"
                      style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                      Submit General Application
                    </button>
                  </div>
                ) : filteredJobs.map(job => (
                  <JobCard key={job.id} job={job} onApply={() => handleApplyClick(job)} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Join Big Bean */}
        <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0e0703 0%,#3D1F0D 60%,#1a0a06 100%)' }}>
          <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 50% 50%,#C9943A 0%,transparent 70%)' }} />
          <div className="container-custom relative z-10">
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#C9943A' }}>Why Join Us</p>
              <h2 className="text-3xl md:text-4xl font-bold font-heading" style={{ color: '#FFF7ED' }}>More Than a Workplace</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {BENEFITS_DATA.map((b, i) => (
                <div key={i} className="rounded-[24px] p-6 border border-white/10 bg-white/5 backdrop-blur-sm hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
                  <div className="text-3xl mb-4">{b.icon}</div>
                  <h3 className="font-bold text-base mb-2 font-heading" style={{ color: '#FFF7ED' }}>{b.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#F5E6D3' }}>{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hiring Process */}
        <section className="py-16">
          <div className="container-custom">
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#C9943A' }}>How It Works</p>
              <h2 className="text-3xl md:text-4xl font-bold font-heading" style={{ color: '#1A0D07' }}>Our Hiring Process</h2>
            </div>
            <div className="relative">
              <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5" style={{ background: 'linear-gradient(to right,#E6C7A8,#C9943A,#E6C7A8)' }} />
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {HIRING_STEPS.map((s, i) => (
                  <div key={i} className="text-center relative">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 font-bold text-lg font-heading"
                      style={{ background: 'linear-gradient(135deg,#C9943A,#8B4A2F)', color: 'white', boxShadow: '0 4px 20px rgba(201,148,58,0.4)' }}>
                      {s.step}
                    </div>
                    <h3 className="font-bold text-sm mb-1.5 font-heading" style={{ color: '#1A0D07' }}>{s.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: '#6B3520' }}>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section id="career-application" className="py-16" style={{ background: 'linear-gradient(to bottom,#FBF4EC,#FFF7ED)' }}>
          <div className="container-custom">
            <div className="text-center mb-10">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#C9943A' }}>Join The Team</p>
              <h2 className="text-3xl md:text-4xl font-bold font-heading" style={{ color: '#1A0D07' }}>Submit Your Application</h2>
            </div>

            {isSubmitted && submittedApplication ? (
              <div className="max-w-xl mx-auto">
                <div className="rounded-[32px] border border-[#E6C7A8] bg-white p-10 text-center shadow-lg">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg,#C9943A,#8B4A2F)' }}>
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold font-heading mb-2" style={{ color: '#1A0D07' }}>Application Submitted!</h3>
                  <p className="text-sm mb-6" style={{ color: '#6B3520' }}>Our HR team will review your application and contact you shortly.</p>
                  <div className="bg-[#FFF7ED] rounded-2xl p-5 text-left mb-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold" style={{ color: '#8B4A2F' }}>Name:</span>
                      <span style={{ color: '#1A0D07' }}>{submittedApplication.name}</span>
                    </div>
                    {submittedApplication.jobTitle && (
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold" style={{ color: '#8B4A2F' }}>Position:</span>
                        <span style={{ color: '#1A0D07' }}>{submittedApplication.jobTitle}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold" style={{ color: '#8B4A2F' }}>Email:</span>
                      <span style={{ color: '#1A0D07' }}>{submittedApplication.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold" style={{ color: '#8B4A2F' }}>Phone:</span>
                      <span style={{ color: '#1A0D07' }}>{submittedApplication.phone}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href="#job-openings" className="px-6 py-3 rounded-full font-bold text-sm border-2 border-[#C9943A] hover:bg-[#C9943A]/10 transition-all" style={{ color: '#C9943A' }}>
                      View More Openings
                    </a>
                    <button onClick={() => { setIsSubmitted(false); setSubmittedApplication(null) }}
                      className="px-6 py-3 rounded-full font-bold text-white text-sm" style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                      Submit Another
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-[28px] border border-[#E6C7A8] shadow-sm p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {submitError && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{submitError}</div>
                      )}

                      <div>
                        <label className={lc} style={{ color: '#3D1F0D' }}>Position Applied For <span className="text-red-500">*</span></label>
                        <select value={selectedJob ? String(selectedJob.id) : ''} onChange={e => {
                          const job = jobs.find(j => String(j.id) === e.target.value) || null
                          setSelectedJob(job)
                          if (job) setSubmitError('')
                        }} required className={ic}>
                          <option value="">Select a position</option>
                          {jobs.map(j => (
                            <option key={j.id} value={j.id}>{j.title}{j.department ? ` — ${j.department}` : ''}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={lc} style={{ color: '#3D1F0D' }}>Full Name <span className="text-red-500">*</span></label>
                          <input type="text" required value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className={ic} placeholder="Your full name" />
                        </div>
                        <div>
                          <label className={lc} style={{ color: '#3D1F0D' }}>Email <span className="text-red-500">*</span></label>
                          <input type="email" required value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className={ic} placeholder="you@email.com" />
                        </div>
                        <div>
                          <label className={lc} style={{ color: '#3D1F0D' }}>Phone <span className="text-red-500">*</span></label>
                          <input type="tel" required value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} className={ic} placeholder="+91 98765 43210" />
                        </div>
                        <div>
                          <label className={lc} style={{ color: '#3D1F0D' }}>Expected Salary</label>
                          <input type="text" value={formData.expectedSalary} onChange={e => setFormData(f => ({ ...f, expectedSalary: e.target.value }))} className={ic} placeholder="e.g. 4-5 LPA" />
                        </div>
                        <div>
                          <label className={lc} style={{ color: '#3D1F0D' }}>Notice Period</label>
                          <select value={formData.noticePeriod} onChange={e => setFormData(f => ({ ...f, noticePeriod: e.target.value }))} className={ic}>
                            <option value="">Select</option>
                            <option>Immediate</option>
                            <option>15 days</option>
                            <option>30 days</option>
                            <option>60 days</option>
                            <option>90 days</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={lc} style={{ color: '#3D1F0D' }}>Work Experience</label>
                        <textarea value={formData.experience} onChange={e => setFormData(f => ({ ...f, experience: e.target.value }))} rows={3} className={ic} placeholder="Describe your relevant work experience..." />
                      </div>
                      <div>
                        <label className={lc} style={{ color: '#3D1F0D' }}>Education</label>
                        <textarea value={formData.education} onChange={e => setFormData(f => ({ ...f, education: e.target.value }))} rows={2} className={ic} placeholder="Your educational background..." />
                      </div>
                      <div>
                        <label className={lc} style={{ color: '#3D1F0D' }}>Skills</label>
                        <textarea value={formData.skills} onChange={e => setFormData(f => ({ ...f, skills: e.target.value }))} rows={2} className={ic} placeholder="Relevant skills..." />
                      </div>
                      <div>
                        <label className={lc} style={{ color: '#3D1F0D' }}>Cover Letter</label>
                        <textarea value={formData.coverLetter} onChange={e => setFormData(f => ({ ...f, coverLetter: e.target.value }))} rows={4} className={ic} placeholder="Tell us why you want to join Big Bean Café..." />
                      </div>

                      <div>
                        <label className={lc} style={{ color: '#3D1F0D' }}>
                          Resume <span className="text-xs font-normal text-gray-400">(PDF, DOC, DOCX · Max 5MB)</span>
                        </label>
                        <label className="flex flex-col items-center gap-3 border-2 border-dashed border-[#E6C7A8] rounded-2xl p-6 cursor-pointer hover:border-[#C9943A] transition-colors group">
                          {resumeFile ? (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#C9943A,#8B4A2F)' }}>
                                <CheckCircle className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm" style={{ color: '#1A0D07' }}>{resumeFile.name}</p>
                                <p className="text-xs text-gray-400">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                              <button type="button" onClick={e => { e.preventDefault(); setResumeFile(null) }} className="ml-2 text-red-400 hover:text-red-600">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-300 group-hover:text-[#C9943A] transition-colors" />
                              <p className="text-sm text-gray-400 group-hover:text-[#C9943A] transition-colors">Click to upload resume</p>
                            </>
                          )}
                          <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setResumeFile(f) }} />
                        </label>
                      </div>

                      <button type="submit" disabled={isSubmitting}
                        className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all hover:opacity-90 disabled:opacity-60"
                        style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-5">
                  {selectedJob ? (
                    <div className="bg-white rounded-[24px] border-2 border-[#C9943A] shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#C9943A' }}>Selected Position</p>
                        <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                      </div>
                      <h3 className="font-bold text-lg font-heading mb-3" style={{ color: '#1A0D07' }}>{selectedJob.title}</h3>
                      <div className="space-y-2 text-sm">
                        {selectedJob.department && (
                          <p className="flex items-center gap-2" style={{ color: '#6B3520' }}><Briefcase className="w-3.5 h-3.5" />{selectedJob.department}</p>
                        )}
                        <p className="flex items-center gap-2" style={{ color: '#6B3520' }}><MapPin className="w-3.5 h-3.5" />{selectedJob.outlet_name || selectedJob.location}</p>
                        {selectedJob.experience && (
                          <p className="flex items-center gap-2" style={{ color: '#6B3520' }}><Clock className="w-3.5 h-3.5" />{selectedJob.experience}</p>
                        )}
                        <p className="flex items-center gap-2" style={{ color: '#6B3520' }}><Users className="w-3.5 h-3.5" />{selectedJob.job_type}</p>
                        {selectedJob.salary_range && (
                          <p className="flex items-center gap-2" style={{ color: '#6B3520' }}><span className="w-3.5 text-center text-xs">₹</span>{selectedJob.salary_range}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[24px] border border-[#E6C7A8] p-6">
                      <p className="text-sm font-semibold mb-2" style={{ color: '#3D1F0D' }}>Select a position above</p>
                      <p className="text-xs" style={{ color: '#8B4A2F' }}>Click "Apply Now" on any job card to auto-fill the position, or select from the dropdown.</p>
                    </div>
                  )}

                  <div className="rounded-[24px] p-6" style={{ background: 'linear-gradient(135deg,#3D1F0D,#6B3520)' }}>
                    <p className="font-bold text-base font-heading mb-4" style={{ color: '#FFF7ED' }}>HR Contact</p>
                    <div className="space-y-3">
                      <a href={`mailto:${pubSettings.career_email}`} className="flex items-center gap-3 text-sm hover:opacity-80 transition-opacity" style={{ color: '#F5E6D3' }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10"><Mail className="w-4 h-4" /></div>
                        {pubSettings.career_email}
                      </a>
                      <a href={`tel:${formatPhoneForTel(pubSettings.career_phone)}`} className="flex items-center gap-3 text-sm hover:opacity-80 transition-opacity" style={{ color: '#F5E6D3' }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10"><Phone className="w-4 h-4" /></div>
                        {pubSettings.career_phone}
                      </a>
                      <Link href="/outlets" className="flex items-center gap-3 text-sm hover:opacity-80 transition-opacity" style={{ color: '#F5E6D3' }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10"><MapPin className="w-4 h-4" /></div>
                        View Outlets
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16">
          <div className="container-custom">
            <div className="rounded-[36px] p-10 md:p-16 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#120905 0%,#3D1F0D 60%,#1a0a06 100%)' }}>
              <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%,#C9943A,transparent 70%)' }} />
              <div className="relative z-10">
                <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: '#C9943A' }}>Questions?</p>
                <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4" style={{ color: '#FFF7ED' }}>Have Questions About Careers?</h2>
                <p className="text-base mb-8 max-w-md mx-auto" style={{ color: '#F5E6D3' }}>Our HR team is happy to help you find the right opportunity at Big Bean Café.</p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <a href={`mailto:${pubSettings.career_email}`}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white"
                    style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                    <Mail className="w-4 h-4" /> {pubSettings.career_email}
                  </a>
                  <a href="#career-application"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold border-2 hover:bg-white/10 transition-all"
                    style={{ borderColor: '#C9943A', color: '#FFF7ED' }}>
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
