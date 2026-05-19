(function () {
  "use strict";

  if (window.__clickTimeConverterVersion === "1.0.11") {
    return;
  }
  window.__clickTimeConverterVersion = "1.0.11";

  const STORAGE_KEY = "ctcSettings";
  const DEFAULT_SETTINGS = {
    enabled: true,
    hour12: null,
    showDate: true,
    targetTimeZone: "local"
  };
  const TIME_ZONES = [
    "local",
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Amsterdam",
    "Europe/Berlin",
    "Europe/Paris",
    "Asia/Kolkata",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Australia/Sydney"
  ];

  const TZ_ABBREVIATIONS = {
    UTC: 0,
    GMT: 0,
    Z: 0,
    EST: -5,
    EDT: -4,
    ET: -5,
    CST: -6,
    CDT: -5,
    CT: -6,
    MST: -7,
    MDT: -6,
    MT: -7,
    PST: -8,
    PDT: -7,
    PT: -8,
    AKST: -9,
    AKDT: -8,
    HST: -10,
    CET: 1,
    CEST: 2,
    WET: 0,
    WEST: 1,
    EET: 2,
    EEST: 3,
    BST: 1,
    IST: 5.5,
    JST: 9,
    KST: 9,
    AEST: 10,
    AEDT: 11,
    ACST: 9.5,
    ACDT: 10.5,
    AWST: 8,
    NZST: 12,
    NZDT: 13
  };
  const TZ_REGION_ALIASES = {
    EST: "America/New_York",
    EDT: "America/New_York",
    ET: "America/New_York",
    CST: "America/Chicago",
    CDT: "America/Chicago",
    CT: "America/Chicago",
    MST: "America/Denver",
    MDT: "America/Denver",
    MT: "America/Denver",
    PST: "America/Los_Angeles",
    PDT: "America/Los_Angeles",
    PT: "America/Los_Angeles",
    AKST: "America/Anchorage",
    AKDT: "America/Anchorage",
    CET: "Europe/Berlin",
    CEST: "Europe/Berlin",
    WET: "Europe/Lisbon",
    WEST: "Europe/Lisbon",
    EET: "Europe/Athens",
    EEST: "Europe/Athens",
    BST: "Europe/London",
    AEST: "Australia/Sydney",
    AEDT: "Australia/Sydney",
    ACST: "Australia/Adelaide",
    ACDT: "Australia/Adelaide",
    AWST: "Australia/Perth",
    NZST: "Pacific/Auckland",
    NZDT: "Pacific/Auckland"
  };
  const CITY_TIME_ZONE_ALIASES = [
    [["new york city", "new york", "nyc", "ny"], "America/New_York"],
    [["los angeles", "la"], "America/Los_Angeles"],
    [["san francisco", "sf"], "America/Los_Angeles"],
    [["seattle"], "America/Los_Angeles"],
    [["chicago"], "America/Chicago"],
    [["denver"], "America/Denver"],
    [["austin"], "America/Chicago"],
    [["dallas"], "America/Chicago"],
    [["houston"], "America/Chicago"],
    [["boston"], "America/New_York"],
    [["miami"], "America/New_York"],
    [["atlanta"], "America/New_York"],
    [["toronto"], "America/Toronto"],
    [["vancouver"], "America/Vancouver"],
    [["london"], "Europe/London"],
    [["amsterdam"], "Europe/Amsterdam"],
    [["berlin"], "Europe/Berlin"],
    [["paris"], "Europe/Paris"],
    [["madrid"], "Europe/Madrid"],
    [["rome"], "Europe/Rome"],
    [["lisbon"], "Europe/Lisbon"],
    [["tokyo"], "Asia/Tokyo"],
    [["singapore"], "Asia/Singapore"],
    [["kolkata", "calcutta"], "Asia/Kolkata"],
    [["mumbai"], "Asia/Kolkata"],
    [["delhi", "new delhi"], "Asia/Kolkata"],
    [["bangalore", "bengaluru"], "Asia/Kolkata"],
    [["sydney"], "Australia/Sydney"],
    [["melbourne"], "Australia/Melbourne"]
  ];

  const MONTHS = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11
  };
  const WEEKDAYS = {
    sunday: 0,
    sun: 0,
    monday: 1,
    mon: 1,
    tuesday: 2,
    tue: 2,
    tues: 2,
    wednesday: 3,
    wed: 3,
    thursday: 4,
    thu: 4,
    thur: 4,
    thurs: 4,
    friday: 5,
    fri: 5,
    saturday: 6,
    sat: 6
  };

  const IANA_ZONE_PATTERN = "[A-Za-z_]+\\/[A-Za-z_\\/-]+";
  const ZONE_PATTERN = `(?:${IANA_ZONE_PATTERN}|(?:UTC|GMT)\\s*[+-]\\s*\\d{1,2}(?::?\\d{2})?|[A-Z]{1,5})`;
  const CITY_PATTERN = `\\b(?:${buildCityPattern()})\\b`;
  const TIME_PATTERN = "\\d{1,2}(?::\\d{2})?\\s*(?:am|pm|AM|PM)?";
  const DATE_PREFIX_PATTERN = "(?:(?:\\d{4}-\\d{1,2}-\\d{1,2})|(?:\\d{1,2}[\\/-]\\d{1,2}(?:[\\/-]\\d{2,4})?)|(?:(?:Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)\\.?\\s+\\d{1,2}(?:,?\\s+\\d{4})?))";
  const DATE_CONTEXT_PATTERN = `(?:${DATE_PREFIX_PATTERN}|tomorrow|(?:sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?))`;
  const TIME_ZONE_RE = new RegExp(`(?:${DATE_PREFIX_PATTERN}\\s+)?${TIME_PATTERN}\\s*(?:-|–|—|at|:)?\\s*\\(?\\s*${ZONE_PATTERN}\\s*\\)?`, "gi");
  const ZONE_TIME_RE = new RegExp(`\\(?\\s*${ZONE_PATTERN}\\s*\\)?\\s*(?:-|–|—|at|:)?\\s*(?:${DATE_PREFIX_PATTERN}\\s+)?${TIME_PATTERN}`, "gi");
  const TIME_CITY_RE = new RegExp(`(?:${DATE_CONTEXT_PATTERN}\\s+)?${TIME_PATTERN}\\s*(?:-|–|—|at|in|for|:)?\\s*\\(?\\s*${CITY_PATTERN}\\s*\\)?`, "gi");
  const CITY_TIME_RE = new RegExp(`\\(?\\s*${CITY_PATTERN}\\s*\\)?\\s*(?:-|–|—|at|in|for|:)?\\s*(?:${DATE_CONTEXT_PATTERN}\\s+)?${TIME_PATTERN}`, "gi");
  const TIME_RANGE_RE = /\b(\d{1,2}(?::\d{2})?)[ \t]*(am|pm)?(?:[ \t]*(?:-|–|—)[ \t]*|\s+to\s+)(\d{1,2}(?::\d{2})?)[ \t]*(am|pm)?\b/gi;
  const TIME_SINGLE_RE = /\b(\d{1,2}(?::\d{2})?)\s*(am|pm)\b|\b(\d{1,2}:\d{2})\b/gi;

  let settings = { ...DEFAULT_SETTINGS };
  let bubble = null;
  let settingsPanel = null;
  let bubbleSignature = "";
  let lastContextPoint = null;
  let lastSelectionPoint = null;
  let selectionTimer = 0;
  let repositionFrame = 0;

  chrome.storage.sync.get(STORAGE_KEY, (result) => {
    settings = { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEY] || {}) };
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes[STORAGE_KEY]) {
      settings = { ...DEFAULT_SETTINGS, ...(changes[STORAGE_KEY].newValue || {}) };
    }
  });

  document.addEventListener("selectionchange", scheduleSelectionConversion);
  document.addEventListener("scroll", scheduleBubbleReposition, true);
  window.addEventListener("resize", scheduleBubbleReposition);
  document.addEventListener("mouseup", (event) => {
    lastSelectionPoint = { x: event.clientX, y: event.clientY };
    scheduleSelectionConversion();
    scheduleSelectionConversion(320);
  }, true);
  document.addEventListener("keyup", scheduleSelectionConversion, true);
  document.addEventListener("touchend", (event) => {
    const touch = event.changedTouches && event.changedTouches[0];
    if (touch) {
      lastSelectionPoint = { x: touch.clientX, y: touch.clientY };
    }
    scheduleSelectionConversion();
    scheduleSelectionConversion(420);
  }, true);
  document.addEventListener("contextmenu", (event) => {
    lastContextPoint = {
      x: event.clientX,
      y: event.clientY
    };
  }, true);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideBubble();
  });
  chrome.runtime.onMessage.addListener((message) => {
    if (message && message.type === "ctc-convert-selection") {
      handleContextMenuConversion(message.text || "");
    }
  });
  window.__clickTimeConverterConvertSelection = handleContextMenuConversion;
  window.__timepillToggleSettings = toggleSettingsPanel;
  if (window.__timepillEnableTestApi) {
    window.__timepillTest = {
      convertText,
      parseTimeText,
      setSettings(nextSettings) {
        settings = { ...settings, ...nextSettings };
      }
    };
  }

  function scheduleSelectionConversion(delay = 120) {
    window.clearTimeout(selectionTimer);
    selectionTimer = window.setTimeout(handleSelectionConversion, delay);
  }

  function scheduleBubbleReposition() {
    if (!bubble || bubble.dataset.hidden === "true" || !bubbleSignature) {
      return;
    }

    if (repositionFrame) {
      return;
    }

    repositionFrame = window.requestAnimationFrame(() => {
      repositionFrame = 0;
      const rect = getSelectionRect();
      if (rect) {
        positionBubbleAbove(rect);
      } else {
        hideBubble();
      }
    });
  }

  function handleSelectionConversion() {
    if (!settings.enabled) {
      hideBubble();
      return;
    }

    const text = getSelectedText();
    if (!text) {
      hideBubble();
      return;
    }

    const conversions = convertText(text);
    if (!conversions.length) {
      hideBubble();
      return;
    }

    showBubbleAtSelection(conversions);
  }

  function handleContextMenuConversion(text) {
    if (!settings.enabled) {
      hideBubble();
      return;
    }

    const conversions = convertText(text);
    if (!conversions.length) {
      hideBubble();
      return;
    }

    showBubbleAtSelection(conversions);
  }

  function getSelectedText() {
    const editableSelection = getEditableSelectionText();
    if (editableSelection) return editableSelection;

    const selection = window.getSelection();
    return selection ? selection.toString().replace(/\s+/g, " ").trim() : "";
  }

  function getEditableSelectionText() {
    const element = document.activeElement;
    if (!element || !("selectionStart" in element) || !("selectionEnd" in element)) {
      return "";
    }

    const start = element.selectionStart;
    const end = element.selectionEnd;
    if (typeof start !== "number" || typeof end !== "number" || start === end) {
      return "";
    }

    return String(element.value || "").slice(start, end).replace(/\s+/g, " ").trim();
  }

  function getSelectionRect() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return getEditableSelectionRect();
    }

    const range = selection.getRangeAt(0);
    const rects = [...range.getClientRects()].filter((rect) => rect.width && rect.height);
    if (rects.length) {
      return rects[0];
    }

    const rect = range.getBoundingClientRect();
    if (rect.width || rect.height) return rect;

    return getEditableSelectionRect();
  }

  function getEditableSelectionRect() {
    const element = document.activeElement;
    if (!element || !("selectionStart" in element) || !("selectionEnd" in element)) {
      return null;
    }

    const rect = element.getBoundingClientRect();
    if (!rect.width && !rect.height) return null;

    const measuredRect = measureEditableSelectionRect(element, rect);
    if (measuredRect) return measuredRect;

    if (lastSelectionPoint) {
      return {
        left: lastSelectionPoint.x,
        right: lastSelectionPoint.x,
        top: lastSelectionPoint.y,
        bottom: lastSelectionPoint.y
      };
    }

    return rect;
  }

  function measureEditableSelectionRect(element, elementRect) {
    const start = element.selectionStart;
    const end = element.selectionEnd;
    if (typeof start !== "number" || typeof end !== "number" || start === end) {
      return null;
    }

    const value = String(element.value || "");
    const selectedText = value.slice(start, end);
    if (!selectedText) return null;

    const style = window.getComputedStyle(element);
    const mirror = document.createElement("div");
    const selected = document.createElement("span");
    const after = document.createElement("span");
    const isTextArea = element.tagName === "TEXTAREA";
    const copiedStyles = [
      "borderBottomWidth",
      "borderLeftWidth",
      "borderRightWidth",
      "borderTopWidth",
      "boxSizing",
      "fontFamily",
      "fontFeatureSettings",
      "fontKerning",
      "fontSize",
      "fontStretch",
      "fontStyle",
      "fontVariant",
      "fontVariantCaps",
      "fontWeight",
      "letterSpacing",
      "lineHeight",
      "paddingBottom",
      "paddingLeft",
      "paddingRight",
      "paddingTop",
      "tabSize",
      "textAlign",
      "textIndent",
      "textTransform",
      "wordSpacing"
    ];

    for (const property of copiedStyles) {
      mirror.style[property] = style[property];
    }

    mirror.style.position = "fixed";
    mirror.style.left = `${elementRect.left - element.scrollLeft}px`;
    mirror.style.top = `${elementRect.top - element.scrollTop}px`;
    mirror.style.width = `${elementRect.width}px`;
    mirror.style.minHeight = `${elementRect.height}px`;
    mirror.style.overflow = "hidden";
    mirror.style.pointerEvents = "none";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = isTextArea ? "pre-wrap" : "pre";
    mirror.style.overflowWrap = isTextArea ? "break-word" : "normal";

    mirror.append(document.createTextNode(value.slice(0, start)));
    selected.textContent = selectedText || ".";
    mirror.append(selected);
    after.textContent = value.slice(end) || ".";
    mirror.append(after);
    document.documentElement.appendChild(mirror);

    const rects = [...selected.getClientRects()].filter((item) => item.width && item.height);
    const selectedRect = rects[0] || selected.getBoundingClientRect();
    mirror.remove();

    if (!selectedRect || (!selectedRect.width && !selectedRect.height)) {
      return null;
    }

    return {
      left: selectedRect.left,
      right: selectedRect.right,
      top: selectedRect.top,
      bottom: selectedRect.bottom,
      width: selectedRect.width,
      height: selectedRect.height
    };
  }

  function findBestMatch(text) {
    const dateParts = findContextDateParts(text);
    TIME_ZONE_RE.lastIndex = 0;
    ZONE_TIME_RE.lastIndex = 0;
    TIME_CITY_RE.lastIndex = 0;
    CITY_TIME_RE.lastIndex = 0;
    const matches = [
      ...[...text.matchAll(TIME_ZONE_RE)].map((item) => item[0].trim()),
      ...[...text.matchAll(ZONE_TIME_RE)].map((item) => item[0].trim()),
      ...[...text.matchAll(TIME_CITY_RE)].map((item) => item[0].trim()),
      ...[...text.matchAll(CITY_TIME_RE)].map((item) => item[0].trim())
    ];
    return matches.find((item) => parseTimeText(item, dateParts)) || null;
  }

  function convertText(text) {
    const explicitTimes = convertExplicitTimes(text);
    if (hasMultipleSourceZones(explicitTimes)) {
      return explicitTimes.map((item) => item.conversion).slice(0, 5);
    }

    const contextualTimes = convertContextualTimes(text);
    if (contextualTimes.length) return contextualTimes;

    return explicitTimes.map((item) => item.conversion).slice(0, 1);
  }

  function convertTimeText(text, fallbackDateParts = null) {
    const parsed = parseTimeText(text, fallbackDateParts);
    if (!parsed) return null;
    return convertParsedTime(parsed);
  }

  function convertParsedTime(parsed) {
    const targetTimeZone = settings.targetTimeZone === "local"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : settings.targetTimeZone;

    const result = formatTimeOnly(parsed.utcMillis, targetTimeZone);

    return {
      source: formatSourceTime(parsed),
      result,
      targetTimeZone,
      iso: new Date(parsed.utcMillis).toISOString()
    };
  }

  function convertExplicitTimes(text) {
    const dateParts = findContextDateParts(text);
    TIME_ZONE_RE.lastIndex = 0;
    ZONE_TIME_RE.lastIndex = 0;
    TIME_CITY_RE.lastIndex = 0;
    CITY_TIME_RE.lastIndex = 0;

    const seen = new Set();
    const candidates = [
      ...[...text.matchAll(TIME_ZONE_RE)],
      ...[...text.matchAll(ZONE_TIME_RE)],
      ...[...text.matchAll(TIME_CITY_RE)],
      ...[...text.matchAll(CITY_TIME_RE)]
    ];

    return candidates
      .map((match) => {
        const text = match[0].trim();
        const index = match.index;
        const key = `${index}:${text}`;
        if (seen.has(key)) return null;
        seen.add(key);

        const parsed = parseTimeText(text, dateParts);
        if (!parsed) return null;
        return {
          index,
          parsed,
          conversion: convertParsedTime(parsed)
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.index - b.index);
  }

  function hasMultipleSourceZones(items) {
    return new Set(items.map((item) => item.parsed.zoneText)).size > 1;
  }

  function convertContextualTimes(text) {
    const zoneText = findContextZone(text);
    if (!zoneText) return [];

    const dateParts = findContextDateParts(text);
    TIME_RANGE_RE.lastIndex = 0;
    TIME_SINGLE_RE.lastIndex = 0;

    const rangeMatches = [...text.matchAll(TIME_RANGE_RE)];
    const rangeSpans = rangeMatches.map((match) => ({
      start: match.index,
      end: match.index + match[0].length
    }));
    const conversions = [
      ...rangeMatches.map((match) => ({
        index: match.index,
        conversion: convertRangeMatch(match, zoneText, dateParts)
      })),
      ...[...text.matchAll(TIME_SINGLE_RE)]
        .filter((match) => !rangeSpans.some((span) => match.index >= span.start && match.index < span.end))
        .flatMap((match) => getSharedMeridiemPrefixTimes(text, match, rangeSpans)
          .map((item) => ({
            index: item.index,
            conversion: convertSingleClock(item.clockText, item.meridiem, zoneText, dateParts)
          }))),
      ...[...text.matchAll(TIME_SINGLE_RE)]
        .filter((match) => !rangeSpans.some((span) => match.index >= span.start && match.index < span.end))
        .map((match) => ({
          index: match.index,
          conversion: convertSingleTimeMatch(match, zoneText, dateParts)
        }))
    ];

    return conversions
      .filter((item) => item.conversion)
      .sort((a, b) => a.index - b.index)
      .map((item) => item.conversion)
      .slice(0, 5);
  }

  function findContextZone(text) {
    const parenZone = text.match(new RegExp(`\\(\\s*(${ZONE_PATTERN})\\s*\\)`, "i"));
    const zones = parenZone
      ? [parenZone[1]]
      : [...text.matchAll(new RegExp(`\\b(${ZONE_PATTERN})\\b`, "gi"))].map((match) => match[1]);

    for (const zone of zones) {
      const zoneText = normalizeZoneText(zone);
      if (getZoneOffsetMinutes(zoneText, new Date()) !== null) return zoneText;
    }

    return findContextCityZone(text);
  }

  function findContextDateParts(text) {
    const dateMatch = text.match(new RegExp(DATE_PREFIX_PATTERN, "i"));
    if (dateMatch) {
      const parsed = parseDateParts(dateMatch[0]);
      if (parsed) return parsed;
    }

    if (/\btomorrow\b/i.test(text)) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        year: tomorrow.getFullYear(),
        month: tomorrow.getMonth(),
        day: tomorrow.getDate()
      };
    }

    const weekdayMatch = text.match(/\b(sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?)\b/i);
    if (weekdayMatch) {
      return getNextWeekdayParts(WEEKDAYS[weekdayMatch[1].toLowerCase()]);
    }

    return parseDateParts("");
  }

  function convertRangeMatch(match, zoneText, dateParts) {
    const endMeridiem = (match[4] || match[2] || "").toLowerCase();
    const startMeridiem = (match[2] || endMeridiem).toLowerCase();
    const startClock = parseClockTime(match[1], startMeridiem);
    const endClock = parseClockTime(match[3], endMeridiem);
    if (!startClock || !endClock) return null;

    const startUtcMillis = getUtcMillis(dateParts, startClock, zoneText);
    let endUtcMillis = getUtcMillis(dateParts, endClock, zoneText);
    if (startUtcMillis === null || endUtcMillis === null) return null;
    if (endUtcMillis <= startUtcMillis) {
      endUtcMillis += 24 * 60 * 60 * 1000;
    }

    const targetTimeZone = getTargetTimeZone();
    const source = `${formatClock(startClock)} - ${formatClock(endClock)} ${zoneText}`;
    const result = `${formatTimeOnly(startUtcMillis, targetTimeZone)} - ${formatTimeOnly(endUtcMillis, targetTimeZone)}`;

    return {
      source,
      result,
      targetTimeZone,
      iso: new Date(startUtcMillis).toISOString()
    };
  }

  function convertSingleTimeMatch(match, zoneText, dateParts) {
    const clockText = match[1] || match[3];
    const meridiem = match[2] ? match[2].toLowerCase() : "";
    return convertSingleClock(clockText, meridiem, zoneText, dateParts);
  }

  function convertSingleClock(clockText, meridiem, zoneText, dateParts) {
    const clock = parseClockTime(clockText, meridiem);
    if (!clock) return null;

    const utcMillis = getUtcMillis(dateParts, clock, zoneText);
    if (utcMillis === null) return null;

    const targetTimeZone = getTargetTimeZone();
    return {
      source: `${formatClock(clock)} ${zoneText}`,
      result: formatTimeOnly(utcMillis, targetTimeZone),
      targetTimeZone,
      iso: new Date(utcMillis).toISOString()
    };
  }

  function getSharedMeridiemPrefixTimes(text, match, rangeSpans) {
    const meridiem = match[2] ? match[2].toLowerCase() : "";
    if (!meridiem) return [];

    const before = text.slice(0, match.index);
    const listMatch = before.match(/((?:\b\d{1,2}(?::\d{2})?\s*(?:,|\/|\bor\b|\band\b)\s*)+)(?:\bor\b|\band\b)?\s*$/i);
    if (!listMatch) return [];

    const listText = listMatch[1];
    const startIndex = match.index - listMatch[0].length;
    if (startIndex > 0 && /[A-Za-z]/.test(text[startIndex - 1])) return [];

    return [...listText.matchAll(/\b(\d{1,2}(?::\d{2})?)\b/g)]
      .map((item) => ({
        index: startIndex + item.index,
        clockText: item[1],
        meridiem
      }))
      .filter((item) => parseClockTime(item.clockText, meridiem))
      .filter((item) => !rangeSpans.some((span) => item.index >= span.start && item.index < span.end));
  }

  function parseTimeText(text, fallbackDateParts = null) {
    const normalized = text
      .replace(/[–—]/g, "-")
      .replace(new RegExp(`\\(\\s*(${ZONE_PATTERN})\\s*\\)`, "gi"), " $1 ")
      .replace(new RegExp(`\\(\\s*(${CITY_PATTERN})\\s*\\)`, "gi"), " $1 ")
      .replace(/\bat\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    const leadingZoneMatch = normalized.match(new RegExp(`^(${ZONE_PATTERN})(?:\\s*[:-]\\s*|\\s+)`, "i"));
    const leadingZoneText = leadingZoneMatch ? normalizeZoneText(leadingZoneMatch[1]) : "";
    const usesLeadingZone = leadingZoneText && getZoneOffsetMinutes(leadingZoneText, new Date()) !== null;
    const leadingCityMatch = usesLeadingZone ? null : normalized.match(new RegExp(`^(${CITY_PATTERN})(?:\\s*[:-]\\s*|\\s+)`, "i"));
    const leadingCityZone = leadingCityMatch ? getCityTimeZone(leadingCityMatch[1]) : "";
    const usesLeadingCity = !usesLeadingZone && Boolean(leadingCityZone);
    const possibleZoneMatch = (usesLeadingZone || usesLeadingCity) ? null : normalized.match(new RegExp(`(${ZONE_PATTERN})$`, "i"));
    const possibleZoneText = possibleZoneMatch ? normalizeZoneText(possibleZoneMatch[1]) : "";
    const zoneMatch = possibleZoneText && getZoneOffsetMinutes(possibleZoneText, new Date()) !== null
      ? possibleZoneMatch
      : null;
    const cityMatch = (usesLeadingZone || usesLeadingCity || zoneMatch) ? null : findTrailingCityMatch(normalized);
    if (!usesLeadingZone && !usesLeadingCity && !zoneMatch && !cityMatch) return null;

    const zoneText = usesLeadingZone
      ? leadingZoneText
      : usesLeadingCity
        ? leadingCityZone
        : zoneMatch
          ? possibleZoneText
          : getCityTimeZone(cityMatch[1]);
    const usesLeadingSource = usesLeadingZone || usesLeadingCity;
    const sourceMatch = usesLeadingZone ? leadingZoneMatch : leadingCityMatch;
    const trailingMatch = zoneMatch || cityMatch;
    const timeSide = usesLeadingSource
      ? normalized.slice(sourceMatch[0].length).replace(/^[-,\s]+/, "").trim()
      : stripSourceSeparator(normalized.slice(0, trailingMatch.index));
    const timeMatch = usesLeadingSource
      ? timeSide.match(/(?:(.*?)\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i)
      : timeSide.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
    if (!timeMatch) return null;

    const timeOffset = usesLeadingSource ? 1 : 0;
    let hour = Number(timeMatch[1 + timeOffset]);
    const minute = timeMatch[2 + timeOffset] ? Number(timeMatch[2 + timeOffset]) : 0;
    const meridiem = timeMatch[3 + timeOffset] ? timeMatch[3 + timeOffset].toLowerCase() : "";
    if (minute > 59 || hour > 23 || (meridiem && hour > 12)) return null;
    if (meridiem === "pm" && hour !== 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;

    const dateText = usesLeadingSource
      ? (timeMatch[1] || "").replace(/[, ]+$/, "").trim()
      : timeSide.slice(0, timeMatch.index).replace(/[, ]+$/, "").trim();
    const dateParts = parseDateParts(dateText) || fallbackDateParts;
    if (!dateParts) return null;

    const utcMillis = getUtcMillis(dateParts, { hour, minute }, zoneText);
    if (utcMillis === null) return null;

    return { utcMillis, zoneText, hour, minute };
  }

  function normalizeZoneText(zone) {
    const zoneRaw = zone.replace(/\s+/g, "");
    return zoneRaw.includes("/") ? zoneRaw : zoneRaw.toUpperCase();
  }

  function stripSourceSeparator(text) {
    return text
      .replace(/\b(?:at|in|for)\s*$/i, "")
      .replace(/[-,:;\s]+$/, "")
      .trim();
  }

  function buildCityPattern() {
    return CITY_TIME_ZONE_ALIASES
      .flatMap(([aliases]) => aliases)
      .sort((a, b) => b.length - a.length)
      .map((alias) => escapeRegExp(alias).replace(/\s+/g, "\\s+"))
      .join("|");
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizeCityName(city) {
    return city.toLowerCase().replace(/\s+/g, " ").trim();
  }

  function getCityTimeZone(city) {
    const normalized = normalizeCityName(city);
    const match = CITY_TIME_ZONE_ALIASES.find(([aliases]) => aliases.includes(normalized));
    return match ? match[1] : "";
  }

  function findTrailingCityMatch(text) {
    return text.match(new RegExp(`(${CITY_PATTERN})$`, "i"));
  }

  function findContextCityZone(text) {
    const cityMatches = [...text.matchAll(new RegExp(`(${CITY_PATTERN})`, "gi"))];
    for (const match of cityMatches) {
      const zone = getCityTimeZone(match[1]);
      if (zone) return zone;
    }

    return null;
  }

  function parseClockTime(clockText, meridiem) {
    const match = clockText.match(/^(\d{1,2})(?::(\d{2}))?$/);
    if (!match) return null;

    let hour = Number(match[1]);
    const minute = match[2] ? Number(match[2]) : 0;
    if (minute > 59 || hour > 23 || (meridiem && hour > 12)) return null;
    if (meridiem === "pm" && hour !== 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
    return { hour, minute };
  }

  function getUtcMillis(dateParts, clock, zoneText) {
    const localWallMillis = Date.UTC(
      dateParts.year,
      dateParts.month,
      dateParts.day,
      clock.hour,
      clock.minute
    );
    const offsetMinutes = getZoneOffsetMinutes(zoneText, new Date(localWallMillis));
    if (offsetMinutes === null) return null;

    let utcMillis = localWallMillis - offsetMinutes * 60 * 1000;
    if (zoneText.includes("/")) {
      const correctedOffset = getZoneOffsetMinutes(zoneText, new Date(utcMillis));
      if (correctedOffset === null) return null;
      utcMillis = localWallMillis - correctedOffset * 60 * 1000;
    }

    return utcMillis;
  }

  function parseDateParts(dateText) {
    const now = new Date();
    if (!dateText) {
      return {
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate()
      };
    }

    let match = dateText.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) {
      return validDateParts(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }

    match = dateText.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/);
    if (match) {
      const year = match[3] ? expandYear(Number(match[3])) : now.getFullYear();
      return validDateParts(year, Number(match[1]) - 1, Number(match[2]));
    }

    match = dateText.match(/^([A-Za-z]+)\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?$/);
    if (match) {
      const month = MONTHS[match[1].toLowerCase()];
      if (month === undefined) return null;
      const year = match[3] ? Number(match[3]) : now.getFullYear();
      return validDateParts(year, month, Number(match[2]));
    }

    return null;
  }

  function validDateParts(year, month, day) {
    const date = new Date(Date.UTC(year, month, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    return { year, month, day };
  }

  function expandYear(year) {
    if (year >= 100) return year;
    return year >= 70 ? 1900 + year : 2000 + year;
  }

  function getNextWeekdayParts(targetDay) {
    const now = new Date();
    const result = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = (targetDay - result.getDay() + 7) % 7;
    result.setDate(result.getDate() + diff);
    return {
      year: result.getFullYear(),
      month: result.getMonth(),
      day: result.getDate()
    };
  }

  function getZoneOffsetMinutes(zoneText, date) {
    const gmtOffset = zoneText.match(/^(?:UTC|GMT)([+-])(\d{1,2})(?::?(\d{2}))?$/i);
    if (gmtOffset) {
      const sign = gmtOffset[1] === "+" ? 1 : -1;
      const hours = Number(gmtOffset[2]);
      const minutes = gmtOffset[3] ? Number(gmtOffset[3]) : 0;
      if (hours > 14 || minutes > 59) return null;
      return sign * (hours * 60 + minutes);
    }

    if (Object.prototype.hasOwnProperty.call(TZ_REGION_ALIASES, zoneText)) {
      return getIanaOffsetMinutes(TZ_REGION_ALIASES[zoneText], date);
    }

    if (Object.prototype.hasOwnProperty.call(TZ_ABBREVIATIONS, zoneText)) {
      return TZ_ABBREVIATIONS[zoneText] * 60;
    }

    if (zoneText.includes("/")) {
      return getIanaOffsetMinutes(zoneText, date);
    }

    return null;
  }

  function getIanaOffsetMinutes(timeZone, date) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
      }).formatToParts(date);

      const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
      const zonedMillis = Date.UTC(
        Number(values.year),
        Number(values.month) - 1,
        Number(values.day),
        Number(values.hour),
        Number(values.minute),
        Number(values.second)
      );

      return Math.round((zonedMillis - date.getTime()) / 60000);
    } catch {
      return null;
    }
  }

  function getTargetTimeZone() {
    return settings.targetTimeZone === "local"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : settings.targetTimeZone;
  }

  function formatSourceTime(parsed) {
    return `${formatClock(parsed)} ${parsed.zoneText}`;
  }

  function formatClock(clock) {
    const suffix = clock.hour >= 12 ? "PM" : "AM";
    const hour = clock.hour % 12 || 12;
    if (clock.minute === 0) {
      return `${hour} ${suffix}`;
    }
    return `${hour}:${String(clock.minute).padStart(2, "0")} ${suffix}`;
  }

  function formatTimeOnly(utcMillis, targetTimeZone) {
    const date = new Date(utcMillis);
    const useHour12 = settings.hour12 !== false;
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: targetTimeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: useHour12,
      hourCycle: useHour12 ? undefined : "h23"
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const time = !useHour12
      ? `${values.hour.padStart(2, "0")}:${values.minute}`
      : values.minute === "00"
      ? `${values.hour} ${values.dayPeriod}`
      : `${values.hour}:${values.minute} ${values.dayPeriod}`;
    return `${time} ${getDisplayTimeZoneName(utcMillis, targetTimeZone)}`;
  }

  function getDisplayTimeZoneName(utcMillis, targetTimeZone) {
    if (isCentralEuropeanZone(targetTimeZone)) {
      return "CET";
    }

    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: targetTimeZone,
      timeZoneName: "short"
    }).formatToParts(new Date(utcMillis));
    const zone = parts.find((part) => part.type === "timeZoneName");
    return zone ? zone.value.replace(/^GMT\+?0$/, "GMT") : targetTimeZone;
  }

  function isCentralEuropeanZone(timeZone) {
    return [
      "Europe/Amsterdam",
      "Europe/Berlin",
      "Europe/Brussels",
      "Europe/Madrid",
      "Europe/Paris",
      "Europe/Rome",
      "Europe/Stockholm",
      "Europe/Vienna",
      "Europe/Zurich"
    ].includes(timeZone);
  }

  function showBubbleAtSelection(conversions) {
    const rect = getSelectionRect();
    if (rect) {
      showBubbleAboveRect(rect, conversions);
      return;
    }

    const fallbackRect = {
      left: (lastSelectionPoint || lastContextPoint) ? (lastSelectionPoint || lastContextPoint).x : Math.round(window.innerWidth / 2),
      right: (lastSelectionPoint || lastContextPoint) ? (lastSelectionPoint || lastContextPoint).x : Math.round(window.innerWidth / 2),
      top: (lastSelectionPoint || lastContextPoint) ? (lastSelectionPoint || lastContextPoint).y : Math.round(window.innerHeight / 2),
      bottom: (lastSelectionPoint || lastContextPoint) ? (lastSelectionPoint || lastContextPoint).y : Math.round(window.innerHeight / 2)
    };
    showBubbleAboveRect(fallbackRect, conversions);
  }

  function showBubbleAboveRect(anchorRect, conversions) {
    const items = Array.isArray(conversions) ? conversions : [conversions];
    const signature = getConversionSignature(items);
    ensureBubble();

    bubble.dataset.hidden = "false";
    if (signature === bubbleSignature && bubble.firstChild) {
      positionBubbleAbove(anchorRect);
      return;
    }

    bubbleSignature = signature;
    bubble.innerHTML = "";

    const results = document.createElement("div");
    results.className = "ctc-bubble__results";

    if (items.length > 1) {
      const row = document.createElement("div");
      row.className = "ctc-bubble__row ctc-bubble__row--compact";
      row.textContent = items.map((item) => simplifyRangeResult(item.result)).join(" · ");
      results.appendChild(row);
    } else {
      for (const conversion of items) {
        const row = document.createElement("div");
        row.className = "ctc-bubble__row ctc-bubble__row--compact";

        const result = document.createElement("div");
        result.className = "ctc-bubble__result";
        result.textContent = conversion.result;

        row.append(result);
        results.appendChild(row);
      }
    }

    bubble.append(results);
    positionBubbleAbove(anchorRect);
  }

  function ensureBubble() {
    if (!bubble) {
      bubble = document.createElement("div");
      bubble.className = "ctc-bubble";
      bubble.setAttribute("role", "status");
      document.documentElement.appendChild(bubble);
    }
  }

  function getConversionSignature(items) {
    return items.map((item) => `${item.source}=>${item.result}`).join("|");
  }

  function simplifyRangeResult(result) {
    return result.replace(/\s+([A-Z]{2,5})(?=\s+-)/, "");
  }

  function positionBubbleAbove(anchorRect) {
    const margin = 12;
    const gap = 8;
    const anchorCenter = anchorRect.left + (anchorRect.right - anchorRect.left) / 2;

    bubble.style.transform = "translate3d(0, 0, 0)";
    const width = bubble.offsetWidth;
    const height = bubble.offsetHeight;
    const maxLeft = Math.max(margin, window.innerWidth - width - margin);
    const centeredLeft = anchorCenter - width / 2;
    const left = Math.min(Math.max(margin, centeredLeft), maxLeft);
    const preferredTop = anchorRect.top - height - gap;
    const top = preferredTop < margin ? anchorRect.bottom + gap : preferredTop;
    bubble.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
  }

  function hideBubble() {
    if (repositionFrame) {
      window.cancelAnimationFrame(repositionFrame);
      repositionFrame = 0;
    }
    bubbleSignature = "";
    if (bubble) bubble.dataset.hidden = "true";
    for (const node of document.querySelectorAll(".ctc-bubble")) {
      node.dataset.hidden = "true";
    }
  }

  function toggleSettingsPanel() {
    ensureSettingsPanel();
    settingsPanel.hidden = !settingsPanel.hidden;
  }

  function ensureSettingsPanel() {
    if (settingsPanel) {
      renderSettingsPanel();
      return;
    }

    settingsPanel = document.createElement("section");
    settingsPanel.className = "timepill-settings";
    settingsPanel.hidden = true;
    settingsPanel.innerHTML = `
      <div class="timepill-settings__controls">
        <div class="timepill-settings__picker">
          <button class="timepill-settings__trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
            <span>Convert to</span>
            <strong></strong>
            <svg width="11" height="7" viewBox="0 0 11 7" aria-hidden="true">
              <path d="M1.5 1.5L5.5 5.5L9.5 1.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="timepill-settings__list" role="listbox" aria-label="Target timezone" hidden></div>
        </div>
        <div class="timepill-settings__control-divider" aria-hidden="true"></div>
        <button class="timepill-settings__toggle" type="button" role="switch" aria-checked="false">
          <span>24-hour time</span>
          <span class="timepill-settings__switch" aria-hidden="true"></span>
        </button>
      </div>
      <p class="timepill-settings__intro">Select any text with the timezone<br>to convert it inline.</p>
      <a class="timepill-settings__brand" href="https://x.com/nickpylll" target="_blank" rel="noreferrer">
        <img src="${chrome.runtime.getURL("logo.svg")}" alt="timepill">
        <span>Follow on X (Twitter)</span>
      </a>
    `;
    document.documentElement.appendChild(settingsPanel);

    const trigger = settingsPanel.querySelector(".timepill-settings__trigger");
    const list = settingsPanel.querySelector(".timepill-settings__list");
    const hourToggle = settingsPanel.querySelector(".timepill-settings__toggle");

    trigger.addEventListener("click", () => {
      const open = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!open));
      list.hidden = open;
      settingsPanel.classList.toggle("timepill-settings--open", !open);
      if (open) {
        return;
      }
      list.scrollTop = 0;
    });

    list.addEventListener("click", (event) => {
      const option = event.target.closest(".timepill-settings__option");
      if (!option) return;
      settings = {
        ...settings,
        enabled: true,
        showDate: false,
        targetTimeZone: option.dataset.zone
      };
      chrome.storage.sync.set({ [STORAGE_KEY]: settings });
      trigger.setAttribute("aria-expanded", "false");
      list.hidden = true;
      settingsPanel.classList.remove("timepill-settings--open");
      renderSettingsPanel();
    });

    hourToggle.addEventListener("click", () => {
      settings = {
        ...settings,
        enabled: true,
        showDate: false,
        hour12: settings.hour12 === false
      };
      chrome.storage.sync.set({ [STORAGE_KEY]: settings });
      renderSettingsPanel();
    });

    document.addEventListener("click", (event) => {
      if (!settingsPanel || settingsPanel.hidden || settingsPanel.contains(event.target)) {
        return;
      }
      settingsPanel.hidden = true;
      settingsPanel.classList.remove("timepill-settings--open");
      trigger.setAttribute("aria-expanded", "false");
      list.hidden = true;
    }, true);

    renderSettingsPanel();
  }

  function renderSettingsPanel() {
    if (!settingsPanel) return;

    const systemZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const triggerLabel = settingsPanel.querySelector(".timepill-settings__trigger strong");
    const list = settingsPanel.querySelector(".timepill-settings__list");
    const hourToggle = settingsPanel.querySelector(".timepill-settings__toggle");
    const zones = [
      "local",
      ...new Set([
        systemZone,
        "UTC",
        ...TIME_ZONES.filter((zone) => zone !== "local" && zone !== systemZone)
      ])
    ];

    triggerLabel.textContent = getSettingsTriggerLabel(settings.targetTimeZone, systemZone);
    hourToggle.setAttribute("aria-checked", String(settings.hour12 === false));
    list.innerHTML = "";

    for (const zone of zones) {
      const option = document.createElement("button");
      option.className = "timepill-settings__option";
      option.type = "button";
      option.dataset.zone = zone;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", String(settings.targetTimeZone === zone));

      const name = document.createElement("span");
      name.className = "timepill-settings__option-name";
      name.textContent = zone === "local" ? "Auto detect" : getDisplayZoneName(zone);

      const meta = document.createElement("span");
      meta.className = "timepill-settings__option-meta";
      meta.textContent = getSettingsZoneCode(zone, systemZone);

      option.append(name, meta);
      list.appendChild(option);
    }
  }

  function getDisplayZoneName(zone) {
    if (zone === "UTC") return "UTC";
    const [region, city = zone] = zone.split("/");
    if (!city || city === zone) return zone;
    return city.replace(/_/g, " ");
  }

  function getSettingsTriggerLabel(zone, systemZone) {
    const resolvedZone = zone === "local" ? systemZone : zone;
    const city = getDisplayZoneName(resolvedZone);
    const code = getSettingsZoneCode(zone, systemZone);
    return city === code ? city : `${city} ${code}`;
  }

  function getSettingsZoneCode(zone, systemZone) {
    const resolvedZone = zone === "local" ? systemZone : zone;
    if (resolvedZone === "UTC") return "UTC";
    if (isCentralEuropeanZone(resolvedZone)) return "CET";
    if (resolvedZone === "Europe/London") return "GMT";
    if (resolvedZone === "America/New_York") return "ET";
    if (resolvedZone === "America/Chicago") return "CT";
    if (resolvedZone === "America/Denver") return "MT";
    if (resolvedZone === "America/Los_Angeles") return "PT";
    if (resolvedZone === "Asia/Kolkata") return "IST";
    if (resolvedZone === "Asia/Singapore") return "SGT";
    if (resolvedZone === "Asia/Tokyo") return "JST";
    if (resolvedZone === "Australia/Sydney") return "AET";
    return resolvedZone;
  }
})();
