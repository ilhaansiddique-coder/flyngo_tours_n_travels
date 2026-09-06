'use client';

import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function FloatingRegister() {
  const { lang } = useI18n();
  const scrollToRegister = () => {
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.div
      className="fixed z-40"
      style={{
        bottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))',
        right: 'max(1.25rem, calc((100vw - 1320px) / 2 + 1.25rem))',
      }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.span
        className="absolute inset-0 rounded-full bg-[var(--color-primary)]"
        animate={{ scale: [1, 1.4, 1], opacity: [0.35, 0, 0.35] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <button
        type="button"
        onClick={scrollToRegister}
        className="relative inline-flex items-center gap-2 rounded-full bg-[var(--color-crimson)] px-5 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
      >
        <ClipboardList size={16} />
        {lang === 'bn' ? 'রেজিস্টার করুন' : 'Register'}
      </button>
    </motion.div>
  );
}