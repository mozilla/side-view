# Release Process

There are three versions of this add-on:

* The version destined for addons.mozilla.org (AMO)
* The version for a [Shield experiment](https://wiki.mozilla.org/Firefox/Shield)
* The version for [Test Pilot](https://testpilot.firefox.com/experiments/side-view)

Eventually we'll remove the Shield and Test Pilot support, but for now these are done with build options.

# addons.mozilla.org

To build for AMO:

```sh
npm run package-amo
# XPI is in ./addon-amo.xpi
```

Then upload manually via the [web interface](https://addons.mozilla.org/en-US/developers/addon/side-view/edit) (TODO: use web-ext to further automate the release).

# Shield

More confusing:

```sh
SHIELD=1 npm run package
# XPI is in ./addon.xpi
npm run package-null
# Control/null addon is in ./addon-null.xpi
```

The "null" add-on is an empty add-on that is given to the control group.

# Test Pilot

```sh
git push origin master:production
```

From there the add-on is packaged and signed and uploaded. Voila!
