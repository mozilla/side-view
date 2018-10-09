this.shieldSetup = (function () {

  // Every CHECK_SIDEBAR_PERIOD we see if the sidebar is open, and send a usage telemetry if it is
  // We also look for any normal events
  const CHECK_SIDEBAR_PERIOD = 1000 * 60 * 60; // 1 hour
  // And then if we find something, we send a telemetry event, but only this often:
  const SEND_OPEN_TELEMETRY_LIMIT = 1000 * 60 * 60 * 24; // 1 day
  let exports = {};

  exports.sendShieldEvent = async function(args) {
    if (args.ec === "startup") {
      browser.study.sendTelemetry({message: "addon_init"});
    } else if (args.ea === "load-url") {
      // Any kind of load event uses ea=load-url (pageAction, browserAction, contextMenu, etc)
      try {
        flagUsed();
        await browser.study.sendTelemetry({message: "uri_to_sv", uri_sent: "true"});
      } catch (e) {
        console.warn("Failure in sendTelemetry:", String(e), e.stack);
      }
    }
  };

  let lastUsed = null;

  function flagUsed() {
    if (!lastUsed || Date.now() - lastUsed >= SEND_OPEN_TELEMETRY_LIMIT) {
      browser.study.sendTelemetry({message: "panel_used_today", panel_used: "true"});
      lastUsed = Date.now();
    }
  }

  setInterval(async () => {
    if (await browser.sidebarAction.isOpen({})) {
      flagUsed();
    }
  }, CHECK_SIDEBAR_PERIOD);

  async function init() {
    try {
      await browser.study.setup({
        activeExperimentName: "side-view-1", // Note: the control add-on must have the same activeExperimentName
        studyType: "shield",
        telemetry: {
          send: true,
          // Marks pings with testing=true.  Set flag to `true` before final release
          removeTestingFlag: false,
        },
        endings: {
          /** standard endings */
          "user-disable": {
            baseUrls: [
              "https://qsurvey.mozilla.com/s3/side-view-shield-study/?reason=user-disable",
            ],
          },
          ineligible: {
            baseUrls: [],
          },
          expired: {
            baseUrls: [
              "https://qsurvey.mozilla.com/s3/side-view-shield-study/?reason=expired",
            ],
          },
          /** Study specific endings */
          "user-used-the-feature": {
            baseUrls: [
              // FIXME: do we want this?
              // If we do, we have to use browser.study.endStudy("user-used-the-feature")
              "https://qsurvey.mozilla.com/s3/side-view-shield-study/?reason=user-used-the-feature",
            ],
            category: "ended-positive",
          },
        },
        weightedVariations: [
          {
            name: "feature-active",
            weight: 1,
          },
        ],
        // maximum time that the study should run, from the first run
        expire: {
          days: 365,
        },
      });
    } catch (e) {
      console.warn("Error in Shield init():", String(e), e.stack);
    }
  }

  init();

  return exports;
})();
