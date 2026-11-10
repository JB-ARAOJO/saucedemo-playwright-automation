export const LoginData = {
    validUser: {
        username: 'standard_user',
        password: 'secret_sauce',
        expectedURL: '/inventory.html'
    },
    invalidUser: {
        username: 'invalid_user',
        password: 'secret_sauce',
        expectedError: 
            'Username and password do not match any user in this service' 
    },
    emptyUser: {
        username: '',
        password: 'secret_sauce',
        expectedError:
            'Epic sadface: Username is required'
    },
    emptyPassword: {
        username: 'standard_user',
        password: '',
        expectedError: 
            'Epic sadface: Password is required'
    },
    lockedOutUser: {
        username: 'locked_out_user',
        password: 'secret_sauce',
        expectedError: 
            'Epic sadface: Sorry, this user has been locked out.'
    },
    problemUser: {
        username: 'problem_user',
        password: 'secret_sauce',
        expectedURL: '/inventory.html'
    },
    performanceGlitchUser: {
        username: 'performance_glitch_user',
        password: 'secret_sauce',
        expectedURL: '/inventory.html'
    },
    errorUser: {
        username: 'error_user',
        password: 'secret_sauce',
        expectedURL: '/inventory.html'
    },
    visualUser: {
        username: 'visual_user',
        password: 'secret_sauce',
        expectedURL: '/inventory.html'
    },
    unauthenticatedAccess:{
        expectedError: "Epic sadface: You can only access '/inventory.html' when you are logged in.",
        loginURL: 'https://www.saucedemo.com',
        inventoryURL: '/inventory.html',
    }
};