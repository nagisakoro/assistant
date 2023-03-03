const MA_LK_INFO = {};
MA_LK_INFO.listOfInfoErrors = new Set();
MA_LK_INFO.activeMembers = {};
MA_LK_INFO.availableGroups = {};
MA_LK_INFO.outgoingNumbers = new Map();
MA_LK_INFO.incomingNumbers = new Map();
MA_LK_INFO.waitingAnswersSettings = {};
MA_LK_INFO.passiveChecks = new Set();
// Свойство для рабочих переменных
MA_LK_INFO.workParams = {
  isFillingAvailableItemsSuccess: undefined,
  isContinueCheckBadSchemas: false,
};
// Тело для POST - запросов, где
MA_LK_INFO.accLoginParams = null;
// Свойство используется для записи найденный проблем в работе подключенных интеграций
MA_LK_INFO.calltrackingIntegrationProblems = new Array();

const MA_ERROR_HINT = `<p style="font-size:8pt">Попробуйте перезагрузить страницу. Если после перезагрузки ситуация не меняется, просьба написать письмо об ошибке в группу Problem management отдела Тех. поддержки.</p>`;


// Расшифровка наименований виджетов в интеграции
MA_LK_INFO.TRANSLATE_WIDGETS = [
  ["ga", "Google Analytics"],
  ["metrika", "Яндекс Метрика"],
  ["adwords", "Google Ads"],
  ["direct", "Яндекс Директ"],
  ["owox", "OWOX"],
  ["amo", "amoCRM"],
  ["bitrix", "Битрикс24"],
  ["origami", "Origami"],
  ["k50", "К50"],
  ["roistat", "Roistat"],
  ["callsite", "Заявки с сайта"],
  ["jivosite", "jivosite"],
  ["scitylana", "SCITYLANA"],
  ["ccc", "Сделки Mango Office"],
  ["albato", "albato"],
  ["multichannel", "Мультиканальный чат"],
  ["callback", "Обратный звонок"],
];

// Общие функции-------------------------------------------------------------------------------------------------------------------------------------------------------
// Функция-замыкание для создания счетчика
function makeCounter() {
  let counter = 0;
  return function (isIncrease = false) {
    if (isIncrease) {
      return counter++;
    } else {
      return counter;
    }
  };
}

// Добавление проблемы в лист проблем при выполнении общих проверок при запуске
function addProblemToList(text, err = "") {
  console.error(text, err);
  MA_LK_INFO.listOfInfoErrors.add(`${text}`);
}

// Добавление блока с информацией об ошибках
function addingInfoBlockToMangoAssistData(contentOfDiv) {
  if (typeof contentOfDiv === "string" && contentOfDiv.length) {
    $(`#${mangoAssistData}`).prepend(`<div class="mangoAssistantBlock">${contentOfDiv}</div>`);
  }
}

// Создание сообщения о технических проблемах при работе начальных проверок
function createTechInfoErrorMessage() {
  if (MA_LK_INFO.listOfInfoErrors.size > 0) {
    let errorMessage = `<p style = "color: red">Внимание!</p><p>`;
    MA_LK_INFO.listOfInfoErrors.forEach((value, valueAgain, set) => {
      errorMessage += `${value}<br/>`;
    });
    errorMessage += `</p>${MA_ERROR_HINT}`;
    addingInfoBlockToMangoAssistData(errorMessage);
  }
}

// Вывод результата в Div после проверки
function displayResultField(resultMessage, resultDivId, buttonDescription = null, buttonId = null, isError = false) {
  $(`#${mangoAssistData} div#${resultDivId}`).empty();
  if (isError) {
    $(`#${mangoAssistData} div#${resultDivId}`).append(`<span class="${redPlaceholderClass}">${resultMessage}</span>${MA_ERROR_HINT}`);
  } else {
    $(`#${mangoAssistData} div#${resultDivId}`).append(`<span>${resultMessage}</span>`);
  }
  if (typeof buttonDescription === "string" && typeof buttonId === "string") {
    $(`#${mangoAssistData} button#${buttonId}`).removeAttr("disabled");
    $(`#${mangoAssistData} button#${buttonId}`).html(`<span style = "color: rgb(120,100,39,0.65);">${buttonDescription}</span>`);
  }
}

// Вывод анимации лоадера при попытке проверки
function displayLoaderField(loaderDivId, slideDownDivId, buttonId, buttonDescription) {
  $(`#${mangoAssistData} button#${buttonId}`).html(`<small style = "color:red">${buttonDescription}</small>`);
  $(`#${mangoAssistData} button#${buttonId}`).attr("disabled", true);
  $(`#${mangoAssistData} div#${slideDownDivId}`).slideDown(200);
  $(`#${mangoAssistData} div#${loaderDivId}`).empty();
  $(`#${mangoAssistData} div#${loaderDivId}`).append(HTML_MANGO_ASSISTANT_LOADER);
}

// Функция для работы с кнопкой "Свернуть/Развернуть"
function toggleBlock(selectorOfContentBlock, selectorOfButton = null) {
  $(selectorOfContentBlock).slideToggle(200);
  toggleNameOfSlideButton(selectorOfButton);
}

// Функция для кнопок "Свернуть/Развернуть", меняет содержимое кнопок
function toggleNameOfSlideButton(selectorOfButton) {
  if (selectorOfButton !== null) {
    $(selectorOfButton).html(function (index, x) {
      if (x != "Свернуть") return "Свернуть";
      else return "Развернуть";
    });
  }
}

// Функция для работы с "большими" блоками ввода (у которых есть кнопка "Отмена")
function slideInputToggleSections(isSlideDown, blockSelector, buttonSelector) {
  if (isSlideDown) {
    $(`#${mangoAssistData} ${blockSelector}`).slideDown(200);
    $(`#${mangoAssistData} ${buttonSelector}`).attr("disabled", true);
  } else {
    $(`#${mangoAssistData} ${blockSelector}`).slideUp(200);
    $(`#${mangoAssistData} ${buttonSelector}`).removeAttr("disabled");
  }
}

// Удаление класса у таргета элемента
function deleteClassElemTarget(elem, classForDelete) {
  $(elem.target).removeClass(classForDelete);
}

// Отправка статистики
function mangoAssistantSendStatistic(action, isActive) {
  try {
    const typeOfAction = typeof action;
    if (typeOfAction !== "string") {
      displayErrorStatisticMessage(`Некорректно указан тип ${action}, ${typeOfAction}`);
      return;
    } else if (!(typeof MA_LK_INFO.accountData.control === "string" && typeof MA_LK_INFO.PRODUCT_ID === "string")) {
      displayErrorStatisticMessage(`
                                  Не удалось получить ls: ${MA_LK_INFO.accountData.control}, 
                                  тип ${typeof MA_LK_INFO.accountData.control} 
                                  или productId: ${MA_LK_INFO.PRODUCT_ID}, 
                                  тип ${typeof MA_LK_INFO.PRODUCT_ID}
                                  `);
      return;
    }

    isActive = isActive ? 1 : 0;

    requestParams = {
      email: $(`div#mango-assistant div#${mangoAssistantHeader} input.ma-container__auth-email`).val(),
      action: action,
      isActive: isActive,
      ls: MA_LK_INFO.accountData.control,
      product: MA_LK_INFO.PRODUCT_ID,
    };
    $.post(`${MA_WORK_NODE_URL}/add-statistic-action`, requestParams)
      .done((data) => {
        if (data.status !== "done") {
          displayErrorStatisticMessage(`action: ${action}, <br/>
                                        ls: ${MA_LK_INFO.accountData.control}, <br/>
                                        product: ${MA_LK_INFO.PRODUCT_ID}, <br/>
                                        type: requestError`);
        }
      })
      .fail((error) => {
        displayErrorStatisticMessage(`action: ${action}, <br/>
                                      ls: ${MA_LK_INFO.accountData.control}, <br/>
                                      product: ${MA_LK_INFO.PRODUCT_ID}, <br/>
                                      type: requestFail`);
      });
  } catch (err) {
    displayErrorStatisticMessage(`type: catchError, <br/>
                                  error: ${err}`);
  }
}

// Отображение окна с сообщением об ошибке при  отправке статистики
function displayErrorStatisticMessage(error) {
  const errorStatsBlock = $(`div#mango-assistant div#${mangoAssistData} div#ma-error-stats`);
  if (errorStatsBlock.length === 0) {
    $(`div#mango-assistant div#${mangoAssistData}`).prepend(`<div id="ma-error-stats" class="mangoAssistantBlock">
    <span class="${redPlaceholderClass}">Внимание!</span>
    <span style="font-size:9pt">
      Не удалось отправить <br/>статистику работы Манго Ассистента.<br/>
      Пожалуйста, напишите письмо группе <br/>Problem management с темой <b>"Не отправляется статистика Манго Ассистента"</b> и добавьте в письмо следующую информацию:
      <button id="maStatsErrorToggleButton" class="button-of-mango-assistant">Развернуть</button>
      <div id="maStatsErrorInformation" class="mangoAssistantBlock" style="display: none;">
        ${error}
      </div>
    </span>
  </div>`);

    // Метод для работы с информацией об ошибке при отправки статистики
    $(`#${mangoAssistData} button#maStatsErrorToggleButton`).click(function () {
      toggleBlock(`div#${mangoAssistData} div#maStatsErrorInformation`, `div#${mangoAssistData} button#maStatsErrorToggleButton`);
    });
  }
}

function getUrlPartsAndAccountInfo(resolve) {
  [MA_LK_INFO.IS_HREF_AND_CONTROL_RIGHT, MA_LK_INFO.PRODUCT_CODE, MA_LK_INFO.PRODUCT_ID] = parseUrl();

  setRequestUrls();

  if (MA_LK_INFO.IS_HREF_AND_CONTROL_RIGHT) {
    new Promise((resolve) => {
      gettingAccountInformation(resolve);
    }).then((data) => {
      MA_LK_INFO.IS_HREF_AND_CONTROL_RIGHT = data;
    });
  }

  resolve();
}

function setRequestUrls() {
  MA_LK_INFO.CLOUD_STORAGE_URL = `https://lk.mango-office.ru/${MA_LK_INFO.PRODUCT_CODE}/${MA_LK_INFO.PRODUCT_ID}/additional-settings/cloud-storage`;
  MA_LK_INFO.GET_NUMBER_URL = `https://lk.mango-office.ru/${MA_LK_INFO.PRODUCT_CODE}/${MA_LK_INFO.PRODUCT_ID}/mango-numbers/numbers`;
  MA_LK_INFO.GET_ACTIVE_SIP_INFO_URL = `https://lk.mango-office.ru/${MA_LK_INFO.PRODUCT_CODE}/${MA_LK_INFO.PRODUCT_ID}/main-uri/get`;
  MA_LK_INFO.GET_ACCOUNT_INFO_URL = `https://api-header.mango-office.ru/api/account`;
  MA_LK_INFO.API_IDENTITY_URL = `https://lk.mango-office.ru/profile/${MA_LK_INFO.PRODUCT_CODE}/${MA_LK_INFO.PRODUCT_ID}/api/identity`;
  MA_LK_INFO.GET_CALL_RECORDING_RULES_URL = `https://lk.mango-office.ru/${MA_LK_INFO.PRODUCT_CODE}/${MA_LK_INFO.PRODUCT_ID}/call-recording/rules`;
  MA_LK_INFO.GET_AVAILABLE_REGIONS_URL = `https://lk.mango-office.ru/${MA_LK_INFO.PRODUCT_CODE}/${MA_LK_INFO.PRODUCT_ID}/security/overview`;
  MA_LK_INFO.GET_INFO_ABOUT_MEMBERS_URL = `https://lk.mango-office.ru/issa/api/${MA_LK_INFO.PRODUCT_CODE}/${MA_LK_INFO.PRODUCT_ID}/members`;
  //MA_LK_INFO.GET_INFO_ABOUT_MEMBERS_URL = `https://lk.mango-office.ru/${MA_LK_INFO.PRODUCT_CODE}/${MA_LK_INFO.PRODUCT_ID}/members/index`;
  MA_LK_INFO.GET_WAITING_ANSWERS_SETTINGS_URL = `https://lk.mango-office.ru/${MA_LK_INFO.PRODUCT_CODE}/${MA_LK_INFO.PRODUCT_ID}/waiting-answer/settings`;
  MA_LK_INFO.MA_CALL_FWD_OVERVIEW_URL = `https://lk.mango-office.ru/${MA_LK_INFO.PRODUCT_CODE}/${MA_LK_INFO.PRODUCT_ID}/call-fwd-settings/overview`;
  MA_LK_INFO.GET_CALL_FWD_SETTINGS_URL = `https://lk.mango-office.ru/${MA_LK_INFO.PRODUCT_CODE}/${MA_LK_INFO.PRODUCT_ID}/call-fwd-settings/settings`;
  MA_LK_INFO.MA_MENU_URL = `https://api-header.mango-office.ru//api/menu`;
}

function parseUrl() {
  const href = location.href || null;
  let isCheckTrue = false;
  let code = null;
  let id = null;

  if (href !== null && typeof location.href === "string") {
    if (/^(https|http):\/\/lk\.mango-office\.ru\/profile\/\d+\/\d+\/?$/.test(href)) {
      isCheckTrue = true;
      code = href.split("/")[4];
      id = href.split("/")[5];
    }
  }
  return [isCheckTrue, code, id];
}

