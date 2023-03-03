// ПРОВЕРКИ СООБЩЕНИЙ ДЛЯ КОДА MtTransfer
const parseMtTransfer = {
  toResponsibleManager(action) {
    const params = action.param.match(/UserName:\s*([^,]+)/i);

    const userName = params ? params[1] : `<span>не удалось получить информацию, на кого переадресовали</span>`;

    return ["Статус звонка", `Переадресация на ответственного по сделке "<b>${userName}</b>"`];
  },
};

module.exports = parseMtTransfer;
