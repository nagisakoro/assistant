class ParametersParser {
  /**
   * Получение параметров запроса
   * @param {Request} req
   */
  getParameters(requestObject) {
    const parameters = {
      contextId: requestObject.contextId || null,
      dateResponse: requestObject.dateResponse || null,
      membersInfo: requestObject.membersInfo || null,
      fromCall: requestObject.fromCall || "",
      toCall: requestObject.toCall || null,
    };

    return parameters;
  }
}

module.exports = new ParametersParser();
