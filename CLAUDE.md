# Workout App — Project Context

## What this is
A single-page Progressive Web App (PWA) for tracking my personal gym routine on my iPhone (Safari/Chrome → "Add to Home Screen"). Personal use only, no backend, no App Store.

## Stack
- Plain HTML + CSS + vanilla JS (no frameworks, no build step)
- Data lives in `data/workout-data.json`, loaded via fetch()
- State (checked sets, edited weights) persists in `localStorage`
- `manifest.json` for PWA install behavior

## UX flow (must match exactly)
1. **Main menu**: 5 cards, one per day (Lower A, Upper Pull, Lower B, Upper Push, Lower C), each showing the day label (e.g. "Tuesday").
2. Tapping a card navigates to a **day view** (single page app — show/hide sections, no real page reload) listing that day's exercises by name only, collapsed.
3. Tapping an exercise name **expands it in place** (accordion), revealing:
   - One row per set: "Set 1 x {repsTarget}", "Set 2 x {repsTarget}", etc., each with its own checkbox.
   - When ALL set checkboxes for an exercise are checked, the exercise's own name/header also shows as checked/complete (visually distinct, e.g. checkmark + strikethrough or green state).
   - Editable weight field (number input, kg) and reps, prefilled from workout-data.json, editable and persisted to localStorage.
4. A "← Back" button in the day view returns to the main menu.
5. All check states and edited weights/reps persist across sessions via localStorage (keyed by day + exercise id + set index).

## Visual style
- Dark theme: near-black background (#121212 or similar)
- Purple accent color (~#7C5CFF / #8B5CF6 range) for buttons, active states, checkmarks
- Rounded cards (12-16px border-radius), generous padding, mobile-first (iPhone viewport width, ~390-430px)
- Large tap targets (min 44px height) for checkboxes and buttons — this is used mid-workout with sweaty hands
- Reference: "Gofit" app style (dark UI, purple gradient accents, card-based) — do not copy any dark app screenshots pixel-for-pixel, take it as tone/color reference only

## Data integrity rule
Never invent or "round" exercise names, sets, reps, or weights. Always read them from `data/workout-data.json`. If a value is ambiguous or missing, ask me — do not guess.

## Workflow preference
I'm learning Claude Code as I go. Work in small, confirmable steps:
1. Propose the file/component you're about to build and why, before writing it.
2. After each step, tell me exactly how to test it (e.g. "open index.html in Chrome and check X").
3. Don't jump ahead to PWA installability (manifest, service worker) until the core UI + localStorage logic works and I've confirmed it in the browser.