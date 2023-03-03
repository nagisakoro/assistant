const environment = require("../../../environment");

const registrationManager = {
  getInstance: environment.IS_MOCK ? require("./helper/registration-helper-mock") : require("./helper/registration-helper"),
};

module.exports = registrationManager;
