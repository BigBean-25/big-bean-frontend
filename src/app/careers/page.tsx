import { Metadata } from 'next'
import { getSeo, buildMetadata, getFaqSchema } from '@/lib/seo'
import CareersClient from './CareersClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('careers')
  return buildMetadata(seo, {
    title: 'Careers at Big Bean Café | Join Our Coffee Team',
    description: 'Build your career at Big Bean Café Coffee Roasters. Explore job openings and apply to join our passionate coffee and hospitality team.',
    path: '/careers',
  })
}

export default async function Page() {
  const [seo] = await Promise.all([getSeo('careers')])
  const faqSchema = getFaqSchema(seo)
  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <CareersClient />
    </>
  )
}
