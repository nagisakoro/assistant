const maAnalyzerViewDumpDialog = {
  uac: "User-agent",

  _getResultBlock(question, yesCallback, noCallBack) {
    const resultDiv = document.createElement("div");

    resultDiv.append(this._getQuestionElement(question));
    resultDiv.append(this._getDialogElement(yesCallback.bind(null, resultDiv), noCallBack.bind(null, resultDiv)));

    return resultDiv;
  },

  _getDialogElement(callbackYes = null, callbackNo = null) {
    const dialogElement = document.createElement("div");
    dialogElement.style.display = "flex";
    dialogElement.style.flexDirection = "row";

    const yesButtonElement = this._getButtonElement("Да", callbackYes);
    const noButtonElement = this._getButtonElement("Нет", callbackNo);

    dialogElement.append(yesButtonElement);
    dialogElement.append(noButtonElement);

    return dialogElement;
  },

  _getButtonElement(innerText, callback) {
    const buttonElement = document.createElement("button");
    buttonElement.innerText = innerText;
    buttonElement.onclick = callback;

    return buttonElement;
  },

  _getQuestionElement(question) {
    const questionElement = document.createElement("p");
    questionElement.innerHTML = `<span>Вопрос:</span>
                                <br/>
                                <span>${question}</span>`;

    return questionElement;
  },

  ClientBadSound: {
    get resultBlock() {
      return maAnalyzerViewDumpDialog._getResultBlock(`Вы (клиент) плохо слышите?`, this._yesCallback, this._noCallBack);
    },

    _yesCallback(resultDiv) {
      resultDiv.innerHTML = ` <p>Технических проблем в звонке не обнаружено.</p>
                              <p>Голос такого качества приходит на сервера Манго от собеседника и без изменений отправляется Вам.</p>
                              <p>Если вам слышно тихо - рекомендуем повысить громкость гарнитуры или на sip устройстве.</p>
                              <p>В случае, если беспроводная трубка - подойти ближе к базе.</p>`;
    },

    _noCallBack(resultDiv) {
      resultDiv.innerHTML = "";
      resultDiv.append(maAnalyzerViewDumpDialog.CompanionBadSound.resultBlock);
    },
  },

  CompanionBadSound: {
    get resultBlock() {
      return maAnalyzerViewDumpDialog._getResultBlock(`Вас (собеседник) плохо слышит?`, this._yesCallback, this._noCallBack);
    },

    _yesCallback(resultDiv) {
      resultDiv.innerHTML = maAnalyzerViewDumpDialog.CompanionBadSound._getInstructionsToUac(maAnalyzerViewDumpDialog.uac);
    },

    _noCallBack(resultDiv) {
      resultDiv.innerHTML = ` <p>Технических проблем в звонке не обнаружено.</p>
                              <p>Рекомендации - перезагрузить роутер, "${maAnalyzerViewDumpDialog.uac}", переподключить гарнитуру (если имеется).</p>`;
    },

    _getInstructionsToUac(uac) {
      const result = `<p>Необходимо рекомендовать клиенту выполнить действия описанные в инструкции. Устройство клиента "${uac}"</p>`;

      if (uac === "User-agent"){
        return `${result}
        <p><a href="https://www.mango-office.ru/support/tekhnicheskaya_podderzhka/tipovye_problemy/nastroyka_ustroystva_vvoda_vyvoda_zvuka_dlya_povysheniya_kachestva_peredavaemogo_golosa_v_prilozheni/" target="_blank">Для десктопных приложений (Контакт-Центр, Манго Толкер)</a></p>
        <p><a href="https://www.mango-office.ru/support/tekhnicheskaya_podderzhka/tipovye_problemy/kachestvo_svyazi_mango_talker_na_smartfonakh/?sphrase_id=575754" target="_blank">Для Mango Talker на смартфонах</a></p>
        <p><a href="https://www.mango-office.ru/support/tekhnicheskaya_podderzhka/tipovye_problemy/plokhoe_kachestvo_svyazi_u_sip_ustroystv/?sphrase_id=575754" target="_blank">Для SIP-телефонов</a></p>`;
      }
      if (/CallCenter/i.test(uac) || /M.TALKER.*\d+\.\d+\.\d+/i.test(uac)) {
        return `${result}
                <p><a href="https://www.mango-office.ru/support/tekhnicheskaya_podderzhka/tipovye_problemy/nastroyka_ustroystva_vvoda_vyvoda_zvuka_dlya_povysheniya_kachestva_peredavaemogo_golosa_v_prilozheni/" target="_blank">Для десктопных приложений (Контакт-Центр, Манго Толкер)</a></p>`;
      }
      if (/M.TALKER\s+.+/i.test(uac)) {
        return `${result}
                <p><a href="https://www.mango-office.ru/support/tekhnicheskaya_podderzhka/tipovye_problemy/kachestvo_svyazi_mango_talker_na_smartfonakh/?sphrase_id=575754" target="_blank">Для Mango Talker на смартфонах</a></p>`;
      }

      return `${result}
              <p><a href="https://www.mango-office.ru/support/tekhnicheskaya_podderzhka/tipovye_problemy/plokhoe_kachestvo_svyazi_u_sip_ustroystv/?sphrase_id=575754" target="_blank">Для SIP-телефонов</a></p>`;
    },
  },
};
