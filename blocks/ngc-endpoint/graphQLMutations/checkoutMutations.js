import { utilities } from "./utility.js";
import { getTokenFromLS } from "./miscMutations.js";

const AvailablePaymentMethodsFragment =`id available_payment_methods { code title __typename } __typename `;
const TaxSummaryFragment =`applied_taxes { amount { currency value __typename } __typename } __typename `;
const ShippingSummaryFragment =`id shipping_addresses { selected_shipping_method { amount { currency value __typename } __typename } street __typename } __typename `;
const GrandTotalFragment =`grand_total { currency value __typename } __typename `;
const GiftOptionsSummaryFragment =`id prices { gift_options { printed_card { value currency __typename } __typename } __typename } __typename `;
const GiftCardSummaryFragment =`id applied_gift_cards { code applied_balance { value currency __typename } __typename } __typename `;
const DiscountSummaryFragment =`discounts { amount { currency value __typename } label __typename } __typename `;
const PriceSummaryFragment =`id items { uid quantity __typename } ${ShippingSummaryFragment} prices { ${TaxSummaryFragment} ${DiscountSummaryFragment} ${GrandTotalFragment} subtotal_excluding_tax { currency value __typename } subtotal_including_tax { currency value __typename } __typename } ${GiftCardSummaryFragment} ${GiftOptionsSummaryFragment} __typename `;
const SelectedShippingMethodCheckoutFragment =`id shipping_addresses { selected_shipping_method { amount { currency value __typename } carrier_code method_code method_title __typename } street __typename } __typename `;
const AvailableShippingMethodsCheckoutFragment =`id shipping_addresses { available_shipping_methods { amount { currency value __typename } available carrier_code carrier_title method_code method_title __typename } street __typename } __typename `;
const ShippingMethodsCheckoutFragment =`id ${AvailableShippingMethodsCheckoutFragment} ${SelectedShippingMethodCheckoutFragment} shipping_addresses { country { code __typename } postcode region { code __typename } street __typename } __typename `;
const ShippingInformationFragment =`id email shipping_addresses { city country { code label __typename } firstname lastname postcode region { code label region_id __typename } street telephone __typename } __typename `;


//checkout price summary
const getPriceSummary = async (cartID) => {
  const query = JSON.stringify({
    query: `query getPriceSummary($cartId:String!){cart(cart_id:$cartId){id ${PriceSummaryFragment} __typename}}`,
    variables: {"cartId": cartID},
  });

  const header = getTokenFromLS() ? {...utilities.HEADERS, 'Authorization': `Bearer ${getTokenFromLS()}`} : utilities.HEADERS;
  const checkoutCart = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', header, query);
  return checkoutCart.data.cart;
}

//set guest shipping
const setGuestShippingAddress = async (cartID, email, address) => {
  const query = JSON.stringify({
    query: `mutation SetGuestShipping($cartId: String!, $email: String!, $address: CartAddressInput!) { setGuestEmailOnCart(input: {cart_id: $cartId, email: $email}) { cart { id __typename } __typename } setShippingAddressesOnCart( input: {cart_id: $cartId, shipping_addresses: [{address: $address}]} ) { cart { id ${ShippingInformationFragment} ${ShippingMethodsCheckoutFragment} ${PriceSummaryFragment} ${AvailablePaymentMethodsFragment} __typename } __typename } }`,
    variables: {
      "cartId": cartID,
      email,
      address
    },
  });

  const setShippingAddResponse = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', utilities.HEADERS, query);
  return setShippingAddResponse.data.setShippingAddressesOnCart.cart;
}

//set guest billing address
const setGuestBillingAddress = async (cartID, address, sameAsShipping) => {
  const query = JSON.stringify({
    query: `mutation SetBillingAddressOnCart($cartId: String!, $billingAddress: BillingAddressInput!){ setBillingAddressOnCart( input: {cart_id: $cartId billing_address: $billingAddress}) { cart { billing_address { postcode } } } }`,
    variables: {
      "cartId": cartID,
      "billingAddress": {
        "address": address,
        "same_as_shipping": sameAsShipping
      }
    },
  });

  const setBillingAddResponse = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', utilities.HEADERS, query);
  return setBillingAddResponse.data.setBillingAddressOnCart.cart;
}

