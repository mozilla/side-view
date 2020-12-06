const FIREFOX_VERSION = /rv:([0-9.]+)/.exec(navigator.userAgent)[1];

const USER_AGENT = `Mozilla/5.0 (Android 4.4; Mobile; rv:${FIREFOX_VERSION}) Gecko/${FIREFOX_VERSION} Firefox/${FIREFOX_VERSION}`;
// iOS:
//   Mozilla/5.0 (iPhone; CPU iPhone OS 9_2 like Mac OS X) AppleWebKit/601.1 (KHTML, like Gecko) CriOS/47.0.2526.70 Mobile/13C71 Safari/601.1.46
// Firefox for Android:
//   Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0
// Chrome for Android:
//   Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19

// If you update DEFAULT_DESKTOP_SITES you should also increment DEFAULT_DESKTOP_VERSION
const DEFAULT_DESKTOP_SITES = [
  "www.youtube.com",
  "www.metacafe.com",
  "myspace.com",
  "imgur.com",
];

const DEFAULT_DESKTOP_VERSION = 1;

const MAX_RECENT_TABS = 5;
let sidebarUrl;
let hasSeenPrivateWarning = false;

browser.contextMenus.create({
  id: "open-in-sidebar",
  title: "Open in Side View",
  contexts: ["page", "tab", "bookmark"],
  documentUrlPatterns: ["<all_urls>"],
});

browser.contextMenus.create({
  id: "open-link-in-sidebar",
  title: "Open link in Side View",
  // FIXME: could add "bookmark", but have to fetch by info.bookmarkId
  contexts: ["link"],
  documentUrlPatterns: ["<all_urls>"],
});

browser.commands.onCommand.addListener(async command => {
  if (command === "toggle-sidebar") {
    await browser.sidebarAction.toggle();
  }
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  let url;
  let favIconUrl;
  let title;
  let incognito = tab && tab.incognito;
  await browser.sidebarAction.open();
  if (info.linkUrl) {
    url = info.linkUrl;
  } else if (info.bookmarkId) {
    let bookmarkInfo = await browser.bookmarks.get(info.bookmarkId);
    url = bookmarkInfo[0].url;
  } else {
    url = tab.url;
    title = tab.title;
    favIconUrl = tab.favIconUrl;
  }
  if (title && !incognito) {
    // In cases when we can't get a good title and favicon, we just don't bother saving it as a recent tab
    addRecentTab({url, favIconUrl, title});
  }
  openUrl(url);
});

browser.pageAction.onClicked.addListener((async (tab) => {
  let url = tab.url;
  if (!tab.incognito) {
    addRecentTab({url, favIconUrl: tab.favIconUrl, title: tab.title});
  }
  await browser.sidebarAction.open();
  openUrl(url);
}));

async function openUrl(url) {
  sidebarUrl = url;
  let hostname = (new URL(url)).hostname;
  let isDesktop = !!desktopHostnames[hostname];
  browser.runtime.sendMessage({
    type: "isDesktop",
    isDesktop,
  }).catch((error) => {
    // If the popup is not open this gives an error, but we don't care
  });
  browser.sidebarAction.setPanel({panel: url});
}

/* eslint-disable consistent-return */
// Because this dispatches to different kinds of functions, its return behavior is inconsistent
browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === "toggleDesktop") {
    toggleDesktop();
  } else if (message.type === "openUrl") {
    openUrl(message.url);
    let windowInfo = await browser.windows.getCurrent();
    if (!windowInfo.incognito) {
      addRecentTab(message);
    }
  } else if (message.type === "dismissTab") {
    dismissRecentTab(message.index);
  } else if (message.type === "getRecentAndDesktop") {
    let isDesktop = false;
    if (sidebarUrl) {
      let hostname = (new URL(sidebarUrl)).hostname;
      isDesktop = !!desktopHostnames[hostname];
    }
    let currentWindow = await browser.windows.getCurrent();
    return Promise.resolve({
      recentTabs,
      isDesktop,
      hasSeenPrivateWarning,
      incognito: currentWindow.incognito,
    });
  } else if (message.type === "turnOffPrivateWarning") {
    turnOffPrivateWarning();
  } else {
    console.error("Unexpected message to background:", message);
  }
});
/* eslint-enable consistent-return */

