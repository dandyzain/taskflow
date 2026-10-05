import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TaskFlow - Collaborative Task Management',
    short_name: 'TaskFlow',
    description: 'A modern Kanban board for team collaboration',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F9FD',
    theme_color: '#8B68F6',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
