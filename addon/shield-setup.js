this.shieldSetup = (function () {

  // Every CHECK_SIDEBAR_PERIOD we see if the sidebar is open, and send a usage telemetry if it is
  // We also look for any normal events
  const CHECK_SIDEBAR_PERIOD = 1000 * 60 * 60; // 1 hour
  // And then if we find something, we send a telemetry event, but only this often:
  const SEND_OPEN_TELEMETRY_LIMIT = 1000 * 60 * 60 * 24; // 1 day
  let exports = {};
  let surveyParameters;
  const INSTALL_DATE_SURVEY_TIME = 1000 * 60 * 60 * 24 * 14; // 14 days
  const INSTALL_USE_SURVEY_REQUIREMENT = 2; // Must have used for 2 days
  let installedDate;
  let hasSeenMidwaySurvey = false;

  // load-url events can happen a few in a sequence, but we only want to report it once,
  // this timer keeps us from over-reporting:
  let lastLoadUrl;
  const LAST_LOAD_URL_LIMIT = 1000; // 1 second

  exports.sendShieldEvent = async function(args) {
    if (args.ec === "startup" && args.ea === "startup") {
      await shieldIsSetup;
      browser.study.sendTelemetry({message: "addon_init"});
    } else if (args.ea === "load-url") {
      // Any kind of load event uses ea=load-url (pageAction, browserAction, contextMenu, etc)
      if (lastLoadUrl && Date.now() - lastLoadUrl <= LAST_LOAD_URL_LIMIT) {
        return;
      }
      lastLoadUrl = Date.now();
      try {
        flagUsed();
        await shieldIsSetup;
        await browser.study.sendTelemetry({message: "uri_to_sv"});
        surveyParameters.uri_count += 1;
        saveSurveyParameters();
      } catch (e) {
        console.warn("Failure in sendTelemetry:", String(e), e.stack);
      }
    } else if (args.ea === "onboarding-shown") {
      await shieldIsSetup;
      browser.study.sendTelemetry({message: "onboarding_shown"});
      surveyParameters.onboarded = 1;
      saveSurveyParameters();
    }
  };

  let lastUsed = null;

  function flagUsed() {
    if (!lastUsed || Date.now() - lastUsed >= SEND_OPEN_TELEMETRY_LIMIT) {
      browser.study.sendTelemetry({message: "panel_used_today"});
      lastUsed = Date.now();
      surveyParameters.panel_days += 1;
      saveSurveyParameters();
    }
  }

  async function loadInstalledDate() {
    let result = await browser.storage.local.get(["installedDate", "hasSeenMidwaySurvey"]);
    if (result.installedDate) {
      installedDate = result.installedDate;
    } else {
      installedDate = Date.now();
      await browser.storage.local.set({installedDate});
    }
    if (result.hasSeenMidwaySurvey) {
      hasSeenMidwaySurvey = result.hasSeenMidwaySurvey;
    }
  }

  async function maybeOpenMidwaySurvey() {
    if (!hasSeenMidwaySurvey && Date.now() - installedDate >= INSTALL_DATE_SURVEY_TIME && surveyParameters.panel_days >= INSTALL_USE_SURVEY_REQUIREMENT) {
      // The person is eligable for the midway survey
      let url = `https://qsurvey.mozilla.com/s3/side-view-shield-study/?${surveyQueryString("midway")}`;
      await browser.tabs.create({url});
      hasSeenMidwaySurvey = true;
      await browser.storage.local.set({hasSeenMidwaySurvey});
    }
  }

  async function loadSurveyParameters() {
    let result = await browser.storage.local.get("surveyParameters");
    if (result.surveyParameters) {
      surveyParameters = result.surveyParameters;
    } else {
      surveyParameters = {
        onboarded: 0,
        panel_days: 0,
        uri_count: 0,
      };
    }
  }

  async function saveSurveyParameters() {
    await browser.storage.local.set({surveyParameters});
  }

  function surveyQueryString(reason) {
    let params = new URLSearchParams();
    let keyValues = Object.assign({reason}, surveyParameters);
    for (let key in keyValues) {
      params.append(key, keyValues[key]);
    }
    return params.toString();
  }

  let _shieldIsSetupResolve;
  let _shieldIsSetupReject;
  let shieldIsSetup = new Promise((resolve, reject) => {
    _shieldIsSetupResolve = resolve;
    _shieldIsSetupReject = reject;
  });

  async function init() {
    try {
      await loadInstalledDate();
      await loadSurveyParameters();
      await maybeOpenMidwaySurvey();
      await browser.study.setup({
        allowEnroll: true,
        activeExperimentName: "side-view-1", // Note: the control add-on must have the same activeExperimentName
        studyType: "shield",
        telemetry: {
          send: true,
          // Marks pings with testing=true.  Set flag to `true` before final release
          removeTestingFlag: true,
        },
        endings: {
          /** standard endings */
          "user-disable": {
            baseUrls: [
              `https://qsurvey.mozilla.com/s3/side-view-shield-study/?${surveyQueryString("user-disable")}`,
            ],
          },
          ineligible: {
            baseUrls: [],
          },
          expired: {
            baseUrls: [
              `https://qsurvey.mozilla.com/s3/side-view-shield-study/?${surveyQueryString("expired")}`,
            ],
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
          days: 42,
        },
      });

      _shieldIsSetupResolve();

      setInterval(async () => {
        if (await browser.sidebarAction.isOpen({})) {
          flagUsed();
        }
      }, CHECK_SIDEBAR_PERIOD);

    } catch (e) {
      _shieldIsSetupReject();
      console.warn("Error in Shield init():", String(e), e.stack);
    }
  }

  init();

  return exports;
})();
