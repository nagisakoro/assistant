const lkInterface = require("./lk-interface");
const WaCommon = require("../../../../wa_requester/wa-common");
const WaRequesterhHelper = require("../../../../wa_requester/wa-requester-helper");

class lkHelperProd extends lkInterface {
  constructor() {
    super();
  }

  getLkInfo() {
    return new Promise((resolve, reject) => {
      const url = `http://webadmin.mango.local:8088/wa/SSWAController?module=IcsContext&action=get&waModelIdList=20`;

      const headers = WaCommon.getCommonHeaders(true, true);

      const bodyParameters = new Map();
      bodyParameters.set("post", "1");

      const body = getFormUrlEncodedBody(bodyParameters);

      WaRequesterhHelper.sendRequest(url, {
        method: "POST",
        credentials: "include",
        headers: headers,
        body: body,
      })
        .then((data) => {
          data
            .json()
            .then((json) => resolve(json))
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });

    // Вспомогательные функции-------------------------------------------------------------------------------------------------------------
    function getFormUrlEncodedBody(parametersMap) {
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
  }
}

module.exports = new lkHelperProd();
