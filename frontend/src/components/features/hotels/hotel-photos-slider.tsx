'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, X, BedDouble } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HotelPhotosSliderProps {
  images: Array<string | { url: string; alt?: string | null }>;
  hotelName?: string;
  autoPlayIntervalMs?: number;
  className?: string;
}

export function HotelPhotosSlider({
  images,
  hotelName = 'Hotel',
  autoPlayIntervalMs = 3500,
  className,
}: HotelPhotosSliderProps) {
  const normalizedImages = (images || [])
    .map((item) => (typeof item === 'string' ? { url: item, alt: null } : item))
    .filter((item) => Boolean(item?.url));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = normalizedImages.length;

  const nextSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    if (idx < 0 || idx >= total) return;
    setCurrentIndex(idx);
  };

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying || isHovered || total <= 1 || lightboxOpen) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayIntervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, total, autoPlayIntervalMs, nextSlide, lightboxOpen]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40;
    if (diff > minSwipeDistance) {
      nextSlide();
    } else if (diff < -minSwipeDistance) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'Escape') setLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, nextSlide, prevSlide]);

  if (total === 0) return null;

  const currentImage = normalizedImages[currentIndex];

  return (
    <div
      className={cn('space-y-3 select-none', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Slider Viewport */}
      <div
        className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container shadow-md group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides */}
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {normalizedImages.map((img, i) => (
            <div key={`${img.url}-${i}`} className="relative h-full w-full shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt || `${hotelName} photo ${i + 1}`}
                className="h-full w-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>

        {/* Gradient shadow overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

        {/* Top Badges & Controls */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/10 shadow">
              <BedDouble className="w-3.5 h-3.5 text-accent" />
              <span>Room &amp; Property Photo</span>
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/50 backdrop-blur-md text-white/90">
              {currentIndex + 1} / {total}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Auto-play toggle */}
            {total > 1 && (
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="p-1.5 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md text-white/90 transition-colors"
                title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Expand / Lightbox */}
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="p-1.5 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md text-white/90 transition-colors"
              title="View full screen"
              aria-label="View full screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Caption if provided */}
        {currentImage?.alt && (
          <div className="absolute bottom-10 left-4 right-4 z-10">
            <p className="text-white text-xs sm:text-sm font-medium drop-shadow-md truncate">
              {currentImage.alt}
            </p>
          </div>
        )}

        {/* Previous & Next Buttons */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all z-10 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all z-10 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md">
            {normalizedImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  idx === currentIndex
                    ? 'w-6 bg-accent'
                    : 'w-1.5 bg-white/60 hover:bg-white',
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Strip (if more than 1 image) */}
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
          {normalizedImages.map((img, idx) => (
            <button
              key={`${img.url}-${idx}`}
              type="button"
              onClick={() => goToSlide(idx)}
              className={cn(
                'relative w-20 h-14 sm:w-24 sm:h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer',
                idx === currentIndex
                  ? 'border-accent ring-2 ring-accent/40 opacity-100 scale-[1.02]'
                  : 'border-outline-variant/60 opacity-60 hover:opacity-100',
              )}
              aria-label={`Thumbnail ${idx + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox / Fullscreen Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top header */}
          <div className="flex items-center justify-between text-white z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="font-display font-semibold text-lg">{hotelName}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20">
                {currentIndex + 1} of {total}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Large image view */}
          <div
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage?.url}
              alt={currentImage?.alt || `${hotelName} photo`}
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
            />

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>

          {/* Bottom thumbnails */}
          {total > 1 && (
            <div
              className="flex justify-center gap-2 overflow-x-auto py-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {normalizedImages.map((img, idx) => (
                <button
                  key={`lb-${img.url}-${idx}`}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  className={cn(
                    'w-16 h-12 shrink-0 rounded-md overflow-hidden border-2 transition-all cursor-pointer',
                    idx === currentIndex
                      ? 'border-accent ring-2 ring-accent/50 opacity-100 scale-105'
                      : 'border-white/30 opacity-50 hover:opacity-100',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
