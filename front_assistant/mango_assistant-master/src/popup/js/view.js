const authInput = $(`.container__auth-input`);
const authNotification = $(`.container__notification`);
const callbackButton = $(".container__callback-button");
const callbackInput = $(".container__callback-input");
const callbackNotification = $(`.container__callback-notification`);

class View {
  static auth = {
    refresh() {
      if (Model.authStatus === Model.status.auth.valid) {
        authNotification.text("Email указан корректно");
        authNotification.css("color", "green");
        return;
      }
      authNotification.text("Email указан некорректно");
      authNotification.css("color", "red");
    },
  };

  static callback = {
    refresh() {
      if (Model.callbackStatus === Model.status.callback.start) {
        callbackNotification.text(`Старт заказа обр. звонка ${Model.lastCallbackNumber}`);
        callbackNotification.css("color", "blue");
        callbackButton.prop("disabled", true);
        callbackInput.prop("disabled", true);
        return;
      }
      if (Model.callbackStatus === Model.status.callback.finish) {
        callbackNotification.text(`Звонок ${Model.lastCallbackNumber} заказан!`);
        callbackNotification.css("color", "green");
        callbackButton.prop("disabled", false);
        callbackInput.prop("disabled", false);
        return;
      }
      if (Model.callbackStatus === Model.status.callback.error) {
        callbackNotification.text(
          `Ошибка при заказе ${Model.lastCallbackNumber}! 
            Попробуйте заказать звонок еще раз. 
            Если ошибка повторяется 3 и более раз, не нужно продолжать делать ЗОЗы, напишите об ошибке на pmotp@mangotele.com.`
        );
        callbackNotification.css("color", "red");
        callbackButton.prop("disabled", false);
        callbackInput.prop("disabled", false);
        return;
      }
      if (Model.authStatus === Model.status.auth.invalid) {
        callbackNotification.text("Укажите email для возможности ЗОЗа");
        callbackNotification.css("color", "red");
        callbackButton.prop("disabled", true);
        callbackInput.prop("disabled", true);
        return;
      }
      if (Model.callbackStatus === Model.status.callback.invalid) {
        callbackNotification.text("Укажите корректный номер");
        callbackNotification.css("color", "red");
        callbackButton.prop("disabled", true);
        callbackInput.prop("disabled", false);
        return;
      }

      callbackNotification.text("Номер указан корректно");
      callbackNotification.css("color", "green");
      callbackButton.prop("disabled", false);
      callbackInput.prop("disabled", false);
    },
  };
}
