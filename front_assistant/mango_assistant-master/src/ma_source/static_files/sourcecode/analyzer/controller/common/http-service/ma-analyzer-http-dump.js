const maAnalyzerHttpDump = {
  /**
   * Получение анализа дампа
   * @param {String} callId - номер дампа
   * @param {Object} resultElement - Объект с html-элементами для вывода результата
   */
  getDumpAnalyzeInfo(callId, elements) {
    maAnalyzerViewDump.display(elements, "start");
    fetch(`${MA_DUMP_ANALYZER_NODE_URL}/mm/dump?callId=${callId}`)
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Not 200");
        }
        return res.json();
      })
      .then((json) => {
        if (json.isComplete) {
          maAnalyzerViewDump.display(elements, "finish", json.data);
          maAnalyzerController.httpService.sendStatistic(`Анализ дампа ${callId}`, true);
        } else {
          throw new Error("Not Complete");
        }
      })
      .catch((error) => {
        maAnalyzerViewDump.display(elements, "error", error);
      });
  },
};
