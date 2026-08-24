'use client';

import './globals.css';

import { Baloo_Thambi_2, IBM_Plex_Mono, Inter } from 'next/font/google';

import { ThemeClassSync } from '@/components/custom/theme/theme-class-sync';
import { Button } from '@/components/ui/button';
import {
  siteConfig,
  siteIconLinks,
  siteManifest,
} from '@/config/site-metadata.config';

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

const globalErrorTitle = `Application Error | ${siteConfig.name}`;
const globalErrorDescription = `${siteConfig.name} could not recover the app shell.`;

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ibmPlexMono.variable} ${balooThambi.variable} ${inter.variable} antialiased`}
    >
      <head>
        <title>{globalErrorTitle}</title>
        <meta name="description" content={globalErrorDescription} />
        <meta name="application-name" content={siteConfig.name} />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content={siteConfig.lightThemeColor}
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content={siteConfig.darkThemeColor}
        />
        <link rel="manifest" href={siteManifest} />
        {siteIconLinks.map((link) => (
          <link key={`${link.rel}-${link.href}`} {...link} />
        ))}
      </head>
      <body className="bg-background text-foreground">
        <ThemeClassSync />
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 px-4 py-10 sm:px-6">
          <p className="font-mono text-sm uppercase text-muted-foreground">
            The Weather Man
          </p>
          <h1 className="text-3xl font-semibold">Something went offline</h1>
          <p className="text-muted-foreground">
            The app shell could not recover from this error.
          </p>
          <Button className="w-fit" onClick={reset}>
            Try again
          </Button>
        </main>
      </body>
    </html>
  );
}
