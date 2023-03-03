class StatisticService {
  static send = {
    callback: () => {
      try {
        const requestParams = {
          email: authInput.val(),
          action: `Заказ обратного звонка ${Model.lastCallbackNumber}`,
          isActive: 1,
          ls: "popup",
          product: "0",
        };

        $.post(`${MA_WORK_NODE_URL}/add-statistic-action`, requestParams);
      } catch (error) {
        console.error(error);
      }
    },
  };
}
