import { addToShoppingCart } from '../ngc-endpoint/ngc-endpoint.js';
import { activeEndPoint } from '../ngc-endpoint/graphQLMutations/utility.js';
let selectedOptions = [];
let optionsEnabled = false;
async function getProduct(uri, sku) {
  const results = await fetch("https://catalog-service.adobe.io/graphql",{method: "POST", headers:{
    "Magento-Environment-Id": "39dd6676-494f-4ffd-8578-57f4bdad9ad1",
    "Magento-Website-Code": "base",
    "Magento-Store-Code": "main_website_store",
    "Magento-Store-View-Code": "default",
    "X-Api-Key": "639cd72448fe462ca0f59f30f1b20259",
    "Content-Type": "application/json"
  },
    body: JSON.stringify({"query":"query productSearch( $phrase: String! $pageSize: Int $currentPage: Int = 1 $filter: [SearchClauseInput!] $sort: [ProductSearchSortInput!] $context: QueryContextInput ) { productSearch( phrase: $phrase page_size: $pageSize current_page: $currentPage filter: $filter sort: $sort context: $context ) { total_count items { ...Product ...ProductView } facets { ...Facet } page_info { current_page page_size total_pages } } attributeMetadata { sortable { label attribute numeric } } } fragment Product on ProductSearchItem { product { __typename sku name canonical_url small_image { url } image { url } thumbnail { url } price_range { minimum_price { fixed_product_taxes { amount { value currency } label } regular_price { value currency } final_price { value currency } discount { percent_off amount_off } } maximum_price { fixed_product_taxes { amount { value currency } label } regular_price { value currency } final_price { value currency } discount { percent_off amount_off } } } } } fragment ProductView on ProductSearchItem { productView { __typename sku name description url urlKey images { label url roles } ... on ComplexProductView { priceRange { maximum { final { amount { value currency } } regular { amount { value currency } } } minimum { final { amount { value currency } } regular { amount { value currency } } } } options { id title values { title ... on ProductViewOptionValueSwatch { id type value } } } } ... on SimpleProductView { price { final { amount { value currency } } regular { amount { value currency } } } } } highlights { attribute value matched_words } } fragment Facet on Aggregation { title attribute buckets { title __typename ... on CategoryView { name count path } ... on ScalarBucket { count } ... on RangeBucket { from to count } ... on StatsBucket { min max } } }","variables":{"phrase":"","pageSize":8,"filter":[{"attribute":"visibility","in":["Search","Catalog, Search"]},{"attribute":"inStock","eq":"true"},{"attribute":"sku","eq":`${sku}`}],"context":{"customerGroup":"b6589fc6ab0dc82cf12099d1c2d40ab994e8410c"}}})
  }) 
  const prod = await results.json();
  return prod;
}

function updateValue() {
  document.querySelectorAll("input.options").forEach(elem => {
    elem.addEventListener('click', () => {
      (elem.parentNode.nextElementSibling).querySelector('span').innerHTML = (elem.ariaLabel).replace('/', '');
      selectedOptions = [... document.querySelectorAll('input.options:checked')].map((elem) => {
        return elem.id;
      });
      toggleAddToCartButton();
    });
  });
}

