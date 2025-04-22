import { miscMutations } from "../ngc-endpoint/graphQLMutations/miscMutations.js";
import { cartMutations } from "../ngc-endpoint/graphQLMutations/cartMutations.js";
import { checkoutMutations } from "../ngc-endpoint/graphQLMutations/checkoutMutations.js";
import { renderOrderSummary, processingOrderSummary } from "../ngc-order-summary/ngc-order-summary.js";
import { toggleMenu } from "../header/hamburger.js"

const cartId = miscMutations.getCartIDFromLS();
let selectedPaymentMethod = null;
const tokenExists = localStorage.getItem("user_token") !== null;
let userInformation = JSON.parse(localStorage.getItem("user_data"));
let userLoggedIn = userInformation !== null;
let userEmailLogged = userInformation?.email.toLowerCase()
let userLastName = userInformation?.lastname.toLowerCase()
let userFirstName = userInformation?.firstname.toLowerCase();

async function checkoutShipping(){
  const countries = await miscMutations.getCountries();
  let signInExpress = `
  <div class="sign-in-container" style="display:${tokenExists ? 'none' : 'flex'}">
    <span>Sign in for Express Checkout</span>
    <button type="submit" id="open-sign-in">Sign in</button>
  </div>
  `
  let secondPart = '';
  let firstPart = `
  <span class="ngc-checkout-span">Checkout</span>
  <div class="ngc-checkout-shipping-information">
    <div class="title-edit-row">
      <h5><span class="number">1.</span> SHIPPING INFORMATION</h5>
      <div class="edit-shipping-info">
        <svg class="edit-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shippingInformation-editIcon-1TT stroke-brand-base">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        </svg>
        <span>Edit</span>
      </div>
    </div>
    <div class="ngc-checkout-shipping-info">
      <form class="ngc-checkout-shipping-form">
        <div class="full-width-input email form-control">
          <label>Email</label>
          <input type="text" placeholder="" id="email" ${userLoggedIn ? `value="${userEmailLogged}"` : `value=""`}/>
          <small>Error Message</small>
        </div>
        <div class="full-name">
          <div class="first-name form-control">
            <label>First Name</label>
            <input type="text" placeholder="" id="firstname" ${userLoggedIn ? `value="${userFirstName}"` : `value=""`}/>
            <small>Error Message</small>
          </div>
          <div class="last-name form-control">
            <label>Last Name</label>
            <input type="text" placeholder="" id="lastname" ${userLoggedIn ? `value="${userLastName}"` : `value=""`}/>
            <small>Error Message</small>
          </div>
        </div> 
        <div class="full-width-input country">
          <label>Country</label>
          <select id="dropdown-countries">`
          countries.forEach(country => {
            secondPart += `<option value="${country.id}">`+ country.full_name_english + `</option>`
          })
          let thirdPart = `
          <select/>
        </div>
        <div class="full-width-input street-address form-control">
          <label>Street Address</label>
          <input type="text" placeholder="" id="streetaddress"/>
          <small>Error Message</small>
        </div>
        <div class="full-width-input street-address-2">
          <div>
            <label>Street Address 2</label>
            <label>Optional</label>
          </div>
          <input type="text" placeholder="" id="streetaddress2"/>
        </div>
        <div class="full-width-input state">
          <label>State</label>
          <input type="text" placeholder="" id="states"/>
          <select id="dropdown-states" class="hidden">
          <select/>
          <small>Error Message</small>        
        </div>
        <div class="full-width-input city form-control">
          <label>City</label>
          <input type="text" placeholder="" id="city"/>
          <small>Error Message</small>
        </div>
        <div class="full-width-input zip form-control">
          <label>ZIP / Postal Code</label>
          <input type="text" placeholder="" id="zipcode"/>
          <small>Error Message</small>
        </div>
        <div class="full-width-input phone-number form-control">
          <label>Phone Number</label>
          <input type="text" placeholder="" id="phonenumber"/>
          <small>Error Message</small>
        </div>
      </form>
      <div class="btn-shipping-method">
        <button type="submit" id="submitform">CONTINUE TO SHIPPING METHOD</button>
      </div>
    </div>
    <div class="shipping-details">
      <label class="email-details"></label>
      <label class="fullname-details"></label>
      <label class="phone-details"></label>
      <br>
      <label class="street1-details"></label>
      <label class="street2-details"></label>
      <label class="location-details"></label>
    </div>
  </div>
  <div class="ngc-checkout-shipping-method">
    <div id="border">
    <div class="title-edit-method">
      <h5><span class="number">2.</span> SHIPPING METHOD</h5>
      <div class="edit-shipping-info">
        <svg class="edit-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shippingInformation-editIcon-1TT stroke-brand-base">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        </svg>
        <span>Edit</span>
      </div>
    </div>
    <form class="shipping-method"> </form>
    <div class="btn-shipping-method" id="shipping-method-btn">
      <button type="submit" id="saveShippingMethod">CONTINUE TO PAYMENT INFORMATION</button>
    </div>
      <div class="method-details">
        <label id="method-title"></label>
        <label id="method-value"></label>
      </div>
    </div>
  </div>
  <div class="ngc-checkout-payment-info">
    <h5><span class="number">3.</span>PAYMENT INFORMATION</h5>
    <div class="payment-methods">
      
    </div>
  </div>
  <div class="place-order">
    <button disabled type="submit">Place Order</button>
  </div>
  `;
  return signInExpress + firstPart + secondPart + thirdPart;
}

