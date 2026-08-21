interface TravelAgencySchema {
  name: string;
  url: string;
  logo?: string;
  phone?: string;
  email?: string;
  sameAs?: string[];
  priceRange?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
}

export function travelAgencyJsonLd(s: TravelAgencySchema): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: s.name,
    url: s.url,
    logo: s.logo,
    telephone: s.phone,
    email: s.email,
    sameAs: s.sameAs,
    priceRange: s.priceRange,
    address: s.address ? { '@type': 'PostalAddress', ...s.address } : undefined,
  });
}

export function touristTripJsonLd(pkg: {
  name: string;
  description: string;
  url: string;
  image?: string;
  price: number;
  priceCurrency: string;
  durationDays: number;
  destination?: string;
  departureCity?: string;
  availability?: 'https://schema.org/InStock' | 'https://schema.org/SoldOut' | 'https://schema.org/PreOrder' | 'https://schema.org/BackOrder' | 'https://schema.org/LimitedAvailability';
  ratingValue?: number;
  reviewCount?: number;
}): string {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: pkg.name,
    description: pkg.description,
    url: pkg.url,
    image: pkg.image,
    offers: {
      '@type': 'Offer',
      price: pkg.price,
      priceCurrency: pkg.priceCurrency,
      availability: pkg.availability ?? 'https://schema.org/InStock',
      url: pkg.url,
      validFrom: new Date().toISOString(),
    },
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: pkg.durationDays,
    },
  };
  if (pkg.destination) {
    schema.areaServed = { '@type': 'Place', name: pkg.destination };
  }
  if (pkg.departureCity) {
    schema['Offer'] = schema.offers;
  }
  if (pkg.ratingValue && pkg.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: pkg.ratingValue,
      reviewCount: pkg.reviewCount,
    };
  }
  return JSON.stringify(schema);
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  });
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  });
}

export function organizationJsonLd(s: {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    ...s,
  });
}
