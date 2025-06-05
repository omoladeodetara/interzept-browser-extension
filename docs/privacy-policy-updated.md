# Interzept Privacy Policy

**Last updated: June 6, 2025**

## Overview

Interzept is a Chrome browser extension designed for developers to intercept, mock, and override HTTP API requests for testing and debugging purposes. This privacy policy explains how the extension handles data and what information is collected, stored, and processed.

## 1. Information We Collect and Store

### User-Created Configuration Data
The Interzept extension stores the following data locally and syncs it across your Chrome browsers:

- **Interception Rules**: Custom rules you create for intercepting and modifying API requests
- **API Response Overrides**: Mock response data, status codes, and headers you configure
- **URL Patterns**: Website URL patterns where your rules should be applied
- **Rule Settings**: Enable/disable states, rule names, descriptions, and configurations
- **Extension Preferences**: Settings related to the extension's operation

### Technical Data Processed
- **HTTP Request URLs**: The extension analyzes request URLs to apply your configured rules
- **Request Headers**: Processed to apply header modifications as configured in your rules
- **Response Data**: Generated mock responses based on your configured override rules

## 2. How We Use Information

### Core Functionality
- **Request Interception**: Using Chrome's `declarativeNetRequest` API to intercept HTTP requests matching your configured patterns
- **Response Override**: Replacing API responses with your custom mock data for testing purposes
- **Rule Management**: Storing and syncing your configuration across Chrome browsers signed into the same Google account
- **Local Processing**: All rule processing happens locally in your browser

### No Remote Data Transmission
- The extension does not send your configuration data or intercepted requests to external servers
- All functionality operates locally within your browser environment
- No analytics or tracking of your browsing behavior

## 3. Data Storage and Synchronization

### Chrome Sync Storage
- Configuration data is stored using Chrome's built-in sync storage
- Data automatically syncs across your Chrome browsers when signed into the same Google account
- Storage is managed by Google's Chrome infrastructure, not our servers

### Local Storage
- Temporary data and session information may be stored locally
- No sensitive information is permanently stored outside of Chrome's secure storage

## 4. Permissions and Access

### Required Permissions
The extension requires the following Chrome permissions:

- **`storage`**: To save and sync your configuration rules across devices
- **`declarativeNetRequest`**: To intercept and modify HTTP requests as configured
- **`host_permissions` (http://*/*, https://*/*)**: To apply rules on websites you visit

### Data Access Scope
- The extension only processes HTTP/HTTPS requests that match your configured URL patterns
- No access to personal information, passwords, or sensitive data unless specifically configured in your rules
- Does not monitor or store browsing history outside of rule application

## 5. Data Sharing and Third Parties

### No Data Sharing
- We do not share, sell, rent, or trade any user data with third parties
- All processing happens locally in your browser
- No external servers receive your configuration data or intercepted requests

### Website Interactions
- The extension only interacts with websites to apply your configured interception rules
- Does not modify or access website content beyond the specific API endpoints you've configured

## 6. Data Security

### Local Security
- All data remains within your browser's secure storage environment
- Configuration data is protected by Chrome's built-in security mechanisms
- No transmission of sensitive data to external servers

### User Control
- You have complete control over all stored data
- Can delete rules and configurations at any time through the extension interface
- Uninstalling the extension removes all associated data

## 7. Your Rights and Control

### Data Management
- **View**: Access all your configured rules through the extension's options page
- **Edit**: Modify or update any stored configuration at any time
- **Delete**: Remove individual rules or clear all data
- **Export**: Download your configuration as a JSON file for backup
- **Import**: Restore configuration from backup files

### Extension Control
- Enable or disable the extension at any time
- Control which websites the extension can access through Chrome's permission system
- Uninstall the extension to completely remove all data

## 8. Children's Privacy

This extension is designed for developers and is not intended for use by children under 13. We do not knowingly collect personal information from children under 13.

## 9. Analytics and Tracking

### Extension Analytics
- The extension itself contains no analytics, tracking, or data collection mechanisms
- No usage statistics or behavior tracking

### Website Analytics
- This privacy policy website may use analytics (such as Vercel Analytics) to understand visitor interactions
- The extension operates independently and does not participate in any website analytics

## 10. International Data Transfers

Since all data processing happens locally in your browser and syncs through Google Chrome's infrastructure, data handling follows Google's data transfer and storage policies for Chrome Sync.

## 11. Changes to This Policy

We may update this privacy policy to reflect changes in the extension's functionality or legal requirements. Any changes will be posted with an updated revision date. Continued use of the extension after changes constitutes acceptance of the updated policy.

## 12. Contact Information

If you have questions about this privacy policy or the extension's data handling:

- **Email**: omoladeodetara[at]gmail[dot]com
- **GitHub**: Issues can be reported on the [extension's GitHub repository](https://github.com/omoladeodetara/interzept-browser-extension)

## 13. Legal Compliance

This extension is designed to comply with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- Other applicable data protection laws

---

**© 2025 Interzept. All rights reserved.**

*This privacy policy applies specifically to the Interzept Chrome browser extension and its data handling practices.*
