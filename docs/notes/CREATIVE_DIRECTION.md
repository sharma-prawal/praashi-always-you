# Creative Direction & Art Direction Specification
## Project: "#PrAashi — Always You"
### A Private Interactive Love Gift from Pawi to Nikki

---

## 1. Executive Summary & Emotional Objective

- **The Recipient:** Nikki, experiencing this private keepsake on her mobile phone.
- **The Creator:** Her husband Pawi (Prawal Sharma).
- **The Emotional Objective:** Make Nikki feel deeply loved, profoundly valued, and completely certain that Pawi will always choose her—through every high and low, through every season and circumstance.
- **Creative Paradigm:** A **Celestial Keepsake Album & Living Love Letter**.
- **Design Philosophy:** Quiet luxury, intimate mobile composition, cinematic lighting, and subtle magical realism. Absolutely no generic Valentine's Day tropes (no red cartoon hearts, no floating emoji wallpaper, no gimmicky countdowns). Every detail feels grounded, intentional, and timeless.

---

## 2. Creative Direction & Visual Style System

### 2.1 Color Palette & Semantic Tokens

| Token Name | Hex Code | Visual Metaphor & Application |
| :--- | :--- | :--- |
| **Midnight Plum** | `#1C1124` / `#120C18` | The quiet night sky; outer stage backdrop and container shell. Creates deep, cinematic contrast and privacy. |
| **Warm Rose** | `#F7CAD7` / `#D58C9D` | Tender intimacy, wax seal, interactive heart pulses, blush accents, and highlighted headline emphasis (`<em>`). |
| **Champagne Gold** | `#E9C47A` / `#F8DCA5` | Timeless warmth, fine orbital linework, starlight beacons, active navigation pills, and primary action buttons. |
| **Ivory** | `#FFF8EF` / `#FDF6EB` | Natural heirloom rag paper, warm photograph mount borders, crisp serif titles, and natural text readability. |
| **Deep Weather Slate** | `#293447` / `#545967` | Introspective mood in the weather portal; evocative of passing storms and night rains. |

### 2.2 Typography Hierarchy

- **Lyrical Display & Headings:** `Cormorant Garamond` (Self-hosted variable serif).
  - *Weights:* 400 Regular, 400 Italic, 500 Medium.
  - *Scale:* Hero headlines `clamp(42px, 12.5vw, 60px)`, line-height `0.99`, letter-spacing `-0.025em`.
  - *Italic Highlights:* Used deliberately on resonant words (e.g., *something*, *little things*, *choose again*, *always*).
- **Body & Interactive Controls:** `DM Sans` (Self-hosted clean geometric sans-serif).
  - *Weights:* 400 Regular, 500 Medium.
  - *Scale:* Controls and buttons `12px` (uppercase/spaced or sentence case), letter paragraphs `15px / 1.9`, auxiliary notes `10px`.

### 2.3 Visual Textures & Atmospheric Lighting

1. **Warm Radial Luminescence:** Subtle radial gradients (`ellipse at 50% 45%, #2a182e 0, #160e1c 47%, #120c18 80%`) ground the phone viewport in deep dimensional warmth.
2. **Photograph Mounting:** Photographs are framed in warm ivory matting with soft, diffused drop shadows (`0 10px 25px rgba(8, 4, 12, 0.35)`), creating the tactile illusion of fine physical prints resting on silk-finish paper.
3. **Fine Orbital Lines:** Hairline celestial arcs (`0.22px - 1px`) rendered in champagne gold with faint dashes, evoking personal astronomy and navigation.

---

## 3. Original Decorative Assets Direction

All decorative assets are crafted as lightweight, resolution-independent SVGs designed to load instantly and cache offline without third-party requests.

