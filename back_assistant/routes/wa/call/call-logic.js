const callManager = require("./call-manager");

class CallLogic {
  constructor(parameters) {
    this.parameters = parameters;
  }

  async getData() {
    this.checks();

    const result = await callManager.getInstance.sendResponseDetailLogs(
      this.parameters.contextId,
      this.parameters.dateResponse,
      this.parameters.membersInfo,
      this.parameters.fromCall,
      this.parameters.toCall
    );

    if (result) {
      return result;
    }

    throw new Error("Не удалось получить логи звонка");
  }

  checks() {
    console.log("checks");

    // Проверка параметров запроса для анализатора
    for (let key in this.parameters) {
      if (this.parameters[key] === null) {
        throw new Error(`Входные параметры для анализа логов пустые!`);
      }
    }
  }
}

module.exports = CallLogic;
