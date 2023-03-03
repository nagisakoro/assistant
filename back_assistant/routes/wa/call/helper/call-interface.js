class CallInterface {
  constructor() {
    if (!(this.sendResponseDetailLogs && this.parseLogs && this.getTranslatedTable && this.parseMessageAboutAction && this.getCallIsEndedRow && this.getMessageOfRightCheck)) {
      throw new Error("callHelper must have items!");
    }
  }
}

module.exports = CallInterface;
