export function generateCarousel(imgArray) {
  // wrapper container for the whole carousel
  const carouselWrapper = document.createElement("div");
  carouselWrapper.classList.add("carousel-wrapper");

  // main container for the whole carousel
  const carouselContainer = document.createElement("div");
  carouselContainer.classList.add("carousel-container");

  // container for the scrollable images
  const itemContainer = document.createElement("div");
  itemContainer.classList.add("carousel-item-container");

  // container for the images
  const mainImageContainer = document.createElement("div");
  mainImageContainer.classList.add("main-image-container");

  // container for the thumbnails
  const thumbNailContainer = document.createElement("div");
  thumbNailContainer.classList.add("carousel-item-thumbnails");

  //container for chicklets
  const thumbNailChicketContainer = document.createElement("div");
  thumbNailChicketContainer.classList.add("carousel-item-chicklets");

  // container for the previous arrow
  const previousArrowContainer = document.createElement("div");
  previousArrowContainer.classList.add("carousel-prev");
  const previousArrow = document.createElement("div");
  previousArrow.classList.add("arrow", "left");
  previousArrowContainer.innerHTML = previousArrow.outerHTML;

  // container for the next arrow
  const nextArrowContainer = document.createElement("div");
  nextArrowContainer.classList.add("carousel-next");
  const nextArrow = document.createElement("div");
  nextArrow.classList.add("arrow", "right");
  nextArrowContainer.innerHTML = nextArrow.outerHTML;

  // append images to main container
  imgArray.forEach((image, index) => {
    const imgEl = document.createElement("img");
    imgEl.loading = "lazy";
    if (index === 0) {
      imgEl.loading = "eager";
    }
    imgEl.src = image;
    imgEl.alt = "";
    imgEl.width = "300";
    imgEl.height = "auto";
    mainImageContainer.append(imgEl);
  });

  // append images to thumbnails
  imgArray.forEach((image, index) => {
    const imgEl = document.createElement("img");
    index === 0 && imgEl.classList.add("current-image");
    imgEl.loading = "eager";
    imgEl.src = image;
    imgEl.alt = "";
    imgEl.width = "100";
    imgEl.height = "auto";
    imgEl.dataset.imageNumber = index;
    thumbNailContainer.append(imgEl);
  });

  for (let i = 0; i < imgArray.length; i++) {
    const el = document.createElement("div");
    el.classList.add("thumbnail-chicklet");
    el.dataset.imageNumber = i;
    i == 0 && el.classList.add("current");
    thumbNailChicketContainer.append(el);
  }

  itemContainer.append(mainImageContainer);
  carouselContainer.append(
    previousArrowContainer,
    itemContainer,
    nextArrowContainer,
    thumbNailContainer,
    thumbNailChicketContainer
  );
  carouselWrapper.append(carouselContainer);

  return carouselWrapper;
}

export function handleCarousel() {
  let lastImage = 0;
  let currentImage = 0;
  const carouselImageContainer = document.querySelector(
    ".carousel-item-container"
  );

  window.addEventListener("resize", () => {
    carouselImageContainer.scrollTo({
      left:
        currentImage *
        document.querySelector(".carousel-item-container").offsetWidth,
    });
  });

  const thumbNailImages = document.querySelectorAll(
    ".carousel-item-thumbnails img"
  );

  thumbNailImages.forEach((image) => {
    image.addEventListener("click", (e) => {
      const imageNumber = parseInt(e.target.dataset.imageNumber);
      slideToImage(imageNumber);
    });
  });

  lastImage = thumbNailImages.length - 1;

  const previousArrow = document.querySelector(".carousel-prev > div");
  const nextArrow = document.querySelector(".carousel-next > div");

  previousArrow.addEventListener("click", () => {
    let slideToImageNumber = currentImage === 0 ? lastImage : currentImage - 1;
    slideToImage(slideToImageNumber);
  });

  nextArrow.addEventListener("click", () => {
    let slideToImageNumber = currentImage === lastImage ? 0 : currentImage + 1;
    slideToImage(slideToImageNumber);
  });

  const slideToImage = (num) => {
    const highLightThumbNail = (num) => {
      const currentSelectedThumbnail = document.querySelector(
        ".carousel-item-thumbnails img.current-image"
      );

      const newSelectedThumbnail = document.querySelector(
        `.carousel-item-thumbnails img[data-image-number="${num}"]`
      );

      const currentSelectedChicklet = document.querySelector(
        ".thumbnail-chicklet.current"
      );

      const newSelectedChicklet = document.querySelector(
        `.thumbnail-chicklet[data-image-number="${num}"]`
      );

      currentSelectedThumbnail.classList.remove("current-image");
      newSelectedThumbnail.classList.add("current-image");

      currentSelectedChicklet.classList.remove("current");
      newSelectedChicklet.classList.add("current");
    };

    carouselImageContainer.scrollTo({
      left:
        num * document.querySelector(".carousel-item-container").offsetWidth,
      behavior: "smooth",
    });
    currentImage = num;
    highLightThumbNail(currentImage);
  };
}
