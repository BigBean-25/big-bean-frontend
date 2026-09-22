import { Metadata } from 'next'
import { getSeo, buildMetadata, getFaqSchema } from '@/lib/seo'
import MenuClient from './MenuClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('menu')
  return buildMetadata(seo, {
    title: 'Big Bean Cafe Menu | Coffee, Breakfast, Pizza & Desserts in Bengaluru',
    description: 'Explore the Big Bean Café menu with handcrafted coffee, fresh beverages, café bites, desserts and all-day favourites across Bengaluru outlets.',
    path: '/menu',
  })
}

export default async function Page() {
  const [seo] = await Promise.all([getSeo('menu')])
  const faqSchema = getFaqSchema(seo)
  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <MenuClient />
    </>
  )
}
