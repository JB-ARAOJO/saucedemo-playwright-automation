import { Page, Locator, expect } from '@playwright/test';
import { CheckoutData } from '../data/checkoutData';

export class CheckoutPage{
        readonly firstNameField: Locator;
        readonly lastNameField: Locator;
        readonly postalCodeField: Locator;
        readonly cancelBtn: Locator;
        readonly continueBtn: Locator;    
        readonly errorMessage: Locator;
        readonly checkoutItems: Locator;
        readonly finishBtn: Locator;
        readonly checkoutContainer: Locator;
        readonly checkoutMessage: Locator;
        readonly backHomeBtn: Locator;
        readonly itemTotal: Locator;
        readonly tax: Locator;
        readonly total: Locator;

        constructor(readonly page: Page){
            this.firstNameField    = page.getByTestId('firstName');
            this.lastNameField     = page.getByTestId('lastName');
            this.postalCodeField   = page.getByTestId('postalCode');
            this.cancelBtn         = page.getByTestId('cancel');
            this.continueBtn       = page.getByTestId('continue');
            this.errorMessage      = page.getByTestId('error');
            this.checkoutItems     = page.getByTestId('inventory-item');
            this.finishBtn         = page.getByTestId('finish');
            this.checkoutContainer = page.getByTestId('checkout-info-container');
            this.checkoutMessage   = page.getByTestId('complete-header');
            this.backHomeBtn       = page.getByTestId('back-to-products');
            this.itemTotal         = page.getByTestId('subtotal-label');
            this.tax               = page.getByTestId('tax-label');
            this.total             = page.getByTestId('total-label');

        }

        async goto(){
                await this.page.goto(CheckoutData.expectedURL.stepOneURL,{ waitUntil: 'domcontentloaded'});
                await expect(this.page).toHaveURL(CheckoutData.expectedURL.stepOneURL);
                
        }

        async expectLoaded(){
            await expect(this.checkoutContainer).toBeVisible();
            await expect(this.firstNameField).toBeVisible();
            await expect(this.lastNameField).toBeVisible();
            await expect(this.postalCodeField).toBeVisible();
        }
        
        async fillFirstName(firstname: string) {
            await this.firstNameField.fill(firstname);
        }
        async fillLastName(lastname: string) {
            await this.lastNameField.fill(lastname);
        }
        async fillPostalCode(postalcode: string) {
            await this.postalCodeField.fill(postalcode);
        }
       
        async clickContinueBtn(){
            await this.continueBtn.click();
        }

        async expectError(message: string){
            await expect(this.errorMessage).toBeVisible();
            await expect(this.errorMessage).toContainText(message);
        }

        async expectCheckoutCompleteMessage(message: string){
            await expect(this.checkoutMessage).toBeVisible();
            await expect (this.checkoutMessage).toContainText(message);
        }

        async clickCancelBtn(){
            await this.cancelBtn.click();
        }

        async clickFinishBtn(){
            await this.finishBtn.click();
        }

        async clickBackHomeBtn(){
            await this.backHomeBtn.click();
        }

        //step two

        getCheckOutItemByName(name: string): Locator {
            return this.checkoutItems.filter({hasText: name});
        }
        async expectItemInCheckOut(name: string) {
            await expect(this.getCheckOutItemByName(name)).toBeVisible();
        }

        //calculations
        async getItemPrices(){
            await expect(this.checkoutItems.first()).toBeVisible();
            const prices = await this.checkoutItems.getByTestId('inventory-item-price').allTextContents();

            return prices.map(text => 
                Math.round(Number(text.replace('$','').trim()) * 100)
            );
        }

        async expectItemCount(count: number){
            await expect(this.checkoutItems).toHaveCount(count);
        }

        async getItemTotal(){
            await expect(this.itemTotal).toBeVisible();
            const text = await this.itemTotal.textContent();
            return Math.round(
                Number((text ?? '').replace('Item total: $','')) * 100
            );
        }

        async getTax(){
            await expect(this.tax).toBeVisible();
            const text = await this.tax.textContent();
            return Math.round(Number(text?.match(/\$([\d.]+)/)?.[1]) * 100);
        }

        async getTotal(){
            await expect(this.total).toBeVisible();
            const text = await this.total.textContent();
            return Math.round(Number(text?.match(/\$([\d.]+)/)?.[1]) * 100);
        }
}