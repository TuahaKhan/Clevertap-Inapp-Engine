/* =============================================================================
 * CleverTap bridge helper — copy INLINE into the single campaign HTML file.
 * Mobile In-App variant only. It is guarded and never throws.
 *
 * Set event NAMES to the strings the user gave you. Do NOT invent names — if the
 * brief didn't specify them, ask first (see references/clarifying-questions.md).
 * ============================================================================= */


/* ----------------------------------------------------------------------------
 * VARIANT A — MOBILE IN-APP (Android / iOS WebView)
 * -------------------------------------------------------------------------- */

// Event names + properties come from the user. Placeholders shown — replace them.
var EVT_VIEWED = 'TODO_EVENT_VIEWED';   // e.g. fired on load (impression)
var EVT_CLICKED = 'TODO_EVENT_CLICKED'; // e.g. fired on CTA / claim

function isIOS() { return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream; }

// Raise an event. Android needs a STRING; iOS needs an object.
// Returns after the first matching native surface so a hybrid WebView doesn't double-fire.
function trackEvent(name, props) {
  props = props || {};
  try { if (window.CleverTap && typeof window.CleverTap.pushEvent === 'function') {
    window.CleverTap.pushEvent(name, JSON.stringify(props)); return; } } catch (e) {}
  try { if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.clevertap) {
    window.webkit.messageHandlers.clevertap.postMessage({ action:'recordEventWithProps', event:name, properties:props }); return; } } catch (e) {}
  try { if (typeof clevertap !== 'undefined' && clevertap.event) { clevertap.event.push(name, props); } } catch (e) {}
}

// CTA click that should also update campaign click-stats (raises Notification Clicked)
// and optionally close / open a URL. actionObj examples in references/functions.md.
function triggerAction(actionObj, callToAction, buttonId) {
  try { if (window.CleverTap && typeof window.CleverTap.triggerInAppAction === 'function') {
    window.CleverTap.triggerInAppAction(JSON.stringify(actionObj), callToAction, buttonId); return; } } catch (e) {}
  try { if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.clevertap) {
    window.webkit.messageHandlers.clevertap.postMessage({ action:'triggerInAppAction', actionJson:actionObj, callToAction:callToAction, buttonId:buttonId }); } } catch (e) {}
}

// Close: SDK dismiss on both platforms, THEN a wzrk:// fallback only if no native
// bridge was detected (avoids redundant dismiss / iOS unsupported-scheme alert).
function dismissCampaign() {
  var bridge = false;
  try { if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.clevertap) {
    window.webkit.messageHandlers.clevertap.postMessage({ action:'dismissInAppNotification' }); bridge = true; } } catch (e) {}
  try { if (window.CleverTap && typeof window.CleverTap.dismissInAppNotification === 'function') {
    window.CleverTap.dismissInAppNotification(); bridge = true; } } catch (e) {}
  var ov = document.getElementById('overlay'); if (ov) ov.style.display = 'none';
  if (!bridge) setTimeout(function () { try { window.location.href = 'wzrk://dismiss'; } catch (e) {} }, 100);
}

// Example:
//   trackEvent(EVT_VIEWED, { template:'Scratch Card' });            // on load
//   trackEvent(EVT_CLICKED, { prize:'WIN25OFF' }); dismissCampaign(); // on claim
