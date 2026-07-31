'use client';

import { useState, useEffect } from 'react';
import { Section, Container, SectionHeader } from '@/components/ui/section';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Travel Blogger',
    avatar: 'SJ',
    rating: 5,
    text: 'Flyngo made planning our Bali trip effortless. The AI recommendations were spot-on, and the 24/7 support was incredible. Will definitely book again!',
    trip: 'Bali Adventure Tour',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Software Engineer',
    avatar: 'MC',
    rating: 5,
    text: 'Best travel platform I have used. The booking process was smooth, and the prices were unbeatable. The hotel recommendations exceeded our expectations.',
    trip: 'Switzerland Explorer',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Photographer',
    avatar: 'ER',
    rating: 5,
    text: 'As a solo traveler, I appreciate how Flyngo handles every detail. The visa assistance alone saved me hours of paperwork. Truly a game-changer.',
    trip: 'Dubai Desert Safari',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Entrepreneur',
    avatar: 'DK',
    rating: 4,
    text: 'Booked a last-minute trip to Maldives and everything was arranged within hours. The overwater villa they recommended was absolutely stunning.',
    trip: 'Maldives Getaway',
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 5,
    name: 'Lisa Patel',
    role: 'Marketing Director',
    avatar: 'LP',
    rating: 5,
    text: 'We booked a corporate retreat through Flyngo and the experience was flawless. From flights to hotel to activities — everything was perfectly coordinated.',
    trip: 'Thailand Group Tour',
    color: 'from-sky-500 to-blue-600',
  },
];

export function TestimonialSection() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const prev = () => {
    setIsAutoPlaying(false);
    setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  };

  const next = () => {
    setIsAutoPlaying(false);
    setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));
  };

  const t = testimonials[current];

  return (
    <Section background="white">
      <Container size="narrow">
        <SectionHeader
          title="What Our Travelers Say"
          subtitle="Real experiences from real people who traveled with Flyngo"
        />

        <div className="relative">
          {/* Quote icon */}
          <div className="absolute -top-4 -left-4 text-brand-200 dark:text-brand-900">
            <Quote className="w-16 h-16" />
          </div>

          <div className="bg-white dark:bg-surface-900 rounded-3xl p-8 sm:p-12 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/10 text-center relative overflow-hidden">
            {/* Animated gradient bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.color}`} />

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-700'}`}
                />
              ))}
            </div>

            {/* Quote */}
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 leading-relaxed italic mb-8 transition-all duration-500">
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                {t.avatar}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">{t.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.role}</p>
              </div>
            </div>

            {/* Trip badge */}
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {t.trip}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setIsAutoPlaying(false); setCurrent(i); }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === current
                      ? 'bg-brand-600 dark:bg-brand-400 w-8'
                      : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
