const analyzerModel = require("../analyzer-model");
const analyzerCommonFunc = require("../analyzer-common-func");

// ПРОВЕРКИ СООБЩЕНИЙ ДЛЯ КОДА Common
const parseMtCommon = {
  startApplication(action, contextId) {
    analyzerModel.webAdminData[`${contextId}`].startApplicationParameters = analyzerCommonFunc.separateStringToMap(action.param);
  },
};

module.exports = parseMtCommon;
