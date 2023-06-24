const LINARIA_CLASS_SUFFIX = require('./next-linaria-custom').LINARIA_CLASS_SUFFIX;

const plugins = [
  "postcss-flexbugs-fixes",
  [
    "postcss-preset-env",
    {
      "autoprefixer": {
        "flexbox": "no-2009"
      },
      "stage": 3,
      "features": {
        "custom-properties": false
      }
    }
  ],

]

// purge css modules in prod
if (process.env.NODE_ENV !== 'development') {
  plugins.push([
    '@fullhuman/postcss-purgecss',
    {
      content: [
        './src/**/*.{js,jsx,ts,tsx}',
      ],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: [new RegExp(`${LINARIA_CLASS_SUFFIX}$`)],
      skippedContentGlobs: ['./src/pages/api/**/*'],
    }
  ])
}

module.exports = {
  plugins,
}