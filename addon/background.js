/* global TestPilotGA, buildSettings */

const USER_AGENT = "Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0";
// iOS:
//   Mozilla/5.0 (iPhone; CPU iPhone OS 9_2 like Mac OS X) AppleWebKit/601.1 (KHTML, like Gecko) CriOS/47.0.2526.70 Mobile/13C71 Safari/601.1.46
// Firefox for Android:
//   Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0
// Chrome for Android:
//   Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19

const manifest = browser.runtime.getManifest();
const sidebarUrls = new Map();

const ga = new TestPilotGA({
  an: "tab-split-2",
  aid: manifest.applications.gecko.id,
  aiid: "testpilot",
  av: manifest.version,
  // cd19 could also be dev or stage:
  cd19: buildSettings.NODE_ENV === "prod" ? "production" : "local",
  ds: "addon",
  tid: buildSettings.NODE_ENV === "prod" ? "UA-77033033-7" : "",
});

function sendEvent(...args) {
  ga.sendEvent(...args);
}

sendEvent("startup", "startup", {ni: true});

browser.contextMenus.create({
  id: "open-in-sidebar",
  title: "Open in sidebar",
  contexts: ["page", "tab"],
  documentUrlPatterns: ["<all_urls>"]
});

browser.contextMenus.create({
  id: "open-link-in-sidebar",
  title: "Open link in sidebar",
  // FIXME: could add "bookmark", but have to fetch by info.bookmarkId
  contexts: ["link"],
  documentUrlPatterns: ["<all_urls>"]
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  let url = info.linkUrl || tab.url;
  if (info.linkUrl) {
    sendEvent("browse", "context-menu-link");
  } else {
    // FIXME: should distinguish between clicking in the page, and on the tab:
    sendEvent("browse", "context-menu-page");
  }
  // FIXME: should send something in the event about whether the sidebar is already open
  // FIXME: should send something in the event about whether tab.id === -1 (probably from the sidebar itself)
  await browser.sidebarAction.open();
  await openUrl(url);
});

browser.browserAction.onClicked.addListener(async () => {
  await browser.sidebarAction.open();
  sendEvent("browse", "browserAction");
  let tabs = await browser.tabs.query({active: true, currentWindow: true});
  let url = tabs[0].url;
  await openUrl(url);
});

async function openUrl(url, windowId = null) {
  // FIXME: should send something in an event about whether the desktop has already been set
  if (!windowId) {
    windowId = (await browser.windows.getCurrent()).id;
  }
  let desktop = !!desktopHostnames[(new URL(url)).hostname];
  let message = {type: "browse", url, windowId, desktop};
  sidebarUrls.set(windowId, url);
  return retry(() => {
    return browser.runtime.sendMessage(message);
  }, {times: 3, wait: 50});
}

browser.runtime.onMessage.addListener((message) => {
  if (message.type === "setDesktop") {
    setDesktop(message.desktop, message.url);
  } else if (message.type === "sendEvent") {
    ga.sendEvent(message.ec, message.ea, message.eventParams);
  } else if (message.type === "sidebarOpened") {
    let windowId = message.windowId;
    if (sidebarUrls.get(windowId)) {
      openUrl(sidebarUrls.get(windowId), windowId);
    }
  } else if (message.type === "sidebarOpenedPage") {
    sidebarUrls.set(message.windowId, message.url);
  } else if (message.type === "sidebarDisplayHome") {
    sidebarUrls.delete(message.windowId);
  } else {
    console.error("Unexpected message to background:", message);
  }
});

// This is a RequestFilter: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/RequestFilter
// It matches tabs that aren't attached to a normal location (like a sidebar)
// It only matches embedded iframes
let requestFilter = {
  tabId: -1,
  types: ["sub_frame"],
  urls: ["http://*/*", "https://*/*"],
};

let desktopHostnames = {};

async function setDesktop(desktop, url) {
  let hostname = (new URL(url)).hostname;
  if (desktop) {
    desktopHostnames[hostname] = true;
  } else {
    delete desktopHostnames[hostname];
  }
  await browser.storage.sync.set({desktopHostnames});
}

// Add a mobile header to outgoing requests
browser.webRequest.onBeforeSendHeaders.addListener(function (info) {
  let hostname = (new URL(info.url)).hostname;
  if (desktopHostnames[hostname]) {
    return {};
  }
  let headers = info.requestHeaders;
  for (let i = 0; i < headers.length; i++) {
    let name = headers[i].name.toLowerCase();
    if (name === "user-agent") {
      headers[i].value = USER_AGENT;
      return {"requestHeaders": headers};
    }
  }
  return {};
}, requestFilter, ["blocking", "requestHeaders"]);

// Remove X-Frame-Options to allow any page to be embedded in an iframe
chrome.webRequest.onHeadersReceived.addListener(function (info) {
  let headers = info.responseHeaders;
  let madeChanges = false;
  for (let i = 0; i < headers.length; i++) {
    let name = headers[i].name.toLowerCase();
    if (name === "x-frame-options" || name === "frame-options") {
      headers.splice(i, 1);
      i--;
      madeChanges = true;
    }
    if (name === "content-security-policy") {
      headers[i].value = headers[i].value.replace(/frame-ancestors[^;]*;?/i, "");
      madeChanges = true;
    }
  }
  if (madeChanges) {
    return {"responseHeaders": headers};
  }
  return {};
}, requestFilter, ["blocking", "responseHeaders"]);

async function retry(attempter, options) {
  let times = options.times || 3;
  let wait = options.wait || 100;
  try {
    return await attempter();
  } catch (error) {
    times--;
    if (times <= 0) {
      throw error;
    }
    await timeout(wait);
    return retry(attempter, {times, wait});
  }
}

function timeout(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

async function init() {
  const result = await browser.storage.sync.get("desktopHostnames");
  desktopHostnames = result.desktopHostnames || {};
}

init();
