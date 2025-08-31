// eslint.config.mjs
import antfu from '@antfu/eslint-config'
import expoConfig from 'eslint-config-expo/flat.js'

// Filter out the conflicting import plugin from expo's config
const filteredExpoConfig = expoConfig.filter(config => !config.plugins?.import)

export default (async () => {
  const antfuConfig = await antfu({
    typescript: true,
    react: false,
  })

  return [
    ...antfuConfig,
    ...filteredExpoConfig, // Use the filtered config
    {
      ignores: ['dist/*', 'node_modules/*', 'package.json'],
    },
  ]
})()
