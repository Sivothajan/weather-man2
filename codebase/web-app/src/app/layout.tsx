import './globals.css';

import type { Metadata, Viewport } from 'next';
import { Baloo_Thambi_2, IBM_Plex_Mono, Inter } from 'next/font/google';

import { ThemeProvider } from '@/components/custom/theme/theme-provider';
import { ThemeToggle } from '@/components/custom/theme/theme-toggle';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  siteAppleWebApp,
  siteConfig,
  siteIcons,
  siteManifest,
  siteViewport,
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

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  metadataBase: new URL(siteConfig.url),
  category: 'technology',
  keywords: [
    'weather station',
    'weather stations',
    'environmental sensors',
    'station administration',
    'sensor API',
    'temperature dashboard',
    'humidity dashboard',
    'private station monitoring',
    'Prisma',
    'Next.js',
  ],
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: 'en',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: siteConfig.name,
    description: siteConfig.description,
  },
  manifest: siteManifest,
  icons: siteIcons,
  appleWebApp: siteAppleWebApp,
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = siteViewport;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ibmPlexMono.variable} ${balooThambi.variable} ${inter.variable} antialiased`}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <ThemeToggle />
            {children}
            <Toaster position="top-right" richColors closeButton />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
