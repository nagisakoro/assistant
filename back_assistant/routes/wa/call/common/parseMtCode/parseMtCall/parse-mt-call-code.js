const analyzerModel = require("../../analyzer-model");
const analyzerCommonFunc = require("../../analyzer-common-func");
const parseMtCallCommon = require("./parse-mt-call-code-common");

// ПРОВЕРКИ СООБЩЕНИЙ ДЛЯ КОДА MtCall
const parseMtCall = {
  // Обработка сообщения "Create call"
  createCall(action, contextId) {
    const parameters = analyzerCommonFunc.separateStringToMap(action.param);

    return parseMtCallCommon.getCallDirection(contextId, parameters);
  },

  placingCall(action, contextId, array, commonDetailLogs, currentRowNumber) {
    analyzerModel.webAdminData[`${contextId}`].lastGetFreeOperators = "";

    const parameters = analyzerCommonFunc.separateStringToMap(action.param);
    const userId = analyzerCommonFunc.getValueOrNull(parameters.get("userid"));
    const toNumber = analyzerCommonFunc.getValueOrNull(parameters.get("to number"));
    const callingCallId = analyzerCommonFunc.getValueOrNull(parameters.get("callingcallid"));
    const member = analyzerCommonFunc.getMember(userId, contextId);

    const dialToUserParams = member !== null ? parseMtCallCommon.getStartDialToUserParams(member, contextId) : null;
    const leftPartResult = dialToUserParams !== null ? "Установка соединения с сотрудником" : "Установка соединения с номером";

    const createCall = parseMtCallCommon.getCreateCall(action, contextId, userId, array);

    if (createCall !== null) {
      const [callIsConnected, callid] = parseMtCallCommon.getCallIsConnected(action, createCall, array, userId);

      return [leftPartResult, displayInformation(parameters, dialToUserParams, callIsConnected, callid, callingCallId, contextId, currentRowNumber)];
    }

    return [leftPartResult, displayInformation(parameters, dialToUserParams, null, undefined, callingCallId, contextId, currentRowNumber)];

    // Вспомогательные функции для placingCall
    function displayInformation(parameters = null, dialToUserParams = null, callIsConnected, callid = null, callingCallId, contextId, currentRowNumber) {
      const resultMap = parseMtCallCommon.parseParametersToResultMap(parameters, dialToUserParams, callid, contextId);

      analyzerModel.webAdminData[`${contextId}`].placingCalls.push(resultMap);

      const resultString = parseMtCallCommon.getResultString(callingCallId, callIsConnected, toNumber, array, resultMap, commonDetailLogs, action, contextId, currentRowNumber);

      return resultString;
    }
  },

  callIsEnded(action, contextId) {
    const parameters = analyzerCommonFunc.separateStringToMap(action.param);
    const reason = analyzerCommonFunc.getValueOrNull(parameters.get("reason"));

    analyzerModel.webAdminData[`${contextId}`].callIsEnded = [analyzerCommonFunc.getEndReason(action.result), analyzerCommonFunc.getEndCode(reason)];
  },

  endOperatorCall(action, contextId) {
    const parameters = analyzerCommonFunc.separateStringToMap(action.param);
    const callId = analyzerCommonFunc.getValueOrNull(Number(parameters.get("callid")));
    for (let placeCall of analyzerModel.webAdminData[`${contextId}`].placingCalls) {
      if (Number(placeCall.get("callid")) === callId) {
        const userName = analyzerCommonFunc.getValueOrNull(placeCall.get("username"));
        const toNumber = analyzerCommonFunc.getValueOrNull(placeCall.get("to number"));

        let resultString = `Завершение вызова${userName !== null ? ` сотрудником <b>${userName}</b>` : ""}, номер <b>"${toNumber}"</b>`;

        resultString += getResultTranslatedCode(action);

        return [`Статус разговора`, resultString];
      }
    }
  },

  endingClientCall(action, contextId) {
    const resultString = getResultTranslatedCode(action, contextId, false, true);

    return ["Завершение разговора", `${resultString}`];
  },
};

module.exports = parseMtCall;

function getResultTranslatedCode(action, contextId = null, isAddBrTag = true, isEndingCall = false) {
  const code = action.result.replace(/\D/g, "");
  if (code.length === 4) {
    const translatedCode = analyzerCommonFunc.getEndReason(code);

    check1110Code(contextId, isEndingCall, code);

    if (translatedCode) {
      return `${isAddBrTag ? "<br/>" : ""}Код завершения: <b>${analyzerCommonFunc.getEndReason(code)}</b>`;
    }
  }

  return "";

  // Вспомогательная функция для getResultTranslatedCode
  function check1110Code(contextId, isEndingCall, code) {
    if (isEndingCall && code === "1110") {
      analyzerModel.webAdminData[`${contextId}`].isEndCode1110 = true;
    }
  }
}
