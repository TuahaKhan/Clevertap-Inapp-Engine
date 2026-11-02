# Patterns, Common Mistakes, Troubleshooting & Checklist

## Reusable patterns

- **Clarify-first.** If surface, layout, event names, triggers, or CTA destination aren't in
  the brief, ask before building (see `clarifying-questions.md`). Don't invent them.
- **Platform-branching helper** — one function each for events and dismissal, guarded, returning
  after the first matching native surface (Android → iOS). See `assets/ct-bridge.js`.
- **Single close function** — SDK dismiss + gated `wzrk://` for In-App.
- **Event-name + trigger constants** at the top: `var EVT_VIEWED = '<confirmed name>'`.
- **Config-object templates** — keep copy/colours/timing/behaviour in one object so a marketer
  edits only data, never logic. Preferred for anything reused.
- **Reveal-then-track** for interactive types: animate the result, then on accept fire the event
  (with confirmed props) and dismiss, often inside a `setTimeout` after the animation.

### Weighted random selection (reward/gacha/variant drops)
```js
function pickWeighted(pool){              // weights are RELATIVE, not percentages
  var total = pool.reduce(function(s,p){return s+p.weight;},0), r = Math.random()*total;
  for (var i=0;i<pool.length;i++){ if (r<pool[i].weight) return pool[i]; r-=pool[i].weight; }
  return pool[pool.length-1];
}
// [{name:'Common',weight:80},{name:'Rare',weight:15},{name:'Epic',weight:4},{name:'Legendary',weight:1}]
```
For a "no drop" branch, add a `null` item with the remaining weight — don't silently renormalize.
Pickers here are stateless (each draw independent); pity systems need server-side state, not HTML.

### Animation snippets (WebView-safe)
```css
/* card reveal */  @keyframes cardReveal{0%{transform:scale(.3) rotateY(180deg);opacity:0}50%{transform:scale(1.05) rotateY(90deg);opacity:1}100%{transform:none;opacity:1}}
/* shine sweep  */ .shine{position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.5) 50%,transparent 70%);transform:translateX(-100%);animation:shine 2.5s ease-in-out infinite}@keyframes shine{0%{transform:translateX(-100%)}60%,100%{transform:translateX(100%)}}
/* iridescent  */ .legendary{background:linear-gradient(135deg,#ff006e,#fb5607,#ffbe0b,#8338ec,#3a86ff,#ff006e);background-size:300% 300%;animation:irid 4s ease infinite}@keyframes irid{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
```

## Common mistakes (catch every one)
1. **Inventing event names / trigger points / CTA destinations** the brief didn't specify. Ask instead.
2. **Hallucinated APIs** — `recordEvent`, `dismissInApp`, `clevertap.close` (don't exist; fail silently).
4. Passing a **raw object** to Android `pushEvent` instead of `JSON.stringify(props)`.
5. Forgetting the **iOS** branch (`window.webkit.messageHandlers.clevertap`).
6. Close button with **no fallback** path.
7. **Wrong layout** for the surface (Interstitial code in a Header campaign renders broken).
8. **Fixed-pixel** layouts that overflow small screens / sit behind the notch.
9. **Heavy assets / external scripts / `<form>` / `localStorage`** in a sandboxed WebView.
10. **Ungated SDK calls** throwing `ReferenceError`.
11. Confusing **Custom Code** templates (native, `setDismissed`) with **Custom HTML** (WebView).
12. Forgetting the **dashboard notes** (Enable JavaScript, click-tracking double-count).

## "It doesn't work" — diagnose in this order (don't guess, don't argue)
1. **Dismiss/API correct for their platform?** Re-check `functions.md` / `mobile-inapp.md`. If you
   used a method not listed there, you probably invented it.
2. **"Enable JavaScript" checked** in the dashboard? No JS = no close, no events, no animation.
3. **Testing on a real device or just the dashboard preview?** `window.webkit.messageHandlers`
   and the Android bridge only exist in the real SDK runtime.
4. **SDK version?** `dismissInAppNotification` needs iOS ≥ 3.7.2; `triggerInAppAction` Android ≥ 5.2.0.
5. **Console errors?** Safari Web Inspector (iOS), Chrome remote debugging (Android), devtools (web).
6. **"Flashes and disappears"** → splash-screen exclusion (`dashboard-setup.md`).
   **"Can't test but maybe live"** → 4 KB test-push limit. **"Only shows once"** → Delivery Preferences.

## Pre-flight checklist (run before returning code)
- [ ] Asked for / confirmed: layout, event names, triggers, CTA destination.
- [ ] Correct Mobile In-App runtime + layout; no cross-contamination.
- [ ] No invented/hallucinated CleverTap APIs.
- [ ] Every SDK call guarded; tracking wrapped in `try/catch`.
- [ ] Events: Android `JSON.stringify` + iOS object; helper returns after first native match.
- [ ] Working In-App close path (SDK dismiss + gated `wzrk://`).
- [ ] Responsive: `clamp()`/`%`/media queries, safe-area insets, ≥36px close target.
- [ ] Lightweight & self-contained: no external scripts/forms/localStorage/heavy frameworks.
- [ ] Event names in constants; editable content in a config object.
- [ ] Delivered with dashboard setup notes; not claimed as tested until run for real.
