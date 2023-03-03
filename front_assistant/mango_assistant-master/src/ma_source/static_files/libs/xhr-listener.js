/** прослушивает xhr запросы */
class XHRListener {
  static overrideSend(callback) {
    var oldSend, i;
    if (XMLHttpRequest.callbacks) {
      XMLHttpRequest.callbacks.push(callback);
    } else {
      XMLHttpRequest.callbacks = [callback];
      oldSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.send = function () {
        for (i = 0; i < XMLHttpRequest.callbacks.length; i++) {
          XMLHttpRequest.callbacks[i](this);
        }
        oldSend.apply(this, arguments);
      };
    }
  }

  /**
   * @param {any} urlPattern regexp для урла
   * @param {function} callback колбэк функция
   */
  static on(urlPattern, callback) {
    this.overrideSend((xhr) => {
      const temp = xhr.onload;
      xhr.onload = function () {
        if (temp) {
          temp.apply(this, arguments);
        }
        if (!urlPattern.test(xhr.responseURL)) return;

        const url = xhr.responseURL;
        const text = xhr.responseText;

        let json;
        try {
          json = JSON.parse(text);
        } catch (error) {}
        callback({
          url,
          text,
          json,
        });
      };
    });
  }
}
