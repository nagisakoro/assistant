const analyzerModel = require("../analyzer-model");

const parseMtFaxCode = {
  startFaxDetector(action, contextId, array) {
    if (!analyzerModel.webAdminData[`${contextId}`].isFaxWorkDisplayed) {
      analyzerModel.webAdminData[`${contextId}`].isFaxWorkDisplayed = true;

      let result = "";

      if (/Start\s*fax\s*detector/i.test(action.message)) {
        result = "Старт работы факса";
      } else if (/Fax\s*recognizer\s*has\s*started\s*for\s*Client/i.test(action.message)) {
        result = "Старт работы распознавания факса для клиента";
      }

      for (let element of array) {
        if (element.recordNumber > action.recordNumber) {
          if (/Fax\s*recognizer\s*has\s*started\s*for\s*Client/i.test(element.message)) {
            result += `<br/>Старт работы распознавания факса для клиента`;
          } else if (/Fax\s*recognition\s*done/i.test(element.message)) {
            result += `<br/>Распознавание факса для клиента выполнено`;
          } else if (/Stopping\s*fax\s*recognizing/i.test(element.message)) {
            result += `<br/>Остановка распознавания факса для клиента`;
          }
        }
      }

      return ["Статусы работы факса", result];
    }
  },
};

module.exports = parseMtFaxCode;
