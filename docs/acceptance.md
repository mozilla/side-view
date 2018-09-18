# Shield Acceptance

[Shield Study Guide](https://docs.google.com/document/d/1KDJPrWmSclap7HSqjDoN9cGud4WzB9i8wxlguYPpGkg/edit)

## General
- [ ] It should more or less match photon styles
- [ ] It should fit with both default and dark Firefox themes
- [ ] It should remove links to the Test Pilot survey
- [ ] It should have a unique add-on ID
- [ ] It should remove the webExtension experiment that makes the sidebar wider

## Metrics
- [ ] It should not send any metrics reporting to GA
- [ ] All not send any metrics to Telemetry except those defined in the API
- [ ] It should instrument a new `panel_visible_today` metric that is reported daily as a boolean based on whether the user had any web content visible in Side View on a given day
- [ ] It should instrument a new `total_daily_uri_to_sv` metric which counts the number of new URIs sent to Side View each day. Note: even if this is 0 for a given day, `panel_visible_today` may be true if the user has SV open and set to show a URL from a previous day.

## Onboarding
- [ ] It should show onboarding to outline the basic usage of the feature (outline copy can be borrowed from [here](https://testpilot.firefox.com/experiments/side-view))
- [ ] Users in `elective_onboarding` branch should only see onboarding on their first interaction with Side View
- [ ] Users in the `default_onboarding` branch should see onboarding when the Side View shield study is installed
- [ ] For users in the `elective_onboarding` branch, If the user enters onboarding through context clicking or the pageAction menu, they should be prompted to continue to the original URL at the end of onboarding

## Survey
- [ ] It should include the following query params:
  - [ ] cohort= 1 - 5 depending on segmentation defined above
  - [ ] panel_days= SUM(panel_visible_today) [optional, depends on cohort]
  - [ ] uri_count= SUM(total_daily_uri_to_sv) [optional, depends on cohort]
- [ ] It should offer users where url_count >= 1 a link to Side View on AMO so they can continue to use the feature

