class SDAndRMButtons {
  constructor() {
    this.init();
  }
  init() {
    getParameters()
      .then(addButtons)
      .catch((error) => {
        console.error(error);
      });

    // Вспомогательные функции
    function getParameters() {
      return new Promise((resolve) => {
        let tryCount = 0;
        const paramsInterval = setInterval(() => {
          try {
            const idMap = getIdMap();

            if (idMap.size === 2) {
              clearInterval(paramsInterval);
              return resolve({ idMap: idMap });
            }

            if (tryCount >= 5) {
              clearInterval(paramsInterval);
            }

            tryCount++;
          } catch (error) {
            console.error("mango assisstant error: ", error);
            clearInterval(paramsInterval);
          }
        }, 1200);
      });

      // Вспомогательные функции для getParameters
      function getIdMap() {
        const selector = "div[data-item-marker^=INTEGER]";
        const elements = document.querySelectorAll(selector);

        return parseId(elements);

        function parseId(elements) {
          const result = new Map();

          for (let entry of elements.entries()) {
            const itemMarker = entry[1].dataset.itemMarker;

            const idRm = itemMarker.match(/INTEGER(.+)\s+№\s*RM/i);

            if (idRm) {
              result.set("rm", idRm[1]);
            } else {
              const idSd = itemMarker.match(/INTEGER(.+)\s+№\s*ОМиЭ/i);

              if (idSd) {
                result.set("sd", idSd[1]);
              }
            }
          }

          return result;
        }
      }
    }

    function addButtons(params) {
      addButton(params, "rm");
      addButton(params, "sd");
    }

    function addButton(params, type) {
      const id = params.idMap.get(type);

      const controlContainer = getControlContainer(id);
      if (controlContainer.querySelector(`button#ma-go-to-${type}`) !== null) {
        return;
      }

      const button = getButton(id, type);

      controlContainer.append(button);

      // Вспомогательные функция для addButton
      function getButton(id, type) {
        const button = document.createElement("button");
        button.id = `ma-go-to-${type}`;
        button.setAttribute("style", "width:100%; max-width:78px; min-width:57px; margin:1px");
        button.innerHTML = `<span style="font-size:10px">Перейти в ${type}</span>`;

        button.onclick = function () {
          openPage(id, type);
        };

        return button;

        // Вспомогательная функция для getButton
        function openPage(id, type) {
          const input = getInputElement(id);

          if (input) {
            const value = getInputValue(input);

            if (value !== "0") {
              const [url, statisticType] = getParams(type, value);

              if (url) {
                StatisticService.send(statisticType, location.href.split("/")[8], value, " ");
                window.open(url);
              }
            }
          }

          // Вспомогательные функция для openRm
          function getParams(type, value) {
            if (type === "rm") {
              return [`http://redmine.mango.local/issues/${value}`, "bpm_to_rm"];
            } else if (type === "sd") {
              return [`http://sd.corp.mango.ru/WorkOrder.do?woMode=viewWO&woID=${value}`, "bpm_to_sd"];
            }
            return [null, null];
          }

          function getInputElement(id) {
            return document.querySelector(`input#CasePageINTEGER${id}IntegerEdit-el`);
          }

          function getInputValue(input) {
            return input.value.replace(/\s/g, "");
          }
        }
      }

      function getControlContainer(id) {
        return document.querySelector(`div#CasePageINTEGER${id}Container_Control`);
      }
    }
  }
}
