const Model = {
  status: Object.freeze({
    auth: Object.freeze({
      valid: "valid",
      invalid: "invalid",
    }),
    callback: Object.freeze({
      valid: "valid",
      invalid: "invalid",
      start: "start",
      finish: "finish",
      error: "error",
    }),
  }),
};

Model.authStatus = Model.status.auth.invalid;
Model.callbackStatus = Model.status.callback.invalid;
Model.lastCallbackNumber = "";
