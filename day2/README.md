# Day 2 – Prague in a Day

A responsive and accessible single-page city guide created by **Hasnat Abu** for Day 2 of Frontend Development.

## Requirements covered

- Semantic HTML with `header`, `nav`, `main`, `section`, `aside`, `article` and `footer`
- Clear content structure and heading order
- Original responsive SVG illustration
- Place content loaded from `data/places.json`
- Responsive CSS Grid layout and mobile breakpoints
- Accessibility features: skip link, landmarks, descriptive alternative text, visible keyboard focus, live status text, pressed states and reduced-motion support

## Run the project

This page fetches JSON data, so it must be opened through a web server rather than by double-clicking `index.html`.

```bash
npx serve .
```

Open the local address printed by the command, usually `http://localhost:3000`.

## Project structure

```text
index.html                 semantic page structure
style.css                  responsive layout and styling
app.js                     JSON loading and filtering
data/places.json           Prague place data
images/prague-skyline.svg  original SVG illustration
```
