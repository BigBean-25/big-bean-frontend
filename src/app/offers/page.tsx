import { Metadata } from 'next'
import { getSeo, buildMetadata, getFaqSchema } from '@/lib/seo'
import OffersClient from './OffersClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('offers')
  return buildMetadata(seo, {
    title: 'Big Bean Café Offers | Coffee Deals & Café Promotions',
    description: 'Check the latest Big Bean Café offers, combo deals, rewards and promotions across our Bengaluru outlets.',
    path: '/offers',
  })
}

export default async function Page() {
  const [seo] = await Promise.all([getSeo('offers')])
  const faqSchema = getFaqSchema(seo)
  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <OffersClient />
    </>
  )
}
