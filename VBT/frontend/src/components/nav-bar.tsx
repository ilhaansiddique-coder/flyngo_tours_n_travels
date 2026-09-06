import { NavBarClient, type NavItem } from './nav-bar-client';
import { getSiteSettings } from '@/lib/get-site';
import { getServerLang } from '@/lib/server-lang';

export async function NavBar() {
  const settings = await getSiteSettings();
  const lang = await getServerLang();
  const t = (_key: string, en: string, bn: string) => (lang === 'bn' ? bn : en);

  const items: NavItem[] = [
    { href: '/', label: t('home', 'Home', 'হোম') },
    { href: '/about', label: t('about', 'About', 'আমাদের সম্পর্কে') },
    { href: '/activities', label: t('activities', 'Projects', 'প্রকল্প') },
    { href: '/membership', label: t('membership', 'Membership', 'সদস্যপদ') },
    { href: '/blog', label: t('blog', 'Blog', 'ব্লগ') },
    { href: '/gallery', label: t('gallery', 'Gallery', 'গ্যালারি') },
    { href: '/notice', label: t('notices', 'Notices', 'নোটিশ') },
    { href: '/faqs', label: t('faqs', 'FAQ', 'প্রশ্নোত্তর') },
    { href: '/contact', label: t('contact', 'Contact', 'যোগাযোগ') },
    { href: '/get-involved', label: t('getInvolved', 'Get Involved', 'যুক্ত হন') },
  ];

  return (
    <NavBarClient
      items={items}
      logo="/images/brand/logo.png"
      siteName={lang === 'bn' ? settings.nameBn || 'ভলান্টিয়ার বাংলাদেশ ট্রাস্ট' : settings.name || 'Volunteer Bangladesh Trust'}
      donateLabel={t('donate', 'Donate', 'দান করুন')}
      membershipLabel={t('membershipBtn', 'Membership', 'সদস্যপদ')}
      adminLabel={t('admin', 'Admin Login', 'অ্যাডমিন লগইন')}
      menuLabel={t('menu', 'Menu', 'মেনু')}
    />
  );
}