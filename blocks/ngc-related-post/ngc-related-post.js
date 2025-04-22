export default function decorate(block) {
  const section = document.createElement("section");
  [...block.children].forEach((row) => {
    row.innerHTML = row.children[0].innerHTML;
    row.className = "ngc-related-post--card";
    [...row.children].forEach((ele) => {
      if (ele.children.length === 1 && ele.querySelector('picture')) ele.className = 'ngc-related-post--card__image';
      else ele.className = 'ngc-related-post--card__title';
    });
    section.append(row);
  });

  block.textContent = "";
  block.innerHTML = section.innerHTML;
}
