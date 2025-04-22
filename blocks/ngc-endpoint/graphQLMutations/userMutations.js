import { utilities } from "./utility.js";

const CART_QUERY = `{ id items { prices { price { currency value } total_item_discount { value } } product { name sku url_key thumbnail { url } } ... on ConfigurableCartItem { configurable_options { option_label value_label } configured_variant { thumbnail { url } } } quantity uid } prices { subtotal_excluding_tax { currency value } } total_quantity }`;


const getUserToken = async (userEmail, userPsw) => {
    const query = JSON.stringify({
      query: `mutation {
        generateCustomerToken(email: "${userEmail}", password: "${userPsw}") {
          token
        }
      }`,
      variables: {},
    });
  
    const response = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', utilities.HEADERS, query);
  
    return response.data.generateCustomerToken;
}


const customerQuery = async (token) => {
  const query = JSON.stringify({
    query: `{ customer { firstname lastname suffix email addresses { firstname lastname street city region { region_code region } postcode country_code telephone } } }`
  });
  const userData = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', {...utilities.HEADERS, 'Authorization': `Bearer ${token}`}, query);
  return userData;
}

export const userMutations = {
  getUserToken,
  customerQuery
};
