import { Metadata } from 'next'
import { getSeo, buildMetadata, getFaqSchema } from '@/lib/seo'
import HomeClient from './HomeClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('home')
  return buildMetadata(seo, {
    title: 'Big Bean Café Coffee Roasters | Best Café in Bengaluru',
    description: 'Visit Big Bean Café Coffee Roasters for handcrafted coffee, fresh food, desserts, events and cozy café experiences across Bengaluru outlets.',
    path: '/',
  })
}

export default async function Page() {
  const [seo] = await Promise.all([getSeo('home')])
  const faqSchema = getFaqSchema(seo)
  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <HomeClient />
    </>
  )
}
