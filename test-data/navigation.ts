export interface NavLink {
  name: string;
  path: string;
}

export interface NavGroup {
  heading?: string;
  links: NavLink[];
}

export interface NavDropdown {
  label: string;
  groups: NavGroup[];
}

const aiServicesLinks: NavLink[] = [
  { name: 'AI Rapid Platform Iteration', path: '/ai-rapid-platform-iteration/' },
  { name: 'AI Platform Scaling', path: '/ai-platform-scaling/' },
  { name: 'AI Code & System Evaluation', path: '/ai-code-system-evaluation/' },
  { name: 'AI Product Transition', path: '/ai-product-transition/' },
  { name: 'AI Risk Mitigation & Security', path: '/ai-risk-mitigation-security/' },
  { name: 'AI Auditing', path: '/ai-auditing/' },
  { name: 'AI Business Continuity', path: '/ai-business-continuity/' },
  { name: 'Tech Org Accountability', path: '/tech-org-accountability/' },
];

const engineeringLinks: NavLink[] = [
  { name: 'Software Engineering & Architecture', path: '/software-development/' },
  { name: 'Cloud & Platform Engineering', path: '/cloud-strategy/' },
  { name: 'DevOps', path: '/devops-services/' },
  { name: 'Cybersecurity', path: '/cybersecurity/' },
  { name: 'Quality Engineering', path: '/sdet/' },
  { name: 'Product Design', path: '/ui-ux-design/' },
  { name: 'Business Agility', path: '/business_agility/' },
];

const industriesLinks: NavLink[] = [
  { name: 'Financial Services', path: '/financial-services/' },
  { name: 'Education', path: '/education/' },
  { name: 'Healthcare', path: '/health/' },
];

export const headerNavigation = {
  logoAlt: 'IT Labs Logo',
  dropdowns: [
    {
      label: 'What we do',
      groups: [
        { heading: 'AI services', links: aiServicesLinks },
        { heading: 'Engineering', links: engineeringLinks },
        { heading: 'Industries', links: industriesLinks },
      ],
    },
    {
      label: 'Insights',
      groups: [
        {
          links: [
            { name: 'Articles', path: '/insights/' },
            { name: 'Podcast', path: '/podcasts/' },
            { name: 'Case studies', path: '/case-studies/' },
          ],
        },
      ],
    },
  ] as NavDropdown[],
  topLinks: [
    { name: 'About', path: '/about/' },
    { name: 'Careers', path: '/careers/' },
  ],
  cta: { name: /Let's talk/, path: '/contact/' },
};

export const footerNavigation = {
  columns: [
    { heading: 'AI services', links: aiServicesLinks },
    { heading: 'Engineering', links: engineeringLinks },
    { heading: 'Industries', links: industriesLinks },
    {
      heading: 'Company',
      links: [
        { name: 'About us', path: '/about/' },
        { name: 'Careers', path: '/careers/' },
        { name: 'Insights', path: '/insights/' },
        { name: 'Podcast', path: '/podcasts/' },
        { name: 'Case studies', path: '/case-studies/' },
        { name: 'Contact', path: '/contact/' },
      ],
    },
  ] satisfies NavGroup[],
  legalLinks: [
    { name: 'Privacy Policy', path: '/privacy-policy/' },
    { name: 'Terms and Conditions', path: '/website-terms-and-conditions/' },
    { name: 'Cookie Declaration', path: '/cookie-declaration/' },
    { name: 'Modern Slavery Statement', path: '/modern-slavery-act-statement/' },
  ] satisfies NavLink[],
  socialLinks: [
    { network: 'LinkedIn', href: 'https://www.linkedin.com/company/it-labs/' },
    { network: 'YouTube', href: 'https://www.youtube.com/playlist?list=PLK96dwihwhdli7mgNa3Fw7oKlYM3KOqom' },
    { network: 'Instagram', href: 'https://www.instagram.com/theitlabs/' },
  ],
  certifications: [
    'Microsoft Gold Partner',
    'ISTQB Platinum Partner',
    'AWS Select Tier Partner',
    'ISO 9001',
    'ISO 14001',
    'ISO/IEC 27001',
    'ISO/IEC 20000-1',
  ],
};
