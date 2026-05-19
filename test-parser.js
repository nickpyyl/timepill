const fs = require("fs");
const vm = require("vm");

const content = fs.readFileSync("content.js", "utf8");

const listeners = {};
const context = {
  console,
  Date,
  Intl,
  Math,
  Node: { ELEMENT_NODE: 1 },
  setTimeout,
  clearTimeout,
  window: null,
  document: {
    activeElement: null,
    body: null,
    documentElement: {
      appendChild() {}
    },
    addEventListener(type, handler) {
      listeners[type] = handler;
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      return {
        style: {},
        dataset: {},
        className: "",
        setAttribute() {},
        append() {},
        appendChild() {},
        addEventListener() {},
        querySelector() {
          return null;
        },
        remove() {},
        getClientRects() {
          return [];
        },
        getBoundingClientRect() {
          return { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
        }
      };
    },
    createTextNode(text) {
      return { textContent: text };
    },
    getSelection() {
      return null;
    },
    elementFromPoint() {
      return null;
    }
  },
  chrome: {
    runtime: {
      getURL(path) {
        return path;
      },
      onMessage: {
        addListener() {}
      }
    },
    storage: {
      sync: {
        get(key, callback) {
          callback({
            [key]: {
              enabled: true,
              hour12: true,
              showDate: false,
              targetTimeZone: "Europe/Amsterdam"
            }
          });
        },
        set() {}
      },
      onChanged: {
        addListener() {}
      }
    }
  }
};

context.window = context;
context.globalThis = context;
context.window.__timepillEnableTestApi = true;
context.window.matchMedia = () => ({ matches: false });
context.window.addEventListener = () => {};
context.window.getComputedStyle = () => ({ backgroundColor: "rgb(255, 255, 255)" });
context.window.requestAnimationFrame = (callback) => callback();
context.window.cancelAnimationFrame = () => {};

vm.createContext(context);
vm.runInContext(content, context, { filename: "content.js" });

const api = context.window.__timepillTest;
api.setSettings({ targetTimeZone: "Europe/Amsterdam" });

const cases = [
  {
    name: "plain trailing timezone",
    text: "9 AM PST",
    expected: ["6 PM CET"]
  },
  {
    name: "lowercase compact trailing timezone",
    text: "6am pst",
    expected: ["3 PM CET"]
  },
  {
    name: "timezone first lowercase",
    text: "pst 6 AM",
    expected: ["3 PM CET"]
  },
  {
    name: "timezone first compact",
    text: "PST 6am",
    expected: ["3 PM CET"]
  },
  {
    name: "timezone first with colon",
    text: "PST: 6 AM",
    expected: ["3 PM CET"]
  },
  {
    name: "us shorthand timezone",
    text: "6 AM PT",
    expected: ["3 PM CET"]
  },
  {
    name: "parenthesized trailing timezone",
    text: "6 AM (PST)",
    expected: ["3 PM CET"]
  },
  {
    name: "explicit range with trailing timezone",
    text: "9-9:30 AM PST",
    expected: ["6 PM CET - 6:30 PM CET"]
  },
  {
    name: "explicit range with timezone first",
    text: "PST 9-9:30 AM",
    expected: ["6 PM CET - 6:30 PM CET"]
  },
  {
    name: "range with meridiem on both sides",
    text: "9am-10am PST",
    expected: ["6 PM CET - 7 PM CET"]
  },
  {
    name: "sentence wrapped explicit time",
    text: "Can do 9 AM PST?",
    expected: ["6 PM CET"]
  },
  {
    name: "sentence wrapped parenthesized timezone",
    text: "Can do 6 AM (PST)?",
    expected: ["3 PM CET"]
  },
  {
    name: "24-hour explicit time",
    text: "14:30 UTC",
    expected: ["4:30 PM CET"]
  },
  {
    name: "timezone first 24-hour explicit time",
    text: "UTC: 14:30",
    expected: ["4:30 PM CET"]
  },
  {
    name: "24-hour explicit range",
    text: "14:00-15:30 UTC",
    expected: ["4 PM CET - 5:30 PM CET"]
  },
  {
    name: "timezone in context with ranges",
    text: "Would either of these times (PST) work for you?\n- 9-9:30 AM\n- 11-11:30 AM",
    expected: ["6 PM CET - 6:30 PM CET", "8 PM CET - 8:30 PM CET"]
  },
  {
    name: "timezone before contextual ranges",
    text: "PST options: 9-9:30 AM or 11-11:30 AM",
    expected: ["6 PM CET - 6:30 PM CET", "8 PM CET - 8:30 PM CET"]
  },
  {
    name: "timezone in context with standalone times",
    text: "Would either of these times (PST) work for you? 9 AM or 11:30 AM",
    expected: ["6 PM CET", "8:30 PM CET"]
  },
  {
    name: "timezone in context with shared meridiem standalone times",
    text: "Would either of these times (PST) work for you? 9 or 11:30 AM",
    expected: ["6 PM CET", "8:30 PM CET"]
  },
  {
    name: "timezone before contextual standalone 24-hour times",
    text: "PST options: 09:00 or 11:30",
    expected: ["6 PM CET", "8:30 PM CET"]
  },
  {
    name: "real scheduling list with commas and shared meridiem",
    text: "I can do 9, 10, or 11 AM PST on Thursday",
    expected: ["6 PM CET", "7 PM CET", "8 PM CET"]
  },
  {
    name: "real scheduling list with explicit meridiem items",
    text: "Free tomorrow at 9am, 10am, or 11am PT",
    expected: ["6 PM CET", "7 PM CET", "8 PM CET"]
  },
  {
    name: "real scheduling slash-separated choices",
    text: "Can do 2/4 PM ET if either works",
    expected: ["8 PM CET", "10 PM CET"]
  },
  {
    name: "real mixed standalone and range choices",
    text: "Would 9 AM or 11-11:30 AM PST work?",
    expected: ["6 PM CET", "8 PM CET - 8:30 PM CET"]
  },
  {
    name: "real mixed timezone choices",
    text: "Could do 9 AM PST or 10 AM EST",
    expected: ["6 PM CET", "4 PM CET"]
  },
  {
    name: "city trailing full name",
    text: "9 AM New York",
    expected: ["3 PM CET"]
  },
  {
    name: "city trailing abbreviation",
    text: "9 AM NY",
    expected: ["3 PM CET"]
  },
  {
    name: "city leading full name",
    text: "New York 9 AM",
    expected: ["3 PM CET"]
  },
  {
    name: "city leading with date context",
    text: "New York tomorrow 9 AM",
    expected: ["3 PM CET"]
  },
  {
    name: "city contextual ranges",
    text: "Could you do New York time?\n- 9-9:30 AM\n- 11-11:30 AM",
    expected: ["3 PM CET - 3:30 PM CET", "5 PM CET - 5:30 PM CET"]
  },
  {
    name: "city contextual standalone times",
    text: "Could you do New York time? 9 AM or 11:30 AM",
    expected: ["3 PM CET", "5:30 PM CET"]
  },
  {
    name: "city contextual shared meridiem choices",
    text: "Could you do New York time? 9 or 11:30 AM",
    expected: ["3 PM CET", "5:30 PM CET"]
  },
  {
    name: "city contextual bullet list",
    text: "London time works for me:\n- 14:00\n- 16:30",
    expected: ["3 PM CET", "5:30 PM CET"]
  },
  {
    name: "real mixed city choices",
    text: "Could do 9 AM New York or 10 AM London",
    expected: ["3 PM CET", "11 AM CET"]
  },
  {
    name: "city in sentence with explicit time",
    text: "Can do 9 AM in London?",
    expected: ["10 AM CET"]
  },
  {
    name: "city prefix abbreviation",
    text: "LA 6am",
    expected: ["3 PM CET"]
  },
  {
    name: "city suffix abbreviation",
    text: "6am SF",
    expected: ["3 PM CET"]
  },
  {
    name: "asia city suffix",
    text: "10 AM Tokyo",
    expected: ["3 AM CET"]
  },
  {
    name: "city contextual range europe",
    text: "Paris slots: 14:00-15:30",
    expected: ["2 PM CET - 3:30 PM CET"]
  },
  {
    name: "city abbreviation should not match inside word",
    text: "Can do 9 AM later?",
    expected: []
  },
  {
    name: "tomorrow with explicit timezone",
    text: "Can you do tomorrow 7:30am EST?",
    expected: ["1:30 PM CET"]
  },
  {
    name: "weekday with explicit timezone",
    text: "How about Wednesday 8 PM CET?",
    expected: ["8 PM CET"]
  },
  {
    name: "iana zone",
    text: "14:30 Europe/London",
    expected: ["3:30 PM CET"]
  },
  {
    name: "utc offset",
    text: "10:00 UTC+2",
    expected: ["10 AM CET"]
  },
  {
    name: "real no-timezone scheduling text rejected",
    text: "Would either of these times work for you? 9 AM or 11:30 AM",
    expected: []
  },
  {
    name: "real non-scheduling numbered text rejected",
    text: "Version 9, 10, or 11 AM notes without a timezone",
    expected: []
  },
  {
    name: "invalid time rejected",
    text: "25:00 PST",
    expected: []
  },
  {
    name: "random am text rejected",
    text: "I am around later",
    expected: []
  }
];

let failures = 0;
for (const testCase of cases) {
  const actual = api.convertText(testCase.text).map((item) => item.result);
  const pass = JSON.stringify(actual) === JSON.stringify(testCase.expected);
  if (!pass) failures += 1;
  console.log(`${pass ? "PASS" : "FAIL"} ${testCase.name}`);
  if (!pass) {
    console.log(`  text:     ${JSON.stringify(testCase.text)}`);
    console.log(`  expected: ${JSON.stringify(testCase.expected)}`);
    console.log(`  actual:   ${JSON.stringify(actual)}`);
  }
}

api.setSettings({ hour12: false });
const twentyFourHourActual = api.convertText("9 AM PST").map((item) => item.result);
const twentyFourHourExpected = ["18:00 CET"];
const twentyFourHourPass = JSON.stringify(twentyFourHourActual) === JSON.stringify(twentyFourHourExpected);
if (!twentyFourHourPass) failures += 1;
console.log(`${twentyFourHourPass ? "PASS" : "FAIL"} 24-hour output setting`);
if (!twentyFourHourPass) {
  console.log(`  expected: ${JSON.stringify(twentyFourHourExpected)}`);
  console.log(`  actual:   ${JSON.stringify(twentyFourHourActual)}`);
}

if (failures) {
  process.exitCode = 1;
}
