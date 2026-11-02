# Custom HTML Layouts (Mobile In-App) — Reference

CleverTap's Custom HTML In-App editor offers **five layouts**. Each renders the HTML in a
differently sized/positioned WebView, so the outer HTML/CSS must match the chosen layout —
the same HTML in the wrong layout looks broken. **Confirm the layout before generating code**
(see `clarifying-questions.md`). Default guess is Interstitial, but confirm.

## The five layouts

| Layout | What it is | Use for |
|---|---|---|
| **Cover** | Full-screen takeover, edge-to-edge | launches, big reveals, immersive promos, story ads |
| **Half-Interstitial** | Bottom half; top half stays transparent (live app visible) | promotions that don't fully interrupt |
| **Interstitial** | Centered modal card with margins; backdrop transparent or dimmed | alerts, confirmations, reward reveals, most modals |
| **Header** | Top banner; rest of screen transparent + interactive | non-intrusive announcements, tips |
| **Footer** | Bottom banner; rest of screen transparent + interactive | CTA bars, "swipe up to claim", reminders |

If the user is unsure, ask one question: *"Should the user keep using the app while this shows,
or should it block the full screen?"* Keep-using → Header / Footer / Half-Interstitial.
Block → Cover / Interstitial.

## CSS structure per layout

All set `html, body { background: transparent !important; }` — CleverTap's container can inject
its own body styles, and `!important` keeps the backdrop from showing through.

### Cover (full-screen)
```css
html,body{width:100%;height:100%;margin:0;padding:0;background:transparent!important}
.cover{position:fixed;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;
  padding-top:env(safe-area-inset-top,24px);padding-bottom:env(safe-area-inset-bottom,24px)}
```
Hero image as background → `object-fit:cover`. Reserve notch/home-indicator safe areas.

### Half-Interstitial (bottom half)
```css
html,body{background:transparent!important}
.overlay{position:fixed;inset:0;display:flex;align-items:flex-end;justify-content:center}
.half{width:100%;height:50vh;background:#fff;border-radius:20px 20px 0 0;padding:24px;
  animation:slideUpHalf .4s ease-out}
@keyframes slideUpHalf{from{transform:translateY(100%)}to{transform:translateY(0)}}
```
Keep the **top half transparent** so the live app shows through (the whole point vs Cover).
Optional swipe "grabber": a 36×4px rounded bar at the top.

### Interstitial (centered modal) — default
```css
html,body{background:transparent!important}
.overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
  background:transparent} /* or rgba(0,0,0,.5) for a dim backdrop — ask first */
.card{width:min(320px,90vw);background:#fff;border-radius:16px;padding:32px 24px 24px;
  box-shadow:0 20px 60px rgba(0,0,0,.3)}
```

### Header (top banner)
```css
html,body{background:transparent!important;margin:0;padding:0}
.header-banner{position:fixed;top:0;left:0;right:0;background:#fff;padding:14px 16px;
  padding-top:calc(14px + env(safe-area-inset-top,0px));display:flex;align-items:center;gap:12px;
  box-shadow:0 4px 12px rgba(0,0,0,.1);animation:slideDown .4s ease-out}
@keyframes slideDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}
```
Compact (≤80px). Always include a close button — the rest of the screen is interactive.

### Footer (bottom banner)
```css
html,body{background:transparent!important;margin:0;padding:0}
.footer-banner{position:fixed;bottom:0;left:0;right:0;background:#fff;padding:14px 16px;
  padding-bottom:calc(14px + env(safe-area-inset-bottom,0px));display:flex;align-items:center;gap:12px;
  box-shadow:0 -4px 12px rgba(0,0,0,.1);animation:slideUpFooter .4s ease-out}
@keyframes slideUpFooter{from{transform:translateY(100%)}to{transform:translateY(0)}}
```

## Gotchas
- **Header/Footer must NOT use a full-screen `inset:0` backdrop** — it would swallow taps meant
  for the live app. Only the banner should receive touch.
- **Cover/Interstitial**: dim backdrop is optional (user can't touch the app behind anyway).
  Default transparent; opt into dim.
- **Safe areas**: Cover/Header/Footer touch device edges — always use `env(safe-area-inset-*)`.
- **Match animation to anchor**: Header slides down, Footer/Half slide up, Cover/Interstitial
  fade/scale from center. A header that slides up from the bottom feels wrong.
