const express = require("express");
const RegistrationLogic = require("./registration-logic");
const router = express.Router({ mergeParams: true });
const RequesterHelper = require("../../../requester/requester-helper");

router.route("/").get(getData);

async function getData(req, res) {
  let body;
  try {
    console.log("getData");
    const registrationLogic = new RegistrationLogic(req.query.login, req.query.domain);

    const result = await registrationLogic.getData();
    body = RequesterHelper.getSuccessBody(result);
  } catch (error) {
    body = RequesterHelper.getErrorBody(error);
  }
  return res.json(body);
}

module.exports = router;
