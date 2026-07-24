import { Metadata } from 'next'
import { getSeo, buildMetadata } from '@/lib/seo'
import OurStoryClient from './OurStoryClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('our-story')
  return buildMetadata(seo, {
    title: 'Our Story | Big Bean Café',
    description: 'Discover the journey of Big Bean Café, from one café dream to a growing coffee community across Bengaluru.',
    path: '/our-story',
  })
}

export default function Page() {
  return <OurStoryClient />
}
