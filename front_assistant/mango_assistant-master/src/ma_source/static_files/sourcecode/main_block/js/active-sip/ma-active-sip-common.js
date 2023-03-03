const maActiveSipCommon = {
  // Вывод времени в правильном формате для логов активных sip-номеров
  parseTimeForActive() {
    const timeDifference = new Date().getTimezoneOffset() * 60000;
    const millisecondsUTC0 = new Date().getTime() + timeDifference;
    const millisecondsUTC3 = millisecondsUTC0 + 10800000;

    const dateUTC3 = new Date(millisecondsUTC3);

    const yearParameter = dateUTC3.getFullYear();
    const monthParameter = dateUTC3.getMonth() + 1;
    const dayParameter = dateUTC3.getDate();
    const hoursParameter = dateUTC3.getHours();
    const minutesParameter = dateUTC3.getMinutes();

    const result = `${dayParameter}.${monthParameter}.${yearParameter}-${maActiveSipCommon._parseTwoDigits(hoursParameter)}_00_00-${maActiveSipCommon._parseTwoDigits(
      hoursParameter
    )}_${maActiveSipCommon._parseTwoDigits(minutesParameter)}_00`;

    return result;
  },

  _parseTwoDigits(num) {
    return ("0" + num).slice(-2);
  },

  downloadFile(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(file, filename);
    } else {
      var a = document.createElement("a"),
        url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  },
};
