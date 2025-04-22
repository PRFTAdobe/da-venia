import { cartMutations } from './graphQLMutations/cartMutations.js';
import { miscMutations } from './graphQLMutations/miscMutations.js';
import {activeEndPoint} from './graphQLMutations/utility.js';
const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const product = urlParams.get('product');


let maxPrice = 0;
let flag = false;
let productItems;

async function getProducts(uri) {
  const results = await fetch("https://catalog-service.adobe.io/graphql",{method: "POST", headers:{
    "Magento-Environment-Id": "39dd6676-494f-4ffd-8578-57f4bdad9ad1",
    "Magento-Website-Code": "base",
    "Magento-Store-Code": "main_website_store",
    "Magento-Store-View-Code": "default",
    "X-Api-Key": "7feda9c35c60496aad984f8dcc06a9c0",
    "Content-Type": "application/json"
  },
    body: JSON.stringify({"query":"query productSearch( $phrase: String! $pageSize: Int $currentPage: Int = 1 $filter: [SearchClauseInput!] $sort: [ProductSearchSortInput!] $context: QueryContextInput ) { productSearch( phrase: $phrase page_size: $pageSize current_page: $currentPage filter: $filter sort: $sort context: $context ) { total_count items { ...Product ...ProductView } facets { ...Facet } page_info { current_page page_size total_pages } } attributeMetadata { sortable { label attribute numeric } } } fragment Product on ProductSearchItem { product { __typename sku name canonical_url small_image { url } image { url } thumbnail { url } price_range { minimum_price { fixed_product_taxes { amount { value currency } label } regular_price { value currency } final_price { value currency } discount { percent_off amount_off } } maximum_price { fixed_product_taxes { amount { value currency } label } regular_price { value currency } final_price { value currency } discount { percent_off amount_off } } } } } fragment ProductView on ProductSearchItem { productView { __typename sku name description url urlKey images { label url roles } ... on ComplexProductView { priceRange { maximum { final { amount { value currency } } regular { amount { value currency } } } minimum { final { amount { value currency } } regular { amount { value currency } } } } options { id title values { title ... on ProductViewOptionValueSwatch { id type value } } } } ... on SimpleProductView { price { final { amount { value currency } } regular { amount { value currency } } } } } highlights { attribute value matched_words } } fragment Facet on Aggregation { title attribute buckets { title __typename ... on CategoryView { name count path } ... on ScalarBucket { count } ... on RangeBucket { from to count } ... on StatsBucket { min max } } }","variables":{"phrase":`${product}`,"pageSize":8,"filter":[{"attribute":"visibility","in":["Search","Catalog, Search"]},{"attribute":"inStock","eq":"true"}],"context":{"customerGroup":"b6589fc6ab0dc82cf12099d1c2d40ab994e8410c","userViewHistory":[{"sku":"24-WB07","dateTime":"2024-02-26T15:16:01.236Z"}]}}})
  }) 
  const prod = await results.json();
  return prod;
}

function initializeFilters() {
  //Create content for mobile view
  const mobCategory = document.querySelector(".filterSideBar .filterSideBar-categories");
  const ngcEndpoint = document.querySelector(".ngc-endpoint");
  const title = document.querySelector(".filterSideBar-headerTitle");
  const cloneCategory = mobCategory.cloneNode(true);
  const mobFilter = document.createElement("div");

  mobFilter.classList.add("mobile-filter-products");
  mobFilter.style.display = 'none';
  mobFilter.appendChild(cloneCategory);
  const closeHamb = document.createElement("div");
  closeHamb.classList.add("filter-hamburger");
  closeHamb.innerHTML = `
    <button type="button" aria-controls="nav" aria-label="Open navigation">
  <span class="filter-hamburger-icon"></span>
    </button>
    <span class="filter-hamb">Filters</span>
  `;
  mobFilter.prepend(closeHamb);
  closeHamb.addEventListener('click', () => mobFilter.style.display = 'none');
  title.classList.add('mobile');
  let filterMob = document.querySelector(".filterSideBar-headerTitle.mobile");
  filterMob.addEventListener('click', () => {
    mobFilter.style.display = 'block';
  })
  if(!flag){
    ngcEndpoint.append(mobFilter);
    flag = true;
  }
  filterFunct(); //logic for filtering
}

function resizeDeskFunc(){
  const screenView = window.innerWidth;
  const hamb = document.querySelector(".mobile-filter-products");
  if(screenView > 990 && hamb){
    hamb.style.display = 'none';
  }  
}

