export default function decorate(block) {
  const section = document.createElement("section");
  section.innerHTML = [...block.children][0].innerHTML;
  [...section.children].forEach((div) => {
    if (div.children.length === 1 && div.querySelector("picture"))
      div.className = "standalone-external-card--image";
    else div.className = "standalone-external-card--body";
  });

  block.textContent = "";
  block.innerHTML=section.innerHTML;
  var el = document.querySelector('div.standalone-external-card.block');
  var link=el.querySelector('a');
  var wrapper = document.createElement('a');
  wrapper.href=link.getAttribute('href');
  wrapper.title=link.innerHTML
  wrapper.target="_blank";
  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);
}