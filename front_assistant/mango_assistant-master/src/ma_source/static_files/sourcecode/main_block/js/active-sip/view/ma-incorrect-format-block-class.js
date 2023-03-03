class MaIncorrectFormatBlock {
  constructor(incorrectFormatList) {
    this.container = maActiveSipView._getElement({
      tag: "div",
    });

    if (incorrectFormatList.length > 0) {
      const incorrectSipListDiv = maActiveSipView._getElement({
        tag: "div",
        id: "ma-incorrect-sip-list-div",
        innerHtml: getIncorrectSipListHtml(incorrectFormatList),
        style: "display:none",
        classList: ["mangoAssistantBlock"],
      });

      const toggleButton = maActiveSipView._getElement({
        tag: "button",
        innerHtml: `<small style="color:red">Активные sip-номера<br/>с некорректным форматом</small>`,
        classList: ["button-of-mango-assistant"],
        onclick: function () {
          toggleBlock(`div#${incorrectSipListDiv.id}`);
        },
      });

      this.container.append(toggleButton);
      this.container.append(incorrectSipListDiv);
    }

    function getIncorrectSipListHtml(incorrectFormatList) {
      let incorrectSipListHtml = "<ol>";
      incorrectFormatList.forEach((element) => {
        incorrectSipListHtml += `<li >${element}</li>`;
      });
      incorrectSipListHtml += "</ol>";
      return incorrectSipListHtml;
    }
  }
}