| Asset File | Purpose & Creative Expression |
| :--- | :--- |
| [`public/assets/praashi-monogram.svg`](public/assets/praashi-monogram.svg) | **Original #PrAashi Monogram:** Entwined serif letterforms **"P"** (Pawi in Champagne Gold) and **"A"** (Nikki/Aashi in Warm Rose), interlinked through a central glowing heart jewel, encircled by fine orbital rings and cardinal 4-point celestial starbursts. |
| [`public/icon.svg`](public/icon.svg) | **App Icon & PWA Manifest:** The #PrAashi monogram rendered on a midnight plum squircle, powering the iOS Home Screen bookmark, standalone web app, and retina favicon. |
| [`public/assets/glowing-heart.svg`](public/assets/glowing-heart.svg) | **Delicate Glowing Heart Motif:** Layered dual-curve silhouette with soft ambient bloom halo, angled orbital rings, and stardust cross-star highlights. Used in the promise interaction. |
| [`public/assets/light-trails.svg`](public/assets/light-trails.svg) | **Soft Light Trails:** Sweeping champagne and warm rose stardust filaments, creating a gentle sense of motion and cosmic transition between chapters. |
| [`public/assets/starfield.svg`](public/assets/starfield.svg) | **Refined Starfield:** Multi-tiered cosmic backdrop with faint violet-plum nebulae, magnitude-1 cross stars with soft halos, and scattered stardust pinpricks. |
| [`public/assets/weather-sunlight.svg`](public/assets/weather-sunlight.svg) | **Cinematic Sunlight Overlay:** Warm golden-hour volumetric light rays, soft lens corona, and luminous morning warmth for the weather portal. |
| [`public/assets/weather-rain.svg`](public/assets/weather-rain.svg) | **Atmospheric Rain & Mist Overlay:** Delicate 18° slanted rain streaks, soft blue-gray mist wash, and droplet glimmers symbolizing quiet, introspective days. |
| [`public/assets/paper-texture.svg`](public/assets/paper-texture.svg) | **Handmade Paper Letter Texture:** Warm ivory parchment background with faint rag fibers, subtle deckled edge vignette, and delicate gold foil corner filigree for the love letter. |

---

## 4. Curated Photo Manifest (20 Selected Keepsakes)

Curated from all 121 accessible archival photographs across `Photos/`. Each photograph was selected for emotional intimacy, genuine expressions, composition variety, and visual rhythm. **No faces were altered, generated, or retouched.** EXIF/GPS metadata was stripped from all optimized copies.

