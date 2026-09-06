'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export function FloatingDonate() {
  const pathname = usePathname() ?? '';
  const { lang } = useI18n();

  if (pathname.startsWith('/admin')) return null;

  return (
    <motion.div
      className="fixed z-40"
      style={{
        top: 118,
        right: 'max(1.25rem, calc((100vw - 1320px) / 2 + 1.25rem))',
      }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.span
        className="absolute inset-0 rounded-full bg-[var(--color-gold-deep)]"
        animate={{ scale: [1, 1.5, 1], opacity: [0.45, 0, 0.45] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Link
        href="/donate"
        className="relative inline-flex items-center gap-2 rounded-full bg-[var(--color-crimson)] px-5 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
      >
        <Heart size={16} fill="currentColor" />
        {lang === 'bn' ? 'দান করুন' : 'Donate'}
      </Link>
    </motion.div>
  );
}