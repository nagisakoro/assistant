const sdOptions = require("./sdOptions");
const environment = require("../environment");
const rp = require("request-promise");

const sdHelper = {
  /**
   * Выполняет HTTP запрос в сервис деск.
   * возвращает промис на запрос, который резолвит тело ответа
   * @param {string} operationName
   * @param {string} input_data
   * @param {string=} suburl
   * @return {Promise<any>}
   */

  createProcess(description, accountNumber) {
    const destinationURL = environment.SEVICE_DESK_URL;
    const options = {
      method: "POST",
      uri: destinationURL,
      form: {
        TECHNICIAN_KEY: environment.SD_API_KEY,
        OPERATION_NAME: "ADD_REQUEST",
        INPUT_DATA: sdOptions.create_process(description, accountNumber),
      },
      qs: {
        format: "json",
      },
    };
    return this.request(options);
  },
  request(options) {
    return rp(options);
  },
};

module.exports = sdHelper;
