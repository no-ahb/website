---
title: "Suspension"
subtitle: "Firmware for self-oscillating strings"
summary: "Nine piano wires sustained by electromagnetic feedback, each running a Daisy Seed with eight self-tuning mechanisms — built so the installation ran unattended for two months and no knob could break it."
updated: "March 2026"
category: "Hardware & PCBs"
sortOrder: 20
tags: ["hardware", "firmware", "dsp"]
stack: ["Daisy Seed", "DaisyDuino / C++", "real-time DSP", "electromagnetic pickup", "OPA2134 preamp", "electromagnetic driver"]
project: "/works/suspension/"
hero: "/images/suspension/01-hero.jpeg"
thumb: "/images/log/suspension/nine-boards.jpg"
video: "/videos/suspension.mp4"
videoPoster: "/images/suspension/01-hero.jpeg"
draft: false
---

Nine piano wires hang from the ceiling on lead window-sash weights. Nothing plays them — each wire sustains itself, indefinitely, through electromagnetic feedback. My job wasn't to compose what they play; it was to write firmware that keeps nine temperamental feedback loops singing for two months without anyone touching them. It was one of three pieces I showed at the [Haus für Medienkunst](https://hausmedienkunst.de/en/) in Oldenburg, alongside [ANTIPHON](/log/antiphon/) and [FUNDAMENTAL](/works/fundamental/).

## A feedback string is a precarious thing

A pickup senses the wire's motion, a driver pushes it, and if the loop gain is right the string finds a resonance and holds it. Too little gain and it dies; too much and it screams one note forever. And the nine strings aren't identical — different lengths, different pickup-to-driver gaps, different resonant nodes — so the settings that make string 1 sing leave string 2 stone dead.

<figure>
  <img src="/images/log/suspension/measured-strings.jpg" alt="Coils of steel piano wire with galvanized eyebolt terminations and masking-tape labels, on a workbench." loading="lazy" decoding="async" />
  <figcaption>The nine wires, each cut to the length its tuning needs and labelled before hanging.</figcaption>
</figure>

The brief I set myself: run unattended for the full two-month exhibition, ebb and flow on its own, and **never go fully silent for more than ten seconds — at any knob position, on any string.**

## The principle: no knob can break it

The decision that organized everything: *every knob position must produce sound.* Anything that decides "working versus broken" is auto-tuned by the firmware. The five physical knobs only shape character and let me trim each string for its own quirks — they change how it sounds, never whether it sounds.

That principle came from a failure. The previous firmware resonated about 38% of the time on string 1 and was **100% dead on string 2** — its pickup signal was too weak for the feedback loop to bootstrap from silence.

<figure>
  <img src="/images/log/suspension/string-layout-planner.png" alt="A 3D planner showing nine strings positioned in a room, each labeled with its resonant frequency and wire length." loading="lazy" decoding="async" />
  <figcaption>The layout planner: nine wires, each tuned to a sub-50 Hz fundamental, with the wire length each tuning implies. Tuning is <a href="https://en.wikipedia.org/wiki/Just_intonation">just intonation</a> — the outer strings' overtones periodically align with the central string's, so consonance drifts in and out of a diffuse field.</figcaption>
</figure>

The fix is a **rescue watchdog**: when a string goes quiet, the firmware progressively boosts pickup gain (up to 20×), feedback (3×), and driver (5×) over eight seconds — and flattens the spectral shaping so *any* frequency can catch — until the string's own physical noise restarts the loop. Then it backs off. Paired with auto-polarity (flip the driver if it's fighting the string) and six other self-tuning loops, no string can stay dead.

