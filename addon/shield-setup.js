this.shieldSetup = (function () {
  let exports = {};

  let hasUsedSideViewInShield = false;
  exports.sendShieldEvent = function(args) {
    if (!args.ni) {
      // FIXME: I'm not sure this is the right way to determine this:
      hasUsedSideViewInShield = true;
    }
    if (args.ec === "startup") {
      browser.study.sendTelemetry({message: "addon_init"});
    } else if (args.ea === "load-url") {
      // Any kind of load event uses ea=load-url (pageAction, browserAction, contextMenu, etc)
      browser.study.sendTelemetry({message: "uri_to_sv", uri_sent: true});
    }
  };

  setInterval(() => {
    if (hasUsedSideViewInShield) {
      browser.study.sendTelemetry({message: "panel_used_hourly_poll", panel_used: true});
    }
  }, 1000 * 60 * 60);

  async function init() {
    browser.study.setup({
      activeExperimentName: browser.runtime.id,
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
            // FIXME: put in correct URL:
            "https://qsurvey.mozilla.com/s3/Shield-Study-Example-Survey/?reason=user-disable",
          ],
        },
        ineligible: {
          baseUrls: [],
        },
        expired: {
          baseUrls: [
            // FIXME: put in correct URL
            "https://qsurvey.mozilla.com/s3/Shield-Study-Example-Survey/?reason=expired",
          ],
        },
        /** Study specific endings */
        "user-used-the-feature": {
          baseUrls: [
            // FIXME: do we want this?
            // If we do, we have to use browser.study.endStudy("user-used-the-feature")
            "https://qsurvey.mozilla.com/s3/Shield-Study-Example-Survey/?reason=user-used-the-feature",
          ],
          category: "ended-positive",
        },
      },
      weightedVariations: [
        {
          name: "feature-active",
          weight: 1.5,
        },
        {
          name: "feature-passive",
          weight: 1.5,
        },
        {
          name: "control",
          weight: 1,
        },
      ],
      // maximum time that the study should run, from the first run
      expire: {
        days: 14,
      },
    });
  }

  init();

  return exports;
})();
