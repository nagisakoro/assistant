const maAnalyzerViewDump = {
  getDumpAnalyzerElement(item, contextId) {
    const dumpAnalyzerElement = `<table>
                                  <tbody>
                                    <tr>  
                                      <td>
                                        <span>Возможен анализ звонка не более 18 минут. Звонок должен быть не старше 2ух суток</span>
                                      </td>  
                                    </tr>
                                    <tr>  
                                      <td>
                                        <span>Контекст для передачи в ОТП при необходимости: ${contextId} (Для передачи в ОТП необходимо не менее трех контекстов (примеров))</span>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>
                                        ${this.getDumpAnalyzerButton()}
                                      </td>  
                                    </tr>
                                    <tr>
                                      <td>
                                        <p>Выберите плечо для анализа:</p>
                                        ${this.getSelectDumpElement(item[1])}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>
                                      <p><b><span style="color:green; font-size: 150%">Результат:</span></b><div class="dump-analyze-result"></div></p>                                        
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>`;

    return ["Анализ Качества связи", dumpAnalyzerElement];
  },

  getDumpAnalyzerButton() {
    return `<button class="dump-analyze-button">Начать анализ</button>`;
  },

  getSelectDumpElement(dumps) {
    let selectElement = `<select class="dump-analyzer-select">`;

    dumps.forEach((dump) => {
      selectElement += `<option value="${dump.sipCallId}">${dump.callingNumber ? `с ${dump.callingNumber},` : ""} ${dump.calledNumber ? `на ${dump.calledNumber},` : ""} ${
        dump.timeCreatedOffset ? `начат в: ${dump.timeCreatedOffset},` : ""
      } ${dump.durationCall ? `длит-ть: ${parseDuration(dump.durationCall)}` : ""}</option>`;
    });

    selectElement += `</select>`;

    return selectElement;

    function parseDuration(durationCall) {
      let durationSeconds = Math.ceil(durationCall / 1000);
      let durationMinutes = null;

      if (durationSeconds >= 60) {
        durationMinutes = Math.floor(durationSeconds / 60);
        durationSeconds = durationSeconds % 60;
      }

      return `${durationMinutes ? `${durationMinutes} минут ` : ""}${durationSeconds} секунд`;
    }
  },

  /**
   * Изменение блока анализатора дампа
   * @param {*} resultElement
   * @param {*} message
   * @param {*} error
   */
  display(elements, status, data) {
    if (status === "start") {
      this._setSelectElement(elements.selectElement, true);
      this._setAnalyzeButton(elements.analyzeButton, true, "grey", "Подождите");
      this._setResultElement(elements.resultElement, "span", "blue", "Дамп анализируется, необходимо подождать");

      return;
    }

    if (status === "finish") {
      const message = data.message;
      maAnalyzerViewDumpDialog.uac = data.uac || "User-agent";

      this._setSelectElement(elements.selectElement, false);
      this._setAnalyzeButton(elements.analyzeButton, false, "black", "Начать анализ");
      this._setFinishResultElement(elements.resultElement, message);

      return;
    }

    this._setSelectElement(elements.selectElement, false);
    this._setAnalyzeButton(elements.analyzeButton, false, "black", "Начать анализ");
    this._setResultElement(elements.resultElement, "div", "red", `Не удалось проанализировать дамп`);

    console.error(data);
  },

  _setResultElement(resultElement, htmlElement, color = null, innerHTML = null) {
    resultElement.innerHTML = "";
    const element = document.createElement(htmlElement);

    if (color) {
      element.style.color = color;
    }

    if (innerHTML) {
      element.innerHTML = innerHTML;
    }

    resultElement.append(element);
  },

  _setAnalyzeButton(analyzeButton, isDisabled, color, innerText) {
    analyzeButton.disabled = isDisabled;
    analyzeButton.style.color = color;
    analyzeButton.innerText = innerText;
  },

  _setSelectElement(selectElement, isDisabled) {
    selectElement.disabled = isDisabled;
  },

  setCallbackToAnalyzeButton(modalDiv) {
    const analyzeButton = modalDiv.querySelector(`button.dump-analyze-button`);
    const selectElement = modalDiv.querySelector(`select.dump-analyzer-select`);
    const resultElement = modalDiv.querySelector("div.dump-analyze-result");

    if (analyzeButton && selectElement && resultElement) {
      const callId = selectElement.value;

      const elements = {
        analyzeButton: analyzeButton,
        selectElement: selectElement,
        resultElement: resultElement,
      };

      analyzeButton.onclick = maAnalyzerHttpDump.getDumpAnalyzeInfo.bind(null, callId, elements);
    }
  },

  _setFinishResultElement(resultElement, message) {
    resultElement.innerHTML = "";
    if (message !== "OK") {
      this._setResultElement(resultElement, "span", "black", message);
      return;
    }

    const resultDiv = maAnalyzerViewDumpDialog.ClientBadSound.resultBlock;

    resultElement.append(resultDiv);
  },
};
