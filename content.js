// === content.js ===
// Direct debugging output
window._urlScanner = { logs: [] };

function debug(message) {
  // Log to browser console
  console.log(message);
  
  // Also store in global object for debugging
  window._urlScanner.logs.push({
    time: new Date().toISOString(),
    message: message
  });
  
  // Try to add to page for visibility
  try {
    const debugArea = document.getElementById('url-scanner-debug-log');
    if (debugArea) {
      const entry = document.createElement('div');
      entry.textContent = message;
      debugArea.appendChild(entry);
    }
  } catch(e) {
    // Ignore DOM errors
  }
}

// Log that content script loaded
debug('URL SCANNER: Content script loaded on ' + window.location.href);

// Make a very visible indicator that the script is running
setTimeout(() => {
  try {
    const debugIndicator = document.createElement('div');
    debugIndicator.style.position = 'fixed';
    debugIndicator.style.top = '0';
    debugIndicator.style.right = '0';
    debugIndicator.style.backgroundColor = 'red';
    debugIndicator.style.color = 'white';
    debugIndicator.style.padding = '5px';
    debugIndicator.style.zIndex = '9999999';
    debugIndicator.style.fontSize = '12px';
    debugIndicator.textContent = 'URL Scanner Active';
    debugIndicator.id = 'url-scanner-debug';
    
    // Add debug log area
    const logArea = document.createElement('div');
    logArea.id = 'url-scanner-debug-log';
    logArea.style.position = 'fixed';
    logArea.style.top = '30px';
    logArea.style.right = '0';
    logArea.style.width = '300px';
    logArea.style.maxHeight = '200px';
    logArea.style.overflowY = 'auto';
    logArea.style.backgroundColor = 'rgba(0,0,0,0.8)';
    logArea.style.color = 'white';
    logArea.style.padding = '5px';
    logArea.style.zIndex = '9999998';
    logArea.style.fontSize = '10px';
    
    document.body.appendChild(debugIndicator);
    document.body.appendChild(logArea);
    
    debug('URL SCANNER: Debug UI elements added to page');
  } catch(e) {
    console.error('Failed to add debug elements:', e);
  }
}, 1000);

// Global variables to track state
let scanResults = {
  total: 0,
  suspicious: 0,
  safe: 0,
  urls: []
};

// Function to extract URLs from the page
function extractUrlsFromPage() {
  console.log('[URL Scanner] Extracting URLs from page...');
  
  const linkElements = document.querySelectorAll('a[href], area[href], link[href]');
  const scriptElements = document.querySelectorAll('script[src]');
  const imageElements = document.querySelectorAll('img[src]');
  const iframeElements = document.querySelectorAll('iframe[src]');
  const videoElements = document.querySelectorAll('video[src], source[src]');
  
  console.log(`[URL Scanner] Found elements: ${linkElements.length} links, ${scriptElements.length} scripts, ${imageElements.length} images, ${iframeElements.length} iframes, ${videoElements.length} videos`);
  
  const urls = [];
  
  // Helper to extract and validate URLs
  const addUrlIfValid = (url) => {
    try {
      // Skip empty urls and javascript: urls
      if (!url || url.startsWith('javascript:') || url.startsWith('#')) {
        return;
      }
      
      // Create an absolute URL from relative ones
      const absoluteUrl = new URL(url, window.location.href).href;
      urls.push(absoluteUrl);
    } catch (e) {
      console.log(`[URL Scanner] Error parsing URL: ${url}`, e.message);
    }
  };
  
  // Process all URL-containing elements
  linkElements.forEach(el => addUrlIfValid(el.href));
  scriptElements.forEach(el => addUrlIfValid(el.src));
  imageElements.forEach(el => addUrlIfValid(el.src));
  iframeElements.forEach(el => addUrlIfValid(el.src));
  videoElements.forEach(el => addUrlIfValid(el.src));
  
  // Remove duplicates by converting to Set and back to Array
  const uniqueUrls = [...new Set(urls)];
  console.log(`[URL Scanner] Extracted ${urls.length} URLs, ${uniqueUrls.length} unique URLs`);
  
  return uniqueUrls;
}

