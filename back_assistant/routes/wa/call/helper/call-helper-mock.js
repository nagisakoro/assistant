const CallInterface = require("./call-interface");

class CallHelperMock extends CallInterface {
  constructor() {
    super();
  }

  sendResponseDetailLogs(contextId, callDate, membersInfo, fromCall, toCall) {
    return { status: "error" };
  }

  parseLogs(vatsDetailLogs, commonDetailLogs, contextId, fromCall, toCall, membersInfo) {}

  getTranslatedTable(commonDetailLogs, vatsDetailLogs, fromCall, toCall, contextId) {}

  parseMessageAboutAction(action, contextId, array, commonDetailLogs, currentRowNumber) {}

  getCallIsEndedRow(contextId, commonDetailLogs) {}

  getMessageOfRightCheck(checksMap, action, contextId, array, commonDetailLogs, currentRowNumber) {}
}

module.exports = new CallHelperMock();
