---
title: "Suspension"
subtitle: "Firmware for self-oscillating strings"
summary: "Nine piano wires sustained by electromagnetic feedback, each running a Daisy Seed with eight self-tuning mechanisms — built so the installation ran unattended for two months and no knob could break it."
updated: "March 2026"
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

Nine piano wires hang from the ceiling. Each sustains itself, indefinitely, through electromagnetic feedback. The following describes the decisions behind the firmware.

## A string, feeding back

First, a pickup senses the wire's motion, converts the movement to an electrical signal, which is then converted into the digital realm, amplified/filtered/processed, converted back into electricity, amplified again, and finally pushed through a driver to convert the signal back to a fluctuating magnetic field, causing the steel string to vibrate.

This feedback loop of energy allows the string to find its own natural resonance and sustain it. Too little gain and it falls silent; too much and it gets stuck on one note.

<figure>
  <img src="/images/log/suspension/measured-strings.jpg" alt="Coils of steel piano wire with galvanized eyebolt terminations and masking-tape labels, on a workbench." loading="lazy" decoding="async" />
  <figcaption>The nine wires, each cut to the length its tuning needs and labeled before hanging.</figcaption>
</figure>

My goal was to find balance, a delicate middle region between extremes, and constrain the feedback loop to that small area so it could run unattended for the full two-month exhibition. I wanted it to ebb and flow between harmonics on its own while never going fully silent.

<figure>
  <img src="/images/log/suspension/string-layout-planner.png" alt="A 3D planner showing nine strings positioned in a room, each labeled with its resonant frequency and wire length." loading="lazy" decoding="async" />
  <figcaption>The layout planner: nine wires, each tuned to a sub-50 Hz fundamental, with the wire length each tuning implies. Tuning is <a href="https://en.wikipedia.org/wiki/Just_intonation">just intonation</a>. The outer strings' overtones periodically align with the central string's, so consonance drifts in and out of a diffuse field.</figcaption>
</figure>

The design was all in the DSP. I wrote a program to adjust responsive gain, bandpass filters, and other self-adjusting mechanisms: rescue, an auto-tracking energy baseline, automatic Q, adaptive drift, gain normalization, the spectral bump, an anti-stagnation "breath," and a post-breath Q boost.

## On the edge of resonance

Everything in that chain is fixed; what turns it into an instrument rather than an oscillator is the self-regulating layer. The algorithm is designed to keep the feedback loop on the edge of resonance without locking into a single state. It judges state from an energy envelope tapped just after the bandpasses.

When a resonance catches and the energy climbs, the firmware narrows the filters (Q toward 8) and slows their drift, briefly latching so the partial it just found can settle instead of being dragged off; when the energy falls, it widens them (Q down to 1.5) and speeds the drift back up to go hunting, making it quick to re-acquire, slow to hold. A soft gain-normalizer leans on the feedback as the loop gets loud relative to the string's own running average, so no single partial can run away, and the Gaussian spectral bump tilts which partials get the most feedback, countering a string's natural habit of pouring energy into its highest harmonics, which is the trap an earlier high-Q version fell into. Because every one of those reactions is measured against a 20-second baseline of the string's own level, the identical sketch self-calibrates to nine physically different strings. Left too long on one note, the "breath" fades it out and jumps to a new harmonic so it never stagnates; underneath all of it sits the rescue watchdog, the floor that restarts a string from silence.

## Hardware

