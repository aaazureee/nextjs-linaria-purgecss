const LINARIA_EXTENSION = '.linaria.module.css';
const LINARIA_CLASS_SUFFIX = 'ln';

function toValidCSSIdentifier(s) {
  return s.replace(/[^-_a-z0-9\u00A0-\uFFFF]/gi, '_').replace(/^\d/, '_');
}

function traverse(rules) {
  for (const rule of rules) {
    if (typeof rule.loader === 'string' && rule.loader.includes('css-loader')) {
      if (
        rule.options &&
        rule.options.modules &&
        typeof rule.options.modules.getLocalIdent === 'function'
      ) {
        let nextGetLocalIdent = rule.options.modules.getLocalIdent;
        rule.options.modules.mode = 'local';
        rule.options.modules.auto = true;
        rule.options.modules.exportGlobals = true;
        // rule.options.modules.exportOnlyLocals = true;
        rule.options.modules.getLocalIdent = (context, _, exportName, options) => {
          if (context.resourcePath.includes(LINARIA_EXTENSION)) {
            return exportName;
          }
          return nextGetLocalIdent(context, _, exportName, options);
        };
      }
    }
    if (typeof rule.use === 'object') {
      traverse(Array.isArray(rule.use) ? rule.use : [rule.use]);
    }
    if (Array.isArray(rule.oneOf)) {
      traverse(rule.oneOf);
    }
  }
}

module.exports = (nextConfig = {}) => {
  const { linaria = {}, ...restConfig } = nextConfig;
  return {
    ...restConfig,
    webpack(config, options) {
      traverse(config.module.rules);
      config.module.rules.push({
        test: /\.(tsx|ts|js|mjs|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('@linaria/webpack-loader'),
            options: {
              sourceMap: process.env.NODE_ENV !== 'production',
              extension: LINARIA_EXTENSION,
              classNameSlug: (slug, displayName) => {
                return `${toValidCSSIdentifier(displayName)}_${slug}_${LINARIA_CLASS_SUFFIX}`
              },
              ...linaria,
            },
          },
        ],
      });

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }
      return config;
    },
  };
};

module.exports.LINARIA_CLASS_SUFFIX = LINARIA_CLASS_SUFFIX;