const analyzerModel = require("../analyzer-model");

// ПРОВЕРКИ СООБЩЕНИЙ ДЛЯ КОДА MtAniDirection
const parseMtAniDirection = {
  serviceIsAllowed(action, contextId, array) {
    return parseMtAniDirection.parseService(action, contextId, array, `Переадресация по технологии автоматического определения номера <b style="color:green">доступна</b>`);
  },

  serviceIsNotAllowed(action, contextId, array) {
    return parseMtAniDirection.parseService(action, contextId, array, `Переадресация по технологии автоматического определения номера <b style="color:red">недоступна</b>`);
  },

  // Вспомогательные методы
  parseService(action, contextId, array, message) {
    if (analyzerModel.webAdminData[`${contextId}`].isBillingCheck === false) {
      let resultString = message;
      const currentStringNumber = Number(action.recordNumber);

      const filteredLogsMap = new Map([
        /* [`Blacklist service is NOT allowed by billing`, `<br/>Фильтрация по черно-белым спискам <b style="color:red">запрещена по биллингу</b>`], */
        [`Blacklist service is allowed by billing`, `<br/>Фильтрация по черно-белым спискам <b style="color:green">разрешена по биллингу</b>`],
      ]);

      resultString += this.getDesiredLog(array, currentStringNumber, filteredLogsMap);

      analyzerModel.webAdminData[`${contextId}`].isBillingCheck = true;
      return [`Параметры сервисов`, resultString];
    }
  },

  getDesiredLog(array, currentStringNumber, filteredLogsMap) {
    let resultString = "";

    array.forEach((element) => {
      if (Number(element.recordNumber) > currentStringNumber) {
        for (let [key, value] of filteredLogsMap) {
          const template = new RegExp(`^\s*${key}\s*$`, "i");
          if (template.test(element.message)) {
            resultString += value;
          }
        }
      }
    });

    return resultString;
  },
};

module.exports = parseMtAniDirection;