Each string has a [Daisy Seed](https://electro-smith.com/products/daisy-seed) 'brain' running the same sketch. The signal chain:

```
PICKUP → pickup gain (+ rescue boost) → HPF 80 Hz → LPF 8 kHz
       → [ SVF_A + SVF_B + SVF_C ]   (three clustered bandpasses, summed)
       → feedback (+ rescue boost) → DC blocker → tanh clip → 0.95 ceiling
       → driver gain (+ rescue boost) → polarity (auto) → DRIVER OUT
```

### Knobs

If the algorithm controls everything, why any knobs at all?

The knobs are the voicing layer determining how hard a string is driven (pickup and driver gain), how dense and insistent its feedback (intensity), which band expands (brightness, which slides the spectral bump's center between 80 and 300 Hz), and how restlessly the resonance wanders (movement, the drift speed). The knobs become second-order expressive controls to voice each string by ear.

### The preamp

Getting the signal into the DSP chain cleanly was the biggest hardware challenge. The pickup is an electromagnetic coil (42 AWG wound to about 550 Ω) so it has a high, inductive source impedance. The preamp has to be as silent as possible before it is amplified and fed back into a feedback loop, where any hiss can quickly get out of hand. The preamp is built around an [OPA2134](https://www.ti.com/product/OPA2134) JFET-input op-amp on a single +12 V supply at 11× gain. Most anti-hiss protection is in the layout. A split analog/power ground is joined at one point, there's a separately filtered supply rail for the op-amp, the Class-D driver amplifier is kept on its own board, there are film capacitors in the signal path, and the input and output are routed perpendicular to each other so the amplified output can't leak back into the high-impedance input and oscillate through the board.

Each board drives two outputs: the electromagnetic driver (a heavier, ~28 AWG coil, about 5.1–5.3 Ω) gets the fully processed feedback signal that keeps the string moving, while a separate line sends the raw pickup signal to the room speakers so the audience hears the string itself, unprocessed.

<figure>
  <img src="/images/log/suspension/board-schematic.png" alt="The EasyEDA schematic 'hanging-strings-v1': a Daisy Seed, a pickup preamp around an op-amp with voltage references, five potentiometer inputs, an audio-out section, and a buck-converter power stage." loading="lazy" decoding="async" />
  <figcaption>The board schematic (EasyEDA).</figcaption>
</figure>

<div class="phone-row">
  <figure>
    <img src="/images/log/suspension/board-3d.jpg" alt="A 3D render of the populated board: blue PCB with electrolytic capacitors, an op-amp, terminal blocks and five potentiometer footprints." loading="lazy" decoding="async" />
    <figcaption>The board in 3D before fabrication.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/suspension/board-layout.png" alt="The 2D PCB layout: the Daisy footprint, five pot positions down the left, the preamp section, and the buck-converter power zone." loading="lazy" decoding="async" />
    <figcaption>The 2D layout.</figcaption>
  </figure>
</div>

<div class="phone-row">
  <figure>
    <img src="/images/log/suspension/preamp-pcb.jpg" alt="A green PCB held in hand: five potentiometers down the left edge, a Daisy Seed module, an op-amp preamp section, and screw terminals." loading="lazy" decoding="async" />
    <figcaption>One board.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/suspension/nine-boards.jpg" alt="Nine identical green PCBs laid out on an aluminium heatsink rail, wired to transducers." loading="lazy" decoding="async" />
    <figcaption>Nine identical boards, one per string.</figcaption>
  </figure>
</div>

Every Daisy streams serial telemetry (energy, resonance state, rescue events) which I logged per string to A/B-test across nine physically different strings instead of guessing blind.

## Result

It ran for the full two-month show without a hitch. With no one in the room, the building itself joins the instrument. Below is an hour recording at night during a rainstorm, an ORTF stereo pair in the center of the space, the structure creaking and clicking into the field of feedback and harmonics.

<iframe style="border: 0; width: 100%; max-width: 400px; height: 120px;" src="https://bandcamp.com/EmbeddedPlayer/track=162657977/size=large/bgcol=ffffff/linkcol=333333/tracklist=false/artwork=small/transparent=true/" seamless title="Suspension — night recording during a rainstorm"></iframe>

And below, documentation of the installation in the gallery:

<figure>
  <img src="/images/log/suspension/gallery-wide.jpg" alt="A high view of the gallery: a steel suspension beam carrying a circuit board and cabling, tall windows in the corner, the floor below." loading="lazy" decoding="async" />
  <figcaption>During install — a string's board mounted on its steel suspension beam, the wire dropping to the floor.</figcaption>
</figure>
