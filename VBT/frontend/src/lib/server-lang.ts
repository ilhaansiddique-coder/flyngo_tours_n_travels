import { cookies } from 'next/headers';
import { LANG_COOKIE } from './lang';
import type { Lang } from '@/types';

export async function getServerLang(): Promise<Lang> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return value === 'bn' ? 'bn' : 'en';
}
