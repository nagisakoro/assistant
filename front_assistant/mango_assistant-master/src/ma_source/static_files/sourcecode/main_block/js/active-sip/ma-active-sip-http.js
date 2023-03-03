const maActiveSipHttp = {
  getAllSipInfo() {
    $.get(MA_LK_INFO.GET_NUMBER_URL)
      .done((responseData) => {
        try {
          $numbersPageHtml = $(responseData);

          const listOfNumbers = $numbersPageHtml.find("td.number span.b-number.sip span.number");
          if (listOfNumbers.length) {
            const numbersInfo = listOfNumbers.map((index, element) => maActiveSipHttp.getOneActiveSipInfo(element["dataset"]["abonent_id"]));

            Promise.all(numbersInfo)
              .then((data) => {
                maActiveSipController.parseAllSipData(data);
              })
              .catch((error) => {
                console.error("Promise.all catch error: ", error);
                maActiveSipView.commonBlock.setStatus.errorWhenGetSipList(error);
              });
          } else {
            maActiveSipView.commonBlock.setStatus.allIsGood();
          }
        } catch (error) {
          maActiveSipView.commonBlock.setStatus.errorWhenGetSipList(error);
        }
      })
      .fail((error) => {
        maActiveSipView.commonBlock.setStatus.errorWhenGetSipList(error);
      });
  },

  getOneActiveSipInfo(abonentId) {
    return new Promise((resolve, reject) => {
      $.post(MA_LK_INFO.GET_ACTIVE_SIP_INFO_URL, { abonent_id: abonentId })
        .done((data) => {
          try {
            const json = JSON.parse(data);

            if (json["line"]["remote_sip_active"] == 1) {
              const aor = json["line"]["sip_uac_settings"]["aor"];

              const activeSipNumberTemplate = new RegExp(`^.+\@.+\\..+$`, "i");

              return resolve({ aor: aor, isCorrect: activeSipNumberTemplate.test(aor) });
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error(error);
            return reject(error);
          }
        })
        .fail((error) => {
          return reject(error);
        });
    });
  },

  getBadSipRegistrationInfo(id, sip, checkButton) {
    const body = {
      sip: sip,
    };

    $.post(`${MA_WORK_NODE_URL}/active-sip/check`, body)
      .done((result) => {
        try {
          if (result.isComplete) {
            maActiveSipView.badSipBlock.setStaus.finish(id, result.data, checkButton, sip);
          } else {
            throw new Error("result.data is not complete");
          }
        } catch (error) {
          maActiveSipView.badSipBlock.setStaus.error(id, error, checkButton, sip);
        }
      })
      .fail((error) => {
        maActiveSipView.badSipBlock.setStaus.error(id, error, checkButton, sip);
      });
  },
};
