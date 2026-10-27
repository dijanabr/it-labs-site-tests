import type { Locator, Page, Response } from '@playwright/test';
import BasePage from './base-page';
import { contactForm } from '../test-data/contact-form';

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

  /** Clicks "Send message". Only call this with an invalid form: NetworkGuard aborts any request that slips through. */
  async attemptSubmit(): Promise<void> {
    await this.clickElement(this.submitButton);
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
