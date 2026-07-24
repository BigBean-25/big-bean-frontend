import { Metadata } from 'next'
import { getSeo, buildMetadata, getFaqSchema } from '@/lib/seo'
import BlogClient from './BlogClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('blog')
  return buildMetadata(seo, {
    title: 'Big Bean Café Blog | Coffee Stories, News & Café Culture',
    description: 'Read Big Bean Café blog for coffee stories, brewing tips, café news, events updates and everything about the coffee culture in Bengaluru.',
    path: '/blog',
  })
}

export default async function Page() {
  const [seo] = await Promise.all([getSeo('blog')])
  const faqSchema = getFaqSchema(seo)
  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <BlogClient />
    </>
  )
}
