window.onload = function () {
  const STATIC_SCRIPTS_URLS_ARRAY = [
    "/ma_source/static_files/libs/jquery-3.4.1.min.js",
    "/environment/ma-environment.js",
    "/ma_source/static_files/libs/xhr-listener.js",
    "/ma_source/static_files/sourcecode/bpm/case_page/service/bpm-common.service.js",
    "/ma_source/static_files/sourcecode/bpm/case_page/service/cookie.service.js",
    "/ma_source/static_files/sourcecode/bpm/case_page/service/statistic.service.js",
    "/ma_source/static_files/sourcecode/bpm/case_page/case-to-account/http.service.js",
    "/ma_source/static_files/sourcecode/bpm/case_page/case-to-account/page.model.js",
    "/ma_source/static_files/sourcecode/bpm/case_page/case-to-account/page.service.js",
    "/ma_source/static_files/sourcecode/bpm/case_page/case-to-account/request-body.service.js",
    "/ma_source/static_files/sourcecode/bpm/case_page/case-to-account/ma-case-to-account.js",
    "/ma_source/static_files/sourcecode/bpm/case_page/sd-rm/ma-sd-rm.js",
    "/ma_source/static_files/sourcecode/bpm/case_page/ma-bpm-case-script.js",
  ];

  loadScripts(STATIC_SCRIPTS_URLS_ARRAY);

  function loadScripts(arr, i = 0) {
    const head = document.getElementsByTagName("head")[0];
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = chrome.extension.getURL(arr[i]);

    function onLoadCallback() {
      i++;
      arr.length > i && loadScripts(arr, i);
    }
    function onErrorCallback() {
      console.error(`Не удалось загрузить скрипт ${arr[i]}!`);
    }

    script.onload = onLoadCallback;
    script.onerror = onErrorCallback;

    // Начинаем загрузку
    head.appendChild(script);
  }
};
