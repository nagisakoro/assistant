mainMangoAssistFunction();

// Функция создания и описания работы Манго Ассистента-----------------------------------------------------------------------------------------------------------------
function mainMangoAssistFunction() {
  $("body div#home-app div#home-app-container").append(HTML_MANGO_ASSISTANT);
  // Функция, реалзиующая возможность перетаскивания объекта
  dragElement(document.getElementById("mango-assistant"));

  MaRuntimeService.checkEmail();

  new Promise((resolve) => {
    // Получение id продукта и данные по аккаунту
    getUrlPartsAndAccountInfo(resolve);
  }).then(() => {
    if (MA_LK_INFO.IS_HREF_AND_CONTROL_RIGHT) {
      // Запуск проверок при первичной загрузке Манго Ассистента
      new Promise(function (resolve, reject) {
        getCalltrackingInfo(resolve);
      })
        .then(() => {
          return new Promise((resolve, reject) => {
            // Получение данных о свободном остатке облачного хранилища
            checkingSizeOfCloudStorage(resolve);
          });
        })
        .then(() => {
          return new Promise((resolve) => {
            fillingNumbersProperties(resolve);
          });
        })
        .then(() => {
          return new Promise((resolve, reject) => {
            // Получение стандартного значения ожидания для внешнего номера
            gettingInfoAboutStandartWaitingAnswerValue(resolve);
          });
        })
        .then(() => {
          return new this.Promise((resolve, reject) => {
            // Проверка баланса
            checkingBalance(resolve);
          });
        })
        .then(() => {
          return new this.Promise((resolve, reject) => {
            // Проверка на наличие созданных сотрудников
            checkingCountMembers(resolve);
          });
        })
        .then(() => {
          return new this.Promise((resolve, reject) => {
            // Проверка на блокировку продукта
            checkingBlockedReason(resolve);
          });
        })
        .then(() => {
          // Вывод сообщений о технических проблемах при работе проверок
          createTechInfoErrorMessage();

          // Установка маски для номера при заказе обратного звонка в ОТП
          maSetMaskCallbackNumber();

          // Загрузка завершена, убираем надпись "Загрузка" с кнопки "Свернуть/Развернуть", ставим надпись "Свернуть"
          $(`div#mango-assistant div#${mangoAssistantHeader} button#hide-show-btn`).html("Свернуть");

          AuthService.check();

          // Отправка статистики по "пассивным" проверкам
          sendingPassiveChecksStats();
        });

      // Описание работы с интерфейсом-------------------------------------------------------------------------------------------------------------------------------------
      // Работа с кнопкой "Скрыть/Показать"--------------------------------------------------------------------------------------------------------------------------------
      $(`div#mango-assistant div#${mangoAssistantHeader} button#hide-show-btn`).click(function () {
        toggleBlock(`#${mangoAssistData}`, `div#mango-assistant div#${mangoAssistantHeader} button#hide-show-btn`);
        document.querySelector("div#mango-assist-data").style.overflowY = "scroll";
      });

      // Методы для работы с проверкой схем распределения звонков----------------------------------------------------------------------------------------------------------
      // Нужно доработать проверку!!!!!!!!!!
      $(`#${mangoAssistData} button#checkActivateSchemaButton`).click(function () {
        mangoAssistantSendStatistic("Проверка схем", true);
        checkingCallFwrdSchemas();
      });

      $(`#${mangoAssistData} button#checkFwdCallsToggleButton`).click(function () {
        toggleBlock(`#${mangoAssistData} div#badFwdCallSchemas`, `#${mangoAssistData} button#checkFwdCallsToggleButton`);
      });

      $(`#${mangoAssistData} button#maOpenChecksButton`).click(function () {
        toggleBlock(`#${mangoAssistData} div#maImplementChecks`);
      });

      // Кнопка для отправки письма ПМ'у-----------------------------------------------------------------------------------------------------------------------------------
      // Закомментировал, пока отказались----------------------------------------------------------------------------------------------------------------------------------
      /*   $(`#${mangoAssistData} button#sendEmailToPMButton`).click(function() {
      openMailClient();
    }); */

      // Методы для создания заявки в SD (заявка назначается на Problem Management)--------------------------------------------------------------------------------------
      $(`#${mangoAssistData} button#showSDRequestButton`).click(function () {
        slideInputToggleSections(true, `#createSDRequestBlock`, `button#showSDRequestButton`);
      });

      $(`#${mangoAssistData} button#cancelSDRequestButton`).click(function () {
        slideInputToggleSections(false, `#createSDRequestBlock`, `button#showSDRequestButton`);
      });

      $(`#${mangoAssistData} button#createAndSendRequestSD`).click(function () {
        checkingFieldOfDescriptionSDRequest();
      });

      $(`#${mangoAssistData} textarea#fieldWithRequestText`).on("input", function (elem) {
        deleteClassElemTarget(elem, redPlaceholderClass);
      });

      //Методы для заказа обратного звонка для ОТП-----------------------------------------------------------------------------------------------------------------------
      $(`#${mangoAssistData} button#orkCallHeadButton`).click(function () {
        slideInputToggleSections(true, `#orkCallBlock`, `button#orkCallHeadButton`);
      });

      $(`#${mangoAssistData} button#cancelCallingOrkButton`).click(function () {
        slideInputToggleSections(false, `#orkCallBlock`, `button#orkCallHeadButton`);
      });

      $(`#${mangoAssistData} button#orderCallingOrkButton`).click(function () {
        // Статистика для ЗОЗа отправляется из этой функции
        creatingCallBackOTP();
      });

      $(`#${mangoAssistData} div#orkCallBlock input#callbackOTPclientPhoneInput`).on("keyup", function (elem) {
        deleteClassElemTarget(elem, redPlaceholderClass);
      });

      //Методы для проверки активных SIP - номеров-----------------------------------------------------------------------------------------------------------------------
      $(`#${mangoAssistData} button#checkActiveSIPbutton`).click(function () {
        mangoAssistantSendStatistic("Проверка активных SIP-номеров", true);
        slideInputToggleSections(true, `#checkActiveSIPBlockContent`, `button#checkActiveSIPbutton`);
        maActiveSipController.getActiveSipList();
      });

      $(`#${mangoAssistData} button#activeSIPContentToggleButton`).click(function () {
        toggleBlock(`#${mangoAssistData} div#contentOfCheckingActiveSIPBlock`, `#${mangoAssistData} button#activeSIPContentToggleButton`);
      });

      //Методы для проверки правил записи разговоров-----------------------------------------------------------------------------------------------------------------------
      $(`#${mangoAssistData} button#checkRulesRecordingConversationButton`).click(function () {
        mangoAssistantSendStatistic("Проверка правил записи разговора", true);
        slideInputToggleSections(true, `#checkRulesRecordingConversationBlockContent`, `button#checkRulesRecordingConversationButton`);
        checkingRulesRecordingConversation();
      });

      $(`#${mangoAssistData} button#rulesRecordConversationToggleButton`).click(function () {
        toggleBlock(`#${mangoAssistData} div#contentOfCheckingRulesRecordConversationBlock`, `#${mangoAssistData} button#rulesRecordConversationToggleButton`);
      });

      //Методы для проверки доступных регионов-----------------------------------------------------------------------------------------------------------------------------
      $(`#${mangoAssistData} button#checkAvailableRegionsButton`).click(function () {
        mangoAssistantSendStatistic("Проверка доступных для звонка регионов", true);
        slideInputToggleSections(true, `#checkAvailableRegionsButtonBlockContent`, `button#checkAvailableRegionsButton`);

        checkAvailableRegions();
      });

      $(`#${mangoAssistData} button#availableRegionsToggleButton`).click(function () {
        toggleBlock(`#${mangoAssistData} div#contentOfAvailableRegionsBlock`, `#${mangoAssistData} button#availableRegionsToggleButton`);
      });

      //Методы для отображения информации по выбранному сотруднику---------------------------------------------------------------------------------------------------------
      $(`#${mangoAssistData} button#showHideDisplayInfoMembersButton`).click(function () {
        mangoAssistantSendStatistic("Получение информации о сотруднике", true);
        gettingInfoAboutMembers();
      });

      $(`#${mangoAssistData} button#InfoMembersContentToggleButton`).click(function () {
        toggleBlock(`#${mangoAssistData} div#contentOfMembersInfoBlock`, `#${mangoAssistData} button#InfoMembersContentToggleButton`);
      });

      $(`#${mangoAssistData} input#nameOfMemberInfoInput`).on("input", function () {
        filterSelectedItems("listOfMembersMangoAssistant", "nameOfMemberInfoInput");
      });

      $(`#${mangoAssistData} div#listOfMembersMangoAssistant`).on("click", `button`, function () {
        showInfoAboutSelectedMember();
      });

      // Метод "Свернуть/развернуть" для блока со справочной информацией по Confluence
      $(`#${mangoAssistData} button#maToggleInfoBlockButton`).click(function () {
        toggleBlock(`#${mangoAssistData} div#maInfoBlockContent`);
      });
    } else {
      $(`div#mango-assistant`).html(`<p class=${redPlaceholderClass}>Не удалось загрузить Манго Ассистент!</p>${MA_ERROR_HINT}`);
    }
  });
}