const productDetailsMarkup = async (productObj) => {
  const product = productObj.product;
  const container = document.createElement("div");
  let optMarkup = '';
  
  let options = productObj.productView?.options;

  if (options) {
    optionsEnabled = true;
    let optionMarkup = '', colorMarkup = '';
  
    options.forEach( e => {
      if ( e.id === "color" ){
        e.values.forEach( elem => {
          colorMarkup += `<input class="options hidden radio-label ${e.id}" type="radio" id="${elem.id}" name="${e.id}" value="${elem.value}" aria-label=${elem.title}/>
            <label class="button-label" for="${elem.id}" style="background-color: ${elem.value}; border-color: #b3b3b3">
              <span></span>
            </label>`
            
        });
        optMarkup += `
          <div class="prod-option prod-${e.id}">
            <b>${e.title}</b>
            <div class="input-wrap">
              ${colorMarkup}
            </div>
            <p>Selected ${e.title}: <span id="prod-${e.id}-value">None</span></p>
          </div>
        `;
      } else {
        e.values.forEach( elem => {
          optionMarkup += `<input class="options hidden radio-label" type="radio" id="${elem.id}" name="${e.id}" value="${elem.value}" aria-label=${elem.title}/>
            <label class="button-label" for="${elem.id}">
              <span>${elem.title}</span>
            </label>`;
        });
        optMarkup += `
          <div class="prod-option">
            <b>${e.title}</b>
            <div class="input-wrap">
              ${optionMarkup}
            </div>
          <p>Selected ${e.title}: <span id="prod-${e.id}-value">None</span></p>
          </div>
        `;
      }
    });
  }

  // const defaultImage = '//dev-54ta5gq-f3ef32mfqsxfe.us-4.magentosite.cloud/static/version1709928839/frontend/Magento/luma/en_US/Magento_Catalog/images/product/placeholder/image.jpg'
  const defaultImage = `${activeEndPoint}/static/version1709928839/frontend/Magento/luma/en_US/Magento_Catalog/images/product/placeholder/image.jpg`;
  container.innerHTML = `
    <div class="prod-page-container">
      <div class="prod-image">
        <img src="https:${product.image ? product.image.url : defaultImage}" title="https:${product.image ? product.image.url : defaultImage}"/>
      </div>
      <div class="prod-name">
        <h1>${product.name}</h1>
        <span>$${product.price_range.minimum_price.final_price.value}</span>
      </div>
      <div class="prod-add-to-cart">
        ${optMarkup}
        <div class="prod-quantity">
          <span>Quantity</span>
          <div class="counter">
              <button class="plusminus minus" >-</button>
              <input class="form-control" value="0" disabled>
              <button class="plusminus plus">+</button>
          </div>
        </div>
        <div class="prod-btn-cart">
          <button class="btn-cart disabled">ADD TO CART</button>
          <button class="btn-favorites">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-icon-_rq">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            Add to Favorites
          </button>
        </div>
      </div>
      <div class="prod-desc">
          ${productObj.productView.description}
      </div>
    </div>
    `;
  return container;
};

  //disable or not the add to cart button depending of quantity and options
function toggleAddToCartButton() {
  const addBtn = document.querySelector('.prod-btn-cart .btn-cart');

  if (currentQuantity > 0) {
    if (optionsEnabled){
      if (selectedOptions.length === 2){
        addBtn.classList.remove('disabled');
      } else {
        addBtn.classList.add('disabled');
      }
    } else {
      addBtn.classList.remove('disabled');
    }
  } else {
    addBtn.classList.add('disabled');
  }
}

let currentQuantity = 0;
function sumOrSubstractQuantity(event, quantityItem){
  if(event.target.classList.contains('minus')) { //if minus has been click, substract quantity
    if(+quantityItem.value !== 0) quantityItem.value = +quantityItem.value - 1;
  }
  else if(event.target.classList.contains('plus')){ //if plus has been click, sum quantity
    quantityItem.value = +quantityItem.value + 1;
  }
  
  currentQuantity = +quantityItem.value;
  toggleAddToCartButton();
}

function addItemsToCart(selectedProduct){
  const minus = document.querySelector('.plusminus.minus');
  const plus = document.querySelector('.plusminus.plus');
  const quantityItem = document.querySelector('.counter .form-control');
  const addProdBtn = document.querySelector('.prod-btn-cart .btn-cart');
  minus.addEventListener('click', (event) => sumOrSubstractQuantity(event, quantityItem));
  plus.addEventListener('click', (event) => sumOrSubstractQuantity(event, quantityItem));
  addProdBtn.addEventListener('click', () => addToShoppingCart(selectedProduct.product.sku, currentQuantity, selectedOptions));
  updateValue();
}

export default async function decorate(block) {
  const hash = window.location.hash;
  const productSku = hash.replaceAll(".", " ");
  const endPoint = document.querySelector(".ngc-product-endpoint a").href;
  const products = await getProduct(endPoint, productSku.replace("#", ""));
  const productData = await products?.data?.productSearch?.items;
  const prodItem= await productData[0]
  const productMarkup = await productDetailsMarkup(prodItem);
  block.innerHTML = productMarkup.outerHTML;
  addItemsToCart(prodItem);
}
