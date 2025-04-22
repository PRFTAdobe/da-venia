const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function getProductTitle(title = "", brand = "", category = "") {
  document.title = title;
  return `<span class="product--pre-title">${brand}: ${category}</span>
          <h1 class="product--title">${title}</h1>
          `;
}

function getProductRatings(rating) {
  if (rating > 0) {
    const ratingPercentage = (rating / 5) * 100;
    return `<div class="product--ratings"><span>${rating}</span> <div class="product--ratings__star-rating">
        <div class="product--ratings__fill" style="width: ${ratingPercentage}%;">
          <span>★★★★★</span>
        </div>
        <div class="product--ratings__empty">
          <span>★★★★★</span>
        </div>
      </div></div>`;
  }
  return `<div class="ratings empty"><em>Be the first to review this product</em></div>`;
}

function getPrice(price, discountPercentage) {
  if (discountPercentage > 0) {
    const discount = discountPercentage / 100;
    const discountedPrice = price * (1 - discount);
    return `<div class="product--price">
              <p class="product--price__discounted">
                <span class="product--price__discount-percentage">-${Math.round(
                  discountPercentage
                )}%</span>
                ${currencyFormatter.format(discountedPrice)}</p>
              <p class="product--price__listed">List Price: <s>${currencyFormatter.format(
                price
              )}</s></p>
            </div>`;
  }
  return `<div class="product--price"><p>${currencyFormatter.format(
    price
  )}</p></div>`;
}

function getStockDetails(stock) {
  if (stock < 5) {
    return `<p class="product--stock full-width">only ${stock} left in stock</p>`;
  }
  return `<p class="product--stock">In Stock</p>`;
}

export function generateProductInfo(productData) {
  // let productInfoHtml = "";
  const info = document.createElement("div");
  if (productData) {
    info.classList.add("product-info-container");

    info.innerHTML = `
        <div class="product-info-content">
          <section class="product-info--header">
            ${getProductTitle(
              productData.title,
              productData.brand,
              productData.category
            )}
            ${getProductRatings(productData.rating)}
          </section>
          <section class="product--images"></section>
          <section class="product-info--selling">
            ${getPrice(productData.price, productData.discountPercentage)}
            ${getStockDetails(productData.stock)}
          </section>
          <section class="product--details">
          </section>
        </div>
        <div>
          <button class="product--button__add-cart" onclick="event.target.classList.add('success')">Add to Cart</button>
          <p class="success-message">&check; added to the cart</p>
        </div>
      `;
  }

  return info;
}
