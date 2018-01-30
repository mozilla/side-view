const USER_AGENT = "Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0";
// iOS:
//   Mozilla/5.0 (iPhone; CPU iPhone OS 9_2 like Mac OS X) AppleWebKit/601.1 (KHTML, like Gecko) CriOS/47.0.2526.70 Mobile/13C71 Safari/601.1.46
// Firefox for Android:
//   Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0
// Chrome for Android:
//   Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19

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

browser.contextMenus.onClicked.addListener((info, tab) => {
  let url = info.linkUrl || tab.url;
  let title = info.linkText || tab.title || "Page";
  browser.sidebarAction.open().then(() => {
    return browser.sidebarAction.setPanel({
      panel: url
    });
  }).then(() => {
    return browser.sidebarAction.setTitle({title});
  }).catch((error) => {
    console.error("Error setting panel to page:", error);
  });
});

browser.webRequest.onBeforeSendHeaders.addListener(function (info) {
  if (info.tabId !== -1) {
    return;
  }
  let headers = info.requestHeaders;
  for (let i = 0; i < headers.length; i++) {
    let name = headers[i].name.toLowerCase();
    if (name === 'user-agent') {
      headers[i].value = USER_AGENT;
      return {"requestHeaders": headers};
    }
  }
}, {tabId: -1, types: ["main_frame"], urls: ["http://*/*", "https://*/*"]}, ["blocking", "requestHeaders"]);
