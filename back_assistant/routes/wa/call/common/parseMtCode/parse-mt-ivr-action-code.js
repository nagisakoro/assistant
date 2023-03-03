const analyzerModel = require("../analyzer-model");
const analyzerCommonFunc = require("../analyzer-common-func");

// ПРОВЕРКИ СООБЩЕНИЙ ДЛЯ КОДА MtIVRAction
const parseMtIVRAction = {
  transferToGroup(action, contextId, array) {
    const parameters = analyzerCommonFunc.separateStringToMap(action.param);
    const groupName = analyzerCommonFunc.getValueOrNull(parameters.get("groupname"));
    const groupId = analyzerCommonFunc.getValueOrNull(parameters.get("groupid"));
    if (groupName && groupId) {
      analyzerModel.webAdminData[`${contextId}`].placingCalls.length = 0;

      const operatorRequestCommand = getLogString(/^\s*Operator\s*Request\s*Command\s*$/i, "groupid", groupId, array);
      const groupSettingsLoaded = getLogString(/^\s*Group\s*Settings\s*loaded\s*$/i, "groupid", groupId, array);
      const tryToRunRegularAlgoritm = getLogString(/^\s*Try\s*to run\s*regular\s*algoritm\s*$/i, undefined, undefined, array);

      let resultString = "";

      resultString += operatorRequestCommand
        ? analyzerCommonFunc.getParametersOfString(operatorRequestCommand, analyzerModel.OPERATOR_REQUEST_COMMAND, analyzerModel.OPERATOR_REQUEST_COMMAND_PARAMETERS)
        : "";
      resultString += groupSettingsLoaded
        ? analyzerCommonFunc.getParametersOfString(groupSettingsLoaded, analyzerModel.GROUP_SETTINGS_LOADED, analyzerModel.GROUP_SETTINGS_LOADED_PARAMETERS)
        : "";

      if (!/Наименование\sгруппы/i.test(resultString)) {
        resultString = `Наименование: ${groupName}<br/>` + resultString;
      }
      if (!/Алгоритм\sсоединения/i.test(resultString)) {
        resultString += tryToRunRegularAlgoritm
          ? analyzerCommonFunc.getParametersOfString(tryToRunRegularAlgoritm, analyzerModel.GROUP_SETTINGS_LOADED, analyzerModel.GROUP_SETTINGS_LOADED_PARAMETERS)
          : "";
      }

      return ["Переадресация на группу", resultString];
    }

    function getLogString(template, key = null, groupId = null, array) {
      for (let element of array) {
        if (element.recordNumber > action.recordNumber) {
          if (/Transfer to Group/i.test(element.message)) {
            break;
          } else if (template.test(element.message)) {
            if (key && groupId) {
              const parameters = analyzerCommonFunc.separateStringToMap(element.param);
              const paramOfElement = Number(analyzerCommonFunc.getValueOrNull(parameters.get(key)));
              if (paramOfElement !== null && paramOfElement === Number(groupId)) {
                return element;
              }
            } else {
              return element;
            }
          }
        }
      }

      return null;
    }
  },

  transitProcedure(action) {
    let typeName = action.param.match(/Type: \'.+\'/i);
    if (typeName !== null) {
      typeName = typeName[0].replace(/\D/g, "");

      if (typeName.length === 0) {
        typeName = "Сработал блок отсутствия ввода";
      }

      return ["Переход к процедуре по нажатию кнопки", typeName];
    }
  },

  enterShortUser(action) {
    const userName = action.param.replace(/UserId:\s*\d+\s*|UserName:|,/gi, "");
    return ["Введенный короткий номер переадресует на сотрудника", userName];
  },

  externalNum(action) {
    let extNumber = action.param.match(/tel:\s*\d+/i);
    if (extNumber !== null) {
      extNumber = extNumber[0].replace(/\D/g, "");

      const numberLength = extNumber.length;
      if (numberLength !== 11) {
        extNumber += `<br/> Обратить внимание: Длина номера ${numberLength}`;
      }

      if (extNumber[0] !== "7" && extNumber[0] !== "8") {
        extNumber += `<br/> Обратить внимание: номер начинается на ${extNumber[0]}, а не на 7 или 8.`;
      }
    } else {
      extNumber = action.param.match(/sip:\s*\w+@[\w\.]+\.[a-z]{1,3}/i);

      if (extNumber !== null) {
        extNumber = extNumber[0];
      } else {
        extNumber = "";
      }
    }

    return ["Переадресация на внешний номер", extNumber];
  },

  transferToShort(action) {
    return ["Перевод по внутреннему номеру", action.param];
  },

  defaultIVRIsDefined(action, contextId, array) {
    if (!analyzerModel.webAdminData[`${contextId}`].isDefaultIVRDefined) {
      analyzerModel.webAdminData[`${contextId}`].isDefaultIVRDefined = true;

      let result = "Сработала схема IVR";

      const isSchemaEmpty = checkEmptySchema(action, array);

      if (isSchemaEmpty) {
        result += `<br/><b style="color:red">Схема распределения звонков пустая!</b>`;
      }

      return ["Статус работы IVR", result];
    }

    function checkEmptySchema(action, array) {
      for (let index = action.recordNumber; index < array.length; index++) {
        if (/Billing mail params/i.test(array[index].message) || /Sending \'Init\' request to interpreter/i.test(array[index].message)) {
          continue;
        } else if (/End application/i.test(array[index].message) || /Ending Client call/i.test(array[index].message)) {
          return true;
        } else {
          return false;
        }
      }

      return false;
    }
  },

  noTargetShortNumber(action) {
    const parameters = analyzerCommonFunc.separateStringToMap(action.param);
    const number = analyzerCommonFunc.getValueOrNull(parameters.get("number"));

    let result = `Не найдена цель переадресации`;

    if (number) {
      result += ` для номера ${number}`;
    }

    return ["Статус работы IVR", result];
  },
};

module.exports = parseMtIVRAction;
