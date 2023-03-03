setOnMessageCallback();

function setOnMessageCallback() {
  chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
    if (sender.origin === "https://lk.mango.ru") {
      if (message.type === "mango-assistant-auth-email") {
        const response = {
          data: LocalStorageService.getEmail(),
        };
        sendResponse(response);
      }
    }
  });
}
