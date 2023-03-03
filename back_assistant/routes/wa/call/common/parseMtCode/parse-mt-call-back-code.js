const analyzerCommonFunc = require("../analyzer-common-func");
const analyzerModel = require("../analyzer-model");

const parseMtCallBackCode = {
  apiCallback(action, contextId) {
    if (!analyzerModel.webAdminData[`${contextId}`].isApiCallback) {
      analyzerModel.webAdminData[`${contextId}`].isApiCallback = true;
      const parameters = analyzerCommonFunc.separateStringToMap(action.param);

      const initiator = analyzerCommonFunc.getValueOrNull(parameters.get("initiatornumber"));
      const target = analyzerCommonFunc.getValueOrNull(parameters.get("targetnumber"));

      const result = `<b>Заказ обратного звонка</b>${initiator ? `<br/><b>Инициатор</b>: ${initiator}` : ""}${target ? `<br/><b>Вызываемый номер</b>: ${target}` : ""}`;

      return ["Статус работы API", result];
    }
  },
};

module.exports = parseMtCallBackCode;
