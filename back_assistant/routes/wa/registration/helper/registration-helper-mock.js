const RegistrationInterface = require("./registration-interface");

class RegistrationHelperMock extends RegistrationInterface {
  constructor() {
    super();
  }

  getNumberRegistrations(login, domain) {
    return { status: "error" };
  }
}

module.exports = new RegistrationHelperMock();
