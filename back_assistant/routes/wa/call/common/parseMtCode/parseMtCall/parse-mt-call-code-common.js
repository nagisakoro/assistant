const analyzerModel = require("../../analyzer-model");
const analyzerCommonFunc = require("../../analyzer-common-func");

const parseMtCallCommon = {
  // Вспомогательная функция для получения направления звонка
  getCallDirection(contextId, parameters) {
    if (analyzerModel.webAdminData[`${contextId}`].startApplicationParameters !== null) {
      const commonCallID = analyzerCommonFunc.getValueOrNull(analyzerModel.webAdminData[`${contextId}`].startApplicationParameters.get("callid"));
      const thisCallId = analyzerCommonFunc.getValueOrNull(parameters.get("callid"));

      if (commonCallID !== null && thisCallId !== null && Number(commonCallID) === Number(thisCallId)) {
        const abonent = analyzerCommonFunc.getValueOrNull(parameters.get("abonent"));
        if (abonent !== null) {
          if (abonent === "client") {
            analyzerModel.webAdminData[`${contextId}`].abonent = "Клиент";
            return ["Направление звонка", "Входящее"];
          } else {
            analyzerModel.webAdminData[`${contextId}`].abonent = "Оператор";
            return ["Направление звонка", "Исходящее"];
          }
        }
      }
    }
  },

  getStartDialToUserParams(member, contextId) {
    let dialToUserParams = null;
    for (let dial of analyzerModel.webAdminData[`${contextId}`].startsDialToUser) {
      const dialUserId = analyzerCommonFunc.getValueOrNull(dial.get("userid"));
      if (dialUserId !== null && Number(dialUserId) === Number(member.abonent_id)) {
        dialToUserParams = dial;
      }
    }
    return dialToUserParams;
  },

  getCreateCall(action, contextId, userId, array) {
    let createCall = null;
    const commonCallID = analyzerCommonFunc.getValueOrNull(analyzerModel.webAdminData[`${contextId}`].startApplicationParameters.get("callid"));
    if (commonCallID !== null) {
      createCall =
        array.find((element) => {
          if (element.recordNumber > action.recordNumber && /^\s*Create call\s*$/i.test(element.message)) {
            const paramsOfElement = analyzerCommonFunc.separateStringToMap(element.param);
            const userIdOfElement = analyzerCommonFunc.getValueOrNull(paramsOfElement.get("userid"));
            if (userIdOfElement !== null && Number(userIdOfElement) === Number(userId)) {
              return true;
            }
          }
        }) || null;
    }
    return createCall;
  },

  getCallIsConnected(action, createCall, array, userId) {
    let callIsConnected = null;

    const paramsOfCreateCall = analyzerCommonFunc.separateStringToMap(createCall.param);
    const callId = analyzerCommonFunc.getValueOrNull(paramsOfCreateCall.get("callid"));

    if (callId !== null) {
      for (let element of array) {
        if (element.recordNumber > action.recordNumber) {
          if (/^\s*Call is connected\s*$/i.test(element.message)) {
            const paramsOfElement = analyzerCommonFunc.separateStringToMap(element.param);
            const callIdOfElement = analyzerCommonFunc.getValueOrNull(paramsOfElement.get("callid"));
            if (callIdOfElement !== null && Number(callIdOfElement) === Number(callId)) {
              callIsConnected = {
                isSuccess: true,
                endCode: null,
                endReason: null,
              };
              break;
            }
          } else if (/^\s*Unable to place call\s*$/i.test(element.message)) {
            const resultParams = element.result.split(",");

            if (resultParams.length === 2) {
              callIsConnected = {
                isSuccess: false,
                endCode: analyzerCommonFunc.getEndCode(resultParams[0]),
                endReason: analyzerCommonFunc.getEndReason(resultParams[1].replace(/\D/g, "")),
              };
              break;
            }
          } else if (/^\s*Release operators\s*$/i.test(element.message)) {
            const resultParams = analyzerCommonFunc.separateStringToMap(element.param);
            const operators = analyzerCommonFunc.getValueOrNull(resultParams.get("operators"));

            if (operators !== null) {
              const template = new RegExp(userId, "i");

              if (template.test(operators)) {
                const reason = analyzerCommonFunc.getValueOrNull(resultParams.get("reason"));

                if (reason !== null) {
                  if (resultParams.length === 2) {
                    callIsConnected = {
                      isSuccess: false,
                      endCode: null,
                      endReason: analyzerCommonFunc.getEndReason(reason.replace(/\D/g, "")),
                    };
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    return [callIsConnected, callId];
  },

  parseParametersToResultMap(parameters, dialToUserParams, callid, contextId) {
    const resultMap = new Map();

    this.parseDialToUserParamsToMap(dialToUserParams, resultMap);

    this.parsePlacingCallParamsToMap(parameters, resultMap, contextId);

    this.setCallIdToMap(callid, resultMap);

    return resultMap;
  },

  parseDialToUserParamsToMap(dialToUserParams, resultMap) {
    if (dialToUserParams !== null) {
      for (let [key, value] of dialToUserParams.entries()) {
        resultMap.set(key, value);
      }
    }
  },

  parsePlacingCallParamsToMap(parameters, resultMap, contextId) {
    if (parameters !== null) {
      for (let [key, value] of parameters.entries()) {
        if (key === "to number" && /tel\d+/i.test(value)) {
          value = value.replace(/\D/g, "");
        }
        if (key === "waiting for answer") {
          const numValue = value.replace(/\D/g, "");
          if (numValue.length === 0 && analyzerModel.webAdminData[`${contextId}`].callParameters !== null) {
            const waitAnswer = analyzerCommonFunc.getValueOrNull(analyzerModel.webAdminData[`${contextId}`].callParameters.get("waiting answer"));
            if (waitAnswer !== null) {
              value = waitAnswer.replace(/\D/g, "");
            }
          }
        }

        resultMap.set(key, value);
      }
    }
  },

  setCallIdToMap(callid, resultMap) {
    if (callid !== null) {
      resultMap.set("callid", callid);
    }
  },

  getCalledNumber(callingCallId, commonDetailLogs) {
    callingCallId = Number(callingCallId);
    let calledNumber = null;

    for (let commonLog of commonDetailLogs) {
      if (commonLog.callId === callingCallId) {
        calledNumber = commonLog.calledNumber;
      }
    }

    return calledNumber;
  },

  getCommonCodes(toNumber, array, commonDetailLogs, action) {
    if (/tel\d+/i.test(toNumber)) {
      toNumber = toNumber.replace(/\D/g, "");
    }
    for (let i = action.recordNumber; i < array.length; i++) {
      if (/^\s*ANI\s*Information\s*$/i.test(array[i].message) && array[i].param.includes(toNumber)) {
        for (let t = array[i].recordNumber; t < array.length; t++) {
          if (/^\s*Media\s*proxy\s*$/i.test(array[t].message)) {
            let mediaCallId = array[t].param.match(/for\s*call\s*(\d+)/i);
            if (mediaCallId !== null && mediaCallId.length === 2) {
              mediaCallId = Number(mediaCallId[1]);
              for (let commonLog of commonDetailLogs) {
                if (commonLog.callId === mediaCallId) {
                  const discReason = analyzerCommonFunc.getValueOrNull(commonLog.discReason);
                  const discReasonHdw = analyzerCommonFunc.getValueOrNull(commonLog.discReasonHdw);
                  const discReasonVats = analyzerCommonFunc.getValueOrNull(commonLog.discReasonVats);

                  const userAgent = analyzerCommonFunc.getValueOrNull(commonLog.userAgent);

                  const durationCall = analyzerCommonFunc.getValueOrNull(commonLog.durationCall);

                  return [discReason, discReasonHdw, discReasonVats, userAgent, durationCall];
                }
              }
            }
          }
        }
        break;
      }
    }
    return [null, null, null, null];
  },

  getResultString(callingCallId, callIsConnected, toNumber, array, resultMap, commonDetailLogs, action, contextId, currentRowNumber) {
    let resultString = "";

    const calledNumber = this.getCalledNumber(callingCallId, commonDetailLogs);

    if (calledNumber !== null) {
      resultString = `<b>Вызываемый номер</b>: ${calledNumber}<br/>`;
    }

    for (let [key, value] of resultMap) {
      let isSkip = false;

      // проверка для Waiting for answer:
      // 1) Если в свойстве toNumber указан телефон, то время ожидания должно быть не меньше 16 секунд
      // 2) Если в свойстве toNumber указана sip-учетная запись, то время ожидания должно быть не меньше 5 секунд
      if (/Waiting for answer/i.test(key)) {
        if (/tel\d+/i.test(toNumber)) {
          let waitMessage = null;
          [waitMessage, isSkip] = parseWaitTime(value, 16, isSkip);
          if (waitMessage !== null) {
            resultString += waitMessage;
          }
        } else if (/\w+@[\w\.]+\.[a-z]{1,3}$/i.test(toNumber)) {
          [waitMessage, isSkip] = parseWaitTime(value, 5, isSkip);
          if (waitMessage !== null) {
            resultString += waitMessage;
          }
        }
      }

      if (!isSkip) {
        analyzerModel.PLACING_CALL.forEach((check) => {
          resultString += analyzerCommonFunc.getTranslatedParameterInformation(key, check, value, analyzerModel.PLACING_CALL_PARAMETERS);
        });
      }
    }

    const [discReason, discReasonHdw, discReasonVats, userAgent, durationCall] = this.getCommonCodes(toNumber, array, commonDetailLogs, action);

    if (discReason) {
      resultString += `<b>Результат соединения: ${Number(discReasonHdw) === 200 ? `<span style="color:green">Успешно</span>` : `<span style="color:red">Неуспешно</span>`}</b>`;

      resultString += getCodeOfCall(discReason, discReasonHdw);

      const stringCodes = `
                          <br/><b>Код завершения ВАТС</b>: ${analyzerCommonFunc.getEndReason(discReasonVats)}
                          <br/><b>Продолжительность</b>: ${Math.round(durationCall / 1000)} сек.
                          `;
      resultString += stringCodes;

      if (typeof userAgent === "string" && userAgent.trim().length > 0) {
        resultString += `<br/><b>User-Agent</b>: ${userAgent}`;

        if (/^\s*Mango\s*SIP\s*$/i.test(userAgent)) {
          resultString += `
                          <span style="font-size:8pt">
                            <br/><b style="color:red">Примечание:</b> если User-Agent'ом указан <b>"Mango Sip"</b>, то, скорее всего:
                            <br/>1) нет регистрации 
                            <br/>2) выключен телефонный аппарат
                            <br/>3) нет соединения с интернетом
                          </span>
                          `;
        }
      }
    } else if (callIsConnected !== null) {
      resultString += `<br/><b>Результат соединения: ${
        callIsConnected !== null && callIsConnected.isSuccess ? `<span style="color:green">Успешно</span>` : `<span style="color:red"> Неуспешно</span>`
      }</b>`;

      const endReason = analyzerCommonFunc.getValueOrNull(callIsConnected.endReason);
      const endCode = analyzerCommonFunc.getValueOrNull(callIsConnected.endCode);

      if (endReason) {
        resultString += `<br/><b>Причина завершения разговора</b>: ${endReason}`;
      }
      if (endCode) {
        resultString += `<br/><b>Код завершения разговора</b>: ${endCode}`;
      }
    }

    resultString += getAPITransferCommand(action, callingCallId, array);

    const numberReigtrationButton = analyzerCommonFunc.getValueOrNull(this.getNumberRegistration(resultMap, contextId, currentRowNumber));

    if (numberReigtrationButton !== null) {
      resultString += numberReigtrationButton;
    }

    return resultString;

    // Вспомогательные функции для getResultString
    function parseWaitTime(value, minTime, isSkip) {
      try {
        const waitTime = Number(value.replace(/\D/g, ""));
        if (!isNaN(waitTime) && waitTime !== 0 && waitTime < minTime) {
          value = `<b style="color:red">${waitTime} сек. - Слишком короткое время ожидания (меньше ${minTime})</b>`;

          return [`Время ожидания: ${value}</br>`, true];
        }

        return [null, isSkip];
      } catch (err) {
        return [null, isSkip];
      }
    }

    function getAPITransferCommand(action, callingCallId, array) {
      for (let element of array) {
        if (element.recordNumber > action.recordNumber && /API TransferCall command/i.test(element.message)) {
          const apiParameters = analyzerCommonFunc.separateStringToMap(element.param);
          const apiCallId = analyzerCommonFunc.getValueOrNull(apiParameters.get("callid"));

          if (callingCallId === apiCallId) {
            const apiDialAddress = analyzerCommonFunc.getValueOrNull(apiParameters.get("dialaddress"));

            if (apiDialAddress) {
              return `<br/><b style="font-size:12pt; color:green">Попытка перевода на номер ${apiDialAddress} по команде API</b>`;
            }
          }
        }
      }
      return "";
    }

    function getCodeOfCall(discReason, discReasonHdw) {
      for (let element of analyzerModel.CODE_OF_CALL) {
        if (element[0] === discReason && element[1] === discReasonHdw) {
          return `<br/><b>Результат</b>: ${element[2]}`;
        }
      }
      return "";
    }
  },

  getNumberRegistration(resultMap) {
    try {
      const number = analyzerCommonFunc.getValueOrNull(resultMap.get("to number"));

      if (number !== null) {
        const numString = String(number);
        const parstOfNumber = numString.match(/(\w+)@([\w\.]+\.[a-z]{1,3}$)/i);

        if (parstOfNumber !== null && parstOfNumber.length === 3) {
          const login = parstOfNumber[1];
          const domain = parstOfNumber[2];
          const button = `<br/><button data-login="${login}" data-domain="${domain}"><b>Получить информацию о регистрации номера ${number}</b></button>`;

          return button;
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
};

module.exports = parseMtCallCommon;
