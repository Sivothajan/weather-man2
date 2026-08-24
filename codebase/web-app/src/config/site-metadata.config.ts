import type { Metadata, Viewport } from 'next';

import publicEnvConfig from '@/config/public.env.config';

export const siteConfig = {
  name: 'The Weather Man',
  shortName: 'Weather Man',
  description:
    'A Next.js dashboard and API for environmental sensor readings from The Weather Man station.',
  url: publicEnvConfig.NEXT_PUBLIC_SITE_URL,
  lightThemeColor: '#f9f8f2',
  darkThemeColor: '#161823',
} as const;

export const siteManifest = '/favicon/site.webmanifest';

export const siteIcons: Metadata['icons'] = {
  icon: [
    { url: '/favicon.ico', sizes: 'any' },
    { url: '/favicon/favicon.ico', sizes: 'any' },
    {
      url: '/favicon/favicon.svg',
      type: 'image/svg+xml',
    },
    {
      url: '/favicon/favicon-96x96.png',
      sizes: '96x96',
      type: 'image/png',
    },
  ],
  shortcut: '/favicon.ico',
  apple: [
    {
      url: '/favicon/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
  ],
};

export const siteIconLinks = [
  { href: '/favicon.ico', rel: 'icon', sizes: 'any' },
  { href: '/favicon/favicon.svg', rel: 'icon', type: 'image/svg+xml' },
  {
    href: '/favicon/apple-touch-icon.png',
    rel: 'apple-touch-icon',
    sizes: '180x180',
  },
] as const;

export const siteAppleWebApp: Metadata['appleWebApp'] = {
  capable: true,
  title: siteConfig.shortName,
  startupImage: '/favicon/apple-touch-icon.png',
  statusBarStyle: 'black-translucent',
};

export const siteViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    {
      media: '(prefers-color-scheme: light)',
      color: siteConfig.lightThemeColor,
    },
    { media: '(prefers-color-scheme: dark)', color: siteConfig.darkThemeColor },
  ],
};

export function buildPageMetadata({
  absoluteTitle = false,
  description,
  noIndex = false,
  path,
  title,
}: {
  absoluteTitle?: boolean;
  description: string;
  noIndex?: boolean;
  path?: string;
  title: string;
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${siteConfig.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: path ? { canonical: path } : undefined,
    manifest: siteManifest,
    icons: siteIcons,
    appleWebApp: siteAppleWebApp,
    openGraph: {
      title: fullTitle,
      description,
      url: path ?? siteConfig.url,
      siteName: siteConfig.name,
      locale: 'en',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: fullTitle,
      description,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
        },
  };
}
