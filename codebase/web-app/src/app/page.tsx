import type { Metadata } from 'next';

import { buildPageMetadata } from '@/config/site-metadata.config';
import WeatherHome from '@/views/weather/WeatherHome';

export const metadata: Metadata = buildPageMetadata({
  absoluteTitle: true,
  title: 'The Weather Man',
  description:
    'Project overview and API reference for The Weather Man multi-station environmental sensor monitor.',
  path: '/',
});

export default function Home() {
  return <WeatherHome />;
}
