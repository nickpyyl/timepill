const MENU_ID = "ctc-convert-selection";

chrome.runtime.onInstalled.addListener(createContextMenu);
chrome.runtime.onStartup.addListener(createContextMenu);

chrome.action.onClicked.addListener((tab) => {
  if (!tab || !tab.id) {
    return;
  }

  injectContent(tab.id, () => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: () => {
          if (window.__timepillToggleSettings) {
            window.__timepillToggleSettings();
          }
        }
      },
      () => {
        void chrome.runtime.lastError;
      }
    );
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab || !tab.id) {
    return;
  }

  const selectedText = info.selectionText || "";
  injectContent(tab.id, () => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: (text) => {
            if (window.__clickTimeConverterConvertSelection) {
              window.__clickTimeConverterConvertSelection(text);
            }
          },
          args: [selectedText]
        },
        () => {
          void chrome.runtime.lastError;
        }
      );
  });
});

function injectContent(tabId, callback) {
  chrome.scripting.insertCSS({ target: { tabId }, files: ["content.css"] }, () => {
    void chrome.runtime.lastError;
    chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] }, () => {
      void chrome.runtime.lastError;
      callback();
    });
  });
}

function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Convert \"%s\" to my timezone",
      contexts: ["selection"]
    });
  });
}
