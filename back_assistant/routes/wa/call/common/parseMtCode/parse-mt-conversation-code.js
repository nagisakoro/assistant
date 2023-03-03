const analyzerModel = require("../analyzer-model");
const analyzerCommonFunc = require("../analyzer-common-func");

// ПРОВЕРКИ СООБЩЕНИЙ ДЛЯ КОДА MtConversation
const parseMtConversation = {
  startConversation(action, contextId, array) {
    const parameters = analyzerCommonFunc.separateStringToMap(action.param);
    const commonCallId = Number(analyzerCommonFunc.getValueOrNull(analyzerModel.webAdminData[`${contextId}`].startApplicationParameters.get("callid")));

    if (commonCallId !== null) {
      const callsIdArray = getNumberIdArray(parameters, commonCallId);

      const users = getUsers(callsIdArray, contextId, action, array);

      if (users.length === 2) {
        return ["Статус разговора", `Старт разговора между <b>${users[0]}</b> и <b>${users[1]}</b>`];
      } else if (users.length === 1) {
        return ["Статус разговора", `Старт разговора для <b>${users[0]}</b>`];
      }
    }

    // Вспомогательные функции
    function getNumberIdArray(parameters, commonCallId) {
      const array = new Array();

      const numberCallId1 = Number(parameters.get("callid1"));
      const numberCallId2 = Number(parameters.get("callid2"));

      if (numberCallId1 === commonCallId) {
        array.push(numberCallId2);
      } else if (numberCallId2 === commonCallId) {
        array.push(numberCallId1);
      } else {
        array.push(numberCallId1);
        array.push(numberCallId2);
      }

      return array;
    }

    function getUsers(callsIdArray, contextId, action, array) {
      const users = new Array();

      callsIdArray.forEach((element) => {
        for (let placeCall of analyzerModel.webAdminData[`${contextId}`].placingCalls) {
          if (Number(placeCall.get("callid")) === element) {
            const userId = analyzerCommonFunc.getValueOrNull(placeCall.get("userid"));
            const userName = analyzerCommonFunc.getMember(userId, contextId);

            if (userName !== null) {
              users.push(userName.name);
            }
          }
        }
      });

      if (callsIdArray !== 2) {
        if (analyzerModel.webAdminData[`${contextId}`].abonent !== null) {
          users.push(analyzerModel.webAdminData[`${contextId}`].abonent);
        } else {
          const recNum = Number(action.recordNumber);
          if (!isNaN(recNum)) {
            for (let i = recNum - 1; i > 0; i--) {
              if (/API callback/i.test(array[i].message)) {
                const apiParams = analyzerCommonFunc.separateStringToMap(array[i].param);
                const targetNumber = analyzerCommonFunc.getValueOrNull(apiParams.get("targetnumber"));

                if (targetNumber) {
                  users.push(targetNumber);
                }
              }
            }
          }
        }
      }

      return users;
    }
  },

  endApplication(action, contextId) {
    analyzerModel.webAdminData[`${contextId}`].endApplication = analyzerCommonFunc.getEndCode(action.result);
  },
};

module.exports = parseMtConversation;
