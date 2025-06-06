# Chrome Web Store Developer Program Policies Submission

## Extension Information
- **Name**: Interzept
- **Status**: Published - public
- **ID**: [REDACTED]

## Sections
- Version
- State
- Package
- Play Store Sheet
- Confidentiality
- Distribution
- Access
- Test Instructions
- Analytics
- Installations and uninstallations
- Impressions
- Users
- Notes
- User Support
- Confidentiality

---

## Chrome Web Store Compliance Form

To help your extension comply with the Chrome Web Store Developer Program Policies, you'll need to provide the information requested below. The information you enter on this form will be shared with the Chrome Web Store team. Please ensure it's accurate to expedite the review process and reduce the risk of your extension being rejected.

### Single Objective
*An extension should have a single purpose that is both specific and easy to understand.*

**Description of the single objective:**
This Chrome extension enables developers to intercept, mock, and override HTTP API requests directly within their browser for testing and debugging purposes. The extension provides an interface for creating rules that modify API responses in real-time, allowing developers to test application behavior without modifying backend services. Users can create override rules through the extension's options page.

*Character count: 598/1000*

---

### Justification of Authorizations

**Are you using remote code?**
- [x] No, I don't use "Remote Code"
- [ ] Yes, I use "Remote Code"

**Justification:**
The extension operates entirely with code bundled within the extension package. No external JavaScript files, remote modules, or eval() statements are used.

> **Note:** Remote code refers to any JS or Wasm code not included in the extension's package. This includes references to external files in `<script>` tags, modules pointing to external files, and strings evaluated via `eval()`.

---

### Permission Justifications

**Justification for storage authorization:**
The "storage" permission is essential for saving user-created interception rules, mock response configurations, and extension settings. This data is stored locally using Chrome's sync storage API, allowing users to maintain their configurations across devices signed into the same Google account. Without this permission, users would lose their configured rules every time they close the browser, making the extension unusable for its core purpose of persistent API request interception and mocking.

*Character count: 498/1000*

**Justification for declarativeNetRequest authorization:**
The "declarativeNetRequest" permission is the core functionality of this extension. It enables the interception, modification, and overriding of HTTP API requests as they occur. This permission allows the extension to apply user-defined rules that mock API responses, modify request headers, and redirect requests for testing and debugging purposes. This is the primary and sole purpose of the extension - without this permission, the extension cannot perform its intended function of API request interception.

*Character count: 522/1000*

**Justification for Host access authorization (http://*/*, https://*/*):**
Host permissions for all HTTP and HTTPS sites are necessary because developers need to test API calls across various domains and environments. The extension must be able to intercept requests on any website where the user is testing their applications - this includes localhost development servers, staging environments, production sites, and third-party APIs. Restricting to specific domains would severely limit the extension's utility for developers who work across multiple projects and environments.

*Character count: 548/1000*

---

### Data Consumption
*The contents of this form will be displayed publicly on the item's information page. By publishing your item, you certify that this information reflects the latest version of your privacy policy.*

**What data do you plan to collect from users, now or in the future?**

#### Data Types:
- [ ] **Information that personally identifies the user**
  - *For example: name, address, email address, age or ID number*

- [ ] **Health information**
  - *For example: heart rate data, medical records, symptoms, diagnoses or procedures*

- [ ] **Financial and payment information**
  - *For example: transactions, credit card numbers, credit reports, bank statements or payment history*

- [ ] **Authentication information**
  - *For example: passwords, identifiers, secret question or secret code*

- [ ] **Personal communications**
  - *For example: emails, SMS or chat messages*

- [ ] **Location**
  - *For example: region, IP address, GPS coordinates or information about points of interest near the user's device*

- [ ] **Web History**
  - *The list of web pages visited by the user, as well as associated data, such as the title of the page and the time of the visit*

- [ ] **User activity**
  - *For example: network monitoring, clicks, mouse position, recording of scrolling movements or keyboard keys*

- [x] **Website Content**
  - *For example: text, images, sounds, videos or hyperlinks*
  - **Justification:** The extension processes HTTP request URLs and response data to apply user-configured interception rules. This processing happens locally for the sole purpose of modifying API responses for testing and debugging.

#### Additional Data Handling:
**User Configuration Data:** The extension stores user-created interception rules, mock response configurations, and settings using Chrome's sync storage. This data includes:
- Custom interception rules and patterns
- Mock API response data and headers
- Extension preferences and settings
- Rule enable/disable states

This data is stored locally and synced via Chrome's infrastructure - never transmitted to external servers.

#### Required Certifications:
- [x] I do not sell or transfer user data to third parties outside of approved use cases.
- [x] I do not use or transfer user data for purposes unrelated to the core functionality of my article.
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes.

> **Note:** You must check all three boxes to comply with our Developer Program Rules

---

### Privacy Policy
*If an extension collects user data, it must have privacy policies.*

**Privacy Policy URL:** https://interzept.dev/privacy
*Character count: 29/2048*

---

## Additional Resources
- Developer's Guide
- Useful tools
- Google Analytics

## Support
- Do you need help? Contact us
- Send feedback

---

*© 2025 Google - Developer Agreement - Google Privacy Policy - Confidentialité*
