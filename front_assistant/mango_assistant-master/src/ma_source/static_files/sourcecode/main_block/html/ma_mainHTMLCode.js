const mangoAssistData = "mango-assist-data";
const mangoAssistantHeader = "mango-assistant-header";
const mangoAssistantSeparatorHr = "mango-assistant-separator-hr";
const mangoAssistantSmallTextClass = "mango-assistant-small-text";
const redPlaceholderClass = "mangoAssistantRedPlaceholder";
const mangoAssistantLeftPosition = localStorage.getItem("mangoAssistantLeftPosition");

// Переменная с HTML - кодом Mango Helper
// filter: alpha(Opacity=70); - это прозрачность для Internet Explorer
const HTML_MANGO_ASSISTANT = `
<!-- CSS - стиль для лоадера Манго Ассистент -->
<style>
    ${CSS_MANGO_ASSISTANT_LOADER}
</style>

<!-- CSS - стиль для Блока Манго Ассистент -->
<style>
    #${mangoAssistData}::-webkit-scrollbar {
        width: 13px;
        border: 5px solid rgb(120, 100, 39, 0.65);
        border-radius: 10px;
        background-color: #d1d1d1;
    }

    #${mangoAssistData}::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background-image: -webkit-linear-gradient(#BDB76B, #F0E68C);
    }

    #mango-assistant>div {
        padding: 0px 10px;
    }

    .mangoAssistantBlock {
        border: 1px solid #BDB76B;
        border-radius: 5px;
    }

    .button-of-mango-assistant {
        border: 2px solid;
        border-radius: 3px;
        display: block;
        margin: 2px auto;
        color: #222;
        width: 100%;
        min-height: 25px;
    }

    .inputOfMangoAssistant {
        color: black;
        width: 100%;
    }

    .textareaOfMangoAssistant {
        color: black;
        resize: vertical;
        min-height: 100px;
        max-height: 200px;
        height: 100px;
    }

    #${mangoAssistData}>div {
        padding: 10px 5px;
        margin: 5px auto;
    }

    .${redPlaceholderClass} {
        color: red;
    }

    .${redPlaceholderClass}::-webkit-input-placeholder {
        color: red;
    }

    .${mangoAssistantSeparatorHr}{
        margin: 0;
        border: 1 solid white;
        width: 100%;
    }

    .showHide{
        display: none;
    }

    .${mangoAssistantSmallTextClass} {
        font-size:10pt; 
        text-align:center
    }

    div#maInfoBlockContent li a {
        color:white;
    }
</style>

<!-- Содержимое блока Манго Ассистент -->
<div id="mango-assistant"
    style=" z-index: 499; width: 300px; position:absolute; top:147px; left:${
      mangoAssistantLeftPosition ? mangoAssistantLeftPosition : 1500
    }px; color: #fff; border-radius: 5px; background-color: rgb(120,100,39,0.85);">
    <div id="${mangoAssistantHeader}" class="mangoAssistantBlock" style="display:flex; flex-direction:column">
            <div style="display:flex; flex-direction:row">
                <button id="dragMAButton" class="button-of-mango-assistant" style="cursor:move; width: 30px;height: 30px; margin: 0 0">⇔</button>
                <p style="margin:0 50px">Mango Assistant</p>
            </div>
        <button id="hide-show-btn" class="button-of-mango-assistant" style="width:50%;"
            disabled="true">Загрузка</button>
        ${MA_AUTH_BLOCK_HTML}
    </div>
    <div id="${mangoAssistData}"
        style="display: none; word-break: break-all; height: 820px; border-radius: 0 0 10px 10px; overflow-y: scroll;">
        <br/>
        <div id="maInfoBlock" class="mangoAssistantBlock">
            <div id="maInfoBlockHeader">
                <button id="maToggleInfoBlockButton" class="button-of-mango-assistant">
                    Помощь по продуктам
                </button>
            </div>
            <div id="maInfoBlockContent" style="display:none">
                <ol>
                    <li><a href="http://guruwiki2.corp.mango.ru/" target="_blank">Статьи для помощи</a></li>
                    <li><a href="http://confluence.ru.mgo.su/display/integration" target="_blank">Интреграции</a></li>
                    <li><a href="http://confluence.ru.mgo.su/display/Martech" target="_blank">ДКТ</a></li>
                    <li><a href="http://confluence.ru.mgo.su/display/CCC" target="_blank">КЦ</a></li>
                </ol>
            </div>
        </div>
        <div id="checkFwdCallSchemasBlock" class="mangoAssistantBlock">
            <div id="checkFwdCallsHeader">
                <button id="checkActivateSchemaButton" class="button-of-mango-assistant">
                <span class="${mangoAssistantSmallTextClass}">Проверить схемы <br/>распределения звонков</span>
                </button>
                <button id="maOpenChecksButton" class="button-of-mango-assistant">
                <span class="${mangoAssistantSmallTextClass}">Реализованные проверки схем</span>
                </button>
                <div id="maImplementChecks" style="display:none">
                <small>1) Проверка на закольцованные звонки</small><br/>
                <small>2) Проверка некорректную длину донабора</small><br/>
                <small>3) Переадресация звонка на "не указано"</small><br/>
                <small>4) Пустая группа без сотрудников</small><br/>
                <small>5) Короткое время ожидания при <br/>переадресации на внешний номер</small><br/>
                <small>6) Если есть IVR или DTMF: <br/>
                - Наличие пункта "Отсутствие ввода"<br/>
                - Наличие пункта "Любой другой ввод"</small><br/>
                <small>7) Пустой блок ввода</small><br/>
                <small>8) У группы время удержания  больше 300 <br/>секунд либо неограниченная длина очереди</small><br/>
                <small>9) Нет звукового приветствия перед DTMF</small><br/>
                <small>10) Некорректно указан внешний номер</small><br/>
                <small>11) Перед переадресацией на группу есть переадресация на сотовый</small><br/>
                <small>12) В группе стоит последовательное распределение и у сотрудника указан сотовый</small><br/>
                </div>
            </div>
            <div id="checkFwdCallSchemasContent" style="display:none">
                <button id="checkFwdCallsToggleButton" class="button-of-mango-assistant">Свернуть</button>
                <div id="badFwdCallSchemas" style="display: flex; flex-direction: column;" class="mangoAssistantBlock">
                </div>
            </div>
        </div>
        <!-- Пока отказались от кнопки отправки почты ПМ"у<div id="sendEmailBlock" class="mangoAssistantBlock">
            <button id="sendEmailToPMButton" class="button-of-mango-assistant">Отправить письмо ПМ'у</button>
        </div>-->
        <div class="mangoAssistantBlock">
            <button id="orkCallHeadButton" class="button-of-mango-assistant">Заказать обратный звонок в ОТП</button>
            <div id="orkCallBlock" class="mangoAssistantBlock" style="display:none;">
                <div style="display:flex; flex-direction:column">
                    <span>Номер клиента:</span>
                    <input id="callbackOTPclientPhoneInput" class="inputOfMangoAssistant"
                        placeholder="7 (495) 123-45-67"></input>
                    <div>
                        <p>
                        <span class=${redPlaceholderClass} style="font-size:14pt">Внимание!</span> <br/>
                        При заказе обратного звонка в ОТП <br/>необходимо подробно заполнить <br/>описание в соответствующей <br/>заявке BPM.<br/>
                        <span class=${redPlaceholderClass}>Заявка в BPM <br/>создается вручную!</span>
                        </p>
                    </div>
                    <div style="display:flex; flex-direction:row">
                        <button id="orderCallingOrkButton" class="button-of-mango-assistant"
                            style="width:50%;">Заказать</button>
                        <button id="cancelCallingOrkButton" class="button-of-mango-assistant"
                            style="width:50%;">Отмена</button>
                    </div>
                </div>
            </div>
        </div> 
        <div class="mangoAssistantBlock">
            <div style="display:flex; flex-direction: column;">
                <button id="checkActiveSIPbutton" class="button-of-mango-assistant">Проверить активные
                    SIP-номера</button>
            </div>
            <div id="checkActiveSIPBlockContent" style="display:none;">
                <button id="activeSIPContentToggleButton" class="button-of-mango-assistant">Свернуть</button>
                <div id="contentOfCheckingActiveSIPBlock" class="mangoAssistantBlock"
                    style="display:flex; flex-direction:column">
                </div>
            </div>
        </div>
        <div class="mangoAssistantBlock">
            <div style="display:flex; flex-direction: column;">
                <button id="checkRulesRecordingConversationButton" class="button-of-mango-assistant"><span
                        class="${mangoAssistantSmallTextClass}">Проверить правила <br/>записи разговоров</span></button>
            </div>
            <div id="checkRulesRecordingConversationBlockContent" style="display:none;">
                <button id="rulesRecordConversationToggleButton" class="button-of-mango-assistant">Свернуть</button>
                <div id="contentOfCheckingRulesRecordConversationBlock" class="mangoAssistantBlock"
                    style="display:flex; flex-direction:column">
                </div>
            </div>
        </div>
        <div class="mangoAssistantBlock">
            <div style="display:flex; flex-direction: column;">
                <button id="checkAvailableRegionsButton" class="button-of-mango-assistant"><span
                        class="${mangoAssistantSmallTextClass}">Проверить доступные <br/>для звонка регионы</span></button>
            </div>
            <div id="checkAvailableRegionsButtonBlockContent" style="display:none;">
                <button id="availableRegionsToggleButton" class="button-of-mango-assistant">Свернуть</button>
                <div id="contentOfAvailableRegionsBlock" class="mangoAssistantBlock"
                    style="display:flex; flex-direction:column">
                </div>
            </div>
        </div>
        <div class="mangoAssistantBlock">
            <button class="button-of-mango-assistant" id="showHideDisplayInfoMembersButton">
            <span class="${mangoAssistantSmallTextClass}">Получить информацию <br/>о сотрудниках</span>
            </button>
            <div id="DisplayInfoMembersBlock" style="display:none;">
                <button id="InfoMembersContentToggleButton" class="button-of-mango-assistant">Свернуть</button>
                <div id = "contentOfMembersInfoBlock" class="mangoAssistantBlock" style="display:none;">
                    <input id="nameOfMemberInfoInput" class="inputOfMangoAssistant" placeholder="Введите наименование сотрудника"></input>
                    <div id="listOfMembersMangoAssistant" class="textareaOfMangoAssistant mangoAssistantBlock" style="overflow-y: scroll;height: 100px; color:black;display:flex;flex-direction:column">
                    </div>
                    <p>Выбранный сотрудник:</p>
                    <div class="mangoAssistantBlock showHide" id="maChosenMember"></div>
                </div>
            </div>
        </div>
        <div class="mangoAssistantBlock">
            <button id="showSDRequestButton" class="button-of-mango-assistant">
                <span class="${mangoAssistantSmallTextClass}">Обратная связь</span>
            </button>
            <div id="createSDRequestBlock" class="mangoAssistantBlock" style="display:none;">
                <div style="display:flex; flex-direction:column">
                    <textarea id="fieldWithRequestText" class="textareaOfMangoAssistant"
                        placeholder="Напишите ваши предложения по доработке"></textarea>
                    <div style="display:flex; flex-direction:row">
                        <button id="createAndSendRequestSD" class="button-of-mango-assistant"
                            style="width:50%;">Отправить</button>
                        <button id="cancelSDRequestButton" class="button-of-mango-assistant"
                            style="width:50%;">Отмена</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;

// Функция, реалзиующая возможность перетаскивания объекта
function dragElement(element) {
  const minLeft = 310;
  const maxLeft = 1520;

  let newX = 0,
    currentX = 0;

  if (document.getElementById("dragMAButton")) {
    /* if present, the header is where you move the DIV from:*/
    document.getElementById("dragMAButton").onmousedown = maDragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    element.onmousedown = maDragMouseDown;
  }

  function maDragMouseDown(e) {
    e = e || window.event;
    // get the mouse cursor position at startup:
    currentX = e.clientX;

    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    const assistantCoordinates = element.getBoundingClientRect();

    // Пока взял максимальное возможное значение right - 1920 (константа)
    // Автоматическое получение максимальной ширины закомментировал
    /* const scrollWidth = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.body.clientWidth,
      document.documentElement.clientWidth
    ); */

    e = e || window.event;

    // calculate the new cursor position:
    newX = currentX - e.clientX;
    currentX = e.clientX;

    const newFullAssistantLeft = assistantCoordinates.left + document.documentElement.scrollLeft - newX;

    const newPosition = element.offsetLeft - newX;

    if (newFullAssistantLeft <= minLeft) {
      element.style.left = minLeft + 1 + "px";
    } else if (newFullAssistantLeft >= maxLeft) {
      element.style.left = maxLeft - 1 + "px";
    } else if (newFullAssistantLeft > minLeft && newFullAssistantLeft < maxLeft) {
      element.style.left = newPosition + "px";
      localStorage.setItem("mangoAssistantLeftPosition", newPosition);
    }
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
