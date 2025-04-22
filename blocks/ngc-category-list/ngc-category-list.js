
export default function decorate(block) {
  const section = document.createElement("section");
  section.innerHTML = [...block.children][0].children[0].innerHTML;

  block.textContent = "";
  block.innerHTML = section.innerHTML;
}
