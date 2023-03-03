class AuthService {
  static check(value, callbackNumber) {
    if (/^[\w.]+@mangotele\.com$/i.test(value)) {
      LocalStorageService.setEmail(value);
      AuthService.#setStatus(Model.status.auth.valid, callbackNumber);
      return;
    }
    AuthService.#setStatus(Model.status.auth.invalid, callbackNumber);
  }

  static #setStatus(status, callbackNumber) {
    Model.authStatus = status;
    View.auth.refresh();
    CallbackService.check(callbackNumber);
    RuntimeService.sendAuthStatus();
  }
}
