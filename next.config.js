const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  future: {
    webpack5: true,
  },
  webpack: (config) => {
    config.output.webassemblyModuleFilename = "static/wasm/[modulehash].wasm";
    config.experiments = { syncWebAssembly: true };

    return config;
  },
});
