const registrationManager = require("./registration-manager");

class RegistrationLogic {
  constructor(login, domain) {
    this.login = login;
    this.domain = domain;
  }

  async getData() {
    this.checkParams();

    const result = await registrationManager.getInstance.getNumberRegistrations(this.login, this.domain);

    return result;
  }

  checkParams() {
    console.log("checkParams");

    // Проверка параметров запроса для анализатора
    if (!(/^\w+$/i.test(this.login) && /^[\w\.]+\.[a-z]{1,3}$/i.test(this.domain))) {
      throw new Error(`Некорректный формат входных параметров для получения регистрации sip-номера!`);
    }
  }
}

module.exports = RegistrationLogic;
