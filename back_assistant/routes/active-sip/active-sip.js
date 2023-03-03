const express = require("express");
const router = express.Router();
const environment = require("../../environment");
const RequesterHelper = require("../../requester/requester-helper");

/**
 * Счетчик количества принятых запросов по анализу звонка.
 */
let countActiveSipRequests = 0;
resetCountActiveSipRequest();

router.use(function (req, res, next) {
  console.log("active-sip");
  console.log("Time: ", Date.now());

  countActiveSipRequests++;
  console.log(`count of active sip requests: ${countActiveSipRequests}`);

  // Проверка на достижение максимального количества запросов по WebAdmin
  if (countActiveSipRequests > environment.MAX_NUMBER_OF_ACTIVE_LOG_REQUEST) {
    const message = `Превышено максимальное количество запросов к анализатору (${environment.MAX_NUMBER_OF_ACTIVE_LOG_REQUEST})!`;
    const result = RequesterHelper.getErrorBody(message);

    return res.json(result);
  }

  next();
});

router.use("/check", require("./check/check-router"));

/**
 * Обнуления счетчика запросов по анализатору через определенный промежуток.
 */
function resetCountActiveSipRequest() {
  setInterval(() => {
    countActiveSipRequests = 0;
  }, environment.REFRESH_ANALYZER_COUNT_TIME);
}

module.exports = router;
