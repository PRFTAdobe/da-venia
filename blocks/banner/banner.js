import { createOptimizedPicture } from "../../scripts/lib-franklin.js";
export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`banner-${cols.length}-cols`);

  // setup image blogs
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector("picture");
      if (pic) {
        const picWrapper = pic.closest("div");
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add("banner-img-col");
          picWrapper
            .querySelectorAll("img")
            .forEach((img) =>
              img
                .closest("picture")
                .replaceWith(createOptimizedPicture(img.src, img.alt, true))
            );

          picWrapper.querySelectorAll("img").forEach((img) => {
            img.setAttribute("width", "300");
            img.setAttribute("height", "200");
          });
        }
      } else {
        col.classList.add("banner-txt-col");
      }
    });
  });
}
