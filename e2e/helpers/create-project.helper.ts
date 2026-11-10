import type { Page, Locator } from '@playwright/test';

export class CreateProjectHelper {
  constructor(private page: Page) {}

  async openDialog(): Promise<void> {
    await this.page.getByRole('button', { name: /create project/i }).first().click();
    await this.page.getByRole('dialog').waitFor({ state: 'visible' });
  }

  async closeDialog(): Promise<void> {
    await this.page.getByRole('button', { name: /cancel/i }).click();
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' });
  }

  async fillProjectName(name: string): Promise<void> {
    const input = this.page.getByLabel(/project name/i);
    await input.fill(name);
  }

  async fillDescription(description: string): Promise<void> {
    const input = this.page.getByLabel(/description/i);
    await input.fill(description);
  }

  async clearProjectName(): Promise<void> {
    await this.page.getByLabel(/project name/i).clear();
  }

  async clearDescription(): Promise<void> {
    await this.page.getByLabel(/description/i).clear();
  }

  async submitForm(): Promise<void> {
    await this.page.getByRole('button', { name: /^create project$/i }).click();
  }

  async createProject(name: string, description?: string): Promise<void> {
    await this.openDialog();
    await this.fillProjectName(name);

    if (description) {
      await this.fillDescription(description);
    }

    await this.submitForm();
    await this.page.getByRole('dialog').waitFor({ state: 'hidden', timeout: 10000 });
  }

  async isDialogVisible(): Promise<boolean> {
    return await this.page.getByRole('dialog').isVisible();
  }

  async isDialogHidden(): Promise<boolean> {
    return !(await this.page.getByRole('dialog').isVisible());
  }

  getProjectNameInput(): Locator {
    return this.page.getByLabel(/project name/i);
  }

  getDescriptionInput(): Locator {
    return this.page.getByLabel(/description/i);
  }

  getSubmitButton(): Locator {
    return this.page.getByRole('button', { name: /^create project$/i });
  }

  getCancelButton(): Locator {
    return this.page.getByRole('button', { name: /cancel/i });
  }

  getDialog(): Locator {
    return this.page.getByRole('dialog');
  }

  async getValidationError(message: string): Promise<Locator> {
    return this.page.getByText(new RegExp(message, 'i'));
  }

  async waitForProjectInList(projectName: string, timeout = 10000): Promise<void> {
    await this.page.getByText(projectName).waitFor({ timeout });
  }

  async getProjectNameValue(): Promise<string | null> {
    return await this.getProjectNameInput().inputValue();
  }

  async getDescriptionValue(): Promise<string | null> {
    return await this.getDescriptionInput().inputValue();
  }

  async isSubmitButtonDisabled(): Promise<boolean> {
    return await this.getSubmitButton().isDisabled();
  }

  async isSubmitButtonEnabled(): Promise<boolean> {
    return !(await this.getSubmitButton().isDisabled());
  }

  async focusProjectNameInput(): Promise<void> {
    await this.getProjectNameInput().focus();
  }

  async blurProjectNameInput(): Promise<void> {
    await this.getProjectNameInput().blur();
  }

  async pressEscapeKey(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async navigateToProjectName(): Promise<void> {
    await this.getProjectNameInput().focus();
  }

  async navigateToDescription(): Promise<void> {
    await this.page.keyboard.press('Tab');
  }

  async navigateToSubmitButton(): Promise<void> {
    await this.page.keyboard.press('Tab');
  }
}