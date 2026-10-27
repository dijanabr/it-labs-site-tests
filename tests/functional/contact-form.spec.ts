import { test, expect } from '../../fixtures/test-fixtures';
import { contactForm, contactFormData } from '../../test-data/contact-form';

// The form is NEVER submitted with valid data. Every test leaves at least one required field invalid,
// and NetworkGuard aborts any write request regardless; tests assert that nothing was even attempted.

test.beforeEach(async ({ contactPage }) => {
  await contactPage.open();
});

test.afterEach(async ({ networkGuard }) => {
  expect(networkGuard.blockedWrites, 'the contact form must never send a request').toEqual([]);
});

test('form shows every field with its label', async ({ contactPage }) => {
  for (const heading of contactForm.sectionHeadings) {
    await expect(contactPage.sectionHeading(heading)).toBeVisible();
  }
  for (const field of [contactPage.nameInput, contactPage.emailInput, contactPage.companyInput, contactPage.jobTitleInput, contactPage.messageInput, contactPage.phoneInput]) {
    await expect(field).toBeVisible();
    await expect(field).toBeEditable();
  }
  for (const topic of contactForm.topics) {
    await expect(contactPage.topicCheckbox(topic)).toBeVisible();
  }
  await expect(contactPage.consentCheckbox).toBeVisible();
  await expect(contactPage.submitButton).toBeEnabled();
});

test('required fields are marked as required', async ({ contactPage }) => {
  await expect(contactPage.nameInput).toHaveAttribute('required');
  await expect(contactPage.emailInput).toHaveAttribute('required');
  await expect(contactPage.consentCheckbox).toHaveAttribute('required');
  await expect(contactPage.emailInput).toHaveAttribute('type', 'email');
  await expect(contactPage.phoneInput).toHaveAttribute('type', 'tel');
});

test('email is the default contact preference and can be switched to phone', async ({ contactPage }) => {
  const byEmail = contactPage.contactPreference(contactForm.contactPreferences.email);
  const byPhone = contactPage.contactPreference(contactForm.contactPreferences.phone);
  await expect(byEmail).toBeChecked();

  await contactPage.checkViaLabel(byPhone);

  await expect(byPhone).toBeChecked();
  await expect(byEmail).not.toBeChecked();
});

test('several topics can be selected', async ({ contactPage }) => {
  const [first, second] = contactForm.topics;
  await contactPage.checkViaLabel(contactPage.topicCheckbox(first));
  await contactPage.checkViaLabel(contactPage.topicCheckbox(second));

  await expect(contactPage.topicCheckbox(first)).toBeChecked();
  await expect(contactPage.topicCheckbox(second)).toBeChecked();
});

test('submitting an empty form is blocked by validation', async ({ contactPage }) => {
  await contactPage.attemptSubmit();

  expect(await contactPage.isFormValid()).toBe(false);
  expect(await contactPage.getValidity(contactPage.nameInput)).toMatchObject({ valid: false, valueMissing: true });
  expect(await contactPage.getValidity(contactPage.emailInput)).toMatchObject({ valid: false, valueMissing: true });
  await expect(contactPage.page).toHaveURL(contactForm.path);
});

for (const invalidEmail of contactFormData.invalidEmails) {
  test(`email "${invalidEmail}" is rejected`, async ({ contactPage }) => {
    // Consent first: leaving the email field triggers inline validation that shifts the layout mid-click.
    await contactPage.checkViaLabel(contactPage.consentCheckbox);
    await expect(contactPage.consentCheckbox).toBeChecked();
    await contactPage.fillContactDetails({ name: contactFormData.visitor.name, email: invalidEmail });

    await contactPage.attemptSubmit();

    expect(await contactPage.getValidity(contactPage.emailInput)).toMatchObject({ valid: false, typeMismatch: true });
  });
}

test('privacy consent is required', async ({ contactPage }) => {
  await contactPage.fillContactDetails(contactFormData.visitor);

  await contactPage.attemptSubmit();

  expect(await contactPage.getValidity(contactPage.consentCheckbox)).toMatchObject({ valid: false, valueMissing: true });
  expect(await contactPage.isFormValid()).toBe(false);
});

test('fields keep the values typed into them', async ({ contactPage }) => {
  const { visitor } = contactFormData;
  await contactPage.fillContactDetails(visitor);

  await expect(contactPage.nameInput).toHaveValue(visitor.name);
  await expect(contactPage.emailInput).toHaveValue(visitor.email);
  await expect(contactPage.companyInput).toHaveValue(visitor.company);
  await expect(contactPage.jobTitleInput).toHaveValue(visitor.jobTitle);
  await expect(contactPage.messageInput).toHaveValue(visitor.message);
  await expect(contactPage.phoneInput).toHaveValue(visitor.phone);
});

test('spam honeypot field is hidden from visitors', async ({ contactPage }) => {
  await expect(contactPage.honeypotInput).toBeAttached();
  await expect(contactPage.honeypotInput).toHaveAttribute('tabindex', '-1');
  await expect(contactPage.honeypotInput).not.toBeInViewport();
});

for (const faq of contactForm.faq) {
  test(`FAQ "${faq.question}" reveals its answer`, async ({ contactPage }) => {
    await contactPage.expandFaq(faq.question);

    await expect(contactPage.faqItem(faq.question)).toHaveAttribute('open', '');
    await expect(contactPage.faqItem(faq.question).getByText(faq.answer)).toBeVisible();
  });
}
