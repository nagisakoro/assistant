$(document).ready(function () {
  setTimeout(ma_dynamicModule, 300);
});

function ma_dynamicModule() {
  const pageTypeEnum = Object.freeze({ analyzer: 1, feedback: 2, other: 3 });

  const feedbackParameters = {
    observer: null,
  };

  const dynamicParameters = {
    previousPageType: null,
  };

  changePage();
  getDynamicObserver();

  function getDynamicObserver() {
    const bodyElement = document.querySelector("body");

    if (bodyElement) {
      const config = {
        childList: true,
        attributes: true,
      };

      // Создаем экземпляр наблюдателя с указанной функцией обратного вызова
      const dynamicObserver = new MutationObserver(callback);

      // Начинаем наблюдение за настроенными изменениями целевого элемента
      dynamicObserver.observe(bodyElement, config);

      function callback(mutationsList, observer) {
        try {
          for (let mutation of mutationsList) {
            if (mutation.type === "childList" || mutation.type === "attributes") {
              changePage();
            }
          }
        } catch (error) {
          console.error("ma error: ", error);
        }
      }
    }
  }

  function changePage() {
    const currentHref = location.href;
    const currentPageType = getPageType(currentHref);

    if (currentPageType !== dynamicParameters.previousPageType) {
      dynamicParameters.previousPageType = currentPageType;
      if (currentPageType === pageTypeEnum.other) {
        disableAllAssistantActions();
      } else {
        if (currentPageType === pageTypeEnum.analyzer) {
          disableFeedbackActions();
          ma_analyzerStart();
        } else if (currentPageType === pageTypeEnum.feedback) {
          disableAnalyzerActions();
          feedbackParameters.observer = ma_openBpmRequest();
        }
      }
    }

    function getPageType(currentHref) {
      if (/^.+\:\/\/lk\.mango-office\.ru\/.+\/.+\/stats\/(calls|failed-calls|missed-calls)$/i.test(currentHref)) {
        return pageTypeEnum.analyzer;
      } else if (/^.+:\/\/lk\.mango-office\.ru\/.+\/.+\/feedback$/i.test(currentHref)) {
        return pageTypeEnum.feedback;
      } else {
        return pageTypeEnum.other;
      }
    }

    function disableAnalyzerActions() {
      const maAuthBlockDiv = document.getElementById("ma-auth-block-container");
      const maModalDiv = document.getElementById("ma-analyzer-modal-container");

      deleteElement(maAuthBlockDiv);
      deleteElement(maModalDiv);

      function deleteElement(elem) {
        if (elem) {
          elem.parentNode.removeChild(elem);
        }
      }
    }

    function disableFeedbackActions() {
      disableObserver(feedbackParameters.observer);
    }

    function disableObserver(observer) {
      if (observer) {
        observer.disconnect();
      }
    }

    function disableAllAssistantActions() {
      disableAnalyzerActions();
      disableFeedbackActions();
    }
  }
}
