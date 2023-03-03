const analyzerCommonFunc = require("../analyzer-common-func");

// ПРОВЕРКИ СООБЩЕНИЙ ДЛЯ КОДА MtDTMF
const parseMtDTMF = {
  collectorSignaled(action) {
    let inputNumber = action.param.match(/input: [\d#\*]+/i);
    if (inputNumber !== null) {
      inputNumber = inputNumber[0].replace(/[^\d#\*]/g, "");

      if (inputNumber.length === 0) {
        inputNumber = "Сработал блок отсутствия ввода";
      }

      return ["Зафиксировано нажатие клавиш звонящим", inputNumber];
    }
  },

  numIsPassed(action) {
    const partsOfString = action.message.match(/Number\s+(.+)\s+is passed/i);
    if (partsOfString !== null && partsOfString.length > 1) {
      const numberOfInput = partsOfString[1];
      return ["Звонящий ввел номер", numberOfInput];
    }
  },

  dialUndefinedNumber(action) {
    const parameters = analyzerCommonFunc.separateStringToMap(action.param);
    const number = parameters.get("number") || null;
    if (number !== null) {
      return ["Набираемый номер неопределен", number];
    }
  },

  noNumberEntered() {
    return ["Статус работы DTMF", "Номер не был введен"];
  },

  werePressedByOperator(action) {
    const value = action.message.replace(/were pressed by Operator/i, "");
    if (value.length > 0) {
      return ["Статус работы DTMF", `Значение <b>${value}</b> было введено оператором`];
    }
  },
};

module.exports = parseMtDTMF;
