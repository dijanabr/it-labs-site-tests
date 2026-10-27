// By default nothing typed here can reach the production inbox: NetworkGuard (utils/network-guard.ts) aborts
// every non-GET request to the site, and submit tests answer the AJAX call with a mocked response.
// Only the @submit tests talk to the real endpoint, and only when RUN_SUBMIT=true (see qaSubmission below).
export const contactForm = {
  path: '/contact/',
  submitButton: 'Send message',
  ajaxPath: '/wp-admin/admin-ajax.php',
  ajaxAction: 'bricks_form_submit',
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
  // maxlength as rendered in the browser (an inline script sets all but email after load).
  maxLengths: { name: 120, email: 320, company: 120, jobTitle: 120, phone: 30, message: 5000 },
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

// Bodies in the shape Bricks' admin-ajax handler returns (wp_send_json_success / wp_send_json_error).
export const mockedSubmitResponses = {
  success: {
    success: true,
    data: { type: 'success', message: 'Message sent. Thank you! One of our engineering leads will get back to you shortly.' },
  },
  error: {
    success: false,
    data: { type: 'danger', message: 'Email address is not valid.' },
  },
};

// Real submissions (@submit tests). They reach the production inbox, so they are opt-in and clearly labelled.
export const qaSubmission = {
  enabled: process.env.RUN_SUBMIT === 'true',
  skipReason: 'Sends a real message to production; set RUN_SUBMIT=true to run',
  name: 'QA TEST - please ignore',
  email: process.env.QA_EMAIL ?? '',
  message: 'QA TEST - please ignore. Automated regression check of the contact form.',
  invalidRecaptchaTokens: ['', 'invalid-token-test'],
};
