const maAnalyzerView = {
  /**
   * Добавление столбца "Анализ логов в таблицу"
   * @param {object} jsonObj
   */
  appendAnalyzeElementsToTable(jsonObj, isGettingMembers) {
    if (jsonObj) {
      const findedHeadElement = document.querySelector(`table.history-report tr th.ma-anayzer`);
      const findedBodyTrElement = document.querySelectorAll(`table.history-report tbody tr`);

      if (findedBodyTrElement.length > 0) {
        appendAnalyzeBodyToTable(jsonObj, isGettingMembers);

        if (findedHeadElement === null) {
          appendHeadAnalyzeToTable();
        }
      } else if (findedHeadElement !== null) {
        findedHeadElement.remove();
      }

      // Вспомогательные внутренние функции для appendAnalyzeElementsToTable
      function appendHeadAnalyzeToTable() {
        const tHeadElement = document.createElement(`th`);
        tHeadElement.classList.add(`ma-anayzer`);
        tHeadElement.innerHTML = `<span style="font-size:9pt">Анализ звонка</span>`;
        const lastColumn = document.querySelector(`table.history-report thead tr`);
        lastColumn.append(tHeadElement);
      }

      function appendAnalyzeBodyToTable(jsonObj, isGettingMembers) {
        findedBodyTrElement.forEach(function (item, index) {
          const parametersAnalyzeCall = {
            contextId: jsonObj.data[index].contextId,
            timestamp: jsonObj.data[index].time,
            idButton: `ma-analyze-call${index}`,
            fromCall: jsonObj.data[index].caller || jsonObj.data[index].caller_number,
            toCall: jsonObj.data[index].dnis,
          };

          const currentButton = item.querySelector(`button[id^="ma-analyze-call"]`);

          if (currentButton !== null) {
            const newButton = getAnalyzeButton(parametersAnalyzeCall, index, isGettingMembers);
            currentButton.replaceWith(newButton);
          } else {
            const analyzeContextElement = document.createElement(`td`);
            analyzeContextElement.append(getAnalyzeButton(parametersAnalyzeCall, index, isGettingMembers));
            item.append(analyzeContextElement);
          }
        });

        AuthService.check();
      }

      function getAnalyzeButton(parametersAnalyzeCall, index, isGettingMembers) {
        const button = document.createElement(`button`);
        button.id = `ma-analyze-call${index}`;
        button.style = "width:100%";

        if (isGettingMembers) {
          if (maAnalyzerModel.membersInfo !== null) {
            button.innerHTML = `Анализ логов`;
            button.onclick = maAnalyzerController.analyzeCall.bind(
              null,
              parametersAnalyzeCall.contextId,
              parametersAnalyzeCall.timestamp,
              parametersAnalyzeCall.idButton,
              parametersAnalyzeCall.fromCall,
              parametersAnalyzeCall.toCall
            );
          } else {
            button.innerHTML = `<small style="opacity:0.5">Подготовка к работе</small>`;
          }
        } else {
          button.innerHTML = `<span style="color:red; font-size:8pt;">Не удалось получить данные.<br/>Попробуйте перезагрузить страницу.</span>`;
        }

        return button;
      }
    }
  },

  /**
   * Обновление кнопки показа логов звонка
   * @param {HTMLElement} currentButton
   * @param {HTMLElement} newButtonWithInfo
   * @param {object} tableWithInformation
   */
  changeCurrentButtonToNew(currentButton, newButtonWithInfo, tableWithInformation) {
    newButtonWithInfo.onclick = function () {
      const modalDiv = document.querySelector("div#mAssistantModalWindow div#maModalDiv");
      modalDiv.innerHTML = tableWithInformation;

      const registrationNumberButtons = modalDiv.querySelectorAll(`button`);

      for (let element of registrationNumberButtons) {
        element.onclick = maAnalyzerController.httpService.getRegistrationOfNumber.bind(null, element.dataset.login, element.dataset.domain, element);
      }

      maAnalyzerViewDump.setCallbackToAnalyzeButton(modalDiv);

      AuthService.check();

      document.querySelector("div#mAssistantModalWindow").classList.add("maShow");
    };
    currentButton.replaceWith(newButtonWithInfo);
  },

  /**
   * Преобразование массива переведенных логов в строку html-кода
   * @param {array} logs
   * @returns {string}
   */
  parseTableWithAnalysis(logs, contextId) {
    let result = `${this.HEAD_OF_TABLE}
                  <tbody>
                  `;

    logs.forEach((item, index, array) => {
      if (item[0] !== "dump-analyze") {
        result += this.maReturnRowToTable(item);
      } else {
        if (item[1] !== null) {
          result += this.maReturnRowToTable(maAnalyzerViewDump.getDumpAnalyzerElement(item, contextId));
        }
      }
    });

    result += `</tbody>
              </table>`;

    return result;
  },

  /**
   * Вывод сообщения об ошибке
   * @param {string} message
   * @param {HTMLElement} currentButton
   */
  displayErrorMessage(errorMessage = "Не удалось получить contextId/timestamp", currentButton, messageToButton = "") {
    console.error(errorMessage);
    currentButton.innerHTML = `<span style="color:red; font-size:8pt">Не удалось получить данные!</span>${messageToButton}`;
  },

  /**
   * Изменение кнопки показа логов при загрузке логов
   * @param {string} idButton
   * @returns {HTMLElement}
   */
  getAndChangeCurrentButton(idButton) {
    const currentButton = document.querySelector(`table.history-report tbody tr button#${idButton}`);
    currentButton.setAttribute("disabled", "disabled");
    currentButton.innerHTML = `<span style="color:red">Загрузка!</span>`;
    return currentButton;
  },

  /**
   * Шаблон новой кнопки, которая отображается при успешной загрузке и обработке логов
   * @returns {HTMLElement}
   */
  createNewButtonWithInfo() {
    const newButtonWithInfo = document.createElement("button");
    newButtonWithInfo.style = "width: 100%";
    newButtonWithInfo.innerHTML = `Показать логи`;
    return newButtonWithInfo;
  },

  /**
   * Закрывает окно с логами
   */
  closeModalWindow() {
    document.querySelector("div#mAssistantModalWindow").classList.remove("maShow");
  },

  /**
   * Преоразование элемента массива логов в строку с html-кодом
   * @param {array} array
   * @returns {string}
   */
  maReturnRowToTable(array) {
    let returnString = "<tr>";
    array.forEach((item, index) => {
      if (index < 2) {
        returnString += `<td>${item}</td>`;
      }
    });
    returnString += `</tr>`;
    return returnString;
  },

  /**
   * Вывод результата по регистрациям sip-номера
   * @param {JSON} jsonData
   * @param {HTMLElement} currentButton
   */
  changeButtonOfNumberRegistration(jsonData, currentButton) {
    if (jsonData.isComplete && jsonData.data) {
      const result = jsonData.data;

      const registrations = document.createElement("div");
      registrations.innerHTML = result;
      registrations.style = "border: 3px solid green";

      currentButton.replaceWith(registrations);
    } else {
      this.displayErrorRegistrationButton(
        `Не удалось получить регистрацю по sip-номеру, jsonData.isComplete: ${jsonData.isComplete}, jsonData.data: ${jsonData.data}`,
        currentButton
      );
    }
  },

  /**
   * Изменение статуса кнопки получения регистрации sip-номера при нажатии на эту кнопку
   * @param {HTMLElement} currentButton
   */
  setStatusLoadedForButtonOfRegistration(currentButton) {
    currentButton.setAttribute("disabled", "disabled");
    currentButton.innerHTML = `<span style="color:red">Загрузка!</span>`;
  },

  /**
   * Вывод информации об ошибке для кнопки получения регистрации sip-номера
   * @param {string} message
   * @param {HTMLElement} currentButton
   */
  displayErrorRegistrationButton(message, currentButton) {
    currentButton.removeAttribute("disabled");
    this.displayErrorMessage(
      message,
      currentButton,
      `<br/><span style="font-size:9pt">Для получения регистрации попробуйте еще раз нажать на кнопку</br>Также, если выполняется еще одно получение регистрации по sip-номеру, подождите, пока оно закончится</span>`
    );
  },

  // Отображение окна с сообщением об ошибке при отправке статистики
  displayErrorStatisticMessage(error) {
    const errorStatsBlock = $(`div#mango-assistant div#${maAnalyzerModel.mangoAssistData} div#ma-error-stats`);
    if (errorStatsBlock.length === 0) {
      $(`div#mango-assistant div#${maAnalyzerModel.mangoAssistData}`).prepend(`<div id="ma-error-stats" class="mangoAssistantBlock">
      <span class="${maAnalyzerModel.redPlaceholderClass}">Внимание!</span>
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
      $(`#${maAnalyzerModel.mangoAssistData} button#maStatsErrorToggleButton`).click(function () {
        maAnalyzerView.toggleBlock(`div#${maAnalyzerModel.mangoAssistData} div#maStatsErrorInformation`, `div#${maAnalyzerModel.mangoAssistData} button#maStatsErrorToggleButton`);
      });
    }
  },

  // Функция для работы с кнопкой "Свернуть/Развернуть"
  toggleBlock(selectorOfContentBlock, selectorOfButton = null) {
    $(selectorOfContentBlock).slideToggle(200);
    maAnalyzerView.toggleNameOfSlideButton(selectorOfButton);
  },

  // Функция для кнопок "Свернуть/Развернуть", меняет содержимое кнопок
  toggleNameOfSlideButton(selectorOfButton) {
    if (selectorOfButton !== null) {
      $(selectorOfButton).html(function (index, x) {
        if (x != "Свернуть") return "Свернуть";
        else return "Развернуть";
      });
    }
  },
};

