import { test, expect } from '../../fixtures/page.fixture';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { CheckoutData } from '../../data/checkoutData';
import { InventoryData } from '../../data/inventoryData';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';


//helper checkout journey
async function startCheckoutAtStepOne(inventoryPage: InventoryPage, cartPage: CartPage, checkoutPage: CheckoutPage) {
        await inventoryPage.expectLoaded();
        await inventoryPage.addToCart(inventoryPage.getProductByName(InventoryData.featuredProduct.name))
        await inventoryPage.openCart();
        await cartPage.expectItemInCart(InventoryData.featuredProduct.name);
        await cartPage.clickCheckoutButton();
        await expect(checkoutPage.page).toHaveURL(CheckoutData.expectedURL.stepOneURL);
        await checkoutPage.expectLoaded();
} 
async function submitValidDetails(checkoutPage: CheckoutPage){
        const checkoutData = CheckoutData.validData;
        //fill checkout details
        await checkoutPage.fillFirstName(checkoutData.firstname);
        await checkoutPage.fillLastName(checkoutData.lastname);
        await checkoutPage.fillPostalCode(checkoutData.postalcode);
        await checkoutPage.clickContinueBtn();
        await expect(checkoutPage.page).toHaveURL(CheckoutData.expectedURL.stepTwoURL);
}
async function addtoCartTwoItems(inventoryPage: InventoryPage, cartPage: CartPage, checkoutPage: CheckoutPage){
        await inventoryPage.expectLoaded();
        await inventoryPage.addToCart(inventoryPage.getProductByName(InventoryData.featuredProduct.name))
        await inventoryPage.addToCart(inventoryPage.getProductByName(InventoryData.featuredProduct2.name))
        await inventoryPage.openCart();
        await cartPage.expectItemInCart(InventoryData.featuredProduct.name);
        await cartPage.expectItemInCart(InventoryData.featuredProduct2.name);
        await cartPage.clickCheckoutButton();
        await expect(checkoutPage.page).toHaveURL(CheckoutData.expectedURL.stepOneURL);
        await checkoutPage.expectLoaded();
}

