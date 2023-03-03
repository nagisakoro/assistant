const environment = require("../../../environment");

const checkManager = {
  getInstance: environment.IS_MOCK ? require("./helper/check-helper-mock") : require("./helper/check-helper"),
};

module.exports = checkManager;
