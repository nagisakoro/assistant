const CallInterface = require("./call-interface");
const analyzerModel = require("../common/analyzer-model");
const analyzerCommonFunc = require("../common/analyzer-common-func");
const analyzerParserRules = require("../common/analyzer-parser-rules");
const WaCommon = require("../../../../wa_requester/wa-common");
const WaRequesterHelper = require("../../../../wa_requester/wa-requester-helper");

class CallHelperProd extends CallInterface {
  constructor() {
    super();
  }

  sendResponseDetailLogs(contextId, callDate, membersInfo, fromCall, toCall) {
    const that = this;
    const VATS_COMMON_LOGS_URL = `http://webadmin.mango.local:8088/wa/SSWAController?module=SoftplatformCdrs&action=list&waModelIdList=20`;
    const VATS_DETAIL_LOGS_URL = `http://webadmin.mango.local:8088/wa/SSWAController?module=VatsDetailLogs&action=list&waModelIdList=20`;

    let partsOfLogs = null;
    let stepOfDownloadLogs = 0;
    let vatsLogsData = new Array();
    let commonLogsData = null;

    analyzerModel.createContextIdParameters(contextId, membersInfo);

    return new Promise((resolve, reject) => {
      getVatsCommonLogs(resolve, reject);
    });

    function getVatsCommonLogs(resolve, reject) {
      const headers = WaCommon.getCommonHeaders(false, true);

      const bodyParameters = new Map();
      bodyParameters.set("start", 0);
      bodyParameters.set("limit", 50);
      bodyParameters.set("fromDate", "");
      bodyParameters.set("fromTime", "");
      bodyParameters.set("tillDate", "");
      bodyParameters.set("tillTime", "");
      bodyParameters.set("durationType", 0);
      bodyParameters.set("durationFrom", "");
      bodyParameters.set("durationTill", "");
      bodyParameters.set("displayMilliSec", false);
      bodyParameters.set("success", 0);
      bodyParameters.set("alertingFlag", 0);
      bodyParameters.set("loadFromLongServer", false);
      bodyParameters.set("softPlatforms", "");
      bodyParameters.set("softPlatformsNot", false);
      bodyParameters.set("accountNames", "");
      bodyParameters.set("accountNamesNot", false);
      bodyParameters.set("callingNumbers", "");
      bodyParameters.set("callingNumbersNot", false);
      bodyParameters.set("calledNumbers", "");
      bodyParameters.set("calledNumbersNot", false);
      bodyParameters.set("discReason", "");
      bodyParameters.set("discReasonNot", false);
      bodyParameters.set("contextIds", contextId);
      bodyParameters.set("contextIdsNot", false);
      bodyParameters.set("commonContextId", "");
      bodyParameters.set("callId", "");
      bodyParameters.set("providers", "");
      bodyParameters.set("providersNot", false);
      bodyParameters.set("providerGroupId", "");
      bodyParameters.set("appCode", "");
      bodyParameters.set("location", "");
      bodyParameters.set("accountCode", "");
      bodyParameters.set("inbound", 2);
      bodyParameters.set("discReasonHdw", "");
      bodyParameters.set("discReasonHdwNot", false);
      bodyParameters.set("discReasonVats", "");
      bodyParameters.set("apiEntryId", "");
      bodyParameters.set("sort", "timeCreated");
      bodyParameters.set("dir", "DESC");

      const body = WaCommon.getFormUrlEncodedBody(bodyParameters);

      const options = WaCommon.getRequestOptions("POST", headers, body);

      WaRequesterHelper.sendRequest(VATS_COMMON_LOGS_URL, options)
        .then((responseData) => {
          responseData
            .json()
            .then((jsonData) => {
              if (jsonData.result === true && jsonData.success === true && Number(jsonData.totalCount) > 0 && jsonData.hasOwnProperty("SoftplatformCdrs")) {
                commonLogsData = new Array();
                jsonData.SoftplatformCdrs.forEach((element) => {
                  commonLogsData.push(element);
                });
              } else {
                return reject("Not get common logs");
              }
              getVatsDetailLogs(stepOfDownloadLogs, resolve, reject);
            })
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    }

    function getVatsDetailLogs(startNumber, resolve, reject) {
      const headers = WaCommon.getCommonHeaders(false, true);

      const bodyParameters = new Map();
      bodyParameters.set("contextId", contextId);
      bodyParameters.set("dateTimeCreated", callDate);
      bodyParameters.set("start", String(startNumber));
      bodyParameters.set("limit", "300");
      bodyParameters.set("sort", "LBL");
      bodyParameters.set("dir", "ASC");

      const body = WaCommon.getFormUrlEncodedBody(bodyParameters);

      const options = WaCommon.getRequestOptions("POST", headers, body);

      WaRequesterHelper.sendRequest(VATS_DETAIL_LOGS_URL, options)
        .then((data) => {
          if (data.status == 200) {
            data
              .json()
              .then((jsonData) => {
                jsonData.VatsDetailLogs.forEach((element) => {
                  vatsLogsData.push(element);
                });

                stepOfDownloadLogs++;

                if (partsOfLogs === null) {
                  partsOfLogs = Math.ceil(Number(jsonData.totalCount) / 300);
                }

                if (stepOfDownloadLogs < partsOfLogs) {
                  getVatsDetailLogs(stepOfDownloadLogs * 300, resolve, reject);
                } else {
                  const translatedLogs = that.parseLogs(vatsLogsData, commonLogsData, contextId, fromCall, toCall, membersInfo);

                  if (translatedLogs !== null) {
                    getActiveRegistration()
                      .then((translatedLogs) => resolve(translatedLogs))
                      .catch((error) => reject(error));

                    function getActiveRegistration() {
                      return new Promise((resolve, reject) => {
                        const interval = setInterval(() => {
                          try {
                            if (
                              analyzerModel.webAdminData[`${contextId}`].amountOfActiveChecksNumberRegistration ===
                              analyzerModel.webAdminData[`${contextId}`].numbersRegistration.length
                            ) {
                              for (let element of analyzerModel.webAdminData[`${contextId}`].numbersRegistration) {
                                translatedLogs[element[1]][1] += element[2];
                              }

                              clearInterval(interval);
                              resolve(translatedLogs);
                            }
                          } catch (error) {
                            return reject(error);
                          }
                        }, 500);
                      });
                    }
                  } else {
                    return reject("translatedLogs is null");
                  }
                }
              })
              .catch((error) => reject(error));
          } else {
            return reject("getDetailLog: status is not 200");
          }
        })
        .catch((error) => reject(error));
    }

    // Вспомогательные функции-------------------------------------------------------------------------------------------------------------
  }

  parseLogs(vatsDetailLogs, commonDetailLogs, contextId, fromCall, toCall, membersInfo) {
    vatsDetailLogs = vatsDetailLogs || null;

    if (vatsDetailLogs !== null && commonDetailLogs !== null) {
      const tableWithInformation = this.getTranslatedTable(commonDetailLogs, vatsDetailLogs, fromCall, toCall, contextId);

      if (tableWithInformation !== null) {
        return tableWithInformation;
      }
    }

    return null;
  }

  getTranslatedTable(commonDetailLogs, vatsDetailLogs, fromCall, toCall, contextId) {
    let tableWithInformation = [["dump-analyze", null]];
    tableWithInformation[tableWithInformation.length] = ["Звонок с номера", fromCall];
    tableWithInformation[tableWithInformation.length] = ["Звонок на номер", toCall];

    vatsDetailLogs.forEach((item, index, array) => {
      const rowFields = this.parseMessageAboutAction(item, contextId, array, commonDetailLogs, tableWithInformation.length);
      if (rowFields !== null) {
        tableWithInformation[tableWithInformation.length] = rowFields;
      }
    });

    const callIsEndedRow = this.getCallIsEndedRow(contextId, commonDetailLogs);

    if (callIsEndedRow !== null) {
      tableWithInformation[tableWithInformation.length] = [callIsEndedRow[0], callIsEndedRow[1]];
    }

    this.getInfoForDumpAnalyzer(tableWithInformation, commonDetailLogs, contextId);

    return tableWithInformation;
  }

  getInfoForDumpAnalyzer(tableWithInformation, commonDetailLogs, contextId) {
    const dumpAnalyzerInfo = [];
    commonDetailLogs.forEach((element) => {
      if (element.hasOwnProperty("answered") && /SIP-MANGO/i.test(element.providerCode)){
        dumpAnalyzerInfo.push({
          providerCode: element.providerCode,
          callingNumber: element.callingNumber,
          calledNumber: element.calledNumber,
          timeCreatedOffset: element.timeCreatedOffset,
          durationCall: element.durationCall,
          sipCallId: element.sipCallId,
        });
      }
    });

    if (dumpAnalyzerInfo.length) {
      tableWithInformation[0] = ["dump-analyze", dumpAnalyzerInfo];
    }
  }

  parseMessageAboutAction(action, contextId, array, commonDetailLogs, currentRowNumber) {
    const code = analyzerCommonFunc.parseTrimReplaceLowerCase(action.typeCode);
    let returnMessage = null;

    if (analyzerParserRules.hasOwnProperty(code) && ((code !== "mtivraction" && code !== "mtdtmf") || analyzerCommonFunc.checkAllowDTMFParam(contextId))) {
      returnMessage = this.getMessageOfRightCheck(analyzerParserRules[code], action, contextId, array, commonDetailLogs, currentRowNumber) || null;
    }
    return returnMessage;
  }

  getCallIsEndedRow(contextId, commonDetailLogs) {
    let result = getCallIsEndedInfo();

    result += getFinisher(commonDetailLogs, result);

    return [`Причины завершения разговора`, result];

    // Вспомогательные функции для getCallIsEndedRow
    function getCallIsEndedInfo() {
      if (analyzerModel.webAdminData[`${contextId}`].callIsEnded !== null) {
        const code = analyzerModel.webAdminData[`${contextId}`].callIsEnded[0] || null;
        const reason = analyzerModel.webAdminData[`${contextId}`].callIsEnded[1] || null;

        if (code) {
          return code;
        } else if (reason) {
          return reason;
        }
      } else {
        const endApplicationCode = analyzerModel.webAdminData[`${contextId}`].endApplication || null;

        if (endApplicationCode) {
          return `${endApplicationCode}`;
        }
      }

      return "";
    }

    function getFinisher(commonDetailLogs, result) {
      const number = getNumber(commonDetailLogs);

      const finisher = `${result.length ? "<br/>" : ""}` + (number !== null ? `Вызов завершен <b>${number}</b>` : "");

      return finisher;
    }

    function getNumber(commonDetailLogs) {
      for (let element of commonDetailLogs) {
        // discReason === 0 - это код Normal
        if (element.discReason === 0) {
          if (element.inbound === 1) {
            return `тем, кто звонил (номер ${element.callingNumber})`;
          } else {
            return `тем, кому звонили (номер ${element.calledNumber})`;
          }
        }
      }

      if (!analyzerModel.webAdminData[`${contextId}`].isEndCode1110) {
        return `аппаратной стороной`;
      }

      return null;
    }
  }

  getMessageOfRightCheck(checksMap, action, contextId, array, commonDetailLogs, currentRowNumber) {
    let result = null;
    for (let [message, callback] of checksMap) {
      if (analyzerCommonFunc.getWAMessageTemplate(message).test(action.message)) {
        result = callback(action, contextId, array, commonDetailLogs, currentRowNumber);
        break;
      }
    }
    return result;
  }
}

module.exports = new CallHelperProd();