| ID | Original Source Filename | Aspect / Dimensions | Focal Crop (`position`) | Emotional Role & Scene Placement | Caption |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **01** | `Photos/IMG_9290.jpeg` | Landscape (4032×3024) | `50% 35%` | **Scene 1 (Opening Cover):** Intimate close portrait, gentle smiles; tucked into the keepsake envelope invitation. | *"You became my favourite part of everything."* |
| **02** | `Photos/IMG_2203.jpeg` | Portrait (3024×4032) | `50% 35%` | **Scene 2 (Card 1):** Soft indoor warmth, gentle head lean, serene comfort. | *"Some people become home."* |
| **03** | `Photos/IMG_2281.jpeg` | Landscape (4032×3024) | `50% 45%` | **Scene 2 (Card 2):** Genuine shared laughter, candid joy, warm connection. | *"A little closer to forever."* |
| **04** | `Photos/IMG_1057.jpeg` | Landscape (4032×3024) | `50% 45%` | **Scene 2 (Card 3):** Tender embrace, peaceful eye contact, soft daylight. | *"The way you make my world softer."* |
| **05** | `Photos/IMG_2719.jpeg` | Landscape (4032×3024) | `50% 45%` | **Scene 2 (Card 4):** Vibrant ambient lighting, celebratory warmth, sparkling eyes. | *"All the colours of us."* |
| **06** | `Photos/IMG_3585.jpg` | Portrait (3024×4032) | `50% 45%` | **Scene 2 (Card 5):** Outdoor daylight, wind-swept smiles, shared adventure. | *"Wherever life takes us, you."* |
| **07** | `Photos/IMG_6018.jpeg` | Landscape (4032×3024) | `50% 35%` | **Scene 2 (Card 6):** Spontaneous everyday laughter, unposed sweetness. | *"The little things. The everything things."* |
| **08** | `Photos/c40e6324-bb57-4248-b04c-f49c6b0f0a4a.jpeg` | Square (1280×1260) | `50% 35%` | **Scene 2 (Card 7):** Close-up intimacy, head-to-head gentle lean, deep tenderness. | *"My favourite place is beside you."* |
| **09** | `Photos/2202706 A3 E.jpeg` | Landscape (7020×4950) | `50% 45%` | **Scene 3 (Star 1):** Milestone elegance, ceremonial richness, deep commitment. | *"A promise I keep choosing."* |
| **10** | `Photos/EBE84152-B022-4170-ABE9-7C4DE33A2929.jpeg` | Panoramic (5951×3399) | `50% 45%` | **Scene 3 (Star 2):** Dramatic wide scenic landscape; couple centered against expansive world. | *"A whole world, and then there is you."* |
| **11** | `Photos/IMG_0870.jpeg` | Landscape (4030×3024) | `50% 35%` | **Scene 3 (Star 3):** Spontaneous natural laughter, relaxed and playful intimacy. | *"With you, the ordinary feels wonderful."* |
| **12** | `Photos/IMG_1363.jpeg` | Portrait (4000×6000) | `50% 35%` | **Scene 3 (Star 4):** Radiant joy, warm golden backlight, luminous gaze. | *"My favourite kind of happiness."* |
| **13** | `Photos/IMG_1927.jpeg` | Portrait (3024×4032) | `50% 45%` | **Scene 3 (Star 5):** Golden hour evening warmth, quiet closeness, peaceful serenity. | *"Still finding new reasons to love you."* |
| **14** | `Photos/IMG_3303.jpg` | Portrait (3024×4032) | `50% 45%` | **Scene 3 (Star 6):** Unhurried, authentic presence; effortless couple harmony. | *"You and me. Just as we are."* |
| **15** | `Photos/IMG_3666.jpeg` | Landscape (4032×3024) | `50% 45%` | **Scene 3 (Star 7):** Scenic outdoor embrace; timeless memory of togetherness. | *"Some moments I would choose again."* |
| **16** | `Photos/IMG_4176.jpeg` | Portrait (3024×4032) | `50% 45%` | **Scene 2 (Card 8 / Climax):** Direct tender eye contact, gentle affectionate smile. | *"Always looking for you."* |
| **17** | `Photos/IMG_4392.jpeg` | Portrait (3024×4032) | `50% 45%` | **Scene 4 (Weather Anchor):** Grounded, resilient couple portrait framed within the weather portal. | *"You are my warmest light."* |
| **18** | `Photos/IMG_4438.jpg` | Portrait (3024×4032) | `50% 45%` | **Scene 6 (Finale Orbit 4):** Atmospheric evening light, celebratory mood, enduring warmth. | *"Every version of us, worth choosing."* |
| **19** | `Photos/IMG_6616.jpeg` | Portrait (3024×4032) | `50% 45%` | **Scene 6 (Finale Orbit 5):** Quiet, gentle closeness; an understated moment of profound love. | *"A small moment. A very big love."* |
| **20** | `Photos/IMG_9540.jpeg` | Landscape (4032×3024) | `50% 35%` | **Scene 6 (Finale Centerpiece):** The climactic closing portrait: radiant certainty, loving unity, looking forward into tomorrow. | *"A thousand tomorrows. The same answer."* |

---

## 5. Experience Design: The Six Scenes