const productTileMarkup = (product) => {
  const productLink = `/product-details/#${product.sku.replaceAll(" ", ".")}`;
  return `
  <div>
    <div class="product-image">
  <a href="${productLink}">
    <img src="${product.thumbnail.url}" alt="" title="${product.name}" />
  </a>
  <div class="product-name"><a href="${productLink}">${product.name}</a></div>
  <div class="product-price">$${product.price_range.minimum_price.final_price.value}</div>
  <div class="add-to-cart-btn">
    <button class="add-to-cart-prod">
          <span class="add-to-cart-text">ADD TO CART</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="addToCartButton-icon-bKz inline stroke-white xs_hidden" class="add-to-cart-icon">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </button>
        <button class="add-to-fav">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-icon-_rq">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        </button>
      </div>
    </div>
    
  </div>
`;
};

const generateProductListContainer = (block) => {
  const containerElement = document.createElement("div");
  containerElement.id = "product-list";
  containerElement.classList.add("section");
  block.innerHTML = containerElement.outerHTML;
};

const generateFilterContainer = (filters) => {
  const main = document.querySelector(".ngc-endpoint");
  const containerElement = document.createElement("div");
  containerElement.id = "filter-products";
  const start = `
  <aside class="filterSideBar">
    <h3 class="filterSideBar-resultsMob">Results</h3>
    <h2 class="filterSideBar-headerTitle">Filters</h2>
    <ul class="filterSideBar-categories">`;
    let middle = '';
    for(let key in filters){
      const categoryStart =
      `<li class="filterSideBar-category">
        <div>
          <span class="category-dropdown `+key.toLowerCase()+`">
            <span class="title">`+key+`</span>
            <span class="arrow opened">></span>
          </span>
          <form class="category-options">
            <ul>`;
          let categoryMid = '';
            if(key === 'Price'){
              const ranges = (filters[key]/ 3).toFixed(1);
              for(let i = 1; i <= 3; i++){
                categoryMid += 
                `<li>
                  <input type="checkbox" class="checkbox `+key.toLowerCase()+`">
                  <span min="${ranges*(i-1)}" max="${ranges*i}"> $`+ ranges*(i-1) +` - $`+ ranges * i +` </span>
                </li>`
              }
            }
      const categoryEnd = 
            `</ul>
          </form>
        </div>
      </li>`
      middle = categoryStart + categoryMid + categoryEnd;
    }
  const end =  
    `</ul>
  </aside>`;
  containerElement.innerHTML = start + middle + end ;
  main.prepend(containerElement);
};



//cart Mutations 
//add product to mini cart
export async function addToShoppingCart(sku, quantityToAdd, selectedOptionArr=[]) {
  const shoppingCartID = miscMutations.getCartIDFromLS() || await cartMutations.generateCartID();
  miscMutations.setCartIDtoLS(shoppingCartID);
  const currentShoppingCart = await cartMutations.getCartByID(shoppingCartID);

  if (!quantityToAdd) {
    const itemIndexInCurrentCart = currentShoppingCart.items?.findIndex((item) => sku == item.sku);
    quantityToAdd = (itemIndexInCurrentCart > -1)
                ? (currentShoppingCart.items[itemIndexInCurrentCart].quantity + 1)
                : 1;
  }
                    
  const productDet ={sku, quantity: quantityToAdd, selected_options: selectedOptionArr};
  const responseCart = await cartMutations.addProductToCart(shoppingCartID, productDet);
  
  await updateCurrentMiniCart(responseCart.data.addProductsToCart.cart);
}
//update one item from cart
export async function updateToShoppingCart(uid, quantityToAdd) {
  const shoppingCartID = miscMutations.getCartIDFromLS();
  const itemsToUpdate ={
      "cart_item_uid": uid,
      "quantity": quantityToAdd
    };
  const responseCart = await cartMutations.updateProductInCart(shoppingCartID, itemsToUpdate);
  
  await updateCurrentMiniCart(responseCart.data.updateCartItems.cart);
  return responseCart.data.updateCartItems.cart;
}
 
//update minicart in nav
export async function updateCurrentMiniCart(cart) {
  const { addToCartMarkup } = await import('../header/header.js');
  addToCartMarkup(cart);
};

//delete item from cart
export async function deleteItem(uid) {
  const responseCart = await cartMutations.removeItemFromCart(miscMutations.getCartIDFromLS(), uid);
  await updateCurrentMiniCart(responseCart.data.removeItemFromCart.cart);
  return responseCart.data.removeItemFromCart.cart;
}

//shopping cart operations ends

