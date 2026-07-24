import {
  Briefcase,
  Phone,
  MapPin,
  ArrowRight,
  Store,
  BadgeCheck,
  TrendingUp,
  Users,
  Sparkles,
} from 'lucide-react'
import s from './FranchiseCTA.module.css'

export default function FranchiseCTA() {
  const benefits = [
    {
      icon: MapPin,
      title: 'Prime Location Support',
      text: 'Strategic site analysis, location guidance, and outlet planning support.',
    },
    {
      icon: BadgeCheck,
      title: 'Training & SOP Support',
      text: 'Complete café operations, staff training, brand standards, and launch support.',
    },
    {
      icon: TrendingUp,
      title: 'Growth-Ready Model',
      text: 'Built for scalable operations with proven products and customer experience.',
    },
  ]

  const stats = [
    { value: '7+', label: 'Outlets' },
    { value: 'Premium', label: 'Coffee Brand' },
    { value: '360°', label: 'Support' },
  ]

  return (
    <section className={s.section}>
      <div className={s.dots} />
      <div className={`${s.glow} ${s.glow1}`} />
      <div className={`${s.glow} ${s.glow2}`} />
      <div className={`${s.glow} ${s.glow3}`} />
      <span className={`${s.bean} ${s.bean1}`} />
      <span className={`${s.bean} ${s.bean2}`} />

      <div className={s.inner}>
        <div className={s.grid}>
          {/* Left Content */}
          <div>
            <div className={s.badge}>
              <Sparkles className={s.badgeIcon} />
              <span className={s.badgeText}>Franchise Opportunity</span>
            </div>

            <h2 className={`font-heading ${s.title}`}>
              Big Bean Cafe <span> Franchise Opportunities</span>
            </h2>

            <p className={`font-body ${s.subtitle}`}>
              Premium coffee brand, operational support, curated products, and scalable café business model.
            </p>

            {/* Stats */}
            <div className={s.stats}>
              {stats.map((item) => (
                <div key={item.label} className={s.stat}>
                  <div className={s.statValue}>{item.value}</div>
                  <div className={s.statLabel}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className={s.btnRow}>
              <a href="/franchise" className={s.btnPrimary}>
                Apply for Franchise
                <ArrowRight size={18} />
              </a>
              <a href="/franchise" className={s.btnSecondary}>
                Learn More
              </a>
            </div>
          </div>

          {/* Right Premium Card */}
          <div className={s.rightWrap}>
            <div className={s.rightGlow} />
            <div className={s.card}>
              <div className={s.innerCard}>
                <div className={s.cardHeader}>
                  <div className={s.iconBox}>
                    <Store size={28} />
                  </div>
                  <div className={s.pill}>FOCO Ready</div>
                </div>

                <h3 className={`font-heading ${s.cardTitle}`}>
                  Build your premium café business with Big Bean.
                </h3>

                <p className={s.cardDesc}>
                  From outlet setup to staff training and marketing support, we help you launch with confidence.
                </p>

                <div className={s.benefits}>
                  {benefits.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.title} className={s.benefit}>
                        <div className={s.benefitIcon}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <h4 className={s.benefitTitle}>{item.title}</h4>
                          <p className={s.benefitText}>{item.text}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Contact Strip */}
              <div className={s.contactStrip}>
                <a href="tel:+910000000000" className={s.contactBtn}>
                  <Phone size={16} />
                  Call Us
                </a>
                <a href="/franchise" className={s.contactBtn}>
                  <Briefcase size={16} />
                  Apply Now
                </a>
              </div>
            </div>

            {/* Floating Badges */}
            <div className={s.floatBadge}>
              <div className={s.floatIcon}>
                <Users size={18} />
              </div>
              <div>
                <p className={s.floatBadgeLabel}>Partner Support</p>
                <p className={s.floatBadgeValue}>End-to-end launch guidance</p>
              </div>
            </div>

            <div className={s.floatBadge2}>
              <div className={s.floatIcon}>
                <BadgeCheck size={18} />
              </div>
              <div>
                <p className={s.floatBadgeLabel}>FOCO Model</p>
                <p className={s.floatBadgeValue}>Setup + Training + Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
