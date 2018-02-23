browser.runtime.onMessage.addListener((message) => {
  if (message.type == "browse") {
    displayPage(message.url);
  } else {
    console.error("Got unexpected message:", message);
  }
});

function displayPage(url) {
  element("#onboarding").style.display = "none";
  element("#browser-container").style.display = "";
  element("#browser-iframe").src = url;
  let urlObj = new URL(url);
  element("#browser-domain").textContent = urlObj.hostname;
}

function displayHome() {
  element("#browser-container").style.display = "none";
  element("#onboarding").style.display = "";
}

function element(selector) {
  return document.querySelector(selector);
}

element("#home").addEventListener("click", () => {
  displayHome();
});
