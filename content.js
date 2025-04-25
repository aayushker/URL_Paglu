(function () {
    const start = performance.now();
  
    const elements = document.querySelectorAll('a[href], script[src], img[src], iframe[src]');
    const urls = Array.from(elements)
      .map(el => el.href || el.src)
      .filter(Boolean)
      .filter(url => {
        try {
          const parsed = new URL(url);
          return ['http:', 'https:'].includes(parsed.protocol);
        } catch (err) {
          return false; // skip invalid URLs like 'javascript:void(0)'
        }
      });
  
    const end = performance.now();
    console.log(`[URL Scanner] Found ${urls.length} useful URLs in ${(end - start).toFixed(2)}ms`);
    console.log(urls);
    
    // TODO: Uncomment and update this part later for API integration
    /*
    fetch("https://your-api.com/check-malicious", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ urls })
    })
    .then(res => res.json())
    .then(data => console.log("[API Response]", data))
    .catch(err => console.error("[API Error]", err));
    */
  })();

  