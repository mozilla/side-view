/* eslint-env node */
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
    "space-before-function-paren": "off"
  }
};
