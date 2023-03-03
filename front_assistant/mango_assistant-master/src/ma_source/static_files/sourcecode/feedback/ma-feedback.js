function ma_openBpmRequest() {
  const requestForm = document.querySelector("div.b-request-form");

  const config = {
    childList: true,
  };

  // Создаем экземпляр наблюдателя с указанной функцией обратного вызова
  const observer = new MutationObserver(callback);

  // Начинаем наблюдение за настроенными изменениями целевого элемента
  observer.observe(requestForm, config);

  return observer;

  // Вспомогательные функции для ma_openBpmRequest
  function callback(mutationsList, observer) {
    try {
      for (let mutation of mutationsList) {
        if (mutation.type === "childList") {
          const requestStatusObject = mutation.target.querySelector("div.b-request-status");

          if (requestStatusObject) {
            const inputForm = mutation.target.querySelector("div.b-comment-form input[name=requestId]");

            if (inputForm) {
              const requestId = inputForm.value;

              if (document.querySelector(`button#ma-go-to-bpm-${requestId}`) === null) {
                const h5Element = mutation.target.querySelector("h5");

                if (h5Element) {
                  getButton(h5Element, requestId);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      logError(error);
    }
  }

  function getButton(h5Element, requestId) {
    MaRuntimeService.getEmail((response) => {
      const isRightEmail = /^[\w.]+@mangotele\.com$/i.test(response.data);

      const button = document.createElement("button");
      button.id = `ma-go-to-bpm-${requestId}`;
      button.setAttribute("style", "margin:0 0 0 10px");

      button.innerHTML = isRightEmail
        ? `<span style="font-size:10px">Перейти в BPM</span>`
        : `<span style="font-size:9px; color:red">Для перехода в BPM укажите раб. почту, нажав на иконку Манго Ассистента в правом верхнем углу браузера</span>`;

      button.onclick = function () {
        openPage(requestId);
      };

      if (!isRightEmail) {
        button.disabled = true;
      }

      h5Element.after(button);

      function openPage(requestId) {
        try {
          const url = `http://creatio/0/Nui/ViewModule.aspx#CardModule/CasePage/edit/${requestId}`;

          sendStats(requestId);

          window.open(url);
        } catch (error) {
          logError(error);
        }

        function sendStats(to) {
          const requestParams = {
            email: localStorage.mangoAssistantEmail,
            type: "lk_to_bpm",
            from: location.href.split("/").splice(3, 2).join("-"),
            to: to,
          };

          $.post(`${MA_WORK_NODE_URL}/add-statistic-bpm-action`, requestParams);
        }
      }
    });
  }

  function logError(error) {
    console.error("mango assistant error: ", error);
  }
}
