import { Metadata } from 'next'
import { getSeo, buildMetadata, getFaqSchema } from '@/lib/seo'
import GalleryClient from './GalleryClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('gallery')
  return buildMetadata(seo, {
    title: 'Big Bean Café Gallery | Coffee, Food & Café Moments',
    description: 'Browse Big Bean Café gallery and explore our coffee, food, café interiors and memorable moments from our Bengaluru outlets.',
    path: '/gallery',
  })
}

export default async function Page() {
  const [seo] = await Promise.all([getSeo('gallery')])
  const faqSchema = getFaqSchema(seo)
  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <GalleryClient />
    </>
  )
}
