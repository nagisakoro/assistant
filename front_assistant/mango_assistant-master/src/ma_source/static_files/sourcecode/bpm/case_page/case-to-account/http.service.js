class HttpService {
  static post(requestBody, bpmcsrfCookie) {
    return fetch(`http://${location.hostname}/0/DataService/json/SyncReply/SelectQuery`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        BPMCSRF: bpmcsrfCookie,
        Connection: "keep-alive",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  }
}
