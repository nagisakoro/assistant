class PageService {
  static #typesOfTable = Object.freeze({
    case: "case",
    lid: "lid",
    sale: "sale",
  });

  static getHtml(data, caseAccountName) {
    return `    
                ${PageModel.getJqueryScript()}
                ${PageModel.getStyle()}
                <title>История обращений контрагента</title>
                <h3>История обращений контрагента "${caseAccountName}" на ${Date()}</h3>
                ${PageService.#getToggleButtons()}
                ${PageService.#getCurrentTableNameBlock()}
                ${PageService.#getCaseTable(data)}
                ${PageService.#getLidTable(data)}
                ${PageService.#getSaleTable(data)}
                ${PageModel.getPageScripts()}
            `;
  }

  static #getCurrentTableNameBlock() {
    return `<h4 style="text-align: center;">Текущая таблица <span id="current-table-name">История обращений</span></h4>`;
  }

  static #getToggleButtons() {
    return `
            <div style="margin: 0 auto;display:flex;justify-content: space-around;flex-direction:row;width: 50%;">
              <button onclick="onCaseButtonClick()">История обращений</button>
              <button onclick="onLidButtonClick()">Лиды</button>
              <button onclick="onSaleButtonClick()">Продажи</button>
            </div>
            `;
  }

  static #getCaseTable(data) {
    const tableData = PageService.#getTableData(data, PageService.#typesOfTable.case);

    if (tableData) {
      return `  
                <div id="case-container">
                    <input type="text" placeholder="Фильтр" id="case-search-text" onkeyup="caseTableSearch()"/>
                    <table id="case-table">${PageModel.caseTable.getBodyRow(tableData)}</table>
                </div>
                `;
    }

    return "";
  }

  static #getLidTable(data) {
    const tableData = PageService.#getTableData(data, PageService.#typesOfTable.lid);

    if (tableData) {
      return `  
                <div id="lid-container" style="display:none">
                    <input type="text" placeholder="Фильтр" id="lid-search-text" onkeyup="lidTableSearch()"/>
                    <table id="lid-table">
                        ${PageModel.lidTable.getHeadRow()}
                        ${PageModel.lidTable.getBodyRow(tableData)}
                    </table>
                </div>
                `;
    }

    return "";
  }

  static #getSaleTable(data) {
    const tableData = PageService.#getTableData(data, PageService.#typesOfTable.sale);

    if (tableData) {
      return `  
                <div id="sale-container" style="display:none">
                    <input type="text" placeholder="Фильтр" id="sale-search-text" onkeyup="saleTableSearch()"/>
                    <table id="sale-table">
                        ${PageModel.saleTable.getHeadRow()}
                        ${PageModel.saleTable.getBodyRow(tableData)}
                    </table>
                </div>
                `;
    }

    return "";
  }

  static #getTableData(data, tableType) {
    const checkProperty = tableType === PageService.#typesOfTable.case ? "Number" : tableType === PageService.#typesOfTable.lid ? "LeadName" : "Title";

    return data.find((element) => {
      if (element.length && element[0].hasOwnProperty(checkProperty)) {
        return true;
      }
    });
  }
}
