import { NextRequest, NextResponse } from 'next/server';
import { BANGLA_DICTIONARY_MAP, translateWithManualDictionary } from '@/lib/translations/bangla-dictionary';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    const from = body?.from || 'en';
    const to = body?.to || 'bn';

    if (!text) {
      return NextResponse.json({ success: true, original: '', translated: '', source: 'empty' });
    }

    // 1. Direct dictionary match
    const lower = text.toLowerCase();
    if (to === 'bn' && BANGLA_DICTIONARY_MAP[lower]) {
      return NextResponse.json({
        success: true,
        original: text,
        translated: BANGLA_DICTIONARY_MAP[lower],
        source: 'manual_dict',
      });
    }

    // 2. Online translation via MyMemory API with 5s timeout
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(from)}|${encodeURIComponent(to)}`;
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
        if (apiTranslation && typeof apiTranslation === 'string' && apiTranslation.trim() && !apiTranslation.toLowerCase().includes('mymemory warning:')) {
          return NextResponse.json({
            success: true,
            original: text,
            translated: apiTranslation.trim(),
            source: 'auto_api',
          });
        }
      }
    } catch {
      // Fall through to manual dictionary fallback
    }

    // 3. Fallback: manual phrase dictionary replacement
    const fallback = to === 'bn' ? translateWithManualDictionary(text) : null;
    return NextResponse.json({
      success: true,
      original: text,
      translated: fallback || text,
      source: fallback ? 'manual_dict_hybrid' : 'raw_fallback',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Translation failed' },
      { status: 500 }
    );
  }
}
