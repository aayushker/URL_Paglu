// === popup.js ===
// Simple debug logger
function debug(message) {
  console.log("[URL Scanner Popup] " + message);

  // Add to debug log in UI if element exists
  const debugLog = document.getElementById("debug-log");
  if (debugLog) {
    const entry = document.createElement("div");
    entry.textContent = message;
    debugLog.appendChild(entry);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  debug("Popup initialized");

  // Add a debug log area
  const debugArea = document.createElement("div");
  debugArea.id = "debug-log";
  debugArea.style.maxHeight = "100px";
  debugArea.style.overflow = "auto";
  debugArea.style.backgroundColor = "#111";
  debugArea.style.color = "#00ff00";
  debugArea.style.padding = "5px";
  debugArea.style.marginTop = "10px";
  debugArea.style.fontSize = "10px";
  debugArea.style.borderTop = "1px solid #444";
  document.body.appendChild(debugArea);

  // Get references to UI elements
  const autoScanToggle = document.getElementById("auto-scan");
  const highlightSuspiciousToggle = document.getElementById(
    "highlight-suspicious"
  );
  const useApiToggle = document.getElementById("use-api");
  const scanButton = document.getElementById("scan-now");
  const totalUrlsEl = document.getElementById("total-urls");
  const suspiciousUrlsEl = document.getElementById("suspicious-urls");
  const safeUrlsEl = document.getElementById("safe-urls");

  debug("UI elements referenced");

  // Load saved settings
  chrome.storage.sync.get(
    {
      autoScan: false,
      highlightSuspicious: true,
      useApi: false,
    },
    function (settings) {
      debug("Loaded settings: " + JSON.stringify(settings));
      autoScanToggle.checked = settings.autoScan;
      highlightSuspiciousToggle.checked = settings.highlightSuspicious;
      useApiToggle.checked = settings.useApi;
    }
  );

  // Save settings when changed
  autoScanToggle.addEventListener("change", function () {
    debug("Auto-scan setting changed to: " + this.checked);
    chrome.storage.sync.set({ autoScan: this.checked });
  });

  highlightSuspiciousToggle.addEventListener("change", function () {
    debug("Highlight-suspicious setting changed to: " + this.checked);
    chrome.storage.sync.set({ highlightSuspicious: this.checked });
  });

  useApiToggle.addEventListener("change", function () {
    debug("Use-API setting changed to: " + this.checked);
    chrome.storage.sync.set({ useApi: this.checked });
  });

  // Handle manual scan button click
  scanButton.addEventListener("click", function () {
    debug("Manual scan requested");

    // Update button state
    scanButton.innerHTML = '<span class="button-icon">⏳</span> Scanning...';
    scanButton.disabled = true;

    // Get the active tab and trigger scan
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs || !tabs[0]) {
        debug("No active tab found");
        updateStats(null);
        return;
      }

      debug("Sending scan request to tab: " + tabs[0].id);

      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: "performScan",
          useApi: useApiToggle.checked,
          highlightSuspicious: highlightSuspiciousToggle.checked,
        },
        function (response) {
          const error = chrome.runtime.lastError;
          if (error) {
            debug("Error sending message to content script: " + error.message);
            updateStats(null);
          } else {
            debug("Scan response received: " + JSON.stringify(response));
            updateStats(response);
          }
        }
      );
    });
  });

  // Function to update stats in the popup
  function updateStats(response) {
    debug("Updating stats with response: " + JSON.stringify(response));

    if (response && response.stats) {
      totalUrlsEl.textContent = response.stats.total || 0;
      suspiciousUrlsEl.textContent = response.stats.suspicious || 0;
      safeUrlsEl.textContent = response.stats.safe || 0;
    } else {
      // If no response or error, show dashes instead of zeros
      totalUrlsEl.textContent = "-";
      suspiciousUrlsEl.textContent = "-";
      safeUrlsEl.textContent = "-";

      debug("No valid response for stats");
    }

    // Reset button state
    scanButton.innerHTML =
      '<span class="button-icon">🔍</span> Scan Current Page';
    scanButton.disabled = false;
  }

  // Request current stats when popup opens
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs || !tabs[0]) {
      debug("No active tab found when requesting stats");
      return;
    }

    debug("Requesting stats from tab: " + tabs[0].id);

    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "getStats" },
      function (response) {
        const error = chrome.runtime.lastError;
        if (error) {
          debug("Error getting stats: " + error.message);
        } else if (response) {
          debug("Stats received: " + JSON.stringify(response));
          updateStats(response);
        }
      }
    );
  });
});
