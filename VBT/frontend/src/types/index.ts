export type Lang = 'en' | 'bn';

export interface SiteSettings {
  name?: string;
  nameBn?: string;
  sloganEn?: string;
  sloganBn?: string;
  description?: string;
  descriptionBn?: string;
  founded?: number;
  registration?: string;
  chairman?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  socials?: {
    facebook?: string;
    youtube?: string;
    linkedin?: string;
    twitter?: string;
  };
  footer?: { about?: string };
}

export interface Hero {
  id: string;
  titleEn: string;
  titleBn?: string | null;
  descriptionEn: string;
  descriptionBn?: string | null;
  taglineEn?: string | null;
  taglineBn?: string | null;
  highlightEn?: string | null;
  highlightBn?: string | null;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  backgroundImage: string;
}

export interface AboutSection {
  id: string;
  taglineEn?: string | null;
  taglineBn?: string | null;
  titleEn?: string | null;
  titleBn?: string | null;
  contentEn?: string | null;
  contentBn?: string | null;
  image?: string | null;
  items?: Array<{
    icon: string;
    titleEn: string;
    titleBn: string;
    descEn: string;
    descBn: string;
  }>;
}

export interface Institution {
  id: string;
  name: string;
  website: string;
  description?: string | null;
  logo?: string | null;
}

export interface Activity {
  id: string;
  slug: string;
  titleEn: string;
  titleBn?: string | null;
  tagEn?: string | null;
  tagBn?: string | null;
  excerptEn?: string | null;
  excerptBn?: string | null;
  contentEn?: string | null;
  contentBn?: string | null;
  image?: string | null;
  featured: boolean;
}

export interface Fund {
  id: string;
  titleEn: string;
  titleBn?: string | null;
  descriptionEn?: string | null;
  descriptionBn?: string | null;
  target?: string | null;
  raised?: string | null;
  image?: string | null;
  countdownEnabled: boolean;
  endAt?: string | null;
}

export interface HomeVideo {
  id: string;
  badgeEn?: string | null;
  badgeBn?: string | null;
  titleEn?: string | null;
  titleBn?: string | null;
  youtubeUrl?: string | null;
}

export interface LandingSection {
  type: 'hero' | 'text' | 'split' | 'cards' | 'cta' | 'gallery' | 'form';
  headingEn?: string;
  headingBn?: string;
  bodyEn?: string;
  bodyBn?: string;
  items?: Array<Record<string, unknown>>;
  buttonLabelEn?: string;
  buttonLabelBn?: string;
  link?: string;
  image?: string;
  googleFormUrl?: string;
  googleFormResponseUrl?: string;
  fbzx?: string;
}

export interface LandingPage {
  id: string;
  slug: string;
  titleEn: string;
  titleBn?: string | null;
  subtitleEn?: string | null;
  subtitleBn?: string | null;
  coverPhoto?: string | null;
  sections: LandingSection[] | null;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImage {
  id: string;
  titleEn?: string | null;
  titleBn?: string | null;
  category: string;
  image: string;
}

export interface GalleryData {
  categories: string[];
  images: GalleryImage[];
}

export interface BlogPost {
  id: string;
  slug: string;
  titleEn: string;
  titleBn?: string | null;
  excerptEn?: string | null;
  excerptBn?: string | null;
  contentEn?: string | null;
  contentBn?: string | null;
  image?: string | null;
  author?: string | null;
  publishedAt: string;
}

export interface Notice {
  id: string;
  titleEn: string;
  titleBn?: string | null;
  contentEn?: string | null;
  contentBn?: string | null;
  publishedAt: string;
}

export interface Faq {
  id: string;
  questionEn: string;
  questionBn?: string | null;
  answerEn: string;
  answerBn?: string | null;
}

export interface Product {
  id: string;
  type: string;
  titleEn: string;
  titleBn?: string | null;
  descriptionEn?: string | null;
  descriptionBn?: string | null;
  price?: string | null;
}

export interface ConnectSection {
  titleEn?: string;
  titleBn?: string;
  subtitleEn?: string;
  subtitleBn?: string;
  items?: Array<{
    icon: string;
    titleEn: string;
    titleBn: string;
    link: string;
    buttonEn: string;
    buttonBn: string;
  }>;
}

export interface ZakatNisab {
  gold: number;
  silver: number;
  currency: string;
  updatedLabel?: string;
}

export interface SiteBag {
  settings: Record<string, unknown> & { site?: SiteSettings };
  hero: Hero | null;
  about: AboutSection | null;
  funds: Fund[];
  videos: HomeVideo[];
  institutions: Institution[];
  products: Product[];
  faqs: Faq[];
}