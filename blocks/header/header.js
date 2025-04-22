import { getMetadata } from "../../scripts/lib-franklin.js";
import { hamburgerIcon, hamburgerMenuMarkup, toggleMenu } from "./hamburger.js";
import { decorateLinks } from "../../scripts/scripts.js";
import { decorateIcons } from "../../scripts/lib-franklin.js";
import { deleteItem } from "../ngc-endpoint/ngc-endpoint.js";
import { cartMutations } from '../ngc-endpoint/graphQLMutations/cartMutations.js';
import { getCartIDFromLS, miscMutations } from '../ngc-endpoint/graphQLMutations/miscMutations.js';
import { renderOrderSummary } from "../ngc-order-summary/ngc-order-summary.js";
import { renderCartBody } from "../cart-body/cart-body.js";
import { userMutations } from '../ngc-endpoint/graphQLMutations/userMutations.js';

const isCartPage = window.location.href.indexOf("/cart/") > -1;
const isCheckoutPage = window.location.href.indexOf("/checkout/") > -1;

function updateCartCount(count) {
  const cartCountEle = document.getElementById("cart-count");
  if (count > 0) {
    cartCountEle.innerHTML = count;
    cartCountEle.classList.remove('hide');
  } else if(!cartCountEle.classList.contains('hide')){
    cartCountEle.classList.add('hide');
  }
}
let cartQuantity = 0;
export function addToCartMarkup(shoppingCart) {
  let cartMarkUp = document.querySelector('.add-to-cart');
  let shoppingCartLength = shoppingCart.items?.length;
  let subTotalShop = shoppingCart.prices?.subtotal_excluding_tax.value;
  cartQuantity = shoppingCart.total_quantity;
  updateCartCount(cartQuantity);
  if(shoppingCartLength){
    const start = `
    <div class="add-to-cart-wrapper">
      <div class="items-subtotal">
        <span>${cartQuantity} Products</span>
        <span>Subtotal: $${subTotalShop.toFixed(2)}</span>
      </div>`
    let middle = '';
    for(let i = 0; i < shoppingCartLength; i++){
      middle += `
        <div class="product-card-item-wrapper">
          <div class="product-cart-item" id='${shoppingCart.items[i].product.sku}' data-uid='${shoppingCart.items[i].uid}'>
            <div class="product-img">
              <img src="${shoppingCart.items[i].product.thumbnail.url}" alt="" />
            </div>
            <div class="product-summary">
              <p class="product-name">${shoppingCart.items[i].product.name}</p>
              <p class="qty">Qty : ${shoppingCart.items[i].quantity}</p>
              <p class="item-price">$${shoppingCart.items[i].prices.price.value} ea.</p>
            </div>
            <div class="delete-items">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </div>
          </div>
        </div> `
    }
    const end = `<div class="checkout-bag">
        <button onclick="window.location='/checkout/'">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> 
            CHECKOUT
        </button>
        <a href="/cart/">Edit Shopping Bag</a>
      </div>
    </div>`
    cartMarkUp.innerHTML = start + middle + end;

    let deleteBtn = cartMarkUp.querySelectorAll('.delete-items');
      if(deleteBtn.length !== 0){
        deleteBtn.forEach(item => {
          item.addEventListener('click', async () => {
            await deleteItem(item.parentElement.getAttribute("data-uid"));
            if (isCartPage) {
              renderCartBody();
              renderOrderSummary();
            }
          })
        })
      }
  } else{
    cartMarkUp.innerHTML = `<p class="empty">The shopping cart is empty, please add a product!</p>`
  }
}


function toggleShopingCart() {
  let button = document.querySelector('.nav-tools p:nth-child(3)');
  let box = document.querySelector('.add-to-cart');
  const svgShop = button.querySelector('svg');
  const pathSvg = button.querySelector('path');

  button.addEventListener('click', async () => {
    if(!box.classList.contains('show')){
      box.classList.add('show');
    } else if(box.classList.contains('show')){
      box.classList.remove('show');
    }
  });
  //close dropdown when click outside of it.
  window.addEventListener('click', (e) => {
    if(box.classList.contains('show') &&
      !box.contains(e.target) &&
      e.target !== button &&
      e.target !== svgShop &&
      e.target !== pathSvg
      ){
        box.classList.remove('show');
    }
  })
}

async function setCustomerCart(){
  const customerCart = await cartMutations.getCustomerCart();
  const loginCartID = customerCart.id;
  const localStorageID = getCartIDFromLS();

  if (localStorageID) {
    const mergeResponse = await cartMutations.mergeCarts(localStorageID, loginCartID);
  }

  miscMutations.setCartIDtoLS(loginCartID);

  const cart = await cartMutations.getCartByID(loginCartID);

  addToCartMarkup(cart);
  if (isCartPage) {
    renderCartBody();
    renderOrderSummary();
  }
  if (isCheckoutPage){
    renderOrderSummary();
  } 
}

