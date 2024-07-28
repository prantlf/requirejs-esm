import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    ...js.configs.recommended,
  },
  {
    languageOptions: {
      ecmaVersion: 'latest'
    }
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser
      },
      sourceType: 'module'
    }
  },
  {
    files: ['bin/*.js', 'perf/*.js', 'test/*.js'],
    languageOptions: {
      globals: {
        ...globals.node
      },
      sourceType: 'module'
    }
  }
]
