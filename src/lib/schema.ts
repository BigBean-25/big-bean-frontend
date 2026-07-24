
export interface BreadcrumbItem { name: string; url: string }

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export interface FaqItem { question: string; answer: string }

export function generateFaqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

export function generateLocalBusinessSchema(settings: Record<string, string | null>) {
  const sameAs = [
    settings.same_as_instagram,
    settings.same_as_facebook,
    settings.same_as_linkedin,
    settings.same_as_zomato,
    settings.same_as_swiggy,
  ].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: 'Big Bean Café Coffee Roasters',
    url: 'https://www.bigbeancafe.in',
    logo: 'https://www.bigbeancafe.in/logo/big-bean-cafe-logo-transparent.png',
    image: settings.default_og_image || 'https://www.bigbeancafe.in/logo/big-bean-cafe-logo-transparent.png',
    description: 'Big Bean Café Coffee Roasters serving handcrafted coffee, food, desserts and café experiences across Bengaluru outlets.',
    telephone: settings.business_phone || undefined,
    email: settings.business_email || undefined,
    address: settings.business_address ? {
      '@type': 'PostalAddress',
      streetAddress: settings.business_address,
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      addressCountry: 'IN',
    } : undefined,
    geo: settings.business_latitude && settings.business_longitude ? {
      '@type': 'GeoCoordinates',
      latitude: settings.business_latitude,
      longitude: settings.business_longitude,
    } : undefined,
    servesCuisine: ['Coffee', 'Café Food', 'Desserts', 'Beverages'],
    priceRange: '₹₹',
    ...(sameAs.length ? { sameAs } : {}),
  }
}

export function generateOrganizationSchema(settings: Record<string, string | null>) {
  const sameAs = [
    settings.same_as_instagram,
    settings.same_as_facebook,
    settings.same_as_linkedin,
    settings.same_as_zomato,
    settings.same_as_swiggy,
  ].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Big Bean Café Coffee Roasters',
    url: 'https://www.bigbeancafe.in',
    logo: 'https://www.bigbeancafe.in/logo/big-bean-cafe-logo-transparent.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings.business_phone || '+91-XXXXXXXXXX',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Kannada', 'Hindi'],
    },
    ...(sameAs.length ? { sameAs } : {}),
  }
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Big Bean Café Coffee Roasters',
  url: 'https://www.bigbeancafe.in',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.bigbeancafe.in/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}
