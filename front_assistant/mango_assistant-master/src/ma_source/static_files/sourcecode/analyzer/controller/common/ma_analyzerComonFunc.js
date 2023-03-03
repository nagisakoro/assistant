// ФУНКЦИИ ДЛЯ ОБЩИХ ЗАДАЧ
const maAnalyzerCommonFunc = {
  /**
   * Функция добавляет "0", если в числе одна цифра.
   * Нужно для преобразования даты в правильный формат.
   * @param {number} num
   * @returns {string}
   */
  twoDigits(num) {
    return ("0" + num).slice(-2);
  },

  /**
   * Правильный формат даты для запроса получения логов звонка.
   * @param {number} timestamp
   * @returns {string}
   */
  ma_getRightDateFormat(timestamp) {
    const callDate = new Date(new Date(timestamp * 1000));

    const yearParameter = callDate.getFullYear();
    const monthParameter = callDate.getMonth();
    const dayParameter = callDate.getDate();
    const hoursParameter = callDate.getHours();
    const minutesParameter = callDate.getMinutes();
    const secondsParameter = callDate.getSeconds();

    return (
      this.twoDigits(dayParameter) +
      "." +
      this.twoDigits(monthParameter + 1) +
      "." +
      yearParameter +
      " " +
      this.twoDigits(hoursParameter) +
      ":" +
      this.twoDigits(minutesParameter) +
      ":" +
      this.twoDigits(secondsParameter)
    );
  },

  /**
   * Действия при получении данных с переведенными логами.
   * @param {object} json
   * @param {HTMLElement} currentButton
   */
  parseLogs(json, currentButton, contextId) {
    try {
      const vatsDetailLogs = json.data || null;

      if (vatsDetailLogs !== null) {
        const newButtonWithInfo = maAnalyzerView.createNewButtonWithInfo();
        const tableWithInformation = maAnalyzerView.parseTableWithAnalysis(vatsDetailLogs, contextId);
        maAnalyzerView.changeCurrentButtonToNew(currentButton, newButtonWithInfo, tableWithInformation);
      } else {
        maAnalyzerView.displayErrorMessage("vatsDetailsLogs is null!", currentButton);
      }
    } catch (err) {
      maAnalyzerView.displayErrorMessage(`catchError, ${err}`, currentButton);
    }
  },

  parseUrl() {
    const href = location.href || null;
    let isCheckTrue = false;
    let code = null;
    let id = null;

    if (href !== null && typeof location.href === "string") {
      if (
        /^(https|http):\/\/lk\.mango-office\.ru\/\d+\/\d+\/stats\/calls\/?$/.test(href) ||
        /^(https|http):\/\/lk\.mango-office\.ru\/\d+\/\d+\/stats\/missed-calls\/?$/.test(href) ||
        /^(https|http):\/\/lk\.mango-office\.ru\/\d+\/\d+\/stats\/failed-calls\/?$/.test(href)
      ) {
        isCheckTrue = true;
        code = href.split("/")[3];
        id = href.split("/")[4];
      }
    }
    return [isCheckTrue, code, id];
  },
};

maAnalyzerController.commonFunc = maAnalyzerCommonFunc;
