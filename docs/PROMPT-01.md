# Prompt 01: Rebrand to WebCrown, multilingual site, photoreal premium interiors

Paste everything below into your AI coding assistant in VS Code.

---

You are working on the static website of our web design agency. First read the whole project (index.html, css/style.css, js/main.js, README.md, docs/IMAGE-PROMPTS.md). Then show me a short plan (max 15 lines) and wait for my "go". After that work in small steps, and after each step tell me what changed and how to test it. Do not remove any feature that already works (3D scroll journey, cost estimator, WhatsApp buttons, dark/glow design).

## About the business
- We build websites for cafes, restaurants, hotels and resorts, gyms and salons, bakeries and home businesses, coaching classes, clothing and jewellery shops, furniture and interior studios, and local product brands, mainly in India.
- Contacts that must stay: Bhavesh Bobde 9822734707 (WhatsApp 919822734707) and Grishma Parshivnikar 8600103414 (WhatsApp 918600103414).

## Task 1: Rebrand the previous agency name to "WebCrown"
1. Replace the name everywhere: page title, meta tags, logo text, hero copy, footer, WhatsApp pre-filled messages, alt text, comments, localStorage keys, file names.
2. Design a new logo mark in inline SVG: a simple crown made of pixel-style blocks (works on dark and light backgrounds). Use it in the header and as the favicon (SVG data URI).
3. Keep the current dark futuristic palette (cyan, magenta, amber) but let the amber/gold become the "crown" accent. Suggest one short tagline (English) and put it under the hero heading.

## Task 2: Language selection and full multilingual support
1. On the very first visit show a full-screen, elegant language chooser (cards, large native script names): English, हिन्दी, मराठी, தமிழ், ગુજરાતી, Hinglish (Hindi written in English letters). Remember the choice in localStorage and skip the chooser next time. Add a small language switcher in the header so it can be changed anytime.
2. The current site copy is Hinglish (Roman-script Hindi). That text becomes the "Hinglish" language. English becomes the default.
3. Move all visible text into i18n files: `i18n/en.json`, `hi.json`, `mr.json`, `ta.json`, `gu.json`, `hinglish.json`. Use `data-i18n` attributes (and `data-i18n-placeholder` / `aria-label` where needed). Update `<html lang>` on every switch.
4. Translate everything naturally for local business owners (not word-for-word machine translation): hero, services, rooms/business types, process steps, estimator labels and feature names, buttons, footer, WhatsApp pre-filled messages. Write the translations yourself, and list at the end every string a native speaker should proofread.
5. Fonts: load Noto Sans Devanagari, Noto Sans Tamil, Noto Sans Gujarati (Google Fonts, display=swap) with good fallbacks and correct line-height for each script. Check that no text overflows buttons, cards or the cost estimator in any language (longer text in Marathi and Tamil).
6. Make adding a new language easy: only a new JSON file plus one line in a languages list (we will add Bengali, Telugu, Kannada, Malayalam, Punjabi later).
7. Keep currency as rupees with Indian digit grouping (Intl.NumberFormat with en-IN, or the matching locale).

## Task 3: Photoreal premium interiors instead of graph-like 3D rooms
The current rooms are made from simple 3D boxes and look like graphs. Replace them with premium, photoreal interiors (fictional ambience, no real brands, no real people, no text in the images).
1. Create a "Spaces" experience: one space per business type: hotel lobby, hotel suite, restaurant, cafe, gym, salon and spa, boutique (clothing and jewellery), bakery, coaching class, furniture and interior studio, local brand store.
2. Each space uses AI-generated images that I will add to `assets/interiors/` (file names in `assets/interiors/README.md`). Support both:
   - 2:1 equirectangular 360° panoramas shown inside a three.js sphere (drag, touch, gentle auto-rotate, optional gyroscope on mobile), and
   - normal wide images shown with a smooth parallax and slow cinematic zoom.
   Detect which one applies from the image aspect ratio.
3. Keep the scroll-driven journey: scrolling moves from space to space with a premium crossfade or "push-through" transition, a soft vignette, light film grain and a subtle glow in the brand colours.
4. Add 2 to 4 clickable hotspots per space (for example Menu, Book a table, Rooms, Membership plans, Gallery, Get a quote) that open a small glass card describing what WebCrown builds for that business type, with a button to WhatsApp us. All hotspot text must be in the i18n files.
5. Until the images exist, show a tasteful placeholder (blurred gradient with the space name) and make sure nothing breaks.
6. Performance: WebP or AVIF, lazy-load the space that is next, show a blurred low-resolution placeholder first, cap pixel ratio at 2, pause rendering when the tab is hidden, respect `prefers-reduced-motion`, and fall back to static images if WebGL is unavailable. Aim for Lighthouse performance 85+ on mobile.
7. Remove the CDN dependency: set the project up with Vite (vanilla JS), install `three` with npm, and bundle it. No external scripts except Google Fonts.

## Quality bar
- Premium, calm and cinematic: generous spacing, large type, restrained animation, no gimmicks.
- Responsive from 360px to 1920px, keyboard accessible, readable contrast, meaningful alt text.
- Clean, commented code split into small modules (i18n.js, spaces.js, estimator.js, main.js).
- When finished, update README.md with how to run, build and add images or languages.