### Scene 1: "A Little World for You"
- **Main Visual Composition:** An illustrated ivory-and-warm-sand envelope resting in deep plum space, encircled by delicate golden orbital rings. The first curated photograph (`photo-01`, `IMG_9290.jpeg`) peeks out at an intimate angle with a burgundy wax seal bearing a heart emblem.
- **Candidate Photo:** `Photos/IMG_9290.jpeg` (Photo 01).
- **Typography:**
  - Dedication: *For my favourite person.* (`Cormorant Garamond`, Italic, `17px`, `#DCC7CF`).
  - Title: **Nikki, I made you *something.*** (`Cormorant Garamond`, `clamp(42px, 12vw, 57px)`, Ivory with Blush emphasis).
- **Color Palette:** Midnight plum (`#1C1124`), champagne orbit lines (`#E9C47A15`), warm blush seal (`#925763`), ivory card (`#FFF5E6`).
- **Touch & Motion:**
  - Tapping *"Open our little world"* triggers an expanding radial wash of golden sunlight (`opening-light`), whisking the envelope open into the memory chapter.
  - Resume button appears for returning visits (`saved.scene > 0`).
- **Scene Transition:** Radial light bloom expansion (1.1s cubic-bezier ease-out) crossfading smoothly into Scene 2.
- **Intended Emotional Effect:** Instant anticipation, warmth, and quiet astonishment—Nikki feels that a bespoke world has been created solely for her.

### Scene 2: "All the Little Things"
- **Main Visual Composition:** A tactile physical photo stack. The current photo is mounted in an ivory Polaroid-style frame with a lyrical caption below, while subtle angled card backs hint at memories waiting underneath.
- **Candidate Photos:** Photos 01 through 08 (`IMG_9290`, `IMG_2203`, `IMG_2281`, `IMG_1057`, `IMG_2719`, `IMG_3585`, `IMG_6018`, `c40e6324...`).
- **Typography:**
  - Title: **All the *little things.*** (`Cormorant Garamond`, `48px`).
  - Scene Note: *It's you who makes them everything.* (`DM Sans`, `12px`, muted).
  - Captions: Lyrical single-line statements (`Cormorant Garamond`, Italic, `17px`, `#65444C`).
- **Color Palette:** Deep plum stage, ivory photo frame (`#FFF4E7`), soft rose shadows, champagne indicators.
- **Touch & Motion:**
  - Smooth horizontal swipe gesture with spring resistance (`type: 'spring', bounce: 0.2, duration: 0.5s`).
  - Tactile left/right chevron buttons and 8 progress dots.
  - Keyboard arrow key navigation supported.
- **Scene Transition:** Crossfade with `translateY(-6px)` upward drift.
- **Intended Emotional Effect:** Playful, tactile nostalgia. Highlighting that ordinary daily moments are the foundation of deep love.

### Scene 3: "The Moments I Would Choose Again"
- **Main Visual Composition:** An interactive celestial constellation map. Fine champagne starlight lines connect 7 glowing star nodes across the night sky, each annotated with a whisper (*you & me*, *our kind of magic*, *always us*, *a little joy*, *closer*, *my favourite*, *home*).
- **Candidate Photos:** Photos 09 through 15 (`2202706 A3 E`, `EBE84152...`, `IMG_0870`, `IMG_1363`, `IMG_1927`, `IMG_3303`, `IMG_3666`).
- **Typography:**
  - Title: **The moments I'd *choose again.*** (`Cormorant Garamond`).
  - Constellation Label: *every star, another reason.* (`Cormorant Garamond`, Italic, `19px`, `#F7CAD7C0`).
  - Star tags: `Cormorant Garamond` Italic `13px`.
- **Color Palette:** Midnight sky with gold constellation paths (`#D8B77550` dashed lines) and rose visited states (`#F7CAD7`).
- **Touch & Motion:**
  - Tapping any star triggers an orbital glow pulse and opens the photograph in an intimate focus lightbox dialog.
  - Seen count increments gracefully (*"3 of 7 little moments revisited"*).
- **Scene Transition:** Gentle fade and vertical float into the weather portal.
- **Intended Emotional Effect:** Wonder and affirmation—experiencing their journey as something destined and written in the stars.

