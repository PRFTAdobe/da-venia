import { activeEndPoint } from "../ngc-endpoint/graphQLMutations/utility.js";
import { generateCarousel, handleCarousel } from "./carousel.js";

import { generateProductInfo } from "./product-info.js";

let carouselCode;

async function createProductUI(dataURL) {
  const res = await fetch(dataURL);
  const datajson = await res.json();

  const section = document.createElement("section");
  carouselCode = generateCarousel(datajson.images);
  section.appendChild(carouselCode);

  const productInfo = generateProductInfo(datajson);
  section.appendChild(productInfo);

  section.id = datajson.id;
  return section;
}

function appendProductDetails() {
  const prodDet = document.querySelector(
    ".product-template .product-wrapper+.tabs-wrapper"
  );
  if (prodDet) {
    const prodDetailsEle = document.querySelector(
      ".product-template .product-wrapper .product--details"
    );
    prodDetailsEle.append(prodDet);
  }
}

function appendCaraousel() {
  if (window.window.innerWidth < 992) {
    if (document.querySelector(".carousel-wrapper .carousel-container")) {
      document.querySelector(".carousel-container").remove();
      document.querySelector(".product--images").appendChild(carouselCode);
    }
  }
}

export default async function decorate(block) {
  const infoJSON = block.querySelector("a");
  if (infoJSON) {
    const dataEle = await createProductUI(infoJSON.href);
    block.innerHTML = dataEle.innerHTML;
  }

  appendCaraousel();

  if (window.window.innerWidth > 992) {
    appendProductDetails();
  }

  handleCarousel();
}

async function getProducts() {
  const results = await fetch(
    `https:${activeEndPoint}/graphql?query=%7B%0A%20%20products(filter%3A%20%7B%20price%3A%20%7B%20from%3A%20%220%22%20to%3A%20%229999%22%7D%20%7D%0A%20%20sort%3A%20%7B%0A%20%20%20%20price%3A%20ASC%0A%20%20%7D)%20%7B%0A%20%20%20%20total_count%0A%20%20%20%20items%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20sku%0A%20%20%20%20%20%20description%20%7B%0A%20%20%20%20%20%20%20%20html%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20price_range%20%7B%0A%20%20%20%20%20%20%20%20maximum_price%20%7B%0A%20%20%20%20%20%20%20%20%20%20regular_price%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20value%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A`
  );
  const prod = await results.json();
  // console.log("getProducts", prod.data);
}

getProducts();
