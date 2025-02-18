const path = require("path");

module.exports = function override(config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    "@layouts": path.resolve(__dirname, "src/layouts"),
    "@components": path.resolve(__dirname, "src/components"),
    "@context": path.resolve(__dirname, "src/context"),
    "@types": path.resolve(__dirname, "src/types"),
    "@lib": path.resolve(__dirname, "src/lib"),
  };
  return config;
};
