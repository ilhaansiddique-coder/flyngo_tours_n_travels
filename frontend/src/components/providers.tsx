'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { LocaleProvider } from '@/contexts/locale-context';
import { CurrencyProvider } from '@/contexts/currency-context';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        themes={['light', 'dark']}
      >
        <LocaleProvider>
          <CurrencyProvider>
            {children}
            <Toaster richColors position="top-right" />
          </CurrencyProvider>
        </LocaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