window.addEventListener('tokenAdded', (event) => {
  const currentEvent = event.currentTarget.localStorage.user_token;
  const hideSignInExpress = document.querySelector('.sign-in-container');
  if(currentEvent.length !== 0) {
    if(hideSignInExpress){
      let userInformation = JSON.parse(localStorage.getItem("user_data"));
      let emailInput = document.querySelector('#email');
      let firstNameInput = document.querySelector('#firstname');
      let lastNameInput = document.querySelector('#lastname');
      emailInput.value = userInformation.email.toLowerCase();
      firstNameInput.value = userInformation.firstname.toLowerCase();
      lastNameInput.value = userInformation.lastname.toLowerCase();
      hideSignInExpress.style.display = 'none';
    }
  }
})

window.addEventListener('tokenDeleted', () => {
  const hideSignInExpress = document.querySelector('.sign-in-container');
  if(hideSignInExpress){
    let emailInput = document.querySelector('#email');
    let firstNameInput = document.querySelector('#firstname');
    let lastNameInput = document.querySelector('#lastname');
    emailInput.value = '';
    firstNameInput.value = '';
    lastNameInput.value = '';
    hideSignInExpress.style.display = 'flex';
  }
})

function toggleSignIn(){
  const signInBtn = document.querySelector('.nav-tools p:nth-child(2)');
  const signInContainer = document.querySelector('.sign-in');
  const closeSignIn = document.querySelector('.close-title svg');
  const signInButton = document.querySelector('#sign-in-btn')
  const loggedTitle = document.querySelector('.close-title h5');
  const logOutBtn = document.querySelector('#log-out');
  const formSignIn = document.querySelector('.sign-in-information')
  const loggedEmail = document.querySelector('.logged-user span');
  const forgotPsw = document.querySelector('.forgot-psw');
  const textUser = signInBtn.querySelector('.text-user');
  const warningLabel = formSignIn.querySelector('small');

  signInBtn.addEventListener('click', () => {
    signInContainer.classList.toggle('show');
    if(signInContainer.classList.contains('show')) signInBtn.style.color = 'rgb(41, 84, 255)';
    else signInBtn.style.color = 'black';
  })

  closeSignIn.addEventListener('click', () => {
    signInContainer.classList.remove('show');
    signInBtn.style.color = 'black';
  })

  signInButton.addEventListener('click', async () => {
    const signInEmail = document.querySelector('#header-email').value;
    const signInPsw = document.querySelector('#password').value;
    const usertest = await userMutations.getUserToken(signInEmail, signInPsw);
    let userName = signInEmail.split('@')[0];
    if(usertest !== null){
      warningLabel.style.display = 'none';
      loggedTitle.innerHTML = 'Profile';
      formSignIn.style.display = 'none';
      logOutBtn.classList.add('show');
      loggedEmail.innerHTML = `Welcome, ${userName}!`;
      forgotPsw.style.display = 'none';
      signInButton.nextElementSibling.style.display = 'none';
      signInButton.style.display = 'none';
      textUser.style.display = 'none';
      localStorage.setItem("user_token", usertest.token);
      let userData = await userMutations.customerQuery(usertest.token);
      localStorage.setItem("user_data",JSON.stringify({email: userData.data.customer.email, firstname: userData.data.customer.firstname, lastname: userData.data.customer.lastname} ))
      window.dispatchEvent(new Event('tokenAdded'));

      await setCustomerCart();
    } else {
      warningLabel.style.display = 'flex';
    }
  })

  logOutBtn.addEventListener('click', () => {
    if (localStorage.getItem('user_token') !== null) localStorage.removeItem('user_token');
    if (localStorage.getItem('user_data') !== null) localStorage.removeItem('user_data');
    if (miscMutations.getCartIDFromLS() !== null) miscMutations.removeCartIDFromLS();
    updateCartCount(0);
    loggedTitle.innerHTML = 'Sign-In To Your Account';
    formSignIn.style.display = 'grid';
    logOutBtn.classList.remove('show');
    loggedEmail.innerHTML = ``;
    forgotPsw.style.display = 'flex';
    signInButton.nextElementSibling.style.display = 'flex';
    signInButton.style.display = 'flex';
    textUser.style.display = 'flex';
    signInContainer.classList.toggle('show');
    signInBtn.style.color = 'black';
    window.dispatchEvent(new Event('tokenDeleted'));
  })

}

