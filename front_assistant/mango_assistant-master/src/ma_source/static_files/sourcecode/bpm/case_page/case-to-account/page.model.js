class PageModel {
  static caseTable = {
    getBodyRow(data) {
      return data
        .map(
          (element, index) => `   
                                <tr data-index="${index}">
                                    <td class="case_table_upper_name">Номер</td>
                                    <td class="case_table_upper_name">Лицевой счет</td>
                                    <td class="case_table_upper_name">Сервис</td>
                                    <td class="case_table_upper_name">Тема</td>
                                    <td class="case_table_upper_name">Состояние</td>
                                    <td class="case_table_upper_name">Создал</td>
                                    <td class="case_table_upper_name">Происхождение</td>
                                </tr>
                                <tr data-index="${index}">
                                    <td class="case_table_upper_value">
                                        <a href="http://${location.hostname}/0/Nui/ViewModule.aspx#CardModuleV2/CasePage/edit/${element.Id}" target="_blank">${element.Number}</a>
                                    </td>
                                    <td class="case_table_upper_value">${PageModel.#parseUndefinedToEmptyString(element.StnAcc.displayValue)}</td>
                                    <td class="case_table_upper_value">${PageModel.#parseUndefinedToEmptyString(element.ServiceItem.displayValue)}</td>
                                    <td class="case_table_upper_value">${PageModel.#parseUndefinedToEmptyString(element.Subject)}</td>
                                    <td class="case_table_upper_value">${PageModel.#parseUndefinedToEmptyString(element.Status.displayValue)}</td>
                                    <td class="case_table_upper_value">${PageModel.#parseUndefinedToEmptyString(element.CreatedBy.displayValue)}</td>
                                    <td class="case_table_upper_value">${PageModel.#parseUndefinedToEmptyString(element.Origin.displayValue)}</td>
                                </tr>
                                <tr data-index="${index}">
                                    <td class="case_table_lower_name">Дата создания</td>
                                    <td class="case_table_lower_name"> </td>
                                    <td class="case_table_lower_name">Категория сервиса</td>
                                    <td class="case_table_lower_name">Описание</td>
                                    <td class="case_table_lower_name">Ответственный</td>
                                    <td class="case_table_lower_name" >Группа ответственных</td>
                                    <td class="case_table_lower_name">Категория</td>
                                </tr>
                                <tr data-index="${index}">
                                    <td class="td_white-space_pre case_table_lower_value">${PageModel.#getDateWithRightFormat(element.CreatedOn)}</td>
                                    <td class="case_table_lower_value"> </td>
                                    <td class="case_table_lower_value">${PageModel.#parseUndefinedToEmptyString(element.ServiceCategory.displayValue)}</td>
                                    <td class="case_table_lower_value">${PageModel.#parseUndefinedToEmptyString(element.Symptoms)}</td>
                                    <td class="case_table_lower_value">${PageModel.#parseUndefinedToEmptyString(element.Owner.displayValue)}</td>
                                    <td class="case_table_lower_value">${PageModel.#parseUndefinedToEmptyString(element.Group.displayValue)}</td>
                                    <td class="case_table_lower_value">${PageModel.#parseUndefinedToEmptyString(element.Category.displayValue)}</td>
                                </tr>
                            `
        )
        .join(" ");
    },
  };

  static lidTable = {
    getHeadRow() {
      return `
                    <tr>
                        <th>Дата создания</th>
                        <th>Тип потребности</th>
                        <th>Лид</th>
                        <th>Название контрагента</th>
                        <th>Стадия лида</th>
                        <th>Создал</th>
                        <th>Ответственный</th>
                        <th>Дата изменения</th>
                        <th>Заметки</th>
                    </tr>
                    `;
    },
    getBodyRow(data) {
      return data
        .map(
          (element) => `   
                                  <tr>
                                      <td>${PageModel.#parseUndefinedToEmptyString(element.CreatedOn)}</td>
                                      <td>${PageModel.#parseUndefinedToEmptyString(element.LeadType.displayValue)}</td>
                                      <td><a href="http://${location.hostname}/0/Nui/ViewModule.aspx#CardModuleV2/LeadPageV2/edit/${element.Id}" target="_blank">${
                                            element.LeadName
                                        }</a>
                                      </td>
                                      <td>${PageModel.#parseUndefinedToEmptyString(element.Account)}</td>
                                      <td>${PageModel.#parseUndefinedToEmptyString(element.QualifyStatus.displayValue)}</td>
                                      <td>${PageModel.#parseUndefinedToEmptyString(element.CreatedBy.displayValue)}</td>
                                      <td>${PageModel.#parseUndefinedToEmptyString(element.Owner.displayValue)}</td>
                                      <td>${PageModel.#getDateWithRightFormat(element.ModifiedOn)}</td>
                                      <td>${PageModel.#parseUndefinedToEmptyString(element.Notes)}</td>
                                  </tr>
                              `
        )
        .join(" ");
    },
  };

  static saleTable = {
    getHeadRow() {
      return `
                      <tr>
                          <th>Дата изменения</th>
                          <th>Дата создания</th>
                          <th>Тип потребности</th>
                          <th>Название</th>
                          <th>Стадия</th>
                          <th>Создал</th>
                          <th>Ответственный</th>
                          <th>Заметки</th>
                          <th>Дата закрытия</th>
                      </tr>
                      `;
    },
    getBodyRow(data) {
      return data
        .map(
          (element) => `   
                            <tr>
                                <td>${PageModel.#getDateWithRightFormat(element.ModifiedOn)}</td>
                                <td>${PageModel.#getDateWithRightFormat(element.CreatedOn)}</td>
                                <td>${PageModel.#parseUndefinedToEmptyString(element.LeadType.displayValue)}</td>
                                <td><a href="http://${location.hostname}/0/Nui/ViewModule.aspx#CardModuleV2/OpportunityPageV2/edit/${element.Id}" target="_blank">${
                                        element.Title
                                    }</a>
                                </td>
                                <td>${PageModel.#parseUndefinedToEmptyString(element.Stage.displayValue)}</td>
                                <td>${PageModel.#parseUndefinedToEmptyString(element.CreatedBy.displayValue)}</td>
                                <td>${PageModel.#parseUndefinedToEmptyString(element.Owner.displayValue)}</td>
                                <td>${PageModel.#parseUndefinedToEmptyString(element.Notes)}</td>         
                                <td>${PageModel.#parseUndefinedToEmptyString(element.DueDate)}</td>                         
                            </tr>
                        `
        )
        .join(" ");
    },
  };

  static getStyle() {
    return `<style> 
                    table {
                        width: 100%; 
                        border-collapse: collapse; 
                        border: 0;
                    }

                    th { 
                        text-align: center; 
                        background: #ccc; 
                        padding: 5px; 
                        border: 1px solid #d8d7d7; 
                        }
                    
                    td { 
                        padding: 5px; 
                        border: 1px solid #d8d7d7; 
                        }

                    input {
                        margin: 10px 0;
                    }

                    .td_white-space_pre {
                        white-space: pre;
                    }

                    .case_table_upper_name{
                        border-style: solid none none none;
                        font-size: 9pt;
                        color: grey;
                    }

                    .case_table_lower_name{
                        border: 0;
                        font-size: 9pt;
                        color: grey;
                    }

                    .case_table_upper_value{
                        border: 0;
                    }

                    .case_table_lower_value{
                        border-style: none none solid none;
                    }

                    table#case-table td {
                        overflow-y: auto;
                        max-width: 100px;
                        padding: 1px 5px;
                    }

                    button {
                        width: 50%;
                        margin: 5px 25%;                    
                    }
            </style>`;
  }

  static getJqueryScript() {
    return `    <script
                    src="https://code.jquery.com/jquery-3.5.1.min.js"
                    integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0="
                    crossorigin="anonymous">
                </script>`;
  }

  static getPageScripts() {
    return `
                <script>
                    function onCaseButtonClick(){
                        $("#lid-container").slideUp(1);
                        $("#sale-container").slideUp(1);
                        $("#case-container").slideDown(200);
                        $("#current-table-name").text("История обращений");
                    }
                    function onLidButtonClick(){
                        $("#sale-container").slideUp(1);
                        $("#case-container").slideUp(1);
                        $("#lid-container").slideDown(200);
                        $("#current-table-name").text("Лиды");
                    }
                    function onSaleButtonClick(){
                        $("#case-container").slideUp(1);
                        $("#lid-container").slideUp(1);
                        $("#sale-container").slideDown(200);
                        $("#current-table-name").text("Продажи");
                    }
                </script>

                <script>
                    function caseTableSearch() {
                        var phrase = document.getElementById('case-search-text');
                        var table = document.getElementById('case-table');
                        var regPhrase = new RegExp(phrase.value, 'i');
                        const displaySet = new Set();
                        for (var i = 0; i < table.rows.length; i++) {
                            for (var j = table.rows[i].cells.length - 1; j >= 0; j--) {
                                flag = regPhrase.test(table.rows[i].cells[j].innerHTML);
                                if (flag) {
                                    displaySet.add(table.rows[i].dataset.index)
                                };
                            }
                        }
                        for (var i = 0; i < table.rows.length; i++) {
                            if(displaySet.has(table.rows[i].dataset.index)){
                                table.rows[i].style.display = "";
                            } else {
                                table.rows[i].style.display = "none";
                            }
                        }
                    }
                    
                    function lidTableSearch() {
                        var phrase = document.getElementById('lid-search-text');
                        var table = document.getElementById('lid-table');
                        var regPhrase = new RegExp(phrase.value, 'i');
                        var flag = false;
                        for (var i = 1; i < table.rows.length; i++) {
                            flag = false;
                            for (var j = table.rows[i].cells.length - 1; j >= 0; j--) {
                                flag = regPhrase.test(table.rows[i].cells[j].innerHTML);
                                if (flag) break;
                            }
                            if (flag) {
                                table.rows[i].style.display = "";
                            } else {
                                table.rows[i].style.display = "none";
                            }
                    
                        }
                    }

                    function saleTableSearch() {
                        var phrase = document.getElementById('sale-search-text');
                        var table = document.getElementById('sale-table');
                        var regPhrase = new RegExp(phrase.value, 'i');
                        var flag = false;
                        for (var i = 1; i < table.rows.length; i++) {
                            flag = false;
                            for (var j = table.rows[i].cells.length - 1; j >= 0; j--) {
                                flag = regPhrase.test(table.rows[i].cells[j].innerHTML);
                                if (flag) break;
                            }
                            if (flag) {
                                table.rows[i].style.display = "";
                            } else {
                                table.rows[i].style.display = "none";
                            }
                    
                        }
                    }
                </script>`;
  }

  static #parseUndefinedToEmptyString(element) {
    return element || "";
  }

  static #getDateWithRightFormat(date) {
    const stringDate = PageModel.#parseUndefinedToEmptyString(date);

    if (stringDate.length) {
      const substrDate = stringDate.substring(0, stringDate.length - 7);
      const match = substrDate.match(/(\d{4})\-(\d{2})\-(\d{2})T(\d{2})\:(\d{2})/);
      if (match) {
        return `${match[3]}/${match[2]}/${match[1]}\n${match[4]}:${match[5]}`;
      }
    }
    return stringDate;
  }
}
