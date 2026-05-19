import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aura Fitness AI',
    short_name: 'AuraFit',
    description: 'Ứng dụng quản lý phòng gym chuyên nghiệp với AI',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#f97316',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
