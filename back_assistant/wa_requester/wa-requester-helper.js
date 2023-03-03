const fetch = require("node-fetch");
const WaAuthHelper = require("./wa-auth-helper");

const NOT_AUTH_MESSAGE = "IS_NOT_AUTHORIZE";

class WaRequesterhHelper {
  static async sendRequest(url, options) {
    if (!WaAuthHelper.isAuthorizing) {
      const response = await fetch(url, options);
      const status = response.status;

      if (WaAuthHelper.isCodeBelow400(status)) {
        return response;
      } else {
        options.headers["Cookie"] = await WaAuthHelper.authorize();

        return await fetch(url, options);
      }
    } else {
      throw new Error(NOT_AUTH_MESSAGE);
    }
  }
}

module.exports = WaRequesterhHelper;
