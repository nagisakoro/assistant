const express = require("express");
const app = express();
const helmet = require("helmet"); // TODO Разобраться, какую защиту обеспечивает helmet: Helmet helps you secure your Express apps by setting various HTTP headers.
const cors = require("cors");
const bodyParser = require("body-parser");
const sdHelper = require("./sd/sdHelper");
const dbHelper = require("./db/dbHelper");
const wa = require("./routes/wa/wa");
const activeSip = require("./routes/active-sip/active-sip");
const logger = require("./logger"); // Подключаем логгирование
const callbackOtpHelper = require("./callback_otp/callbackOtpHelper");
const index = require("./routes/index");

cors.SupportsCredentials = true;

// Подключение jQuery
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = new JSDOM("").window;
global.document = document;
const $ = (jQuery = require("jquery")(window));

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false, limit: "20mb" }));

app.set("views", "./views"); // TODO Доработать, пока views не работают

app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://lk.mango-office.ru");
  res.header("Access-Control-Allow-Methods", "POST, GET");

  next();
});

app.use(function (req, res, next) {
  if (req.is("text/*")) {
    req.text = "";
    req.setEncoding("utf8");
    req.on("data", function (chunk) {
      req.text += chunk;
    });
    req.on("end", next);
  } else {
    next();
  }
});

app.post("/create-sd-request", cors(), (req, res) => {
  console.log("start process of creating request");
  const numberOfAccount = req.body.accountNumber;
  const responseCreatingSD = sdHelper.createProcess(req.body.description, numberOfAccount);
  responseCreatingSD.then((responseData) => {
    const rDataJson = JSON.parse(responseData);
    if (
      rDataJson.hasOwnProperty("operation") &&
      rDataJson.operation.hasOwnProperty("result") &&
      rDataJson.operation.result.hasOwnProperty("status") &&
      rDataJson.operation.result.status === "Success"
    ) {
      const responseOk = {
        status: "done",
        numberOfRequest: rDataJson.operation.Details.WORKORDERID,
      };
      res.json(responseOk);
      console.log(`creating request ${responseOk.numberOfRequest} is done! Account ${numberOfAccount}`);
    } else {
      logger.error({
        message: `Ошибка при создании запроса в SD! Account: ${numberOfAccount}`,
        date: logger.getMoscowDate(),
      });

      const responseNotOk = {
        status: "error",
        numberOfRequest: "none",
      };

      res.json(responseNotOk);
    }
  });
});

app.post("/getting-html-analyze-active-sip", cors(), (req, res) => {
  console.log("start process of analyzing active sip");

  $.ajax({
    type: "GET",
    url: `http://192.168.2.153/dashboard/pages/sipuac_logs/get.php?s=${req.body.sipUac}`,
    timeout: 55000,
  })
    .done(function (respGetData) {
      const responseOk = {
        statusOfMessage: "OK",
        data: respGetData,
      };
      res.json(responseOk);
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      const responseNotOk = {
        statusOfMessage: "ERROR",
        data: null,
      };
      res.json(responseNotOk);
    });
});

app.post("/create-callback-otp", cors(), (req, res) => {
  console.log("start process of creating callback otp");
  callbackOtpHelper["callbackOtpHelper"].createCallback(req, res);
});

app.post("/add-statistic-action", cors(), (req, res) => {
  dbHelper["dbHelper"].insertString(req, res);
});

app.post("/add-statistic-bpm-action", cors(), (req, res) => {
  dbHelper["dbHelper"].insertStringBpm(req, res);
});

app.post("/add-statistic-bpm-otp-action", cors(), (req, res) => {
  dbHelper["dbHelper"].insertStringBpmOtp(req, res);
});

app.use("/wa", cors(), wa);
// Меняю logs на wa, оставил logs как временное решение (так как обновление манго ассистента произойдет не сразу)
app.use("/logs", cors(), wa);

app.use("/active-sip", activeSip);

app.use("/index", index);

module.exports = app;
