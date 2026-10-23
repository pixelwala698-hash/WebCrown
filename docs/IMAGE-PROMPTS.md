# Prompts for AI interior images

I (Claude) cannot generate images, so make these with an image tool such as Midjourney, Google Gemini/Imagen, DALL·E or Flux. For true 360° panoramas use a tool that outputs equirectangular images, for example Blockade Labs "Skybox AI". If your tool cannot make seamless 360°, use the normal wide version and the site will show it with parallax.

Save as `.webp` and/or `.avif` into `assets/interiors/`, using the file names below. The site prefers AVIF when supported and falls back to WebP. Use a 2:1 panorama (ideally 4096x2048) or a wide still (ideally 2560x1440); the site detects panoramas from their aspect ratio. If a named image is not present, its labelled blurred placeholder remains visible.

## Base style (add to every prompt)
Ultra-photorealistic interior photograph, fictional design, premium luxury ambience, cinematic warm lighting with soft realistic shadows, natural materials, 24mm lens, high dynamic range, crisp detail, no people, no text, no logos, no watermark.

## For panoramas add
equirectangular 360 degree panorama, 2:1 aspect ratio, seamless left and right edges, eye-level camera.

## Scenes
1. hotel-lobby: Boutique hotel lobby with polished marble floor, brass accents, tall arched windows, velvet sofas, large fresh flower arrangement, warm pendant lights, contemporary Indian design.
2. hotel-suite: Luxury hotel suite, king bed with fluted walnut headboard and crisp linen, warm bedside lamps, balcony doors with a sunset view, soft rug, quiet and elegant.
3. restaurant: Premium fine-dining restaurant, deep teal walls, round tables with white linen, a statement chandelier, glowing open kitchen in the background, polished wood floor.
4. cafe: Specialty cafe with concrete and warm wood, a long espresso bar, hanging plants, large windows with soft morning light, small round tables.
5. gym: Premium modern gym, black rubber floor, neatly arranged machines and free weights, full-length mirrors, LED strip lights in the ceiling, moody blue and orange lighting.
6. salon: Luxury salon and spa, backlit round mirrors, marble counters, velvet chairs, soft indirect lighting, brass details.
7. boutique: Upscale clothing and jewellery boutique, glass display cabinets with spotlights, curated shelves, soft carpet, gold and cream palette.
8. bakery: Artisan bakery with marble counter, glass display of pastries and breads, wooden shelves, warm pendant lights, a chalkboard-free minimal look.
9. coaching: Modern coaching and learning studio, light wood desks, a clean whiteboard wall, large windows with natural light, calm focused mood.
10. furniture: Furniture and interior design showroom with styled room sets, a sofa, rug and layered lighting, gallery-style spotlights, neutral earthy palette.
11. brand-store: Minimal local product brand store, pastel palette, product wall with simple shelves, a central display table, soft daylight.

## Example full prompt
"Ultra-photorealistic interior photograph of a specialty cafe with concrete and warm wood, a long espresso bar, hanging plants, large windows with soft morning light, small round tables, fictional design, premium luxury ambience, cinematic warm lighting with soft realistic shadows, 24mm lens, high dynamic range, no people, no text, no logos, no watermark, equirectangular 360 degree panorama, 2:1 aspect ratio, seamless left and right edges"
