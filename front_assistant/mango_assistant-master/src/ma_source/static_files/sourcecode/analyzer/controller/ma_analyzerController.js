const maAnalyzerController = {
  /**
   * Действия при нажатии на кнопку "Анализ звонка" (изменение кнопки показа логов и отправка запроса на рабочую ноду)
   * @param {string} contextId
   * @param {string} timestamp
   * @param {string} idButton
   * @param {string} fromCall
   * @param {string} toCall
   */
  analyzeCall(contextId = null, timestamp = null, idButton, fromCall, toCall) {
    const currentButton = maAnalyzerView.getAndChangeCurrentButton(idButton);

    if (contextId !== null && timestamp !== null) {
      maAnalyzerController.httpService.sendStatistic(`Анализ логов звонка ${contextId}`, true);
      maAnalyzerController.httpService.sendXMLRequestVatsLogs(contextId, timestamp, currentButton, fromCall, toCall);
    } else {
      maAnalyzerController.httpService.sendStatistic(`Анализ логов звонка`, true);
      maAnalyzerView.displayErrorMessage(undefined, currentButton);
    }
  },
};
