const analyzerModel = require("../analyzer-model");
const analyzerCommonFunc = require("../analyzer-common-func");

// ПРОВЕРКИ СООБЩЕНИЙ ДЛЯ КОДА mtConversationRecord
const parseMtConvRec = {
  startRecord(action, contextId) {
    const parameters = analyzerCommonFunc.separateStringToMap(action.param);
    analyzerModel.webAdminData[`${contextId}`].startRecord = parameters;
  },

  recHasStarted(action, contextId) {
    const parameters = analyzerCommonFunc.separateStringToMap(action.param);
    const callId = analyzerCommonFunc.getValueOrNull(Number(parameters.get("callid")));
    const commonCallId = analyzerCommonFunc.getValueOrNull(Number(analyzerModel.webAdminData[`${contextId}`].startApplicationParameters.get("callid")));

    if (callId !== null && callId !== NaN && callId !== commonCallId) {
      for (let placingCall of analyzerModel.webAdminData[`${contextId}`].placingCalls) {
        if (Number(placingCall.get("callid")) === callId) {
          const userId = analyzerCommonFunc.getValueOrNull(placingCall.get("userid"));
          const user = analyzerCommonFunc.getMember(userId, contextId);

          const toNumber = analyzerCommonFunc.getValueOrNull(placingCall.get("to number"));

          if (user && toNumber) {
            const resultMap = new Map();

            if (analyzerModel.webAdminData[`${contextId}`].startRecord !== null) {
              for (let [key, value] of analyzerModel.webAdminData[`${contextId}`].startRecord.entries()) {
                resultMap.set(key, value);
              }
            }

            const type = analyzerCommonFunc.getValueOrNull(Number(parameters.get("type")));
            if (type !== null) {
              resultMap.set("type", type);
            }

            let resultString = "";
            for (let [key, value] of resultMap) {
              analyzerModel.RECORD_STARTED.forEach((check) => {
                resultString += analyzerCommonFunc.getTranslatedParameterInformation(key, check, value, analyzerModel.RECORD_STARTED_PARAMETERS);
              });
            }
            return [`Статус записи разговора`, `<b>Старт записи разговора: <br/>Сотрудник: ${user.name} <br/>Номер: ${toNumber} </b><br/>${resultString}`];
          }
        }
      }
    }
  },

  proceedRecSave(action, contextId, array, commonDetailLogs) {
    const parameters = action.param.match(/CallId:\s*(\d+).*Emails:\s*(.*)\s*NotifyByEmail:\s*(\d+).*To\s*recognise:\s*(\d+)/i);

    if (parameters !== null && parameters.length === 5) {
      const callId = Number(parameters[1]);
      const emails = parameters[2];
      const notifyByEmail = Number(parameters[3]) === 1 ? "да" : "нет";
      const toRecognise = Number(parameters[4]) === 1 ? "да" : "нет";

      const commonCallId = analyzerCommonFunc.getValueOrNull(Number(analyzerModel.webAdminData[`${contextId}`].startApplicationParameters.get("callid")));

      for (let placingCall of analyzerModel.webAdminData[`${contextId}`].placingCalls) {
        if (Number(placingCall.get("callid")) === callId && callId !== commonCallId) {
          const userId = analyzerCommonFunc.getValueOrNull(placingCall.get("userid"));
          const userName = analyzerCommonFunc.getMember(userId, contextId);

          const toNumber = analyzerCommonFunc.getValueOrNull(placingCall.get("to number"));

          let returnString = `Почтовые ящики: ${emails}<br/>Уведомлять по email: ${notifyByEmail}<br/>Распознавание речи: ${toRecognise}`;

          if (/ignored/i.test(action.result)) {
            for (let element of commonDetailLogs) {
              if (element.callId === callId) {
                const duration = Number(element.durationCall);

                if (!isNaN(duration)) {
                  returnString +=
                    duration >= 8000
                      ? `<br/>Результат: <span style="color:green">Успешно</span>`
                      : `<br/>Результат: <span style="color:red">Неуспешно, так как длительность разговора меньше 8 секунд</span>`;
                }
              }
            }
          } else {
            returnString += `<br/>Результат: ${action.result}`;
          }

          return [
            `Статус записи разговора`,
            `<b>Сохранение записи разговора</b>${userName !== null ? `<br/>Сотрудник: <b>${userName.name}</b>` : ""}   ${
              toNumber !== null ? `<br/>Номер: <b>${toNumber}</b>` : ""
            } <br/>${returnString}`,
          ];
        }
      }
    }
  },
};

module.exports = parseMtConvRec;
