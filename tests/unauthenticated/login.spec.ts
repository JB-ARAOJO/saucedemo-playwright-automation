import { test, expect } from '../../fixtures/page.fixture';
import { LoginPage } from '../../pages/LoginPage';
import { LoginData } from '../../data/loginData';


test.describe('Login Feature', () => {
    
    test('Unauthenticated direct access to /inventory.html redirects to login page', async({ browser }) => {
    
        const context = await browser.newContext();
        const page = await context.newPage();
        const loginPage = new LoginPage(page);

        await page.goto('/inventory.html', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL('https://www.saucedemo.com/');
        await loginPage.expectError(LoginData.unauthenticatedAccess.expectedError);

         await context.close();
    })
    
    test('Verify Successful Login', async ({ loginPage, page }) => {
    //Fill Credentials and Click Login
    const user = LoginData.validUser;
    await loginPage.login(
           user.username,   
           user.password
        );
    await expect(page).toHaveURL(user.expectedURL);
    });

    test('Verify Unsuccessful Login', async ({ loginPage, page }) => {
    //Fill Credentials and Click Login
    const invalidUser = LoginData.invalidUser;

    await loginPage.login(
            invalidUser.username,
            invalidUser.password
        );
    await loginPage.expectError(invalidUser.expectedError);
    });

    test('Verify Empty Username', async ({ loginPage, page }) => {
    //Fill Credentials and Click Login
    const emptyUser = LoginData.emptyUser;

    await loginPage.login(
            emptyUser.username,
            emptyUser.password
        );
    await loginPage.expectError(emptyUser.expectedError);
    });

    test('Verify Empty Password', async ({ loginPage, page }) => {
    //Fill Credentials and Click Login
    const emptyPassword = LoginData.emptyPassword;

    await loginPage.login(
            emptyPassword.username,
            emptyPassword.password
        );
    await loginPage.expectError(emptyPassword.expectedError);
    });
    //----------------------------------------------------//
    test('Verify Locked Out User Login', async ({ loginPage, page }) => {
    //Fill Credentials and Click Login
    const lockedOutUser = LoginData.lockedOutUser;
    await loginPage.login(
           lockedOutUser.username,   
           lockedOutUser.password
        );
    await loginPage.expectError(lockedOutUser.expectedError);
    });
    test('Verify Problem User Login', async ({ loginPage, page }) => {
    //Fill Credentials and Click Login
    const problemUser = LoginData.problemUser;
    await loginPage.login(
           problemUser.username,   
           problemUser.password
        );
    await expect(page).toHaveURL(problemUser.expectedURL);
    });
    test('Verify Performance Glitch Login', async ({ loginPage, page }) => {
    //Fill Credentials and Click Login
    const performanceGlitchUser = LoginData.performanceGlitchUser;
    await loginPage.login(
           performanceGlitchUser.username,   
           performanceGlitchUser.password
        );
    await expect(page).toHaveURL(performanceGlitchUser.expectedURL);
    });
    test('Verify Error User Login', async ({ loginPage, page }) => {
        //Fill Credentials and Click Login
        const errorUser = LoginData.errorUser;
        await loginPage.login(
            errorUser.username,   
            errorUser.password
            );
    await expect(page).toHaveURL(errorUser.expectedURL);
    });
    test('Verify Visual User Login', async ({ loginPage, page }) => {
    //Fill Credentials and Click Login
    const visualUser = LoginData.visualUser;
    await loginPage.login(
           visualUser.username,   
           visualUser.password
        );
    await expect(page).toHaveURL(visualUser.expectedURL);
    });

    
    
});