test.describe('CheckOut Page', () =>{
    //Validation tests
    test('Verify clicking continue with empty fields display error message',async ({checkoutPage})=>{
        const checkoutData = CheckoutData.emptyField;
        
        await checkoutPage.goto();
        await checkoutPage.expectLoaded();
        await checkoutPage.clickContinueBtn();
        await checkoutPage.expectError(checkoutData.expectedError);
    })

    test('Validate Empty First Name', async({checkoutPage}) => {
        const checkoutData = CheckoutData.emptyFirstName;

        await checkoutPage.goto();
        await checkoutPage.expectLoaded();
        await checkoutPage.fillFirstName(checkoutData.firstname);
        await checkoutPage.fillLastName(checkoutData.lastname);
        await checkoutPage.fillPostalCode(checkoutData.postalcode);
        await checkoutPage.clickContinueBtn();
        await checkoutPage.expectError(checkoutData.expectedError);
    })
    test('Validate Empty Last Name', async({checkoutPage}) => {
        const checkoutData = CheckoutData.emptyLastName;

        await checkoutPage.goto();
        await checkoutPage.expectLoaded();
        await checkoutPage.fillFirstName(checkoutData.firstname);
        await checkoutPage.fillLastName(checkoutData.lastname);
        await checkoutPage.fillPostalCode(checkoutData.postalcode);
        await checkoutPage.clickContinueBtn();
        await checkoutPage.expectError(checkoutData.expectedError);
    })

    test('Validate Empty Postal Code', async({checkoutPage}) => {
        const checkoutData = CheckoutData.emptyPostalCode;

        await checkoutPage.goto();
        await checkoutPage.expectLoaded();
        await checkoutPage.fillFirstName(checkoutData.firstname);
        await checkoutPage.fillLastName(checkoutData.lastname);
        await checkoutPage.fillPostalCode(checkoutData.postalcode);
        await checkoutPage.clickContinueBtn();
        await checkoutPage.expectError(checkoutData.expectedError);
    })

    //checkout step one
    test('Verify checkout step one with valid inputs',async ({inventoryPage, cartPage, checkoutPage})=>{  
        await startCheckoutAtStepOne(inventoryPage, cartPage, checkoutPage);
        await submitValidDetails(checkoutPage);
    })

    //checkout step two
    test('Verify checkout step two with valid inputs', async ({inventoryPage, cartPage, checkoutPage}) => {
        const checkoutData = CheckoutData.validData;
        await startCheckoutAtStepOne(inventoryPage, cartPage, checkoutPage);
        await submitValidDetails(checkoutPage);
        await checkoutPage.expectItemInCheckOut(InventoryData.featuredProduct.name);
        await checkoutPage.clickFinishBtn();
        await expect(checkoutPage.page).toHaveURL(CheckoutData.expectedURL.checkOutCompleteURL);
        await checkoutPage.expectCheckoutCompleteMessage(checkoutData.checkoutmessage);
    })
    // cancel functions
    test('Verify cancel button working',async ({inventoryPage, cartPage, checkoutPage}) =>{
        await startCheckoutAtStepOne(inventoryPage, cartPage, checkoutPage);
        await checkoutPage.clickCancelBtn();
        await expect(checkoutPage.page).toHaveURL(InventoryData.expectedURL.cartURL);
        await cartPage.expectItemInCart(InventoryData.featuredProduct.name);
    })

    test('Verify overview cancel button returns to inventory with cart intact',async ({inventoryPage, cartPage, checkoutPage}) =>{
        await startCheckoutAtStepOne(inventoryPage, cartPage, checkoutPage);
        await submitValidDetails(checkoutPage);
        await checkoutPage.clickCancelBtn();
        await expect(checkoutPage.page).toHaveURL(InventoryData.expectedURL.inventoryURL);
        await inventoryPage.expectCartBadgeCount(1); 
    })
    
    test('Verify confirmation page returns to inventory with empty cart',async ({inventoryPage, cartPage, checkoutPage}) => {
        await startCheckoutAtStepOne(inventoryPage, cartPage, checkoutPage);
        await submitValidDetails(checkoutPage);
        await checkoutPage.clickFinishBtn();
        await expect(checkoutPage.page).toHaveURL(CheckoutData.expectedURL.checkOutCompleteURL);
        await checkoutPage.expectCheckoutCompleteMessage(CheckoutData.validData.checkoutmessage);
        await checkoutPage.clickBackHomeBtn();
        await expect(checkoutPage.page).toHaveURL(InventoryData.expectedURL.inventoryURL);
        await inventoryPage.expectNoCartBadge();
    })

    // calculations

    test('Verify item total equals the sum of item prices', async({inventoryPage, cartPage, checkoutPage}) => {
        await addtoCartTwoItems(inventoryPage, cartPage, checkoutPage);
        await submitValidDetails(checkoutPage);
        await checkoutPage.expectItemCount(2);
        const prices = await checkoutPage.getItemPrices();
        //calculate item prices
        const calculatedItemTotal = prices.reduce(
            (sum, price) => sum + price,
            0
        );

        // Get the displayed amounts.
        const displayedItemTotal = await checkoutPage.getItemTotal();

        //Assert item subtotal
        expect(displayedItemTotal).toBe(calculatedItemTotal);

    })

    test('Verify Tax and grand total calculated correctly', async({inventoryPage, cartPage, checkoutPage}) => {
        await addtoCartTwoItems(inventoryPage, cartPage, checkoutPage);
        await submitValidDetails(checkoutPage);
        await checkoutPage.expectItemCount(2);
        const prices = await checkoutPage.getItemPrices();
        //calculate item prices
        const calculatedItemTotal = prices.reduce(
            (sum, price) => sum + price,
            0
        );

        // Get the displayed amounts.
        const displayedItemTotal = await checkoutPage.getItemTotal();
        const tax = await checkoutPage.getTax();
        const expectedTax = Math.round(calculatedItemTotal * CheckoutData.summary.taxRate);
        const displayedTotal = await checkoutPage.getTotal();

        //Assert item subtotal
        expect(tax).toBe(expectedTax);
        expect(displayedItemTotal).toBe(calculatedItemTotal);
        
        // Assert final total, including tax.
        expect(displayedTotal).toBe(calculatedItemTotal + tax);
    })

})