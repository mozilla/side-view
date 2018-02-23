browser.runtime.onMessage.addListener((message) => {
  if (message.windowId && thisWindowId && message.windowId != thisWindowId) {
    // Not intended for this window
    return;
  }
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
  browser.windows.getCurrent({populate: true}).then((windowInfo) => {
    let tabList = element("#tabs");
    tabList.innerHTML = "";
    for (let tab of windowInfo.tabs) {
      let li = document.createElement("li");
      let image = document.createElement("img");
      image.src = tab.favIconUrl;
      let anchor = document.createElement("a");
      anchor.href = tab.url;
      anchor.textContent = tab.title;
      anchor.addEventListener("click", (event) => {
        displayPage(event.target.href);
        event.preventDefault();
        return false;
      })
      anchor.prepend(image);
      li.appendChild(anchor);
      tabList.appendChild(li);
    }
    console.log("would set", windowInfo);
  }).catch((error) => {
    console.error("Error getting window info:", error);
  });
}

function element(selector) {
  return document.querySelector(selector);
}

element("#home").addEventListener("click", () => {
  displayHome();
});

let thisWindowId;
browser.windows.getCurrent().then((windowInfo) => {
  thisWindowId = windowInfo.id;
});

displayHome();
