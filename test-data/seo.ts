export const seoRules = {
  titleMaxLength: 65,
  descriptionMinLength: 70,
  descriptionMaxLength: 160,
  requiredOpenGraphTags: ['og:title', 'og:description', 'og:url', 'og:image', 'og:type'],
  sitemapIndexPath: '/sitemap_index.xml',
  pageSitemapPath: '/page-sitemap.xml',
  childSitemaps: ['/page-sitemap.xml', '/post-sitemap.xml'],
  robotsTxtPath: '/robots.txt',
  robotsDisallowed: ['/wp-admin/'],
};