// Function to check if a URL is suspicious using heuristics
function isSuspiciousUrl(url) {
  console.log(`[URL Scanner] Analyzing URL: ${url.substring(0, 100)}${url.length > 100 ? '...' : ''}`);
  
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    
    // List of potentially suspicious patterns
    const suspiciousPatterns = [
      // Suspicious TLDs
      { 
        name: 'Suspicious TLD',
        check: url => /\.(tk|ml|ga|cf|gq)$/i.test(new URL(url).hostname)
      },
      // IP addresses as hostnames
      { 
        name: 'IP Address as hostname',
        check: url => /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i.test(url)
      },
      // Excessive subdomains
      { 
        name: 'Excessive subdomains',
        check: url => new URL(url).hostname.split('.').length > 5
      },
      // Too many hyphens (potential phishing)
      { 
        name: 'Too many hyphens',
        check: url => new URL(url).hostname.split('-').length > 4
      },
      // Unusual ports
      { 
        name: 'Unusual port',
        check: url => {
          const port = new URL(url).port;
          return port && ![80, 443, 8080, 8443].includes(parseInt(port));
        }
      },
      // HTTP protocol (not HTTPS)
      { 
        name: 'Using HTTP (not HTTPS)',
        check: url => new URL(url).protocol === 'http:'
      },
      // Suspicious URL keywords
      { 
        name: 'Suspicious keywords',
        check: url => /\b(login|bank|account|secure|verify|wallet|payment|update|confirm)\b/i.test(url) && 
               !/\b(google|microsoft|apple|amazon|paypal|facebook)\b/i.test(new URL(url).hostname)
      },
      // Very long hostnames (potential algorithm-generated domains)
      { 
        name: 'Excessively long hostname',
        check: url => new URL(url).hostname.length > 40
      },
      // Base64-like strings in URL
    //   { 
    //     name: 'Base64-like string',
    //     check: url => /[a-zA-Z0-9+/]{20,}={0,2}/i.test(url)
    //   }
    ];
    
    // Check against all patterns
    for (const pattern of suspiciousPatterns) {
      if (pattern.check(url)) {
        console.log(`[URL Scanner] URL flagged as suspicious: ${url.substring(0, 75)}${url.length > 75 ? '...' : ''} - Reason: ${pattern.name}`);
        return true;
      }
    }
    
    console.log(`[URL Scanner] URL appears safe: ${url.substring(0, 75)}${url.length > 75 ? '...' : ''}`);
    return false;
  } catch (e) {
    // If we can't parse the URL, consider it suspicious
    console.log(`[URL Scanner] Error analyzing URL: ${url} - ${e.message}`);
    return true;
  }
}

