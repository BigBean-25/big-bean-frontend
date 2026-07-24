import { Metadata } from 'next'
import { getSeo, buildMetadata, getFaqSchema } from '@/lib/seo'
import FranchiseClient from './FranchiseClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('franchise')
  return buildMetadata(seo, {
    title: 'Big Bean Café Franchise | Own a Coffee Shop in Bengaluru',
    description: 'Partner with Big Bean Café and own a premium coffee shop franchise in Bengaluru. Apply for franchise opportunities today.',
    path: '/franchise',
  })
}

export default async function Page() {
  const [seo] = await Promise.all([getSeo('franchise')])
  const faqSchema = getFaqSchema(seo)
  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <FranchiseClient />
    </>
  )
}
