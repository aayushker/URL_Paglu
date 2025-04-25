// === heuristics.js ===
export function isSuspiciousUrl(url) {
    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname;
        const badTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq'];
        const hasIP = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
        const tooManyHyphens = hostname.split('-').length > 5;
        const isHttp = parsed.protocol === 'http:';

        return (
            badTLDs.some(tld => hostname.endsWith(tld)) ||
            hasIP ||
            tooManyHyphens ||
            isHttp
        );
    } catch (err) {
        return false;
    }
}