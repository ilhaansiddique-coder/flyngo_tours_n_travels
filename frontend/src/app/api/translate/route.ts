import { NextRequest, NextResponse } from 'next/server';
import {
  BANGLA_DICTIONARY_MAP,
  ENGLISH_DICTIONARY_MAP,
  translateWithManualDictionary,
  translateWithBanglaToEnglishDictionary,
} from '@/lib/translations/bangla-dictionary';

async function translateChunk(text: string, from: string, to: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  // 1. Direct dictionary match
  const lower = trimmed.toLowerCase();
  if (to === 'bn' && BANGLA_DICTIONARY_MAP[lower]) {
    return BANGLA_DICTIONARY_MAP[lower];
  }
  if (to === 'en' && ENGLISH_DICTIONARY_MAP[trimmed]) {
    return ENGLISH_DICTIONARY_MAP[trimmed];
  }

  // 2. Online translation via MyMemory API with timeout
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${encodeURIComponent(from)}|${encodeURIComponent(to)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FlynGoTravel/1.0',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const apiTranslation = data?.responseData?.translatedText;
      if (
        apiTranslation &&
        typeof apiTranslation === 'string' &&
        apiTranslation.trim() &&
        !apiTranslation.toLowerCase().includes('mymemory warning:')
      ) {
        return apiTranslation.trim();
      }
    }
  } catch {
    // Fall through to manual dictionary fallback
  }

  // 3. Fallback: manual phrase dictionary replacement
  if (to === 'bn') {
    return translateWithManualDictionary(trimmed) || trimmed;
  }
  if (to === 'en') {
    return translateWithBanglaToEnglishDictionary(trimmed) || trimmed;
  }
  return trimmed;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    const from = body?.from || 'en';
    const to = body?.to || 'bn';

    if (!text) {
      return NextResponse.json({ success: true, original: '', translated: '', source: 'empty' });
    }

    // If multi-line, translate each non-empty line concurrently
    if (text.includes('\n')) {
      const lines = text.split('\n');
      const translatedLines = await Promise.all(
        lines.map(async (line: string) => {
          if (!line.trim()) return '';
          return translateChunk(line, from, to);
        })
      );
      return NextResponse.json({
        success: true,
        original: text,
        translated: translatedLines.join('\n'),
        source: 'multiline',
      });
    }

    const translated = await translateChunk(text, from, to);
    return NextResponse.json({
      success: true,
      original: text,
      translated,
      source: 'chunk',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Translation failed' },
      { status: 500 }
    );
  }
}
