async function init() {

  async function enableFeature(studyInfo) {
    const { delayInMinutes } = studyInfo;
    if (delayInMinutes !== undefined) {
      const alarmName = `${browser.runtime.id}:studyExpiration`;
      const alarmListener = async alarm => {
        if (alarm.name === alarmName) {
          browser.alarms.onAlarm.removeListener(alarmListener);
          await browser.study.endStudy("expired");
        }
      };
      browser.alarms.onAlarm.addListener(alarmListener);
      browser.alarms.create(alarmName, {
        delayInMinutes,
      });
    }
  }

  try {
    browser.study.onReady.addListener(enableFeature);
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
        days: 28,
      },
    });

    browser.study.onEndStudy.addListener(async () => {
      for (let url of event.urls) {
        console.info("Opening Side View survey (for more information see about:studies):", url);
        await browser.tabs.create({url});
      }
      if (event.shouldUninstall) {
        console.info("Uninstalling Side View study add-on (see about:studies)");
        await browser.management.uninstallSelf();
      }
    });

    browser.study.sendTelemetry({message: "addon_control_init"});
  } catch (e) {
    console.warn("Error in Shield init():", String(e), e.stack);
  }
}

init();
