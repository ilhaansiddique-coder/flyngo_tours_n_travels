'use client';

import { useState } from 'react';
import { Sparkles, Languages, Check, Copy, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { autoTranslate, translateBatch, getManualBanglaWords } from '@/lib/translations/translator';
import { MANUAL_BANGLA_WORDS, TranslationEntry } from '@/lib/translations/bangla-dictionary';

interface AutoTranslatePanelProps {
  /** Source values (usually in English) */
  sourceFields: Record<string, string>;
  /** Callback when auto-translation produces Bangla values or when user manually edits them */
  onApplyBangla: (translated: Record<string, string>) => void;
  /** Optional field labels mapping (e.g. { title: 'Service Title', description: 'Description' }) */
  fieldLabels?: Record<string, string>;
  /** Category for tailored manual dictionary chips */
  category?: TranslationEntry['category'];
}

export function AutoTranslatePanel({
  sourceFields,
  onApplyBangla,
  fieldLabels = {},
  category,
}: AutoTranslatePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [banglaDraft, setBanglaDraft] = useState<Record<string, string>>({});
  const [showDictionary, setShowDictionary] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const relevantWords = getManualBanglaWords(category);

  const handleAutoTranslate = async () => {
    try {
      setTranslating(true);
      setApplied(false);
      const translated = await translateBatch(sourceFields, 'en', 'bn');
      setBanglaDraft(translated);
      setIsOpen(true);
    } catch (err) {
      console.error('Failed to auto-translate:', err);
    } finally {
      setTranslating(false);
    }
  };

  const handleApply = () => {
    onApplyBangla(banglaDraft);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  const handleWordClick = (word: TranslationEntry) => {
    navigator.clipboard?.writeText(word.bn);
    setCopiedKey(word.en);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20 p-3.5 mb-4 text-sm transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
            <Languages className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs sm:text-sm text-on-surface flex items-center gap-1.5">
              <span>Auto-Translate &amp; Manual Bangla Words</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider">
                বাংলা
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Auto-translate new service details to Bangla with manual edit options.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoTranslate}
            disabled={translating}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)' }}
          >
            <Sparkles className={`w-3.5 h-3.5 ${translating ? 'animate-spin' : ''}`} />
            {translating ? 'Translating…' : 'Auto Translate to Bangla'}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface-variant"
            title="Toggle Bangla review & manual words"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-3.5 pt-3 border-t border-blue-200/60 dark:border-blue-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface">
              Manual Translated Words in Bangla (সম্পাদনা করুন):
            </span>
            <button
              type="button"
              onClick={() => setShowDictionary(!showDictionary)}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {showDictionary ? 'Hide Bangla Words Dictionary' : 'View Manual Bangla Words'}
            </button>
          </div>

          {/* Collapsible curated manual words chips */}
          {showDictionary && (
            <div className="rounded-lg p-2.5 bg-surface-container border border-outline-variant/60">
              <div className="text-[11px] font-semibold text-muted mb-2">
                Click a word to copy its official manual Bangla translation:
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                {relevantWords.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleWordClick(item)}
                    className="group inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border border-outline-variant bg-surface hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <span className="font-medium text-on-surface group-hover:text-blue-600">{item.bn}</span>
                    <span className="text-[9px] text-muted font-mono">({item.en})</span>
                    {copiedKey === item.en ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-2.5 h-2.5 text-muted opacity-0 group-hover:opacity-100" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Editable Bangla fields */}
          <div className="space-y-2.5">
            {Object.keys(sourceFields).map((key) => {
              const label = fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);
              const val = banglaDraft[key] ?? '';
              const isLong = (sourceFields[key] || '').length > 60 || key.toLowerCase().includes('desc') || key.toLowerCase().includes('req');

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-on-surface">{label} (বাংলা)</span>
                    <span className="text-muted text-[10px] truncate max-w-[220px]">
                      EN: &ldquo;{sourceFields[key] || '—'}&rdquo;
                    </span>
                  </div>

                  {isLong ? (
                    <textarea
                      value={val}
                      onChange={(e) => setBanglaDraft({ ...banglaDraft, [key]: e.target.value })}
                      placeholder={`বাংলায় ${label.toLowerCase()} লিখুন…`}
                      rows={3}
                      className="w-full border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs bg-surface text-on-surface placeholder:text-muted focus:ring-1 focus:ring-primary outline-none resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => setBanglaDraft({ ...banglaDraft, [key]: e.target.value })}
                      placeholder={`বাংলায় ${label.toLowerCase()} লিখুন…`}
                      className="w-full border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs bg-surface text-on-surface placeholder:text-muted focus:ring-1 focus:ring-primary outline-none"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity"
            >
              {applied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Sparkles className="w-3.5 h-3.5" />}
              {applied ? 'Applied to Form!' : 'Apply Bangla Translation to Fields'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
