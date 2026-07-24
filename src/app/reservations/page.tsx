import { Metadata } from 'next'
import { getSeo, buildMetadata, getFaqSchema } from '@/lib/seo'
import ReservationsClient from './ReservationsClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('reservations')
  return buildMetadata(seo, {
    title: 'Reserve a Table at Big Bean Café | Online Booking',
    description: 'Book a table at Big Bean Café Bengaluru. Reserve your spot online for a coffee experience, celebrations or casual café visits.',
    path: '/reservations',
  })
}

export default async function Page() {
  const [seo] = await Promise.all([getSeo('reservations')])
  const faqSchema = getFaqSchema(seo)
  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <ReservationsClient />
    </>
  )
}
