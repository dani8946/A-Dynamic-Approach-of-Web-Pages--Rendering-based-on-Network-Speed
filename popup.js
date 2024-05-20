// Function to execute script when a tab is updated (e.g., page load or reload)
function executeScriptOnTabUpdate(tabId) {
  chrome.tabs.executeScript(tabId, { file: 'contentScript.js' }, function () {
      fetchFile();
  });
}

// Execute script when a tab is updated (page load or reload)
chrome.webNavigation.onDOMContentLoaded.addListener(function (details) {
  executeScriptOnTabUpdate(details.tabId);
});