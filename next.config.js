const { withSentryConfig } = require("@sentry/nextjs");

const moduleExports = {
  // Your existing Next.js config
};

const sentryWebpackPluginOptions = {
  silent: true,
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
