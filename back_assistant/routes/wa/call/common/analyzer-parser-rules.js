const parseMtAniDirection = require("./parseMtCode/parse-mt-ani-direction-code.js");
const parseMtApiCode = require("./parseMtCode/parse-mt-api-code");
const parseMtBlackList = require("./parseMtCode/parse-mt-black-list-code");
const parseMtCall = require("./parseMtCode/parseMtCall/parse-mt-call-code");
const parseMtCommon = require("./parseMtCode/parse-mt-common-code");
const parseMtConversation = require("./parseMtCode/parse-mt-conversation-code");
const parseMtConvRec = require("./parseMtCode/parse-mt-conv-rec-code");
const parseMtDTMF = require("./parseMtCode/parse-mt-dtmf-code");
const parseMtGroup = require("./parseMtCode/parse-mt-group-code");
const parseMtIVRAction = require("./parseMtCode/parse-mt-ivr-action-code");
const parseMtSettings = require("./parseMtCode/parse-mt-settings-code");
const parseMtUser = require("./parseMtCode/parse-mt-user-code");
const parseMtCallBack = require("./parseMtCode/parse-mt-call-back-code");
const parseMtFax = require("./parseMtCode/parse-mt-faxcode");
const parseMtNotAvailable = require("./parseMtCode/parse-mt-not-available-code");
const parseMtVoiceRecord = require("./parseMtCode/parse-mt-voice-record-code.js");
const parseMtTransfer = require("./parseMtCode/parse-mt-transfer-code");
const parseMtAudio = require("./parseMtCode/parse-mt-audio-code");

//ПРАВИЛА ДЛЯ ОБРАБОТКИ СООБЩЕНИЙ
/**
 * ПРАВИЛА ДЛЯ ОБРАБОТКИ СООБЩЕНИЙ.
 * Имя свойства - код в логах.
 * Ключ в Map'e - сообщение в логах.
 * Значение в Map'e - функция обработки сообщения из логов.
 */
const analyzerParserRules = {
  // Пока решено не выводить сообщения о работе аудио
  mtaudio: new Map([
    ["Try to start playing tones for Client", parseMtAudio.tryStartPlayingTonesClient],
    /* ["Try to start playing audio", parseMtAudio.tryToPlayingAudio],
    [`Start playing audio\.?`, parseMtAudio.tryToPlayingAudio],
    [`Start playing audio for Client`, parseMtAudio.tryToPlayingAudio],
    [`Start playing for Client`, parseMtAudio.tryToPlayingAudio], */
  ]),

  mtfax: new Map([
    [`Start fax detector`, parseMtFax.startFaxDetector],
    [`Fax *recognizer *has *started *for *Client`, parseMtFax.startFaxDetector],
  ]),

  mtcallback: new Map([[`API callback`, parseMtCallBack.apiCallback]]),

  mtcommon: new Map([[`Starting centrex application.*`, parseMtCommon.startApplication]]),

  mtcall: new Map([
    [`Create call.*`, parseMtCall.createCall],
    ["Placing call", parseMtCall.placingCall],
    ["Call is ended", parseMtCall.callIsEnded],
    ["Ending Operator call", parseMtCall.endOperatorCall],
    ["Ending Client call", parseMtCall.endingClientCall],
  ]),

  mtsettings: new Map([[`Point Settings`, parseMtSettings.pointSettings]]),

  mtaniredirection: new Map([
    [`AniRouting service is allowed by billing`, parseMtAniDirection.serviceIsAllowed],
    [`AniRouting service is NOT allowed by billing. Skipping ANI routing`, parseMtAniDirection.serviceIsNotAllowed],
  ]),

  mtblacklist: new Map([
    ["Blacklist service is NOT allowed by billing", parseMtBlackList.isAllowed],
    /* ["Blacklist service is allowed by billing", parseMtBlackList.isNotAllowed], */
    ["Filtering number through all black, white etc. lists", parseMtBlackList.filterThrough],
  ]),

  mtivraction: new Map([
    ["Default IVR is defined. Starting it", parseMtIVRAction.defaultIVRIsDefined],
    ["Transfer to Group", parseMtIVRAction.transferToGroup],
    ["Transition to procedure", parseMtIVRAction.transitProcedure],
    ["Entered short number is User. Transfer to User.", parseMtIVRAction.enterShortUser],
    ["Transfer to external number", parseMtIVRAction.externalNum],
    ["Transfer to short", parseMtIVRAction.transferToShort],
    ["No target with short number", parseMtIVRAction.noTargetShortNumber],
  ]),

  mtuser: new Map([["Start dial to user", parseMtUser.startDial]]),

  mtconversation: new Map([
    ["Start conversation", parseMtConversation.startConversation],
    ["End application", parseMtConversation.endApplication],
  ]),

  mtconversationrecord: new Map([
    ["Starting record", parseMtConvRec.startRecord],
    ["Record has started", parseMtConvRec.recHasStarted],
    ["Proceed record saving", parseMtConvRec.proceedRecSave],
  ]),

  mtgroup: new Map([
    ["Get free operators", parseMtGroup.getFreeOperators],
    ["Try to get personal operator", parseMtGroup.getPersonalOperator],
    ["OperatorRequestCommand", parseMtGroup.operatorRequestCommand],
  ]),

  mtdtmf: new Map([
    ["Dtmf collector signalled", parseMtDTMF.collectorSignaled],
    ["Dial to undefined number", parseMtDTMF.dialUndefinedNumber],
    ["Number .* is passed", parseMtDTMF.numIsPassed],
    ["No number entered.*", parseMtDTMF.noNumberEntered],
    [".*were pressed by Operator", parseMtDTMF.werePressedByOperator],
  ]),

  mttransfer: new Map([
    [
      `Call return\\. Dial.*Client to Operator`,
      () => {
        return ["Статус звонка", "Возвращение разговора от клиента к оператору"];
      },
    ],
    [`Transfer to responsible manager`, parseMtTransfer.toResponsibleManager],
    /*     [
      "Blind. Dial from Client to Consultant",
      () => {
        return [
          `Статус перевода(<b style="color:red">Нужно нормально перевести!)</b>`,
          `"Слепой" перевод. Набор номера от клиента до консультанта(<b style="color:red">Нужно нормально перевести!)</b>`,
        ];
      },
    ], */
  ]),

  mtapi: new Map([
    [`API InterceptCall command.?`, parseMtApiCode.interceptCall],
    [`Callback *Group parameters`, parseMtApiCode.callbackGroup],
    [`Callback parameters`, parseMtApiCode.callbackParameters],
    [`API TransferCall command.?`, parseMtApiCode.apiTransferCall],
    [`API HangupCall command.?`, parseMtApiCode.apiHangup],
  ]),

  mtnotavailable: new Map([
    [`Autosecretary service is +allowed by billing`, parseMtNotAvailable.autosecretaryIsAllowed],
    [`Run autosecretary N/A handling`, parseMtNotAvailable.runAutoSecretaryNAHandling],
    [`Play blod with id: *\\d+`, parseMtNotAvailable.playBlodWithId],
    [`Start voice mail with email:.*`, parseMtNotAvailable.startVoiceMail],
    [`End call or run next IVR action`, parseMtNotAvailable.endCallRunNextIVRAction],
    [`Redirect to group with id:\\s*\\d+`, parseMtNotAvailable.redirectToGroupWithId],
    [`Redirect at group`, parseMtNotAvailable.redirectAtGroup],
  ]),

  mtvoicerecord: new Map([[`Voice record has started`, parseMtVoiceRecord.voiceRecordHasStarted]]),
};

module.exports = analyzerParserRules;
``;
