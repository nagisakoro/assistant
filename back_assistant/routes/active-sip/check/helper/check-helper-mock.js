const CheckInterface = require("./check-interface");

class CheckHelperMock extends CheckInterface {
  constructor() {
    super();
  }

  getActiveSipTailLog(sip) {
    return { status: "error" };
  }
}

module.exports = new CheckHelperMock();
