import { test, expect } from '../../fixtures/test-fixtures';
import { qaSubmission } from '../../test-data/contact-form';

// Calls the contact form's AJAX endpoint directly, the way a bot would, to prove the SERVER rejects messages
// without a valid reCAPTCHA token (the browser-side check is trivial to skip).
// NetworkGuard bypass, for this file only: page.request is an APIRequestContext, which is not subject to
// browser routing, so these POSTs reach the site. Loading /contact/ in the browser stays fully guarded.

test.describe('contact form endpoint', { tag: '@submit' }, () => {
  test.skip(!qaSubmission.enabled, qaSubmission.skipReason);

  for (const recaptchaToken of qaSubmission.invalidRecaptchaTokens) {
    test(`rejects a valid message with recaptchaToken "${recaptchaToken}"`, async ({ contactPage, networkGuard }) => {
      expect(qaSubmission.email, 'QA_EMAIL must be set in .env').toMatch(/@/);
      await contactPage.open();
      await contactPage.fillValidForm({ name: qaSubmission.name, email: qaSubmission.email, message: qaSubmission.message });
      const { ajaxUrl, entries } = await contactPage.buildSubmitPayload(recaptchaToken);
      for (const parameter of ['nonce', 'formId', 'postId', 'loopId']) {
        expect(entries.find(([name]) => name === parameter)?.[1], parameter).toMatch(/\S/);
      }
      const multipart = new FormData();
      for (const [name, value] of entries) multipart.append(name, value);

      const response = await contactPage.page.request.post(ajaxUrl, { multipart });

      const body = await response.json();
      await test.info().attach('response', { body: JSON.stringify(body, null, 2), contentType: 'application/json' });
      expect(body.success, 'the server must refuse the message').toBe(false);
      expect(JSON.stringify(body.data), 'error names reCAPTCHA').toMatch(/recaptcha/i);
      expect(networkGuard.blockedWrites).toEqual([]);
    });
  }
});
