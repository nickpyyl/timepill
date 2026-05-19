# Chrome Web Store Submission Notes

This file contains the suggested Chrome Web Store listing, privacy answers, permission justifications, and review notes for timepill.

## Upload package

Upload:

```text
dist/timepill-1.0.11.zip
```

The package should contain only the extension runtime files, not Git metadata, source-control files, local ZIPs, or test files.

## Store listing

Name:

```text
timepill
```

Short description:

```text
Convert selected times and timezones inline, right where you read them.
```

Detailed description:

```text
timepill converts selected time text into your timezone without leaving the page.

Select text like "9 AM PST", "8 PM CET", "pst 6 AM", "9 AM New York", or a short list of meeting slots. timepill shows a small inline pill above the selection with the converted time.

It works with common timezone abbreviations, UTC/GMT offsets, IANA timezone names, city names, and contextual time ranges.

Examples:
- 9 AM PST
- PST 6 AM
- 14:30 UTC
- 10:00 Europe/London
- 9 AM New York
- LA 6am
- Would either of these times (PST) work? 9-9:30 AM or 11-11:30 AM

timepill runs locally in your browser. It does not collect analytics, does not use a server, and does not send selected text anywhere.
```

Category:

```text
Productivity
```

Language:

```text
English
```

Homepage URL:

```text
https://github.com/nickpyyl/timepill
```

Support URL:

```text
https://github.com/nickpyyl/timepill/issues
```

Privacy policy URL:

```text
https://github.com/nickpyyl/timepill/blob/main/PRIVACY.md
```

Use this GitHub privacy URL only after the repository is public. If the repository is private when submitting, host the privacy policy at a public URL first.

## Privacy tab

Single purpose:

```text
timepill converts selected time text, timezones, and city-based time references into the user's chosen timezone inline on the current webpage.
```

Data collection:

```text
Does not collect user data.
```

Remote code:

```text
No, timepill does not execute remote code.
```

Data use certification:

Use the Chrome Web Store certification checkboxes that confirm:

- Data is not sold or transferred.
- Data is not used for unrelated purposes.
- Data is not used for creditworthiness or lending.

timepill does not collect data, so these should be straightforward.

## Permission justifications

`storage`

```text
Used to save the user's target timezone and 12-hour/24-hour display preference.
```

`contextMenus`

```text
Used to add a right-click menu item for converting selected time text.
```

`activeTab`

```text
Used when the user clicks the extension toolbar icon so timepill can open its settings panel on the current tab.
```

`scripting`

```text
Used to inject the settings panel and conversion UI after a user action, such as clicking the toolbar icon or context menu item.
```

Host access / content script on all URLs:

```text
Used so timepill can detect selected time text and show the converted time inline on any webpage where the user selects text. Selected text is processed locally in the browser and is not transmitted.
```

## Test instructions for reviewers

```text
1. Open any normal webpage.
2. Select text containing a time and timezone, for example "9 AM PST".
3. Confirm that a small pill appears above the selection with the converted time.
4. Try a contextual range, for example "Would either of these times (PST) work? 9-9:30 AM or 11-11:30 AM".
5. Click the extension toolbar icon to open settings.
6. Change the target timezone or toggle 24-hour time, then repeat the selection test.
7. Right-click selected time text and use "Convert ... to my timezone" to confirm the context-menu path.
```

No account, credentials, payment, or external service is required for testing.

## Required listing assets

Chrome Web Store requires:

- 128x128 PNG extension icon in the ZIP.
- Small promotional image: 440x280.
- At least one screenshot: 1280x800 preferred, 640x400 accepted.

Prepared assets:

- `store-assets/small-promo-440x280.png`
- `store-assets/screenshot-inline-1280x800.png`
- `store-assets/screenshot-settings-1280x800.png`

The SVG sources live next to the PNGs. Regenerate the PNGs with:

```sh
swift -module-cache-path /private/tmp/timepill-swift-module-cache scripts/make-store-assets.swift
```

## Submission flow

1. Open the Chrome Developer Dashboard.
2. Add a new item.
3. Upload `dist/timepill-1.0.11.zip`.
4. Fill Store Listing, Privacy, Distribution, and Test Instructions.
5. Upload the required images.
6. Submit for review.
