class MaEmptyLogDialog {
  constructor() {
    this.container = maActiveSipView._getElement({
      tag: "div",
    });

    const self = this;

    MaEmptyLogDialog.#getMainDialog(self);
  }

  static #shortTimeAnswerHtml = ` <span style="font-size: 9pt">Видимо, наш сервер еще не начал отправлять запросы. 
                                  <br/>
                                  Возможно активный SIP был создан совсем недавно, либо вы пытаетесь проверить статус в первые минуты часа. 
                                  <br/>
                                  Перейдите в настройки Активного SIP, проверьте все введенные данные и нажмите “Изменить”. 
                                  <br/>
                                  Попробуйте выполнить проверку через 1-5 минут.
                                  </span>`;

  static #longTimeAnswerHtml = `<span style="font-size: 9pt">Данные авторизации (домен, сервер, порт) недоступны из сети Манго или введены некорректно.
                                <br/>
                                Проверьте корректность ввода данных или обратитесь к оператору предоставляющую данную услугу.
                                </span>`;

  static #getMainDialog(self) {
    self.container.innerHTML = `<span style="font-size: 10pt;">Как давно был зарегистрирован<br/>Активный SIP?</span>`;

    self.container.append(
      maActiveSipView._getElement({
        tag: "button",
        innerHtml: "<span>5-10 минут</span>",
        onclick: function () {
          MaEmptyLogDialog.#getAnswerBlock(self, MaEmptyLogDialog.#shortTimeAnswerHtml);
        },
        classList: ["button-of-mango-assistant"],
      })
    );

    self.container.append(
      maActiveSipView._getElement({
        tag: "button",
        innerHtml: `<span style="font-size: 9pt;">Более часа (были проведены попытки изменения настроек)</span>`,
        onclick: function () {
          MaEmptyLogDialog.#getAnswerBlock(self, MaEmptyLogDialog.#longTimeAnswerHtml);
        },
        classList: ["button-of-mango-assistant"],
      })
    );
  }

  static #getButtonReturnToMain(self) {
    const button = maActiveSipView._getElement({
      tag: "button",
      innerHtml: "<small>Вернуться к выбору пунктов</small>",
      onclick: function () {
        MaEmptyLogDialog.#getMainDialog(self);
      },
      classList: ["button-of-mango-assistant"],
    });

    return button;
  }

  static #getAnswerBlock(self, innerHtml) {
    self.container.innerHTML = "";

    self.container.append(MaEmptyLogDialog.#getButtonReturnToMain(self));
    self.container.append(
      maActiveSipView._getElement({
        tag: "div",
        innerHtml: innerHtml,
      })
    );
  }
}
