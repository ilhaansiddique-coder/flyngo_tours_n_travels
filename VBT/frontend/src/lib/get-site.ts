import { cache } from 'react';
import { serverFetch } from './api';
import type {
  Activity,
  BlogPost,
  Faq,
  GalleryData,
  LandingPage,
  Notice,
  Product,
  SiteBag,
  SiteSettings,
  ZakatNisab,
} from '@/types';

const emptyBag: SiteBag = {
  settings: {},
  hero: null,
  about: null,
  funds: [],
  videos: [],
  institutions: [],
  products: [],
  faqs: [],
};

export const getSiteBag = cache(async (): Promise<SiteBag> => {
  try {
    return await serverFetch<SiteBag>('/public/site');
  } catch {
    return emptyBag;
  }
});

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const bag = await getSiteBag();
  return (bag.settings?.site as SiteSettings) ?? {};
});

export const getActivities = cache(async (): Promise<Activity[]> => {
  try {
    return await serverFetch<Activity[]>('/public/activities');
  } catch {
    return [];
  }
});

export const getActivityBySlugSafe = cache(async (slug: string): Promise<Activity | null> => {
  try {
    return await serverFetch<Activity>(`/public/activities/${slug}`);
  } catch {
    return null;
  }
});

export const getBlogs = cache(async (): Promise<BlogPost[]> => {
  try {
    return await serverFetch<BlogPost[]>('/public/blogs');
  } catch {
    return [];
  }
});

export const getBlogBySlugSafe = cache(async (slug: string): Promise<BlogPost | null> => {
  try {
    return await serverFetch<BlogPost>(`/public/blogs/${slug}`);
  } catch {
    return null;
  }
});

export const getGallery = cache(async (): Promise<GalleryData> => {
  try {
    return await serverFetch<GalleryData>('/public/gallery');
  } catch {
    return { categories: [], images: [] };
  }
});

export const getNotices = cache(async (): Promise<Notice[]> => {
  try {
    return await serverFetch<Notice[]>('/public/notices');
  } catch {
    return [];
  }
});

export const getNoticeSafe = cache(async (id: string): Promise<Notice | null> => {
  try {
    return await serverFetch<Notice>(`/public/notices/${id}`);
  } catch {
    return null;
  }
});

export const getProducts = cache(async (): Promise<Product[]> => {
  try {
    return await serverFetch<Product[]>('/public/products');
  } catch {
    return [];
  }
});

export const getFaqs = cache(async (): Promise<Faq[]> => {
  try {
    return await serverFetch<Faq[]>('/public/faqs');
  } catch {
    return [];
  }
});

export const getZakatNisab = cache(async (): Promise<ZakatNisab> => {
  try {
    const data = await serverFetch<ZakatNisab | null>('/public/zakat-nisab');
    return data ?? { gold: 105000, silver: 75000, currency: 'BDT' };
  } catch {
    return { gold: 105000, silver: 75000, currency: 'BDT' };
  }
});

export const getLandingPage = cache(async (slug: string): Promise<LandingPage | null> => {
  try {
    return await serverFetch<LandingPage>(`/public/landing-pages/${slug}`);
  } catch {
    return null;
  }
});
