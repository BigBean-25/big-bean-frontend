import { Metadata } from 'next'
import { getSeo, buildMetadata, getFaqSchema } from '@/lib/seo'
import PrivacyPolicyClient from './PrivacyPolicyClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('privacy_policy')
  return buildMetadata(seo, {
    title: 'Privacy Policy | Big Bean Café',
    description: 'Read the Big Bean Café privacy policy to understand how we collect, use and protect your personal information.',
    path: '/privacy-policy',
  })
}

export default async function Page() {
  const [seo] = await Promise.all([getSeo('privacy_policy')])
  const faqSchema = getFaqSchema(seo)
  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <PrivacyPolicyClient />
    </>
  )
}
