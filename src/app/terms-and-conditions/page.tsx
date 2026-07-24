import { Metadata } from 'next'
import { getSeo, buildMetadata, getFaqSchema } from '@/lib/seo'
import TermsConditionsClient from './TermsConditionsClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('terms_conditions')
  return buildMetadata(seo, {
    title: 'Terms and Conditions | Big Bean Café',
    description: 'Read Big Bean Café terms and conditions governing the use of our website, services and online orders.',
    path: '/terms-and-conditions',
  })
}

export default async function Page() {
  const [seo] = await Promise.all([getSeo('terms_conditions')])
  const faqSchema = getFaqSchema(seo)
  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <TermsConditionsClient />
    </>
  )
}
