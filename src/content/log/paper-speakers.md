---
title: "Paper Speakers"
subtitle: "A generative engine for thirty-four hand-built voice coils"
summary: "Thirty-four hand-wound electromagnetic coils on paper membranes, driven by a generative SuperCollider engine that continuously composes slow tone-clusters — density, pitch and pacing all drifting on Brownian streams so it never repeats."
updated: "April 2024"
categories: ["Hardware & PCBs"]
sortOrder: 9
tags: ["hardware", "supercollider", "generative"]
stack: ["SuperCollider", "SuperClean", "hand-wound coils", "DFPlayer SD modules"]
project: "/works/paper-speakers/"
hero: "/images/paper-speakers/01-hero.jpg"
thumb: "/images/log/paper-speakers/internals.jpg"
video: "/videos/paper-speakers-1.mp4"
draft: false
---

Paper Speakers is an array of thirty-four transducers I built by hand — flat spiral coils of copper wire on paper membranes, mounted in walnut frames — driven by a generative [SuperCollider](https://supercollider.github.io/) engine that never plays the same thing twice. I built the transducers and their per-panel playback electronics, and wrote the algorithm that composes for them. The coil-on-a-surface idea is the same electromagnetic-driver family as [Interval](/works/interval/) and [Suspension](/log/suspension/) — here driving paper instead of steel strings.

## The transducers

Each "speaker" is a flat Archimedean spiral of enamelled copper wire fixed to a sheet of paper, with a magnet per coil; the paper is the diaphragm. They're grouped onto three panels behind glass — a six-coil scatter, an eight-coil ring, and a twenty-coil grid, thirty-four coils in all. The drive electronics live on the back of each panel: a strip of small stereo SD-card playback modules (DFPlayer-class), one per pair of coils, each channel on its own gain trim-pot, wired to the coils through copper-tape pads.

<figure>
  <img src="/images/log/paper-speakers/coil-detail.jpg" alt="A walnut frame behind glass holding a white paper membrane, on which eight flat copper spiral coils are arranged in a ring, with fine wire leads running between them and a cable exiting the bottom." loading="lazy" decoding="async" />
  <figcaption>The eight-coil panel from the front: flat copper spirals wound onto a paper sheet — the paper itself is the diaphragm — behind glass in a walnut frame.</figcaption>
</figure>

<figure>
  <img src="/images/log/paper-speakers/back-electronics.jpg" alt="The back of a 20-coil panel: rows of small SD-card player modules with trim-pots, wired through copper tape to the coils." loading="lazy" decoding="async" />
  <figcaption>The back of the twenty-coil panel — one stereo SD-card playback module per pair of coils, each channel with its own gain trim-pot, wired to the coils through copper-tape pads.</figcaption>
</figure>

The installation plays from those SD cards, not a live laptop, so I render the algorithm's output to per-coil stems ahead of time and load them on. Those cheap players don't start in lock-step, so the panels fire from a shared trigger, and I bench-tested the start drift — four modules playing the same two-second clip — before trusting the array to run unattended. (The hardware here is documented by photo and layout drawing rather than a parts list — I'm not going to quote coil turns or impedances I didn't write down.)

<figure>
  <img src="/images/log/paper-speakers/frame-layout.png" alt="A drilling/placement template for a 20-coil panel: a grid of coil positions with winding rings and wire-exit points." loading="lazy" decoding="async" />
  <figcaption>A layout template for a 20-coil panel — coil positions, windings, and the wire-exit points along the edges.</figcaption>
</figure>

## The generative engine

The SuperCollider engine runs two routines in parallel — sustained sine tones and a layer of looped samples — each emitting a fresh cluster of voices every cycle. Nothing is fixed:

```supercollider
~density        = Pbrown(10, ~speakers, 2).asStream;     // voices sounding at once: wanders 10..~26
~macroAmplitude = Pbrown(0.9, 1.0, 0.05, inf).asStream;  // slow master-gain drift
~fundamentalFreq = 80;   ~lowestFreq = 10;   ~highestFreq = 500;
```

How many voices sound at once (density) and the master level both wander on [Brownian](https://en.wikipedia.org/wiki/Random_walk) streams (`Pbrown`). Each cluster's pitches come from one of four distribution methods — harmonic, subharmonic, even increments, or random scatter around a fundamental — chosen with guards that stop the walk from getting stuck very high or down in the infrasonic. Everything folds into a 10–500 Hz window, and the next cluster's fundamental is drawn from the current cluster's pitches, so the piece walks through its own harmony. Pacing tracks pitch height — higher clusters move faster, lower ones linger — and voices are dealt to coils in shuffled order so tones migrate across the array:

```supercollider
aux: Pxshuf(~channelArray, inf),   // deal each voice to a coil in shuffled order
```

## Why this way

The goal was a texture, not a loop: drifting density and staggered entrances so there are no plateaus and no repetition. The four pitch-distribution methods give range — from consonant overtone stacks to detuned scatter. The low-frequency window and the per-pitch amplitude rolloff (higher tones quieter) are for the medium: a paper membrane moves air best low and slow.

## Result

The array in the gallery, with sound — shown as part of *As Long as a Piece of String* at the [Sarabande Foundation](https://sarabandefoundation.org/), London, 2024:
