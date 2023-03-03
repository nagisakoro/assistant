class MaRuntimeService {
  static setOnGetMessageCallback() {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.type === "mango-assistant-auth-status") {
        if (request.status === "valid") {
          MaViewService.setAvailable();
          MaViewService.setEmail(request.email);
          return;
        }
        MaViewService.setDisable();
      }
    });
  }

  static getEmail(callback) {
    chrome.runtime.sendMessage("gppkcbehohdfmcoiboinplapbnijcpac", { type: "mango-assistant-auth-email" }, function (response) {
      if (chrome.runtime.lastError) {
        setTimeout(MaRuntimeService.sendMessage.bind(null, data), 1000);
      } else {
        callback(response);
      }
    });
  }

  static checkEmail() {
    MaRuntimeService.getEmail((response) => {
      MaViewService.setEmail(response.data);
      AuthService.check();
    });
  }
}
