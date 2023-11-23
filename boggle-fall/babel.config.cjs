module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          // Define browsers you want to support; adjust as needed
          safari: "14",
        },
        useBuiltIns: "usage", // This will add polyfills as needed
        corejs: 3, // Specify the core-js version
      },
    ],
  ],
};
