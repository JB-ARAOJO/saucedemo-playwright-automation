import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { MenuPage } from '../pages/MenuPage';

export const test = base.extend<{
    loginPage     : LoginPage;
    inventoryPage : InventoryPage;
    cartPage      : CartPage;
    checkoutPage  : CheckoutPage;
    menuPage      : MenuPage;
}>({
    loginPage: async ({ page }, use) => {
        let loginPage: LoginPage;
        loginPage = new LoginPage(page);
        await page.goto('');
        await use(loginPage);
    },
    inventoryPage: async ({ page }, use) => {
        let inventoryPage: InventoryPage;
        inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        await use(inventoryPage);
    }, 
    cartPage: async ({ page }, use) =>{
        let cartPage: CartPage;
        cartPage = new CartPage(page);
        await use(cartPage);
    },
    checkoutPage: async ({ page }, use) => {
        const checkoutPage = new CheckoutPage(page);
        await use(checkoutPage);
    },
    menuPage: async ({ page }, use) => {
        let menuPage: MenuPage;
        menuPage = new MenuPage(page);
        await use(menuPage);
    }
    
});

export { expect };