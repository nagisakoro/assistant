const CheckInterface = require("./check-interface");
const fetch = require("node-fetch");

class CheckHelper extends CheckInterface {
  constructor() {
    super();
    this.log = null;
    this.is403 = false;
  }

  async getActiveSipTailLog(sip) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: this._getBody(sip),
    };

    return await fetch("http://logs.mango.local/", options)
      .then((data) => data.text())
      .then((log) => {
        this.log = log;
        return this._conclusion;
      })
      .catch((error) => {
        console.log("getActiveSipTailLog(sip) error:");
        console.log(error);
        throw new Error(error);
      });
  }

  _getBody(sip) {
    const details = {
      server: "1",
      output_method: "2",
      search_text: sip,
      submit: "ИСКАТЬ",
    };

    const body = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      body.push(encodedKey + "=" + encodedValue);
    }
    return body.join("&");
  }

  get _conclusion() {
    if (this.log !== null && this.log !== "<pre><pre>") {
      const matchesCodes = this.log.match(/\nSIP\/2\.0 \d+[^(\n)]*\nVia\: SIP\/2\.0\/UDP/gim);
      const matchMultifonMessage = this.log.match(
        /Unable to register in lite mode \(LIMITED\)|Not digit in number|Error checking auth|User already has maximum available location count/im
      );

      if (matchesCodes !== null) {
        const first4Messages = matchesCodes.slice(0, 4);
        for (let message of first4Messages) {
          if (/SIP\/2\.0 200/i.test(message)) {
            return this._getConclusionObject("Регистрация успешна");
          }
          if (/SIP\/2\.0 403/i.test(message)) {
            this.is403 = true;
          }
        }

        if (matchMultifonMessage !== null) {
          if (/Unable to register in lite mode \(LIMITED\)/i.test(matchMultifonMessage)) {
            return this._getConclusionObject(`На SIM-карте Мегафон нет денег, в этом случае услуга Мультифон не работает.`);
          }
          if (/Not digit in number/i.test(matchMultifonMessage)) {
            return this._getConclusionObject(`Некорректно указан логин - для Мультифон необходимо указывать только цифры номера.`);
          }
          if (/Error checking auth/i.test(matchMultifonMessage)) {
            return this._getConclusionObject(`Некорректный логин или пароль.`);
          }
          if (/User already has maximum available location count/i.test(matchMultifonMessage)) {
            return this._getConclusionObject(
              `Учетная запись уже где-то зарегистрирована, Мультифон не дает регистрировать более одного устройства. 
                <br/>
                Если настройка была выполнена на старом ЛК (или тестовом), необходимо убрать оттуда этот активный SIP. 
                <br/>
                Для этого обратитесь к ПМу клиента.`
            );
          }
        }

        if (this.is403) {
          return this._getConclusionObject(
            `Ответ от сервера Вашего оператора связи: 403 Forbidden.
              <br/>
              Для решения проблемы обратитесь в службу поддержки Вашего оператора связи и сообщите им условие возникновения и текст ошибки`
          );
        }

        return this._getConclusionObject(
          `Сервер (оператор) не отвечает на наши запросы на регистрацию. 
          <br/>
          Необходимо проверить корректность указания адреса сервера и порта, затем обратиться к оператору за уточнением причин. 
          <br/>
          При необходимости предоставьте лог клиенту для передачи оператору.`
        );
      }
    }

    return this._getConclusionObject(
      `Логи пустые.
        <br/>
        Причины:
        <ol>
          <li>Сервер еще не начал отправлять запросы (учетная запись асипа зарегистрирована недавно 1-10 минут назад)</li>
          <li>Проверить пункт назначения (домен, сервер, порт)</li>
        </ol>`,
      false
    );
  }

  _getConclusionObject(message, isSendLogs = true) {
    return {
      message: message,
      log: isSendLogs ? this.log : null,
    };
  }
}

module.exports = new CheckHelper();
