const { Server } = require("karma");

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage-istanbul-reporter"),
      require("@angular-devkit/build-angular/plugins/karma"),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require("path").join(__dirname, "./coverage/palladium"),
      reports: ["html", "lcovonly", "text-summary"],
      fixWebpackSourcePaths: true,
    },
    reporters: ["progress", "kjhtml"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    singleRun: true,
    customLaunchers: {
      ChromeHeadlessCustom: {
        base: "ChromeHeadless",
        flags: [
          "--disable-gpu", // Disable hardware acceleration
          "--no-sandbox", // Needed when running as root user in Docker
          "--headless",
          "--disable-dev-shm-usage", // Fixes issues with Docker memory limitations
          "--disable-setuid-sandbox", // not recommended for security reasons but sometimes necessary
        ],
      },
    },
    browsers: ['ChromeHeadlessCustom'],
    restartOnFileChange: true,
    files: [
      {
        pattern: "src/**/*.spec.ts",
        watched: true,
        included: false,
        served: false,
      },
    ],
    httpsServerOptions: { // disable SSL certificate checks
      key: '',
      cert: '',
      ca: '',
      requestCert: false,
      rejectUnauthorized: false
    }
  });
};
