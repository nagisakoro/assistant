class MaViewService {
  static setAvailable() {
    MaViewService.#setAuthStatus(true);
  }

  static setDisable() {
    MaViewService.#setAuthStatus(false);
  }

  static setEmail(email) {
    $(`div#mango-assistant div#mango-assistant-header .ma-container__auth-email`).val(email);
  }

  static #toggleMainBlock(isShow) {
    const toggleButton = $(`div#mango-assistant div#mango-assistant-header button#hide-show-btn`);

    if (toggleButton.length) {
      if (toggleButton.text() !== "Загрузка") {
        if (isShow) {
          toggleButton.removeAttr("disabled");
          toggleButton.html("Свернуть");
          $(`#mango-assist-data`).slideDown(200);
          document.querySelector("div#mango-assist-data").style.overflowY = "scroll";
          return;
        }
        toggleButton.attr("disabled", true);
        toggleButton.html("Развернуть");
        $(`#mango-assist-data`).slideUp(200);
      }
    }
  }

  static #setAnalyzerButtonStatus(isAuth) {
    if (isAuth) {
      $(`button[id^="ma-analyze-call"]`).html(`<span style="color: black">Анализ логов</span>`);
      $(`button[id^="ma-analyze-call"]`).removeAttr("disabled");
      return;
    }

    $(`button[id^="ma-analyze-call"]`).attr("disabled", true);
    $(`button[id^="ma-analyze-call"]`).html(`<span class="${maAnalyzerModel.redPlaceholderClass}">Укажите email</span>`);
    $(`div#mAssistantModalWindow div#maModalDiv button`).attr("disabled", true);
    $(`div#mAssistantModalWindow div#maModalDiv button`).html(`<span class="${maAnalyzerModel.redPlaceholderClass}">Укажите email</span>`);
  }

  static #setLkToBpmButtonStatus(isAuth) {
    if (isAuth) {
      $(`button[id^="ma-go-to-bpm-"]`).html(`<span style="font-size:10px">Перейти в BPM</span>`);
      $(`button[id^="ma-go-to-bpm-"]`).removeAttr("disabled");
      return;
    }

    $(`button[id^="ma-go-to-bpm-"]`).html(
      `<span style="font-size:9px; color:red">Для перехода в BPM укажите раб. почту, нажав на иконку Манго Ассистента в правом верхнем углу браузера</span>`
    );
    $(`button[id^="ma-go-to-bpm-"]`).attr("disabled", true);
  }

  static #setAuthStatus(isAuth) {
    const text = isAuth ? "Авторизован" : "Неавторизован,<br/>для авторизации укажите раб. почту, нажав на иконку Манго Ассистента в правом верхнем углу браузера";
    const color = isAuth ? "green" : "red";

    $(`div#mango-assistant div#mango-assistant-header .ma-container__auth-status`).html(text);
    $(`div#mango-assistant div#mango-assistant-header .ma-container__auth-status`).css("color", color);

    MaViewService.#toggleMainBlock(isAuth);
    MaViewService.#setAnalyzerButtonStatus(isAuth);
    MaViewService.#setLkToBpmButtonStatus(isAuth);
  }
}
