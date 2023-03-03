const maActiveSipView = {
  /**
   * Действия с общим блоком (этот блок содержит список "проблемных sip-номеров")
   */
  commonBlock: {
    setStatus: {
      loading() {
        const element = maActiveSipView._getElement({
          tag: "div",
          innerHtml: `<p style="font-size:8pt">Идет загрузка данных.<br/>Подождите, пожалуйста.</p>`,
        });

        maActiveSipView.commonBlock._changeActiveSipCheckButton(`<small style = "color:red">Идет получение активных SIP-номеров</small>`, true);
        maActiveSipView.commonBlock._changeActiveSipBlock([element, HTML_MANGO_ASSISTANT_LOADER]);
      },

      allIsGood() {
        const element = maActiveSipView._getElement({
          tag: "div",
          innerHtml: `<span><b>Все в порядке!</b></span>`,
        });

        maActiveSipView.commonBlock._changeActiveSipBlock([element]);
      },

      errorWhenGetSipList(error) {
        console.error(error);

        const element = maActiveSipView._getElement({
          tag: "div",
          innerHtml: `<p style="color:red">Не удалось получить информацию об активных SIP - номерах.</p>${maActiveSipView.errorMessage}`,
        });

        maActiveSipView.commonBlock._changeActiveSipBlock([element]);
        maActiveSipView.commonBlock._changeActiveSipCheckButton(`<span>Проверить активные SIP-номера</span>`, false);
      },
    },

    /**
     * Изменение элементов в общем блоке. Сначала он "очищается", затем в него помещаются указанные элементы
     * @param {Array} elements - элементы, которые необходимо поместить в общий блок
     */
    _changeActiveSipBlock(elements) {
      $(`#${mangoAssistData} div#contentOfCheckingActiveSIPBlock`).empty();

      elements.forEach((element) => {
        $(`#${mangoAssistData} div#contentOfCheckingActiveSIPBlock`).append(element);
      });
    },

    /**
     * Изменение кнопки получения информации о регистрации активных sip-номеров
     * @param {html} html - html - код, который будет помещение в кнопку
     * @param {*} isDisabled - нужно ли "деактивировать" кнопку
     */
    _changeActiveSipCheckButton(html, isDisabled) {
      $(`#${mangoAssistData} button#checkActiveSIPbutton`).html(html);

      if (isDisabled) {
        $(`#${mangoAssistData} button#checkActiveSIPbutton`).attr("disabled");
        return;
      }

      $(`#${mangoAssistData} button#checkActiveSIPbutton`).removeAttr("disabled");
    },

    /**
     * Отображение списка проблемных sip-номер после получения общей информации
     * @param {Array} incorrectFormatList - список sip-номеров с некорректным форматом
     * @param {*} registrationList - список sip-Номеров с "проблемной" регистрацией
     */
    setSipList(incorrectFormatList, registrationList) {
      maActiveSipView.commonBlock._changeActiveSipBlock([
        new MaIncorrectFormatBlock(incorrectFormatList).container,
        maActiveSipView.commonBlock._getBadSipRegistrationBlock(registrationList),
      ]);
      maActiveSipView.commonBlock._changeActiveSipCheckButton(`<span>Проверить активные SIP-номера</span>`, false);
    },

    /**
     * Получение html-блока с sip-номерами для проверки регистрации
     * @param {Array} registrationList - массив с sip-номерами для проверки регистрации
     */
    _getBadSipRegistrationBlock(registrationList) {
      // Создаем контейнер, куда поместим список активных sip-номеров для проверки
      const sipListContainer = maActiveSipView._getElement({
        tag: "div",
      });

      // Если нет активных sip-номеров без регистрации, то блок не создается
      if (registrationList.length > 0) {
        // Добавляем заголовок
        sipListContainer.append(
          maActiveSipView._getElement({
            tag: "span",
            innerHtml: `<span>Активные sip-номера для проверки:</span>`,
          })
        );

        registrationList.forEach((sip, index) => {
          sipListContainer.append(new MaBadSipBlock(index, sip).container);
        });
      }

      return sipListContainer;
    },
  },

  /**
   * Действия с блоком проверки одного sip-номера
   */
  badSipBlock: {
    setStaus: {
      loading(id, checkButton) {
        maActiveSipView.badSipBlock._changeActiveSipBlock(id, [HTML_MANGO_ASSISTANT_LOADER]);
        maActiveSipView.badSipBlock._changeActiveSipCheckButton(checkButton, `<small style="color:red">Подождите, идет проверка регистрации</small>`, true);
      },

      finish(id, result, checkButton, sip) {
        const element = maActiveSipView._getElement({
          tag: "div",
        });

        if (result.log) {
          element.append(new MaDownloadLogsBlock(result.log, sip).container);
        }

        messageContainer = result.log
          ? maActiveSipView._getElement({
              tag: "div",
              innerHtml: `<span>${result.message}</span>`,
            })
          : new MaEmptyLogDialog().container;

        element.append(messageContainer);

        maActiveSipView.badSipBlock._changeActiveSipBlock(id, [element]);
        maActiveSipView.badSipBlock._changeActiveSipCheckButton(checkButton, `<small>${sip}</small>`, false);
      },

      error(id, error, checkButton, sip) {
        console.error(error);

        const element = maActiveSipView._getElement({
          tag: "div",
          innerHtml: ` <p style="color:red">Не удалось получить информацию о данном активном sip-номере.</p>${maActiveSipView.errorMessage}`,
        });

        maActiveSipView.badSipBlock._changeActiveSipBlock(id, [element]);
        maActiveSipView.badSipBlock._changeActiveSipCheckButton(checkButton, `<small>${sip}</small>`, false);
      },
    },

    /**
     * Изменение блока проверки одного активного sip-номера. Сначала он "очищается", затем в него помещаются указанные элементы
     * @param {string} id - id блока
     * @param {Array} elements - html - элементы, которые нужно поместить в контейнер
     */
    _changeActiveSipBlock(id, elements) {
      $(`#${mangoAssistData} div#${id}`).empty();

      elements.forEach((element) => {
        $(`#${mangoAssistData} div#${id}`).append(element);
      });
    },

    /**
     * Изменение кнопки проверки регистрации активного sip-номера
     * @param {HTMLObjectElement} checkButton - html - элемент кнопки
     * @param {*} html - html - код, который будет помещен в кнопку
     * @param {*} isDisabled - нужно ли "деактивировать" кнопку
     */
    _changeActiveSipCheckButton(checkButton, html, isDisabled) {
      checkButton.innerHTML = html;
      checkButton.disabled = isDisabled;
    },
  },

  /**
   * Получение html-объекта
   * @param {Object} inputValue - Объект с входными данными (тэг, id и т.д.)
   */
  _getElement(inputValue) {
    const element = document.createElement(inputValue.tag || "div");
    element.id = inputValue.id || "";
    element.innerHTML = inputValue.innerHtml || "";
    element.style = inputValue.style || "";
    element.onclick = inputValue.onclick || null;

    if (inputValue.classList !== undefined) {
      inputValue.classList.forEach((newClass) => {
        element.classList.add(newClass);
      });
    }

    return element;
  },

  /**
   * Шаблон с текстом об ошибке
   */
  errorMessage: ` <p style="font-size:8pt;">Попробуйте перезагрузить страницу и заново произвести проверку.</p>
                  <p style="font-size:8pt;">Если это не помогло, просьба обратиться в группу Problem Management (pmotp@mangotele.com) отдела Тех. поддержки</p>`,
};
