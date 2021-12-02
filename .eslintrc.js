module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    mocha: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'plugin:mocha/recommended',
  ],
  parserOptions: {
    ecmaVersion: 13,
  },
  plugins: [
    'mocha',
  ],
  rules: {
    'consistent-return': 'off',
    'max-classes-per-file': 'off',
    'mocha/no-mocha-arrows': 'off',
  },
};
