const maAnalyzerModel = {
  /**
   * Информация о сотрудниках.
   * Без данной инфы анализатор не сможет корректно работать.
   */
  membersInfo: null,

  /**
   * Переменая типа boolean, описывающая состояние получения инфы о сотрудниках.
   * Если true, то запрос успешен/в процессе выполнения.
   * Если false, то получение инфы выполнено неуспешно/не выполнено.
   */
  isGettingMembers: true,

  /**
   * Информация о таблице вызовов
   */
  jsonTable: null,

  MA_LK_INFO: { GET_ACCOUNT_INFO_URL: `https://api-header.mango-office.ru/api/account`, IS_HREF_AND_CONTROL_RIGHT: null, PRODUCT_CODE: null, PRODUCT_ID: null },

  mangoAssistData: "mango-assist-data",
  mangoAssistantHeader: "mango-assistant-header",
  redPlaceholderClass: "mangoAssistantRedPlaceholder",
};
