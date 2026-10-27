export interface SitePage {
  path: string;
  title: string;
  h1: string;
  /** Key pages get the heavier checks (console errors, image alt text, responsive layout). */
  key?: boolean;
}

// Baseline captured from the live site (page-sitemap.xml). A failing title/H1 after a release means the
// content changed: either it is a regression, or the change was intended and this list needs updating.
export const sitePages: SitePage[] = [
  { path: '/', title: 'IT Labs | AI and Software Engineering Partner Since 2005', h1: 'Turning today’s AI ambition into tomorrow’s production advantage', key: true },
  { path: '/about/', title: 'About IT Labs: Engineering Partners Since 2005 | IT Labs', h1: 'Engineering partners since 2005', key: true },
  { path: '/contact/', title: 'Contact - IT Labs', h1: 'Tell us what you’re working on', key: true },
  { path: '/careers/', title: 'Careers at IT Labs: Engineering Jobs and Open Roles | IT Labs', h1: 'Build what matters, with people who want you to grow', key: true },
  { path: '/insights/', title: 'Articles - IT Labs', h1: 'Engineering insight from the people doing the work', key: true },
  { path: '/podcasts/', title: 'Podcast - IT Labs', h1: 'Conversations with the people who lead technology' },
  { path: '/case-studies/', title: 'Case studies - IT Labs', h1: 'To name a few projects we’ve built with our clients', key: true },

  { path: '/ai-rapid-platform-iteration/', title: 'AI Rapid Platform Iteration: Ship AI Safely | IT Labs', h1: 'Shipping AI features at pace, without breaking what already works' },
  { path: '/ai-platform-scaling/', title: 'AI Platform Scaling: From Pilot to Production | IT Labs', h1: 'Scaling AI from proof of value to enterprise-grade production', key: true },
  { path: '/ai-code-system-evaluation/', title: 'AI Code & System Evaluation: Independent Review | IT Labs', h1: 'An objective view of the AI-generated code your business now depends on' },
  { path: '/ai-product-transition/', title: 'AI Product Transition: POC to Production | IT Labs', h1: 'Turning a promising AI proof of concept into a production-ready product' },
  { path: '/ai-risk-mitigation-security/', title: 'AI Risk Mitigation & Security Services | IT Labs', h1: 'Identifying and reducing AI risk before it reaches your users' },
  { path: '/ai-auditing/', title: 'AI Auditing: Independent AI Performance Audits | IT Labs', h1: 'An independent assessment of how your AI really performs' },
  { path: '/ai-business-continuity/', title: 'AI Business Continuity & Resilience Services | IT Labs', h1: 'Keeping AI systems resilient, redundant and cost-controlled at scale' },
  { path: '/tech-org-accountability/', title: 'Tech Org Accountability: Outcome-Driven Teams | IT Labs', h1: 'Building engineering teams that own outcomes, not just tickets' },

  { path: '/software-development/', title: 'Software Engineering & Architecture: Senior Teams | IT Labs', h1: 'Senior engineering teams that build and evolve the software your business runs on', key: true },
  { path: '/cloud-strategy/', title: 'Cloud & Platform Engineering, Strategy & FinOps | IT Labs', h1: 'A cloud strategy built around cost, resilience and how your teams actually ship' },
  { path: '/devops-services/', title: 'DevOps Services: CI/CD, Platforms & SRE | IT Labs', h1: 'Delivery pipelines and platforms that make releases frequent, reliable and uneventful' },
  { path: '/cybersecurity/', title: 'Cybersecurity Services & Penetration Testing | IT Labs', h1: 'Finding and closing security gaps before attackers do' },
  { path: '/sdet/', title: 'Quality Engineering & Test Automation Services | IT Labs', h1: 'Test automation engineered into delivery, so quality scales with your codebase' },
  { path: '/ui-ux-design/', title: 'Product Design Services: Research-Led UX & UI | IT Labs', h1: 'Research-led product design that makes complex software clear and easy to use' },
  { path: '/business_agility/', title: 'Business Agility: Shorten Idea-to-Delivery Time | IT Labs', h1: 'Aligning strategy, teams and delivery so you can change direction without losing pace' },

  { path: '/financial-services/', title: 'Financial Services Software Engineering & AI | IT Labs', h1: 'Engineering for financial services, where every release is regulated' },
  { path: '/education/', title: 'Education Technology Engineering & EdTech AI | IT Labs', h1: 'Engineering education platforms that perform when every student logs in at once' },
  { path: '/health/', title: 'Healthcare Software Engineering & Clinical AI | IT Labs', h1: 'Engineering healthcare technology that clinicians and patients can trust' },
  { path: '/housing/', title: 'Digital Services for Housing Providers | IT Labs', h1: 'Engineering digital services for housing providers and the residents they serve' },

  { path: '/privacy-policy/', title: 'Privacy Policy - IT Labs', h1: 'Privacy Policy' },
  { path: '/privacy-notice-for-recruitment-and-talent-acquisition/', title: 'Privacy Notice for Recruitment and Talent Acquisition - IT Labs', h1: 'Privacy Notice for Recruitment and Talent Acquisition' },
  { path: '/modern-slavery-act-statement/', title: 'Modern Slavery Act Statement - IT Labs', h1: 'Modern Slavery Act Statement' },
  { path: '/website-terms-and-conditions/', title: 'Website Terms and Conditions - IT Labs', h1: 'Website Terms and Conditions' },
  { path: '/cookie-declaration/', title: 'Cookie Declaration - IT Labs', h1: 'Cookie Declaration' },
];

export const keyPages = sitePages.filter((sitePage) => sitePage.key);

export function getSitePage(path: string): SitePage {
  const sitePage = sitePages.find((candidate) => candidate.path === path);
  if (!sitePage) throw new Error(`No page with path "${path}" in test-data/pages.ts`);
  return sitePage;
}

export const notFoundPage = {
  path: '/this-page-should-not-exist-regression-check/',
  title: 'Page not found - IT Labs',
  h1: 'This page doesn’t exist',
  helpfulLinks: [
    { name: 'Contact us', path: '/contact/' },
    { name: /^Articles/, path: '/insights/' },
    { name: /^Case studies/, path: '/case-studies/' },
  ],
};

// Old URLs that must keep redirecting to their replacement pages.
export const legacyRedirects = [
  { from: '/development-solutions/', to: '/software-development/' },
  { from: '/security-services-3/', to: '/cybersecurity/' },
  { from: '/corporate/', to: '/about/' },
];
