/* const analyzerModel = require("../analyzer-model"); */
const analyzerCommonFunc = require("../analyzer-common-func");

const parseMtAudio = {
  tryStartPlayingTonesClient(action, contextId, array) {
    let result = "<p>Проигрывание гудков</p>";

    for (let i = action.recordNumber; i < array.length; i++) {
      if (/Stopping tones for Client/i.test(array[i].message)) {
        result += analyzerCommonFunc.getDuration(action, array[i]);
        break;
      }
    }

    return ["Статус аудио", result];
  },

  /* tryToPlayingAudio(action, contextId, array) {
    if (!analyzerModel.webAdminData[`${contextId}`].isAudioWorkDisplayed) {
      analyzerModel.webAdminData[`${contextId}`].isAudioWorkDisplayed = true;

      let isHaveAudioForClient = false;
      let isHaveStopFileForClient = false;
      let isHaveStopWorkAudioForClient = false;
      let isStartPlayAudio = false;
      let isStartAudioForClient = false;
      let isplayAudioResult = false;

      let result = "";

      if (/Try\s*to\s*start\s*playing\s*audio/i.test(action.message)) {
        result = "Попытка старта работы аудио";
      } else if (/Start\s*playing\s*audio\s*for\s*Client/i.test(action.message)) {
        isHaveAudioForClient = true;
        result = `Старт проигрывания аудио для клиента`;
      } else if (/Start\s*playing\s*audio\.?/i.test(action.message)) {
        result = "Старт работы аудио";
      } else if (/Start\s*playing\s*for\s*Client/i.test(action.message)) {
        isStartAudioForClient = true;
        result = "Старт работы аудио для клиента";
      }

      for (let element of array) {
        if (element.recordNumber > action.recordNumber) {
          if (/Start\s*playing\s*audio\.?\s*$/i.test(element.message)) {
            if (!isStartPlayAudio) {
              isStartPlayAudio = true;
              result += `<br/>Старт работы аудио`;
            }
          } else if (/Start\s*playing\s*for\s*Client/i.test(element.message)) {
            if (!isStartAudioForClient) {
              isStartAudioForClient = true;
              result += `<br/>Старт работы аудио для клиента`;
            }
          } else if (/Playing\s*audio\s*result/i.test(element.message)) {
            if (!isplayAudioResult) {
              isplayAudioResult = true;
              result += `<br/>Проигрывание результата аудио`;
            }
          } else if (/Stop\s*playing\s*for\s*Client/i.test(element.message)) {
            if (!isHaveStopWorkAudioForClient) {
              isHaveStopWorkAudioForClient = true;
              result += `<br/>Остановка работы аудио для клиента`;
            }
          } else if (/Start\s*playing\s*audio\s*for\s*Client/i.test(element.message)) {
            if (!isHaveAudioForClient) {
              isHaveAudioForClient = true;
              result += `<br/>Старт проигрывания аудио для клиента`;
            }
          } else if (/Stopping\s*file\s*playing\s*for\s*Client/i.test(element.message)) {
            if (!isHaveStopFileForClient) {
              isHaveStopFileForClient = true;
              result += `<br/>Остановка проигрывания файла для клиента`;
            }
          }
        }
      }

      return ["Статус работы аудио", result];
    }
  }, */
};

module.exports = parseMtAudio;
