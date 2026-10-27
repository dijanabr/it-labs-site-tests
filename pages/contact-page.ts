import type { Locator, Page, Request, Response } from '@playwright/test';
import BasePage from './base-page';
import { contactForm } from '../test-data/contact-form';
import { getMultipartField } from '../utils/multipart';

export interface FieldValidity {
  valid: boolean;
  valueMissing: boolean;
  typeMismatch: boolean;
}

export interface ContactDetails {
  name?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  message?: string;
  phone?: string;
}

export interface SubmitPayload {
  ajaxUrl: string;
  /** Form fields plus the parameters Bricks adds (action, nonce, formId, postId, loop*, referrer, urlParams). */
  entries: [string, string][];
}

export default class ContactPage extends BasePage {
  readonly form: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly companyInput: Locator;
  readonly jobTitleInput: Locator;
  readonly messageInput: Locator;
  readonly phoneInput: Locator;
  readonly consentCheckbox: Locator;
  readonly honeypotInput: Locator;
  readonly submitButton: Locator;
  readonly submitResultMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.locator('form').filter({ has: page.getByRole('button', { name: contactForm.submitButton }) });
    this.nameInput = this.form.getByLabel(contactForm.labels.name);
    this.emailInput = this.form.getByLabel(contactForm.labels.email);
    this.companyInput = this.form.getByLabel(contactForm.labels.company);
    this.jobTitleInput = this.form.getByLabel(contactForm.labels.jobTitle);
    this.messageInput = this.form.getByLabel(contactForm.labels.message);
    this.phoneInput = this.form.getByLabel(contactForm.labels.phone);
    this.consentCheckbox = this.form.getByRole('checkbox', { name: contactForm.labels.consent });
    this.honeypotInput = this.form.getByLabel(contactForm.labels.honeypot, { exact: true });
    this.submitButton = this.form.getByRole('button', { name: contactForm.submitButton });
    // Bricks appends <div class="message success|danger"> to the form with the server's reply.
    this.submitResultMessage = this.form.locator('.message');
  }

  async open(): Promise<Response | null> {
    return this.navigateTo(contactForm.path);
  }

  topicCheckbox(topic: string): Locator {
    return this.form.getByRole('checkbox', { name: topic, exact: true });
  }

  contactPreference(label: string): Locator {
    return this.form.getByRole('radio', { name: label, exact: true });
  }

  sectionHeading(name: string): Locator {
    return this.form.getByRole('heading', { level: 3, name, exact: true });
  }

  faqItem(question: string): Locator {
    return this.page.locator('details').filter({ has: this.page.getByText(question, { exact: true }) });
  }

  async expandFaq(question: string): Promise<void> {
    const item = this.faqItem(question);
    if ((await item.getAttribute('open')) === null) {
      await this.clickElement(item.getByText(question, { exact: true }));
    }
  }

  async fillContactDetails(details: ContactDetails): Promise<void> {
    const fields: [Locator, string | undefined][] = [
      [this.nameInput, details.name],
      [this.emailInput, details.email],
      [this.companyInput, details.company],
      [this.jobTitleInput, details.jobTitle],
      [this.messageInput, details.message],
      [this.phoneInput, details.phone],
    ];
    for (const [field, value] of fields) {
      if (value !== undefined) await this.fillValue(field, value);
    }
  }

  /** Fills a form that passes client-side validation, including the required privacy consent. */
  async fillValidForm(details: ContactDetails): Promise<void> {
    // Consent first: leaving the email field triggers inline validation that shifts the layout mid-click.
    await this.checkViaLabel(this.consentCheckbox);
    await this.fillContactDetails(details);
  }

  /**
   * Clicks "Send message". With an invalid form nothing is sent; with a valid one the request is aborted by
   * NetworkGuard unless the test mocks it (mockSubmitResponse) or lets it through (NetworkGuard.allowWrites).
   */
  async attemptSubmit(): Promise<void> {
    await this.clickElement(this.submitButton);
  }

  /**
   * Answers the form's AJAX submission with `body` instead of sending it to the site, and returns the
   * intercepted requests. A page route takes precedence over NetworkGuard's context route, and fulfilling
   * it means the request never leaves the browser.
   */
  async mockSubmitResponse(body: object): Promise<Request[]> {
    const intercepted: Request[] = [];
    await this.page.route(`**${contactForm.ajaxPath}`, async (route) => {
      if (getMultipartField(route.request().postData(), 'action') !== contactForm.ajaxAction) return route.fallback();
      intercepted.push(route.request());
      await route.fulfill({ json: body });
    });
    return intercepted;
  }

  /** Builds the request body the way Bricks' bricksSubmitForm() does, from the form as currently filled in. */
  async buildSubmitPayload(recaptchaToken: string): Promise<SubmitPayload> {
    return this.form.evaluate(
      (form, { action, token }) => {
        const formElement = form as HTMLFormElement;
        const { bricksData } = window as unknown as { bricksData: { ajaxUrl: string; postId: string; formNonce: string } };
        const { scriptId, loopObjectId, loopSignature, loopType } = formElement.dataset;
        const entries = [...new FormData(formElement)].filter((entry): entry is [string, string] => typeof entry[1] === 'string');
        entries.push(['action', action], ['loopId', loopObjectId ?? bricksData.postId]);
        if (loopSignature) entries.push(['loopSignature', loopSignature], ['loopType', loopType ?? '']);
        entries.push(
          ['postId', bricksData.postId],
          ['formId', scriptId!],
          ['recaptchaToken', token],
          ['nonce', bricksData.formNonce],
          ['referrer', location.href],
          ['urlParams', '{}'],
        );
        return { ajaxUrl: bricksData.ajaxUrl, entries };
      },
      { action: contactForm.ajaxAction, token: recaptchaToken },
    );
  }

  async waitForSubmitRequest(): Promise<Request> {
    return this.page.waitForRequest(
      (request) => request.method() === 'POST' && new URL(request.url()).pathname === contactForm.ajaxPath && getMultipartField(request.postData(), 'action') === contactForm.ajaxAction,
    );
  }

  async getValidity(field: Locator): Promise<FieldValidity> {
    return field.evaluate((element) => {
      const { valid, valueMissing, typeMismatch } = (element as HTMLInputElement).validity;
      return { valid, valueMissing, typeMismatch };
    });
  }

  async isFormValid(): Promise<boolean> {
    return this.form.evaluate((form) => (form as HTMLFormElement).checkValidity());
  }
}