//set shipping method
const setShippingMethod = async (cartID, shippingMethodObj) => {
/* "shippingMethod": {
			"carrier_code": "flatrate",
			"method_code": "flatrate"
} */
  const query = JSON.stringify({
    query: `mutation SetShippingMethod($cartId: String!, $shippingMethod: ShippingMethodInput!) { setShippingMethodsOnCart( input: {cart_id: $cartId, shipping_methods: [$shippingMethod]} ) { cart { id available_payment_methods { code title __typename } ${SelectedShippingMethodCheckoutFragment} ${PriceSummaryFragment} ${ShippingInformationFragment} ${AvailableShippingMethodsCheckoutFragment} __typename } __typename } }`,
    variables: {
      "cartId": cartID,
      "shippingMethod": shippingMethodObj, 
    },
  });

  const setShippingMethodResponse = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', utilities.HEADERS, query);
  return setShippingMethodResponse.data.setShippingMethodsOnCart.cart;
}

//set payment method
const setPaymentMethod = async (cartID, paymentCode) => {
  const query = JSON.stringify({
    query: `mutation SetPaymentMethodOnCart($cartId: String!, $paymentMethod:  PaymentMethodInput!){ setPaymentMethodOnCart(input: { cart_id: $cartId  payment_method: $paymentMethod }) { cart { selected_payment_method { code title } } } }`,
    variables: {
      "cartId": cartID,
      "paymentMethod": {
        "code": paymentCode
      }
    },
  });

  const setPaymentMethodResponse = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', utilities.HEADERS, query);
  return setPaymentMethodResponse.errors ? setPaymentMethodResponse : setPaymentMethodResponse.data.setPaymentMethodOnCart.cart;
}

//place order
const placeOrder = async (cartID) => {
  const query = JSON.stringify({
    query: `mutation PlaceOrder($cartId: String!) { placeOrder(input: { cart_id: $cartId }) { order { order_number } } }`,
    variables: {
      "cartId": cartID
    },
  });
  const header = getTokenFromLS() ? {...utilities.HEADERS, 'Authorization': `Bearer ${getTokenFromLS()}`} : utilities.HEADERS;
  const placeOrderResponse = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', header, query);
  return placeOrderResponse.errors? placeOrderResponse : placeOrderResponse.data.placeOrder.order.order_number;
}

//get selected cart address and payment details
const getCartCheckoutDetails = async (cartID) => {
  const query = JSON.stringify({
    query: `query cart($cartId: String!){ cart(cart_id: $cartId) { email billing_address { city country { code label } firstname lastname postcode region { code label } street telephone } shipping_addresses { firstname lastname street city region { code label } country { code label } telephone available_shipping_methods { amount { currency value } available carrier_code carrier_title error_message method_code method_title price_excl_tax { value currency } price_incl_tax { value currency } } selected_shipping_method { amount { value currency } carrier_code carrier_title method_code method_title } } items { id product { name sku } quantity errors { code message } } available_payment_methods { code title } selected_payment_method { code title } applied_coupons { code } prices { grand_total { value currency } } } }`,
    variables: {
      "cartId": cartID
    },
  });
  const header = getTokenFromLS() ? {...utilities.HEADERS, 'Authorization': `Bearer ${getTokenFromLS()}`} : utilities.HEADERS;
  const cartResponse = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', header, query);
  return cartResponse.data.cart;
}

export const checkoutMutations = {
  getPriceSummary,
  setGuestShippingAddress,
  setGuestBillingAddress,
  setShippingMethod,
  setPaymentMethod,
  placeOrder,
  getCartCheckoutDetails
};