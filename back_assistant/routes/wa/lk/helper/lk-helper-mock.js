const fetch = require("node-fetch");
const lkInterface = require("./lk-interface");

class lkHelperMock extends lkInterface {
  constructor() {
    super();
  }

  getLkInfo() {
    return { data: "error" };
  }
}

module.exports = new lkHelperMock();
