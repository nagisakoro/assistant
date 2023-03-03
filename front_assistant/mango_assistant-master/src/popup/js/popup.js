onStart();

function onStart() {
  maSetMaskCallbackNumber();
  fillEmailInput();
  setCallbacks();

  authInput.triggerHandler("input");
}

function fillEmailInput() {
  authInput.val(LocalStorageService.getEmail());
}

function setCallbacks() {
  authInput.on("input", onInputAuth);
  callbackInput.on("input", onInputCallback);
  callbackButton.on("click", onButtonCallback);
}

function onInputAuth(elem) {
  AuthService.check(elem.target.value, callbackInput.val());
}

function onInputCallback(elem) {
  CallbackService.check(elem.target.value);
}

function onButtonCallback(elem) {
  CallbackService.createCallback(callbackInput.val());
}
