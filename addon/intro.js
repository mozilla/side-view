let foundSlides = 0;
let currentSlide = 0;

function selectSlide(num) {
  for (let i = 0; i < foundSlides; i++) {
    let el = document.querySelector(`#slide-${i}`);
    if (i === num) {
      el.classList.add("slide-displayed");
      el.classList.remove("slide-hidden");
    } else {
      el.classList.remove("slide-displayed");
      el.classList.add("slide-hidden");
    }
  }
  previous.disabled = num === 0;
  next.disabled = num === foundSlides - 1;
}

for (let el of document.querySelectorAll(".slide")) {
  let num = parseInt(el.id.replace(/[^\d]/g, ""), 10);
  foundSlides = Math.max(foundSlides + 1, num);
}

let previous = document.querySelector("#previous");
let next = document.querySelector("#next");
let done = document.querySelector("#done");

previous.addEventListener("click", () => {
  currentSlide = Math.max(0, currentSlide - 1);
  if (currentSlide === 0) {
    previous.classList.add("button-invisible");
  }
  if (currentSlide === foundSlides - 2) {
    next.classList.remove("button-hidden");
    done.classList.add("button-hidden");
  }
  selectSlide(currentSlide);
});

next.addEventListener("click", () => {
  currentSlide = Math.min(foundSlides - 1, currentSlide + 1);
  if (currentSlide === 1) {
    previous.classList.remove("button-invisible");
  }
  if (currentSlide === foundSlides - 1) {
    next.classList.add("button-hidden");
    done.classList.remove("button-hidden");
  }
  selectSlide(currentSlide);
});

done.addEventListener("click", () => {
  location.href = "popup.html";
});

selectSlide(currentSlide);

browser.runtime.sendMessage({
  type: "sendEvent",
  ec: "interface",
  ea: "onboarding-shown",
});
