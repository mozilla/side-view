/* globals buildSettings */
let lastDisplayedUrl;
let isDesktop = false;
let recentTabs = [];
const rerenderEvents = ["onUpdated", "onRemoved", "onCreated", "onMoved", "onDetached", "onAttached"];

async function displayPage({url, title, favIconUrl}) {
  // Note this must be called in response to an event, so we can't call it in background.js:
  await browser.sidebarAction.open();
  renderTabListLastRendered = {};
  lastDisplayedUrl = url;
  for (let eventName of rerenderEvents) {
    browser.tabs[eventName].removeListener(updateHome);
  }
  await browser.runtime.sendMessage({
    type: "openUrl",
    url,
    title,
    favIconUrl,
  });
  await sendEvent({
    ec: "content",
    ea: "load-url",
    el: "child-page",
    forUrl: url,
  });
  window.close();
}

async function updateHome(event) {
  if (event) {
    // If this is called from an event, then often browser.windows.getCurrent() won't
    // be updated, and will return stale information, so we'll rerender a second time
    // very soon
    setTimeout(updateHome, 50);
    setTimeout(updateHome, 300);
  }
  const windowInfo = await browser.windows.getCurrent({populate: true});
  let tabs = windowInfo.tabs.filter(tab => tab.url.startsWith("http"));
  if (tabs.length) {
    element("#open-tabs").style.display = "flex";
    renderTabList(tabs, "#open-tabs-list", "existing-tab");
  } else {
    element("#open-tabs").style.display = "none";
  }
  if (recentTabs.length) {
    element("#recent-tabs").style.display = "flex";
    renderTabList(recentTabs, "#recent-tabs-list", "recent-tab");
  } else {
    element("#recent-tabs").style.display = "none";
  }
  if (!tabs.length && !recentTabs.length) {
    element("#getting-started").style.display = "flex";
  } else {
    element("#getting-started").style.display = "none";
  }
  let onElement = element(".ask-for-desktop");
  let offElement = element(".ask-for-mobile");
  if (isDesktop) {
    [ onElement, offElement ] = [ offElement, onElement ];
  }
  element(".mobile-toggle").title = onElement.textContent;
  onElement.style.display = "";
  offElement.style.display = "none";
}

let renderTabListLastRendered = {};

function _onTabClick(event, tabs, url, favIconUrl, index, title, eventLabel) {
  sendEvent({
    ec: "interface",
    ea: "load-url",
    el: eventLabel,
    forUrl: url,
    cd4: tabs.length,
    cd5: index,
  });
  displayPage({
    url,
    favIconUrl,
    title,
  });
}

function renderTabList(tabs, containerSelector, eventLabel) {
  let renderedInfo = "";
  const tabList = element(containerSelector);
  const newTabList = tabList.cloneNode();
  tabs.forEach((tab, index) => {
    let li = document.createElement("li");
    let parent = document.createElement("div");
    let image = document.createElement("span");
    let text = document.createElement("span");
    let dismiss = document.createElement("button");
    parent.classList.add("tab__parent");
    image.classList.add("tab__image");
    text.classList.add("tab__text");
    dismiss.classList.add("tab__dismiss");
    dismiss.setAttribute("aria-label", "close button");
    dismiss.setAttribute("title", "Remove Tab from Recent List");
    let title = tab.title;
    let url = tab.url;
    let favIconUrl = null;
    if ("favIconUrl" in tab && tab.favIconUrl) {
      favIconUrl = tab.favIconUrl;
      image.style.backgroundImage = `url(${favIconUrl})`;
    }
    renderedInfo += favIconUrl + " ";
    let anchor = document.createElement("button");
    renderedInfo += url + " ";
    anchor.classList.add("tab");
    text.textContent = title;
    renderedInfo += title + "\n";
    anchor.addEventListener("click", (event) =>
      _onTabClick(event, tabs, url, favIconUrl, index, title, eventLabel));
    parent.addEventListener("click", (event) =>
      _onTabClick(event, tabs, url, favIconUrl, index, title, eventLabel));
    // Only add the dismiss button if its a recent tab
    if (eventLabel === "recent-tab") {
      dismiss.addEventListener("click", async (event) => {
      event.stopPropagation(); // prevent the selection of tab
       sendEvent({
         ec: "interface",
         ea: "dismiss-tab",
         el: eventLabel,
         cd4: tabs.length,
         cd5: index,
       });
       await browser.runtime.sendMessage({
        type: "dismissTab",
        index,
       });
      });
    }
    anchor.prepend(image);
    anchor.appendChild(text);
    parent.appendChild(anchor);
    if (eventLabel === "recent-tab") {
      parent.appendChild(dismiss);
    }
    li.appendChild(parent);
    newTabList.appendChild(li);
  });
  if (renderedInfo !== renderTabListLastRendered[containerSelector]) {
    tabList.replaceWith(newTabList);
    renderTabListLastRendered[containerSelector] = renderedInfo;
  }
}

