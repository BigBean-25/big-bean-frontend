import { Metadata } from 'next'
import { getSeo, buildMetadata, getFaqSchema } from '@/lib/seo'
import { getOutlets } from '@/lib/outlets'
import ContactClient from './ContactClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('contact')
  return buildMetadata(seo, {
    title: 'Contact Big Bean Café | Bengaluru Café Support',
    description: 'Contact Big Bean Café Coffee Roasters for outlet information, corporate orders, franchise queries, events and customer support.',
    path: '/contact',
  })
}

export default async function Page() {
  const [seo, outlets] = await Promise.all([getSeo('contact'), getOutlets()])
  const faqSchema = getFaqSchema(seo)
  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <ContactClient initialOutlets={outlets} />
    </>
  )
}
