const express = require("express");
const router = express.Router();
const environment = require("../../environment");
const RequesterHelper = require("../../requester/requester-helper");
const WaAuthHelper = require("../../wa_requester/wa-auth-helper");

/**
 * Счетчик количества принятых запросов по анализу звонка.
 */
let countLogsRequests = 0;
resetCountLogsCallRequest();

/**
 * Промежуток, через который обновляется авторизация в WebAdmin
 */
const TIME_REFRESH_AUTH = 21500000;
refreshWAAuthorize(TIME_REFRESH_AUTH);

router.use(function (req, res, next) {
  console.log("wa");
  console.log("Time: ", Date.now());

  countLogsRequests++;
  console.log(`count of logs: ${countLogsRequests}`);

  // Проверка на достижение максимального количества запросов по WebAdmin
  if (countLogsRequests > environment.MAX_NUMBER_OF_ANALYZE_REQUEST) {
    const message = `Превышено максимальное количество запросов к анализатору (${environment.MAX_NUMBER_OF_ANALYZE_REQUEST})!`;
    const result = RequesterHelper.getErrorBody(message);

    return res.json(result);
  }

  next();
});

router.use("/call", require("./call/call-router"));
router.use("/registration", require("./registration/registration-router"));
router.use("/lk", require("./lk/lk-router"));

/**
 * Обнуления счетчика запросов по анализатору через определенный промежуток.
 */
function resetCountLogsCallRequest() {
  setInterval(() => {
    countLogsRequests = 0;
  }, environment.REFRESH_ANALYZER_COUNT_TIME);
}

/**
 * Обновление авторизации в WebAdmin через определенный промежуток времени
 */
function refreshWAAuthorize(time) {
  setInterval(() => {
    WaAuthHelper.authorize();
  }, time);
}

module.exports = router;
