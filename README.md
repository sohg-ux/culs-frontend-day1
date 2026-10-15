# The Little Herb Garden — Day 3

A responsive, accessible single-page herb guide created by **Hasnat Abu** for Day 3 of Contemporary Frontend Development.

Live site: <https://sohg-ux.github.io/culs-frontend-day1/>

## Day 3 requirements covered

- **React to input:** live herb search and a “favourites only” filter.
- **Handle events:** input, change, click, hash, online/offline and keyboard events.
- **Maintain state:** selected herb, search query, filter and favourites are held in JavaScript state.
- **Modify the DOM:** the navigation, status and herb article are built dynamically.
- **Fetch data:** each herb is loaded from its own `data/<herb>.json` file.
- **Communicate with a server:** the page uses `fetch()` and explains when it is opened without a web server.

## One HTML page, many herb URLs

Only `index.html` is needed. The URL hash selects the herb, for example `index.html#basil`, `index.html#rosemary` or `index.html#chamomile`. Changing the hash loads the matching JSON file and rebuilds the article without a page reload.

## JSON schema

Every herb file has the same fields:

| Field | Purpose |
| --- | --- |
| `slug` | URL and file identifier |
| `name`, `latin` | Common and scientific names |
| `summary`, `use` | Description and culinary/garden uses |
| `life` | Annual or perennial |
| `sun`, `water`, `harvest` | Growing guidance |
| `difficulty` | Simple care level |
| `colour` | Accent colour used by the interface |

`data/herbs.json` is a small manifest used to build the herb navigation. The full records live in separate files such as `data/basil.json`.

## Reliability and accessibility

- Unknown herb hashes display a helpful recovery message.
- Missing or malformed JSON files display an error instead of leaving a blank page.
- A missing manifest, offline state and `file://` use are handled.
- All features work with a keyboard; `/` focuses search and `Escape` clears it.
- Semantic landmarks, visible focus states, labels, live status messages and reduced-motion support are included.

## Chosen feature: favourites

The star button saves favourite herbs in `localStorage`. The “favourites only” checkbox filters the menu, and favourites remain after reloading the page.

## Run locally

```sh
npx serve
```

Open the local address printed by the command. Do not double-click `index.html`, because browsers block `fetch()` from a `file://` page.

## Project structure

```text
index.html                 semantic application shell
style.css                  responsive and accessible layout
app.js                     state, events, fetch and DOM rendering
data/herbs.json            herb manifest
data/<herb>.json           one data file per herb
images/                    logo and garden illustration
day1/                      preserved Day 1 project
day2/                      preserved Day 2 project
.github/workflows/         GitHub Pages deployment
```
