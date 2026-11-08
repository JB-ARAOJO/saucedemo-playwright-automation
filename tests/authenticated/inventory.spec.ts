import { test, expect } from '../../fixtures/page.fixture';
import { InventoryData } from '../../data/inventoryData';


test.describe('Inventory Page', () => {
    
    test('Verify authenticated user can access Inventory page', async ({inventoryPage}) => {
        await inventoryPage.expectLoaded();
    });

    test('Verify all inventory items are displayed', async ({inventoryPage}) => {
        await expect(inventoryPage.inventoryItems).toHaveCount(InventoryData.expectedItemCount);
        //checks image is loaded
        await expect(inventoryPage.productImages).not.toHaveCount(0);
        await inventoryPage.verifyAllProductImagesLoaded();
        //checks name and price are displayed
        await inventoryPage.expectSortedNames(InventoryData.expectedNamesAToZ);
        await inventoryPage.expectSortedPrices(InventoryData.expectedPricesItemsSortedNamesAToZ);
    });

    test('Verify Add to Cart Function', async ({inventoryPage}) => {
        await inventoryPage.expectLoaded();
        await inventoryPage.addToCart(inventoryPage.getRandomProduct());
    });

    test('Verify Remove Functionality', async ({inventoryPage}) => {
        await inventoryPage.expectLoaded();
        const product = inventoryPage.getRandomProduct();
        await inventoryPage.addToCart(product);
        await inventoryPage.removeFromCart(product);
    });

    test('Verify cart badge count', async ({inventoryPage}) => {
        await inventoryPage.expectLoaded();
        await inventoryPage.addToCart(inventoryPage.getRandomProduct());
        await inventoryPage.expectCartBadgeCount(InventoryData.expectedCartBadgeCount);
    });

    test('Cart badge shows correct count when adding multiple items', async({inventoryPage}) => {
        await inventoryPage.expectLoaded();
        await inventoryPage.addToCart(inventoryPage.getProductByName(InventoryData.featuredProduct.name));
        await inventoryPage.expectCartBadgeCount(1);
        await inventoryPage.addToCart(inventoryPage.getProductByName(InventoryData.featuredProduct2.name));
        await inventoryPage.expectCartBadgeCount(2);
        await inventoryPage.addToCart(inventoryPage.getProductByName(InventoryData.featuredProduct3.name));
        await inventoryPage.expectCartBadgeCount(3);
    })

    test('Cart badge disappears when all items are removed', async({inventoryPage}) => {
        await inventoryPage.expectLoaded();
        await inventoryPage.addToCart(inventoryPage.getProductByName(InventoryData.featuredProduct.name));
        await inventoryPage.addToCart(inventoryPage.getProductByName(InventoryData.featuredProduct2.name));
        await inventoryPage.addToCart(inventoryPage.getProductByName(InventoryData.featuredProduct3.name));
        await inventoryPage.expectCartBadgeCount(3);
        await inventoryPage.removeFromCart(inventoryPage.getProductByName(InventoryData.featuredProduct.name));
        await inventoryPage.removeFromCart(inventoryPage.getProductByName(InventoryData.featuredProduct2.name));
        await inventoryPage.removeFromCart(inventoryPage.getProductByName(InventoryData.featuredProduct3.name));
        await inventoryPage.expectNoCartBadge();
    })

    test('Verify sorting by name A to Z', async ({inventoryPage}) => {
        await inventoryPage.expectLoaded();
        await inventoryPage.sortProducts(InventoryData.sortOptions.nameAToZ);
        await inventoryPage.expectSortedNames(InventoryData.expectedNamesAToZ);
    });

    test('Verify sorting by price low to high', async ({inventoryPage}) => {
        await inventoryPage.expectLoaded();
        await inventoryPage.sortProducts(InventoryData.sortOptions.priceLowToHigh);
        await inventoryPage.expectSortedPrices(InventoryData.expectedPricesLowToHigh);
    });

    test('Verify sorting by name Z to A', async ({inventoryPage}) => {
        await inventoryPage.expectLoaded();
        await inventoryPage.sortByNameZToA();
        const productNames = await inventoryPage.getProductNames();
        // >= 2: with a single item "descending" is true for any order, the test couldn't fail
        expect(productNames.length).toBeGreaterThanOrEqual(2);

        const sortedNames = [...productNames].sort((a, b) =>
            b.localeCompare(a)
        );

        expect(productNames).toEqual(sortedNames);
    });

    test('Verify sorting by price high to low', async ({inventoryPage}) => {
        await inventoryPage.expectLoaded();
        await inventoryPage.sortByPriceHighToLow();
        const prices = await inventoryPage.getProductPrices();
        // >= 2: a one-item cart is trivially sorted every way round
        expect(prices.length).toBeGreaterThanOrEqual(2);
        // Ensure every price is a valid number, not NaN or Infinity
        for (const price of prices) {
            expect(Number.isFinite(price)).toBe(true);
        }

        // Calculate expected order
        const sortedPrices = [...prices].sort((a, b) => b - a);

        // Assert correct sorting
        expect(prices).toEqual(sortedPrices);
    });

    test('Details page shows correct name and price', async ({ inventoryPage }) => {
        await inventoryPage.expectLoaded();
        await inventoryPage.openProductDetails(
            inventoryPage.getProductByName(InventoryData.featuredProduct.name)
        );
    });

    test('Details page shows correct description', async ({ inventoryPage }) => {
        await inventoryPage.expectLoaded();
        await inventoryPage.openProductDetails(
            inventoryPage.getProductByName(InventoryData.featuredProduct.name)
        );
        await inventoryPage.expectDetailsDescription(InventoryData.featuredProduct.description)
    });

    test('Add to Cart from details page syncs the cart badge', async ({ inventoryPage }) => {
        await inventoryPage.expectLoaded();
        await inventoryPage.openProductDetails(
            inventoryPage.getProductByName(InventoryData.featuredProduct.name)
        );
        await inventoryPage.addToCartFromDetails();
    });
    test('Back to products returns to inventory', async ({ inventoryPage, cartPage }) =>{
        await inventoryPage.expectLoaded();
        await inventoryPage.addToCart(inventoryPage.getProductByName(InventoryData.featuredProduct.name))
        await inventoryPage.openProductDetails(
            inventoryPage.getProductByName(InventoryData.featuredProduct.name)
        );
        await inventoryPage.backToProducts();
        await inventoryPage.expectCartBadgeCount(1);
        await inventoryPage.openCart();
        await cartPage.expectItemInCart(InventoryData.featuredProduct.name);
        await cartPage.clickContinueShopButton();
        await inventoryPage.expectCartBadgeCount(1);
    });
});
