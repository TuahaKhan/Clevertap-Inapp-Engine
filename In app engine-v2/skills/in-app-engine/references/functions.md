# CleverTap Function Reference (custom HTML campaigns)

Custom HTML Mobile In-App/WebView surfaces only — NOT native Custom Code templates.
**The API differs per platform and is not interchangeable.** Android = direct calls on
`window.CleverTap` with **stringified** args; iOS = `postMessage` actions with **object**
args. A Web SDK call inside an Android in-app silently does nothing.

## Official sources (fetch when unsure — don't guess)
- Android: https://github.com/CleverTap/clevertap-android-sdk/blob/master/docs/InAppNotificationsJavascriptInterface.md
- Android (dev docs): https://developer.clevertap.com/docs/android-in-app-notifications#javascript-support-in-in-app-notifications
- iOS: https://developer.clevertap.com/docs/in-app-notification-ios#javascript-support-in-in-app-notifications

## Methods that DO NOT exist — never emit these
`CleverTap.dismissInApp()` · `CleverTap.close()` · `CleverTap.recordEvent(name,obj)` ·
`clevertap.dismiss()` · `clevertap.closeInApp()` · `window.clevertap.hide()`.
They look plausible and fail silently. If tempted because the user "expects" it, look it up.

## Environment detection
```js
var isAndroid = !!(window.CleverTap && typeof window.CleverTap.pushEvent === 'function');
var isIOS     = !!(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.clevertap);
var isWeb     = !isAndroid && !isIOS && typeof clevertap !== 'undefined';
// iOS also injects window.cleverTapIOSSDKVersion (string) for version-aware logic.
```

## 1. Record events
- **Android:** `CleverTap.pushEvent(name, JSON.stringify(props))` — props MUST be a string.
- **iOS:** `webkit.messageHandlers.clevertap.postMessage({action:'recordEventWithProps', event:name, properties:props})` — object.
- **Web fallback:** `clevertap.event.push(name, props)` — object.

Use the universal `trackEvent()` helper (returns after the first matching surface) from `assets/ct-bridge.js`.

## 2. Dismiss the in-app
- **Android:** `CleverTap.dismissInAppNotification()`
- **iOS:** `postMessage({action:'dismissInAppNotification'})`
- **Old Android / no bridge fallback:** navigate to `wzrk://dismiss` (any `wzrk://` host; scheme is the signal). Fire this **only if no native bridge was detected** — see `mobile-inapp.md` for the gated handler and why.

## 3. triggerInAppAction — CTA click + action (mobile)
Raises **Notification Clicked** AND performs an action (close / open-url / KV / custom-code).
Use on CTA taps so campaign click-stats update.
- **Android:** `CleverTap.triggerInAppAction(JSON.stringify(actionJson), callToAction, buttonId)`
- **iOS:** `postMessage({action:'triggerInAppAction', actionJson:{...}, callToAction:'Buy Now', buttonId:'btn_cta'})`

`actionJson` shape is shared, but the open-url field name differs — set both when unsure:

| Action | Shape | Android URL field | iOS URL field |
|---|---|---|---|
| Close | `{type:'close'}` | — | — |
| Open URL | `{type:'open-url'/'url', ...}` | `android:'https://…'` | `ios:'https://…'` |
| Key-Value | `{type:'kv', kv:{…}}` | same | same |
| Custom code | `{type:'custom-code', templateName, vars}` | same | same |

Example actionJson with KV: `{ "actions": { "kv": { "Reward":"Legendary" } } }`.

## 4. Profile / login / charged / multi-value (mobile)
| Operation | Android (`window.CleverTap.*`) | iOS (`postMessage({action:…})`) |
|---|---|---|
| Update profile | `pushProfile(JSON.stringify(props))` | `profilePush` (properties:obj) |
| User login | `onUserLogin(JSON.stringify(props))` | `onUserLogin` (properties:obj) |
| Charged event | `pushChargedEvent(JSON.stringify(details), JSON.stringify(items))` | `recordChargedEvent` (chargeDetails, items) |
| Set multi-value | `setMultiValueForKey(key, JSON.stringify(arr))` | `profileSetMultiValues` (values, key) |
| Add multi-value | `addMultiValueForKey(key, value)` / `addMultiValuesForKey` | `profileAddMultiValue` / `profileAddMultiValues` |
| Remove multi-value | `removeMultiValueForKey` / `removeMultiValuesForKey` | `profileRemoveMultiValue` / `profileRemoveMultiValues` |
| Increment / decrement | `incrementValue(key,n)` / `decrementValue(key,n)` | `profileIncrementValueBy` / `profileDecrementValueBy` (value,key) |
| Remove key | `removeValueForKey(key)` | `profileRemoveValueForKey` |
| Prompt push permission | `promptPushPermission(true)` | `promptForPushPermission` (showFallbackSettings:bool) |
| SDK version | `getSdkVersion()` | `window.cleverTapIOSSDKVersion` |


## 5. Web SDK (fallback only)
```js
clevertap.privacy.push({ optOut:false });
clevertap.init('ACCOUNT_ID', 'region');   // region: 'global','eu1','in1','sg1','us1', …
clevertap.setLogLevel(3);
clevertap.event.push(name, props);
```
SDK script seen in templates: `https://d2r1yp2w7bby2u.cloudfront.net/js/clevertap.min.js`.

## Key reminders
- Android args stringified, iOS args objects — easiest source of subtle bugs.
- Always guard + `try/catch`; never blindly call all platforms (stray console errors pollute debugging).
