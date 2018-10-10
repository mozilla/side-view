let foundSlides = 0;
let currentSlide = 0;

function selectSlide(num) {
  for (let i = 0; i < foundSlides; i++) {
    let el = document.querySelector(`#slide-${i}`);
    let selectButton = document.querySelector(`#select-${i}`);
    if (i === num) {
      el.classList.add("slide-displayed");
      el.classList.remove("slide-hidden");
      selectButton.classList.add("selected");
    } else {
      el.classList.remove("slide-displayed");
      el.classList.add("slide-hidden");
      selectButton.classList.remove("selected");
    }
  }
  previous.disabled = (num === 0);
  next.disabled = (num === foundSlides - 1);
}

for (let el of document.querySelectorAll(".slide")) {
  let num = parseInt(el.id.replace(/[^\d]/g, ""), 10);
  foundSlides = Math.max(foundSlides + 1, num);
  let button = document.querySelector(`#select-${num}`);
  button.addEventListener("click", () => {
    selectSlide(num);
  });
}

let previous = document.querySelector("#previous");

previous.addEventListener("click", () => {
  currentSlide = Math.max(0, currentSlide - 1);
  selectSlide(currentSlide);
});

let next = document.querySelector("#next");

next.addEventListener("click", () => {
  currentSlide = Math.min(foundSlides - 1, currentSlide + 1);
  selectSlide(currentSlide);
});

selectSlide(currentSlide);
