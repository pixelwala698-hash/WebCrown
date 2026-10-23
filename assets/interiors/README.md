# Interior images

Add optimized `.webp`, `.avif`, `.jpg` or `.png` images for these business spaces:

- `hotel-lobby.webp`
- `hotel-suite.webp`
- `restaurant.webp`
- `cafe.webp`
- `gym.jpg`
- `salon.jpg`
- `boutique.jpg`
- `bakery.jpg`
- `coaching.jpg`
- `furniture.jpg`
- `brand-store.jpg`

Current images are imported into the Vite build from this folder. Keep each file extension consistent with its actual format so production servers return the correct MIME type. The 11 current images are all approximately 2:1 and are detected as equirectangular panoramas. Their resolutions are 1456×720 or 1024×506; for future panoramas, 4096×2048 is recommended. Other aspect ratios are shown as wide cinematic images with parallax and slow zoom. If no image is present, the site keeps its labelled blurred placeholder.

See `docs/IMAGE-PROMPTS.md` for scene prompts.
