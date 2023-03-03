const analyzerCommonFunc = require("../analyzer-common-func");

// ПРОВЕРКИ СООБЩЕНИЙ ДЛЯ КОДА MtVoiceRecord
const parseMtVoiceRecord = {
  voiceRecordHasStarted(action, contextId, array) {
    let result = `<p><b>Старт записи голосового сообщения, время:</b> ${action.actionTime}</p>`;

    for (let i = action.recordNumber; i < array.length; i++) {
      if (/File has saved/i.test(array[i].message)) {
        result += `<p>Файл с голосовым сообщением сохранен</p>`;
      } else if (/\s*Voice record has been stopped\s*/i.test(array[i].message)) {
        result += `<p><b>Завершение записи голосового сообщения, время:</b> ${array[i].actionTime}</p>`;

        result += analyzerCommonFunc.getDuration(action, array[i]);
        break;
      }
    }

    return ["Статус звонка", result];
  },
};

module.exports = parseMtVoiceRecord;
