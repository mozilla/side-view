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
  "rules": {
    "no-console": "off", // TODO: warn
    "space-before-function-paren": "off"
  }
};

