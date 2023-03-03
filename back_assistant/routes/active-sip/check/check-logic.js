const checkManager = require("./check-manager");

class CheckLogic {
  constructor(parameters) {
    this.parameters = parameters;
  }

  async getData() {
    this.checks();

    const result = await checkManager.getInstance.getActiveSipTailLog(this.parameters.sip);

    if (result) {
      return result;
    }

    throw new Error("Не удалось получить информацию по логам активного sip");
  }

  checks() {
    console.log("checks");

    console.log("this.parameters.sip: ", this.parameters.sip);

    // Проверка параметров запроса
    if (!/^.+\@.+$/i.test(this.parameters.sip)) {
      throw new Error(`Некорректный входной параметр sip!`);
    }
  }
}

module.exports = CheckLogic;
