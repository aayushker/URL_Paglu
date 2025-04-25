// // Browser compatibility diagnostic for Chrome Extensions

// console.log("=== Chrome Extension Diagnostic Tool ===");

// // Check if extension APIs are available
// console.log("\nTesting extension API availability:");
// console.log("chrome object exists:", typeof chrome !== 'undefined');
// console.log("chrome.runtime exists:", typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined');
// console.log("chrome.storage exists:", typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined');
// console.log("chrome.tabs exists:", typeof chrome !== 'undefined' && typeof chrome.tabs !== 'undefined');

// // Check for Content Script context
// console.log("\nContent Script Environment:");
// const isContentScript = (
//   typeof chrome !== 'undefined' && 
//   typeof chrome.runtime !== 'undefined' && 
//   typeof chrome.runtime.onMessage !== 'undefined'
// );
// console.log("Appears to be in a content script context:", isContentScript);

// // Check for Manifest V3 specific features
// console.log("\nManifest V3 Support:");
// const hasServiceWorkerAPI = (
//   typeof chrome !== 'undefined' && 
//   typeof chrome.scripting !== 'undefined'
// );
// console.log("chrome.scripting API (Manifest V3):", hasServiceWorkerAPI);

// // Check for browser console access
// console.log("\nConsole Access:");
// console.log("console.log available:", typeof console !== 'undefined' && typeof console.log === 'function');
// console.log("Sample log message - this should appear in console");

// // DOM Access check
// console.log("\nDOM Access:");
// try {
//   document.body.dataset.diagnosticTest = 'true';
//   console.log("Can modify DOM:", document.body.dataset.diagnosticTest === 'true');
//   delete document.body.dataset.diagnosticTest;
// } catch (e) {
//   console.log("Cannot modify DOM:", e.message);
// }

// // Extension messaging test
// console.log("\nMessaging Tests:");
// if (typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined') {
//   try {
//     chrome.runtime.sendMessage(
//       { action: 'diagnostic_test', message: 'Test message' },
//       response => {
//         const error = chrome.runtime.lastError;
//         if (error) {
//           console.log("Messaging test failed:", error.message);
//         } else {
//           console.log("Messaging test succeeded:", response);
//         }
//       }
//     );
//     console.log("Messaging API appears available (result will be async)");
//   } catch (e) {
//     console.log("Messaging API error:", e.message);
//   }
// } else {
//   console.log("Messaging API unavailable (chrome.runtime not found)");
// }

// console.log("\n=== Diagnostic Complete ==="); 