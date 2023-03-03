// СТАРТОВАЯ ТОЧКА РАБОТЫ АНАЛИЗАТОРА ЗВОНКОВ

function ma_analyzerStart() {
  // Старт работы блока View
  ma_analyzerViewStart();

  // При открытии страницы отправляется запрос на получение информации о сотрудниках.
  // Без этой инфы анализатор не сможет корректно работать.
  maAnalyzerController.httpService.getInfoAboutMembers();

  maAnalyzerController.httpService.getUrlPartsAndAccountInfo();

  MaRuntimeService.checkEmail();

  // Запуск функции мониторинга запросов.
  // При определенных запросах на странице создается таблица со звонками, мониторинг запросов "ловит" эти запросы для дальнейшей работы анализатора
  maAnalyzerController.httpService.addXMLRequestCallback(function (xhr) {
    const temp = xhr.onload;
    xhr.onload = function () {
      if (temp) {
        temp.apply(this, arguments);
      }
      if (!/stats\/response-stats|stats\/calls|stats\/failed-calls|stats\/missed-calls/.test(xhr.responseURL)) return;

      maAnalyzerController.httpService.checkRequestAndBuildInterface(xhr);
    };
  });
}
