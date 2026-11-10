// import { test, expect } from '@playwright/test';
// import { CreateProjectHelper } from './helpers/create-project.helper';

// test.describe('Create Project - Using Helper', () => {
//   let helper: CreateProjectHelper;

//   test.beforeEach(async ({ page }) => {
//     await page.goto('/dashboard');
//     await page.waitForLoadState('networkidle');
//     helper = new CreateProjectHelper(page);
//   });

//   test('should create project using helper', async () => {
//     await helper.createProject('My Project', 'Project description');
//     await expect(helper.getDialog()).not.toBeVisible();
//   });

//   test('should open and close dialog using helper', async () => {
//     await helper.openDialog();
//     await expect(helper.getDialog()).toBeVisible();

//     await helper.closeDialog();
//     await expect(helper.getDialog()).not.toBeVisible();
//   });

//   test('should fill form fields using helper', async () => {
//     await helper.openDialog();

//     await helper.fillProjectName('Test Project');
//     await expect(helper.getProjectNameInput()).toHaveValue('Test Project');

//     await helper.fillDescription('Test Description');
//     await expect(helper.getDescriptionInput()).toHaveValue('Test Description');

//     await helper.closeDialog();
//   });

//   test('should validate empty name using helper', async () => {
//     await helper.openDialog();

//     await expect(helper.getSubmitButton()).toBeDisabled();

//     await helper.closeDialog();
//   });

//   test('should enable submit when name is provided using helper', async () => {
//     await helper.openDialog();

//     expect(await helper.isSubmitButtonDisabled()).toBe(true);

//     await helper.fillProjectName('Valid Project');

//     expect(await helper.isSubmitButtonEnabled()).toBe(true);

//     await helper.closeDialog();
//   });

//   test('should clear form using helper', async () => {
//     await helper.openDialog();

//     await helper.fillProjectName('Project Name');
//     await helper.fillDescription('Project Description');

//     await helper.clearProjectName();
//     await helper.clearDescription();

//     const nameValue = await helper.getProjectNameValue();
//     const descValue = await helper.getDescriptionValue();

//     expect(nameValue).toBe('');
//     expect(descValue).toBe('');

//     await helper.closeDialog();
//   });

//   test('should navigate form with keyboard using helper', async () => {
//     await helper.openDialog();

//     await helper.navigateToProjectName();
//     await expect(helper.getProjectNameInput()).toBeFocused();

//     await helper.navigateToDescription();
//     await expect(helper.getDescriptionInput()).toBeFocused();

//     await helper.navigateToSubmitButton();
//     await expect(helper.getSubmitButton()).toBeFocused();

//     await helper.closeDialog();
//   });

//   test('should close dialog with Escape key using helper', async () => {
//     await helper.openDialog();
//     expect(await helper.isDialogVisible()).toBe(true);

//     await helper.pressEscapeKey();
//     expect(await helper.isDialogHidden()).toBe(true);
//   });

//   test('should get input values using helper', async () => {
//     await helper.openDialog();

//     const testName = 'Test Project Name';
//     const testDesc = 'Test Description';

//     await helper.fillProjectName(testName);
//     await helper.fillDescription(testDesc);

//     const nameValue = await helper.getProjectNameValue();
//     const descValue = await helper.getDescriptionValue();

//     expect(nameValue).toBe(testName);
//     expect(descValue).toBe(testDesc);

//     await helper.closeDialog();
//   });

//   test('should create multiple projects sequentially using helper', async () => {
//     for (let i = 1; i <= 3; i++) {
//       await helper.createProject(`Project ${i}`, `Description ${i}`);

//       const isHidden = await helper.isDialogHidden();
//       expect(isHidden).toBe(true);
//     }
//   });

//   test('should handle special characters using helper', async () => {
//     const specialProjectName = 'Project #1 - Test & Co. (2024)';

//     await helper.createProject(specialProjectName, 'Special character test');
//     await expect(helper.getDialog()).not.toBeVisible();
//   });

//   test('should handle long names using helper', async () => {
//     const longName = 'A'.repeat(150);

//     await helper.openDialog();
//     await helper.fillProjectName(longName);

//     const value = await helper.getProjectNameValue();
//     expect(value).toBe(longName);

//     await helper.closeDialog();
//   });

//   test('should validate display error using helper', async () => {
//     await helper.openDialog();

//     await helper.focusProjectNameInput();
//     await helper.blurProjectNameInput();

//     const error = await helper.getValidationError('name is required');
//     await expect(error).toBeVisible();

//     await helper.closeDialog();
//   });
// });