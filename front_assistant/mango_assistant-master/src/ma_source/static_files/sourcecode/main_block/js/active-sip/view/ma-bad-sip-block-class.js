class MaBadSipBlock {
  constructor(index, sip) {
    this.container = maActiveSipView._getElement({
      tag: "div",
    });

    const sipBlock = maActiveSipView._getElement({
      tag: "div",
      style: "display:none;",
      id: `ma-bad-sip-block-${index}`,
    });

    const resultBlock = maActiveSipView._getElement({
      tag: "div",
      id: `ma-bad-sip-result-${index}`,
      style: "display:flex; flex-direction: column;",
    });

    const toggleButton = maActiveSipView._getElement({
      tag: "button",
      id: `ma-bad-sip-toggle-button-${index}`,
      innerHtml: `Свернуть`,
      onclick: function () {
        toggleBlock(`#${mangoAssistData} div#${resultBlock.id}`, `#${mangoAssistData} button#${toggleButton.id}`);
      },
      classList: ["button-of-mango-assistant"],
    });

    const checkButton = maActiveSipView._getElement({
      tag: "button",
      innerHtml: `<small>${sip}</small>`,
      classList: ["button-of-mango-assistant"],
      onclick: function () {
        this.disabled = true;
        $(`#${mangoAssistData} div#${sipBlock.id}`).slideDown(200);
        $(`#${mangoAssistData} div#${resultBlock.id}`).slideDown(200);
        toggleButton.innerHTML = `Свернуть`;
        maActiveSipView.badSipBlock.setStaus.loading(resultBlock.id, checkButton);
        maActiveSipHttp.getBadSipRegistrationInfo(resultBlock.id, sip, checkButton);
      },
    });

    sipBlock.append(toggleButton);
    sipBlock.append(resultBlock);

    this.container.append(checkButton);
    this.container.append(sipBlock);
  }
}
