# Mobile In-App (Android/iOS WebView) — Deep Dive

For any custom-HTML **In-App** build. The HTML renders in a WebView **above the native
layer**, so it must survive every screen size and notch. Confirm which of the five layouts
first — see `layout-types.md`.

## Dismissal — gated `wzrk://` fallback

Fire the SDK dismiss on both platforms, then the `wzrk://` fallback **only if no native
bridge was detected**. Firing `wzrk://` unconditionally can cause a redundant dismiss or an
iOS "unsupported URL scheme" alert when the bridge already handled it.

```js
function dismissCampaign() {
  var bridge = false;
  try { if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.clevertap) {
    window.webkit.messageHandlers.clevertap.postMessage({ action:'dismissInAppNotification' }); bridge = true; } } catch(e){}
  try { if (window.CleverTap && typeof window.CleverTap.dismissInAppNotification === 'function') {
    window.CleverTap.dismissInAppNotification(); bridge = true; } } catch(e){}
  // visual hide so the user always sees it close, regardless of what happens behind the scenes
  var ov = document.getElementById('overlay'); if (ov) ov.style.display = 'none';
  // legacy fallback: only when no modern bridge matched (old Android SDK)
  if (!bridge) setTimeout(function(){ try { window.location.href = 'wzrk://dismiss'; } catch(e){} }, 100);
}
```
Note: the team's older templates fire `wzrk://exit` unconditionally and it works in practice;
the gated version above is the safer default for new code. Either is acceptable once tested on
a real iOS device. Close button, Escape key, and any auto-dismiss should all route here.

## Event tracking (return after first matching surface)
```js
function trackEvent(name, props) {
  props = props || {};
  try { if (window.CleverTap && typeof window.CleverTap.pushEvent === 'function') {
    window.CleverTap.pushEvent(name, JSON.stringify(props)); return; } } catch(e){}   // Android: STRING
  try { if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.clevertap) {
    window.webkit.messageHandlers.clevertap.postMessage({ action:'recordEventWithProps', event:name, properties:props }); return; } } catch(e){} // iOS: object
  try { if (typeof clevertap !== 'undefined' && clevertap.event) { clevertap.event.push(name, props); } } catch(e){} // web fallback
}
```
For CTA taps that should update campaign click-stats, prefer `triggerInAppAction` (see `functions.md`).

## CTA / reward flow (proven pattern)
user action → reveal outcome → `trackEvent(<confirmed name>, {props})` → accept/CTA → `dismissCampaign()`.
For spin wheel / scratch card / memory game, defer the event+dismiss to a `setTimeout` after the
reveal animation so the user sees the result. (Confirm event names + triggers first — don't invent.)

## Layout & responsiveness
- Pick the structure from `layout-types.md` for the chosen layout (Cover/Half/Interstitial/Header/Footer).
- Fluid units: `clamp()`, `%`, `min()`. Be cautious with `vh`/`vw` — the viewport is the WebView,
  not the device; `width:min(320px,90vw)` is a safe modal width.
- Safe areas: `env(safe-area-inset-*)` for notch/home indicator on Cover/Header/Footer.
- Close button top-right, ≥36px (ideally 44px) tap target.
- High z-index overlay (e.g. `2147483000`) so nothing native bleeds through.

## WebView constraints — avoid
- **No external `<script src>`** — sandboxed WebViews may not load them. Inline everything.
- **No `<form>`** — submissions get intercepted unpredictably; use buttons + click handlers.
- **No `localStorage`/`sessionStorage`** — inconsistent across SDK versions; pass state via event props.
- **No heavy frameworks** (React/Vue) — bundle size hurts the 4 KB test push and first paint.
- `backdrop-filter: blur()` works on iOS but is hit-or-miss on older Android WebView — provide a
  solid/gradient fallback. `position: sticky` is also flaky in WebView.

## Assets & performance
- Compressed / CDN images (HTTPS only); avoid giant base64 blobs (bloats payload, risks 4 KB test cap).
- CSS transforms/opacity for animation; avoid long JS animation loops on low-end Android.
- Google Fonts flaky on old Android WebView — keep a system-font fallback.

## iOS specifics
- Detect: `/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream`.
- Add Safari fixes where needed (`-webkit-` prefixes, `!important` on gradients/backgrounds).

## Don't
- Don't pass a raw object to Android `pushEvent`.
- Don't ship a close button with no fallback path.
