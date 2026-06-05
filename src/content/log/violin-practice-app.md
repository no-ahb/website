---
title: "Violin Practice"
subtitle: "A no-framework, offline-first PWA"
summary: "A daily-practice web app I designed from an 846-line spec and now use every day: vanilla JS, Web Audio, IndexedDB, offline-first — no framework, no backend, no build step."
updated: "May 2026"
categories: ["Patches & UI"]
sortOrder: 10
tags: ["software", "web-audio", "pwa"]
stack: ["Vanilla JS", "Web Audio API", "IndexedDB", "Service Worker", "VexFlow", "MediaRecorder"]
repo: "https://github.com/no-ahb/violin-practice"
demo: "https://no-ahb.github.io/violin-practice/"
thumb: "/images/log/violin-practice-app/scales-ready.png"
draft: false
---

I practice violin 45 minutes a day, five days a week, on a fixed rotation: scales, modal work, a Bach Adagio, a Fuga, free improv. The structure is rigid enough to be a program, so I wrote one to run me through it. It replaced the pile of tuners, metronomes, and notebooks I used to keep on the stand. It runs on my phone, sits on a music stand, works offline, and drives the whole schedule. This is a record of the engineering decisions.

## Decisions

There is no framework. Each screen is a function that builds its own DOM through a small `el()` helper. Navigation is a function call: invoking the next screen clears the single `#app` container and mounts what the function returns. No routes, no history, no virtual DOM. For a single-user tool with about fifteen screens, a diffing layer would have been more code to ship and cache, not less.

