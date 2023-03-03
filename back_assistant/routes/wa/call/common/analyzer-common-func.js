const analyzerModel = require("./analyzer-model");

const analyzerCommonFunc = {
  /**
   * Удаление крайних пробелов, ненужных символов ", ', приведение в нижний регистр.
   * Полученное в результате значение используется для сравнения.
   * @param {String} string
   */
  parseTrimReplaceLowerCase(string) {
    return string.trim().replace(/\"|\'/g, "").toLowerCase();
  },

  /**
   * Проверка, разрешен ли в контексте DTMF.
   * Необходимо для обработки строк с кодами IVR и DTMF.
   * @param {*} contextId
   */
  checkAllowDTMFParam(contextId) {
    if (analyzerModel.webAdminData[`${contextId}`].callParameters !== null && analyzerModel.webAdminData[`${contextId}`].callParameters.get("allow dtmfs") === "on") {
      return true;
    }

    return false;
  },

  /**
   * Шаблон регулярного выражения нужен для упрощения и стандартизации сравнения.
   */
  getWAMessageTemplate(message) {
    return new RegExp(`^\\s*${message}\\s*$`, "i");
  },

  /**
   * Необходимо для преобразования параметров из строки логов в Map'y.
   * @param {String} stringOfParameters
   */
  separateStringToMap(stringOfParameters) {
    const returnMap = new Map();
    const arrayOfParams = stringOfParameters.split(",");
    arrayOfParams.forEach((item) => {
      const param = item.split(":");
      if (param.length > 2) {
        if (/^\s*sip\s*$/i.test(param[1])) {
          param[1] = "";
        }
        for (let i = 2; i < param.length; i++) {
          param[1] += param[i];
        }
        param.length = 2;
      } else if (param.length === 1) {
        param[1] = " ";
      }

      const key = this.parseTrimReplaceLowerCase(param[0]);
      const value = this.parseTrimReplaceLowerCase(param[1]);
      returnMap.set(key, value);
    });
    return returnMap;
  },

  /**
   * Функция сравнения без преобразования типов.
   * @param {any} firstItem
   * @param {any} secondItem
   */
  findSimilar(firstItem, secondItem) {
    if (firstItem === secondItem) {
      return true;
    }
    return false;
  },

  /**
   * Нахождение определенного лога в webAdminData.
   * Общая функция для getCreateCall B getPlaceCall.
   * @param {string} contextId
   * @param {string} data
   * @param {string} firstItem
   * @param {string} secondItem
   */
  getLogWAData(contextId, data, firstItem, secondItem) {
    const value =
      analyzerModel.webAdminData[`${contextId}`][`${data}`].find((item) => {
        return this.findSimilar(item.get(firstItem), secondItem);
      }) || null;
    return value;
  },

  /**
   * Получение лога createCall из webAdminData.
   * Необходимо для работы с плечом звонка.
   * @param {string} contextId
   * @param {string} callId
   */
  getCreateCall(contextId, callId) {
    const getLogWAData = this.getLogWAData.bind(this);
    return getLogWAData(contextId, "creatingCalls", "callid", callId);
  },

  /**
   * Получение лога placingCall из webAdminData.
   * Необходимо для работы с плечом звонка.
   * @param {string} contextId
   * @param {string} createCall
   */
  getPlaceCall(contextId, createCall) {
    const getLogWAData = this.getLogWAData.bind(this);
    return getLogWAData(contextId, "placingCalls", "userid", createCall.get("userid"));
  },

  /**
   * Получение переведенных параметров лога.
   * @param {String} originalParameter
   * @param {String} translateArray
   * @param {String} valueOfParameter
   * @param {String} translateParametersArray
   *
   * @returns {string}
   */
  getTranslatedParameterInformation(originalParameter, translateArray, valueOfParameter = null, translateParametersArray = null) {
    const template = new RegExp(translateArray[0], "i");
    if (template.test(originalParameter)) {
      if (valueOfParameter !== null) {
        if (translateArray[2] === true) {
          const designation = translateArray[3] || "";
          valueOfParameter = valueOfParameter.replace(/\D/g, "") + " " + designation;
          const numValueOfParameter = Number(valueOfParameter);

          // Для свойства "OperatorsInGroup" (Операторов в группе): если количество равно нулю, то выделяю красным
          if (translateArray[0] === "OperatorsInGroup" && numValueOfParameter === 0) {
            valueOfParameter = `<b style="color:red">${valueOfParameter} (Нет сотрудников)</b>`;
          }
        } else if (translateParametersArray) {
          const translatedValue = this.getValueOrNull(
            translateParametersArray.find((element) => {
              const templateValue = new RegExp(`^(\\s|'|")*${element[0]}(\\s|'|")*$`, "i");

              if (templateValue.test(valueOfParameter)) {
                return true;
              }
            })
          );

          if (translatedValue !== null) {
            valueOfParameter = translatedValue[1];
          }
        }
      }

      return translateArray[1] + ": " + (valueOfParameter === null ? originalParameter.replace(template, "").trim() : valueOfParameter) + "</br>";
    }
    return "";
  },

  /**
   * Получение причины завершения звонка.
   * @param {string} endReason
   * @returns {string}
   */
  getEndReason(endReason = null) {
    if (endReason !== null) {
      const reasonString = analyzerModel.MA_CODES_OF_FINISH.get(Number(endReason)) || null;
      if (reasonString !== null) {
        return reasonString;
      }
    }
    return "";
    // Убрал строчку "не удалось найти причину завершения звонка", если код не найден, то ничего не вводится
    /* return `<span style="color:red">Не удалось найти причину завершения звонка!</span>`; */
  },

  /**
   * Получение кода завершения звонка.
   * @param {string} endCode
   * @returns {string}
   */
  getEndCode(endCode = null) {
    if (endCode !== null && typeof endCode === "string") {
      const codeWithoutNum = endCode.replace(/\d/g, "");

      if (codeWithoutNum.length > 0) {
        for (let element of analyzerModel.CODES_OF_ENDING_WA) {
          const template = new RegExp(element[0], "i");
          if (template.test(codeWithoutNum)) {
            return `<b>${element[2]}<b/>`;
          }
        }
      }
    }
    return endCode;
  },

  /**
   * Получение переведенных параметров строки.
   * @param {Object} action
   * @param {Array} translationArray
   * @param {Boolean} isSaveParams
   */
  getParametersOfString(action, translationArray, translateParametersArray = null, isSaveParams = false) {
    const parameters = this.separateStringToMap(action.param);

    let result = "";
    for (let [key, value] of parameters) {
      translationArray.forEach((check) => {
        result += this.getTranslatedParameterInformation(key, check, value, translateParametersArray);
      });
    }

    if (isSaveParams) {
      return [result, parameters];
    } else {
      return result;
    }
  },

  /**
   * Для упрощения сравнения "отрицательное" значение преобразуется в null.
   * @param {any} value
   */
  getValueOrNull(value) {
    return value || null;
  },

  /**
   * Получение сотрудника из ЛК.
   * Нужно для получения наименования сотрудника (так как в логах его нет)
   * @param {string} userId
   * @param {string} contextId
   */
  getMember(userId, contextId) {
    let result = null;

    if (userId !== null && analyzerModel.webAdminData[`${contextId}`].membersInfo !== null) {
      const numUserId = Number(userId);
      result = this.getValueOrNull(
        analyzerModel.webAdminData[`${contextId}`].membersInfo.find((item, index, array) => {
          if (Number(item.id) === numUserId) {
            return true;
          }
        })
      );
    }

    return result;
  },
  getDuration(start, finish) {
    try {
      const startDateParams = start.actionTime.match(/^\s*(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*$/i);
      const finishDateParams = finish.actionTime.match(/^\s*(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*$/i);

      if (startDateParams && finishDateParams) {
        const startString = `${startDateParams[3]}-${startDateParams[2]}-${startDateParams[1]}T${startDateParams[4]}:${startDateParams[5]}:${startDateParams[6]}.${startDateParams[7]}Z`;
        const finishString = `${finishDateParams[3]}-${finishDateParams[2]}-${finishDateParams[1]}T${finishDateParams[4]}:${finishDateParams[5]}:${finishDateParams[6]}.${finishDateParams[7]}Z`;

        const startDate = new Date(startString);
        const finishDate = new Date(finishString);

        const duration = (finishDate - startDate) / 1000;

        let durationMilliseconds = (duration + "").split(".")[1];
        if (durationMilliseconds[0] === "0") {
          durationMilliseconds = durationMilliseconds.slice(1);
        }

        let durationSeconds = Math.floor(duration);
        let durationMinutes = null;

        if (durationSeconds >= 60) {
          durationMinutes = Math.floor(durationSeconds / 60);
          durationSeconds = durationSeconds % 60;
        }

        return `<p><b>Продолжительность:</b> ${durationMinutes ? `${durationMinutes} минут,` : ""} ${durationSeconds} секунд, ${durationMilliseconds} милисекунд</p>`;
      }
    } catch (error) {
      console.error(error);
    }

    return "";
  },
};

module.exports = analyzerCommonFunc;
