import { Metadata } from 'next'
import { getSeo, buildMetadata, getFaqSchema } from '@/lib/seo'
import AboutClient from './AboutClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('about')
  return buildMetadata(seo, {
    title: 'About Big Bean Café | Coffee Roasters in Bengaluru',
    description: 'Discover Big Bean Café Coffee Roasters, our story, coffee culture and passion for handcrafted beverages and café experiences across Bengaluru.',
    path: '/about',
  })
}

const ABOUT_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does Big Bean Cafe have multiple outlets in Bengaluru?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Big Bean Cafe currently operates seven outlets across Bengaluru, making it easy for customers to enjoy our premium coffee and handcrafted food from multiple locations.' },
    },
    {
      '@type': 'Question',
      name: 'Can I order online from Big Bean Cafe?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Customers can currently order through Swiggy and Zomato. Our own website and mobile application will soon support direct online ordering.' },
    },
    {
      '@type': 'Question',
      name: 'Do you serve breakfast?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Our menu includes breakfast, handcrafted coffee, snacks, desserts and a variety of freshly prepared food.' },
    },
    {
      '@type': 'Question',
      name: 'Where is the first Big Bean Cafe outlet?',
      acceptedAnswer: { '@type': 'Answer', text: 'Big Bean Cafe started its journey with its first outlet in RR Nagar, Bengaluru.' },
    },
    {
      '@type': 'Question',
      name: 'Do you offer dine-in and takeaway?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. All Big Bean Cafe outlets provide both dine-in and takeaway services.' },
    },
  ],
}

export default async function Page() {
  const [seo] = await Promise.all([getSeo('about')])
  const faqSchema = getFaqSchema(seo)
  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ABOUT_FAQ_SCHEMA) }}
      />
      <AboutClient />
    </>
  )
}