function createSignIn() {
  const tokenExists = localStorage.getItem("user_token") !== null;
  let userData = {};
  let userName = '';
  if(tokenExists){
    userData = JSON.parse(localStorage.getItem("user_data"));
    userName = userData?.email.split('@')[0];
  }
  let navTools = document.querySelector('.nav-tools');
  let signInHtml = document.createElement("div");
  const textUser = document.querySelector('.text-user')

  signInHtml.classList.add("sign-in");
  signInHtml.innerHTML = `
  <div class ="sign-in-wrapper">
    <div class="close-title">
      <h5>${tokenExists ? 'Profile' : 'Sign-In To Your Account'}</h5>
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" fill="currentColor" width="100" height="100" viewBox="0 0 24 24">
      <path d="M 4.9902344 3.9902344 A 1.0001 1.0001 0 0 0 4.2929688 5.7070312 L 10.585938 12 L 4.2929688 18.292969 A 1.0001 1.0001 0 1 0 5.7070312 19.707031 L 12 13.414062 L 18.292969 19.707031 A 1.0001 1.0001 0 1 0 19.707031 18.292969 L 13.414062 12 L 19.707031 5.7070312 A 1.0001 1.0001 0 0 0 18.980469 3.9902344 A 1.0001 1.0001 0 0 0 18.292969 4.2929688 L 12 10.585938 L 5.7070312 4.2929688 A 1.0001 1.0001 0 0 0 4.9902344 3.9902344 z"></path>
      </svg>
    </div>
    <form class="sign-in-information" style="display:${tokenExists ? 'none' : 'grid'}">
      <small>The account sign-in was incorrect or your account is disabled temporarily. Please wait and try again later.</small>
      <div class="full-width-input email">
        <label>Email address</label>
        <input type="email" placeholder="" id="header-email"/>
      </div>
      <div class="full-width-input psw">
        <label>Password</label>
        <input type="password" placeholder="" id="password"/>
      </div>
    </form>
    <div class="logged-user">
      <span>${tokenExists ? `Welcome, ${userName}!` : ''}</span>
    </div>
    <span class="forgot-psw" style="display:${tokenExists ? 'none' : 'flex'}">Forgot Password?</span>
    <div class="sign-in-buttons">
      <button type="submit" id="sign-in-btn" style="display:${tokenExists ? 'none' : 'flex'}">Sign In</button>
      <button type="submit" id="create-account" style="display:${tokenExists ? 'none' : 'flex'}">Create an account</button>
      <button type="submit" id="log-out" class="${tokenExists ? 'show' : ''}">Log Out</button>
    </div>
  </div>
  `;
  navTools.append(signInHtml);
  textUser.style.display = tokenExists ? 'none' : 'flex';
}

const cartId = getCartIDFromLS();
const cart = cartId ? await cartMutations.getCartByID(cartId): [];
setTimeout(() => {
  if (!isCheckoutPage) {
    addToCartMarkup(cart);
    toggleShopingCart();
  }
}, 500);

