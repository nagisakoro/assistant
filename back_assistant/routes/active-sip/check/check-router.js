const express = require("express");
const CheckLogic = require("./check-logic");
const router = express.Router({ mergeParams: true });
const RequesterHelper = require("../../../requester/requester-helper");
const BodyParser = require("./body-parser");

router.route("/").post(getData);

async function getData(req, res) {
  let body;
  try {
    console.log("getData");
    const parameters = BodyParser.getParameters(req.body);
    const checkLogic = new CheckLogic(parameters);
    const result = await checkLogic.getData();
    body = RequesterHelper.getSuccessBody(result);
  } catch (error) {
    body = RequesterHelper.getErrorBody(error);
  }
  return res.json(body);
}

module.exports = router;
