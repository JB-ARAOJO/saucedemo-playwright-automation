export const CheckoutData = {
    summary: { taxRate: 0.08 },
    validData:{
        firstname:'Valid',
        lastname:'User',
        postalcode:'4026',
        checkoutmessage: 'Thank you for your order!'
    },
    emptyFirstName:{
        firstname:'',
        lastname:'User',
        postalcode:'4026',
        expectedError:'Error: First Name is required'
    },
    emptyLastName:{
        firstname:'Valid',
        lastname:'',
        postalcode:'4026',
        expectedError:'Error: Last Name is required'
    },
    emptyPostalCode:{
        firstname:'Valid',
        lastname:'User',
        postalcode:'',
        expectedError:'Error: Postal Code is required'
    },
    emptyField:{
        expectedError:'Error: First Name is required'
    },


}
