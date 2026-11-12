import { Page, Locator, expect } from '@playwright/test';
import { Routes } from '../data/routes';

export class MenuPage {
    readonly menuBurgerBtn: Locator;
    readonly sidebarMenu: Locator;
    readonly allItemsOption: Locator;
    readonly aboutOption: Locator;
    readonly logoutOption: Locator;
    readonly resetOption: Locator;
    readonly closeMenuBtn: Locator;


    constructor(private page: Page){
        this.menuBurgerBtn = this.page.getByRole('button', { name: 'Open Menu' });
        this.sidebarMenu = page.locator('.bm-menu-wrap');
        this.allItemsOption = page.getByTestId('inventory-sidebar-link');
        this.aboutOption = page.getByTestId('about-sidebar-link');
        this.logoutOption = page.getByTestId('logout-sidebar-link');
        this.resetOption = page.getByTestId('reset-sidebar-link');
        this.closeMenuBtn = page.getByRole('button', { name: 'Close Menu' }); 
    }

    async expectSidebarMenu(){
        await expect(this.sidebarMenu).toBeVisible();   
    }

    async openSidebarMenu() {
        // KNOWN APP BUG (react-burger-menu): a 500ms timer armed on menu mount
        // re-applies [hidden] to .bm-menu-wrap. If our click lands inside that
        // window the menu opens and is immediately re-hidden, so it never
        // becomes visible. We cannot reach this button before the menu has
        // mounted, so waiting 600ms guarantees the click lands AFTER that
        // window every time - this is deterministic, not a blind sleep.
        await this.page.waitForTimeout(600);
        await this.menuBurgerBtn.click();
        await this.expectSidebarMenu();
    }
    
    async closeSidebarMenu() {
        await expect(this.closeMenuBtn).toBeVisible();
        await this.closeMenuBtn.click();
    }

    async selectAllItems(){
        await this.allItemsOption.click();
    }

    async selectAbout(){
        await this.aboutOption.click();
    }

    async selectLogout(){
        await this.logoutOption.click();
    }

    async selectResetAppState(){
        await this.resetOption.click();
    }

    async expectAboutPageLoaded(){
        await expect(this.page).toHaveURL(Routes.about);
    }

    async expectLogout(){
        await expect(this.page).toHaveURL(Routes.base);
        
    }

}