function generateShippingUI(shippingMethods) {
  let shippingFormEle = document.querySelector('form.shipping-method');
  let shippingMethodsUI = ``;
  shippingMethods.forEach(method => {
      let value = method.amount.value > 0 ? `$${method.amount.value}` : 'FREE';
      shippingMethodsUI +=
      `<div class="radio-input">
        <input type="radio" name="shipping-radio" id="${method.method_code}" value="${method.carrier_code}">       
        <span class="radio-btn">
          <p>`+ method.method_title +`</p>
          <p>`+ value +`</p>
        </span>
      </div>`
  })
  shippingFormEle.innerHTML = shippingMethodsUI;
}

function generatePaymentMethodUI(paymentMethods) {
  let paymentFormEle = document.querySelector('.payment-methods');
  let paymentMethodsUI = ``;       
  paymentMethods.forEach(method => {
    paymentMethodsUI += `
      <div class="radio-input">
        <input type="radio" name="payment-radio" id="${method.code}">       
        <span class="radio-btn">
          ${method.title}
        </span>
      </div>`;
  });
  paymentFormEle.innerHTML = paymentMethodsUI;
  addPaymentMethodChangeEvents();
}

function addPaymentMethodChangeEvents(){
  const radioInputs = document.querySelectorAll(".payment-methods .radio-input input");
  const placeOrderCTA = document.querySelector('.place-order button');
  for (var i = 0; i < radioInputs.length; i++) {
    radioInputs[i].addEventListener('change', function() {
    const formwrapper= document.querySelector(".payment-form-wrapper");
          if (this !== selectedPaymentMethod) {
              selectedPaymentMethod = this;
              if(selectedPaymentMethod.id === "checkmo"){
                if(formwrapper) {formwrapper.style.display = 'none'};
                placeOrderCTA.disabled = false;
              }
              else{
                placeOrderCTA.disabled = true;
                appendCreditCardForm();
                addPaymentFormClickEvents();
              }
          }
      });
  }
}

function appendCreditCardForm() {
  const paymentMethodWrapper = document.querySelector(".payment-methods");
  const formwrapper= document.querySelector(".payment-form-wrapper");
  if (!formwrapper){
    const paymentFormWrapperEle = document.createElement('div');
    paymentFormWrapperEle.classList.add('payment-form-wrapper');
    paymentFormWrapperEle.innerHTML = `
    <div class="credit-card">
      <form class="payment-information">
        <div class="full-width-input cardholder-name">
          <label>Cardholder Name</label>
          <input type="text" placeholder="Cardholder Name" id="cardholder"/>
          <small>Please fill out a cardholder name.</small>
        </div>
        <div class="full-width-input card_number">
          <label>Card Number</label>
          <input placeholder="16-Digit Number" type="text"
          inputmode="numeric"
          pattern="[0-9\s]{13,19}"
          autocomplete="cc-number"
          maxlength="16" id="card-number"/>
          <small>Please fill out a card number.</small>
        </div>
        <div class="card-grid">
          <div class="full-width-input expiration_date">
            <label>Expiration Date <p>(MM/YY)</p></label>
            <input type="text" placeholder="MM/YY" id="expiration"/>
            <small>Please fill out an expiration date.</small>
          </div>
          <div class="full-width-input cvv_number">
            <label>CVV <p>(3 digits)</p></label>
            <input placeholder="..." id="cvv" type="password"
            inputmode="numeric"
            pattern="[0-9\s]{13,19}"
            autocomplete="cc-number"
            maxlength="3"/>
            <small>Please fill out a CVV.</small>
          </div>
        </div>
      </form>
    </div>`;
    paymentMethodWrapper.append(paymentFormWrapperEle);
  }else{
    formwrapper.style.display = 'block';
  }
}

