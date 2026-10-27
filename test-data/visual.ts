export interface VisualPage {
  name: string;
  path: string;
  /** CSS selectors for content that changes on its own (sliders, carousels, feeds) and must be masked. */
  masks: string[];
  /** CSS selectors hidden before the screenshot: rotating backgrounds behind content we still want to compare. */
  hidden?: string[];
}

const alwaysMasked = ['#CookiebotWidget'];

export const visualPages: VisualPage[] = [
  {
    name: 'home',
    path: '/',
    // Hero background images, services deck, industries deck and logo carousels all rotate on timers.
    masks: [...alwaysMasked, '.itl-hero__dots', '.svc-deck__viewport', '.svc-deck__progress', '.ind-deck .deck', '.brxe-carousel'],
    hidden: ['.itl-hero__slides'],
  },
  { name: 'about', path: '/about/', masks: [...alwaysMasked, '.brxe-carousel'] },
  { name: 'contact', path: '/contact/', masks: alwaysMasked },
  { name: 'software-development', path: '/software-development/', masks: [...alwaysMasked, '.brxe-carousel'] },
  { name: 'ai-platform-scaling', path: '/ai-platform-scaling/', masks: [...alwaysMasked, '.brxe-carousel'] },
  { name: 'not-found', path: '/this-page-should-not-exist-regression-check/', masks: alwaysMasked },
];
