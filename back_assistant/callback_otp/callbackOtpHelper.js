const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const TIMEOUT = 15000;

const callbackOtpHelper = {
  createCallback: function (req, res) {
    try {
      const number = req.body.number;
      const url1 = "https://widgets.mango-office.ru/widget/order-call/MTAwMTAzNzI=?callback=myfunc&number=" + number + "&dateStart=0";
      const url2 = "https://widgets.mango-office.ru/widget/order-call/MTAwMDI2OTU=?callback=myfunc&number=" + number + "&dateStart=0";

      const callback1 = getXMLRequest(url1, errorCallback1, res);
      callback1.send();

      function errorCallback1() {
        const callback2 = getXMLRequest(url2, sendErrorResponse.bind(null, res, "failRequest"), res);
        callback2.send();
      }
    } catch (err) {
      console.log(err);
      sendErrorResponse(res, "tryCatchError");
    }

    function sendErrorResponse(res, status) {
      const errorObj = { status: status };
      res.json(errorObj);
    }

    function getXMLRequest(urlRequest, errorCallback, res) {
      const xmlRequest = new XMLHttpRequest();
      xmlRequest.open("GET", urlRequest, true);
      xmlRequest.timeout = TIMEOUT;

      xmlRequest.onreadystatechange = function () {
        if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
          if (/\"state\"\:\"ok\"/i.test(xmlRequest.responseText)) {
            const successObj = { status: "success" };
            res.json(successObj);
          } else {
            errorCallback();
          }
        }
      };

      xmlRequest.onerror = function () {
        errorCallback();
      };

      xmlRequest.ontimeout = function () {
        errorCallback();
      };

      return xmlRequest;
    }
  },
};

module.exports = {
  callbackOtpHelper,
};
