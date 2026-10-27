// The contact form is only ever validated client-side. NetworkGuard (utils/network-guard.ts) additionally
// aborts every non-GET request to the site, so nothing typed here can reach the production inbox.
export const contactForm = {
  path: '/contact/',
  submitButton: 'Send message',
  labels: {
    name: 'Your name (required)',
    email: 'Work email (required)',
    company: 'Company (optional)',
    jobTitle: 'Job title (optional)',
    message: /Tell us about your project/,
    phone: /Phone number/,
    consent: /I’m happy for IT Labs to use these details to reply to me/,
    honeypot: 'Website',
  },
  topics: ['AI services', 'Software development', 'Cloud & DevOps', 'Security', 'Quality & testing', 'Design & UX', 'Not sure yet'],
  contactPreferences: { email: 'By email', phone: 'With a phone call' },
  sectionHeadings: ['About you', 'Your message', 'Privacy'],
  faq: [
    { question: 'Do I need a detailed brief?', answer: /A couple of sentences about what you’re working on is enough/ },
    { question: 'Can we sign an NDA first?', answer: /happy to sign yours/ },
    { question: 'What if we’re not sure which service we need?', answer: /Choose “Not sure yet”/ },
    { question: 'Will I be added to a mailing list?', answer: /only use your details to reply/ },
  ],
};

export const contactFormData = {
  visitor: {
    name: 'Regression Test (automated, do not reply)',
    email: 'regression-test@example.com',
    company: 'Example Ltd',
    jobTitle: 'QA Engineer',
    message: 'Automated regression check. This form is never submitted.',
    phone: '+389 70 000 000',
  },
  invalidEmails: ['not-an-email', 'missing-at-sign.example.com', 'user@'],
};
