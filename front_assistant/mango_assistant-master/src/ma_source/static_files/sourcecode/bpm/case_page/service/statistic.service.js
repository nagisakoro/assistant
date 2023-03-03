class StatisticService {
  static send(type, from, to, note) {
    const requestParams = {
      email: BPMCommon.getUserEmailFromCasePage(),
      type: type,
      from: from,
      to: to,
      note: note,
    };

    $.post(`${MA_WORK_NODE_URL}/add-statistic-bpm-action`, requestParams);
  }
}
