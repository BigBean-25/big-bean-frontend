import { Metadata } from 'next'
import { getSeo, buildMetadata, getFaqSchema } from '@/lib/seo'
import OutletsClient from './OutletsClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('outlets')
  return buildMetadata(seo, {
    title: 'Big Bean Café Outlets in Bengaluru | Find Nearby Café',
    description: 'Find your nearest Big Bean Café outlet in Bengaluru. Visit us for fresh coffee, food, desserts, events and cozy café moments.',
    path: '/outlets',
  })
}

export default async function Page() {
  const [seo] = await Promise.all([getSeo('outlets')])
  const faqSchema = getFaqSchema(seo)
  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <OutletsClient />
    </>
  )
}
