const logger = require("../logger");

class RequesterHelper {
  /**
   * Формирование "каркаса" тела ответа
   * @param {Boolean} isComplete
   * @param {any} data
   * @return {{isComplete: boolean, data: Object }} body - общее тело ответа
   */
  static getCommonBody(isComplete, data) {
    return {
      isComplete: isComplete,
      data: data,
    };
  }

  /**
   * Формирование тела успешного ответа
   * @param {Boolean} isComplete
   * @param {any} data
   * @return {{isComplete: boolean, data: Object }} body - успешное тело ответа
   */
  static getSuccessBody(data = null) {
    const result = this.getCommonBody(true, data);
    return result;    
  }

  /**
   * Формирование тела ответа с ошибкой
   * @param {Boolean} isComplete
   * @param {Object} data
   * @return {{isComplete: boolean, data: Object }} body - тело ответа с ошибкой
   */
  static getErrorBody(error) {
    logger.error({
      message: error.message,
      date: logger.getMoscowDate(),
    });

    const result = this.getCommonBody(false, error);
    return result;
  }
}

module.exports = RequesterHelper;