The road there is the useful part, because the dead ends taught the most. I started with [Goertzel](https://en.wikipedia.org/wiki/Goertzel_algorithm) pitch-tracking, abandoned it for a cluster of slowly drifting bandpass filters, added a Gaussian "spectral bump" to bias which partials bloom — and found that high filter-Q was actively *counterproductive* before landing on adaptive rescue. Eight self-adjusting mechanisms survived: rescue, an auto-tracking energy baseline, automatic Q, adaptive drift, gain normalization, the spectral bump, an anti-stagnation "breath," and a post-breath Q boost.

## Build

Each string is a [Daisy Seed](https://electro-smith.com/products/daisy-seed) running the same sketch. The signal chain:

```
PICKUP → pickup gain (+ rescue boost) → HPF 80 Hz → LPF 8 kHz
       → [ SVF_A + SVF_B + SVF_C ]   (three clustered bandpasses, summed)
       → feedback (+ rescue boost) → DC blocker → tanh clip → 0.95 ceiling
       → driver gain (+ rescue boost) → polarity (auto) → DRIVER OUT
```

The three state-variable bandpasses drift independently across 100–400 Hz and sum together, so the resonance wanders instead of locking onto one pitch. Q is fully automatic (1.5–8.0). A DC blocker and a `tanh` soft-clip under a hard 0.95 ceiling keep the driver safe no matter how hard rescue pushes.

### The controller: living on the edge of resonance

Everything in that chain is fixed; what turns it into an instrument rather than an oscillator is the layer watching it. The firmware treats the *string* as the oscillator and itself as a controller with a single job — keep the feedback loop on the edge of resonance, driven hard enough to sing but never so hard it locks one note and screams. It judges that from one number, an energy envelope tapped just after the bandpasses, with no model of the string at all: no target pitch, no tuning table. It watches that energy and steers.

When a resonance catches and the energy climbs, the firmware narrows the filters (Q toward 8) and slows their drift, briefly latching so the partial it just found can settle instead of being dragged off; when the energy falls, it widens them (Q down to 1.5) and speeds the drift back up to go hunting — quick to re-acquire, slow to hold. A soft gain-normalizer leans on the feedback as the loop gets loud relative to the string's own running average, so no single partial can run away, and the Gaussian spectral bump tilts which partials get the most feedback — countering a string's natural habit of pouring energy into its highest harmonics, which is exactly the trap an earlier high-Q version fell into. Because every one of those reactions is measured against a 20-second baseline of the string's *own* level, the identical sketch self-calibrates to nine physically different strings. Left too long on one note, the "breath" fades it out and jumps to a new harmonic so it never stagnates; underneath all of it sits the rescue watchdog, the floor that restarts a string from silence.

### Why there are five knobs

If the firmware decides everything about *whether* a string sounds, why expose any knobs at all? Because nine strings in a room aren't nine identical instruments — each has its own length, its own pickup-to-driver gap, its own most-willing resonances — and the character I want from each one differs even though the firmware keeps them all alive. The knobs are the voicing layer: how hard a string is driven (pickup and driver gain), how dense and insistent its feedback (intensity), which band blooms (brightness, which slides the spectral bump's center between 80 and 300 Hz), and how restlessly the resonance wanders (movement, the drift speed). What they deliberately *can't* touch is whether it sounds at all. That was the inversion that made the piece work: in an earlier version the knobs decided correctness, and one wrong setting left a string dead or squealing a synthetic tone. Once the autonomous floor made failure impossible, the knobs were free to become pure expression — during install I can stand in the room, voice each string by ear, turn anything to any position, and never break it.

### The preamp: a dead-quiet front-end

All of that runs on the Daisy. Getting the signal *into* it cleanly — and back out to the room — is the analog board's job, and it was the hardest part of the hardware. The pickup is an electromagnetic coil — 42 AWG wound to about 550 Ω over a magnet — so it hands the preamp only a few millivolts across a high, inductive source impedance: the front-end has to be high-impedance and genuinely quiet, because that signal is about to be amplified hard and fed into a feedback loop, where any hiss can seed an oscillation that isn't the string. It's built around an [OPA2134](https://www.ti.com/product/OPA2134) JFET-input op-amp on a single +12 V supply at 11× gain, every AC signal biased around a buffered mid-rail reference.

Most of the noise work lives in the layout, not the parts: a split analog/power ground joined at exactly one point, a separately filtered supply rail for the op-amp, the Class-D driver amplifier kept on its own board so its ~400 kHz switching can't couple into a 1 MΩ input, film capacitors in the signal path, and the input and output routed perpendicular so the amplified output can't leak back into the high-impedance input and oscillate through the board. And each board drives two outputs on purpose: the electromagnetic driver — a heavier ~28 AWG coil, about 5.1 Ω, working over a permanent magnet and fed from that off-board amp through a Zobel network (5.6 Ω + 100 nF, to tame the coil's inductance at the amp's switching frequency) — gets the fully processed feedback signal that keeps the string singing, while a separate line sends the *raw, unity-gain pickup* out to the room speakers — so the audience always hears the actual string, never the synthesis. Nine boards, one per string, sum to the room downstream.

<figure>
  <img src="/images/log/suspension/board-schematic.png" alt="The EasyEDA schematic 'hanging-strings-v1': a Daisy Seed, a pickup preamp around an op-amp with voltage references, five potentiometer inputs, an audio-out section, and a buck-converter power stage." loading="lazy" decoding="async" />
  <figcaption>The board schematic (EasyEDA) — the Daisy Seed, the low-noise JFET preamp around the op-amp, the five pots, and a power section kept on its own ground.</figcaption>
</figure>

<div class="phone-row">
  <figure>
    <img src="/images/log/suspension/board-3d.jpg" alt="A 3D render of the populated board: blue PCB with electrolytic capacitors, an op-amp, terminal blocks and five potentiometer footprints." loading="lazy" decoding="async" />
    <figcaption>The board in 3D before fabrication.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/suspension/board-layout.png" alt="The 2D PCB layout: the Daisy footprint, five pot positions down the left, the preamp section, and the buck-converter power zone." loading="lazy" decoding="async" />
    <figcaption>The 2D layout — the power stage kept in its own corner, away from the audio front-end.</figcaption>
  </figure>
</div>

<div class="phone-row">
  <figure>
    <img src="/images/log/suspension/preamp-pcb.jpg" alt="A green PCB held in hand: five potentiometers down the left edge, a Daisy Seed module, an op-amp preamp section, and screw terminals." loading="lazy" decoding="async" />
    <figcaption>One string's board — the electromagnetic-pickup preamp front-end, a Daisy Seed running the DSP, and the five character knobs.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/suspension/nine-boards.jpg" alt="Nine identical green PCBs laid out on an aluminium heatsink rail, wired to transducers." loading="lazy" decoding="async" />
    <figcaption>Nine identical boards, one per string — benched together for testing.</figcaption>
  </figure>
</div>

<figure>
  <img src="/images/suspension/03-image.jpeg" alt="Piano wires suspended in the gallery, held taut by lead weights." loading="lazy" decoding="async" />
  <figcaption>Each wire is held taut by a lead sash weight; the pickup and electromagnetic driver clamp near opposite ends. (The same driver principle, used differently, runs through <a href="/works/interval/">Interval</a> and <a href="/works/setting-n1-5sh/">Setting (N1 5SH)</a>.)</figcaption>
</figure>

Every Daisy streams serial telemetry — energy, resonance state, rescue events — which I logged per string and watched on a small real-time visualizer during install. That's how I A/B-tested firmware across nine physically different strings instead of guessing.

The deployed firmware is v8.3, and it uses that telemetry to tune itself. Each board spends its first two seconds measuring its own string's noise floor, then an automatic gain control trims the pickup to hold the string at a consistent operating point — pulling nine physically different strings into the same behaviour without me adjusting each one by hand. The polarity flip turned cautious (it waits longer before trying, and reverts itself if the flip didn't actually help), rescue holds for a minimum dwell instead of chattering in and out, and an energy slew-limiter eases each onset into a swell.

## What designing for "never broken" changed

The win wasn't a better sound; it was a system where every failure mode self-heals before a visitor notices. Only once that rescue floor existed did experimenting feel safe — the experimental branch pushes on harmonic spread and an LFO-driven drive, on top of a system that can no longer fail closed.

## Result

It ran for the full two-month show. With no one in the room, the building itself joins the instrument — here's an hour recorded at night during a rainstorm, an ORTF stereo pair in the center of the space, the structure creaking and clicking into the feedback field:

<iframe style="border: 0; width: 100%; max-width: 400px; height: 120px;" src="https://bandcamp.com/EmbeddedPlayer/track=162657977/size=large/bgcol=ffffff/linkcol=333333/tracklist=false/artwork=small/transparent=true/" seamless title="Suspension — night recording during a rainstorm"></iframe>

And below, documentation of the installation in the gallery:

<figure>
  <img src="/images/log/suspension/gallery-wide.jpg" alt="A high view of the gallery: a steel suspension beam carrying a circuit board and cabling, tall windows in the corner, the floor below." loading="lazy" decoding="async" />
  <figcaption>During install — a string's board mounted on its steel suspension beam, the wire dropping to the floor.</figcaption>
</figure>
