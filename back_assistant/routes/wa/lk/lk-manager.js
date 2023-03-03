const environment = require("../../../environment");

const lkManager = {
  getInstance: environment.IS_MOCK ? require("./helper/lk-helper-mock") : require("./helper/lk-helper"),
};

module.exports = lkManager;
