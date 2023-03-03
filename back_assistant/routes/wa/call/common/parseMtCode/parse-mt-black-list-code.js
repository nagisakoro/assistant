const analyzerModel = require("../analyzer-model");
const analyzerCommonFunc = require("../analyzer-common-func");

// ПРОВЕРКИ СООБЩЕНИЙ ДЛЯ КОДА MtBlackList
const parseMtBlackList = {
  isAllowed(action, contextId) {
    return parseMtBlackList.parseAllowed(contextId, `Фильтрация по черно-белым спискам <b style="color:green">разрешена по биллингу</b>`);
  },

  /*   isNotAllowed(action, contextId) {
    return parseMtBlackList.parseAllowed(contextId, `Фильтрация по черно-белым спискам <b style="color:red">запрещена по биллингу</b>`);
  }, */

  filterThrough(action, contextId, array) {
    const parameters = analyzerCommonFunc.separateStringToMap(action.param);
    const number = analyzerCommonFunc.getValueOrNull(parameters.get("number"));

    if (number) {
      let result = `Фильтрация номера <b>${number}</b> по черно-белым спискам`;

      for (let element of array) {
        if (element.recordNumber > action.recordNumber) {
          if (/Filtering done, no special actions, passing call/i.test(element.message)) {
            const resultParams = analyzerCommonFunc.separateStringToMap(element.param);
            const resultNumber = analyzerCommonFunc.getValueOrNull(resultParams.get("number"));

            if (resultNumber === number && /Pass/i.test(element.result)) {
              result += `<br/>Фильтрация для номера <b>${resultNumber}</b> выполнена, все ок`;
              return ["Статус фильтрации", result];
            }
          }
        }
      }
    }
  },

  // Вспомогательные методы
  parseAllowed(contextId, message) {
    if (analyzerModel.webAdminData[`${contextId}`].isBillingCheck === false) {
      analyzerModel.webAdminData[`${contextId}`].isBillingCheck = true;
      return ["Параметры сервисов", message];
    }
  },
};

module.exports = parseMtBlackList;
