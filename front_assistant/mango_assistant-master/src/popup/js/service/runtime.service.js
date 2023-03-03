class RuntimeService {
  static sendAuthStatus() {
    const data = {
      type: "mango-assistant-auth-status",
      email: authInput.val(),
      status: Model.authStatus,
    };

    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (/.*:\/\/lk.mango-office.ru\//.test(tab.url)) {
          chrome.tabs.sendMessage(tab.id, data);
        }
      });
    });
  }
}
