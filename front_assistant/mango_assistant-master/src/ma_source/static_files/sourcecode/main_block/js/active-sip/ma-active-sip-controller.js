const maActiveSipController = {
  // Получение списка активных SIP'ов и вызов функции проверки для каждого элемента списка
  getActiveSipList() {
    maActiveSipView.commonBlock.setStatus.loading();

    maActiveSipHttp.getAllSipInfo();
  },

  parseAllSipData(data) {
    const incorrectFormatList = [];
    const registrationList = [];

    data.forEach((element) => {
      if (element !== null) {
        arrayToPush = element.isCorrect ? registrationList : incorrectFormatList;
        arrayToPush.push(element.aor);
      }
    });

    maActiveSipView.commonBlock.setSipList(incorrectFormatList, registrationList);
  },
};
