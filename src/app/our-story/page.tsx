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

const timelineItems = [
  {
    title: 'The Beginning',
    text: 'Big Bean Café started its journey with the first outlet at RR Nagar, creating a warm and welcoming café space for coffee lovers.',
    startDate: '2024-06-01',
  },
  {
    title: 'Crafting Better Coffee',
    text: 'The journey expanded with M5 and Koramangala outlets, strengthening our focus on quality coffee, fresh ingredients, and a consistent café experience.',
    startDate: '2025-04-01',
  },
  {
    title: 'Growing Across Bengaluru',
    text: 'Big Bean Café grew further across Bengaluru with HSR Layout and Jayanagar outlets, bringing the same taste, ambience, and service standards to more guests.',
    startDate: '2025-08-01',
    endDate: '2025-10-31',
  },
  {
    title: 'Building a Café Community',
    text: 'With Indiranagar and Kammanahalli outlets, Big Bean Café continued building a community for friends, families, professionals, and coffee lovers through today.',
    startDate: '2025-11-01',
    endDate: '2026-03-31',
  },
]

const STORY_FAQS = [
  {
    question: 'When was Big Bean Cafe founded?',
    answer:
      'Big Bean Cafe started with a single outlet and has grown into a coffee community across Bengaluru.',
  },
  {
    question: 'How many Big Bean Cafe outlets are there?',
    answer: 'Big Bean Cafe has 3+ outlets across Bengaluru, with more opening soon.',
  },
  {
    question: 'What makes Big Bean Cafe different?',
    answer:
      'Big Bean Cafe focuses on premium, freshly sourced coffee and a warm, consistent café experience at every outlet.',
  },
  {
    question: 'Does Big Bean Cafe offer franchise opportunities?',
    answer:
      'Yes, Big Bean Cafe offers franchise opportunities. Visit the Franchise page for more details.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: STORY_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
}

const journeyTimelineSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Big Bean Café Our Journey Timeline',
  description:
    'The outlet growth journey of Big Bean Café Coffee Roasters from the first RR Nagar outlet to multiple Bengaluru café locations.',
  itemListElement: timelineItems.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Event',
      name: item.title,
      description: item.text,
      startDate: item.startDate,
      ...(item.endDate ? { endDate: item.endDate } : {}),
      location: {
        '@type': 'Place',
        name: 'Bengaluru, Karnataka, India',
      },
      organizer: {
        '@type': 'Organization',
        name: 'Big Bean Café Coffee Roasters',
        url: 'https://www.bigbeancafe.in',
      },
    },
  })),
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(journeyTimelineSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <OurStoryClient />
    </>
  )
}
