import './globals.css';

import type { Metadata, Viewport } from 'next';
import { Baloo_Thambi_2, IBM_Plex_Mono, Inter } from 'next/font/google';

import { ThemeInitScript } from '@/components/custom/theme/theme-init-script';
import { buildPageMetadata, siteViewport } from '@/config/site-metadata.config';
import PageState from '@/views/shared/PageState';

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const balooThambi = Baloo_Thambi_2({
  variable: '--font-baloo-thambi-2',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = buildPageMetadata({
  absoluteTitle: true,
  title: 'Page Not Found | The Weather Man',
  description: 'The requested Weather Man page could not be found.',
  noIndex: true,
});

export const viewport: Viewport = siteViewport;

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ibmPlexMono.variable} ${balooThambi.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="h-full bg-background text-foreground">
        <PageState
          title="Page not found"
          message="The Weather Man does not have a station view at this address."
          actionHref="/"
          actionLabel="Go home"
        />
      </body>
    </html>
  );
}
