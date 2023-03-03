class CaseToAccountButton {
  constructor() {
    this.init();
  }

  init() {
    const MA_INNER_BUTTON_HTML = `<span style="font-size:10px">История обращений</span>`;

    getParameters()
      .then(addButton)
      .catch((error) => {
        console.error(error);
      });

    function getParameters() {
      return new Promise((resolve) => {
        const accountlabelSelector = `#CasePageCaseAccountContainer_Label`;
        let tryCount = 0;

        const changeAccountLabelinterval = setInterval(() => {
          try {
            const labelObject = document.querySelector(accountlabelSelector);

            if (labelObject) {
              clearInterval(changeAccountLabelinterval);
              return resolve({ labelObject: labelObject });
            } else {
              tryCount++;
            }

            if (tryCount >= 12) {
              clearInterval(changeAccountLabelinterval);
            }
          } catch (error) {
            console.error("error: ", error);
            clearInterval(changeAccountLabelinterval);
          }
        }, 1200);
      });
    }

    function addButton(params) {
      if ($(`button#ma-case-to-account-button`).length) {
        return;
      }

      const button = document.createElement("button");
      button.id = "ma-case-to-account-button";
      button.innerHTML = MA_INNER_BUTTON_HTML;
      button.onclick = onButtonClick;

      params.labelObject.append(button);
    }

    function onButtonClick(event) {
      event.preventDefault();
      try {
        const hrefCaseAccountSelector = `#CasePageCaseAccountLookupEdit-link-el`;
        const hrefCaseAccountObject = document.querySelector(hrefCaseAccountSelector);
        if (hrefCaseAccountObject) {
          const caseAccountMatch = hrefCaseAccountObject.href.match(/edit\/(.+)/);
          if (caseAccountMatch) {
            const caseAccountId = caseAccountMatch[1];
            const requestBodies = {
              case: RequestBodyService.getAccountCases(caseAccountId),
              lid: RequestBodyService.getAccountLids(caseAccountId),
              sale: RequestBodyService.getAccountSale(caseAccountId),
            };
            openAccountInfoPage(requestBodies, caseAccountId, hrefCaseAccountObject.innerText);
          }
        }
      } catch (error) {
        console.error("error: ", error);
      }
    }

    function openAccountInfoPage(requestBodies, caseAccountId, caseAccountName) {
      const bpmcsrfCookie = CookieService.get("BPMCSRF");
      if (bpmcsrfCookie) {
        Promise.all([HttpService.post(requestBodies.case, bpmcsrfCookie), HttpService.post(requestBodies.lid, bpmcsrfCookie), HttpService.post(requestBodies.sale, bpmcsrfCookie)])
          .then((responses) => {
            const result = responses.map(function (resp) {
              return resp.json();
            });
            return result;
          })
          .then((data) => {
            Promise.all(data).then((tableData) => {
              const parseData = parseTableData(tableData);
              buildHtmlPage(parseData, caseAccountId, caseAccountName, bpmcsrfCookie);
            });
          });
      }
    }

    function parseTableData(data) {
      return data.map((element) => {
        return element.rows && element.rows.length ? element.rows.sort(compare) : [];
      });

      function compare(a, b) {
        if (a.CreatedOn < b.CreatedOn) {
          return 1;
        }
        if (a.CreatedOn > b.CreatedOn) {
          return -1;
        }
        return 0;
      }
    }

    function buildHtmlPage(data, caseAccountId, caseAccountName, bpmcsrfCookie) {
      const html = PageService.getHtml(data, caseAccountName);

      const newPage = window.open("about:blank", "История обращений контрагента");

      newPage.document.open();
      newPage.document.write(html);
      newPage.document.close();

      // Отправка статистики
      const caseId = location.href.split("/")[8];
      const statusRequestBody = RequestBodyService.getStatus(caseId);

      HttpService.post(statusRequestBody, bpmcsrfCookie)
        .then((response) => response.json())
        .then((data) => {
          try {
            let status = "Новое";
            if (data.rows.length) {
              status = data.rows[data.rows.length - 1].Status.displayValue;
            }
            StatisticService.send("bpm_case_to_account", caseId, caseAccountId, status);
          } catch (error) {
            console.error(error);
          }
        });
    }
  }
}
