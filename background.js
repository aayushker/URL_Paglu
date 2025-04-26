// === background.js ===
// Simple debug logger
function debug(message) {
  console.log("[URL Scanner Background] " + message);
}

// Log that background script is loaded
debug("Background script loaded");

// Initialize default settings when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  debug("Extension installed");

  // Set default settings
  chrome.storage.sync.set(
    {
      autoScan: false,
      highlightSuspicious: true,
      useApi: false,
      scanCount: 0,
      lastScan: null,
    },
    function () {
      debug("Default settings initialized");
    }
  );
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  debug("Message received: " + JSON.stringify(message));

  if (message.action === "debugLog") {
    debug("Content script log: " + message.message);
  }

  return true;
});

// Listen for tab updates to possibly trigger auto-scanning
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only run when the page is fully loaded
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.startsWith("http") &&
    !tab.url.includes("chrome.google.com")
  ) {
    debug(`Tab updated: ${tabId} - ${tab.url}`);

    // Check if auto-scan is enabled
    chrome.storage.sync.get({ autoScan: false }, function (settings) {
      if (settings.autoScan) {
        debug(`Auto-scan enabled, sending scan message to tab ${tabId}`);

        // Use messaging to trigger scan
        chrome.tabs.sendMessage(
          tabId,
          { action: "performScan" },
          (response) => {
            const error = chrome.runtime.lastError;
            if (error) {
              debug(
                `Error sending message to content script: ${error.message}`
              );
            } else if (response) {
              debug(
                `Auto-scan completed with ${
                  response.stats?.suspicious || 0
                } suspicious URLs`
              );
            }
          }
        );
      } else {
        debug("Auto-scan disabled, skipping scan");
      }
    });
  }
});

// Function to be injected into the page that triggers scan
function triggerScan() {
  // Use custom event to avoid messaging issues
  document.dispatchEvent(new CustomEvent("url-scanner-autoscan"));
  console.log("[URL Scanner] Auto-scan triggered");
}
