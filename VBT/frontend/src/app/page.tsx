import { HomeHero } from '@/components/home/hero';
import { DonationForm } from '@/components/home/donation-form';
import { HomeAbout } from '@/components/home/about-section';
import { FundsSection } from '@/components/home/funds-section';
import { ActivitiesSection } from '@/components/home/activities-section';
import { VideoSection } from '@/components/home/video-section';
import { ConnectSection } from '@/components/home/connect-section';
import { GallerySection } from '@/components/home/gallery-section';
import { BlogSection } from '@/components/home/blog-section';
import { InstitutionsSection } from '@/components/home/institutions-section';
import {
  getActivities,
  getBlogs,
  getGallery,
  getSiteBag,
} from '@/lib/get-site';
import type { ConnectSection as ConnectSectionData } from '@/types';

export default async function HomePage() {
  const [bag, activities, gallery, blogs] = await Promise.all([
    getSiteBag(),
    getActivities(),
    getGallery(),
    getBlogs(),
  ]);

  const connect = bag.settings?.connect as ConnectSectionData | undefined;

  return (
    <>
      <HomeHero hero={bag.hero} />
      <DonationForm products={bag.products} settings={bag.settings} />
      <HomeAbout about={bag.about} />
      <FundsSection funds={bag.funds} />
      <ActivitiesSection activities={activities} />
      <VideoSection videos={bag.videos} />
      <ConnectSection connect={connect ?? null} />
      <GallerySection images={gallery.images} />
      <BlogSection posts={blogs} />
      <InstitutionsSection institutions={bag.institutions} />
    </>
  );
}