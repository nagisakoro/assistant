const analyzerModel = require("../analyzer-model");
const analyzerCommonFunc = require("../analyzer-common-func");

// ПРОВЕРКИ СООБЩЕНИЙ ДЛЯ КОДА MtNotAvailable
const parseMtNotAvailable = {
  autosecretaryIsAllowed() {
    return [`Статус услуги "Автосекретарь"`, `Использование данной услуги <b style="color:green">разрешено</b>`];
  },
  runAutoSecretaryNAHandling() {
    return [`Статус работы "Автосекретаря"`, `Запуск "Автосекретаря"`];
  },
  playBlodWithId(action, contextId, array) {
    let result = "<p>Проигрывание мелодии</p>";

    for (let i = action.recordNumber; i < array.length; i++) {
      if (/^\s*Voice audio is done\s*$/i.test(array[i].message) || /^\s*Playing audio result\s*$/i.test(array[i].message)) {
        result += analyzerCommonFunc.getDuration(action, array[i]);
        break;
      } else if (/Play blod with id: *\\d+/i.test(array[i].message) || (i > action.recordNumber + 1 && /Start playing audio for Client/i.test(array[i].message))) {
        break;
      }
    }

    return [`Статус работы "Автосекретаря"`, result];
  },
  startVoiceMail(action) {
    let result = `<p>Отправка голосовой почты</p>`;
    const params = action.message.match(/Start voice mail with email:\s*(.+)\s*$/i);

    const address = params ? params[1] : "Не удалось получить информацию";

    result += `<p>Получатель: ${address}</p>`;

    return ["Статус звонка", result];
  },
  endCallRunNextIVRAction() {
    return [`Статус работы "Автосекретаря"`, `Завершение работы "Автосекретаря" либо запуск следующего действия IVR`];
  },
  redirectToGroupWithId(action, contextId, array) {
    const params = action.message.match(/Redirect to group with id: (\d+)/i);

    if (params) {
      const groupId = params[1];

      const result = getTransferToGroupString(action, groupId, contextId, array, true);

      if (result) {
        analyzerModel.webAdminData[`${contextId}`].redirectToGroupAutosecretary.add(groupId);
        return [`Статус работы "Автосекретаря"`, result];
      }
    }
  },
  redirectAtGroup(action, contextId, array) {
    const params = action.param.match(/GroupId:\s*(\d+)/i);

    if (params) {
      const groupId = params[1];

      const result = getTransferToGroupString(action, groupId, contextId, array, false);

      analyzerModel.webAdminData[`${contextId}`].redirectToGroupAutosecretary.delete(groupId);

      if (result) {
        return [`Статус работы "Автосекретаря"`, result];
      }
    }
  },
};

// Вспомогательные функции для parseMtNotAvailable
function getTransferToGroupString(action, groupId, contextId, array) {
  if (!analyzerModel.webAdminData[`${contextId}`].redirectToGroupAutosecretary.has(groupId)) {
    for (let i = action.recordNumber; i < array.length; i++) {
      if (array[i].message.match(/GroupSettings loaded/i)) {
        let groupSettingsId = array[i].param.match(/GroupId:\s*(\d+)[, ]/i);
        let groupSettingsName = array[i].param.match(/GroupName:\s*([^,]+)/i);

        if (groupSettingsId && groupSettingsName) {
          if (groupId === groupSettingsId[1]) {
            return `Перевод на группу <b>${groupSettingsName[1]}</b>`;
          }
        }
      }
    }
  }
  return null;
}

module.exports = parseMtNotAvailable;
