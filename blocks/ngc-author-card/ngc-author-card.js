export default function decorate(block) {
  const section = document.createElement("section");
  section.innerHTML = [...block.children][0].innerHTML;
  [...section.children].forEach((div) => {
    if (div.children.length === 1 && div.querySelector("picture")) {
      div.className = "ngc-author-card--image";
      div.querySelector("img").style.aspectRatio = "1/1";
    } else {
      div.className = "ngc-author-card--body";
    }
  });

  block.textContent = "";
  block.append(section);
}
