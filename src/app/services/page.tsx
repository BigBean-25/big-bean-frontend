import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { Coffee, Users, Briefcase, Heart, Award, Clock, CheckCircle } from 'lucide-react'

export default function Services() {
  const services = [
    {
      icon: Coffee,
      title: 'Premium Coffee Experience',
      description: 'Expertly crafted coffee using the finest beans from around the world, prepared by skilled baristas.',
      features: [
        'Single-origin coffee beans',
        'Multiple brewing methods',
        'Customizable drinks',
        'Seasonal specials'
      ],
      image: '/images/services/coffee.jpg'
    },
    {
      icon: Briefcase,
      title: 'Corporate Catering',
      description: 'Professional coffee catering services for meetings, conferences, and corporate events.',
      features: [
        'On-site coffee setup',
        'Customized menus',
        'Professional staff',
        'Equipment provision'
      ],
      image: '/images/services/corporate.jpg'
    },
    {
      icon: Users,
      title: 'Event Hosting',
      description: 'Host your private events, workshops, and celebrations in our beautiful café spaces.',
      features: [
        'Private event spaces',
        'Customized packages',
        'Audio-visual support',
        'Dedicated staff'
      ],
      image: '/images/services/events.jpg'
    },
    {
      icon: Heart,
      title: 'Coffee Subscriptions',
      description: 'Regular delivery of fresh coffee beans to your home or office with flexible subscription plans.',
      features: [
        'Weekly/biweekly delivery',
        'Fresh roasted beans',
        'Multiple roast options',
        'Pause or cancel anytime'
      ],
      image: '/images/services/subscription.jpg'
    },
    {
      icon: Award,
      title: 'Coffee Training',
      description: 'Professional barista training and coffee education programs for enthusiasts and professionals.',
      features: [
        'Beginner to advanced levels',
        'Certification courses',
        'Hands-on training',
        'Small class sizes'
      ],
      image: '/images/services/training.jpg'
    },
    {
      icon: Clock,
      title: 'Quick Service',
      description: 'Fast and efficient service with mobile ordering, QR code ordering, and express pickup.',
      features: [
        'Mobile app ordering',
        'QR code table service',
        'Express pickup counter',
        'Real-time order tracking'
      ],
      image: '/images/services/quick.jpg'
    }
  ]

  const benefits = [
    {
      title: 'Quality Assurance',
      description: 'We maintain the highest standards in every cup we serve.'
    },
    {
      title: 'Expert Staff',
      description: 'Our baristas are trained professionals passionate about coffee.'
    },
    {
      title: 'Premium Ingredients',
      description: 'We use only the finest ingredients and equipment.'
    },
    {
      title: 'Customer Satisfaction',
      description: 'Your satisfaction is our top priority.'
    },
    {
      title: 'Innovation',
      description: 'We constantly innovate to bring you the best coffee experience.'
    },
    {
      title: 'Sustainability',
      description: 'We are committed to sustainable and ethical practices.'
    }
  ]

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-64 bg-gradient-to-r from-coffee-800 to-coffee-900 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
              Our Services
            </h1>
            <p className="text-xl text-coffee-100">
              Comprehensive coffee solutions for every need
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={index} className="card p-6">
                  <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <service.icon className="w-8 h-8 text-coffee-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-coffee-900 mb-3 text-center">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-center mb-6">
                    {service.description}
                  </p>
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="section-padding bg-cream-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-coffee-900 font-heading mb-4">
                Why Choose Big Bean Café?
              </h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                We are committed to providing exceptional service and quality in everything we do
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-coffee-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-coffee-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-coffee-900 font-heading mb-4">
                How We Work
              </h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Simple and transparent process to get the best coffee experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-coffee-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-coffee-900 mb-2">
                  Consultation
                </h3>
                <p className="text-gray-600">
                  We understand your needs and requirements
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-coffee-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-coffee-900 mb-2">
                  Customization
                </h3>
                <p className="text-gray-600">
                  We tailor our services to match your preferences
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-coffee-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold text-coffee-900 mb-2">
                  Execution
                </h3>
                <p className="text-gray-600">
                  Our expert team delivers exceptional service
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-coffee-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  4
                </div>
                <h3 className="text-lg font-semibold text-coffee-900 mb-2">
                  Follow-up
                </h3>
                <p className="text-gray-600">
                  We ensure your satisfaction and gather feedback
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-gradient-to-r from-coffee-800 to-coffee-900 text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
              Ready to Experience Our Services?
            </h2>
            <p className="text-xl text-coffee-100 mb-8 max-w-3xl mx-auto">
              Whether you need coffee for your office, want to host an event, or simply want the best coffee experience, we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="btn-primary text-lg px-8 py-4 bg-white text-coffee-900 hover:bg-gray-100"
              >
                Contact Us
              </a>
              <a
                href="/corporate-orders"
                className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-coffee-900"
              >
                Corporate Orders
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
