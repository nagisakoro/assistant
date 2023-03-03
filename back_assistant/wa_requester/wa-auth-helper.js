const WaCommon = require("./wa-common");
const WaCookies = require("./wa-cookies");
const fetch = require("node-fetch");
const environment = require("../environment");

class WaAuthHelper {
  constructor() {
    this.isAuthorizing = false;
  }

  async authorize() {
    this.isAuthorizing = true;
    await this._getNewCookies();

    const result = await this._auth();

    this.isAuthorizing = false;
    return result;
  }

  async _getNewCookies() {
    const url = `http://webadmin.mango.local:8088/wa/`;

    const headers = WaCommon.getCommonHeaders(true);

    const options = WaCommon.getRequestOptions("GET", headers);

    await fetch(url, options)
      .then((data) => {
        WaCookies._cookies = data.headers.raw()["set-cookie"];
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async _auth() {
    const url = `http://webadmin.mango.local:8088/wa/SSWAController?module=Auth&action=login`;

    const headers = WaCommon.getCommonHeaders(true);
    headers["Cookie"] = WaCookies._cookies;

    const bodyParameters = new Map();
    bodyParameters.set("authorizationType", "2");
    bodyParameters.set("username", environment.wa_auth_login);
    bodyParameters.set("password", environment.wa_auth_password);
    bodyParameters.set("languageSelect", "ru");
    bodyParameters.set("timezone", "+0300");
    bodyParameters.set("olsonTimezone", "Europe/Moscow");
    bodyParameters.set("sessionTimeout", "6");

    const body = WaCommon.getFormUrlEncodedBody(bodyParameters);

    const options = WaCommon.getRequestOptions("POST", headers, body);

    return await fetch(url, options)
      .then((data) => {
        return data.json();
      })
      .then((json) => {
        if (json.success === true && json.result === true) {
          this.isAuthorizing = false;
          return WaCookies._cookies;
        }
        throw new Error("auth not success");
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  isCodeBelow400(code) {
    if (code >= 400) {
      return false;
    }

    return true;
  }
}

module.exports = new WaAuthHelper();
