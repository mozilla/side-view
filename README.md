# Side View

An experiment with opening mobile views of pages in the sidebar

## Installing

Use `npm install`, then `npm start`.

To use the build intended for a [Shield Study](https://wiki.mozilla.org/Firefox/Shield/Shield_Studies) use `SHIELD=1 npm run build`

To use the build intended for addons.mozilla.org (as opposed to Test Pilot) use `npm run build-amo`

## Installing manually

Check out the repository. Go to `about:debugging` in Firefox, and select **Load Temporary Add-on**. Select a file in the `addon/` directory.

Or: install [`web-ext`](https://github.com/mozilla/web-ext) (like `npm i -g web-ext`) and run `web-ext run -s addon/ --browser-console -f nightly`

## Pre-built add-on

The version of the addon in the [production branch](https://github.com/mozilla/side-view/tree/production) is built into [a signed XPI (clicking on this link will install the add-on)](https://testpilot.firefox.com/files/side-view@mozilla.org/latest).

## Using

This adds a context menu item: **Open in sidebar** or **Open link in sidebar**. Select that, and the sidebar will be opened with a mobile view of the page.

## Test Plan

The QA/test plan is documented in [this document](https://docs.google.com/document/d/1D-wk5Yzr04RBW9RWAA3KQTecXl0aSBXTHrb1N9yDMrM/edit).

## Credits

[Anthony_f](https://addons.mozilla.org/en-US/firefox/user/Anthony_f/)'s [Sidebar for Google Search](https://addons.mozilla.org/en-US/firefox/addon/sidebar-for-google-search/) inspired this add-on's approach.
