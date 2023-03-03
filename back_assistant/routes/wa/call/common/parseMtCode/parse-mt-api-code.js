const analyzerCommonFunc = require("../analyzer-common-func");
const analyzerModel = require("../analyzer-model");

// ПРОВЕРКИ СООБЩЕНИЙ ДЛЯ КОДА MtApiCode
const parseMtApiCode = {
  interceptCall(action, contextId, array) {
    const parameters = analyzerCommonFunc.separateStringToMap(action.param);
    const cmdId = analyzerCommonFunc.getValueOrNull(parameters.get("cmdid"));

    if (cmdId !== null) {
      const lefftSide = "Команда вызова перехвата по API";
      let rightSide = getSuccessAction(action, array, cmdId) ? `Статус: <b style="color:green">Выполнена успешно</b>` : `Статус: Выполнение`;

      const sToNumber = analyzerCommonFunc.getValueOrNull(parameters.get("stonumber"));
      if (sToNumber !== null) {
        rightSide += `<br/>Номер: ${sToNumber}`;
      }

      rightSide += getShortNumber(action, array);

      return [lefftSide, rightSide];
    }

    function getShortNumber(action, array) {
      currentRecordNumber = action.recordNumber;
      for (let element of array) {
        if (element.recordNumber > currentRecordNumber) {
          if (/Intercept to short number./i.test(element.message)) {
            const parameters = analyzerCommonFunc.separateStringToMap(element.param);
            const userName = analyzerCommonFunc.getValueOrNull(parameters.get("username"));
            if (userName) {
              return `<br/>Наименование сотрудника: <b>${userName}</b>`;
            }
          }
        }
      }
      return "";
    }
  },

  callbackGroup(action, contextId) {
    if (!analyzerModel.webAdminData[`${contextId}`].isApiCallback) {
      analyzerModel.webAdminData[`${contextId}`].isApiCallback = true;
      const parameters = analyzerCommonFunc.separateStringToMap(action.param);

      const initiator = analyzerCommonFunc.getValueOrNull(parameters.get("sinitiatoraddress"));
      const target = analyzerCommonFunc.getValueOrNull(parameters.get("stargetaddress"));

      const result = `<b>Заказ обратного звонка</b>${initiator ? `<br/><b>Инициатор</b>: ${initiator}` : ""}${target ? `<br/><b>Вызываемый номер</b>: ${target}` : ""}`;

      return ["Статус работы API", result];
    }
  },

  callbackParameters(action, contextId, array) {
    if (!analyzerModel.webAdminData[`${contextId}`].isApiCallback) {
      analyzerModel.webAdminData[`${contextId}`].isApiCallback = true;
      const parameters = analyzerCommonFunc.separateStringToMap(action.param);

      const nCampaignId = analyzerCommonFunc.getValueOrNull(parameters.get("ncampaignid"));
      let initiator = analyzerCommonFunc.getValueOrNull(parameters.get("sinitiatoraddress"));
      let target = null;

      for (let element of array) {
        if (/API callback/i.test(element.message)) {
          target = analyzerCommonFunc.getValueOrNull(parameters.get("targetnumber"));

          if (initiator === null) {
            initiator = analyzerCommonFunc.getValueOrNull(parameters.get("initiatornumber"));
          }

          break;
        }
      }

      const result = `<b>Заказ обратного звонка</b>
                      ${initiator ? `<br/><b>Инициатор</b>: ${initiator}` : ""}
                      ${target ? `<br/><b>Вызываемый номер</b>: ${target}` : ""}
                      ${nCampaignId ? `<br/><b>Id кампании</b>: ${nCampaignId}` : ""}
                      `;

      return ["Статус работы API", result];
    }
  },

  apiTransferCall(action) {
    const parameters = analyzerCommonFunc.separateStringToMap(action.param);
    const callId = analyzerCommonFunc.getValueOrNull(parameters.get("callid"));

    if (!(typeof callId === "string" && callId.trim().length > 0)) {
      const dialAddress = analyzerCommonFunc.getValueOrNull(parameters.get("dialaddress"));

      if (dialAddress) {
        return [`Статус работы API`, `<b style="font-size:12pt; color:green">Попытка перевода на номер ${dialAddress} по команде API</b>`];
      }
    }
  },

  apiHangup(action, contextId, array) {
    const parameters = analyzerCommonFunc.separateStringToMap(action.param);
    const cmdId = analyzerCommonFunc.getValueOrNull(parameters.get("cmdid"));

    let result = "<span>Передача и выполнение команды завершения вызова</span>";

    let successAction = getSuccessAction(action, array, cmdId);

    if (successAction) {
      const successParameters = analyzerCommonFunc.separateStringToMap(successAction.param);
      let initiator = analyzerCommonFunc.getValueOrNull(successParameters.get("initiator"));

      if (initiator) {
        analyzerModel.API_COMMAND_DONE.forEach((check) => {
          result += `<br/>${analyzerCommonFunc.getTranslatedParameterInformation("initiator", check, initiator, analyzerModel.INITIATOR_PARAMETERS)}`;
        });
      }
    }

    return [`Статус работы API`, result];
  },
};

module.exports = parseMtApiCode;

// Вспомогательные методы
function getSuccessAction(action, array, cmdId) {
  if (cmdId) {
    currentRecordNumber = action.recordNumber;

    const template = analyzerCommonFunc.getWAMessageTemplate(`API\\s*command\\s*done`);

    for (let element of array) {
      if (element.recordNumber > currentRecordNumber) {
        if (template.test(element.message)) {
          const doneParams = analyzerCommonFunc.separateStringToMap(element.param);
          const doneCmdId = analyzerCommonFunc.getValueOrNull(doneParams.get("cmdid"));

          if (doneCmdId === cmdId) {
            return element;
          }
        }
      }
    }
    return null;
  }
}
