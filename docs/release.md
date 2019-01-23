# Release Process

## addons.mozilla.org

To build for AMO:

```sh
npm run package
# XPI is in ./addon-amo.xpi
```

Then upload manually via the [web interface](https://addons.mozilla.org/en-US/developers/addon/side-view/edit) (TODO: use web-ext to further automate the release).