// Проверка на отправку статистики по "пассивным" проверкам
function sendingPassiveChecksStats() {
  const email = $(`div#mango-assistant div#${mangoAssistantHeader} input.ma-container__auth-email`);
  if (MA_LK_INFO.passiveChecks.size !== 0 && email.length) {
    for (value of MA_LK_INFO.passiveChecks) {
      mangoAssistantSendStatistic(value, false);
    }
    MA_LK_INFO.passiveChecks.clear();
  }
}

// Функция возвращает "правильный" шаблон регулярного выражения
function regExpEscape(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

// Скрыть/раскрыть определенный div
function toggleDivRule(separator) {
  $(`div#${mangoAssistData} div#${separator}`).slideToggle(200);
}

// Запрос объема данных облачного хранилища----------------------------------------------------------------------------------------------------------------------------
function checkingSizeOfCloudStorage(resolve) {
  function returnFormatString(number, description, isCheckFreeValue = false) {
    let str = "";
    if (number >= 1000) {
      number = (number / 1000).toFixed(1);
      str += `${description}: ${number} ГБ<br/>`;
    } else {
      if (isCheckFreeValue && number < 5) {
        MA_LK_INFO.passiveChecks.add(`Остаток обл. хранилища: ${number} МБ`);
        str += `${description}: <span class=${redPlaceholderClass}>${number} МБ</span><br/>`;
      } else {
        str += `${description}: <span>${number} МБ</span><br/>`;
      }
    }
    return str;
  }

  $.ajax({
    type: "GET",
    url: MA_LK_INFO.CLOUD_STORAGE_URL,
    timeout: 7000,
  })
    .done((data) => {
      $cloudStorageHTML = $(data);

      try {
        const cloudStorageDiv = $cloudStorageHTML.find(`div.b-cloud-storage-control`);

        let textString = "";

        if (cloudStorageDiv.length > 0) {
          const sizeOfCloudStorage = cloudStorageDiv.find(`div#use`);
          const capacityOfCloudStorage = cloudStorageDiv.find(`div#discspace`);
          if (capacityOfCloudStorage.length == 1) {
            let capacityNumber = Number(capacityOfCloudStorage.html().replace(/[^\d.]/g, ""));
            capacityNumber = returnFormatString(capacityNumber, "Общее количество");
            textString += capacityNumber;
          }
          if (sizeOfCloudStorage.length == 1) {
            let freeNumber = sizeOfCloudStorage.html().match(/свободно\s*[\d\s.]+\s*МБ/i);
            let occupiedNumber = sizeOfCloudStorage.html().match(/Занято\s*[\d\s.]+\s*МБ/i);
            if (freeNumber !== null && freeNumber.length > 0) {
              freeNumber = Number(freeNumber[0].replace(/[^\d.]/g, ""));
              freeNumber = returnFormatString(freeNumber, "Свободно", true);
              textString += freeNumber;
            }
            if (occupiedNumber !== null && occupiedNumber.length > 0) {
              occupiedNumber = Number(occupiedNumber[0].replace(/[^\d.]/g, ""));
              occupiedNumber = returnFormatString(occupiedNumber, "Занято");
              textString += occupiedNumber;
            }
          }
        }

        if (textString.length > 0) {
          textString = `<p style="font-size:10pt; text-align:center">Свободный остаток обл. хран.</p><p>${textString}</p>`;
          addingInfoBlockToMangoAssistData(textString);
        } else {
          addProblemToList(`Не удалось проверить свободный остаток облачного хранилища (не удалось получить данные из html)!`);
        }
      } catch (err) {
        addProblemToList(`Не удалось проверить свободный остаток облачного хранилища!`, err);
      }
    })
    .fail((err) => {
      addProblemToList(`Не удалось проверить свободный остаток облачного хранилища!`, err);
    })
    .always(() => {
      resolve();
    });
}

// Получение информации об ошибках в коллтрекинге
function getCalltrackingInfo(resolve) {
  if (MA_LK_INFO.accLoginParams !== null) {
    $.ajax({
      type: "POST",
      url: MA_LK_INFO.MA_MENU_URL,
      data: MA_LK_INFO.accLoginParams,
      timeout: 7000,
    })
      .done((result) => {
        getDctList(result)
          .then(getCalltrackingData)
          .then(() => {
            parseCalltrackingProblemsData();
            resolve();
          })
          .catch((err) => {
            addProblemToList(`Не удалось получить информацию о коллтрекинге!`, err);
            resolve();
          });
      })
      .fail((err) => {
        addProblemToList(`Не удалось получить информацию о коллтрекинге!`, err);
        resolve();
      });
  } else {
    addProblemToList(`Не удалось получить информацию о коллтрекинге!`);
    resolve();
  }

  // Вспомогательные функции для getCalltrackingInfo
  function getDctList(result) {
    return new Promise((resolve, reject) => {
      try {
        if (result.hasOwnProperty("data") && result.data.hasOwnProperty("leftMenuItems")) {
          const dctList = new Array();

          result.data.leftMenuItems.forEach((element) => {
            if (element.type === "dct") {
              dctList.push([element.name, element.link]);
            }
          });

          resolve(dctList);
        } else {
          addProblemToList(`Не удалось получить информацию о коллтрекинге!`);
          reject();
        }
      } catch (err) {
        addProblemToList(`Не удалось получить информацию о коллтрекинге!`, err);
        reject();
      }
    });
  }

  function getCalltrackingData(dctList) {
    return new Promise((resolve, reject) => {
      try {
        const dctListLength = dctList.length;

        if (dctListLength > 0) {
          let countSuccessDCTRequests = 0;

          dctList.forEach((element) => {
            const dctName = element[0];
            const dctUrlParts = element[1].match(/\/?(\d+)\/(\d+)\/(\d+)/);

            if (dctUrlParts !== null) {
              const dctId = dctUrlParts[3];

              $.ajax({
                type: "GET",
                url: `https://lk.mango-office.ru/ics/api/${dctId}/calltracking/previews`,
                timeout: 7000,
              })
                .done((dctData) => {
                  parseDctData(dctData, dctName, dctId)
                    .then(() => {
                      countSuccessDCTRequests++;
                      checkCountOfRequests(countSuccessDCTRequests, dctListLength, resolve);
                    })
                    .catch((err) => {
                      addProblemToList(`Не удалось получить информацию о коллтрекинге!`, err);
                      reject();
                    });
                })
                .fail((err) => {
                  addProblemToList(`Не удалось получить информацию о коллтрекинге!`, err);
                  reject();
                });
            }
          });
        } else {
          resolve();
        }
      } catch (err) {
        addProblemToList(`Не удалось получить информацию о коллтрекинге!`, err);
        reject();
      }
    });
  }

  function parseDctData(dctData, dctName, dctId) {
    return new Promise((resolve, reject) => {
      try {
        const dctDataLength = dctData.length;
        if (/* Array.isArray(dctData) &&  */ dctDataLength) {
          let countWidgetRequests = 0;
          dctData.forEach((dctElement) => {
            const integrationName = dctElement.name;
            const widgetId = dctElement.widget_id || null;
            if (widgetId) {
              $.ajax({
                type: "GET",
                url: `https://lk.mango-office.ru/ics/api/${dctId}/integrations/${widgetId}`,
                timeout: 7000,
              })
                .done((integrationResult) => {
                  parseIntegrationData(integrationResult, dctName, dctId, integrationName, widgetId, reject);
                  countWidgetRequests++;
                  checkCountOfRequests(countWidgetRequests, dctDataLength, resolve);
                })
                .fail((err) => {
                  addProblemToList(`Не удалось получить информацию о коллтрекинге!`, err);
                  reject();
                });
            } else {
              addProblemToList(`Не удалось получить информацию о коллтрекинге!`, widgetId);
              reject();
            }
          });
        } else {
          resolve();
        }
      } catch (err) {
        addProblemToList(`Не удалось получить информацию о коллтрекинге!`, err);
        reject();
      }
    });
  }

  function checkCountOfRequests(countSuccessRequests, maxValue, resolve) {
    if (countSuccessRequests === maxValue) {
      resolve();
    }
  }

  function parseIntegrationData(integrationResult, dctName, dctId, integrationName, widgetId, reject) {
    try {
      if (integrationResult.hasOwnProperty("data") && Array.isArray(integrationResult.data)) {
        integrationResult.data.forEach((widget) => {
          if (widget.status === "configured_with_errors") {
            const integrator = widget.integrator || null;

            if (integrator !== null) {
              parseProblemsData(dctName, integrationName, dctId, widgetId);

              MA_LK_INFO.calltrackingIntegrationProblems[dctName][integrationName]["problems"].push([integrator, "Обновите токен"]);
            } else {
              addProblemToList(`Не удалось получить информацию о коллтрекинге!`);
              reject();
            }
          }
        });
      } else {
        addProblemToList(`Не удалось получить информацию о коллтрекинге!`, integrationResult);
        reject();
      }
    } catch (err) {
      addProblemToList(`Не удалось получить информацию о коллтрекинге!`, err);
      reject();
    }
  }

  function parseProblemsData(dctName, integrationName, dctId, widgetId) {
    if (!MA_LK_INFO.calltrackingIntegrationProblems.hasOwnProperty(dctName)) {
      MA_LK_INFO.calltrackingIntegrationProblems[dctName] = {};
    }

    if (!MA_LK_INFO.calltrackingIntegrationProblems[dctName].hasOwnProperty(integrationName)) {
      MA_LK_INFO.calltrackingIntegrationProblems[dctName][integrationName] = {};
      MA_LK_INFO.calltrackingIntegrationProblems[dctName][integrationName]["problems"] = [];
      MA_LK_INFO.calltrackingIntegrationProblems[dctName][integrationName][
        "href"
      ] = `https://lk.mango-office.ru/${MA_LK_INFO.PRODUCT_CODE}/${MA_LK_INFO.PRODUCT_ID}/${dctId}/widgets/${widgetId}/integrations`;
    }
  }

  function parseCalltrackingProblemsData() {
    const problemsLength = Object.keys(MA_LK_INFO.calltrackingIntegrationProblems).length;

    if (problemsLength) {
      MA_LK_INFO.passiveChecks.add(`Ошибки в коллтрекинге`);
      let result = `<span>Проблемы с работой коллтрекинга</span>`;

      let indexCalltracking = 1;

      for (let calltracking in MA_LK_INFO.calltrackingIntegrationProblems) {
        result += `<br/><span>${calltracking}</span>`;

        let indexIntegration = 1;
        for (let integration in MA_LK_INFO.calltrackingIntegrationProblems[calltracking]) {
          const id = `ma-calltrackingProblem-${indexCalltracking}-${indexIntegration}`;
          result += `<br/><button class="button-of-mango-assistant" onclick="toggleDivRule('${id}')">${integration}</button>
                          <div id="${id}" class="mangoAssistantBlock" style="display:none">`;

          for (let widget of MA_LK_INFO.calltrackingIntegrationProblems[calltracking][integration]["problems"]) {
            result += `<a href="${MA_LK_INFO.calltrackingIntegrationProblems[calltracking][integration]["href"]}/${
              widget[0]
            }" target="_blank"><button class="button-of-mango-assistant"><span style="font-size:8pt">${getTranslateName(widget[0])} (перейти)</span></button></a>`;
            result += `${widget[1]}`;
          }
          result += `</div>`;

          indexIntegration++;
        }

        indexCalltracking++;
      }

      addingInfoBlockToMangoAssistData(result);
    }
  }

  function getTranslateName(inputName) {
    inputName = String(inputName);

    const translate = MA_LK_INFO.TRANSLATE_WIDGETS.find((element) => {
      return element[0] === inputName;
    });

    if (translate) {
      return translate[1];
    }

    return inputName;
  }
}

// Получение информации о времени ожидания ответа, если звонок адресован сотруднику
function gettingInfoAboutStandartWaitingAnswerValue(resolve) {
  $.ajax({
    type: "GET",
    url: MA_LK_INFO.GET_WAITING_ANSWERS_SETTINGS_URL,
    timeout: 7000,
  })
    .done((data) => {
      const $html = $(data);
      const awaitAnswerInput = $html.find(`div.field-row.field-waiting-time div.field input[name="fidefault_wait_answer_sec"]`);
      if (awaitAnswerInput.length > 0) {
        MA_LK_INFO.waitingAnswersSettings.fiDefaultWaitAnswerSec = awaitAnswerInput[0].value;
      } else {
        addProblemToList(`Не удалось получить стандартное значение ожидания ответа!`);
      }
    })
    .fail((err) => {
      addProblemToList(`Не удалось получить стандартное значение ожидания ответа!`, err);
    })
    .always(() => {
      resolve();
    });
}

// Получение общей информации об аккаунте------------------------------------------------------------------------------------------------------------------------------------
function gettingAccountInformation(resolve) {
  let result = false;

  try {
    const authToken = getCookie();

    MA_LK_INFO.accLoginParams = {
      app: "ics",
      auth_token: authToken,
      locale: "ru",
      prod_code: MA_LK_INFO.PRODUCT_CODE,
      prod_id: MA_LK_INFO.PRODUCT_ID,
    };

    $.ajax({
      type: "POST",
      url: MA_LK_INFO.GET_ACCOUNT_INFO_URL,
      data: MA_LK_INFO.accLoginParams,
      timeout: 7000,
    })
      .done((data) => {
        try {
          MA_LK_INFO.accountData = data.data;
          if (MA_LK_INFO.accountData !== undefined && MA_LK_INFO.accountData.control !== undefined) {
            result = true;
          }
        } catch (err) {
          console.error(err);
          result = false;
        }
      })
      .fail((error) => {
        console.error(error);
        result = false;
      })
      .always(() => {
        resolve(result);
      });
  } catch (err) {
    console.error(err);
    resolve(result);
  }

  function getCookie() {
    const cookiesArray = document.cookie.split(";");

    for (let cook of cookiesArray) {
      const keyAndValue = cook.split("=");
      if (/^\s*auth_token\s*$/i.test(keyAndValue[0])) {
        return keyAndValue[1];
      }
    }

    return null;
  }
}

// Проверка баланса----------------------------------------------------------------------------------------------------------------------------------------------------
function checkingBalance(resolve) {
  try {
    const currentBalance = MA_LK_INFO.accountData.balance;
    if (currentBalance < 10 && currentBalance > 0) {
      const balanceString = `<p>Внимание!</p><p style="font-size:12pt"> Остаток денежных средств: <br/><b>${currentBalance}</b> руб.</p>`;
      addingInfoBlockToMangoAssistData(balanceString);
      MA_LK_INFO.passiveChecks.add(`Баланс: ${currentBalance} руб.`);
    } else if (currentBalance < 0) {
      const balanceString = `<p style = "color: red">Внимание!<p/><p style="font-size:12pt"> Отрицательный остаток денежных средств: <br/><b>${currentBalance} </b> руб.</p>`;
      addingInfoBlockToMangoAssistData(balanceString);
      MA_LK_INFO.passiveChecks.add("Отрицательный баланс");
    }
  } catch (err) {
    addProblemToList(`Не удалось получить информацию о балансе!`, err);
  }

  resolve();
}

// Проверка наличия созданных сотрудников------------------------------------------------------------------------------------------------------------------------------
function checkingCountMembers(resolve) {
  $.ajax({
    type: "GET",
    url: MA_LK_INFO.GET_INFO_ABOUT_MEMBERS_URL,
    timeout: 7000,
  })
    .done((data) => {
      try {
        // Заполнение свойств
        fillingLkInfoProperties(data);

        // Проверка, есть ли хотя бы один активный сотрудник
        let isMembersCreated = false;
        for (key in MA_LK_INFO.activeMembers) {
          if (MA_LK_INFO.activeMembers.hasOwnProperty(key)) {
            isMembersCreated = true;
            break;
          }
        }

        if (!isMembersCreated) {
          MA_LK_INFO.passiveChecks.add("Не создано ни одного сотрудника");
          const activeMembersString = `<p style="color:red"><b>Не создано ни одного сотрудника!<b></p>`;
          addingInfoBlockToMangoAssistData(activeMembersString);
        }

        MA_LK_INFO.workParams.isFillingAvailableItemsSuccess = true;
      } catch (err) {
        addProblemToList(`Не удалось проанализировать наличие созданных сотрудников!`, err);
        MA_LK_INFO.workParams.isFillingAvailableItemsSuccess = false;
      }
    })
    .fail((err) => {
      addProblemToList(`Не удалось проанализировать наличие созданных сотрудников!`, err);
      MA_LK_INFO.workParams.isFillingAvailableItemsSuccess = false;
    })
    .always(() => {
      resolve();
    });
}


// Заполнение свойств "Сотрудники", "Группы" и "Номера" объекта ЛК (MA_LK_INFO)
function fillingLkInfoProperties(data) {
  // Сотрудники
  /* const mData = $(data).find(`script#b-members-data`);
  const membersObject = JSON.parse(mData[0].text); */
  const membersObject = data;
  MA_LK_INFO.activeMembers = membersObject;

  // Группы (оригинал) - после выхода ЛК9 перестал работать данный функционал, нужно исследовать
  /* const gData = $(data).find(`script#point-members-groups-data`);
  MA_LK_INFO.availableGroups = JSON.parse(gData[0].text);
  console.log("grObject: ", membersObject); */

 
}

// Заполнение свойств "Исходящие номера" (outgoingNumbers), "Входящие номера" (incomingNumbers) объекта ЛК (MA_LK_INFO)
function fillingNumbersProperties(resolve) {
  $.ajax({
    type: "GET",
    url: MA_LK_INFO.MA_CALL_FWD_OVERVIEW_URL,
    timeout: 7000,
  })
    .done((data) => {
      try {
        $html = $(data);
        const listOfIncoming = $html.find("form#id-select-profile option");
        const listOfOutgoing = $html.find(`div.line select#ivr-callback-ani optgroup option`);
        listOfIncoming.map(function (index, element) {
          MA_LK_INFO.incomingNumbers.set(element["value"], element["label"]);
        });
        listOfOutgoing.map(function (index, element) {
          MA_LK_INFO.outgoingNumbers.set(element["value"], element["dataset"]["number"]);
        });
      } catch (err) {
        addProblemToList(`Не удалось получить информацию о входящих/исходящих номерах!`, err);
        MA_LK_INFO.workParams.isFillingAvailableItemsSuccess = false;
      }
    })
    .fail((err) => {
      addProblemToList(`Не удалось получить информацию о входящих/исходящих номерах!`, err);
      MA_LK_INFO.workParams.isFillingAvailableItemsSuccess = false;
    })
    .always(() => {
      resolve();
    });
}

// Проверка блокировки/закрытия? продукта/аккаунта?--------------------------------------------------------------------------------------------------------------------
function checkingBlockedReason(resolve) {
  $.ajax({
    type: "GET",
    url: MA_LK_INFO.API_IDENTITY_URL,
    timeout: 7000,
  })
    .done((data) => {
      let identityData = $(data);

      try {
        const blockReason = identityData["0"].product.blocked_reason;

        if (blockReason.length > 0) {
          MA_LK_INFO.passiveChecks.add("Продукт заблокирован");
          const blockProductString = `<p style="color: red">Блокировка: <b>${blockReason}</b></p>`;
          addingInfoBlockToMangoAssistData(blockProductString);
        }
      } catch (err) {
        addProblemToList(`Не удалось проанализировать информацию о блокировке продукта!`, err);
      }
    })
    .fail((err) => {
      addProblemToList(`Не удалось проанализировать информацию о блокировке продукта!`, err);
    })
    .always(() => {
      resolve();
    });
}

// Проверка активных схем----------------------------------------------------------------------------------------------------------------------------------------------
// Добавление проблемы в лист с проблемами
function addNewProblemToSet(problem, set) {
  set.add(problem);
}

// Шаблон действий при работе блока catch в проверках схем
function checkSchemaCatchActions(errorDescription) {
  console.error(errorDescription);
  if (MA_LK_INFO.workParams.isContinueCheckBadSchemas) {
    MA_LK_INFO.workParams.isContinueCheckBadSchemas = false;
    displayResultField(`Не удалось проанализировать схемы распределения звонков!`, `badFwdCallSchemas`, `Проверить схемы распределения`, `checkActivateSchemaButton`, true);
  }
}

// Проверки на наличие пунктов "Клиент ничего не нажал" "Ошибочный ввод", если есть IVR. Также проверка на пустой блок
function checkIVRAndEmptyBlocksFaults(schema, phoneParameter, thisNumberProblemsSet, callFwrdSettings) {
  try {
    const checkDiv = document.createElement("div");
    checkDiv.innerHTML = schema;
    let isNoTouchBlock = false;
    let isNoErrorBlock = false;
    let isEmptyBlock = false;
    let isNotRightDTMF = false;

    const ulSelector = checkDiv.querySelectorAll(
      `div.b-fwd-schema-block div.b-fwd-schema li.context.procedure > div.wrapper li.procedures ul.groups div.wrapper > div.opaque > ul.actions`
    );

    if (ulSelector.length > 0) {
      for (let ulItem of ulSelector) {
        const liBlockProcedure = $(ulItem).parents(`li.context.procedure.inactive`);
        if (liBlockProcedure.length === 0) {
          const groupItem = $(ulItem).find(`ul.groups`);

          if (groupItem !== null && groupItem.children.length !== 0) {
            for (let index = 0; index < groupItem.length; index++) {
              if (groupItem[index].children.length !== 0) {
                const liConditionGroup = `li.condition-group`;
                const touchItems = $(groupItem).children(`${liConditionGroup}.number, ${liConditionGroup}.post-dial`);

                if (touchItems.length > 0) {
                  for (let item of touchItems) {
                    const liInActive = $(item).children(`ul.procedures`).children(`li.context.procedure.inactive`);
                    if (liInActive.length === 0) {
                      isNoTouchBlock = checkNoTouchBlockExist(groupItem, isNoTouchBlock, thisNumberProblemsSet);
                      isNoErrorBlock = checkNoErrorBlockExist(groupItem, isNoErrorBlock, thisNumberProblemsSet);
                      isNotRightDTMF = checkSoundAndDTMF(groupItem, isNotRightDTMF, callFwrdSettings, thisNumberProblemsSet);
                    }
                  }
                }
              } else {
                isEmptyBlock = checkEmptyBlockExist(ulItem, isEmptyBlock, thisNumberProblemsSet);
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
    checkSchemaCatchActions(`Не удалось получить информацию по кнопке "Клиент ничего не нажал" для номера ${phoneParameter}, ошибка: `, err);
  }
}

function checkSoundAndDTMF(groupItem, isNotRightDTMF, callFwrdSettings, thisNumberProblemsSet) {
  if (!isNotRightDTMF && callFwrdSettings.get("isShortAllow") === true) {
    const liProcedures = $(groupItem).parent();
    const greeting = $(liProcedures).prev("li.action.greeting");

    if (greeting.length === 0) {
      addNewProblemToSet(`Нет звукового приветствия перед <br/>блоком DTMF`, thisNumberProblemsSet);
      return true;
    }
  }
  return isNotRightDTMF;
}

// Проверка наличия пункта "Отсутствие ввода". Вспомогательная функция
function checkNoTouchBlockExist(groupItem, isNoTouchBlock, thisNumberProblemsSet) {
  if (!isNoTouchBlock) {
    const noTouchItem = $(groupItem).find(`li.condition-group.no-input`);

    if (noTouchItem.length === 0) {
      addNewProblemToSet(`Нет пункта "Отсутствие ввода"`, thisNumberProblemsSet);
      return true;
    }
  }
  return isNoTouchBlock;
}

// Проверка наличия пункта "Любой другой ввод". Вспомогательная функция
function checkNoErrorBlockExist(groupItem, isNoErrorBlock, thisNumberProblemsSet) {
  if (!isNoErrorBlock) {
    const touchAnotherItem = $(groupItem).find(`li.condition-group.other-input`);

    if (touchAnotherItem.length === 0) {
      addNewProblemToSet(`Нет пункта "Любой другой ввод"`, thisNumberProblemsSet);
      return true;
    }
  }
  return isNoErrorBlock;
}

// Проверка наличия пустого блока ввода. Вспомогательная функция
function checkEmptyBlockExist(ulItem, isEmptyBlock, thisNumberProblemsSet) {
  if (!isEmptyBlock) {
    const actionItem = ulItem.querySelector(`li.action:not(.hang-up)`);

    if (actionItem === null) {
      addNewProblemToSet(`Пустой блок ввода`, thisNumberProblemsSet);
      return true;
    }
  }
  return isEmptyBlock;
}

// Проверка на длину донабора номера
function checkExtensionDialingLength(data, thisNumberProblemsSet, phoneParameter) {
  const inputSelector = `div.wrapper div.opaque ul.procedure-call.condition-post_dial fieldset input`;
  const extensionDials = $(data["schemaHtml"]).find(`${inputSelector}#condition-min_length, ${inputSelector}#condition-max_length`);
  for (let index = 0; index < extensionDials.length; index++) {
    if (extensionDials[index].value < 2 || extensionDials[index].value > 5) {
      const firstValue = extensionDials[index].value;
      let secondValue = undefined;
      for (let t = 0; t < extensionDials.length; t++) {
        if (extensionDials[index].dataset.actionId == extensionDials[t].dataset.actionId && extensionDials[index].id !== extensionDials[t].id) {
          secondValue = extensionDials[t].value;
          break;
        }
      }
      if (secondValue !== undefined) {
        addNewProblemToSet(
          `Некорректно указана длина донабора (правильно от 2 до 5): от ${Math.min(firstValue, secondValue)} до ${Math.max(firstValue, secondValue)}.`,
          thisNumberProblemsSet
        );
      } else {
        checkSchemaCatchActions(`Не удалось получить информацию по длине донабора по схеме номера ${phoneParameter}`);
      }
    }
  }
}

// Проверка внешних номеров
function checkLoopCalls(phoneParameter, numbersCalls, thisNumberProblemsSet) {
  for (let index = 0; index < numbersCalls.length; index++) {
    if (numbersCalls[index].id === "target-type" && numbersCalls[index].value === "external_number") {
      const externalNumber = getElementNumbersCalls(numbersCalls, index, "target-number");

      if (externalNumber !== undefined) {
        isRightFormatExternal(externalNumber, thisNumberProblemsSet);
        isLoopCall(externalNumber, phoneParameter, thisNumberProblemsSet);
      } else {
        checkSchemaCatchActions(`Не удалось получить информацию по закольцованным звонкам ${phoneParameter}`);
      }
    }
  }
}

// Проверка на некорректный формат внешнего номера
function isRightFormatExternal(externalNumber, thisNumberProblemsSet) {
  if (!/^[78]\d{10}$/.test(externalNumber)) {
    if (!/\w+@[\w\.]+\.[a-z]{1,3}$/i.test(externalNumber)) {
      addNewProblemToSet(`Некорректно указан формат внешнего номера "${externalNumber}", правильный формат: "79991234567", либо формат вида login@domain`, thisNumberProblemsSet);
    }
  }
}

// Проверка внешнего номера на закольцованность
function isLoopCall(externalNumber, phoneParameter, thisNumberProblemsSet) {
  externalNumber = externalNumber.replace(/\D/g, "");
  const phoneParamOnlyNumbers = phoneParameter.replace(/\D/g, "");
  if (externalNumber.startsWith("8")) {
    return "7" + externalNumber.slice(1);
  }
  if (externalNumber == phoneParamOnlyNumbers) {
    addNewProblemToSet("Закольцованный звонок", thisNumberProblemsSet);
  }
}

function getElementNumbersCalls(numbersCalls, index, selector) {
  let element = undefined;

  for (let t = 0; t < numbersCalls.length; t++) {
    if (numbersCalls[t].dataset.actionId == numbersCalls[index].dataset.actionId && numbersCalls[t].id === selector) {
      if (selector === "target-id" || selector === "target-number") {
        element = numbersCalls[t].value;
      } else {
        element = numbersCalls[t];
      }

      break;
    }
  }
  return element;
}

// Проверка поля "не указано" в переадресации
function checkEmptyFields(numbersCalls, thisNumberProblemsSet) {
  for (let index = 0; index < numbersCalls.length; index++) {
    if (numbersCalls[index].id === "target" && numbersCalls[index].value.length === 0) {
      addNewProblemToSet(`Переадресация на "не указано"`, thisNumberProblemsSet);
    }
  }
}

// Проверка групп
function checkGroups(phoneParameter, numbersCalls, thisNumberProblemsSet, membersDefaultNumbers) {
  for (let index = 0; index < numbersCalls.length; index++) {
    if (numbersCalls[index].id === "target-type" && numbersCalls[index].value === "acd_group") {
      const groupId = getElementNumbersCalls(numbersCalls, index, "target-id");
      if (groupId !== undefined) {
        checkCellPhone(phoneParameter, thisNumberProblemsSet, groupId, numbersCalls[index]);
        checkEmptyGroups(phoneParameter, thisNumberProblemsSet, groupId);
        checkHoldOfGroup(phoneParameter, thisNumberProblemsSet, groupId, numbersCalls[index]);
        checkCellBeforeGroup(phoneParameter, thisNumberProblemsSet, numbersCalls, index, groupId, membersDefaultNumbers);
      } else {
        checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
      }
    }
  }
}

// Перед переадресацией на группу есть переадресация на сотовый
function checkCellBeforeGroup(phoneParameter, thisNumberProblemsSet, numbersCalls, index, groupId, membersDefaultNumbers) {
  try {
    const thisElement = numbersCalls[index];
    groupId = Number(groupId);
    const group = MA_LK_INFO.availableGroups.find(checkAvailGroup) || null;

    if (group !== null) {
      const BEGIN_RESULT_STRING = `Перед группой <br/><b style="color:red">${group.name}</b> <br/>стоит переадресация`;
      const END_RESULT_STRING = `<br/><span style="font-size:8pt">Необходимо поставить переадресацию после группы, так как если телефон недоступен ВАТС может посчитать этот звонок успешно принятым, следовательно далее звонок не пойдет.</span>`;
      const parentElement = $(thisElement).closest(`li.action.forward.context`);

      if (parentElement.length > 0) {
        const prevElement = $(parentElement).prev();

        if (prevElement.length && $(prevElement[0]).hasClass("action") && $(prevElement[0]).hasClass("forward") && $(prevElement[0]).hasClass("context")) {
          const targetType = $(prevElement[0]).find(`input#target-type`);

          if (targetType.length) {
            const type = targetType[0].value;

            if (type === "external_number") {
              parseExternalNumber(prevElement, BEGIN_RESULT_STRING, END_RESULT_STRING);
            } else if (type === "member") {
              const memberActionId = targetType[0].dataset.actionId || null;

              if (memberActionId) {
                const [userId, mbrStrategy] = getUserIdAndStrategy(numbersCalls, memberActionId);

                if (userId !== null && mbrStrategy !== null) {
                  const numUserId = Number(userId);
                  const numMbrStrategy = Number(mbrStrategy);

                  const user = getUser(numUserId);

                  parseUserInfo(user, numUserId, numMbrStrategy, BEGIN_RESULT_STRING, END_RESULT_STRING);
                } else {
                  checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
                }
              } else {
                checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
              }
            } else if (type === "member_number") {
              parseMemberNumber(targetType, BEGIN_RESULT_STRING, END_RESULT_STRING);
            }
          } else {
            checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
          }
        }
      } else {
        checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
      }
    } else {
      checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
    }
  } catch (err) {
    console.error(err);
    checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
  }

  // Вспомогательные функции для checkCellBeforeGroup
  function getUserIdAndStrategy(numbersCalls, actionId, isSpecificNumber = false) {
    if (isSpecificNumber) {
      return getParams("target-name", "target-number", "target-protocol");
    } else {
      return getParams("target-id", "target-mbr_target_strategy");
    }

    // Вспомогательная функция для getUserIdAndStrategy
    function getParams(firstSelector, secondSelector, thirdSelector = null) {
      let firstParam = null;
      let secondParam = null;
      let thirdParam = null;

      for (let t = 0; t < numbersCalls.length; t++) {
        if (numbersCalls[t].dataset.actionId == actionId) {
          if (numbersCalls[t].id === firstSelector) {
            firstParam = numbersCalls[t].value;
          } else if (numbersCalls[t].id === secondSelector) {
            secondParam = numbersCalls[t].value;
          } else if (thirdSelector !== null && numbersCalls[t].id === thirdSelector) {
            thirdParam = numbersCalls[t].value;
          }
        }

        if (firstParam !== null && secondParam !== null) {
          if (thirdSelector === null) {
            break;
          } else if (thirdParam !== null) {
            break;
          }
        }
      }

      if (thirdSelector === null) {
        return [firstParam, secondParam];
      } else {
        return [firstParam, secondParam, thirdParam];
      }
    }
  }

  function checkAvailGroup(element) {
    if (element.id === groupId) {
      return true;
    }
  }

  function parseExternalNumber(prevElement, BEGIN_RESULT_STRING, END_RESULT_STRING) {
    const targetProtocol = $(prevElement[0]).find(`input#target-protocol`);

    if (targetProtocol.length) {
      const protocol = targetProtocol[0].value;

      if (protocol === "tel") {
        const targetNumber = $(prevElement[0]).find(`input#target-number`);
        if (targetNumber.length) {
          const number = targetNumber[0].value;
          const resultString = `<span style="font-size:8pt">${BEGIN_RESULT_STRING} на телефонный номер <br/>"${number}"${END_RESULT_STRING}</span>`;
          addNewProblemToSet(resultString, thisNumberProblemsSet);
        } else {
          checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
        }
      }
    } else {
      checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
    }
  }

  function getUser(numUserId) {
    const result =
      MA_LK_INFO.activeMembers.find((element) => {
        if (element.id === numUserId) {
          return true;
        }
      }) || null;

    return result;
  }

  function parseOnlyMainNumber(user, BEGIN_RESULT_STRING, END_RESULT_STRING, name) {
    for (let elem of user.numbers) {
      if (elem.is_active === 1) {
        if (elem.protocol === "tel") {
          const toNumber = elem.number;
          const resultString = `<span style="font-size:8pt">${BEGIN_RESULT_STRING} на сотрудника <br/>"${name}" с телефонным номером <br/>"${toNumber}"${END_RESULT_STRING}</span>`;
          addNewProblemToSet(resultString, thisNumberProblemsSet);
        }

        break;
      }
    }
  }

  function parseAllNumbersTogether(user, BEGIN_RESULT_STRING, END_RESULT_STRING, name) {
    for (let elem of user.numbers) {
      if (elem.is_active === 1) {
        if (elem.protocol === "tel") {
          const toNumber = elem.number;
          const resultString = `<span style="font-size:8pt">${BEGIN_RESULT_STRING} на сотрудника <br/>"${name}" с телефонным номером <br/>"${toNumber}"${END_RESULT_STRING}</span>`;
          addNewProblemToSet(resultString, thisNumberProblemsSet);
          break;
        }
      }
    }
  }

  function parseMemberNumber(targetType, BEGIN_RESULT_STRING, END_RESULT_STRING) {
    const memberActionId = targetType[0].dataset.actionId || null;

    if (memberActionId !== null) {
      const [userName, specificNumber, protocol] = getUserIdAndStrategy(numbersCalls, memberActionId, true);

      if (specificNumber !== null && userName !== null && protocol !== null) {
        if (protocol === "tel") {
          const resultString = `<span style="font-size:8pt">${BEGIN_RESULT_STRING} на сотрудника <br/>"${userName}" с телефонным номером <br/>"${specificNumber}"${END_RESULT_STRING}</span>`;
          addNewProblemToSet(resultString, thisNumberProblemsSet);
        }
      } else {
        checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
      }
    } else {
      checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
    }
  }

  function parseDefaultNumber(BEGIN_RESULT_STRING, END_RESULT_STRING, name, numUserId) {
    for (let member of membersDefaultNumbers) {
      const memberId = Number(member.id.replace(/\D/g, ""));
      if (memberId === numUserId) {
        let defaultNumberObject = $(member).find(`div.default-number`);
        if (defaultNumberObject.length) {
          defaultNumber = defaultNumberObject[0].innerText;
          const isTelType = $(defaultNumberObject[0]).parent().hasClass("tel");

          if (isTelType) {
            const resultString = `<span style="font-size:8pt">${BEGIN_RESULT_STRING} на сотрудника <br/>"${name}" с телефонным номером <br/>"${defaultNumber}"${END_RESULT_STRING}</span>`;
            addNewProblemToSet(resultString, thisNumberProblemsSet);
          }
        } else {
          checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
        }

        break;
      }
    }
  }

  function parseUserInfo(user, numUserId, numMbrStrategy, BEGIN_RESULT_STRING, END_RESULT_STRING) {
    if (user !== null && user.hasOwnProperty("numbers") && Array.isArray(user.numbers)) {
      // Как настроено в карточке сотрудника
      if (numMbrStrategy === 1) {
        const dialAlg = user.dial_alg || null;

        if (dialAlg !== null) {
          const name = user.name;

          // Алгоритм "Только на основной номер"
          if (dialAlg === 1) {
            // Для алгоритмов "Только на основной номер" и "На все номера по очереди" ищется только первый активный телефонный номер
            parseOnlyMainNumber(user, BEGIN_RESULT_STRING, END_RESULT_STRING, name);
          }
          // Алгоритм "На все номера одновременно"
          else if (dialAlg === 2) {
            parseAllNumbersTogether(user, BEGIN_RESULT_STRING, END_RESULT_STRING, name);
          }
          // Алгоритм "На все номера по очереди"
          else if (dialAlg === 3) {
            // Для алгоритмов "Только на основной номер" и "На все номера по очереди" ищется только первый активный телефонный номер
            parseOnlyMainNumber(user, BEGIN_RESULT_STRING, END_RESULT_STRING, name);
          }
        } else {
          checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
        }
      } else {
        parseDefaultNumber(BEGIN_RESULT_STRING, END_RESULT_STRING, name, numUserId);
      }
    } else {
      checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
    }
  }
}

// В группе стоит последовательное распределение и у сотрудника указан сотовый
function checkCellPhone(phoneParameter, thisNumberProblemsSet, groupId, thisElement) {
  try {
    groupId = Number(groupId);

    if (!isNaN(groupId)) {
      const availGroup = MA_LK_INFO.availableGroups.find(checkAvailGroup) || null;

      if (availGroup !== null) {
        const [isFindCellPhone, resultString] = getCellNumber(groupId, availGroup);

        if (isFindCellPhone) {
          addNewProblemToSet(resultString, thisNumberProblemsSet);
        }
      }
    } else {
      checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
    }
  } catch (err) {
    console.error(err);
    checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
  }

  // Вспомогательные функции для checkCellPhone
  function checkAvailGroup(element) {
    if (element.id === groupId && element.dial_algorithm === "serial_by_priority") {
      return true;
    }
  }

  function getCellNumber(groupId, availGroup) {
    let isFindCellPhone = false;
    let resultString = `<span style="font-size:8pt">В группе <br/><b style="color:red">"${availGroup.name}"</b></br>стоит последовательное распределение звонков и у сотрудников указан телефонный номер:</span>`;

    try {
      const parentElement = $(thisElement).closest(`li.action.forward.context`);

      if (parentElement.length > 0) {
        const isNextElementExisting = checkExistNextElement(parentElement);

        [isFindCellPhone, resultString] = getEmployeesWithNumbers(resultString, groupId, isNextElementExisting);

        if (isFindCellPhone) {
          resultString += `<br/><span style="font-size:8pt">Необходимо сотрудника с сотовым телефоном поставить в конец списка группы. Если телефон недоступен, то ВАТС может посчитать этот звонок успешно принятым, следовательно далее звонок не пойдет.</span>`;
        }
      } else {
        checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
      }
    } catch (err) {
      isFindCellPhone = false;
      checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
    }

    return [isFindCellPhone, resultString];
  }

  function getEmployeesWithNumbers(resultString, groupId, isNextElementExisting) {
    let isFindCellPhone = false;

    MA_LK_INFO.activeMembers.forEach((element) => {
      if (element.hasOwnProperty("operator_groups") && element.hasOwnProperty("numbers")) {
        for (let operatorGroup in element.operator_groups) {
          if (Number(operatorGroup) === groupId) {
            element.numbers.forEach((numberElement, index) => {
              if (numberElement.is_active === 1 && numberElement.protocol === "tel" && (isNextElementExisting || index < element.numbers.length - 1)) {
                resultString += `<br/>- ${element.name}`;
                isFindCellPhone = true;
              }
            });
            break;
          }
        }
      }
    });

    return [isFindCellPhone, resultString];
  }

  function checkExistNextElement(parentElement) {
    const nextElement = $(parentElement).next();

    if (nextElement.length > 0 && !nextElement[0].className.includes("action hang-up")) {
      if (!nextElement[0].className.includes("procedures")) {
        return true;
      } else {
        const groups = $(nextElement[0]).children(`ul.groups`);

        if (groups.length) {
          const ivrElements = $(groups[0]).children();

          if (ivrElements.length !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }
}

// Проверка удержания в группе
function checkHoldOfGroup(phoneParameter, thisNumberProblemsSet, groupId, thisElement) {
  const parentElement = $(thisElement).closest(`li.action.forward.context`);

  if (parentElement.length > 0) {
    const nextElement = $(parentElement).next();
    if (nextElement.length > 0 && nextElement[0].className.includes("procedures")) {
      for (let t = 0; t < MA_LK_INFO.availableGroups.length; t++) {
        if (Number(groupId) === MA_LK_INFO.availableGroups[t].id && MA_LK_INFO.availableGroups[t].custom_settings !== null && MA_LK_INFO.availableGroups[t].hold_enabled === 1) {
          let resultString = "";
          if (MA_LK_INFO.availableGroups[t].hold_max_time > 300) {
            resultString += `время удержания "${MA_LK_INFO.availableGroups[t].hold_max_tim}" больше 300 сек.`;
          } else if (MA_LK_INFO.availableGroups[t].hold_max_time === 0) {
            resultString += `время удержания "Неограниченно" больше 300 сек.`;
          }
          if (MA_LK_INFO.availableGroups[t].hold_max_len === 0) {
            if (resultString.length) {
              resultString += `и `;
            }
            resultString += `длина очереди "Неограниченно"`;
          }
          if (resultString.length) {
            const groupName = returnNameOfItemSchema(groupId);
            if (groupName !== undefined) {
              resultString = `У группы "${groupName}" ` + resultString;
              addNewProblemToSet(resultString, thisNumberProblemsSet);
            } else {
              checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
            }
          }
        }
      }
    }
  }
}

// Проверка групп на наличие в них сотрудников
function checkEmptyGroups(phoneParameter, thisNumberProblemsSet, groupId) {
  let isGroupFilled = false;
  for (let t = 0; t < MA_LK_INFO.activeMembers.length; t++) {
    if (!isGroupFilled) {
      const operatorGroups = MA_LK_INFO.activeMembers[t].operator_groups;
      for (let key in operatorGroups) {
        if (key == groupId) {
          isGroupFilled = true;
          break;
        }
      }
    }
  }
  if (!isGroupFilled) {
    const groupName = returnNameOfItemSchema(groupId);
    if (groupName !== undefined) {
      addNewProblemToSet(`Пустая группа "${groupName}"`, thisNumberProblemsSet);
    } else {
      checkSchemaCatchActions(`Не удалось получить информацию по группам ${phoneParameter}`);
    }
  }
}

function returnNameOfItemSchema(id) {
  let name = undefined;
  for (let t = 0; t < MA_LK_INFO.availableGroups.length; t++) {
    if (id == MA_LK_INFO.availableGroups[t].id) {
      name = MA_LK_INFO.availableGroups[t].name;
    }
  }
  return name;
}

// Проверка времени ожидания при переадресации на внешний номер
function checkWaitTime(phoneParameter, numbersCalls, thisNumberProblemsSet) {
  for (let index = 0; index < numbersCalls.length; index++) {
    if (numbersCalls[index].id === "target-wait_time") {
      if (numbersCalls[index].value > 0 && numbersCalls[index].value < 16) {
        displayErrorWaitTime(index, numbersCalls, thisNumberProblemsSet, phoneParameter, numbersCalls[index].value);
      } else if (Number(numbersCalls[index].value) == 0) {
        if (MA_LK_INFO.waitingAnswersSettings.hasOwnProperty("fiDefaultWaitAnswerSec")) {
          if (MA_LK_INFO.waitingAnswersSettings.fiDefaultWaitAnswerSec < 16) {
            displayErrorWaitTime(index, numbersCalls, thisNumberProblemsSet, phoneParameter, MA_LK_INFO.waitingAnswersSettings.fiDefaultWaitAnswerSec);
          }
        } else {
          checkSchemaCatchActions(`Не удалось получить информацию о времени ожидания при переадресации на внешний номер ${phoneParameter}`);
        }
      }
    }
  }
}

// Вывод информации о коротком времени ожидания при переадремации на внешний номер
function displayErrorWaitTime(index, numbersCalls, thisNumberProblemsSet, phoneParameter, waitTime) {
  const numberTitle = getElementNumbersCalls(numbersCalls, index, "target-number");
  if (numberTitle !== undefined) {
    addNewProblemToSet(`${numberTitle} - Короткое время ожидания: ${waitTime} с.`, thisNumberProblemsSet);
  } else {
    checkSchemaCatchActions(`Не удалось проанализировать информацию времени ожидания ${phoneParameter}`);
  }
}

// Нахождение необходимых для проверки полей и запуск проверок
function checkNumberCalls(data, phoneParameter, thisNumberProblemsSet, callFwrdSettings) {
  const inputSelector = `div.wrapper div.opaque ul.b-inline-list.params li.editable fieldset input`;
  const numbersCalls = $(data["schemaHtml"]).find(
    `${inputSelector}#target-type, 
      ${inputSelector}#target-number, 
      ${inputSelector}#target-wait_time, 
      ${inputSelector}#target-id, 
      ${inputSelector}#target,
      ${inputSelector}#target-mbr_target_strategy,
      ${inputSelector}#target-name,
      ${inputSelector}#target-protocol`
  );

  const membersDefaultNumbers = $(data["schemaHtml"]).find(`li.member td.element table.body td.details div.member`);

  checkLoopCalls(phoneParameter, numbersCalls, thisNumberProblemsSet);
  checkEmptyFields(numbersCalls, thisNumberProblemsSet);
  checkGroups(phoneParameter, numbersCalls, thisNumberProblemsSet, membersDefaultNumbers);
  checkWaitTime(phoneParameter, numbersCalls, thisNumberProblemsSet);
  checkIVRAndEmptyBlocksFaults(data["schemaHtml"], phoneParameter, thisNumberProblemsSet, callFwrdSettings);
}

function checkSchema(profileId, phoneParameter, problemsMap, countNumbersChecked, amountNumbers, callFwrdSettings) {
  const loginParams = {
    operation: "get-profile-active-schema",
    "profile-id": profileId,
  };
  $.ajax({ type: "POST", url: MA_LK_INFO.MA_CALL_FWD_OVERVIEW_URL, data: loginParams, timeout: 60000 })
    .done((data) => {
      if (MA_LK_INFO.workParams.isContinueCheckBadSchemas) {
        const thisNumberProblemsSet = new Set();

        const arrayWithActions = [
          checkExtensionDialingLength.bind(null, data, thisNumberProblemsSet, phoneParameter),
          checkNumberCalls.bind(null, data, phoneParameter, thisNumberProblemsSet, callFwrdSettings),
          function () {
            if (thisNumberProblemsSet.size > 0) {
              const phoneObject = {
                phoneParameter: phoneParameter,
                "profile-id": profileId,
              };
              problemsMap.set(phoneObject, thisNumberProblemsSet);
            }
          },
          function () {
            countNumbersChecked(true);
            if (countNumbersChecked() === amountNumbers) {
              composeResultBadSchemas(problemsMap);
            }
          },
        ];

        for (let i = 0; i < arrayWithActions.length; i++) {
          if (MA_LK_INFO.workParams.isContinueCheckBadSchemas) {
            const action = arrayWithActions[i];
            action();
          }
        }
      }
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      checkSchemaCatchActions(`Не удалось отправить post - запрос на ${MA_LK_INFO.MA_CALL_FWD_OVERVIEW_URL}! textStatus: ` + textStatus + ", errorThrown: " + errorThrown);
    });
}

// Компоновка результата в html
function composeResultBadSchemas(problemsMap) {
  let result = "";

  if (problemsMap.size === 0) {
    result = `<p><b>Все в порядке!</b></p>`;
  } else {
    let indexPM = 0;
    problemsMap.forEach(function (value, key) {
      result += `${indexPM > 0 ? `<br/>` : ""}<button class="${redPlaceholderClass}" style="width:100%" onclick="toggleDivRule('mangoAssistantBadSchemaDiv${indexPM}')">${
        key["phoneParameter"]
      }</button>`;
      result += `<div style="display:none" id="mangoAssistantBadSchemaDiv${indexPM}">
      <form action="${MA_LK_INFO.MA_CALL_FWD_OVERVIEW_URL}" target="_blank">
      <input type="hidden" name="profile" value="${key["profile-id"]}" />
      <button type="submit" class="button-of-mango-assistant" style="font-size:8pt">
      Открыть схему распределения<br/>данного номера
      </button></form>`;

      let i = 1;
      value.forEach(function (item) {
        result += `<br/><span>${i}) ${item}</span>`;
        i++;
      });
      result += `</div>`;
      indexPM++;
    });
  }

  displayResultField(result, `badFwdCallSchemas`, `Проверить схемы распределения`, `checkActivateSchemaButton`);
}

// Получение параметров "Разрешить набор внутренних номеров сотрудников и групп длиной"
function getCallFwdSettings(data) {
  const $html = $(data);
  const callFrwdSchemasParams = $html.find(`input[name="fishort_len_min"], input[name="fishort_len_max"], input[name="fiallow_short_inbound"][type="checkbox"]`);
  const isShortAllow = (() => {
    if (callFrwdSchemasParams.length > 0) {
      for (let param of callFrwdSchemasParams) {
        if (param.name === "fiallow_short_inbound") {
          return param.checked;
        }
      }
    }

    return null;
  })();

  if (isShortAllow === true) {
    const minShortValue = getValue("fishort_len_min");
    const maxShortValue = getValue("fishort_len_max");

    if (minShortValue !== null && maxShortValue !== null) {
      const parameters = new Map([
        ["isShortAllow", isShortAllow],
        ["minShortValue", minShortValue],
        ["maxShortValue", maxShortValue],
      ]);
      return parameters;
    } else {
      return null;
    }

    function getValue(name) {
      for (let param of callFrwdSchemasParams) {
        if (param.name === name) {
          return Number(param.value);
        }
      }
      return null;
    }
  } else if (isShortAllow === false) {
    const parameters = new Map([["isShortAllow", isShortAllow]]);
    return parameters;
  }
  return new Map();
}

function checkingCallFwrdSchemas() {
  displayLoaderField(`badFwdCallSchemas`, `checkFwdCallSchemasContent`, `checkActivateSchemaButton`, `Идет проверка схем распределения`);

  if (MA_LK_INFO.workParams.isFillingAvailableItemsSuccess) {
    const problemsMap = new Map();
    MA_LK_INFO.workParams.isContinueCheckBadSchemas = true;

    if (MA_LK_INFO.incomingNumbers.size > 0) {
      $.get(MA_LK_INFO.GET_CALL_FWD_SETTINGS_URL)
        .done((data) => {
          try {
            const callFwrdSettings = getCallFwdSettings(data);
            if (callFwrdSettings !== null) {
              let countNumbersChecked = makeCounter();
              for (let [key, value] of MA_LK_INFO.incomingNumbers) {
                if (MA_LK_INFO.workParams.isContinueCheckBadSchemas) {
                  checkSchema(key, value, problemsMap, countNumbersChecked, MA_LK_INFO.incomingNumbers.size, callFwrdSettings);
                }
              }
            } else {
              throw new Error();
            }
          } catch (error) {
            console.error(error);
            displayResultField(
              `Не удалось получить информацию по схемам распределения!`,
              `badFwdCallSchemas`,
              `Проверить схемы распределения звонков`,
              `checkActivateSchemaButton`,
              true
            );
          }
        })
        .fail((error) => {
          console.error(error);
          displayResultField(
            `Не удалось получить информацию по схемам распределения!`,
            `badFwdCallSchemas`,
            `Проверить схемы распределения звонков`,
            `checkActivateSchemaButton`,
            true
          );
        });
    } else {
      displayResultField(`Не найдено ни одного номера!`, `badFwdCallSchemas`, `Проверить схемы распределения`, `checkActivateSchemaButton`, true);
    }
  } else {
    displayResultField(`Не удалось получить информацию по схемам распределения!`, `badFwdCallSchemas`, `Проверить схемы распределения звонков`, `checkActivateSchemaButton`, true);
  }
}

// Отправить письмо ПМ'у-----------------------------------------------------------------------------------------------------------------------------------------------
// На данный момент эта функция не используется
/* function openMailClient() {
  if (
    MA_LK_INFO.hasOwnProperty("accountData") &&
    MA_LK_INFO.accountData.hasOwnProperty("data") &&
    MA_LK_INFO.accountData.data.hasOwnProperty("customer") &&
    MA_LK_INFO.accountData.data.customer.hasOwnProperty("email") &&
    MA_LK_INFO.accountData.data.hasOwnProperty("control")
  ) {
    $(`#${mangoAssistData} div#sendEmailBlock div#sendEmailMessageErrorBlock`).remove();
    const mailOfPersonalManager = MA_LK_INFO.accountData.data.customer.email;
    const accountName = MA_LK_INFO.accountData.data.control;
    window.open(`mailto:${mailOfPersonalManager}?subject=${accountName}`);
  } else {
    const textMessage = `<span style="font-size:8pt"><span style="color:red">Не удалось получить почту ПМ'а.</span>
                        Попробуйте перезагрузить страницу и заново попытаться отправить письмо. 
                        Если это не помогло, просьба обратиться в группу Porblem Management отдела Тех. поддержки</span>`;
    $(`#${mangoAssistData} div#sendEmailBlock`).append(`<div id="sendEmailMessageErrorBlock" class="mangoAssistantBlock">${textMessage}</div>`);
  }
} */

// Функции для создания заявки в SD (заявка назначается на Problem Management)-----------------------------------------------------------------------------------------
// Проверка заполненности поля описания и вызов функции создания заявки
function checkingFieldOfDescriptionSDRequest() {
  if ($(`#${mangoAssistData} textarea#fieldWithRequestText`).val().trim() == "") {
    $(`#${mangoAssistData} textarea#fieldWithRequestText`).addClass(`${redPlaceholderClass}`);
  } else {
    $(`#${mangoAssistData} button#createAndSendRequestSD`).attr("disabled", true);
    $(`#${mangoAssistData} button#createAndSendRequestSD`).html(`<span style = "color:red">Создание заявки</span>`);
    creatingAndSendingReguestSD();
  }
}

// Создание заявки в SD
function creatingAndSendingReguestSD() {
  function setMessageBlock(isDone, numberOfRequest = "") {
    let textMessage = "";
    if (isDone) {
      textMessage = `<span>Заявка ${numberOfRequest} создана!</span>`;
      $(`#${mangoAssistData} textarea#fieldWithRequestText`).val("");
    } else {
      textMessage = `<span style="color:red">Не удалось создать заявку!</span><p style="font-size:8pt">Попробуйте перезагрузить страницу. 
      Если после перезагрузки ситуация не меняется, просьба написать письмо об ошибке в группу Problem management отдела Тех. поддержки.</p>`;
    }

    if ($(`#${mangoAssistData} div#createSDRequestBlock div#messageBlockCreateSDRequest`).length == 0) {
      $(`#${mangoAssistData} div#createSDRequestBlock`).prepend(`<div id="messageBlockCreateSDRequest" class="mangoAssistantBlock">${textMessage}</div>`);
    } else {
      $(`#${mangoAssistData} div#createSDRequestBlock div#messageBlockCreateSDRequest`).html(textMessage);
    }

    $(`#${mangoAssistData} button#createAndSendRequestSD`).removeAttr("disabled");
    $(`#${mangoAssistData} button#createAndSendRequestSD`).html(`<span style = "color: rgb(120,100,39,0.65);">Отправить</span>`);
  }

  try {
    if (MA_LK_INFO.accountData.control !== null) {
      const requestParams = {
        description: $(`#${mangoAssistData} textarea#fieldWithRequestText`).val(),
        accountNumber: MA_LK_INFO.accountData.control,
      };

      $.post(`${MA_WORK_NODE_URL}/create-sd-request`, requestParams)
        .done((responseData) => {
          if (responseData.status == "done") {
            setMessageBlock(true, responseData.numberOfRequest);
          } else {
            setMessageBlock(false);
          }
        })
        .fail((error) => {
          console.error(error);
          setMessageBlock(false);
        });
    } else {
      setMessageBlock(false);
    }
  } catch (error) {
    console.error(error);
    setMessageBlock(false);
  }
}

// Метод для заказа обратного звонка ОТП------------------------------------------------------------------------------------------------------------------------------
function creatingCallBackOTP() {
  $(`#${mangoAssistData} button#orderCallingOrkButton`).attr("disabled", true);
  $(`#${mangoAssistData} button#orderCallingOrkButton`).html(`<span class="${redPlaceholderClass}" style="font-size:8pt">Заказ обратного <br/>звонка</span>`);
  const clientPhone = $(`#${mangoAssistData} div#orkCallBlock input#callbackOTPclientPhoneInput`);
  const clientPhoneValue = clientPhone.val().replace(/\D/g, "");
  mangoAssistantSendStatistic(`Заказ обратного звонка ${clientPhoneValue}`, true);

  if (checkClientPhoneParam()) {
    try {
      const requestParams = {
        number: clientPhoneValue,
      };

      $.post(`${MA_WORK_NODE_URL}/create-callback-otp`, requestParams)
        .done((response) => {
          if (response.hasOwnProperty("status") && response.status == "success") {
            setMessageBlock(true, undefined, clientPhone.val());
          } else {
            setMessageBlock(false);
          }
        })
        .fail(() => {
          setMessageBlock(false);
        });
    } catch (err) {
      setMessageBlock(false);
    }
  } else {
    setMessageBlock(false, true);
  }

  // Вспомогательные функции
  function checkClientPhoneParam() {
    if ((clientPhoneValue.trim()[0] != 7 && clientPhoneValue.trim()[0] != 8) || clientPhoneValue.length !== 11) {
      clientPhone.addClass(`${redPlaceholderClass}`);
      return false;
    }
    return true;
  }

  function setMessageBlock(isDone, isIncorrect = false, numberOfCall = "") {
    let textMessage = "";
    if (isDone) {
      textMessage = `<span>Звонок ${numberOfCall} заказан!</span>`;
      clientPhone.val("");
    } else if (isIncorrect) {
      textMessage = `<span style="color:red">Некорректно указан номер</span>`;
    } else {
      textMessage = `<span style="color:red">Не удалось заказать звонок!</span><p style="font-size:8pt">Попробуйте перезагрузить страницу. 
      Если после перезагрузки ситуация не меняется, просьба написать письмо об ошибке в группу Problem management отдела Тех. поддержки.</p>`;
    }

    if ($(`#${mangoAssistData} div#orkCallBlock div#messageBlockCallbackOTP`).length == 0) {
      $(`#${mangoAssistData} div#orkCallBlock`).prepend(`<div id="messageBlockCallbackOTP" class="mangoAssistantBlock">${textMessage}</div>`);
    } else {
      $(`#${mangoAssistData} div#orkCallBlock div#messageBlockCallbackOTP`).html(textMessage);
    }

    $(`#${mangoAssistData} button#orderCallingOrkButton`).removeAttr("disabled");
    $(`#${mangoAssistData} button#orderCallingOrkButton`).html(`<span style = "color: rgb(120,100,39,0.65);">Заказать</span>`);
  }
}

// Метод для проверки доступных для звонка регионов--------------------------------------------------------------------------------------------------------------------
function checkAvailableRegions() {
  displayLoaderField(`contentOfAvailableRegionsBlock`, `checkAvailableRegionsButtonBlockContent`, `checkAvailableRegionsButton`, `Идет проверка доступных для звонка регионов`);

  $.get(MA_LK_INFO.GET_AVAILABLE_REGIONS_URL)
    .done((data) => {
      $availableRegionsHtml = $(data);

      try {
        const settingsSelector = `div.settings-form form`;
        const continentBoxHtml = $availableRegionsHtml.find(`${settingsSelector} div.security-settings-outgoing div.options.continents-box`);
        let resultString = `<form action="${MA_LK_INFO.GET_AVAILABLE_REGIONS_URL}" target="_blank">
                            <button class="${mangoAssistantSmallTextClass} button-of-mango-assistant" type="submit">Настроить безопасность <br/>и ограничения</button>
                            </form>`;
        for (let i = 0; i < continentBoxHtml[0].children.length; i++) {
          // Нулевое значение пропускаю, так как под этим значением находится "Все регионы"
          if (i === 0) {
            continue;
          }
          if (continentBoxHtml[0].children[i].children[1].checked == true) {
            resultString += `${i > 1 ? "<br/>" : ""}<span>${continentBoxHtml[0].children[i].children[2].innerText}: есть доступ</span>`;
          } else {
            resultString += `${i > 1 ? "<br/>" : ""}<span>${continentBoxHtml[0].children[i].children[2].innerText}: <span style="color:red">нет доступа!</span></span>`;
          }
        }

        const otherRules = $availableRegionsHtml.find(
          `${settingsSelector} div.security-settings-tonal div.options div.options div.element input[type="checkbox"],${settingsSelector} label.b-point input[type="checkbox"]`
        );

        const idDecodingMap = new Map();
        idDecodingMap.set("fitransf_outside", "Разрешать перевод звонка на произвольный <br/>внешний номер");
        idDecodingMap.set("fisimple_transfer", "Игнорировать команды DTMF во время <br/>разговора");
        idDecodingMap.set("fiblf_on", "Разрешить перехват вызова <br/>с помощью BLF");
        idDecodingMap.set("dtmf_intercept_group", "Разрешить перехват групповых вызовов");
        idDecodingMap.set("dtmf_intercept_individual", "Разрешить перехват индивидуальных <br/>вызовов");
        idDecodingMap.set("fiinform_about_mtalker", "Уведомлять сотрудников о возможностях <br/>МТ по E-mail");
        idDecodingMap.set("auth_by_sip", "Разрешить вход в Личный кабинет по учетным <br/>записям SIP");

        if (otherRules.length > 0) {
          resultString += `<hr class="${mangoAssistantSeparatorHr}"/>`;
          for (let i = 0; i < otherRules.length; i++) {
            const title = idDecodingMap.get(otherRules[i].id || otherRules[i].name);
            if (otherRules[i].checked) {
              resultString += `${i > 0 ? "<br/>" : ""}<span style="font-size:8pt">- ${title}: да</span>`;
            } else {
              resultString += `${i > 0 ? "<br/>" : ""}<span style="font-size:8pt; color:red">- ${title}: нет</span>`;
            }
          }
        }

        displayResultField(resultString, `contentOfAvailableRegionsBlock`, `Проверить доступные <br>для звонка регионы`, `checkAvailableRegionsButton`);
      } catch (err) {
        console.error(`Не удалось произвести анализ доступных регионов!`, err);
        displayResultField(
          `Не удалось проанализировать доступные для звонка регионы!`,
          `contentOfAvailableRegionsBlock`,
          `Проверить доступные <br>для звонка регионы`,
          `checkAvailableRegionsButton`,
          true
        );
      }
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      console.error(`Не удалось произвести анализ доступных регионов! textStatus: ` + textStatus + `, errorThrown: ` + errorThrown);
      displayResultField(
        `Не удалось произвести анализ доступных регионов!`,
        `contentOfAvailableRegionsBlock`,
        `Проверить доступные <br>для звонка регионы`,
        `checkAvailableRegionsButton`,
        true
      );
    });
}

// Методы для отображения информации по выбранному сотруднику----------------------------------------------------------------------------------------------------
function gettingInfoAboutMembers() {
  $(`#${mangoAssistData} div#listOfMembersMangoAssistant`).empty();
  $(`#${mangoAssistData} div#contentOfMembersInfoBlock`).slideUp(200);
  $(`#${mangoAssistData} div#DisplayInfoMembersBlock`).prepend(HTML_MANGO_ASSISTANT_LOADER);
  $(`#${mangoAssistData} div#DisplayInfoMembersBlock`).slideDown(200);
  $(`#${mangoAssistData} button#showHideDisplayInfoMembersButton`).attr("disabled", true);

  if (MA_LK_INFO.workParams.isFillingAvailableItemsSuccess) {
    let listOfMembersHtml = ``;

    for (let i = 0; i < MA_LK_INFO.activeMembers.length; i++) {
      listOfMembersHtml += `<button style="font-size:8pt" data-member-id="${MA_LK_INFO.activeMembers[i].id}">${MA_LK_INFO.activeMembers[i].name}</button>`;
    }

    $(`#${mangoAssistData} div#listOfMembersMangoAssistant`).append(listOfMembersHtml);
    $(`#${mangoAssistData} div#DisplayInfoMembersBlock div.lds-roller`).remove();
    $(`#${mangoAssistData} div#contentOfMembersInfoBlock`).slideDown(200);
  } else {
    $(`#${mangoAssistData} div#DisplayInfoMembersBlock div.lds-roller`).remove();
    displayResultField(`Не удалось получить информацию о сотрудниках!`, `contentOfMembersInfoBlock`, null, null, true);
    $(`#${mangoAssistData} div#contentOfMembersInfoBlock`).slideDown(200);
  }
}

function filterSelectedItems(itemsSelector, inputSelector) {
  $items = $(`#${mangoAssistData} div#${itemsSelector} button`);
  $nameOfItem = $(`#${mangoAssistData} input#${inputSelector}`);

  const regExpParameter = regExpEscape($nameOfItem.val());
  const filterString = new RegExp(regExpParameter, "i");

  for (let i = 0; i < $items.length; i++) {
    if (filterString.test($items[i].innerText)) {
      $items[i].classList.remove("showHide");
    } else {
      $items[i].classList.add("showHide");
    }
  }
}

// Вывод информации об участии сотрудника в схеме распределения входящего вызова
function showInfoAboutMemberAndDID(activeMemberInfo) {
  mangoAssistantSendStatistic(`Проверка участия сотрудника в схеме распределения`, true);
  $(`#${mangoAssistData} div#maListOfDID button`).attr("disabled", true);
  $(`#${mangoAssistData} div#maDIDChosenInfo`).empty();
  $(`#${mangoAssistData} div#maDIDChosenInfo`).html(HTML_MANGO_ASSISTANT_LOADER);
  $(`#${mangoAssistData} div#maDIDChosenInfo`).removeClass("showHide");
  let resultHtml = `<span>Выбранный номер:
                    <br/>${event.target.innerText}
                    </span>
                    <br/>`;

  const loginParams = {
    operation: "get-profile-active-schema",
    "profile-id": event.target.dataset.didId,
  };
  $.ajax({ type: "POST", url: MA_LK_INFO.MA_CALL_FWD_OVERVIEW_URL, data: loginParams, timeout: 15000 })
    .done((data) => {
      try {
        const involvementMap = new Set();
        const inputSelector = `div.wrapper div.opaque ul.b-inline-list.params li.editable fieldset input`;
        const numbersCalls = $(data["schemaHtml"]).find(
          `${inputSelector}#target-type, 
          ${inputSelector}#target-number, 
          ${inputSelector}#target-id, 
          ${inputSelector}#target-name,
          ${inputSelector}#target-protocol`
        );

        for (let index = 0; index < numbersCalls.length; index++) {
          if (numbersCalls[index].id === "target-number") {
            const actionId = numbersCalls[index].dataset.actionId;

            const protocol = getProtocolOfNumber(actionId, numbersCalls);

            const externalNumber = protocol === "tel" ? formatExternalNumber(numbersCalls[index].value) : numbersCalls[index].value;

            for (let memberNumber of activeMemberInfo.numbers) {
              const formatNumberOfMember = memberNumber.protocol === "tel" ? formatExternalNumber(memberNumber.number) : memberNumber.number;

              if (externalNumber === formatNumberOfMember) {
                involvementMap.add(`Переадресация на прямой номер ${memberNumber.number}`);
              }
            }
          } else if (numbersCalls[index].id === "target-type") {
            if (numbersCalls[index].value === "acd_group") {
              const groupId = getElementNumbersCalls(numbersCalls, index, "target-id");
              if (groupId !== undefined) {
                const operatorGroups = activeMemberInfo.operator_groups;
                for (let key in operatorGroups) {
                  if (String(key) === String(groupId)) {
                    const groupName = returnNameOfItemSchema(groupId);
                    if (groupName !== undefined) {
                      involvementMap.add(`В группе "${groupName}"`);
                    }
                    break;
                  }
                }
              }
            } else if (numbersCalls[index].value === "member") {
              const nameId = getElementNumbersCalls(numbersCalls, index, "target-id");
              if (nameId !== undefined) {
                if (String(nameId) === String(activeMemberInfo.id)) {
                  involvementMap.add(`Есть переадресация на сотрудника`);
                }
              }
            }
          }
        }

        if (involvementMap.size > 0) {
          for (let involve of involvementMap) {
            resultHtml += `${involve}<br/>`;
          }
        } else {
          resultHtml += `<span>Сотрудник не учавствует в активной схеме 
                      <br/>распределения звонков 
                      <br/>указанного номера</span>`;
        }

        displayResultField(resultHtml, "maDIDChosenInfo");
        $(`#${mangoAssistData} div#maListOfDID button`).removeAttr("disabled");
      } catch (err) {
        console.error(err);
        console.error(`Не удалось проанализировать схему распределения номера ${event.target.innerText}`);
        displayResultField(`Не удалось проанализировать схему распределения номера ${event.target.innerText}`, "maDIDChosenInfo", undefined, undefined, true);
        $(`#${mangoAssistData} div#maListOfDID button`).removeAttr("disabled");
      }
    })
    .fail((error) => {
      console.error(error);
      console.error(`Не удалось проанализировать схему распределения номера ${event.target.innerText}`);
      displayResultField(`Не удалось проанализировать схему распределения номера ${event.target.innerText}`, "maDIDChosenInfo", undefined, undefined, true);
      $(`#${mangoAssistData} div#maListOfDID button`).removeAttr("disabled");
    });
}

function formatExternalNumber(number) {
  let externalNumber = String(number).replace(/\D/g, "");
  if (externalNumber.startsWith("8")) {
    externalNumber = "7" + externalNumber.slice(1);
  }
  return externalNumber;
}

// Вывод информации об участии сотрудника во всех схемах распределения входящего вызова
function showInfoMemberAndAllDIDs(activeMemberInfo) {
  mangoAssistantSendStatistic(`Проверка участия сотрудника в схеме распределения`, true);

  $(`#${mangoAssistData} button#maCheckEmployeeAllSchemas`).attr("disabled", true);
  $(`#${mangoAssistData} div#maLocateAllDIDsInfo`).empty();
  $(`#${mangoAssistData} div#maLocateAllDIDsInfo`).html(HTML_MANGO_ASSISTANT_LOADER);
  $(`#${mangoAssistData} div#maLocateAllDIDsInfo`).removeClass("showHide");

  let resultHtml = `<span>Результат:</span>`;

  const involvementMap = new Map();
  let countOfCompletedRequests = 0;
  let isContinue = true;

  for (let [profileId, number] of MA_LK_INFO.incomingNumbers) {
    if (isContinue) {
      const loginParams = {
        operation: "get-profile-active-schema",
        "profile-id": profileId,
      };
      $.ajax({ type: "POST", url: MA_LK_INFO.MA_CALL_FWD_OVERVIEW_URL, data: loginParams, timeout: 80000 })
        .done((data) => {
          try {
            if (isContinue) {
              const inputSelector = `div.wrapper div.opaque ul.b-inline-list.params li.editable fieldset input`;
              const numbersCalls = $(data["schemaHtml"]).find(
                `${inputSelector}#target-type, 
                ${inputSelector}#target-number, 
                ${inputSelector}#target-id, 
                ${inputSelector}#target-name,
                ${inputSelector}#target-protocol`
              );

              parseNumberCalls(numbersCalls, number);

              countOfCompletedRequests++;
              checkCountOfRequests(countOfCompletedRequests);
            }
          } catch (error) {
            errorAction(error, profileId);
          }
        })
        .fail((error) => {
          errorAction(error, profileId);
        });
    }
  }

  function errorAction(error, profileId) {
    console.error(`Не удалось проанализировать схему распределения номера ${profileId}`);
    console.error(error);

    if (isContinue) {
      isContinue = false;
      displayResultField(`Не удалось проанализировать схемы распределения`, "maLocateAllDIDsInfo", undefined, undefined, true);
      $(`#${mangoAssistData} button#maCheckEmployeeAllSchemas`).removeAttr("disabled");
    }
  }

  function checkCountOfRequests(countOfCompletedRequests) {
    if (isContinue) {
      if (countOfCompletedRequests === MA_LK_INFO.incomingNumbers.size) {
        parseInvolementMap();
      }
    }
  }

  function parseInvolementMap() {
    if (involvementMap.size > 0) {
      for (let [number, involve] of involvementMap) {
        resultHtml += `<br/>${number}:`;
        involve.forEach((element, index) => {
          resultHtml += `<br/><span style="font-size:8pt">${index + 1}) ${element}</span>`;
        });
      }
    } else {
      resultHtml += `<br/><span>Сотрудник не учавствует в активных схемах 
                    <br/>распределения звонков</span>`;
    }

    displayResultField(resultHtml, "maLocateAllDIDsInfo");
    $(`#${mangoAssistData} button#maCheckEmployeeAllSchemas`).removeAttr("disabled");
  }

  function parseNumberCalls(numbersCalls, value) {
    for (let index = 0; index < numbersCalls.length; index++) {
      if (numbersCalls[index].id === "target-number") {
        const actionId = numbersCalls[index].dataset.actionId;

        const protocol = getProtocolOfNumber(actionId, numbersCalls);

        const externalNumber = protocol === "tel" ? formatExternalNumber(numbersCalls[index].value) : numbersCalls[index].value;

        for (let memberNumber of activeMemberInfo.numbers) {
          const formatNumberOfMember = memberNumber.protocol === "tel" ? formatExternalNumber(memberNumber.number) : memberNumber.number;

          if (externalNumber === formatNumberOfMember) {
            addNewInvolve(value, `Переадресация на прямой номер ${memberNumber.number}`);
          }
        }
      } else if (numbersCalls[index].id === "target-type") {
        if (numbersCalls[index].value === "acd_group") {
          const groupId = getElementNumbersCalls(numbersCalls, index, "target-id");
          if (groupId !== undefined) {
            const operatorGroups = activeMemberInfo.operator_groups;
            for (let key in operatorGroups) {
              if (String(key) === String(groupId)) {
                const groupName = returnNameOfItemSchema(groupId);
                if (groupName !== undefined) {
                  addNewInvolve(value, `В группе "${groupName}"`);
                }
                break;
              }
            }
          }
        } else if (numbersCalls[index].value === "member") {
          const nameId = getElementNumbersCalls(numbersCalls, index, "target-id");
          if (nameId !== undefined) {
            if (String(nameId) === String(activeMemberInfo.id)) {
              addNewInvolve(value, `Есть переадресация на сотрудника`);
            }
          }
        }
      }
    }

    function addNewInvolve(number, involve) {
      let involvesArray = involvementMap.get(number);

      if (involvesArray !== undefined) {
        involvesArray.push(involve);
      } else {
        involvesArray = [involve];
      }

      involvementMap.set(number, involvesArray);
    }
  }
}

function getProtocolOfNumber(actionId, numbersCalls) {
  for (let t = 0; t < numbersCalls.length; t++) {
    if (numbersCalls[t].dataset.actionId == actionId) {
      if (numbersCalls[t].id === "target-protocol") {
        return numbersCalls[t].value;
      }
    }
  }

  return null;
}

function showInfoAboutSelectedMember() {
  const activeMemberInfo = MA_LK_INFO.activeMembers.find((item) => {
    if (item.id == event.target.dataset.memberId) {
      return true;
    }
  });

  let resultHtml = "";

  if (activeMemberInfo !== undefined) {
    const isNotIformationString = "не удалось получить информацию";
    let insideNumber = isNotIformationString;
    let groupsOperator = isNotIformationString;
    let groupsSupervisor = isNotIformationString;
    let callAlgorithm = isNotIformationString;
    let outgoingNumber = isNotIformationString;
    let callNumbers = isNotIformationString;

    // Определение внутреннего номера
    if (activeMemberInfo.hasOwnProperty("transfer_number")) {
      insideNumber = activeMemberInfo.transfer_number;
    }

    function returnGroupName(key) {
      const groupName = MA_LK_INFO.availableGroups.find((item) => {
        if (key == item.id) {
          return true;
        }
      });

      return groupName.name;
    }

    function returnGroupsHtml(groups, divId) {
      let str = "";
      let isFirst = true;
      for (let key in groups) {
        if (isFirst) {
          isFirst = false;
          str += returnGroupName(key);
        } else {
          str += "<br/>" + returnGroupName(key);
        }
      }

      if (str.length === 0) {
        return "не состоит в группах";
      } else {
        return `<button class="button-of-mango-assistant" onclick="toggleDivRule('${divId}')">Список групп</button>
                            <div class="showHide mangoAssistantBlock" id = "${divId}">${str}</div>`;
      }
    }

    // Нахождение групп, где сотрудник оператор
    if (activeMemberInfo.hasOwnProperty("operator_groups")) {
      groupsOperator = returnGroupsHtml(activeMemberInfo.operator_groups, "maOperatorGroupsOfSelectedMember");
    }

    // Нахождение групп, где сотрудник супервайзер
    if (activeMemberInfo.hasOwnProperty("supervisor_groups")) {
      groupsSupervisor = returnGroupsHtml(activeMemberInfo.supervisor_groups, "maSupervisorGroupsOfSelectedMember");
    }

    // Функция определения входящих номеров
    function defineIncomeNumbers(isMainNumberAlgorithm = false) {
      if (activeMemberInfo.hasOwnProperty("numbers")) {
        if (activeMemberInfo.numbers.length > 0) {
          callNumbers = `<button class="button-of-mango-assistant" onclick="toggleDivRule('maCallNumbersOfSelectedMember')">Список номеров</button>
                          <div id="maCallNumbersOfSelectedMember" class="showHide mangoAssistantBlock">`;
          let isFirst = true;
          for (i = 0; i < activeMemberInfo.numbers.length; i++) {
            let description = null;
            if (isMainNumberAlgorithm && isFirst && activeMemberInfo.numbers[i].is_active) {
              isFirst = false;
              description = "основной";
            } else if (activeMemberInfo.numbers[i].is_active) {
              description = "активен";
            } else {
              description = "неактивен";
            }
            callNumbers += `${i > 0 ? "<br/>" : ""}<span><b>Номер(${description !== null ? `${description}` : ""}): <br/>${
              activeMemberInfo.numbers[i].number
            }</b><br/>- Время ожидания: ${Number(activeMemberInfo.numbers[i].wait_time) !== 0 ? activeMemberInfo.numbers[i].wait_time + " с." : "бесконечно"}</span>`;

            const stringNumber = String(activeMemberInfo.numbers[i].number);
            const parstOfNumber = stringNumber.match(/(\w+)@([\w\.]+\.[a-z]{1,3}$)/i);

            if (parstOfNumber !== null && parstOfNumber.length === 3) {
              const login = parstOfNumber[1];
              const domain = parstOfNumber[2];

              callNumbers += `<br/><button class="button-of-mango-assistant ma-registration-button" data-login="${login}" data-domain="${domain}">Проверить регистрацию номера <br/>${stringNumber}</button>`;
            }
          }
          callNumbers += `</div>`;
        } else {
          callNumbers = "<span>номера не созданы!<span>";
        }
      }
    }

    // Определение способа приема звонков и входящих номеров
    if (activeMemberInfo.dial_alg === 1) {
      callAlgorithm = "Только на основной номер";
      defineIncomeNumbers(true);
    } else if (activeMemberInfo.dial_alg === 2) {
      callAlgorithm = "На все номера одновременно";
      defineIncomeNumbers();
    } else if (activeMemberInfo.dial_alg === 3) {
      callAlgorithm = "На все номера по очереди";
      defineIncomeNumbers();
    }

    // Определение исходящего номера
    if (activeMemberInfo.hasOwnProperty("substAni")) {
      const abonentId = activeMemberInfo.substAni.did_abonent_id || activeMemberInfo.substAni.sip_abonent_id;

      if (abonentId !== undefined) {
        const outNumber = MA_LK_INFO.outgoingNumbers.get(String(abonentId));

        if (outNumber !== undefined) {
          outgoingNumber = outNumber;
        }
      } else if (activeMemberInfo.substAni.abonent_type === null) {
        outgoingNumber = `<span class="${redPlaceholderClass}">Не указан номер - нет исходящей связи!</span>`;
      }
    }

    let listOfDIDs = "";
    for (let [key, value] of MA_LK_INFO.incomingNumbers) {
      listOfDIDs += `<button style="font-size:8pt" data-did-id="${key}">${value}</button>`;
    }

    resultHtml = `<div style="font-size:8pt">
    <span><b>- Имя:</b> ${activeMemberInfo.name}</span><br/>
    <span><b>- Внутренний номер:</b> ${insideNumber}</span><br/>
    <span><b>- Группы (оператор):</b> ${groupsOperator}</span><br/>
    <span><b>- Группы (супервайзер):</b> ${groupsSupervisor}</span><br/>
    <span><b>- Принимать звонки:</b> ${callAlgorithm}</span><br/>
    <span><b>- Номера:</b> ${callNumbers}</span><br/>
    <span><b>- Учитывать статус сотрудника <br/>в Контакт-центре:</b> ${Boolean(activeMemberInfo.use_status) ? `да` : `нет`}</span><br/>
    <span><b>- Принимать вызовы на номер <br/>Контакт-центра:</b> ${Boolean(activeMemberInfo.use_cc_numbers) ? `да` : `нет`}</span><br/>
    <span><b>- Исходящий номер:</b> ${outgoingNumber}</span><br/>
    <hr/>
    <div>
      <span><b>Проверка на участие сотрудника <br/>в схемах распределения</b></span>
      <button id="maCheckEmployeeAllSchemas" class="button-of-mango-assistant">Проверить во всех схемах</button>
      <div id="maLocateAllDIDsInfo" class="mangoAssistantBlock showHide" style="display:flex; flex-direction: column;"></div>
      <span>Проверить в одной схеме:</span>
      <input id="maDIDInfoInput" class="inputOfMangoAssistant" placeholder="Введите номер" oninput='filterSelectedItems("maListOfDID", "maDIDInfoInput")'></input>
      <div id="maListOfDID" class="textareaOfMangoAssistant mangoAssistantBlock" style="overflow-y: scroll;height: 100px; color:black;display:flex;flex-direction:column">
        ${listOfDIDs}
      </div>
      <div id="maDIDChosenInfo" class="mangoAssistantBlock showHide" style="display:flex; flex-direction: column;"></div>
    </div>`;
  } else {
    resultHtml = `<span>Не удалось получить информацио о сотруднике.</span>`;
  }

  $(`#${mangoAssistData} div#maChosenMember`).html(resultHtml);
  $(`#${mangoAssistData} div#maListOfDID`).on("click", `button`, function () {
    showInfoAboutMemberAndDID(activeMemberInfo);
  });
  $(`#${mangoAssistData} button#maCheckEmployeeAllSchemas`).click(function () {
    showInfoMemberAndAllDIDs(activeMemberInfo);
  });

  // Добавление функции получения регистрации sip-номера для соответствующих кнопок
  bindRegistrationButtons();

  $(`#${mangoAssistData} div#maChosenMember`).removeClass("showHide");
}

// Добавление функции получения регистрации sip-номера для соответствующих кнопок
function bindRegistrationButtons() {
  const registrationNumberButtons = document.querySelectorAll(`#${mangoAssistData} button.button-of-mango-assistant.ma-registration-button`);

  for (let element of registrationNumberButtons) {
    element.onclick = getNumberRegistrations.bind(null, element.dataset.login, element.dataset.domain, element);
  }
}

// Получение регистрации sip-номера
function getNumberRegistrations(login, domain, currentButton) {
  try {
    mangoAssistantSendStatistic(`Получение регистрации sip-номера ${login}@${domain}`, true);
    currentButton.setAttribute("disabled", "disabled");
    currentButton.innerHTML = `<span style="color:red">Загрузка!</span>`;

    fetch(`${MA_WORK_NODE_URL}/wa/registration?login=${login}&domain=${domain}`, {
      method: "GET",
    })
      .then((data) => {
        return data.json();
      })
      .then((jsonData) => {
        if (jsonData.isComplete && jsonData.data) {
          const result = jsonData.data;

          const registrations = document.createElement("div");
          registrations.innerHTML = result;
          registrations.style = "border: 3px solid green";

          currentButton.replaceWith(registrations);
        } else {
          maDisplayErrorRegistrationButton(
            `Не удалось получить регистрацю по sip-номеру, jsonData.isComplete: ${jsonData.isComplete}, jsonData.data: ${jsonData.data}`,
            currentButton
          );
        }
      })
      .catch((error) => {
        maDisplayErrorRegistrationButton(`${error}`, currentButton);
      });
  } catch (error) {
    maDisplayErrorRegistrationButton(`${error}`, currentButton);
  }
}

function maDisplayErrorRegistrationButton(message, currentButton) {
  currentButton.removeAttribute("disabled");
  console.error(message);
  currentButton.innerHTML = `
                            <span style="color:red; font-size:8pt">Не удалось получить данные!</span>
                            <br/><span style="font-size:8pt">Для получения регистрации попробуйте еще раз нажать на кнопку
                            <br/>Также, если выполняется еще одно получение регистрации по sip-номеру, подождите, пока оно закончится</span>
                            `;
}

// Методы для проверки правил записи разговора--------------------------------------------------------------------------------------------------------------------------
// Нахождение направлений звонков и исключений, если записываются все звонки
function findCallsDirections(CALL_RECORD_RULES_HTML) {
  function createRigthMessage(direction, isAllow) {
    let message = "";
    if (direction === "all-incoming-direction") {
      message += "Входящие:";
    } else if (direction === "all-outgoing-direction") {
      message += "Исходящие:";
    } else if (direction === "all-internal-direction") {
      message += "Внутренние:";
    }

    if (isAllow) {
      message += " разрешены";
    } else {
      message += " не разрешены";
    }

    return message;
  }

  let returnMessage = ``;
  const directionList = CALL_RECORD_RULES_HTML.find(`div.tab-content ul.direction-list input`);
  for (let index = 0; index < directionList.length; index++) {
    returnMessage += `<br/><span>${createRigthMessage(directionList[index].id, directionList[index].checked)}</span>`;
  }

  const exceptionList = CALL_RECORD_RULES_HTML.find(`div.tab-content ul.exceptions-list span.item-exception span.name`);
  if (exceptionList.length > 0) {
    returnMessage += `<br/><span><b>Исключения:</b></span>`;
  }
  for (let index = 0; index < exceptionList.length; index++) {
    returnMessage += `<br/><span>${exceptionList[index].innerText}</span>`;
  }

  return returnMessage;
}

// Нахождение правил активных участников, если происходит запись по правилам
function findCallMembersRules(CALL_RECORD_RULES_HTML) {
  function createRightMessage(property, isTrue) {
    return isTrue ? `<span>${property}: разрешено</span>` : `<span class="${redPlaceholderClass}">${property}: запрещено</span>`;
  }

  let returnMessage = `<span>Не удалось получить правила записи разговоров!</span>`;
  let rules;
  for (let i = 0; i < CALL_RECORD_RULES_HTML.length; i++) {
    if (CALL_RECORD_RULES_HTML[i].type === "text/javascript") {
      rules = CALL_RECORD_RULES_HTML[i].text.match(/rules: \[.*],/);

      if (rules !== null) {
        rules = rules["0"].slice(7, rules["0"].length - 1);
        rules = JSON.parse(rules);

        if (rules !== null && rules.length > 0) {
          let rulesString = "";
          returnMessage = `<br/><span><b>Активные участники:<b></span>`;
          const disabledMembers = new Set();
          for (key in rules) {
            if (rules[key].fiactive == "1") {
              let isRedButton = false;
              if (!rules[key].incoming || !rules[key].outgoing || !rules[key].internal) {
                isRedButton = true;
              }
              const separator = `mangoAssistantRuleDiv${key}`;
              rulesString += `<button class="button-of-mango-assistant ${isRedButton ? `${redPlaceholderClass}` : ""}" onclick="toggleDivRule('${separator}')">${
                rules[key].rule_name
              }</button>
                                <div id="mangoAssistantRuleDiv${key}" style="display:none">
                                <span>e-mail: ${rules[key].fsmail}</span><br/>
                                ${createRightMessage("Входящие", rules[key].incoming)}<br/>
                                ${createRightMessage("Исходящие", rules[key].outgoing)}<br/>
                                ${createRightMessage("Внутренние", rules[key].internal)}
                                </div>
                                `;
            } else {
              disabledMembers.add(rules[key].rule_name);
            }
          }
          if (rulesString.length > 0) {
            returnMessage += rulesString;
          } else {
            returnMessage += `<br/><span class="${redPlaceholderClass}">Нет активных участников!</span>`;
          }

          returnMessage += `<br/><span><b>Неактивные участники:<b></span>`;
          if (disabledMembers.size > 0) {
            disabledMembers.forEach((value, valueAgain, set) => {
              returnMessage += `<br/><span style="font-size:9pt">- ${value}</span>`;
            });
          } else {
            `<br/><span>Нет неактивных участников!</span>`;
          }
        }
      }
    }
  }
  return returnMessage;
}

// Проверка правил записи разговора
function checkingRulesRecordingConversation() {
  displayLoaderField(
    `contentOfCheckingRulesRecordConversationBlock`,
    `checkRulesRecordingConversationBlockContent`,
    `checkRulesRecordingConversationButton`,
    `Идет проверка правил записи разговоров`
  );

  $.get(MA_LK_INFO.GET_CALL_RECORDING_RULES_URL)
    .done((data) => {
      $CALL_RECORD_RULES_HTML = $(data);
      let resultMessage = "";

      try {
        const plugButton = $CALL_RECORD_RULES_HTML.find(`div.b-service-panel-block button.control`);

        if (!/Изменить/i.test(plugButton[0].innerText)) {
          resultMessage = "<span>Услуга записи разговоров <br/>не подключена</span>";
        } else {
          const selectedRule = $CALL_RECORD_RULES_HTML.find(`div.mode-tabs-wrap.vcenter ul.nav-tabs.mode-tabs.clearfix li.saved a`);

          if (selectedRule.length > 0) {
            resultMessage = `<form action="${MA_LK_INFO.GET_CALL_RECORDING_RULES_URL}" target="_blank">
                            <button class="${mangoAssistantSmallTextClass} button-of-mango-assistant" type="submit">Настроить правила <br/>записей разговоров</button>
                            </form>`;
            resultMessage += `<p class=${mangoAssistantSmallTextClass} style="color:red"><b>Внимание: разговоры длительностью менее 6 секунд не записываются!</b></p>
                              <b class=${mangoAssistantSmallTextClass}>Режим записи:</b>
                              <br/>
                              <b class=${mangoAssistantSmallTextClass}>${selectedRule[0].text.trim()}</b>`;

            const hrefOfRule = selectedRule[0].attributes.href.value;

            if (hrefOfRule === "#all-mode-tab") {
              resultMessage += findCallsDirections($CALL_RECORD_RULES_HTML);
            } else if (hrefOfRule === "#rules-mode-tab") {
              resultMessage += findCallMembersRules($CALL_RECORD_RULES_HTML);
            } else if (hrefOfRule === "#none-mode-tab") {
            }
          } else {
            resultMessage = ` <form action="${MA_LK_INFO.GET_CALL_RECORDING_RULES_URL}" target="_blank">
                              <button class="${mangoAssistantSmallTextClass} button-of-mango-assistant" type="submit">Настроить правила <br/>записей разговоров</button>
                            </form>
                            <span>Правила записи разговора <br/>не указаны!</span>`;
          }
        }
      } catch (error) {
        console.error(error);
        resultMessage = `<span>Не удалось произвести анализ правил записи разговора!</span>`;
      }
      displayResultField(resultMessage, `contentOfCheckingRulesRecordConversationBlock`, `Проверить правила <br>записи разговоров`, `checkRulesRecordingConversationButton`);
    })
    .fail(() => {
      displayResultField(
        `Не удалось произвести анализ правил записи разговора`,
        `contentOfCheckingRulesRecordConversationBlock`,
        `Проверить правила <br>записи разговоров`,
        `checkRulesRecordingConversationButton`,
        true
      );
    });
}
