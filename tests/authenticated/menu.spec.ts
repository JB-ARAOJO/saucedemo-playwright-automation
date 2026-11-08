import { test, expect } from '../../fixtures/page.fixture';
import { InventoryData } from '../../data/inventoryData';
import { InventoryPage } from '../../pages/InventoryPage';

test.describe('Menu Page', () => {

    test('Logout from burger menu returns to login page', async ({inventoryPage, menuPage}) => {
        await inventoryPage.expectLoaded();
        await menuPage.openSidebarMenu();
        await menuPage.expectSidebarMenu();
        await menuPage.selectLogout();
        await menuPage.expectLogout();
    })

    test('Reset option clears cart badge and restores button states', async({inventoryPage, menuPage}) => {
        await inventoryPage.expectLoaded();
        await inventoryPage.addToCart(inventoryPage.getProductByName(InventoryData.featuredProduct.name))
        await inventoryPage.expectCartBadgeCount(1);
        await menuPage.openSidebarMenu();
        await menuPage.expectSidebarMenu();
        await menuPage.selectResetAppState();
        await menuPage.closeSidebarMenu();
        await inventoryPage.expectNoCartBadge();
        test.fail();
        await inventoryPage.assertAddToCartButtonIsVisible(InventoryData.featuredProduct.name);
    })

    test('All Items option navigates back to inventory', async({inventoryPage, menuPage}) => {
        await inventoryPage.expectLoaded();
        await inventoryPage.openProductDetails(
            inventoryPage.getProductByName(InventoryData.featuredProduct.name)
        );
        await menuPage.openSidebarMenu();
        await menuPage.selectAllItems();
        await inventoryPage.expectLoaded();
    })

    test('Verify About page will navigate user to saucelabs', async({inventoryPage, menuPage}) => {
        await inventoryPage.expectLoaded();
        await menuPage.openSidebarMenu();
        await menuPage.selectAbout();
        await menuPage.expectAboutPageLoaded();
    })


})