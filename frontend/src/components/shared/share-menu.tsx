'use client';

import { useEffect, useRef, useState } from 'react';
import { Share2, Link as LinkIcon, Facebook, MessageCircle, Mail, Twitter, Send, Linkedin, Check, X } from 'lucide-react';
import { absoluteUrl, cn } from '@/lib/utils';

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
  const ref = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (isControlled) onToggle?.(v);
    else setInternalOpen(v);
  };

  const url = absoluteUrl(path);

  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
    <div className={cn('relative inline-block', className)} ref={ref}>
      {trigger ? (
        <div onClick={() => setOpen(!isOpen)}>{trigger}</div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant bg-transparent px-3 py-1.5 text-sm font-semibold text-on-surface hover:border-primary hover:text-primary transition-colors"
        >
          <Share2 className="w-4 h-4" />
          {buttonLabel && <span>{buttonLabel}</span>}
        </button>
      )}

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 w-64 rounded-2xl border border-outline-variant bg-surface shadow-xl p-1.5',
            align === 'right' ? 'right-0' : 'left-0',
          )}
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
        </div>
      )}
    </div>
  );
}