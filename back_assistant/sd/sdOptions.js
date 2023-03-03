const environment = require("../environment");

var sdOptions = {
  /**
   * Создает JSON параметры для создания заявки
   * @return {string}
   */
  create_process: (description, accountNumber) => {
    const data = {
      operation: {
        details: {
          requester: "Mango Assistant", // Автор заявки
          subject: environment.SD_SUBJECT_STR + accountNumber,
          description: description,
          requesttype: "Сервис",
          impact: "Затрагивает подразделение",
          urgency: "Обычная",
          requesttemplate: "00 ЗАЯВКИ ОТП", //00 ЗАЯВКИ ОТП //Default Request
          priority: "Нормальный",
          group: "Группа Problem Management ОТП задачи",
          technician: "", // Специалист
          category: "02. Настройка услуг",
          subCategory: "",
          level: "Стандартный уровень",
          status: "Open",
          mode: "",
          createddate: "",
          //resolution: {
          //resolutiontext: 'лог переписки из чата',
          //},
          service: "Phone Call",
        },
      },
    };
    return JSON.stringify(data);
  },
};

module.exports = sdOptions;
