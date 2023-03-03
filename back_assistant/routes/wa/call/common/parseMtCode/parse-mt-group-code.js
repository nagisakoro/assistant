const analyzerCommonFunc = require("../analyzer-common-func");
const analyzerModel = require("../analyzer-model");

// ПРОВЕРКИ СООБЩЕНИЙ ДЛЯ КОДА MtGroup
const parseMtGroup = {
  getFreeOperators(action, contextId, array) {
    let result = "";
    let currentGetOperators = "";

    for (let element of array) {
      if (element.recordNumber > action.recordNumber) {
        if (parseMtGroup.checkRegExp("Operator will not be used", element.message)) {
          result += parseOperatorNotUsed(element, contextId);
          currentGetOperators += element.message + element.param;
        } else if (parseMtGroup.checkRegExp("Operator is free to dial", element.message)) {
          result += parseOperatorFree(element, contextId);
          currentGetOperators += element.message + element.param;
        } else if (parseMtGroup.checkRegExp("Operators to dial", element.message)) {
          result = parseOperatorToDial(element, contextId, array) + result;
          currentGetOperators += "";
          break;
        } else if (parseMtGroup.checkRegExp("There are no free operators in group", element.message)) {
          result = `<b style="color:red">В группе нет свободных операторов</b><br/>` + result;
          currentGetOperators += element.message + element.param;
          break;
        } else if (parseMtGroup.checkRegExp("Try to add operators to dial", element.message)) {
          break;
        } else if (parseMtGroup.checkRegExp("Get free operators", element.message)) {
          break;
        }
      }
    }

    if (analyzerModel.webAdminData[`${contextId}`].lastGetFreeOperators === "" || analyzerModel.webAdminData[`${contextId}`].lastGetFreeOperators !== currentGetOperators) {
      analyzerModel.webAdminData[`${contextId}`].lastGetFreeOperators = currentGetOperators;
      return [`Поиск свободных операторов`, result];
    }

    // Вспомогательные функции
    function parseOperatorNotUsed(element, contextId) {
      const result = parseCallCenter(element, contextId) || parseWasGivenTo(element, contextId) || parseWasBlockedUntil(element, contextId);

      if (result !== null) {
        return result;
      }

      return "";
    }

    function parseCallCenter(element, contextId) {
      const params = element.param.match(/Uses\s*CallCenter.*Current\s*status\s*is\:\s*(.+)\.?\s*UserId\:\s*\d+.*MemberId\:\s*(\d+)/i);
      let result = null;
      if (params && params.length === 3) {
        let status = analyzerCommonFunc.getValueOrNull(params[1]);
        const memberId = analyzerCommonFunc.getValueOrNull(params[2]);

        if (status !== null && memberId !== null) {
          const user = analyzerCommonFunc.getMember(memberId, contextId);

          if (user !== null) {
            if (/ccsOffline/i.test(status)) {
              status = `<span style="color:red">Оффлайн</span>`;
            } else if (/ccsOutboundDial/i.test(status)) {
              status = `<span style="color:blue">Обзвон</span>`;
            } else if (/ccsBreak/i.test(status)) {
              status = `<span style="color:orange">Перерыв</span>`;
            } else if (/ccsDoNotDisturb/i.test(status)) {
              status = `<span style="color:violet">Не беспокоить</span>`;
            }

            result = `Оператор <b>"${user.name}"</b> не может быть использован: включен Колл-центр, текущий статус <b>"${status}"</b> <b style="color:red"></b><br/>`;
          }
        }
      }
      return result;
    }

    function parseWasGivenTo(element, contextId) {
      const params = element.param.match(/Was\s*given\s*to.*MemberId\:\s*(\d+)/i);
      let result = null;

      if (params && params.length === 2) {
        const memberId = analyzerCommonFunc.getValueOrNull(params[1]);

        if (memberId !== null) {
          const user = analyzerCommonFunc.getMember(memberId, contextId);

          if (user !== null) {
            result = `Оператор <b>"${user.name}"</b> не может быть использован, так как уже был задействован <b style="color:red"></b><br/>`;
          }
        }
      }

      return result;
    }

    function parseWasBlockedUntil(element, contextId) {
      const params = element.param.match(/Was\s*blocked\s*until.?\s*(\d+).*MemberId.?\s*(\d+)/i);
      let result = null;

      if (params && params.length === 3) {
        const timestamp = analyzerCommonFunc.getValueOrNull(params[1]);
        const memberId = analyzerCommonFunc.getValueOrNull(params[2]);

        if (timestamp !== null && memberId !== null) {
          const user = analyzerCommonFunc.getMember(memberId, contextId);
          date = new Date(timestamp * 1000);

          if (user !== null) {
            result = `Оператор <b>"${user.name}"</b> не может быть использован, так как  заблокирован до  <b style="color:red">${date}</b> <b style="color:red"></b><br/>`;
          }
        }
      }

      return result;
    }

    function parseOperatorFree(element, contextId) {
      let result = "";

      const operatorParams = analyzerCommonFunc.separateStringToMap(element.param);
      const memberId = analyzerCommonFunc.getValueOrNull(operatorParams.get("memberid"));
      const user = analyzerCommonFunc.getMember(memberId, contextId);

      if (user !== null) {
        result = `Оператор <b>"${user.name}"</b> свободен для звонка<br/>`;
      }

      return result;
    }

    function parseOperatorToDial(element, contextId, array) {
      let result = "";

      const parameters = element.param.split(",");

      if (parameters.length > 1) {
        for (let i = element.recordNumber - 2; i >= 0; i--) {
          if (/Transfer to Group/i.test(array[i].message)) {
            break;
          } else if (/Try to run regular algoritm/i.test(array[i].message) || /GroupSettings loaded/i.test(array[i].message)) {
            const algorithmParameters = analyzerCommonFunc.separateStringToMap(array[i].param);
            const dialAlgorith = analyzerCommonFunc.getValueOrNull(algorithmParameters.get("dialalgorith"));

            if (dialAlgorith && /2-daParallel/i.test(dialAlgorith)) {
              result = `<b style="color:green">Параллельное соединение со всеми свободными операторами</b><br/>`;
            }
          }
        }
      } else {
        const memberId = analyzerCommonFunc.getValueOrNull(element.param.replace(/\D/g, ""));
        const user = analyzerCommonFunc.getMember(memberId, contextId);

        if (user !== null) {
          result = `Соединение с оператором <b style="color:green">"${user.name}"</b><br/>`;
        }
      }

      return result;
    }
  },

  getPersonalOperator(action, contextId, array) {
    let result = `Попытка получить "знакомого" оператора`;
    const currentRecordNumber = action.recordNumber;

    for (let element of array) {
      if (element.recordNumber > currentRecordNumber) {
        if (parseMtGroup.checkRegExp("There is no personal operator or personal operator is busy", element.message)) {
          result += `<br/>Нет знакомого оператора либо свободный оператор занят`;
          break;
        } else if (parseMtGroup.checkRegExp("Personal operator was getting", element.message)) {
          result += parsePersonalOperatorWasGetting(element, contextId);
          break;
        }
      }
    }

    return ["Статус обработки группы", result];

    // Вспомогательные функции
    function parsePersonalOperatorWasGetting(element, contextId) {
      const params = analyzerCommonFunc.separateStringToMap(element.param);
      const memberId = analyzerCommonFunc.getValueOrNull(params.get("memberid"));

      if (memberId != null) {
        const user = analyzerCommonFunc.getMember(memberId, contextId);

        if (user !== null) {
          return `<br/>Найден персональный оператор <b>${user.name}</b>`;
        }
      }

      return "";
    }
  },

  checkRegExp(template, message) {
    const regExpression = analyzerCommonFunc.getWAMessageTemplate(template);

    return regExpression.test(message);
  },

  operatorRequestCommand(action, contextId, array) {
    const recNumber = Number(action.recordNumber);
    const parameters = analyzerCommonFunc.separateStringToMap(action.param);
    const groupId = analyzerCommonFunc.getValueOrNull(parameters.get("groupid"));

    if (!isNaN(recNumber) && groupId) {
      for (let i = recNumber - 1; i > 0; i--) {
        if (/Transfer to Group/i.test(array[i].message)) {
          const transferGroupId = getItemGroupId(action);
          if (transferGroupId === groupId) {
            return;
          }
        } else if (/GroupSettings loaded/i.test(array[i].message)) {
          const grGroupId = getItemGroupId(action);
          if (grGroupId === groupId) {
            return;
          }
        }
      }
    }

    let result = "";

    for (let [key, value] of parameters) {
      analyzerModel.OPERATOR_REQUEST_COMMAND.forEach((check) => {
        result += analyzerCommonFunc.getTranslatedParameterInformation(key, check, value, analyzerModel.OPERATOR_REQUEST_COMMAND_PARAMETERS);
      });
    }

    const groupSettingsLoaded = (() => {
      for (let i = recNumber; i < array.length; i++) {
        if (/GroupSettings loaded/i.test(array[i].message)) {
          const grGroupId = getItemGroupId(action);
          if (grGroupId === groupId) {
            return array[i];
          }
        }
      }
      return null;
    })();

    result += groupSettingsLoaded
      ? analyzerCommonFunc.getParametersOfString(groupSettingsLoaded, analyzerModel.GROUP_SETTINGS_LOADED, analyzerModel.GROUP_SETTINGS_LOADED_PARAMETERS)
      : "";

    if (result.length > 0) {
      return ["Переадресация на группу", result];
    }
  },

  groupSettingsLoaded(action, contextId, array) {
    const recNumber = Number(action.recordNumber);
    const parameters = analyzerCommonFunc.separateStringToMap(action.param);
    const groupId = analyzerCommonFunc.getValueOrNull(parameters.get("groupid"));

    if (!isNaN(recNumber) && groupId) {
      for (let i = recNumber - 1; i > 0; i--) {
        if (/Transfer to Group/i.test(array[i].message)) {
          const transferGroupId = getItemGroupId(action);
          if (transferGroupId === groupId) {
            return;
          }
        } else if (/OperatorRequestCommand/i.test(array[i].message)) {
          const grGroupId = getItemGroupId(action);
          if (grGroupId === groupId) {
            return;
          }
        }
      }
    }

    let result = "";

    for (let [key, value] of parameters) {
      analyzerModel.GROUP_SETTINGS_LOADED.forEach((check) => {
        result += analyzerCommonFunc.getTranslatedParameterInformation(key, check, value, analyzerModel.GROUP_SETTINGS_LOADED_PARAMETERS);
      });
    }

    if (result.length > 0) {
      return ["Переадресация на группу", result];
    }
  },
};

function getItemGroupId(action) {
  const transferParams = analyzerCommonFunc.separateStringToMap(action.param);
  const transferGroupId = analyzerCommonFunc.getValueOrNull(transferParams.get("groupid"));

  return transferGroupId;
}

module.exports = parseMtGroup;
