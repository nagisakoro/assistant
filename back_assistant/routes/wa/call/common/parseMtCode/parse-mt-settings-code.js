const analyzerModel = require("../analyzer-model");
const analyzerCommonFunc = require("../analyzer-common-func");

// ПРОВЕРКИ СООБЩЕНИЙ ДЛЯ КОДА MtSettings
const parseMtSettings = {
  pointSettings(action, contextId) {
    let returnString = "";

    [returnString, analyzerModel.webAdminData[`${contextId}`].callParameters] = analyzerCommonFunc.getParametersOfString(
      action,
      analyzerModel.POINT_SETTINGS,
      analyzerModel.POINT_SETTINGS_PARAMETERS,
      true
    );

    return ["Параметры звонка", returnString];
  },
};

module.exports = parseMtSettings;
