$(document).ready(function () {
  setTimeout(bpmModule, 300);
});

function bpmModule() {
  let prevHash = null;

  XHRListener.on(/.*/, (e) => {
    const currentHash = location.hash;

    if (prevHash !== currentHash) {
      prevHash = currentHash;

      if (/CardModuleV2\/CasePage\/edit\//i.test(prevHash)) {
        new SDAndRMButtons();
        new CaseToAccountButton();
      }
      if (/CardModuleV2\/Account1Page\/edit\//i.test(prevHash)) {
        new CaseToAccountButton();
      }
    }
  });
}
