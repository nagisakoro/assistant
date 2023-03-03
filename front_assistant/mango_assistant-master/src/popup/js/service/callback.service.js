class CallbackService {
  static check(value) {
    const number = CallbackService.#parseNumber(value);

    if (CallbackService.#isValidNumber(number)) {
      CallbackService.#setStatus(Model.status.callback.valid);

      return;
    }
    CallbackService.#setStatus(Model.status.callback.invalid);
  }

  static #setStatus(status) {
    Model.callbackStatus = status;
    View.callback.refresh();
  }

  static createCallback(value) {
    CallbackService.#setStatus(Model.status.callback.start);
    const number = CallbackService.#parseNumber(value);
    Model.lastCallbackNumber = number;

    if (CallbackService.#isValidNumber(number)) {
      Model.lastCallbackNumber = number;

      try {
        StatisticService.send.callback();
        const requestParams = {
          number: number,
        };

        $.post(`${MA_WORK_NODE_URL}/create-callback-otp`, requestParams)
          .done((response) => {
            if (response.hasOwnProperty("status") && response.status == "success") {
              CallbackService.#setStatus(Model.status.callback.finish);
              return;
            }

            console.error("callback not have success status");
            CallbackService.#setStatus(Model.status.callback.error);
          })
          .fail((error) => {
            console.error(error);
            CallbackService.#setStatus(Model.status.callback.error);
          });
      } catch (error) {
        console.error(error);
        CallbackService.#setStatus(Model.status.callback.error);
      }

      return;
    }

    CallbackService.#setStatus(Model.status.callback.error);
  }

  static #parseNumber(value) {
    return value.trim().replace(/\D/g, "");
  }

  static #isValidNumber(number) {
    return (number.trim()[0] === "7" || number.trim()[0] === "8") && number.length === 11;
  }
}
