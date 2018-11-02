# Side View Metrics

Metrics collections and analysis plan for Side View as part of the [Firefox Test Pilot program](https://testpilot.firefox.com).

## Analysis

Data collected in this experiment will be used to answer the following high-level questions:

* How often do users load a non-homepage in the sidebar?
* Are people who use Side View heavy tab users?



## Collection
Data will be collected with Google Analytics and follow [Test Pilot standards](https://github.com/mozilla/testpilot/blob/master/docs/experiments/ga.md) for reporting.

## Custom Metrics
*none*

### Custom Dimensions

* `cd1` - The width of the sidebar in pixels.  An integer, rounded to the nearest 50px.
* `cd2` - The number of open tabs across all windows.  An integer
* `cd3` - The site type requested.  One of `desktop` or `mobile`
* `cd4` - The length of the list the user interacted with.  Used for open and recent tab lists.  An integer
* `cd5` - The index of the link in the list on the homepage.  Used for open and recent tab lists.  An integer

### Events

#### Startup / errors

##### When add-on starts up (browser restart or new installation)

Called each time the add-on starts up

```
ec: startup,
ea: startup,
ni: true
```

Note `ni` (not-interactive) will keep these events from being grouped under user activity.

##### When the sidebar experiment succeeds in loading

Called at startup when the experiment loads

```
ec: startup
ea: loaded-width
ni: true
```

##### When onboarding is shown

```
ec: interface
ea: onboarding-shown
```

##### When the sidebar experiment fails to load

When the experiment fails to load. The experiment may fail to be present (some loading error), or may have an exception while running

```
ec: startup
ea: failed-width
el: not-present or exception
ni: true
```

##### When a link cannot be added to Recent Tabs

```
ec: interface
ea: fail-recent-tab
el: bookmark or link
```

Both bookmarks and links cannot be added to Recent Tabs; this event fires when this situation occurs.

#### `Interface`

##### When the user opens a link in the sidebar using the pageAction button

```
ec: interface,
ea: load-url,
el: page-action,
cd3
```

##### When the user chooses to load a link in the sidebar from the context menu activated on a page background or tab
```
ec: interface,
ea: load-url,
el: context-menu-page,
cd2,
cd3
```

(Note we can't distinguish between context menu clicks on the page background and a context menu on a tab.)

##### When the user chooses to load a link in the sidebar from the context menu activated on a link
```
ec: interface,
ea: load-url,
el: context-menu-link,
cd2,
cd3
```

##### When the user chooses to load a link in the sidebar from the context menu activated on a bookmark
```
ec: interface,
ea: load-url,
el: context-menu-bookmark,
cd2,
cd3
```

##### When the user chooses to load a link in the sidebar by choosing an existing tab on the home page
```
ec: interface,
ea: load-url,
el: existing-tab,
cd1,
cd2,
cd3,
cd4,
cd5
```

##### When the user chooses to load a link in the sidebar by choosing a recently loaded tab on the home page
```
ec: interface,
ea: load-url,
el: recent-tab,
cd1,
cd2,
cd3,
cd4,
cd5
```

##### When the user activates the Side View back button
```
ec: interface,
ea: button-click,
el: button-back,
cd1
```

##### When the user activates the Side View refresh button
```
ec: interface,
ea: button-click,
el: button-refresh,
cd1,
cd3
```

##### When the user activates Side View from a keyboard shortcut
```
ec: interface,
ea: button-click,
el: keyboard-shortcut,
cd1,
cd2
```

##### When the user toggles the desktop or mobile request checkbox
```
ec: interface,
ea: button-click,
el: request-desktop  **or**  request-mobile,
cd1
```

##### When the user clicks the feedback button
```
ec: interface,
ea: button-click,
el: feedback,
cd1,
cd2,
cd3
```

#### `Content`

##### When the home page loads for whatever reason
```
ec: content,
ea: load-url,
el: home-page,
cd1,
cd2
```

##### When a child page loads
```
ec: content,
ea: load-url,
el: child-page,
cd1,
cd2,
cd3
```

## Shield metrics

Side View is being released for a [Shield Study](https://wiki.mozilla.org/Firefox/Shield). In the study random Firefox users from the general public are offered the Side View extension or a control extension.

The metrics for this experiment are more limited, and are submitted via Firefox Telemetry. The following pings are made:

* `addon_init`: sent at browser startup
* `onboarding_shown`: sent when the user sees the onboarding in the popup
* `uri_to_sv`: sent when a person interacts with Side View to send a page to the sidebar
* `panel_used_today`: this ping is sent at most once every 24 hours, if the user used Side View within that 24 hours. It catches `uri_to_sv` events, as well as checking periodically if the Side View sidebar is open.
* `addon_control_init`: people in the control send this ping at browser startup

Additionally surveys are opened if the experiment expires (after 6 weeks), including control users; if the person uninstalls the add-on; and sometimes 14 days after the experiment starts, if the user has used the add-on for two or more days.

The control users are sent to a plain survey with no special information. Other survey links include:

* `onboarded`: a boolean, if the user had gone through onboarding
* `panel_days`: the cumulative number of times `panel_used_today` occurred
* `uri_count`: the cumulative number of `uri_to_sv`

This data is only collected if the user submits the survey.
