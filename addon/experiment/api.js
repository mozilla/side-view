/* global ExtensionAPI:false */

this.sideview = class API extends ExtensionAPI {
  getAPI(context) {
    return {
      sideview: {
        increaseSidebarMaxWidth: async () => {
          // eslint-disable-next-line mozilla/use-services
          const WindowMediator = Cc["@mozilla.org/appshell/window-mediator;1"]
            .getService(Ci.nsIWindowMediator);
          const browser = WindowMediator.getMostRecentWindow("navigator:browser");
          const sidebar = browser.document.getElementById("sidebar");
          sidebar.style.maxWidth = "72em";
          return true;
        },
      },
    };
  }
};
