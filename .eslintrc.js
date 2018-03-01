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
    "eqeqeq": "warn",
    "no-console": "warn",
    "space-before-function-paren": "off"
  }
};
