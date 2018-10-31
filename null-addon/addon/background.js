async function init() {
  try {
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
            "https://qsurvey.mozilla.com/s3/side-view-shield-study/?reason=control",
          ],
        },
        ineligible: {
          baseUrls: [],
        },
        expired: {
          baseUrls: [
            "https://qsurvey.mozilla.com/s3/side-view-shield-study/?reason=control",
          ],
        },
      },
      weightedVariations: [
        {
          name: "control",
          weight: 1,
        },
      ],
      // maximum time that the study should run, from the first run
      expire: {
        days: 42,
      },
    });
    browser.study.sendTelemetry({message: "addon_control_init"});
  } catch (e) {
    console.warn("Error in Shield init():", String(e), e.stack);
  }
}

init();
