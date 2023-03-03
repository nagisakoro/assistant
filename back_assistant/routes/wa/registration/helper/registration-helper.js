const RegistrationInterface = require("./registration-interface");
const WaCommon = require("../../../../wa_requester/wa-common");
const WaRequesterhHelper = require("../../../../wa_requester/wa-requester-helper");

class RegistrationHelperProd extends RegistrationInterface {
  constructor() {
    super();
  }

  getNumberRegistrations(login, domain) {
    return new Promise((resolve, reject) => {
      const url = `http://webadmin.mango.local:8088/wa/SSWAController?module=SipSessionsCluster&action=list&waModelIdList=20`;

      const body = getRequestBody(login, domain);

      const headers = WaCommon.getCommonHeaders(false, true);

      WaRequesterhHelper.sendRequest(url, {
        method: "POST",
        credentials: "include",
        headers: headers,
        body: body,
      })
        .then((data) => {
          const statusNumber = Number(data.status);

          if (statusNumber === 200) {
            data
              .json()
              .then((jsonData) => {
                const number = `${login}@${domain}`;

                if (jsonData.success && jsonData.result && jsonData.hasOwnProperty("sip-sessions-cluster") && Array.isArray(jsonData["sip-sessions-cluster"])) {
                  let result = "<b>Регистрации на текущий момент</b>:";

                  if (jsonData["sip-sessions-cluster"].length) {
                    result += ` для номера <b>${number}</b>`;
                    jsonData["sip-sessions-cluster"].forEach((element, index) => {
                      result += `<br/>${index + 1})${element.userAgent}`;
                    });
                  } else {
                    result += `
                        <span style="color:red; font-size:13pt"><br/>Внимание! В данный момент регистрация для номера <b>${number}</b> отсутствует!</span>
                        <br/>
                        <span>Необходимо выполнить следующие действия:
                          <br/>1) Проверить подключение телефонного аппарата к сети питания и сети Internet.
                          <br/>2) Если подключения есть, то перезагрузить ТА и подождать не менее одной минуты.
                          <br/>3) Проверить наличие регистрации.
                        </span>
                          `;
                  }

                  resolve(result);
                } else {
                  throw new Error(`Отказ при получении регистрации sip-номера!`);
                }
              })
              .catch((error) => reject(error));
          } else {
            throw new Error(`statusNumber ${statusNumber} is not 200!`);
          }
        })
        .catch((error) => reject(error));
    });

    function getRequestBody(login, domain) {
      const bodyParameters = new Map();
      bodyParameters.set("name", login);
      bodyParameters.set("address", "");
      bodyParameters.set("userAgent", "");
      bodyParameters.set("domain", domain);
      bodyParameters.set("received", "");
      bodyParameters.set("start", 0);
      bodyParameters.set("limit", 20);
      bodyParameters.set("sort", "");
      bodyParameters.set("dir", "");

      return WaCommon.getFormUrlEncodedBody(bodyParameters);
    }
  }
}

module.exports = new RegistrationHelperProd();
