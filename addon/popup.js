let lastDisplayedUrl;
let thisWindowId;
let recentTabs = [];
const rerenderEvents = ["onUpdated", "onRemoved", "onCreated", "onMoved", "onDetached", "onAttached"];

async function displayPage(url, desktop, hasTransition = true ) {
  renderTabListLastRendered = {};
  lastDisplayedUrl = url;
  browser.sidebarAction.setPanel({panel: url});
  for (let eventName of rerenderEvents) {
    browser.tabs[eventName].removeListener(updateHome);
  }
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
  renderTabList(tabs, "#open-tabs-list", "existing-tab");
  renderTabList(recentTabs, "#recent-tabs-list", "recent-tab");
}

let renderTabListLastRendered = {};

function renderTabList(tabs, containerSelector, eventLabel) {
  let renderedInfo = "";
  const tabList = element(containerSelector);
  const newTabList = tabList.cloneNode();
  tabs.forEach((tab, index) => {
    let li = document.createElement("li");
    let image = document.createElement("span");
    let text = document.createElement("span");
    image.classList.add("tab__image");
    text.classList.add("tab__text");
    let title = tab.title;
    let url = tab.url;
    let favIconUrl = null;
    if ("favIconUrl" in tab && tab.favIconUrl) {
      favIconUrl = tab.favIconUrl;
      image.style.backgroundImage = `url(${favIconUrl})`;
    }
    renderedInfo += favIconUrl + " ";
    let anchor = document.createElement("a");
    renderedInfo += url + " ";
    anchor.classList.add("tab");
    text.textContent = title;
    renderedInfo += title + "\n";
    anchor.addEventListener("click", (event) => {
      browser.runtime.sendMessage({
        type: "sidebarOpenedPage",
        windowId: thisWindowId,
        url,
        favIconUrl,
        title
      });
      sendEvent({
        ec: "interface",
        ea: "load-url",
        el: eventLabel,
        forUrl: url,
        cd4: tabs.length,
        cd5: index
      });
      displayPage(url);
    });
    anchor.prepend(image);
    anchor.appendChild(text);
    li.appendChild(anchor);
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

element(".feedback-button").addEventListener("click", () => {
  sendEvent({
    ec: "interface",
    ea: "button-click",
    el: "feedback",
    forUrl: lastDisplayedUrl,
  });
});

async function init() {
  const windowInfo = await browser.windows.getCurrent();
  thisWindowId = windowInfo.id;

  browser.runtime.onMessage.addListener((message) => {
    if (message.windowId && thisWindowId && message.windowId !== thisWindowId) {
      // Not intended for this window
      return;
    }
    if (message.type === "browse") {
      displayPage(message.url, message.desktop, false);
    } else if (message.type === "updateRecentTabs") {
      recentTabs = message.recentTabs;
      updateHome();
    } else if (["setDesktop", "sendEvent", "sidebarOpened", "sidebarOpenedPage", "sidebarDisplayedHome", "getRecentTabs"].includes(message.type)) {
      // These intended to go to the backgrond and can be ignored here
    } else {
      console.error("Got unexpected message:", message);
    }
  });

  browser.runtime.sendMessage({type: "sidebarOpened", windowId: thisWindowId});

  recentTabs = await browser.runtime.sendMessage({
    type: "getRecentTabs"
  });
  updateHome();
}

init();
