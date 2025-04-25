# URL Scanner

A browser extension for identifying potentially malicious URLs while browsing the web.

## Features

- **Real-time URL scanning**: Automatically detects and analyzes all URLs on webpages
- **Visual highlighting**: Highlights suspicious links with warning indicators
- **Click protection**: Warns users before they click on suspicious links
- **Manual & automatic scanning**: Choose between automatic scanning or on-demand scanning
- **Configurable settings**: Control the scanning behavior to suit your needs
- **Advanced heuristics**: Uses multiple detection methods to identify suspicious URLs
- **API integration**: Option to verify URLs with external security services (configurable)

## Security Features

The extension uses the following heuristics to identify potentially suspicious URLs:

- Suspicious TLDs (.tk, .ml, .ga, etc.)
- IP addresses used instead of domain names
- Excessive number of subdomains
- Too many hyphens in domain names (common in phishing URLs)
- Non-standard ports
- Unencrypted HTTP connections
- Suspicious keywords in URLs
- Excessively long domain names
- Base64-like encoding in URLs

## Usage

1. **Installing the extension**:
   - Load the extension in your browser
   - The URL Scanner icon will appear in your extensions bar

2. **Basic usage**:
   - Click the extension icon to see the control panel
   - Toggle "Auto-scan on page load" to enable/disable automatic scanning
   - Use "Scan Current Page" to manually scan any webpage
   - View statistics about URLs found on the current page

3. **Configuration**:
   - Enable/disable highlighting of suspicious URLs
   - Enable/disable external API checking
   - Manage scanning preferences

## Privacy

This extension works locally in your browser and doesn't collect any personal data. The optional API feature sends only URLs for checking against a security database.

## License

MIT License - See LICENSE file for details.

## Author

Created by Aayushker Singh