function addPaymentFormClickEvents() {
  let cardHolderInput = document.querySelector('#cardholder');
  let cardNumberInput = document.querySelector('#card-number');
  let expirationInput = document.querySelector('#expiration');
  let paymentInfoForm = document.querySelector('.payment-information');
  let cvvInput = document.querySelector('#cvv');
  let creditCard = document.querySelector('.credit-card');
  let cardHolder, cardNumber, cardExp, cardCvv = '';
  paymentInfoForm.addEventListener('click', (event) => {
    if(cardHolderInput.contains(event.target) || cardNumberInput.contains(event.target)
    || expirationInput.contains(event.target) || cvvInput.contains(event.target)){
      return;
    } else {
        let cardHolderVariable = cardHolderInput.parentElement;
        if(!cardHolderVariable.classList.contains('error')
         && cardHolderInput.value === '') cardHolderVariable.className += " form-control error";
        let cardNumberVariable = cardNumberInput.parentElement;
        if(!cardNumberVariable.classList.contains('error')
        && cardNumberInput.value === '') cardNumberVariable.className += " form-control error";
        let exp = expirationInput.parentElement;
        if(!exp.classList.contains('error')
        && expirationInput.value === '') exp.className += " form-control error";
        let cvvI = cvvInput.parentElement;
        if(!cvvI.classList.contains('error')
        && cvvInput.value === '') cvvI.className += " form-control error";
    }
  })

  cardHolderInput.addEventListener('input', (event) => {
    let cardHolderVar = cardHolderInput.parentElement;
    if(cardHolderVar.classList.contains('error')) cardHolderVar.classList.remove("error");
    cardHolder = event.target.value;
  });

  cardNumberInput.addEventListener('input', (event) => {
    let cardNumberVar = cardNumberInput.parentElement;
    if(cardNumberVar.classList.contains('error')) cardNumberVar.classList.remove("error");
    if(event.target.value.length === 16) {
      cardNumber = event.target.value;
    }
  });

  cvvInput.addEventListener('input', (event) => {
    let cvvI = cvvInput.parentElement;
    if(cvvI.classList.contains('error')) cvvI.classList.remove("error");
    if(event.target.value.length === 3) {
      cardCvv = event.target.value;
    }
  });

  expirationInput.addEventListener('input', (event) => {
    let exp = expirationInput.parentElement;
    if(exp.classList.contains('error')) exp.classList.remove("error");
    event.target.value = event.target.value.replace(
      /[^0-9]/g, '' // To allow only numbers
      ).replace(
          /^([2-9])$/g, '0$1' // To handle 3 > 03
      ).replace(
          /^(1{1})([3-9]{1})$/g, '0$1/$2' // 13 > 01/3
      ).replace(
          /^0{1,}/g, '0' // To handle 00 > 0
      ).replace(
          /^([0-1]{1}[0-9]{1})([0-9]{1,2}).*/g, '$1/$2' // To handle 113 > 11/3
    );
    cardExp = event.target.value;
  });

  creditCard.style.display = 'flex';
}

function inProgressCTA(message="Please wait..."){
  const placeOrder = document.querySelector('.place-order');
  const placeOrderCTA = document.querySelector('.place-order button');
  placeOrderCTA.innerHTML = message;
  placeOrderCTA.classList.add('processing');
}

