// === ui.js ===
export function highlightSuspiciousUrl(url) {
    const anchors = [...document.querySelectorAll(`a[href='${url}']`)];
    for (const anchor of anchors) {
        anchor.style.border = '2px solid red';
        anchor.title = '⚠️ Suspicious URL detected';
    }
}

export function showConsoleReport(results) {
    console.table(results);
}