import { Metadata } from 'next'
import { getSeo, buildMetadata, getFaqSchema } from '@/lib/seo'
import CorporateOrdersClient from './CorporateOrdersClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('corporate_orders')
  return buildMetadata(seo, {
    title: 'Big Bean Café Corporate Orders | Bulk Coffee & Catering',
    description: 'Order bulk coffee, beverages and café food for your office or corporate events. Contact Big Bean Café for corporate orders and catering.',
    path: '/corporate-orders',
  })
}

export default async function Page() {
  const [seo] = await Promise.all([getSeo('corporate_orders')])
  const faqSchema = getFaqSchema(seo)
  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <CorporateOrdersClient />
    </>
  )
}
