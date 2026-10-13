import { NavBarClient, type NavItem } from './nav-bar-client';
import { getSiteSettings } from '@/lib/get-site';
import { getServerLang } from '@/lib/server-lang';

export async function NavBar() {
  const settings = await getSiteSettings();
  const lang = await getServerLang();
  const t = (_key: string, en: string, bn: string) => (lang === 'bn' ? bn : en);

  // Exact navigation item structure matching As-Sunnah Foundation:
  // Home, About Us, Activities, Gallery, Connect With Us (Membership), Blogs, Notice, Contact
  const items: NavItem[] = [
    { href: '/', label: t('home', 'Home', 'হোম') },
    { href: '/about', label: t('about', 'About Us', 'আমাদের সম্পর্কে') },
    { href: '/activities', label: t('activities', 'Activities', 'কার্যক্রমসমূহ') },
    { href: '/gallery', label: t('gallery', 'Gallery', 'গ্যালারি') },
    { href: '/get-involved', label: t('membership', 'Connect With Us', 'আমাদের সাথে যুক্ত হোন') },
    { href: '/blog', label: t('blog', 'Blogs', 'ব্লগ') },
    { href: '/notice', label: t('notices', 'Notice', 'নোটিশ') },
    { href: '/contact', label: t('contact', 'Contact', 'যোগাযোগ') },
  ];

  return (
    <NavBarClient
      items={items}
      logo="/images/brand/logo.png"
      siteName={lang === 'bn' ? settings.nameBn || 'ভলান্টিয়ার বাংলাদেশ ট্রাস্ট' : settings.name || 'Volunteer Bangladesh Trust'}
      donateLabel={lang === 'bn' ? 'দান করুন' : 'Donate'}
      profileLabel={lang === 'bn' ? 'প্রোফাইল' : 'Profile'}
      menuLabel={t('menu', 'Menu', 'মেনু')}
    />
  );
}