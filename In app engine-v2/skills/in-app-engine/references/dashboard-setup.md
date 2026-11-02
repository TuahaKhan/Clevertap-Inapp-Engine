# CleverTap Dashboard Setup & Operational Gotchas

A custom HTML campaign does nothing on autopilot. These dashboard settings, if wrong,
make it misbehave silently. Always deliver code with the relevant notes from here.

## Required: use the Custom HTML template
Campaigns → Create → In-App Notification → **Custom HTML**.
Not the standard title/body/CTA editor — that won't accept arbitrary HTML.

## Required: Enable JavaScript
There's an **"Enable JavaScript"** checkbox when creating the campaign. If unchecked, the
`<script>` block never runs — **no events, no close handler (X does nothing), no animation.**
Requires SDK ≥ 3.5.0 on Android and iOS. *If the user says "nothing happens when I tap anything," check this first.*

## Recommended: avoid click double-counting
CleverTap can auto-raise `Notification Clicked` on any tap ("Enable click tracking for Custom HTML").
If your JS already fires clicks (everything this skill produces does), **uncheck it** to avoid
double-counting.

## SDK version floors
- JavaScript-enabled in-apps: Android & iOS SDK ≥ 3.5.0
- `dismissInAppNotification` action: iOS SDK ≥ 3.7.2 (older iOS/Android → `wzrk://` fallback)
- `triggerInAppAction` API: Android SDK ≥ 5.2.0
- Native Custom Code templates: relevant SDK ≥ 7.0.0 (separate system — not this skill)

Users on older app versions silently don't get the campaign or get a degraded version; the
dashboard does not warn about this.

## Splash-screen exclusion (Android)
If the in-app triggers on App Launched and the app has a splash screen, it can render on the
splash and vanish when the splash ends ("flashes briefly and disappears"). Fix is in the
manifest, not the HTML:
```xml
<meta-data android:name="CLEVERTAP_INAPP_EXCLUDE"
           android:value="YourSplashActivity1,YourSplashActivity2" />
```

## "Test In-App" 4 KB limit
The Test In-App feature sends the campaign as an FCM push (4 KB payload cap). Large HTML
(inline SVG, base64 images, big fonts) can fail the test send while the **live** campaign
still works (live doesn't use push). If the user says "I can't test it but it may be live," check HTML size.

## Assets & fonts
- HTTPS only (mixed content is blocked in the WebView).
- Google Fonts is flaky on older Android WebView builds — keep a system-font fallback
  (`-apple-system`, `Roboto`, `Arial`) or self-host on a CDN.
- Heavy images delay first paint; prefer SVG or small WebP/PNG.

## Delivery Preferences / spam control
Per-campaign Delivery Preferences control frequency (once per session/day/no limit) and
re-appearance after dismissal. If the user says "I only see it once," check this. Web SDK
≥ 2.0.0 defaults `dismissSpamControl` to true (once-dismissed won't re-show that session).
