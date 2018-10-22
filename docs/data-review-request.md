# Request for data collection review form

**All questions are mandatory. You must receive review from a data steward peer on your responses to these questions before shipping new data collection.**

**1) What questions will you answer with this data?**

Is Side View useful to people in the general populace?

**2) Why does Mozilla need to answer these questions?  Are there benefits for users? Do we need this information to address product or business requirements? Some example responses:**

We've seen interest and positive feedback for Side View in Test Pilot, and we want to see if it is appealing to people in the general populace.

**3) What alternative methods did you consider to answer these questions? Why were they not sufficient?**

We've gotten positive results in Test Pilot and want to confirm those results with a different audience.

**4) Can current instrumentation answer these questions?**

No.

**5) List all proposed measurements and indicate the category of data collection for each measurement, using the Firefox [data collection categories](https://wiki.mozilla.org/Firefox/Data_Collection) on the Mozilla wiki.**

We have a small number of telemetry measurements. These are documented here: https://docs.google.com/document/d/121C4gVY0gTdGcp0vxGuAHB7scPEa3gegUHBIh0ckS5w/edit?usp=sharing

<table>
  <tr>
    <td>Measurement Description</td>
    <td>Data Collection Category</td>
    <td>Tracking Bug #</td>
  </tr>
  <tr>
    <td>addon_init and addon_control_init</td>
    <td>Category 1</td>
    <td>None</td>
  </tr>
  <tr>
    <td>uri_to_sv (when interacting with Side View)</td>
    <td>Category 2</td>
    <td>None</td>
  </tr>
  <tr>
    <td>panel_used_today (daily ping reflecting activity)</td>
    <td>Category 2</td>
    <td>None</td>
  </tr>
  <tr>
    <td>onboarding_shown (ping when displaying onboarding)</td>
    <td>Category 2</td>
    <td>None</td>
  </tr>
  <tr>
    <td>Survey parameters: total uri_count, onboarding boolean, days used</td>
    <td>Category 2</td>
    <td>None</td>
  </tr>
</table>

Note the "survey parameters" are query string parameters we append to the survey (and collect, if the survey is submitted). The survey is held at a mid-point (two weeks after second day of use), or at the end of the study (including uninstalling).

Note also we are currently collecting all telemetry identically in normal and Private Browsing modes.

**6) How long will this data be collected?  Choose one of the following:**

The Shield experiment will be deployed for 6 weeks.

**7) What populations will you measure?**

Firefox Release and Nightly, English locales. Existing Test Pilot Side View users will be excluded.

**8) If this data collection is default on, what is the opt-out mechanism for users?**

Release users can disable the add-on in about:addons, and Nightly users can disable in about:studies

**9) Please provide a general description of how you will analyze this data.**

We'll identify if people use the feature more than once. Also a survey will be provided to people in the experiment.

**10) Where do you intend to share the results of your analysis?**

In a Side View graduation report.
