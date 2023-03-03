const winston = require("winston"); // Подключаем логгирование

const logger = winston.createLogger({
  level: "error",
  format: winston.format.json(),
  defaultMeta: { service: "work_node" },
  transports: [new winston.transports.Console({ level: "error" }), new winston.transports.File({ filename: "error.log", level: "error" })],
});

/**
 * Получение времени по москве
 */
logger.getMoscowDate = function () {
  let date = new Date();
  date.setHours(date.getHours() + 3);

  return date;
};

module.exports = logger;
