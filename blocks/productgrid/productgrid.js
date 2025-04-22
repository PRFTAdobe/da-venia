import { activeEndPoint } from "../ngc-endpoint/graphQLMutations/utility";
// import { createOptimizedPicture } from '../../scripts/aem.js';
export {getProduct}

let product = {
  image: '',
  description: '',
  name: '',
  stock: '',
  price: '',
  currency: '',
};

async function getProduct(sku) {
  const graphqlEndPoint = `https:${activeEndPoint}/graphql?query=`;
  const queryParam = `
        {
          products(filter: {sku: {in: ["${sku}"]}}) {
            items {
              name
              sku
              description {
                html
              }
              image {
                url
                label
                position
                disabled
              }
              small_image {
                url
                label
                position
                disabled
              }
              thumbnail {
                url
                label
                position
                disabled
              }
              stock_status
              price_range {
                minimum_price {
                  discount {
                    percent_off
                    amount_off
                  }
                  final_price {
                    value
                    currency
                  }
                  regular_price {
                    value
                  }
                }
              }
            }
          }
        }`;

  const productQuery = graphqlEndPoint + queryParam;
  const data = await fetch(productQuery);
  const result = await data.json();
  product = {
    image: result.data.products.items[0].image.url,
    description: result.data.products.items[0].description.html,
    name: result.data.products.items[0].name,
    stock: result.data.products.items[0].stock_status,
    price: result.data.products.items[0].price_range.minimum_price.final_price.value,
    currency: result.data.products.items[0].price_range.minimum_price.final_price.currency,
    sku: result.data.products.items[0].sku,
  };
  return product;
}

export default async function decorate(block) {
  // change to ul, li 
  const ul = document.createElement('ul');
  // eslint-disable-next-line no-restricted-syntax
  for await (const row of [...block.children]) {
    const sku = row.children[0].innerHTML;
    // Get product information from graphQL:
    product = await getProduct(sku);

    const li = document.createElement('li');

    const productImageDiv = document.createElement('div');
    productImageDiv.classList.add('product-card-image');
    productImageDiv.innerHTML = `<picture>
            <source type="image/jpeg" srcset="${product.image}">
            <img loading="lazy" alt="A fast-moving Tunnel" src="${product.image}?width=750&amp;format=jpeg&amp;optimize=medium">
            </picture>`;
    li.appendChild(productImageDiv);

    const productBodyDiv = document.createElement('div');
    productBodyDiv.classList.add('product-card-body');
    productBodyDiv.innerHTML = `<p align="center">${product.name}</p><p align="center" class="prod-price">${product.price} ${product.currency} (${product.stock})</p><p class="prod-description">${product.description}</p>`;
    li.appendChild(productBodyDiv);

    ul.append(li);
  }

  // eslint-disable-next-line max-len
  // ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
}
