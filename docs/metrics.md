
# Tab Split Metrics

Metrics collections and analysis plan for Tab Split as part of the [Firefox Test Pilot program](https://testpilot.firefox.com).

## Analysis

Data collected in this experiment will be used to answer the following high-level questions:

* How often do users load a non-homepage in the sidebar?
* Are people who use Tab Split heavy tab users?



## Collection
Data will be collected with Google Analytics and follow [Test Pilot standards](https://github.com/mozilla/testpilot/blob/master/docs/experiments/ga.md) for reporting.

## Custom Metrics
*none*

### Custom Dimensions

* `cd1` - The width of the sidebar in pixels.  An integer
* `cd2` - The number of open tabs across all windows.  An integer
* `cd3` - The site type requested.  One of `desktop` or `mobile`
* `cd4` - The length of the list the user interacted with.  Used for open and recent tab lists.  An integer
* `cd5` - The index of the link in the list on the homepage.  Used for open and recent tab lists.  An integer

### Events

#### `Interface`

##### When the user chooses to load a link in the sidebar from the context menu activated on a page background
```
ec: interface,
ea: load-url,
el: context-menu-page,
cd1,
cd2,
cd3
```

##### When the user chooses to load a link in the sidebar from the context menu activated on a link
```
ec: interface,
ea: load-url,
el: context-menu-link,
cd1,
cd2,
cd3
```

##### When the user chooses to load a link in the sidebar from the context menu activated on a tab
```
ec: interface,
ea: load-url,
el: context-menu-tab,
cd1,
cd2,
cd3
```

##### When the user chooses to load a link in the sidebar from the context menu activated on a bookmark
```
ec: interface,
ea: load-url,
el: context-menu-bookmark,
cd1,
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

##### When the user activates the Tab Split back button
```
ec: interface,
ea: button-click,
el: button-back,
cd1
```

##### When the user activates the Tab Split refresh button
```
ec: interface,
ea: button-click,
el: button-refresh,
cd1,
cd3
```

##### When the user activates Tab Split from a keyboard shortcut
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
