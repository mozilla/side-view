<img width="840px" height="auto" src="./acceptance-wires.png" alt="Splitting basics">

### In General
- [ ] It should generally match Photon styles.
- [ ] It should have a way for users to provide feedback without leaving the experiment. See #6

### Context Clicks
- [x] It should register a _link_ context menu item for opening sites in the sidebar. See #3
- [x] It should register a _page_ and _tab_ context menu item for opening sites in the sidebar. See #4
- [ ] It should register a _bookmarks_ context menu item for opening sites from the bookmark toolbar.
- [ ] Both context menu buttons should include the extension icon.

### SV Homepage
- [ ] It should have a homepage
- [ ] It should have a feedback button that links to an external survey with the query params `ver={add-on-version}`, `ref=sidebar` and `rel={firefox-release}`. See #6
- [ ] It should link to onboarding content.
- [ ] It should include the extension icon in the header.

### SV Panel
- [ ] It should show a list of current http(s) tabs.
- [ ] It should show a list of recently SVed tabs.
- [ ] If !recently SVed tabs, only show the current tab section.
- [ ] It should show a feedback button with the query params `ver={add-on-version}`, `ref=panel` and `rel={firefox-release}`.
- [ ] The browser action icon should accept a fill value of `context-fill`
- [ ] It should let the user toggle between mobile and desktop UI.
- [ ] It should remember whether a site has been toggled to/from desktop before and render accordingly.

### Private Browsing Considerations
- [ ] Recent tabs should not be added or updated in Private Browsing Mode.
- [ ] When a user leaves Private Browsing Mode, the contents of the Panel should be flushed.

### Global
- [ ] It should extend the max-width of the sidebar to up to 50% of the total browser window. See #10

### A11y
See #27 for this list
- [ ] All buttons and links should have visible focus states
- [ ] All buttons and links should be accessible via keyed entry (tab selection)
- [ ] All form elements should include appropriate label attributes
- [ ] All grouped buttons should be nested in a <fieldset> and described with a legend
- [ ] All UI should be verified to use A11y friendly contrast ratios
