import { getTokenFromLS } from "./miscMutations.js";
import { utilities } from "./utility.js";

const CART_QUERY = `{ id items { prices { price { currency value } total_item_discount { value } } product { name sku url_key thumbnail { url } } ... on ConfigurableCartItem { configurable_options { option_label value_label } configured_variant { thumbnail { url } } } quantity uid } prices { subtotal_excluding_tax { currency value } } total_quantity }`;

//createCartID query
const generateCartID = async () => {
  const query = JSON.stringify({
    query:  "mutation {createEmptyCart}",
    variables: {}
  });

  const createShoppingCartID = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', utilities.HEADERS, query);

  return createShoppingCartID.data.createEmptyCart;
}

//getCart query
const getCartByID = async (cartID) => {
  const query = JSON.stringify({
    query: `query getCart($cartId: String!) { cart(cart_id: $cartId) ${CART_QUERY}}`,
    variables: {"cartId": cartID},
  });

  const header = getTokenFromLS() ? {...utilities.HEADERS, 'Authorization': `Bearer ${getTokenFromLS()}`} : utilities.HEADERS;
  const shoppingCart = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', header, query);

  return shoppingCart.data.cart;
}

//add product
const addProductToCart = async (cartID, cartItems) => {
  const query = JSON.stringify({
    query: `mutation addProductsToCart($cartId: String!, $cartItems: [CartItemInput!]!) { addProductsToCart(cartId: $cartId, cartItems: $cartItems) { cart ${CART_QUERY} user_errors { code message } } }`,
    variables: {
      "cartId": cartID,
      "cartItems": [cartItems]
    },
  });

  const header = getTokenFromLS() ? {...utilities.HEADERS, 'Authorization': `Bearer ${getTokenFromLS()}`} : utilities.HEADERS;
  const shoppingCart = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', header, query);

  return shoppingCart;
}

//update
const updateProductInCart = async (cartID, itemsToUpdate) => {
  const query = JSON.stringify({
    query: `mutation updateCartItems($cartId: String!, $items: [CartItemUpdateInput!]!) { updateCartItems(input: { cart_id: $cartId, cart_items: $items }) { cart ${CART_QUERY} } }`,
    variables: {
      "cartId": cartID,
      "items": [itemsToUpdate]
    },
  });

  const header = getTokenFromLS() ? {...utilities.HEADERS, 'Authorization': `Bearer ${getTokenFromLS()}`} : utilities.HEADERS;
  const shoppingCart = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', header, query);

  return shoppingCart;
}

//delete
const removeItemFromCart = async (cartID, uid) => {
 const query = JSON.stringify({
    query: `mutation removeItemFromCart($cartId: String!, $uid: ID!) { removeItemFromCart(input: { cart_id: $cartId, cart_item_uid: $uid }) { cart ${CART_QUERY}  } }`,
    variables: {
      "cartId": cartID,
      "uid": uid
    },
 });

 const header = getTokenFromLS() ? {...utilities.HEADERS, 'Authorization': `Bearer ${getTokenFromLS()}`} : utilities.HEADERS;
  const shoppingCart = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', header, query);

  return shoppingCart;
}


// Query for Logged in users
const mergeCarts = async (source, destination) => {
  const query = JSON.stringify({
    query: `mutation mergeCarts( $source: String!, $destination: String ) { mergeCarts( source_cart_id: $source, destination_cart_id: $destination ) { items { id product { name sku } quantity } } }`,
    variables: {
      "source": source,
      "destination": destination
    }
  });

  const header = getTokenFromLS() ? {...utilities.HEADERS, 'Authorization': `Bearer ${getTokenFromLS()}`} : utilities.HEADERS;
  const shoppingCart = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', header, query);

  return shoppingCart;
}

const getCustomerCart = async () => {
  const query = JSON.stringify({
    query: `{ customerCart ${CART_QUERY} }`
  });

  const header = getTokenFromLS() ? {...utilities.HEADERS, 'Authorization': `Bearer ${getTokenFromLS()}`} : utilities.HEADERS;
  const userCart = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', header, query);
  
  return userCart.data.customerCart;
}

export const cartMutations = {
  generateCartID,
  getCartByID,
  addProductToCart,
  updateProductInCart,
  removeItemFromCart,
  getCustomerCart,
  mergeCarts
};

