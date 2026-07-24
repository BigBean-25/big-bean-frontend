import { Metadata } from 'next'
import { getSeo, buildMetadata, getFaqSchema } from '@/lib/seo'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import MerchandiseClient from './MerchandiseClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('merchandise')
  return buildMetadata(seo, {
    title: 'Big Bean Café Merchandise | Coffee Mugs, Beans & Gifts',
    description: 'Shop Big Bean Café merchandise including coffee mugs, beans, accessories and café-inspired gifts online.',
    path: '/merchandise',
  })
}

export default async function Page() {
  const [seo] = await Promise.all([getSeo('merchandise')])
  const faqSchema = getFaqSchema(seo)
  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <Header />
      <MerchandiseClient />
      <Footer />
    </>
  )
}
