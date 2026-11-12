import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LoginData } from '../data/loginData';
import { STORAGE_STATE } from '../config/auth';
import { Routes } from '../data/routes';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await page.goto(Routes.login, {
  waitUntil: 'domcontentloaded',
  });

  await loginPage.login(
    LoginData.validUser.username,
    LoginData.validUser.password
);
  await expect(page).toHaveURL(Routes.inventory);

  await page.context().storageState({
    path: STORAGE_STATE,
  });
});