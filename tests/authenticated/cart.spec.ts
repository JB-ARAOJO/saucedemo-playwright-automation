import { test, expect } from '../../fixtures/page.fixture';
import { InventoryData } from '../../data/inventoryData';


test.describe('Cart Page', () =>{
   
    test('Verify product displayed in cart page', async ({ inventoryPage, cartPage,}) => {
        await inventoryPage.addToCart(inventoryPage.getProductByName(InventoryData.featuredProduct.name)); 
        await inventoryPage.openCart();                                                                    
        await cartPage.expectItemInCart(InventoryData.featuredProduct.name); 
        await cartPage.expectItemPriceInCart(InventoryData.featuredProduct.name, InventoryData.featuredProduct.price); 
    })
    

     test('Verify Remove Functionality', async ({inventoryPage, cartPage}) => {
        await inventoryPage.addToCart(inventoryPage.getProductByName(InventoryData.featuredProduct.name));
        await inventoryPage.openCart();
        await cartPage.removeItem(InventoryData.featuredProduct.name);
        await cartPage.expectCartEmpty();
    })
     test('Verify continue shop button navigates user to inventory page', async ({cartPage}) => {
        await cartPage.goto();
        await cartPage.clickContinueShopButton();
        await expect(cartPage.page).toHaveURL(/inventory\.html/);
    })
     test('Verify user can check out item', async ({inventoryPage, cartPage}) => {
        await inventoryPage.addToCart(inventoryPage.getProductByName(InventoryData.featuredProduct.name));
        await inventoryPage.openCart();
        await cartPage.clickCheckoutButton();
        await expect(cartPage.page).toHaveURL(/checkout-step-one\.html/);
    })

    test('Verify checkout attempt with no items in cart', async ({cartPage}) => {
        await cartPage.goto();
        await cartPage.clickCheckoutButton();
        await expect(cartPage.page).toHaveURL(/checkout-step-one\.html/);
    })

})
