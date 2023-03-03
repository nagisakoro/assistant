const lkManager = require("./lk-manager");

class LkLogic {
  constructor() {}

  async getData() {
    const result = await lkManager.getInstance.getLkInfo();

    return result;
  }
}

module.exports = LkLogic;
