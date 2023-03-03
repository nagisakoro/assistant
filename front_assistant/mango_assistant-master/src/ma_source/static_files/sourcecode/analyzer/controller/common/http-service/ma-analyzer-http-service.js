/**
 * Ссылка для запроса на получение информации о сотрудниках
 */
//const MA_GET_INFO_ABOUT_MEMBERS_URL = `https://lk.mango-office.ru/${location.href.split("/")[3]}/${location.href.split("/")[4]}/members`/index;
const MA_GET_INFO_ABOUT_MEMBERS_URL = `https://lk.mango-office.ru/issa/api/${location.href.split("/")[3]}/${location.href.split("/")[4]}/members`;

const TIMEOUT = 15000;

maAnalyzerHttpService = {
  /**
   * Функция для получения информации о сотрудниках.
   * Без этой инфы анализатор не сможет корректно работать.
   */
  getInfoAboutMembers() {
    $.ajax({
      type: "GET",
      url: MA_GET_INFO_ABOUT_MEMBERS_URL,
      timeout: TIMEOUT,
    })
      .done((data) => {
        try {
          //const mData = $(data).find(`script#b-members-data`);
          //const membersObject = JSON.parse(mData[0].text) || null;
          const membersObject = data;
          const membersArray = [];
         // console.log("membersObject: ", membersObject);

          if (membersObject !== null) {
            membersObject.forEach((item) => {
              const obj = {
                id: item.id,
                abonent_id: item.abonent_id,
                name: item.name,
              };
              membersArray.push(obj);
            });
          }

          maAnalyzerModel.membersInfo = membersArray || null;
          if (maAnalyzerModel.membersInfo) {
            maAnalyzerView.appendAnalyzeElementsToTable(maAnalyzerModel.jsonTable, maAnalyzerModel.isGettingMembers);
          } else {
            maAnalyzerModel.isGettingMembers = false;
            maAnalyzerView.appendAnalyzeElementsToTable(maAnalyzerModel.jsonTable, maAnalyzerModel.isGettingMembers);
            console.error("maAnalyzerModel.membersInfo is null");
          }
        } catch (err) {
          maAnalyzerModel.isGettingMembers = false;
          maAnalyzerView.appendAnalyzeElementsToTable(maAnalyzerModel.jsonTable, maAnalyzerModel.isGettingMembers);
          console.error(err);
        }
      })
      .fail((err) => {
        maAnalyzerModel.isGettingMembers = false;
        maAnalyzerView.appendAnalyzeElementsToTable(maAnalyzerModel.jsonTable, maAnalyzerModel.isGettingMembers);
        console.error(err);
      });
  },

  /**
   * Функция мониторинга запросов.
   * При определенных запросах на странице создается таблица со звонками, нужно "поймать" эти запросы для дальнейшей работы анализатора.
   * @param {function} callback
   */
  addXMLRequestCallback(callback) {
    let oldSend, i;
    if (XMLHttpRequest.callbacks) {
      XMLHttpRequest.callbacks.push(callback);
    } else {
      XMLHttpRequest.callbacks = [callback];
      oldSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.send = function () {
        for (i = 0; i < XMLHttpRequest.callbacks.length; i++) {
          XMLHttpRequest.callbacks[i](this);
        }
        oldSend.apply(this, arguments);
      };
    }
  },

  /**
   * При определенных ссылках на странице появляется таблица со звонками.
   * Соответственно, в таблицу добавляется колонка "Анализ звонков".
   * @param {Request} xhr
   */
  checkRequestAndBuildInterface(xhr) {
    try {
      maAnalyzerModel.jsonTable = JSON.parse(xhr.responseText);

      if (maAnalyzerModel.jsonTable.status !== "complete") {
        return;
      }

      maAnalyzerView.appendAnalyzeElementsToTable(maAnalyzerModel.jsonTable, maAnalyzerModel.isGettingMembers);
    } catch (error) {
      console.error(error);
    }
  },

  /**
   * Запрос для получения информации с анализом звонка.
   * @param {string} contextId
   * @param {string} timestamp
   * @param {HTMLElement} currentButton
   * @param {string} fromCall
   * @param {string} toCall
   */
  sendXMLRequestVatsLogs(contextId, timestamp, currentButton, fromCall, toCall) {
    try {
      const dateResponse = maAnalyzerController.commonFunc.ma_getRightDateFormat(timestamp);

      const bodyObject = {
        contextId: contextId,
        dateResponse: dateResponse,
        fromCall: fromCall,
        toCall: toCall,
        membersInfo: maAnalyzerModel.membersInfo,
      };

      const body = JSON.stringify(bodyObject).toString();

      const url = `${MA_WORK_NODE_URL}/wa/call`;

      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: body,
      })
        .then((res) => {
          if (res.status !== 200) {
            maAnalyzerView.displayErrorMessage(`error, res.status: ${res.status}`, currentButton);
            throw new Error("not 200");
          } else {
            return res.json();
          }
        })
        .then((jsonData) => {
          maAnalyzerController.commonFunc.parseLogs(jsonData, currentButton, contextId);
        })
        .catch((error) => {
          maAnalyzerView.displayErrorMessage(`error, ${error}`, currentButton);
        });
    } catch (err) {
      maAnalyzerView.displayErrorMessage(`catchSrc, ${err}`, currentButton);
    }
  },

  /**
   * Получение регистрации указанного переданного в функцию sip-номера
   * @param {String} login
   * @param {String} domain
   * @param {HTMLElement} currentButton
   */
  getRegistrationOfNumber(login = null, domain = null, currentButton) {
    if (typeof login === "string" && typeof domain === "string") {
      maAnalyzerHttpService.sendStatistic(`Получение регистрации sip-номера ${login}@${domain}`, true);
      try {
        maAnalyzerView.setStatusLoadedForButtonOfRegistration(currentButton);

        fetch(`${MA_WORK_NODE_URL}/wa/registration?login=${login}&domain=${domain}`, {
          method: "GET",
        })
          .then((data) => {
            return data.json();
          })
          .then((jsonData) => {
            maAnalyzerView.changeButtonOfNumberRegistration(jsonData, currentButton);
          })
          .catch((error) => {
            maAnalyzerView.displayErrorRegistrationButton(`${error}`, currentButton);
          });
      } catch (error) {
        maAnalyzerView.displayErrorRegistrationButton(`${error}`, currentButton);
      }
    } else {
      maAnalyzerView.displayErrorRegistrationButton(`Not right format at login ${login} or domain ${domain} !`, currentButton);
    }
  },

  /**
   * Отправка статистики
   */
  sendStatistic(action, isActive) {
    try {
      const typeOfAction = typeof action;
      if (typeOfAction !== "string") {
        maAnalyzerView.displayErrorStatisticMessage(`Некорректно указан тип ${action}, ${typeOfAction}`);
        return;
      } else if (!(typeof maAnalyzerModel.MA_LK_INFO.accountData.control === "string" && typeof maAnalyzerModel.MA_LK_INFO.PRODUCT_ID === "string")) {
        maAnalyzerView.displayErrorStatisticMessage(`
                                    Не удалось получить ls: ${maAnalyzerModel.MA_LK_INFO.accountData.control}, 
                                    тип ${typeof maAnalyzerModel.MA_LK_INFO.accountData.control} 
                                    или productId: ${maAnalyzerModel.MA_LK_INFO.PRODUCT_ID}, 
                                    тип ${typeof maAnalyzerModel.MA_LK_INFO.PRODUCT_ID}
                                    `);
        return;
      }

      isActive = isActive ? 1 : 0;

      requestParams = {
        email: $(`div#mango-assistant div#${maAnalyzerModel.mangoAssistantHeader} input.ma-container__auth-email`).val(),
        action: action,
        isActive: isActive,
        ls: maAnalyzerModel.MA_LK_INFO.accountData.control,
        product: maAnalyzerModel.MA_LK_INFO.PRODUCT_ID,
      };
      $.post(`${MA_WORK_NODE_URL}/add-statistic-action`, requestParams)
        .done((data) => {
          if (data.status !== "done") {
            maAnalyzerView.displayErrorStatisticMessage(`action: ${action}, <br/>
                                          ls: ${maAnalyzerModel.MA_LK_INFO.accountData.control}, <br/>
                                          product: ${maAnalyzerModel.MA_LK_INFO.PRODUCT_ID}, <br/>
                                          type: requestError`);
          }
        })
        .fail((error) => {
          maAnalyzerView.displayErrorStatisticMessage(`action: ${action}, <br/>
                                        ls: ${maAnalyzerModel.MA_LK_INFO.accountData.control}, <br/>
                                        product: ${maAnalyzerModel.MA_LK_INFO.PRODUCT_ID}, <br/>
                                        type: requestFail`);
        });
    } catch (err) {
      maAnalyzerView.displayErrorStatisticMessage(`type: catchError, <br/>
                                    error: ${err}`);
    }
  },

  gettingAccountInformation() {
    return new Promise((resolve, reject) => {
      let result = false;

      try {
        const authToken = getCookie();

        const accountLoginParams = {
          app: "ics",
          auth_token: authToken,
          locale: "ru",
          prod_code: maAnalyzerModel.MA_LK_INFO.PRODUCT_CODE,
          prod_id: maAnalyzerModel.MA_LK_INFO.PRODUCT_ID,
        };

        $.ajax({
          type: "POST",
          url: maAnalyzerModel.MA_LK_INFO.GET_ACCOUNT_INFO_URL,
          data: accountLoginParams,
          timeout: 7000,
        })
          .done((data) => {
            try {
              maAnalyzerModel.MA_LK_INFO.accountData = data.data;
              if (maAnalyzerModel.MA_LK_INFO.accountData !== undefined && maAnalyzerModel.MA_LK_INFO.accountData.control !== undefined) {
                result = true;
              }
            } catch (err) {
              console.error(err);
              result = false;
            }
          })
          .fail(() => {
            result = false;
          })
          .always(() => {
            resolve(result);
          });
      } catch (err) {
        console.error(err);
        resolve(result);
      }
    });

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
  },

  getUrlPartsAndAccountInfo() {
    [
      maAnalyzerModel.MA_LK_INFO.IS_HREF_AND_CONTROL_RIGHT,
      maAnalyzerModel.MA_LK_INFO.PRODUCT_CODE,
      maAnalyzerModel.MA_LK_INFO.PRODUCT_ID,
    ] = maAnalyzerController.commonFunc.parseUrl();

    if (maAnalyzerModel.MA_LK_INFO.IS_HREF_AND_CONTROL_RIGHT) {
      maAnalyzerHttpService.gettingAccountInformation().then((data) => {
        maAnalyzerModel.MA_LK_INFO.IS_HREF_AND_CONTROL_RIGHT = data;
      });
    }
  },
};

maAnalyzerController.httpService = maAnalyzerHttpService;
