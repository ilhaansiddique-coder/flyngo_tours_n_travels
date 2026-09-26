'use client';

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Link as LinkIcon, Facebook, MessageCircle, Mail, Twitter, Send, Linkedin, Check, X } from 'lucide-react';
import { absoluteUrl, cn } from '@/lib/utils';

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

interface ShareMenuProps {
  path: string;
  title?: string;
  text?: string;
  className?: string;
  buttonLabel?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  align?: 'left' | 'right';
}

function shareUrls(url: string, title: string, text: string) {
  const encodedUrl = encodeURIComponent(url);
  const content = text || `${title} — ${url}`;
  const encodedText = encodeURIComponent(content);
  return [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(content)}`,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      id: 'twitter',
      label: 'X (Twitter)',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: Send,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text || title}\n\n${url}`)}`,
    },
  ];
}

export function ShareMenu({
  path,
  title = 'Check this out',
  text,
  className,
  buttonLabel,
  trigger,
  open: controlledOpen,
  onToggle,
  align = 'right',
}: ShareMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const mounted = useMounted();
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    openUpwards: boolean;
  } | null>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (isControlled) onToggle?.(v);
    else setInternalOpen(v);
  };

  const url = absoluteUrl(path);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 256; // w-64
    const estimatedHeight = 280;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpwards = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    let left = align === 'right' ? rect.right - menuWidth : rect.left;

    // Viewport clamping with safe margin
    if (left + menuWidth > window.innerWidth - 12) {
      left = window.innerWidth - menuWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    const top = openUpwards ? rect.top - 8 : rect.bottom + 8;

    setCoords({
      top,
      left,
      openUpwards,
    });
  }, [align]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleScrollResize = () => {
      updatePosition();
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('resize', handleScrollResize);
    window.addEventListener('scroll', handleScrollResize, true);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('resize', handleScrollResize);
      window.removeEventListener('scroll', handleScrollResize, true);
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, updatePosition]);

  const platforms = shareUrls(url, title, text || title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text: text || title, url });
      } catch {
        // user dismissed the share sheet — ignore
      }
    }
  };

  const openChannel = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  return (
    <div className={cn('relative inline-block', className)} ref={triggerRef}>
      {trigger ? (
        <div onClick={() => setOpen(!isOpen)}>{trigger}</div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant bg-transparent px-3 py-1.5 text-sm font-semibold text-on-surface hover:border-primary hover:text-primary transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          {buttonLabel && <span>{buttonLabel}</span>}
        </button>
      )}

      {mounted && isOpen && coords && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform: coords.openUpwards ? 'translateY(-100%)' : 'none',
            zIndex: 9999,
          }}
          className="w-64 rounded-2xl border border-outline-variant bg-surface shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Share</span>
            <button type="button" onClick={() => setOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 px-1 pb-1">
            {platforms.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => openChannel(p.href)}
                  className="flex flex-col items-center gap-1 rounded-xl p-2.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container/70 hover:text-on-surface transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="border-t border-outline-variant/60 pt-1.5 mt-1 px-1">
            <button
              type="button"
              onClick={copyLink}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-container/70 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-success" /> : <LinkIcon className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                type="button"
                onClick={nativeShare}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-container/70 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                More options
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}