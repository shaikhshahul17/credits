# Finance Tracker

A lightweight personal finance tracker UI built with HTML, CSS, and JavaScript.

## Project structure

finance-tracker/
├── index.html
├── css/
│   ├── main.css
│   ├── layout.css
│   ├── components.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── transactions.js
│   ├── storage.js
│   ├── chart.js
│   └── format.js
└── fonts/
    ├── DMSerifDisplay.woff2
    ├── DMMono.woff2
    └── Syne.woff2

## Usage

Open `index.html` in a browser. Transactions are saved locally using `localStorage`.

## Notes

- `index.html` contains only the HTML structure.
- Styles are split into base, layout, component, and responsive files.
- Logic is split into storage, formatting, transactions, chart, and app modules.
