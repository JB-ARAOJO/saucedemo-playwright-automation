import { Page, Locator, expect } from '@playwright/test';
import { Routes } from '../data/routes';
export class CartPage {
    readonly cartItems: Locator;
    readonly continueShopBtn: Locator;
    readonly checkoutBtn: Locator;
   

    constructor(readonly page: Page){
        this.cartItems       = page.getByTestId('inventory-item');
        this.continueShopBtn = page.getByTestId('continue-shopping');
        this.checkoutBtn     = page.getByTestId('checkout');
        
    }

    async goto() {
            await this.page.goto(Routes.cart, { waitUntil: 'domcontentloaded' });
            await expect(this.page).toHaveURL(Routes.cart);
        }
    
    async clickCheckoutButton() {
        await this.checkoutBtn.click();
    }

    getCartItemByName(name: string): Locator {
        return this.cartItems.filter({ hasText: name });
    }

    async expectItemPriceInCart(name: string, price: string) {
        const cartItem = this.getCartItemByName(name)
        await expect(cartItem).toBeVisible();
        const productPrice = await cartItem.getByTestId('inventory-item-price').innerText();
        expect(productPrice).toBe(price);
    }

    async expectItemInCart(name: string) {
        const cartItem = this.getCartItemByName(name);
        await expect(cartItem).toBeVisible();
        const productName = await cartItem.getByTestId('inventory-item-name').innerText();
        expect(productName).toBe(name);
    }

    async expectCartEmpty(){
        await expect(this.cartItems).toHaveCount(0);
    }

    async removeItem(name: string){
        const item = this.getCartItemByName(name);
        await item.locator('button[data-test^="remove"]').click();
        await expect(item).toBeHidden();
    }

    async clickContinueShopButton(){
        await this.continueShopBtn.click();
    }

}