const WaCookies = require("./wa-cookies");

class WaCommon {
  static getFormUrlEncodedBody(parametersMap) {
    let body = "";
    let firstValue = true;
    for (var [key, value] of parametersMap.entries()) {
      if (firstValue) {
        body += `${key}=${encodeURIComponent(value)}`;
        firstValue = false;
      } else {
        body += `&${key}=${encodeURIComponent(value)}`;
      }
    }
    return body;
  }

  static getRequestOptions(method, headers, body = null) {
    return {
      method: method,
      credentials: "include",
      headers: headers,
      body: body,
      mode: "cors",
    };
  }

  static getCommonHeaders(isSetAccess, isSetCookies = false) {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Connection: "keep-alive",
    };

    if (isSetAccess) {
      headers["Access-Control-Allow-Origin"] = "*";
      headers["Access-Control-Allow-Headers"] = "Content-Type";
    }

    if (isSetCookies) {
      headers["Cookie"] = WaCookies.getCurrentCookies;
    }

    return headers;
  }
}

module.exports = WaCommon;
