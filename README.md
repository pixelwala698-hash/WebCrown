# WebCrown website

Responsive, multilingual agency site for immersive websites and interior experiences for local businesses. Built with vanilla JavaScript, Vite and Three.js.

## Run locally

Requires Node.js 20.19+ or 22.12+.

### Development server

```sh
npm install
npm run dev
```

Use this while editing; Vite serves the source files with hot reload. The first visit opens the language chooser; the selected language is saved as `webcrown-language` in local storage.

### Static production build

```sh
npm run build
```

This writes a self-contained `dist/index.html` with the application code, styles, Three.js and interior images bundled inline. Serve `dist/` with Live Server, `npx serve dist`, Netlify or GitHub Pages; the relative Vite base also supports hosting under a project subpath. The built HTML can also be opened directly with `file://`.

### Preview the production build

```sh
npm run preview
```

Vite serves the production build locally for a final check before deployment. Google Fonts are the only external resources.

## Interior images

Add optimized WebP, AVIF, JPEG or PNG images to `assets/interiors/` using these filenames:

`hotel-lobby.webp`, `hotel-suite.webp`, `restaurant.webp`, `cafe.webp`, `gym.jpg`, `salon.jpg`, `boutique.jpg`, `bakery.jpg`, `coaching.jpg`, `furniture.jpg`, `brand-store.jpg`

The current 11 image files are imported by `js/spaces.js`, so Vite bundles them into the standalone production page. Keep their filename extensions accurate to the underlying image format. The site detects an approximately 2:1 image as an equirectangular 360° panorama and displays it in a draggable Three.js sphere when WebGL is available. Other aspect ratios use the cinematic still-image treatment. Missing images keep the blurred, labelled placeholder visible.

The next nearby space is lazy-loaded. Prefer optimized AVIF/WebP files; use a 2:1 panorama (ideally 4096×2048) or a wide still (ideally 2560×1440). See [docs/IMAGE-PROMPTS.md](./docs/IMAGE-PROMPTS.md) and [assets/interiors/README.md](./assets/interiors/README.md) for prompts and filenames.

## Languages

Translations live in `i18n/`: `en.json`, `hi.json`, `mr.json`, `ta.json`, `gu.json` and `hinglish.json`. All interface copy is selected with `data-i18n` keys or translation keys in the JavaScript modules.

The complete native-speaker proofreading checklist is in [docs/TRANSLATION-REVIEW.md](./docs/TRANSLATION-REVIEW.md).

To add a language:

1. Add a JSON file with the same keys as `i18n/en.json`.
2. Add one `{ code, lang }` entry to the `languages` array in `js/i18n.js`.

The chooser uses each dictionary's `language.native.*` and `language.english.*` labels. Set `lang` to the appropriate BCP 47 tag (for example, `bn` for Bengali). Rupee estimates use Indian digit grouping.

## Portfolio, quotes and enquiries

- Portfolio entries are listed in `data/projects.json`. Add an entry with translation keys and an available image key; the Aishwaryam live-demo URL is kept in `config/site-config.json`.
- All quote prices, language charges, delivery times and range multipliers are in `data/rates.json`. The estimator always displays a range, not a single fixed total.
- The `/admin/` page lets you change every rate, preview a sample quote, and import/export the rates JSON. For this standalone demo, the PIN hash is in `config/site-config.json` (the initial PIN is `1234`; change the hash before sharing the site).
- The admin PIN is only a light front-end lock, not real security: the bundled code and hash are public, and there is no server-side authentication.
- Rates overrides, recent quotes and enquiries are stored in this browser's local storage. They are device/browser-specific and are not synced or sent to a backend. `js/data-store.js` isolates the storage interface so it can later be replaced by a Supabase or Firebase adapter without changing the page UI.
- The enquiry form saves the details on this device and opens WhatsApp to the selected contact. Sending a quote likewise saves its options and opens a prefilled message to either contact.

## Project structure

- `index.html` — accessible page shell, inline pixel-crown logo and SVG favicon
- `css/style.css` — responsive dark/glow design, language chooser and image treatments
- `js/i18n.js` — locale loading, switching, document language and metadata
- `js/spaces.js` — business-space journey, image loading, panorama rendering and hotspots
- `js/portfolio.js` — project cards from the portfolio JSON
- `js/quote.js` — range calculation and quote helpers using the rates data
- `js/estimator.js` — localized estimator, quote history and WhatsApp messages
- `js/leads.js` — validated lead form, local storage and WhatsApp handoff
- `js/data-store.js` — local persistence adapter for rates, quotes and leads
- `js/admin.js` — PIN-gated rate editor, preview and local record lists
- `js/main.js` — public/admin route initialization and contact links
- `i18n/` — six locale dictionaries

WhatsApp contacts: Bhavesh Bobde, 9822734707 (`919822734707`); Grishma Parshivnikar, 8600103414 (`918600103414`).

## Quick checks

- Clear local storage or remove `webcrown-language` to test the first-visit chooser.
- Switch all six languages and confirm the page, estimator, document language and WhatsApp messages update.
- Select estimator options and verify the rupee range and estimate link.
- Open `/admin/`, enter the initial PIN (`1234`), change a rate, save it, preview a quote, and export/import the rates file. Verify submitted quotes and enquiries appear in the local admin list.
- Submit the enquiry form with invalid and valid details; confirm validation messages, recipient-specific WhatsApp links and local admin records.
- Build and serve `dist/`, then open `/admin/` on the static server to verify the copied admin route works.
- Add an interior image, test both a normal wide image and a 2:1 panorama, then test with WebGL disabled and with reduced motion enabled.