let resized = false;
async function hamburguerFunc(){
  // hamburger for menu
  const screenView = window.innerWidth;
  const nav = document.querySelector("#nav");
  const navWrapper = document.querySelector(".nav-wrapper");
  if(screenView <= 990 && !resized){
    const hamburger = document.createElement("div");
    hamburger.classList.add("nav-hamburger");
    hamburger.innerHTML = hamburgerIcon();
    const menuIcon = hamburger.querySelector('button');
    menuIcon.addEventListener("click", () =>  {
      toggleMenu()
      utilityMenu.style.display = 'block';
      displayMobForm.style.display = 'none';
    });
    nav.prepend(hamburger);
    nav.setAttribute("aria-expanded", "false");

    const navDrawer = document.createElement("div");
    navDrawer.style.display = "none";
    navDrawer.classList.add("main-navigation-drawer");
    let account = document.querySelector(".nav-tools");
    let userIcon = account.querySelector(".icon-user");
    let userText = account.querySelector(".text-user");
    navDrawer.innerHTML = hamburgerMenuMarkup(userIcon, userText);
    await navWrapper.append(navDrawer);

    let mobileContainer = document.querySelector('.main-navigation-drawer');
    let navigationWrapper = mobileContainer.querySelector('.navigation-wrapper');
    let utilityMenu = navigationWrapper.querySelector('.main-navigation-utility-menu');
    let signInMob = mobileContainer.querySelector('.text-user');
    let displayMobForm = navigationWrapper.querySelector('.sign-in-info-mobile');
    let returnToList = displayMobForm.querySelector('.return');
    let signInUserMob = document.querySelector('#mobile-sign-in-btn');
    const warningLabelMob = displayMobForm.querySelector('.sign-in-information small');
    const logOutBtn = mobileContainer.querySelector('#log-out-mobile');
    const textUser = mobileContainer.querySelector('.account-user');

    signInUserMob.addEventListener('click', async () => {
      const signInEmail = document.querySelector('#mobile-email').value;
      const signInPsw = document.querySelector('#mobile-password').value;
      const usertest = await userMutations.getUserToken(signInEmail, signInPsw);
      let userName = signInEmail.split('@')[0];
      if(usertest !== null){
        warningLabelMob.style.display = 'none';
        utilityMenu.style.display = 'block';
        displayMobForm.style.display = 'none';
        logOutBtn.classList.add('show');
        signInMob.style.display = 'none';
        textUser.innerHTML = userName;
        localStorage.setItem("user_token", usertest.token);
        let userData = await userMutations.customerQuery(usertest.token);
        localStorage.setItem("user_data",JSON.stringify({email: userData.data.customer.email, firstname: userData.data.customer.firstname, lastname: userData.data.customer.lastname} ))
        window.dispatchEvent(new Event('tokenAdded'));
        await setCustomerCart();
      } else{
        warningLabelMob.style.display = 'flex';
      }
    })

    logOutBtn.addEventListener('click', () => {
      logOutBtn.classList.remove('show');
      signInMob.style.display = 'flex';
      textUser.innerHTML = 'Account';
      if (localStorage.getItem('user_token') !== null) localStorage.removeItem('user_token');
      if (localStorage.getItem('user_data') !== null) localStorage.removeItem('user_data');
      if (miscMutations.getCartIDFromLS() !== null) miscMutations.removeCartIDFromLS();
      updateCartCount(0);
      window.dispatchEvent(new Event('tokenDeleted'));
    })
    
    signInMob.addEventListener('click', () => {
      utilityMenu.style.display = 'none';
      displayMobForm.style.display = 'grid';
      signInMob.style.display = 'none';
    });

    returnToList.addEventListener('click', () => {
      utilityMenu.style.display = 'block';
      displayMobForm.style.display = 'none';
      signInMob.style.display = 'flex';
    })

    resized = true;
  }
  if(screenView > 990){
    const hamb = document.querySelector(".nav-hamburger");
    const nvDrawer = document.querySelector('.main-navigation-drawer');
    if(hamb && nvDrawer) { 
      hamb.remove();
      nvDrawer.remove();
      navWrapper.classList.remove('fixed');
      resized = false;
    }
  }
}

export default async function decorate(block) {
  // fetch nav content
  const navMeta = getMetadata("nav");
  const navPath = navMeta ? new URL(navMeta).pathname : "/nav";
  const resp = await fetch(`${navPath}.plain.html`);

  if (resp.ok) {
    const html = await resp.text();
    const nav = document.createElement("nav");
    nav.id = "nav";
    nav.innerHTML = html;

    const navClasses = ["brand", "sections", "tools"];
    navClasses.forEach((c, i) => {
      const section = nav.children[i];
      if (section) section.classList.add(`nav-${c}`);
    });

    const navTools = nav.querySelector(".nav-tools");
    const navBrand = nav.querySelector(".nav-brand");

    nav.setAttribute("aria-expanded", "false");

    const navWrapper = document.createElement("div");
    navWrapper.className = "nav-wrapper";
    decorateLinks(nav);
    decorateIcons(navBrand);
    await decorateIcons(navTools);
    let icons = navTools.querySelectorAll('p');
    icons.forEach(icon => {
      const classL = icon.children[0];
      if(classL.classList[1].includes('search')){
        const search = document.createElement('span');
        search.innerHTML = 'Search';
        search.classList.add("search-text");
        icon.append(search)
      } else if(classL.classList[1].includes('user')){
        const user = document.createElement('span');
        user.innerHTML = 'Sign In';
        user.classList.add("text-user");
        icon.append(user)
      }
      else if (classL.classList[1].includes('shopping')) {
        if (!isCheckoutPage) {
          const cartCount = document.createElement('span');
          cartCount.id = 'cart-count';
          cartCount.addEventListener("click", (e) => {
            let miniCartUI = document.querySelector('.add-to-cart');
            miniCartUI.classList.contains('show') 
              ? miniCartUI.classList.remove('show')
              : miniCartUI.classList.add('show');
            e.stopPropagation();
          });
          if (cartQuantity > 0) {
            cartCount.innerHTML = cartQuantity;
          } else {
            cartCount.classList.add('hide');
          }
          icon.append(cartCount); 
        }
        else {
          icon.nextElementSibling.parentNode.removeChild(icon.nextElementSibling);
          icon.parentNode.removeChild(icon);
        }
      }
    })
    navWrapper.append(nav); 

    block.append(navWrapper);

    hamburguerFunc();

    createSignIn();
    toggleSignIn();
  }
}

window.addEventListener('resize', hamburguerFunc);

//window.localStorage.setItem('test', '123')
