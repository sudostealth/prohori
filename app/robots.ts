import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://prohori.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/admin/',
        '/api/',
        '/billing/',
        '/compliance/',
        '/ai-analyst/',
        '/bug-bounty/',
        '/hrm/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