### Scene 4: "Through It All"
- **Main Visual Composition:** An arched architectural weather window. On one side sits a radiant golden sun disc; on the other, a gentle crescent moon with drifting rain streaks. Anchored firmly in the center is a resilient couple portrait (`photo-17`, `IMG_4392.jpeg`), with an etched inscription: *you are my constant*.
- **Candidate Photo:** `Photos/IMG_4392.jpeg` (Photo 17).
- **Typography:**
  - Title: **Through *it all.*** (`Cormorant Garamond`).
  - Atmospheric Lines: Three sequenced reflections (`Cormorant Garamond`, `19px`, Ivory).
  - Weather Promise: *On every kind of day, I'll choose you.* (`Cormorant Garamond`, `25px`, Blush highlight).
- **Color Palette:** Split gradient transitioning from sunrise amber (`#DCA275` / `#EEDBA8`) to midnight storm indigo (`#293447` / `#545967`).
- **Touch & Motion:**
  - Interactive slider controls the weather balance between golden sunlight (0%) and gentle rain (100%).
  - The landscape, moon, rain, and sun opacity interpolate continuously via CSS variable `--weather`.
  - Step button allows reading the 3 reflections sequentially without sliding.
- **Scene Transition:** Crossfade into the promise threshold.
- **Intended Emotional Effect:** Emotional depth and security. Acknowledging that life brings storms, but their bond remains unshakable.

### Scene 5: "My Promise to You"
- **Main Visual Composition:**
  - **State A (The Threshold):** A glowing heart suspended within twin celestial orbital rings. A circular progress ring frames the heart.
  - **State B (The Unfolding Letter):** A tactile handmade paper letter (`#FFF9EF`) unfolds downwards like real stationery, adorned with gold filigree and Pawi's exact words.
- **Candidate Graphic:** Glowing heart vector with orbital halo and pulse animation; letter styled with bespoke paper grain and sign-off.
- **Typography:**
  - Title: **To My Nikki ❤️** (`Cormorant Garamond`, Medium, `34px`).
  - Letter Body: Clean, highly legible sans-serif (`DM Sans`, Regular, `15px / 1.9`, `#48303B`).
  - Focal Promise: *You. Always you.* (`Cormorant Garamond`, Italic, `35px`, Burgundy `#7F4154`).
  - Sign-off: *Forever yours, Pawi ❤️* (`Cormorant Garamond`, Italic, `22px`).
- **Color Palette:** Warm cream parchment (`#FFF9EF`), deep mulberry ink (`#48303B`), antique gold rule (`#AE865A25`).
- **Touch & Motion:**
  - Hold-to-reveal: Pressing and holding the heart for 2 seconds triggers an expanding ring of light that unrolls the letter.
  - Releasing before 2 seconds snaps the progress ring back gracefully.
  - Accessible single-tap alternative provided immediately below for touch ease or keyboard users.
  - Natural document scrolling for the letter body; no clipped text on small viewports.
- **Scene Transition:** Paper fold expansion with smooth vertical scroll reset.
- **Intended Emotional Effect:** Profound intimacy, tears of joy, and unshakable reassurance.

### Scene 6: "Every Tomorrow"
- **Main Visual Composition:** A grand celestial orbital ring with 6 keepsake photos floating in gentle planetary arrangement (`photos[0, 1, 5, 14, 16, 19]`). At the focal center rests a glowing heart button. Below sits the wordmark: **Forever #PrAashi ❤️**.
- **Candidate Photos:** Photos 01, 02, 06, 15, 17, and 20 (`IMG_9290`, `IMG_2203`, `IMG_3585`, `IMG_3666`, `IMG_4392`, `IMG_9540`).
- **Typography:**
  - Finale Title: **I'll choose you. *Always.*** (`Cormorant Garamond`, `clamp(44px, 12.5vw, 60px)`).
  - Wordmark: *Forever #PrAashi* (`Cormorant Garamond`, `22px`, Gold & Blush).
  - Dedication: *Made with all my love, Pawi.* (`DM Sans`, `9px`, muted).
