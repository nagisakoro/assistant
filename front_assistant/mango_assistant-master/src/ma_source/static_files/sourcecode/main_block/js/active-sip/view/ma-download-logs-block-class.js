class MaDownloadLogsBlock {
  constructor(log, sip) {
    this.container = maActiveSipView._getElement({
      tag: "div",
    });

    const logsDiv = maActiveSipView._getElement({
      tag: "div",
      innerHtml: log,
      style: "display:none;",
    });

    const timeInterval = maActiveSipCommon.parseTimeForActive();

    const downloadLogsButton = maActiveSipView._getElement({
      tag: "button",
      innerHtml: `<span style="font-size:8pt">Скачать логи</span>
                    <br/>
                    <span style="font-size:8pt">Время: ${timeInterval}</span>
                    <br/>
                    <span style="font-size:8pt">Для просмотра можно использовать блокнот</span>`,
      style: "border:1px solid rgb(120, 100, 39, 0.65); border-radius: 3px; color: rgb(120, 100, 39, 0.65);",
      onclick: maActiveSipCommon.downloadFile.bind(null, logsDiv.innerText, `${"Номер_" + sip + ",Время_" + timeInterval}.txt`, "text/plain"),
      classList: ["button-of-mango-assistant"],
    });

    this.container.append(logsDiv);
    this.container.append(downloadLogsButton);
  }
}
