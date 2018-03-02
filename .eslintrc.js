module.exports = {
  "env": {
    "es6": true,
    "webextensions": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:mozilla/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 8,
    "sourceType": "module"
  },
  "plugins": [
    "mozilla"
  ],
  "root": true,
  "rules": {
    "eqeqeq": "error",
    "no-console": "warn",
    "space-before-function-paren": "off",
    "no-console": ["error", {"allow": ["error", "info", "trace", "warn"]}]
  }
};