/**
 * Верхушка таблицы логов звонка
 */
maAnalyzerView.HEAD_OF_TABLE = `
  <table>
    <thead>
      <tr>
        <td><b>Сообщения:</b></td>
        <td><b>Доп. Информация:</b></td>
      </tr>
    </thead>
`;

/**
 * Блок окна, которое появляется при нажатии на кнопку "Показать логи"
 */
maAnalyzerView.MODAL_HTML = document.createElement("div");
maAnalyzerView.MODAL_HTML.id = "ma-analyzer-modal-container";

maAnalyzerView.MODAL_HTML.innerHTML = `
<style>
.maModal {
  position: fixed;
  display: none;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9997;
  background: rgba(0,0,0,0.7);
}
.maModal_Body {
  position: relative;
  z-index: 9999;
  display: block;
  margin: 10% 20%;
  background: #FFF;
  width: 65%;
  height: 75%;
  overflow-y: auto;
  border: 3px solid black;
}
.maModal_Body table{
  width: 100%;
  margin: 0 auto;
  border-collapse: collapse
}
.maModal_Body td, maModal_Body th {
  padding: 3px;
  border: 1px solid black; 
 }
.maModalFull {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: block;
  z-index: 9998;
  width: 100%;
  height: 100%;
}
.maShow.maModal{
  display:block;
}
</style>

<div id="mAssistantModalWindow" class="maModal">
    <div id="maModalDiv" class="maModal_Body">
    </div>
    <div class="maModalFull" onclick="maAnalyzerView.closeModalWindow()"></div>
</div>
`;

