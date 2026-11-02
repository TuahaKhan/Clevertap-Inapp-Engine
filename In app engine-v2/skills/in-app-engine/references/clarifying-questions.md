# Clarifying Questions — Ask Before Building

CleverTap campaigns break quietly when details are invented. The default posture is:
**gather the must-haves first, in one batched round, then build.** Don't drip questions,
and don't ask about things the brief already answered or that have safe cosmetic defaults.

## Must-ask (never invent)

| Item | Why it can't be guessed |
|---|---|
| **Layout** — In-App: Cover / Half-Interstitial / Interstitial / Header / Footer | Each needs different outer HTML; wrong layout renders broken. |
| **Event names** (exact strings) | They appear verbatim in dashboard funnels and usually follow a house convention (`Pack Opened` vs `pack_opened`). A made-up name pollutes analytics. |
| **Event triggers** (which actions fire which events) | Silently deciding "I'll track a click" may double-count or miss the action they cared about. |
| **Event properties** | Which fields matter (coupon, prize, variant, product id, rarity, score). |
| **CTA behaviour + destination** | Close? Open URL (which)? Deep-link? KV to app? Determines `triggerInAppAction` vs simple dismiss. |

## May default (state the assumption; keep editable)

Copy text, colours, fonts, the coupon placeholder value, animation flavour, and
backdrop style are cosmetic. Pick sensible defaults, put them in the config block at the
top, and tell the user: "I assumed X — say the word and I'll change it." Default the
in-app backdrop to **transparent** (card floats over the live app); offer a dim/blur on request.

## Skip asking when…

- The brief already specifies the item. Example: a prompt that says fire `Mystery_Box_Viewed`
  on load, `Mystery_Box_Opened` on tap, `Mystery_Box_Claimed` on claim has given you both the
  event names and the triggers — build, don't re-ask.
- The user says "just build it" / "use placeholders." Then proceed, but mark every invented
  value with `TODO:` and list all assumptions at the top of the file so nothing is hidden.
  Use obvious placeholder event names like `TODO_EVENT_VIEWED` so they can't slip into production.

## How to ask (templates)

Keep it to one message. Prefer tappable options on mobile.

**Thin brief — "make me a CleverTap in-app for our sale":**
> A few quick things so I wire it correctly:
> 1. Layout — Cover, Half-Interstitial, Interstitial, Header, or Footer?
> 2. What should the events be called, and when should they fire? (e.g. an impression on load, a click on the CTA.)
> 3. Any properties to send with them (coupon code, product, variant)?
> 4. What does the main button do — close, or open a URL/deep link?

**Medium brief — type known, events not:**
> Got it — a scratch-card in-app. Two things before I build:
> 1. What should the reveal and claim events be named (your convention), and do you want an impression event on load too?
> 2. On "Claim", should it close the in-app or open a URL/deep link?

**Existing HTML to fix:**
> Before I change the tracking — what are the exact event names you use, and on which actions should each fire? I don't want to rename anything you're already reporting on.

## Guardrail

If you catch yourself picking an event name, a trigger point, or a CTA destination because
the brief didn't say — stop and ask instead. That decision belongs to the user, not the
template.