- **Color Palette:** Deepest midnight plum, sparkling gold particles, radiant rose hearts.
- **Touch & Motion:**
  - Tapping the central heart triggers a delightful, bounded 12-particle starlight and heart burst (`love-burst`).
  - Actions: *"Read my promise"* (revisits the letter), *"Experience again"* (replays from Scene 1), *"Our photos"* (opens the full 20-photo archive modal).
- **Scene Transition:** Permanent resting state of love and certainty.
- **Intended Emotional Effect:** Elation, celebration, and closure that feels like an eternal beginning.

---

## 6. Captions & Emotional Voice

All captions speak directly to feeling, presence, and unwavering devotion without asserting unverified factual claims (such as specific dates, trips, or milestones):

1. **Cover Keepsake:** *"You became my favourite part of everything."*
2. **Everyday Intimacy:** *"Some people become home."*
3. **Enduring Companionship:** *"The way you make my world softer."*
4. **Vibrant Life:** *"In all the colours of life, I find you."*
5. **Presence:** *"A thousand places. My favourite is beside you."*
6. **Weather Reflection 1:** *"Not every day will be easy."*
7. **Weather Reflection 2:** *"Not every moment will be perfect."*
8. **Weather Reflection 3:** *"But there's something you should never doubt."*
9. **Weather Climax:** *"On every kind of day, I'll choose you."*
10. **The Fixed Final Promise:**
    > *"I love you, and I'll always choose you, through every high and low, through all the thick and thin."*

---

## 7. Animation & Interaction Specifications

### 7.1 Motion Tokens & Physics
- **Shared Ease:** `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` (snappy entry, natural cushioned deceleration).
- **Scene Transitions:** AnimatePresence with crossfade (`opacity: 0` to `1`) and a 10px upward vertical slide (`translateY(10px)` to `0px`), duration `250ms`.
- **Card Swipes:** Spring physics (`stiffness: 300, damping: 25, bounce: 0.2`) allowing interruptible fluid dragging.
- **Heartbeat Rhythm:** CSS keyframe pulse lasting `3.6s` with a double diastolic bump at `16%` and `25%`.
- **Particle Bursts:** Radial trigonometry (`var(--x): cos(θ)*r, var(--y): sin(θ)*r`) bounded within 110px radius, duration `1.3s`, automatically garbage-collected.

### 7.2 Accessibility & Reduced Motion
- When `prefers-reduced-motion: reduce` is detected:
  - Decorative star twinkles and heartbeat animations stop.
  - Draggable cards switch to instant arrow/button clicks.
  - Transitions switch to brief 100ms opacity fades with zero transform displacement.
  - Particle bursts are suppressed.

---

## 8. Implementation Guide for Codex & Future Engineering

### 8.1 Core Principles
- **No Remote Requests:** The app is completely self-contained. No fonts, images, or audio may be fetched from CDNs.
- **Photo Integrity:** Original files in `Photos/` are strictly immutable read-only provenance. Only optimized derivatives in `public/photos/` are served.
- **Audio Consent:** Sound remains strictly silent until an explicit user tap on the audio icon. Sound immediately pauses if the browser tab hides (`visibilitychange`).
- **Mobile First Touch:** Every interactive element has a minimum touch bounding box of `44px × 44px`. Natural vertical document scrolling is preserved for the letter to prevent viewport clipping on iPhone SE (320px).

### 8.2 Build & Test Pipeline
```bash
# 1. Inspect archival contact sheets:
npm run photos:contact -- ./Photos

# 2. Re-import and optimize curated photos (if changed in scripts/curation.json):
npm run photos:import

# 3. Code quality and type safety:
npm run lint
npm run typecheck

# 4. Production build and service worker generation:
npm run build

# 5. Playwright test suite (Chromium & WebKit, 320px to 1440px):
npm test
```
