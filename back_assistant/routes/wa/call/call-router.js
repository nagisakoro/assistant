const express = require("express");
const CallLogic = require("./call-logic");
const router = express.Router({ mergeParams: true });
const RequesterHelper = require("../../../requester/requester-helper");
const ParametersParser = require("./parameters-parser");

router.route("/").post(getData);

async function getData(req, res) {
  let body;
  try {
    console.log("getData");
    const parameters = ParametersParser.getParameters(JSON.parse(req.text));
    const callLogic = new CallLogic(parameters);
    const result = await callLogic.getData();
    body = RequesterHelper.getSuccessBody(result);
  } catch (error) {
    body = RequesterHelper.getErrorBody(error);
  }
  return res.json(body);
}

module.exports = router;