/**
 * Блок авторизации
 */
maAnalyzerView.AUTH_BLOCK = document.createElement("div");
maAnalyzerView.AUTH_BLOCK.id = "ma-auth-block-container";
maAnalyzerView.AUTH_BLOCK.innerHTML = `
<!-- Содержимое блока Манго Ассистент -->
<style>
.mangoAssistantBlock {
  border: 1px solid #BDB76B;
  border-radius: 5px;
}

.mangoAssistantRedPlaceholder {
  color: red;
}

.${maAnalyzerModel.redPlaceholderClass} {
  color: red;
}
</style>

<div id="mango-assistant"
    style=" z-index: 499; width: 300px; position:absolute; top:220px; left:1550px; color: #fff; border-radius: 5px; background-color: rgb(120,100,39,0.65);">
    <div id="mango-assistant-header" class="mangoAssistantBlock" style="display:flex; flex-direction:column">
        <p align="center">Mango Assistant</p>
        ${MA_AUTH_BLOCK_HTML}
    </div>
    <div id="${maAnalyzerModel.mangoAssistData}"
    style=" word-break: break-all; overflow-y: hidden; border-radius: 0 0 10px 10px;">
    </div>
</div>
`;

function ma_analyzerViewStart() {
  const lkHeaderContainer = document.querySelector("body div#lk-header-container");
  lkHeaderContainer.append(maAnalyzerView.AUTH_BLOCK);

  document.body.append(maAnalyzerView.MODAL_HTML);
}
