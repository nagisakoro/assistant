window.onload = function () {
  const STATIC_SCRIPTS_URLS_ARRAY = /^.+:\/\/lk\.mango-office\.ru\/profile\/.*/i.test(location.href)
    ? [
        "/ma_source/static_files/libs/jquery-3.4.1.min.js",
        "/environment/ma-environment.js",
        "/ma_source/static_files/libs/mask.js",
        "/ma_source/static_files/sourcecode/common-service/ma-view.service.js",
        "/ma_source/static_files/sourcecode/common-service/auth.service.js",
        "/ma_source/static_files/sourcecode/common-service/ma-runtime.service.js",
        "/ma_source/static_files/sourcecode/main_block/js/ma_common.js",
        "/ma_source/static_files/sourcecode/common-html/ma-auth-block.js",
        "/ma_source/static_files/sourcecode/main_block/html/ma_loaderHTMLCode.js",
        "/ma_source/static_files/sourcecode/main_block/html/ma_mainHTMLCode.js",
        "/ma_source/static_files/sourcecode/main_block/js/ma_mainScript.js",
        "/ma_source/static_files/sourcecode/main_block/js/active-sip/ma-active-sip-common.js",
        "/ma_source/static_files/sourcecode/main_block/js/active-sip/view/ma-empty-log-dialog-class.js",
        "/ma_source/static_files/sourcecode/main_block/js/active-sip/view/ma-incorrect-format-block-class.js",
        "/ma_source/static_files/sourcecode/main_block/js/active-sip/view/ma-download-logs-block-class.js",
        "/ma_source/static_files/sourcecode/main_block/js/active-sip/view/ma-bad-sip-block-class.js",
        "/ma_source/static_files/sourcecode/main_block/js/active-sip/view/ma-active-sip-view.js",
        "/ma_source/static_files/sourcecode/main_block/js/active-sip/ma-active-sip-http.js",
        "/ma_source/static_files/sourcecode/main_block/js/active-sip/ma-active-sip-controller.js",
      ]
    : [
        "/ma_source/static_files/libs/jquery-3.4.1.min.js",
        "/ma_source/static_files/libs/xhr-listener.js",
        "/environment/ma-environment.js",
        "/ma_source/static_files/sourcecode/feedback/ma-feedback.js",
        "/ma_source/static_files/sourcecode/analyzer/model/ma_analyzerModel.js",
        "/ma_source/static_files/sourcecode/analyzer/controller/ma_analyzerController.js",
        "/ma_source/static_files/sourcecode/common-service/ma-view.service.js",
        "/ma_source/static_files/sourcecode/common-service/auth.service.js",
        "/ma_source/static_files/sourcecode/common-service/ma-runtime.service.js",
        "/ma_source/static_files/sourcecode/main_block/js/ma_common.js",
        "/ma_source/static_files/sourcecode/common-html/ma-auth-block.js",
        "/ma_source/static_files/sourcecode/analyzer/view/dump/ma-analyzer-view-dump-dialog.js",
        "/ma_source/static_files/sourcecode/analyzer/view/dump/ma-analyzer-view-dump.js",
        "/ma_source/static_files/sourcecode/analyzer/view/ma-analyzer-view.js",
        "/ma_source/static_files/sourcecode/analyzer/controller/common/ma_analyzerComonFunc.js",
        "/ma_source/static_files/sourcecode/analyzer/controller/common/http-service/ma-analyzer-http-dump.js",
        "/ma_source/static_files/sourcecode/analyzer/controller/common/http-service/ma-analyzer-http-service.js",
        "/ma_source/static_files/sourcecode/analyzer/ma-analyzer-main.js",
        "/ma_source/static_files/sourcecode/dynamic_pages/dynamic-pages.js",
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