function showList(productItems){
  if(productItems.length != 0){
    productItems.forEach((item, index) => {
      let productTile = '';
      if (item.product.image !== null && item.product.image.url.split("/").pop() !== "image.jpg") {
        productTile = productTileMarkup(item.product);
      } else {
        item.product.image = {url:`${activeEndPoint}/static/version1709928839/frontend/Magento/luma/en_US/Magento_Catalog/images/product/placeholder/image.jpg`}
        item.product.thumbnail = {url:`${activeEndPoint}/static/version1709928839/frontend/Magento/luma/en_US/Magento_Catalog/images/product/placeholder/image.jpg`}
        productTile = productTileMarkup(item.product);
      }
      const template = document.createElement("template");
      template.innerHTML = productTile;
      document.querySelector("#product-list").append(template.content);
      const addToCartBtn = document.querySelectorAll(".add-to-cart-prod");
      addToCartBtn[index].addEventListener('click', async () => {
        if(item.productView?.options === undefined) addToShoppingCart(item.product.sku);
        else{
          window.location.href = `/product-details/#${item.product.sku.replaceAll(" ", ".")}`;
        }
      })
      let itemPrice = item.product.price_range.minimum_price.final_price.value;
      maxPrice = itemPrice > maxPrice ? itemPrice : maxPrice;
    });
  }
  else{
    let div = document.createElement("div");
    div.id = "not-found";
    div.innerHTML = `
    <div class="text-center">
        <h1 class="display-1 fw-bold">Opps!</h1>
        <p class="fs-3"> <span class="text-danger">Sorry!</span> We couldn't find any products.</p>
        <p class="lead">
            Try another filter or category.
          </p>
    </div>`;
    document.querySelector("#product-list").innerHTML = div.outerHTML;
  }
}


function filterFunct(){
  let elements = document.querySelectorAll('.category-dropdown');
  elements.forEach(el => el.addEventListener('click', () => { //create listener for changing arrow (up/down)
    let arrow = el.querySelector(".arrow");
    let form = el.nextElementSibling;
    if(arrow.classList.contains("opened")){
      arrow.classList.remove("opened");
      form.style.display = 'none';
    } else {
      arrow.classList.add("opened");
      form.style.display = 'flex';
    }
  }));
  elements.forEach(el => {
    let form = el.nextElementSibling;
    let checkboxs = form.querySelectorAll(".checkbox");
    let productsUpdated = [];
    checkboxs.forEach(cb => cb.addEventListener('change', () => { //detect change on checkboxs
      const span = cb.nextElementSibling;
      if(cb.classList.contains("price")){ //filter for pricing
        let minInterval = span.getAttribute('min');
        let maxInterval = span.getAttribute('max');
        if(cb.checked) { //if a checkbox has been selected, update list by intervals chosen.
          for(let i = 0; i < productItems.length; i++){
            let prod = productItems[i].product.price_range.minimum_price.final_price.value
            if(minInterval <= prod && prod <= maxInterval){
              productsUpdated.push(productItems[i]);   
            }
          }
        }
        else { //if a checkbox has been cleared, update list with intervals removed.
          const filteredProds = productItems.filter(function(obj){ //search the products wanted to be remove.
            let prod = obj.product.price_range.minimum_price.final_price.value
            return (minInterval <= prod && prod <= maxInterval)
          });
          const productsUpdatedCpy = [];
          for(let i = 0; i < productsUpdated.length; i++){ //create a new list with the products updated
            let found = false;
            for(let j = 0; j < filteredProds.length && !found; j++){
              found = filteredProds[j].product.sku === productsUpdated[i].product.sku;
            } //search if the products to be removed are in the product list, if they match then ignore product
            if(!found) productsUpdatedCpy.push(productsUpdated[i]);
          }
          productsUpdated = [...productsUpdatedCpy]; //update product list without products chosen to remove.
        }
        document.querySelector("#product-list").innerHTML = '';
        for(let i = 0; i < checkboxs.length; i++){
          if(productsUpdated.length === 0 && checkboxs[i].checked) {
            showList(productsUpdated);
            return;
          }
        }
        if(productsUpdated.length != 0) showList(productsUpdated); //show product list with filters.
        else showList(productItems);  //Show all list when no filters selected
      }
    }));
  })
}

export default async function decorate(block) {
  // get the endpoint url
  const infoJSON = block.querySelector("a");
  // replace the endpoint block with a new container
  generateProductListContainer(block);
  let filters = {};
  if (infoJSON) {
    const products = await getProducts(infoJSON.href);
    const productList = products.data;
    productItems = productList.productSearch.items;
    showList(productItems); //create the product list
    
    filters.Price = maxPrice;
    generateFilterContainer(filters); //create the structure for filters
    initializeFilters(); //create the filter for mobile
  }
}

window.addEventListener('resize', resizeDeskFunc);