function sendEvent(args) {
  // We bucket to the nearest 50px:
  args.cd1 = Math.round(window.innerWidth / 50) * 50;
  args.type = "sendEvent";
  browser.runtime.sendMessage(args);
}

function element(selector) {
  return document.querySelector(selector);
}

if (buildSettings.isAmo) {
  element(".feedback-button").style.display = "none";
} else {
  element(".feedback-button").addEventListener("click", () => {
    window.open("https://qsurvey.mozilla.com/s3/side-view?ref=doorhanger");
    sendEvent({
      ec: "interface",
      ea: "button-click",
      el: "feedback",
      forUrl: lastDisplayedUrl,
    });
  });
}

element(".mobile-toggle").addEventListener("click", async () => {
  await browser.sidebarAction.open();
  await browser.runtime.sendMessage({
    type: "toggleDesktop",
  });
  sendEvent({
    ec: "interface",
    ea: "button-click",
    // Note: background.js changes this label based on whether it's desktop or not
    el: "toggle-desktop",
  });
});

element("#close-private-warning").addEventListener("click", async () => {
  await browser.runtime.sendMessage({
    type: "turnOffPrivateWarning",
  });
  element("#private-warning").style.display = "none";
});

function loadCachedRecentTabs() {
  let value = localStorage.getItem("recentTabs") || "[]";
  value = JSON.parse(value);
  return value;
}

function cacheRecentTabs(value) {
  localStorage.setItem("recentTabs", JSON.stringify(value));
}

function applyDarkTheme() {
  document.body.style.background = "#4a4a4f";
  document.body.style.color = "#fff";
  document.querySelector("#panel").classList.add("dark-theme");
}

async function checkForDark() {
  browser.management.getAll().then((extensions) => {
    for (let extension of extensions) {
    // The user has the default dark theme enabled
    if (extension.id ===
      "firefox-compact-dark@mozilla.org@personas.mozilla.org"
      && extension.enabled) {
        applyDarkTheme();
      }
    }
  });
}

async function init() {
  document.addEventListener("contextmenu", event => event.preventDefault());

  browser.runtime.onMessage.addListener((message) => {
    if (message.type === "updateRecentTabs") {
      recentTabs = message.recentTabs;
      updateHome();
      cacheRecentTabs(recentTabs);
    } else if (message.type === "isDesktop") {
      isDesktop = message.isDesktop;
      updateHome();
    } else if (["setDesktop", "sendEvent", "sidebarOpened", "sidebarOpenedPage", "sidebarDisplayedHome", "getRecentTabs"].includes(message.type)) {
      // These intended to go to the backgrond and can be ignored here
    } else {
      console.error("Got unexpected message:", message);
    }
  });

  recentTabs = loadCachedRecentTabs();
  updateHome();

  let info = await browser.runtime.sendMessage({
    type: "getRecentAndDesktop",
  });
  recentTabs = info.recentTabs;
  isDesktop = info.isDesktop;
  if (info.incognito && !info.hasSeenPrivateWarning) {
    element("#private-warning").style.display = "";
  }
  updateHome();

  // Listen for tab changes to update while popup is still open
  for (let eventName of rerenderEvents) {
    browser.tabs[eventName].addListener(updateHome);
  }
  checkForDark();
}

init();
