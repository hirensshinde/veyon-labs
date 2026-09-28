# Veyon Labs — website

A static marketing site for a web and app development studio. No build step, no dependencies, no
framework — an editorial type system in one stylesheet. Every page is plain HTML referencing
one stylesheet and one script, so you can open `index.html` directly or drop the folder on any
host.
HTML that references one stylesheet and one script, so you can open `index.html` directly in
a browser or drop the folder on any host.

## Structure

```
index.html                       Home
services.html                    Services + engagement models
onehostbox.html                  Onehostbox — in-house product page
work.html                        Work index
about.html                       Studio / about
blog.html                        Journal index
blog-six-week-mvp.html           Post
blog-react-native-vs-native.html Post
blog-shipping-ai-features.html   Post
contact.html                     Contact form
404.html                         Not found
robots.txt, sitemap.xml          SEO
assets/css/main.css              All styling (design tokens at the top)
assets/js/main.js                Theme toggle, nav, reveals, form handling
assets/img/                      Logo, mark, reversed versions + favicon (SVG)
```

## Run it locally

Open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000     # then visit http://localhost:8000
```

## Contact form

The form works out of the box in fallback mode: it opens the visitor's mail client with the
answers pre-filled. To have it submit directly instead, pick any form backend that accepts a
`POST` of `FormData` and returns JSON — Formspree, Basin, Web3Forms, Netlify Forms — and put
its endpoint in the form's `action`:

```html
<!-- contact.html, ~line 120 -->
<form class="form" data-contact-form action="https://formspree.io/f/abcdwxyz" method="POST">
```

The script in `assets/js/main.js` handles the rest: validation, a hidden honeypot field for
spam, the sending state, and success/error messages. No other change is needed.

## The design system

The site is an editorial type system, not a component kit. Structure comes from hairline
rules and a 12-column grid — there are no shadows, gradients or rounded corners anywhere, and
that is deliberate. Keep it that way and new pages will match without effort.

**Type** — three faces, each with one job:

| Face | Role |
| --- | --- |
| Archivo | Headlines, body, UI. Tight tracking (`-0.035em` and below) at large sizes. |
| Instrument Serif (italic) | Emphasis words in headlines, pull quotes, figure units. Nothing else. |
| JetBrains Mono | Labels, metadata, numbers, tags, nav. Always uppercase with wide tracking. |

**Colour** — warm paper, near-black ink, and exactly one accent. The red is for emphasis
(hover states, the brand mark, list numbers), never for decoration or large fills.

```css
:root {
  --paper: #f3f1ec;   /* page */
  --ink:   #15150f;   /* text */
  --rule:  #d4d1c4;   /* hairlines */
  --signal:#d8351a;   /* the one accent */
}
```

Dark values live in the `:root[data-theme="dark"]` block directly below. Change a token in
both places and it propagates everywhere.

**Layout** — `.wrap` is the container; `.g12` is a 12-column grid. Width comes from
`.span-N` and offset from `.start-N`:

```html
<div class="wrap g12">
  <div class="span-6">…</div>
  <div class="span-4 start-8">…</div>   <!-- 4 columns wide, starting at column 8 -->
</div>
```

`.span-N` sets only `grid-column-end`. It must stay that way — using the `grid-column`
shorthand also writes `grid-column-start`, which `.start-N` then overrides, collapsing the
element to a single track.

**Recurring components:** `.index` / `.index__row` (the numbered, ruled list used for work and
journal entries), `.numbered` (services, process, principles), `.figures` (statistics),
`.panel` (hairline box), `.kv` (key/value table), `.opener` (section heading with rule and
index number), `.quote`, `.faq`, `.prose` (article body).

**Graphics** — all artwork is inline SVG built on the same grid, coloured only with theme
tokens (`assets/css/main.css` §Graphics), so it follows light/dark with no second asset and
nothing extra to download. The source lives in one module and is injected at build time.
Classes inside a graphic: `s-rule` / `s-ink` / `s-signal` for strokes, `f-ink` / `f-signal` /
`f-muted` / `f-rule` / `f-paper` for fills, `t` for mono labels, `dash` for dashed lines.

| Mark | Where |
| --- | --- |
| Quarter-circle fan on a module grid | Home hero |
| Stage timeline, drawn to real durations | Home, process section |
| Unit chart (96 of 100 squares) | Home, beside the 96% figure |
| Git → AI code → hosting flow | `onehostbox.html` |

Two rules worth keeping: a mark that states a number must be drawn to scale, and `.plate .gfx` is capped at 560px so a 400-unit viewBox never
scales up to container width and blows the type inside the drawing out of proportion.

**Logo** — the Quarter tile: an ink square with a quarter circle cut from its top-right corner and
the signal-red square set in the cut. It is the home-page hero graphic reduced to one tile.
Files in `assets/img/`: `logo.svg` (mark + wordmark), `logo-mark.svg` (mark only), and
`logo-reversed.svg` / `logo-mark-reversed.svg` for dark backgrounds. `favicon.svg` switches to
the reversed colours in dark mode. `apple-touch-icon.png` (180px) is the iPhone home-screen icon,
and `avatar-light.png` / `avatar-dark.png` (800px) are profile pictures for social accounts. In the site header and footer the mark is inline SVG
(`.brand__mark`), coloured by `currentColor` and `--signal` so it follows the theme.

## Theme switching

The toggle in the header writes to `localStorage` under `veyon-theme`. Until a visitor picks a
theme the site follows their OS setting. An inline script in each page's `<head>` applies the
theme before first paint, so there is no flash of the wrong palette — keep it there if you edit
the pages.

## Before you go live

- [ ] Replace `hello@veyonlabs.com` throughout (footer, contact strip and `contact.html`).
      The phone number is already set to `+91 98249 98870`.
- [ ] Point the contact form at a real endpoint (above).
- [ ] **Finish the Onehostbox copy.** The page states what is known: it is an AI code and hosting
      platform working directly from Git, live since 2026, at onehostbox.com. Two placeholders remain
      on `onehostbox.html` — the audience paragraph and the capability list. They render as dashed red
      boxes; `grep -rn "todo" *.html` lists them.
- [ ] Add real client case studies to `work.html` (and a "Selected work" section on the home
      page) once they're ready. The placeholder case studies and testimonials have been removed.
- [ ] Swap `https://veyonlabs.com` in each page's `<link rel="canonical">`, the Open Graph
      tags, `robots.txt` and `sitemap.xml` if the domain differs.
- [ ] Add an Open Graph share image (1200×630) and reference it with
      `<meta property="og:image" content="...">`.
- [ ] Update the social links in the footer.

## Deploying

Any static host works. The folder is the site root.

- **Netlify / Vercel / Cloudflare Pages** — drag the folder into the dashboard, or connect the
  repo with no build command and the project root as the publish directory.
- **GitHub Pages** — push to a repo and enable Pages on the branch root.
- **Any web server** — copy the folder into the document root.

`404.html` is picked up automatically by Netlify, Cloudflare Pages and GitHub Pages. On Vercel,
add `{ "cleanUrls": true }` to `vercel.json` if you want extensionless URLs.
