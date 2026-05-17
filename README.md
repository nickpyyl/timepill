# timepill

A Chrome, Edge, and Brave extension that converts selected time text into your timezone.

Select text like `8 PM CET`, `9 AM PST`, `pst 6 AM`, `9 AM New York`, or a short list of time ranges. timepill shows the converted result inline above the selection.

## Install locally

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select the cloned `timepill` folder.

## Examples

- `3pm PST`
- `14:30 UTC`
- `May 11 9:00 CET`
- `2026-05-11 18:45 GMT+2`
- `10:00 Europe/London`
- `9 AM New York`
- `LA 6am`
- `Wednesday: would either of these times (PST) work? 9-9:30 AM or 11-11:30 AM`

## Privacy

timepill runs locally in your browser. It does not collect analytics, does not use a server, and does not send selected text anywhere.

See [PRIVACY.md](PRIVACY.md) for the full privacy policy.

## Permissions

- `storage`: saves your target timezone and 24-hour time preference.
- `contextMenus`: adds a right-click conversion action for selected text.
- `activeTab` and `scripting`: opens the settings window and runs the converter on the current page after a user action.

The content script matches all pages so selected text can be converted wherever you browse.

## Development

Run the parser checks with:

```sh
node test-parser.js
```

Short timezone abbreviations can be ambiguous. For common regional abbreviations like `PST`, `PDT`, `EST`, `EDT`, `CET`, and `CEST`, the extension uses a daylight-saving-aware region when possible. When a weekday is mentioned without a date, the extension uses the next matching weekday, including today.

## License

MIT
