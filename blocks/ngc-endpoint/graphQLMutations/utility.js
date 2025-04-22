//global vars

const devurl= '//dev-54ta5gq-f3ef32mfqsxfe.us-4.magentosite.cloud';
const masterurl = '//master-7rqtwti-f3ef32mfqsxfe.us-4.magentosite.cloud';
export const activeEndPoint = masterurl;
const GRAPHQL_ENDPOINT = `https:${activeEndPoint}/graphql`;

const getCookie= (cookieName) => {
  const decodedCookie = decodeURIComponent(document.cookie).split("=");
  let cookieValue = "";
  for(let i = 1; i < decodedCookie.length && cookieValue.length === 0; i += 2){
    if(decodedCookie[i-1] === cookieName){
      cookieValue = decodedCookie[i];
    }
  }
  return cookieValue;
}

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

const fetchRequests = async (url, method, headers, body) => {
    const requestOptions = {
      method,
      headers,
      body,
      redirect: 'follow',
    };
    const response = await fetch(url, requestOptions);
    return await response.json();
}

export const utilities = {
    GRAPHQL_ENDPOINT,
    HEADERS,
    fetchRequests,
  };