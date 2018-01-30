# Open-in-sidebar

An experiment with opening mobile views of pages in the sidebar

## Installing

Check out the repository. Go to `about:debugging` in Firefox, and select **Load Temporary Add-on**. Select a file in the `addon/` directory.

Or: install [`web-ext`](https://github.com/mozilla/web-ext) (like `npm i -g web-ext`) and run `web-ext run -s addon/ --browser-console`

## Using

This adds a context menu item: **Open in sidebar** or **Open link in sidebar**. Select that, and the sidebar will be opened with a mobile view of the page.
