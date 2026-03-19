# ShAudio

**Signal:** piOS soundscape (opt-in system audio events)
**Layer:** JS utility only (no CSS, no Preact component)
**Palette:** n/a (audio)

## API

```js
import { playSfx, ShAudio } from "superhot-ui";

// Enable (default: disabled)
ShAudio.enabled = true;

// Play a sound
playSfx("complete"); // ascending two-tone — job finished
playSfx("error"); // descending buzz — job failed / DLQ
playSfx("dlq"); // single low tone — DLQ entry added
playSfx("pause"); // soft click — daemon paused/resumed
playSfx("boot"); // ascending beep — system initialization
playSfx("static"); // noise burst — signal degradation
playSfx("warning"); // double-pulse — threshold approaching danger
playSfx("recovery"); // descending chime — system restored
```

## Sound Design

All sounds generated procedurally via Web Audio API. No audio files required.

| Type       | Frequencies   | Duration      | Character                          |
| ---------- | ------------- | ------------- | ---------------------------------- |
| `complete` | 440Hz + 880Hz | 150ms + 150ms | Ascending two-tone, phosphor       |
| `error`    | 220Hz + 110Hz | 200ms + 200ms | Descending with distortion, threat |
| `dlq`      | 110Hz         | 300ms         | Single low tone, ominous           |
| `pause`    | 880Hz         | 50ms          | Short click, neutral               |
| `boot`     | 200Hz → 600Hz | 200ms         | Ascending two-tone POST beep       |
| `static`   | White noise   | 150ms         | Bandpass-filtered noise burst      |
| `warning`  | 440Hz         | 150ms         | Double-pulse square wave           |
| `recovery` | 800Hz → 400Hz | 250ms         | Descending chime, inverse of error |

## Accessibility

- Respects `prefers-reduced-motion: reduce` — silent when set
- Only plays when `ShAudio.enabled = true` (never plays by default)
- User must explicitly enable via settings toggle
- No looping audio — all sounds are one-shot

## Wiring Pattern

```js
// In your app's store or event handler
import { playSfx, ShAudio } from "superhot-ui";

// Load preference on startup
ShAudio.enabled = localStorage.getItem("sfx-enabled") === "true";

// Play on events
function onJobComplete(job) {
  playSfx("complete");
  // ...
}

function onJobFailed(job) {
  playSfx("error");
  // ...
}
```

## Gotchas

- Web Audio context requires user interaction before playing (browser autoplay policy). First `playSfx()` call after page load may be silenced. Subsequent calls work. This is a browser constraint, not a bug.
- `ShAudio.enabled` is a module-level property — set it once at app init, not per-call
- Do not play `error` + `dlq` simultaneously for the same event — pick the most specific one