export default async function decorate(block) {
  const orderSummaryEle = document.querySelector(".ngc-order-summary-wrapper");
  orderSummaryEle.style.display = 'none';
  block.innerHTML = '<p>There are no items in your cart.</p><a href="/product-list/">Continue Shopping</a>';

  if(cartId){
    const savedInfoOnCart = await checkoutMutations.getCartCheckoutDetails(cartId);
  /*   
    const emailAddressOnCart = savedInfoOnCart.email;
    const shippingAddressOnCart = savedInfoOnCart.shipping_addresses[0];
    const availbleShippingMethodsOnCart = shippingAddressOnCart?.available_shipping_methods;
    const selectedShippingMethodOnCart = shippingAddressOnCart?.selected_shipping_method;
    const availblePaymentMethodsOnCart = savedInfoOnCart.available_payment_methods;
    const selectedPaymentMethodOnCart = savedInfoOnCart.selected_payment_method;
  */

    const section = document.createElement("section");
    section.classList.add('ngc-checkout-information');
    section.innerHTML = 
      await savedInfoOnCart.items.length
        ? await checkoutShipping() 
        : '<p>There are no items in your cart.</p><a href="/product-list/">Continue Shopping</a>';
    block.textContent = "";
    block.innerHTML = section.innerHTML;

    if(savedInfoOnCart.items.length){
      orderSummaryEle.style.display = 'block';
      const email = document.querySelector("#email");
      const firstName = document.querySelector("#firstname");
      const lastName = document.querySelector("#lastname");
      const streetAddress = document.querySelector("#streetaddress");
      const streetAddress2 = document.querySelector("#streetaddress2");
      const city = document.querySelector("#city");
      const zipCode = document.querySelector("#zipcode");
      const phoneNumber = document.querySelector("#phonenumber");
      const submitShippingInfo = document.querySelector("#submitform");
      const saveShippingMethod = document.getElementById('saveShippingMethod');
      const infoContainer = document.querySelector(".ngc-checkout-shipping-info");
      const infoContainerParent = document.querySelector(".ngc-checkout-shipping-information");
      const editShippingInfoBtn = document.querySelector(".title-edit-row .edit-shipping-info");
      const editShippingMethod = document.querySelector(".title-edit-method .edit-shipping-info");
      const showShippingInfoDetails = document.querySelector(".shipping-details");
      const country = document.getElementById('dropdown-countries');
      const statesInput = document.getElementById('states');
      const statesSelect = document.getElementById('dropdown-states');
      const numberShippingInf = document.querySelector('.title-edit-row .number');
      const activeShippingMethod = document.querySelector('.shipping-method');
      const hideNumber = document.querySelector('.title-edit-method .number');
      const showMethodBtn = document.getElementById('shipping-method-btn');
      const methodDetails = document.querySelector('.method-details');
      const methodTitle = document.getElementById('method-title');
      const methodValue = document.getElementById('method-value');
      const borderMethod = document.querySelector('#border');
      const paymentInfo = document.querySelector('.payment-methods');
      const paymentInfoTitle = document.querySelector('.ngc-checkout-payment-info h5 .number');
      const paymentInfoWrapper = document.querySelector('.ngc-checkout-payment-info');
      const placeOrder = document.querySelector('.place-order');
      const placeOrderCTA = document.querySelector('.place-order button');
      const signInExp = document.querySelector('#open-sign-in');

      let cityDetail, stateDetail, zipDetail, countryDetail = '';
      let methodChosen = '';
      let flag = 0;
      let chosenCountry = country.value;
      filterByCountry(chosenCountry);
      let shippingAddressObj = {};
      
      signInExp.addEventListener('click', () => {
        const screenView = window.innerWidth;
        const utilityMenu = document.querySelector('.main-navigation-utility-menu');
        const displayMobForm = document.querySelector('.sign-in-info-mobile');
        const signInDropdown = document.querySelector('.sign-in');
        const signInBtn = document.querySelector('.nav-tools p:nth-child(2)');

        if(screenView <= 640){
          toggleMenu();
          utilityMenu.style.display = 'none';
          displayMobForm.style.display = 'grid';
        } else {
          signInDropdown.classList.toggle('show');
          if(signInDropdown.classList.contains('show')) signInBtn.style.color = 'rgb(41, 84, 255)';
          else signInBtn.style.color = 'black';
        }
      })

      editShippingInfoBtn.addEventListener("click", () => {
        if(infoContainerParent.classList.contains("hidden")){
          infoContainer.style.display = 'grid';
          infoContainerParent.classList.remove("hidden");
          editShippingInfoBtn.classList.remove("show");
          showShippingInfoDetails.classList.remove("show");
        }
      })

      editShippingMethod.addEventListener('click', () => {
        showShippingMethods();
        editShippingMethod.classList.remove("show");
        saveShippingMethod.style.display = 'flex';
        methodDetails.classList.remove('show');
      })

      country.addEventListener('change', (event) => {
        chosenCountry = event.target.value;
        filterByCountry(chosenCountry);
      })

      submitShippingInfo.addEventListener('click', async (e) => {
        e.preventDefault();
        let validateForm = handleInput();
        if(validateForm) {
          processingOrderSummary(true);
          const cart = await checkoutMutations.setGuestShippingAddress(cartId, shippingAddressObj.email, shippingAddressObj.address);
          const shippingMethods = await cart.shipping_addresses[0].available_shipping_methods;
          renderOrderSummary();
          generateShippingUI(shippingMethods);
          hideShippingInfo();
          removeColorInputEdit();
          if(methodTitle.innerText === '' && methodValue.innerText === '') showShippingMethods(); //revisit the logic
          // showShippingMethods();
          await checkoutMutations.setGuestBillingAddress(cartId, shippingAddressObj.address, true);
        }
      });

      saveShippingMethod.addEventListener('click', async () => {
        const methodRadios = activeShippingMethod.querySelectorAll('input');
        const removeBorderSM = document.querySelector('.ngc-checkout-shipping-method');
        let chosenCarrierCode = '';
        methodRadios.forEach(radio => {
          if (radio.checked) { methodChosen = radio.id;  chosenCarrierCode = radio.value};
        })
        if (methodChosen !== '') {
          const shippingMethodObj = {
            "carrier_code": chosenCarrierCode,
            "method_code": methodChosen
          };
          processingOrderSummary(true);
          const shippingSetRes = await checkoutMutations.setShippingMethod(cartId, shippingMethodObj);
          renderOrderSummary();
          generatePaymentMethodUI(shippingSetRes.available_payment_methods);
          hideShippingMethod();
          showPaymentInformation();
          removeBorderSM.style.borderBottom = '0';
        }
      });

      placeOrderCTA.addEventListener('click', async () => {
        const selectedPaymentMethod = paymentInfoWrapper.querySelector("input[name=payment-radio]:checked").id;
        if(selectedPaymentMethod == 'checkmo'){
          placeOrderCTA.disabled = true;
          inProgressCTA("Processing Payment...");
          const paymentResponse = await checkoutMutations.setPaymentMethod(cartId, selectedPaymentMethod);
          if(!paymentResponse.errors){
            inProgressCTA("Placing your Order...");
            const placeOrderResponse = await checkoutMutations.placeOrder(cartId);
            if(!placeOrderResponse.errors){
              miscMutations.removeCartIDFromLS();
              inProgressCTA("redirecting...");
              window.location = `/success?order=${placeOrderResponse}`
            }
          }
        }
      })

      function showPaymentInformation(){
        paymentInfoWrapper.classList.add('border');
        paymentInfoTitle.style.display = 'none';
        paymentInfo.style.display = 'flex';
        placeOrder.style.display = 'flex';
      }

      function hideShippingMethod(){
        saveShippingMethod.style.display = 'none';
        activeShippingMethod.style.display = 'none';
        showMethodBtn.style.display = 'none';
        editShippingMethod.classList.add('show');
        methodDetails.classList.add('show');
        let radioInfoTitle = document.querySelector(`#${methodChosen}`).nextElementSibling.children;
        methodTitle.innerHTML = radioInfoTitle[0].innerText;
        methodValue.innerHTML = radioInfoTitle[1].innerText;
      }

      function showShippingMethods(){
        borderMethod.classList.add('show');
        activeShippingMethod.style.display = 'flex';
        hideNumber.style.display = 'none';
        showMethodBtn.style.display = 'flex';
      }

      function removeColorInputEdit(){
        let formControlSuccess = document.querySelectorAll('.form-control.success');
        let formControlError = document.querySelectorAll('.form-control.error');

        formControlSuccess.forEach(successInput => {
          successInput.classList.remove("success");
        });
        
        formControlError.forEach(errorInput => {
          errorInput.classList.remove("error");
        });
      }

      async function filterByCountry(countryId){
        const regions = await miscMutations.getRegionsByCountry(countryId);
        if(regions !== null){
          statesSelect.innerHTML = '';
          regions.forEach(region => {
            statesInput.style.display = 'none';
            statesSelect.classList.remove("hidden");
            statesSelect.innerHTML += `<option value='${region.id}'>`+ region.name +`</option>`;
          })
        } else{
          statesInput.style.display = 'flex';
          statesSelect.classList.add("hidden");
          statesInput.value = '';
        }
      }

      function hideShippingInfo(){
        infoContainer.style.display = 'none';
        infoContainerParent.classList.add("hidden");
        editShippingInfoBtn.classList.add("show");
        showShippingInfoDetails.classList.add("show");
        numberShippingInf.style.display = 'none';
      }

      function handleInput() {
        const isStateInput = statesSelect.classList.contains('hidden');
        let regionByCountry = isStateInput ? statesInput : statesSelect;
        const formFields = [email, firstName, lastName, streetAddress, city, zipCode, phoneNumber, regionByCountry, country];
        flag = 0;
        formFields.forEach((field) => {
          const fieldValue = field.value.trim();
          if (field === email) {
            if (fieldValue === "") {
              setErrorFor(email, "Is required.");
            } else if (!isEmail(fieldValue)) {
              setErrorFor(email, "Email is not valid");
            } else {
              setSuccessFor(email);
            }
          }else {
            if (fieldValue === "") {
              setErrorFor(field, "Is required.");
            } else {
              setSuccessFor(field);
            }
          }
        })

        let setStreet2Detail = document.querySelector(".shipping-details .street2-details");
        if(streetAddress2.value.trim() !== '') {
          if(streetAddress2.id === 'streetaddress2'){
            setStreet2Detail.innerHTML = streetAddress2.value;
            setStreet2Detail.style.display = 'flex'
          } 
        } else if(streetAddress2.value.trim() === ''){
          setStreet2Detail.innerHTML = '';
          setStreet2Detail.style.display = 'none'
        }
        
        shippingAddressObj = {
          email: email.value,
          address: {
            firstname: firstName.value.trim(),
            lastname: lastName.value.trim(),
            street: [streetAddress.value.trim(), streetAddress2.value.trim()],
            city: city.value.trim(),
            postcode: zipCode.value.trim(),
            telephone: phoneNumber.value.trim(),
            country_code: country.value,
          }
        }

        isStateInput
          ? shippingAddressObj.address.region = statesInput.value.trim()
          :shippingAddressObj.address.region_id = regionByCountry.value;

        return flag === formFields.length;
      }

      function setErrorFor(input, message) {
        let formControl = input.parentElement;
        formControl.className += " form-control error";
        let small = formControl.querySelector("small");
        small.innerText = message;
      }

      function setSuccessFor(input) {
        let formControl = input.parentElement;
        formControl.className += " form-control success";
        flag += 1;
        if(input.id === 'email'){
          const setEmailDetail = document.querySelector(".shipping-details .email-details");
          setEmailDetail.innerHTML = input.value;
        } 
        else if(input.id === 'firstname'){
          const setfirstNameDetail = document.querySelector(".shipping-details .fullname-details");
          setfirstNameDetail.innerHTML = `${input.value} `;
        } 
        else if(input.id === 'lastname'){
          const setLastNameDetail = document.querySelector(".shipping-details .fullname-details");
          setLastNameDetail.innerHTML += input.value;
        } 
        else if(input.id === 'streetaddress'){
          const setStreetDetail = document.querySelector(".shipping-details .street1-details");
          setStreetDetail.innerHTML = input.value;
        } 
        else if(input.id === 'phonenumber'){
          const setNumberDetail = document.querySelector(".shipping-details .phone-details");
          setNumberDetail.innerHTML = input.value;
        } 
        if(input.id === 'city' || input.id === 'dropdown-states' || input.id === 'states'
        || input.id === 'zipcode' || input.id === 'dropdown-countries'){
          let setLocationDetail = document.querySelector(".shipping-details .location-details");
          if(input.id === 'city'){
            cityDetail = input.value;
          } 
          else if(input.id === 'dropdown-states'){
            stateDetail = input.selectedOptions[0].text;
          } 
          else if(input.id === 'states') {
            stateDetail = input.value;
          }
          else if(input.id === 'zipcode'){
            zipDetail = input.value;
          }
          else if(input.id === 'dropdown-countries'){
            countryDetail = input.value;
          }
          setLocationDetail.innerHTML = `${cityDetail}, ${stateDetail} ${zipDetail} - ${countryDetail}`;
        }
      }

      // To check if email is valid or not ?
      function isEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
      }
    }
  }


}
