module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['xo', 'prettier'],
  plugins: ['prettier'],
  overrides: [
    {
      env: {
        node: true
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script'
      }
    },
    {
      extends: ['xo-typescript', 'prettier'],
      files: ['*.ts', '*.tsx']
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    radix: 0,
    '@typescript-eslint/no-unsafe-assignment': 0,
    'prettier/prettier': ['error']
  }
}