// This is a RequestFilter: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/RequestFilter
// It matches tabs that aren't attached to a normal location (like a sidebar)
// It only matches embedded iframes
let requestFilter = {
  tabId: -1,
  types: ["main_frame"],
  urls: ["http://*/*", "https://*/*"],
};

let desktopHostnames = {};

async function toggleDesktop() {
  if (!sidebarUrl) {
    console.warn("Got toggle desktop with no known sidebar URL");
    return;
  }
  let hostname = (new URL(sidebarUrl)).hostname;
  let isDesktop = !desktopHostnames[hostname];
  if (isDesktop) {
    desktopHostnames[hostname] = true;
  } else {
    delete desktopHostnames[hostname];
  }
  // We can't trigger a real reload without changing the URL, so we change it to blank and then
  // back to the previous URL:
  browser.sidebarAction.setPanel({panel: "about:blank"});
  openUrl(sidebarUrl);
  await browser.storage.local.set({desktopHostnames, defaultDesktopVersion: DEFAULT_DESKTOP_VERSION});
}

let recentTabs = [];

async function addRecentTab(tabInfo) {
  recentTabs = recentTabs.filter((item) => item.url !== tabInfo.url);
  recentTabs.unshift(tabInfo);
  recentTabs.splice(MAX_RECENT_TABS);
  try {
    await browser.runtime.sendMessage({
      type: "updateRecentTabs",
      recentTabs,
    });
  } catch (error) {
    if (String(error).includes("Could not establish connection")) {
      // We're just speculatively sending messages to the popup, it might not be open,
      // and that is fine
    } else {
      console.error("Got updating recent tabs:", String(error), error);
    }
  }
  await browser.storage.local.set({recentTabs});
}

async function dismissRecentTab(tab_index) {
  recentTabs.splice(tab_index, 1);
  try {
    await browser.runtime.sendMessage({
      type: "updateRecentTabs",
      recentTabs,
    });

  } catch (error) {
    if (String(error).includes("Could not establish connection")) {
      // popup speculation, as in addRecentTab()
    } else {
      console.error("Got updating recent tabs:", String(error), error);
    }
  }
  await browser.storage.local.set({recentTabs});
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

function privateWarningOnUpdated(tabId, changeInfo, tab) {
  if (tab.incognito) {
    browser.browserAction.setBadgeText({text: "!", tabId: tab.id});
  }
}

async function turnOffPrivateWarning() {
  hasSeenPrivateWarning = true;
  browser.tabs.onUpdated.removeListener(privateWarningOnUpdated);
  let win = await browser.windows.getCurrent({populate: true});
  for (let tab of win.tabs) {
    browser.browserAction.setBadgeText({text: null, tabId: tab.id});
  }
  await browser.storage.local.set({hasSeenPrivateWarning});
}

function showOnboardingBadge() {
  browser.browserAction.setIcon({path: "side-view-onboarding.svg"});
  function onBrowserActionClick() {
    browser.browserAction.setPopup({popup: "intro.html"});
    browser.browserAction.openPopup();
    browser.browserAction.onClicked.removeListener(onBrowserActionClick);
    browser.browserAction.setIcon({path: "side-view.svg"});
    browser.storage.local.set({hasBeenOnboarded: true});
    browser.browserAction.setPopup({popup: "popup.html"});
  }
  // This disables the default popup action and lets us intercept the clicks:
  browser.browserAction.setPopup({popup: ""});
  browser.browserAction.onClicked.addListener(onBrowserActionClick);
}

async function init() {
  const result = await browser.storage.local.get(["desktopHostnames", "defaultDesktopVersion", "recentTabs", "hasSeenPrivateWarning", "hasBeenOnboarded"]);
  if (!result.desktopHostnames) {
    desktopHostnames = {};
  } else {
    desktopHostnames = result.desktopHostnames;
  }
  if (!result.defaultDesktopVersion || result.defaultDesktopVersion < DEFAULT_DESKTOP_VERSION) {
    for (let hostname of DEFAULT_DESKTOP_SITES) {
      desktopHostnames[hostname] = true;
    }
  }
  recentTabs = result.recentTabs || [];
  hasSeenPrivateWarning = result.hasSeenPrivateWarning;
  if (!hasSeenPrivateWarning) {
    browser.tabs.onUpdated.addListener(privateWarningOnUpdated);
  }
  if (!result.hasBeenOnboarded) {
    showOnboardingBadge();
  }
}

init();
