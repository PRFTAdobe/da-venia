import { checkoutMutations} from '../ngc-endpoint/graphQLMutations/checkoutMutations.js';
import { getCartIDFromLS} from '../ngc-endpoint/graphQLMutations/miscMutations.js';

async function generateOrderSummaryUI() {
  const cartId = getCartIDFromLS();
  if(cartId){
    const priceDetails = await checkoutMutations.getPriceSummary(cartId);
    
    if(priceDetails.items.length){
      let totalDiscount = 0;
      let discountMarkup = ``;
      await priceDetails.prices.discounts.forEach(discount => {
        totalDiscount += discount.amount.value;
        discountMarkup += `<li>
          <span>Discount</span> 
          <span>-$${discount.amount.value}</span>
        </li>`
        
      })
  
    return `
        <ul class="order-summary">
          <li class="subtotal">
            <span>Subtotal</span> 
            <span>$${priceDetails.prices.subtotal_excluding_tax.value}</span></li>
          <li class="applied-discount">
            <span>Applied Discount
              ${discountMarkup.length
                ? `<button type="button" aria-expanded="false" aria-label="Show individual discounts." class="discout-summary-btn">
                    <span class="icon-root-2x9 items-center inline-flex justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-icon-_rq"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                  </button>`
                : ''
              }
            </span>
            <span>-$${totalDiscount}</span>
          </li>
          <div class="applied-discout-toggle">${discountMarkup.length? `<ul><hr> ${discountMarkup} <hr></ul>`: ''}</div>
          ${priceDetails.prices.applied_taxes.length?
            `<li class="estimated-tax">
            <span>Estimated Tax</span> 
            <span>$${priceDetails.prices.applied_taxes[0].amount.value}</span>
          </li>`:``
          }
          ${priceDetails.shipping_addresses.length && priceDetails.shipping_addresses[0].selected_shipping_method?
            `<li class="estimated-shipping">
            <span>Estimated Shipping</span> 
            <span>$${priceDetails.shipping_addresses[0].selected_shipping_method.amount.value}</span>
          </li>`:``
          }
          
          <li class="estimated-total">
            <span>Estimated Total</span> 
            <span>$${priceDetails.prices.grand_total.value}</span>
          </li>
        </ul>
        <button onclick="window.location='/checkout/'" class="cta-checkout">Proceed to Checkout</button>
      `;
      }else{
        return ``;
      }
  }else{
    return ``;
  }
}
function bindToggleOnDiscount() {
  const discountSummaryBtn = document.querySelector('.discout-summary-btn');
  if (discountSummaryBtn) {
    const appliedDiscount = document.querySelector('.applied-discount');
    discountSummaryBtn.addEventListener('click', function() {
      appliedDiscount.classList.toggle('active');
    });
  }
}
export function processingOrderSummary(isProcessing){
    const orderSummaryEle = document.querySelector(".ngc-order-summary");
    isProcessing 
    ? orderSummaryEle.classList.add('processing')
    : orderSummaryEle.classList.remove('processing');
}
export async function renderOrderSummary() {
  const wrapper = document.querySelector('.ngc-order-summary');
  wrapper.innerHTML = await generateOrderSummaryUI();
  bindToggleOnDiscount();
  processingOrderSummary(false);
}
export default async function decorate(block) {
  block.textContent = "";
  await renderOrderSummary();
}
