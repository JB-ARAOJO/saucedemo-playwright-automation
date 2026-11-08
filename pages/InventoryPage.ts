import { Page, Locator, expect } from '@playwright/test';
import { InventoryData } from '../data/inventoryData';

export class InventoryPage {

    readonly inventoryContainer: Locator;
    readonly inventoryList: Locator;
    readonly inventoryItems: Locator;
    readonly cartBadge: Locator;
    readonly sortSelect: Locator;
    readonly detailsContainer: Locator;
    readonly detailsName: Locator;
    readonly detailsPrice: Locator;
    readonly detailsDesc: Locator;
    readonly detailsAddToCart: Locator;
    readonly backToProductsBtn: Locator;
    readonly productPrices: Locator;
    readonly productNames: Locator;
    readonly sortDropdown: Locator;
    readonly productImages: Locator;

    constructor(private page: Page) {
        this.inventoryContainer = page.getByTestId('inventory-container');
        this.inventoryList     = page.getByTestId('inventory-list');
        this.inventoryItems    = page.getByTestId('inventory-item');
        this.cartBadge         = page.getByTestId('shopping-cart-badge');
        this.sortSelect        = page.getByTestId('product-sort-container');
        this.detailsContainer  = page.locator('.inventory_details_desc_container');
        this.detailsName       = this.detailsContainer.getByTestId('inventory-item-name');
        this.detailsPrice      = this.detailsContainer.getByTestId('inventory-item-price');
        this.detailsDesc       = this.detailsContainer.getByTestId('inventory-item-desc');
        this.detailsAddToCart  = this.detailsContainer.getByTestId('add-to-cart');
        this.backToProductsBtn = page.getByTestId('back-to-products');
        this.productPrices     = page.getByTestId('inventory-item-price');
        this.productNames      = page.getByTestId('inventory-item-name');
        this.sortDropdown      = page.getByTestId('product-sort-container');
        this.productImages     = page.locator('.inventory_item_img img');
    }

    async goto() {
        await this.page.goto('/inventory.html', { waitUntil: 'domcontentloaded' });
        await expect(this.page).toHaveURL(InventoryData.expectedURL);
    }

    async expectLoaded() {
        await expect(this.page).toHaveURL(InventoryData.expectedURL);
        await expect(this.inventoryContainer).toBeVisible();
        await expect(this.inventoryList).toBeVisible();
        await expect(this.inventoryItems).toHaveCount(InventoryData.expectedItemCount);
    }
    
    async verifyAllProductImagesLoaded() {
        const count = await this.productImages.count();

        for (let i = 0; i < count; i++) {
            await expect.poll(async () => {
                return await this.productImages.nth(i).evaluate(
                     (img: HTMLImageElement) =>
                         img.complete && img.naturalWidth > 0
                    );
                }).toBeTruthy();
                                            
        }
    }
    getRandomProduct(): Locator {
        const index = Math.floor(Math.random() * InventoryData.expectedItemCount);
        return this.inventoryItems.nth(index);
    }

    getProductByName(name: string): Locator {
        return this.inventoryItems.filter({ hasText: name });
    }

    async getProductName(product: Locator): Promise<string> {
        const productName = await product.getByTestId('inventory-item-name').innerText();
        return productName;
    }

    async getProductPrices(): Promise<number[]> {
        const priceTexts = await this.productPrices.allTextContents();

        return priceTexts.map(price =>
            Number(price.replace('$', '').trim())
        );
    }

    async getProductNames(): Promise<string[]> {
        return this.productNames.allTextContents();
    }

    // Clicks "Add to cart" and verifies the button flipped to "Remove"
    async addToCart(product: Locator) {
        await product.locator('button[data-test^="add-to-cart"]').click();
        await expect(product.locator('button[data-test^="remove"]')).toBeVisible();
    }

    async assertAddToCartButtonIsVisible(name: string) {
        const product = this.getProductByName(name);

        await expect(
            product.locator('button[data-test^="add-to-cart"]')
        ).toBeVisible();
    }

    // Clicks "Remove" and verifies the button flipped back to "Add to cart"
    async removeFromCart(product: Locator) {
        await product.locator('button[data-test^="remove"]').click();
        await expect(product.locator('button[data-test^="add-to-cart"]')).toBeVisible();
    }

    async expectCartBadgeCount(n: number) {
        await expect(this.cartBadge).toHaveText(String(n));
    }

    async expectNoCartBadge() {
        await expect(this.cartBadge).toBeHidden();
    }

    // ---- Sorting ----

    async sortByPriceHighToLow() {
        await expect(this.sortDropdown).toBeVisible();
        await this.sortDropdown.selectOption('hilo');
    }

    async sortByNameZToA() {
        await this.sortDropdown.selectOption('za');
    }

    async sortProducts(option: string) {
        await this.sortSelect.selectOption(option);
    }

    async expectSortedNames(expectedNames: string[]) {
        const names = await this.inventoryItems.getByTestId('inventory-item-name').allInnerTexts();
        expect(names).toEqual(expectedNames);
    }

    async expectSortedPrices(expectedPrices: string[]) {
        const prices = await this.inventoryItems.getByTestId('inventory-item-price').allInnerTexts();
        expect(prices).toEqual(expectedPrices);
    }

    // ---- Product details ----
    async expectDetailsDescription(expected: string) {
        await expect(this.detailsDesc).toHaveText(expected);
    }

    async addToCartFromDetails() {
        await this.detailsAddToCart.click();
        await expect(this.detailsContainer.getByTestId('remove')).toBeVisible();   // button flipped
        await this.expectCartBadgeCount(InventoryData.expectedCartBadgeCount);
    }

    async backToProducts() {
        await this.backToProductsBtn.click();
        await expect(this.page).toHaveURL(InventoryData.expectedURL);
    }
    // Opens the details page and verifies it shows the same product
    async openProductDetails(product: Locator) {
        const productName  = await this.getProductName(product);
        const productPrice = await product.getByTestId('inventory-item-price').innerText();
        await product.getByTestId('inventory-item-name').click();
        await expect(this.page).toHaveURL(InventoryData.expectedDetailsURL);
        await expect(this.detailsName).toHaveText(productName);
        await expect(this.detailsPrice).toHaveText(productPrice);
    }
    // Cart Journey
    async openCart(){
        await this.page.getByTestId('shopping-cart-link').click();
        await expect(this.page).toHaveURL(/cart\.html/);
    }

}
