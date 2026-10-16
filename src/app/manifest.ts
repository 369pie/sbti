import type { MetadataRoute } from 'next';

// Needed for Web Push on iOS: notifications only work once the site is added to the home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WTFTI — 懂你的女生私人顾问',
    short_name: 'WTFTI',
    start_url: '/today/',
    display: 'standalone',
    background_color: '#FBF6EC',
    theme_color: '#FBF6EC',
    icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
