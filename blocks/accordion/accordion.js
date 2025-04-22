const accordionBlock = document.querySelector(".accordion.block");
const accordionChildren = accordionBlock.querySelectorAll("*");
accordionChildren.forEach(function(child) {
  child.classList.add("accordion-item");
});

const accordionItemFirst = document.querySelectorAll('.accordion-item > div:nth-child(1)');
accordionItemFirst.forEach(function(childitem){
    childitem.classList.add('accordion-header');
    childitem.classList.remove('accordion-item');
});

const accordionSecondItem = document.querySelectorAll('.accordion-item > div:nth-child(2)');
accordionSecondItem.forEach(function(childitemsecond){
    childitemsecond.classList.add('accordion-content');
    childitemsecond.classList.remove('accordion-item');
});

setTimeout(function() {
    const accordionItems = document.querySelectorAll('.accordion-item');  
    accordionItems.forEach(item => {
        item.addEventListener('click', function() {
        this.classList.toggle('active');
        });
    });
}, 1000);
