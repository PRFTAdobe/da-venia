
export default async function decorate(block) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const orderID = urlParams.get('order');

  const successEle = block.querySelector(".ngc-success>div>div");
  const orderNumEle = document.createElement("p");
  orderNumEle.classList.add("order-det");
  orderNumEle.innerHTML = `Order Number: <span class="order-num">${orderID}</span>`;
  successEle.append(orderNumEle);


  const redirectLink = document.createElement("p");
  redirectLink.classList.add("redirect-link");
  redirectLink.innerHTML = `<a href="/product-list/">Continue Shopping</a>`;
  successEle.append(redirectLink);
}