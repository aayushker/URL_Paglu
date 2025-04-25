// === parser.js ===
export function extractUrlsFromPage() {
    const anchors = [...document.querySelectorAll('a[href]')];
    const urls = anchors.map(a => a.href);
    return [...new Set(urls)]; // remove duplicates
}