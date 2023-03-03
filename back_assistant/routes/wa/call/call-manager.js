const environment = require("../../../environment");

const callManager = {
  getInstance: environment.IS_MOCK ? require("./helper/call-helper-mock") : require("./helper/call-helper"),
};

module.exports = callManager;
