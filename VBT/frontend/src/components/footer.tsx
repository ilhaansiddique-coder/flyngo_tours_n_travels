import Link from 'next/link';
import { Facebook, Linkedin, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { NewsletterForm } from './newsletter-form';
import { getSiteSettings } from '@/lib/get-site';
import { getServerLang } from '@/lib/server-lang';
import { assetUrl } from '@/lib/api';

export async function Footer() {
  const settings = await getSiteSettings();
  const lang = await getServerLang();
  const bn = lang === 'bn';

  const siteName = bn ? settings.nameBn || 'ভলান্টিয়ার বাংলাদেশ ট্রাস্ট' : settings.name || 'Volunteer Bangladesh Trust';

  const menu = [
    { href: '/about', label: bn ? 'আমাদের সম্পর্কে' : 'About Us' },
    { href: '/activities', label: bn ? 'প্রকল্প' : 'Projects' },
    { href: '/blog', label: bn ? 'ব্লগ' : 'Blog' },
    { href: '/gallery', label: bn ? 'গ্যালারি' : 'Gallery' },
  ];
  const connect = [
    { href: '/donate', label: bn ? 'নিয়মিত দাতা' : 'Monthly Donor' },
    { href: '/membership', label: bn ? 'সদস্যপদ' : 'Membership' },
    { href: '/get-involved?active=volunteer', label: bn ? 'স্বেচ্ছাসেবক' : 'Volunteer' },
    { href: '/get-involved?active=career', label: bn ? 'চাকরি' : 'Career' },
  ];
  const others = [
    { href: '/contact', label: bn ? 'যোগাযোগ' : 'Contact' },
    { href: '/terms-and-conditions', label: bn ? 'শর্তাবলি' : 'Terms & Conditions' },
    { href: '/privacy-policy', label: bn ? 'গোপনীয়তা নীতি' : 'Privacy Policy' },
    { href: '/tax-notice', label: bn ? 'কর নোটিশ' : 'Tax Notice' },
  ];

  return (
    <footer className="bg-[var(--color-primary-darker)] text-white">
      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src={assetUrl('/images/brand/logo.png')} alt={siteName} className="h-11 w-11 rounded-xl bg-white object-cover" />
            <span className="text-lg font-bold">{siteName}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            {bn
              ? 'শিক্ষা, দাওয়াহ ও মানবকল্যাণে নিবেদিত একটি নিবন্ধিত, অরাজনৈতিক, অলাভজনক সেবামূলক প্রতিষ্ঠান।'
              : settings.footer?.about || 'A registered Bangladeshi charity devoted to education, Dawah and human welfare.'}
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--color-gold-deep)]">
            {bn ? 'উম্মাহর স্বার্থে সুন্নাহর সাথে' : settings.sloganEn || 'For the Ummah, with the Sunnah'}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a href={settings.socials?.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
              <Facebook size={18} className="text-white/70 hover:text-[var(--color-gold-deep)]" />
            </a>
            <a href={settings.socials?.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
              <Youtube size={18} className="text-white/70 hover:text-[var(--color-gold-deep)]" />
            </a>
            <a href={settings.socials?.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <Linkedin size={18} className="text-white/70 hover:text-[var(--color-gold-deep)]" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-gold-deep)]">
            {bn ? 'মেনু' : 'Menu'}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {menu.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="text-sm text-white/75 transition-colors hover:text-white">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-gold-deep)]">
            {bn ? 'সংযুক্ত' : 'Connect'}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {connect.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="text-sm text-white/75 transition-colors hover:text-white">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
          <h3 className="mt-6 text-sm font-bold uppercase tracking-wider text-[var(--color-gold-deep)]">
            {bn ? 'অন্যান্য' : 'Others'}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {others.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="text-sm text-white/75 transition-colors hover:text-white">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-gold-deep)]">
            {bn ? 'যোগাযোগ' : 'Contact'}
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            <li className="flex items-start gap-2.5">
              <Mail size={16} className="mt-0.5 shrink-0 text-white/50" />
              {settings.email || 'info@volunteerbdtrust.org'}
            </li>
            <li className="flex items-start gap-2.5">
              <Phone size={16} className="mt-0.5 shrink-0 text-white/50" />
              {settings.phone || '01970534363'}
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-white/50" />
              <span>
                {settings.addressLine1}
                <br />
                {settings.addressLine2}
              </span>
            </li>
          </ul>
          <h3 className="mt-6 text-sm font-bold uppercase tracking-wider text-[var(--color-gold-deep)]">
            {bn ? 'নিউজলেটার' : 'Newsletter'}
          </h3>
          <p className="mt-2 text-sm text-white/70">{bn ? 'সাম্প্রতিক আপডেট পেতে সাবস্ক্রাইব করুন।' : 'Get our latest updates in your inbox.'}</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/60 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {siteName}. {bn ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
          </span>
          <span>
            {bn ? 'নিবন্ধন নং' : 'Registration'}: {settings.registration || 'S-13111/2019'}
          </span>
        </div>
      </div>
    </footer>
  );
}