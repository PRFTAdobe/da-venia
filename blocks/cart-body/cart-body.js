
import { cartMutations} from '../ngc-endpoint/graphQLMutations/cartMutations.js';
import { getCartIDFromLS } from '../ngc-endpoint/graphQLMutations/miscMutations.js';
import { deleteItem, updateToShoppingCart } from "../ngc-endpoint/ngc-endpoint.js";
import { processingOrderSummary, renderOrderSummary } from "../ngc-order-summary/ngc-order-summary.js";

let currentCart = [];
function productMarkup(cartItem){
    const productLink = `/product-details/#${cartItem.product.sku.replaceAll(" ", ".")}`;
    return `<div class="cart-page-body-wrapper">
                <div class="product-image">
                    <a href="${productLink}">
                        <img src="${cartItem.product.thumbnail.url}" title="${cartItem.product.name} image" alt="${cartItem.product.name}"/>
                    </a>
                </div>
                <div class="title-counter-wrapper">
                    <div class="product-name-title">
                        <a  href="${productLink}">${cartItem.product.name}</a>
                        <div class="product-prize-range">
                            <span>$${cartItem.prices.price.value} ea.</span>
                        </div>
                    </div>
                    <div class="product-quantity">
                        <div class="counter">
                            <button class="plusminus minus">-</button>
                            <input class="form-control" value="${cartItem.quantity}" disabled="">
                            <button class="plusminus plus">+</button>
                        </div>
                    </div>
                </div>
                <div class="product-kebab">
                    <button class="kebab-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-icon-_rq"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                    <div class="kebab-dropdown kebab-content" >
                        <ul>
                            <li>
                                <button type="button" aria-label="Edit item" id="edit-cart-item">
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-icon-_rq"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                    </span>
                                    <span>Edit item</span>
                                </button>
                            </li>
                            <li>
                                <button class="remove-product" type="button" aria-label="Remove from cart">
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-icon-_rq"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </span>
                                    <span>Remove from cart</span>
                                </button>
                            </li>
                            <li>
                                <button type="button" aria-label="Add to Favorites">
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-icon-_rq"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                    </span> Save for later
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
    `;
}

function addEventsOnProductClickables(currentElement, uid) {
    //kebab menu toggle
    currentElement.querySelector('.kebab-button').addEventListener('click', async (e) => {
        const currentModalEle = e.target.closest('.kebab-button').nextElementSibling;
        let isOpen = currentModalEle.classList.contains('show');
        let allKebobModals = document.querySelectorAll(".kebab-content");
        for (var i = 0; i < allKebobModals.length; ++i) {
            allKebobModals[i].classList.remove('show');
        }
        isOpen
            ? currentModalEle.classList.remove('show') : currentModalEle.classList.add('show');
        e.stopPropagation();
    });

    // remove item
    currentElement.querySelector(".remove-product").addEventListener("click", async (el) => {
        processingOrderSummary(true);
        currentCart = await deleteItem(uid);
        if(currentCart.total_quantity >0){
            currentElement.parentNode.removeChild(currentElement);
        }else{
            addEmptyCartMarkup();
        }
        await renderOrderSummary();
    });
    
    //update quantity
    const minus = currentElement.querySelector('.plusminus.minus');
    const plus = currentElement.querySelector('.plusminus.plus');
    const quantityItem = currentElement.querySelector('.counter .form-control');
    minus.addEventListener('click', (event) => sumOrSubstractQuantity(event, quantityItem,uid));
    plus.addEventListener('click', (event) => sumOrSubstractQuantity(event, quantityItem, uid));
}

//update counter and cart
async function sumOrSubstractQuantity(event, quantityItem, uid){
    processingOrderSummary(true);
    if(event.target.classList.contains('minus')) { //minimum quantity 1
        if(+quantityItem.value !== 1) {
            quantityItem.value = +quantityItem.value - 1;
            await updateToShoppingCart(uid, +quantityItem.value);
            await renderOrderSummary();
        }
    }
    else if(event.target.classList.contains('plus')){ //if plus has been click, sum quantity
      quantityItem.value = +quantityItem.value + 1;
      await updateToShoppingCart(uid, +quantityItem.value);
      await renderOrderSummary();
    }
}


function addEmptyCartMarkup(){
    document.querySelector(".cart-body .cart-product-list-wrapper").innerHTML = `<p>There are no items in your cart.</p><a href="/product-list/">Continue Shopping</a>`;
}

function generateCartBodyMarkup(cartItems) {
    const listWrapper = document.querySelector(".cart-body .cart-product-list-wrapper");
    listWrapper.innerHTML = ``;
    cartItems.forEach(item => {
        let product = document.createElement("div");
        product.classList.add("product");
        product.innerHTML = productMarkup(item);
        listWrapper.append(product);
        const currentItem = listWrapper.querySelector(".product:last-child");
        addEventsOnProductClickables(currentItem, item.uid);
    });
}
export async function renderCartBody() {
    let isCartEmpty = true;
    const cartId = getCartIDFromLS()
    if(cartId){
        currentCart = await cartMutations.getCartByID(cartId);
        if(await currentCart.total_quantity>0){
            isCartEmpty = false;
            generateCartBodyMarkup(currentCart.items);
            window.addEventListener("click", () => {
                document.querySelector('.kebab-dropdown.show')?.classList.remove('show');
            })
        }
    }

    if(isCartEmpty) addEmptyCartMarkup();
}

export default async function decorate() {
    document.querySelector(".cart-body").innerHTML = `<h1>Cart</h1> <div class="cart-product-list-wrapper"></div>`;
    document.querySelector(".cart-body .cart-product-list-wrapper").innerHTML =`<p>Please wait while we fetch your cart </p>`;
    const cartBody = document.querySelector('.cart-body-wrapper');
    cartBody.closest('main').classList.add('cart-body-main-wrapper');
    await renderCartBody();
}