The only third-party dependency is [VexFlow](https://github.com/0xfe/vexflow), for notation, and it is also the only heavy thing in the payload. The CDN build of VexFlow 4.2.3 is close to a megabyte raw (about 970 KiB) and roughly 250 KB once the CDN serves it with Brotli, around 300 KB with gzip, because it [bundles three music-engraving fonts](https://github.com/0xfe/vexflow/wiki/VexFlow-4-Tutorial) (Bravura, Petaluma, Gonville). My own HTML, CSS, and JavaScript come to a small fraction of that, well under 30 KB gzipped. The [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) caches VexFlow on the first load, so every load after that is fully offline and fetches nothing.

The drone is synthesized, not sampled. Retuning to a new tonic is then a frequency calculation rather than a new file to load, and nothing is pitch-shifted. Pitch-shifting a sample smears the tuning; generating the tone from exact frequencies keeps every partial where it belongs. It runs as live [Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) oscillators. Each timbre is a short additive recipe: one or more strings, each a stack of harmonic partials, with per-partial amplitudes for colour. Tanpura and pad add strings at the [just](https://en.wikipedia.org/wiki/Just_intonation) fifth (3/2) and the octave, in the Sa-Pa-Sa-Sa' layout of a real tanpura; shruti and sine are a single fundamental. Shruti is built on a sawtooth, the others on sine partials. Tanpura also gets a slow plucked envelope, its strings staggered so they cascade the way a thumb dragged across the courses does.

The harmonic, just-tuned drone is there for one job: intonation. Its partials sit at integer ratios, so when a played note lands in a simple ratio against it the partials align and the beating stops. That is the whole feedback loop. You tune each note until the beats die.

```js
// Live additive drone for one tonic. Four "strings" tuned Sa-Pa-Sa-Sa'
// (1, 3/2, 2, 2), each a stack of harmonic partials. (condensed)
const bodies = [[f, 1.0], [f * 1.5, 0.7], [f * 2, 0.7], [f * 2, 0.5]]; // 3/2 = just fifth
const ji = [1, 2, 3, 4, 5, 6, 7, 8];                                   // harmonic partials
bodies.forEach(([freq, g0]) => {
  const bus = ctx.createGain();              // one envelope per string (tanpura: slow pluck)
  ji.forEach((r, i) => {
    const osc = ctx.createOscillator();
    osc.frequency.value = freq * r;          // integer multiples -> just intonation
    osc.connect(gainFor(amps[i])).connect(bus);
    osc.start();
  });
});
```

The metronome does not tick on a timer. A timer would drift: `setInterval` and `setTimeout` are best-effort, and on a busy main thread they wander by tens of milliseconds, which you hear as a wobble over a twelve-minute block. Instead a `setTimeout` loop wakes about every 40 ms and does one thing: schedule any clicks due in the next slice at exact `AudioContext` timestamps. The audio clock decides when each click sounds, so jitter in the wake-up never reaches the beat. This is the standard [look-ahead scheduler](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques).

State lives in [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) behind a small `openDB()` / `tx()` helper, in five object stores: settings, sessions, recordings, per-piece chunk notes, and improv patches. Recordings are stored as audio Blobs in the same database, so a take and its annotations travel together and stay on the device.

```js
db.createObjectStore('kv');                          // settings (tempo per key, prefs)
db.createObjectStore('sessions',   { keyPath: 'id' });
db.createObjectStore('recordings', { keyPath: 'id' });
db.createObjectStore('chunks',     { keyPath: 'id' }); // mastery notes per Bach chunk
db.createObjectStore('patches',    { keyPath: 'id', autoIncrement: true });
```

<div class="phone-row">
  <figure>
    <img src="/images/log/violin-practice-app/scales-ready.png" alt="The scales screen: G minor, drone tuned to D and on, metronome off, 60 BPM, bowing slurred-4." loading="lazy" decoding="async" />
    <figcaption>The scales block, ready to start — the app sets the week's key, tunes the just-intonation drone to the day's reference pitch, picks the bowing, and runs the metronome. You play.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/violin-practice-app/scales-step.png" alt="Mid-block: broken thirds, two octaves, with a target time counting down." loading="lazy" decoding="async" />
    <figcaption>Mid-block, step 2 of 5. The suggested durations are guides — you advance manually, so a passage never gets cut off by a timer.</figcaption>
  </figure>
</div>

## Build

Each block is a short sequence of steps, and each block screen owns its own sequence. You move forward with a Next tap. A per-step clock counts up and shows elapsed time against a suggested target, then flips to a reached state once you pass it. It never advances on its own. The durations are guides, so a passage that needs another minute gets it, and a long arpeggio is never cut off mid-run. Notation is drawn per step with VexFlow, and the drone retunes on screen entry, so what you hear matches the label the instant the screen appears.

The chord-scale block had to sound like comping, not like a chord-symbol reader. When the loop moves to the next chord, its notes are placed by a greedy voice-leading pass: each new pitch goes to the octave nearest an unused voice from the previous chord, so common tones hold and everything else moves by the smallest interval. A walking bass runs underneath, root then fifth then root then a half-step approach to the next root, taking whichever side is closer. A kick-and-snare groove keeps time so the block does not also need the metronome. The kick is the click.

Recording uses [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder). Safari and Chromium disagree on formats, so the app decides at runtime. It prefers `audio/mp4` (AAC) where supported, which is what Safari records and, as much to the point, what Safari can play back, since Safari still will not decode Opus. On Chromium it falls back to WebM/Opus. Each take is a Blob with timestamped notes you can drop on the waveform during playback.

One iOS wrinkle took a while to pin down. The moment `getUserMedia` opens the microphone, iOS hands Web Audio to its voice path, and the drone collapses into the earpiece at call volume mid-take. The [Audio Session API](https://developer.mozilla.org/en-US/docs/Web/API/AudioSession) (iOS 16.4+) is the control surface for this. I set `navigator.audioSession.type` to `play-and-record` before the mic opens and back to `playback` after, which tells the system the page plays and captures at once and to use a recording-aware routing policy rather than the default duck. Which output it then picks is iOS-version-dependent, so I treat this as making the behaviour deliberate, not as a guarantee.

## The screens

Each block gets its own screen and a shifting accent colour, so a glance tells you where you are in the session: scales, a mode to study, a chord-scale vamp to improvise over, the Adagio and Fuga, free improv, then a wrap-up. The ink flips to near-black or off-white depending on the ground's luminance, so text stays legible on every colour. Any block can record to disk, and the wrap-up logs how the session went into the streak and the per-scale history.

<div class="log-gallery">
  <figure>
    <img src="/images/log/violin-practice-app/modal.png" alt="The modal block: D phrygian, its mode notes, characteristic tone, implied chord, and a one-line description." loading="lazy" decoding="async" />
    <figcaption>Modes — the mode's notes, its characteristic tone, the chord it implies, and a one-line use. (D phrygian.)</figcaption>
  </figure>
  <figure>
    <img src="/images/log/violin-practice-app/chord-scale.png" alt="The chord-scale block: a looping Gm7-flat-9 modal vamp with bars-per-chord pacing and the chord tones." loading="lazy" decoding="async" />
    <figcaption>Chord-scale — a looping modal vamp (Gm7♭9) to improvise over, with bars-per-chord pacing.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/violin-practice-app/improv.png" alt="The improv block: a single rotating constraint — 'one pitch only, 15 min (Lucier-style)' — over a 15-minute timer, with a Rotate constraint button." loading="lazy" decoding="async" />
    <figcaption>Improv — a rotating compositional constraint to play against (here, one pitch only, Lucier-style).</figcaption>
  </figure>
  <figure>
    <img src="/images/log/violin-practice-app/recording.png" alt="A practice screen mid-recording, the Record button now a red Stop with a running timer." loading="lazy" decoding="async" />
    <figcaption>Recording — any block captures to disk with one tap, stored locally against the screen you were on.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/violin-practice-app/wrap-up.png" alt="The session wrap-up: feeling and focus rated one to five, a notes field, worked/didn't/neutral tags, and Save." loading="lazy" decoding="async" />
    <figcaption>The wrap-up check-in — rate feeling and focus, tag it, note what to chase next, then save.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/violin-practice-app/history.png" alt="The history screen: 10 sessions, a 10-day streak, a feeling chart, and a dated list of past sessions." loading="lazy" decoding="async" />
    <figcaption>Practice tracking — every session, the streak, and a feeling chart; the per-scale "last time" hints read from here.</figcaption>
  </figure>
</div>

## Result

A working, installed PWA I use every day. The home screen carries a countdown to the next performance and a two-week practice heatmap. It runs offline, keeps months of sessions and recordings on the device, and synthesizes all of its audio in the browser.
