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
        lastname:'Villalobos',
        postalcode:'4026',
        expectedError:'Error: First Name is required'
    },
    emptyLastName:{
        firstname:'Sofie',
        lastname:'',
        postalcode:'4026',
        expectedError:'Error: Last Name is required'
    },
    emptyField:{
        expectedError:'Error: First Name is required'
    },


}
