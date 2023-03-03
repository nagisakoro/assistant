const analyzerModel = require("../analyzer-model");
const analyzerCommonFunc = require("../analyzer-common-func");

// ПРОВЕРКИ СООБЩЕНИЙ ДЛЯ КОДА MtUser
const parseMtUser = {
  startDial(action, contextId) {
    const parameters = analyzerCommonFunc.separateStringToMap(action.param);
    analyzerModel.webAdminData[`${contextId}`].startsDialToUser.push(parameters);
  },
};

module.exports = parseMtUser;