// Function to check URLs via external API
async function checkUrlsWithAPI(urls) {
  console.log(`[URL Scanner] Checking ${urls.length} URLs with external API...`);
  
  try {
    // In a real implementation, this would call a real malicious URL API
    // For demonstration, we'll simulate an API response
    console.log('[URL Scanner] API URL List:', urls);
    
    // Simulate API delay
    console.log('[URL Scanner] API request sent, awaiting response...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demonstration, we'll mark random URLs as suspicious
    const results = urls.map(url => {
      const isMalicious = Math.random() < 0.2; // 20% chance of being malicious
      const confidence = Math.floor(Math.random() * 100);
      
      if (isMalicious) {
        console.log(`[URL Scanner] API flagged URL as malicious (${confidence}% confidence): ${url.substring(0, 75)}${url.length > 75 ? '...' : ''}`);
      }
      
      return {
        url,
        status: isMalicious ? 'malicious' : 'safe',
        confidence: confidence
      };
    });
    
    console.log(`[URL Scanner] API check complete: ${results.filter(r => r.status === 'malicious').length} malicious URLs found`);
    return results;
  } catch (err) {
    console.error('[URL Scanner] API Error:', err);
    return urls.map(url => ({ url, status: 'unknown', confidence: 0 }));
  }
}

// Function to highlight suspicious URLs in the page
function highlightSuspiciousUrls(suspiciousUrls) {
  console.log(`[URL Scanner] Highlighting ${suspiciousUrls.length} suspicious URLs on page`);
  
  if (!suspiciousUrls || !suspiciousUrls.length) {
    console.log('[URL Scanner] No suspicious URLs to highlight');
    return;
  }
  
  // Find all links on the page
  const links = document.querySelectorAll('a[href]');
  console.log(`[URL Scanner] Checking ${links.length} links against ${suspiciousUrls.length} suspicious URLs`);
  
  // Create a Set for faster lookups
  const suspiciousSet = new Set(suspiciousUrls);
  
  // Counter for highlighted links
  let highlightedCount = 0;
  
  // Check each link
  links.forEach(link => {
    try {
      const href = link.href;
      if (suspiciousSet.has(href)) {
        // Apply styling to suspicious links
        link.style.border = '2px solid #ff3d00';
        link.style.backgroundColor = 'rgba(255, 61, 0, 0.1)';
        link.style.padding = '2px 4px';
        link.style.borderRadius = '3px';
        
        // Add warning icon
        if (!link.querySelector('.url-scanner-warning')) {
          const warningIcon = document.createElement('span');
          warningIcon.textContent = ' ⚠️ ';
          warningIcon.className = 'url-scanner-warning';
          warningIcon.title = 'This URL may be suspicious';
          link.appendChild(warningIcon);
        }
        
        // Add a click warning
        link.addEventListener('click', function(e) {
          console.log(`[URL Scanner] User clicked on suspicious link: ${href}`);
          if (!confirm('Warning: This link appears suspicious. Do you still want to proceed?')) {
            console.log('[URL Scanner] User canceled navigation to suspicious URL');
            e.preventDefault();
          } else {
            console.log('[URL Scanner] User proceeded to suspicious URL despite warning');
          }
        }, { once: true });
        
        highlightedCount++;
        console.log(`[URL Scanner] Highlighted suspicious link: ${href.substring(0, 75)}${href.length > 75 ? '...' : ''}`);
      }
    } catch (e) {
      console.error(`[URL Scanner] Error highlighting URL: ${e.message}`);
    }
  });
  
  console.log(`[URL Scanner] Highlighting complete. ${highlightedCount} links highlighted on page`);
}

// Main scan function
async function performScan(options = {}) {
  debug('URL SCANNER: Starting scan');
  
  const useApi = options.useApi || false;
  const highlightSuspicious = options.highlightSuspicious !== false;
  
  console.log(`[URL Scanner] Scan parameters - API: ${useApi ? 'Enabled' : 'Disabled'}, Highlighting: ${highlightSuspicious ? 'Enabled' : 'Disabled'}`);
  
  const startTime = performance.now();
  
  // Extract all URLs from the page
  console.log('[URL Scanner] Step 1: Extracting URLs from page');
  const urls = extractUrlsFromPage();
  
  // Analyze URLs with local heuristics
  console.log('[URL Scanner] Step 2: Analyzing URLs with local heuristics');
  const suspiciousUrls = [];
  const safeUrls = [];
  
  urls.forEach(url => {
    if (isSuspiciousUrl(url)) {
      suspiciousUrls.push(url);
    } else {
      safeUrls.push(url);
    }
  });
  
  // Update scan results
  scanResults = {
    total: urls.length,
    suspicious: suspiciousUrls.length,
    safe: safeUrls.length,
    urls: urls,
    suspiciousUrls: suspiciousUrls,
    timestamp: new Date().toISOString()
  };
  
  console.log('[URL Scanner] Local heuristic analysis results:', {
    total: scanResults.total,
    suspicious: scanResults.suspicious,
    safe: scanResults.safe
  });
  
  // Highlight suspicious URLs if enabled
  if (highlightSuspicious && suspiciousUrls.length > 0) {
    console.log('[URL Scanner] Step 3: Highlighting suspicious URLs');
    highlightSuspiciousUrls(suspiciousUrls);
  } else if (!highlightSuspicious) {
    console.log('[URL Scanner] URL highlighting disabled, skipping highlight step');
  } else {
    console.log('[URL Scanner] No suspicious URLs to highlight');
  }
  
  // If API checking is enabled, perform additional check
  if (useApi) {
    console.log('[URL Scanner] Step 4: Performing external API check');
    const apiResults = await checkUrlsWithAPI(urls);
    
    // Process API results
    const apiSuspiciousUrls = apiResults
      .filter(result => result.status === 'malicious')
      .map(result => result.url);
      
    console.log(`[URL Scanner] API identified ${apiSuspiciousUrls.length} suspicious URLs`);
    
    if (highlightSuspicious && apiSuspiciousUrls.length > 0) {
      console.log('[URL Scanner] Highlighting API-flagged suspicious URLs');
      highlightSuspiciousUrls(apiSuspiciousUrls);
    }
    
    // Update scan results with API data
    scanResults.apiResults = apiResults;
    scanResults.apiSuspicious = apiSuspiciousUrls.length;
  } else {
    console.log('[URL Scanner] External API check disabled, skipping API step');
  }
  
  const endTime = performance.now();
  const scanDuration = (endTime - startTime).toFixed(2);
  
  console.log(`[URL Scanner] Scan completed in ${scanDuration}ms:`, {
    total: scanResults.total,
    suspiciousLocal: scanResults.suspicious,
    suspiciousApi: scanResults.apiSuspicious || 'N/A (API disabled)',
    safe: scanResults.safe
  });
  
  return scanResults;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  debug('URL SCANNER: Message received: ' + JSON.stringify(message));
  
  if (message.action === 'performScan') {
    debug('URL SCANNER: Performing scan from popup request');
    performScan({
      useApi: message.useApi,
      highlightSuspicious: message.highlightSuspicious
    }).then(results => {
      debug('URL SCANNER: Scan complete, sending results to popup');
      sendResponse({ success: true, stats: results });
    }).catch(error => {
      console.error('[URL Scanner] Error during scan:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // Indicate we will send a response asynchronously
  }
  
  if (message.action === 'getStats') {
    debug('URL SCANNER: Stats requested from popup, sending current results');
    sendResponse({ stats: scanResults });
  }
});

// Listen for custom event from background script
document.addEventListener('url-scanner-autoscan', () => {
  console.log('[URL Scanner] Auto-scan triggered by event');
  performScan();
});

// Check if auto-scan is enabled when page loads
console.log('[URL Scanner] Checking auto-scan settings');
chrome.storage.sync.get({ autoScan: false }, function(settings) {
  console.log(`[URL Scanner] Auto-scan setting: ${settings.autoScan ? 'Enabled' : 'Disabled'}`);
  
  if (settings.autoScan) {
    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      console.log('[URL Scanner] Page already loaded, starting auto-scan');
      performScan();
    } else {
      console.log('[URL Scanner] Page not fully loaded, setting up load event listener');
      window.addEventListener('load', () => {
        console.log('[URL Scanner] Page loaded, starting auto-scan');
        performScan();
      });
    }
  } else {
    console.log('[URL Scanner] Auto-scan disabled, waiting for manual scan');
  }
});

// Run a scan on page load to test
setTimeout(() => {
  debug('URL SCANNER: Running initial test scan');
  performScan();
}, 2000);