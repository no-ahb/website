---
title: "SuperCollider Performance Software"
subtitle: "Variable looper and feedback delay network for solo violin"
summary: "A live-performance instrument in SuperCollider: one violin feeds a self-modulating matrix of feedback delays and a bank of variable-length loops that sustain and spatialize it across multiple channels."
updated: "May 2026"
sortOrder: 18
tags: ["dsp", "supercollider", "live-performance"]
stack: ["SuperCollider", "real-time DSP", "multichannel spatial audio", "MIDI foot control"]
hero: "/images/log/violin-electronics-solo/interface.png"
heroFit: "contain"
audioFiles:
  - src: "/audio/violin-electronics-solo.mp3"
    note: "One violin sustaining and spatializing itself through the delay network."
draft: false
---

## Approach

I wanted a looper for live performance with solo violin. Something that would allow me to layer sound while staying loose and unpredictable.

I built it in [SuperCollider](https://supercollider.github.io/), a powerful albeit unwieldy tool for algorithmic composition and real-time DSP. Writing custom patches used to take a lot of expertise and time but now, with generative AI, I can rapidly prototype and iterate designs until they are perfect for my specific use case.

The idea for variable looping came from [Pauline Oliveros](https://en.wikipedia.org/wiki/Pauline_Oliveros)’s Expanded Instrument System (EIS) from the early 1990s and 2000s, a performer-controlled network of delays and signal processing built for improvising musicians. Oliveros thought of it as a kind of time machine, a way to hear past, present, and future sounds all at once. The digital version ran as many as forty simultaneous delays whose times and spatialization fluctuated within ranges she set during the performance with foot pedals.

This work stretches back to the tape-delay experiments of the 1960s: Oliveros and [Terry Riley](https://en.wikipedia.org/wiki/Terry_Riley)’s work at the [San Francisco Tape Music Center](https://en.wikipedia.org/wiki/San_Francisco_Tape_Music_Center); [Brian Eno](https://en.wikipedia.org/wiki/Brian_Eno) and [Robert Fripp](https://en.wikipedia.org/wiki/Robert_Fripp)’s a decade later. Fripp once described his system as “a way for one person to make an awful lot of noise.”

My system uses stacked delay lines alongside 24 independent, variable-length loops. Both feed an arbitrary number of channels with multichannel panning and delays.

```
violin
  |
  v
[liveBus synth]  pedal FX (octave / fuzz / tremolo) -> delay matrix
  |
  +--> liveBus  (1 ch)  = live signal + mono matrix sum   -> read by voices and output
  +--> delayBus (N ch)  = the multichannel matrix wash     -> read by output
  |
  v
[voice loops]  one feedback delay line per loop, panned    -> delayBus (N ch)
[reverse layer ~7%, granular freeze]                        -> delayBus (N ch)
  |
  v
[output]  liveBus + delayBus
          + dry signal (Haas-spread) + per-channel reverb
  |
  v
N speakers
```

Each delay has three layers: short, medium, and long. Each layer has one tap per output channel. A four-speaker performance therefore has twelve distinct delays, coupled across channels within a layer.

```supercollider
var layers = [
    [0.030, 0.100, 0.30, 0.60],   // short:  delay 30-100 ms,  feedback 0.30-0.60
    [0.500, 2.000, 0.40, 0.75],   // medium: delay 0.5-2 s,    feedback 0.40-0.75
    [3.000, 8.000, 0.55, 0.85]    // long:   delay 3-8 s,      feedback 0.55-0.85
];
```

The feedback amount of each delay wanders on its own slow oscillator. The cross-feed between channels wanders too, between 3 and 20%. So the matrix never settles into a single state and the center of the system drifts.

The 24-loop layer behaves similarly. Each loop is given a random length between 10 and 60 seconds and panned around N speakers so that loops drift independently in space. Each loop is filtered per pass, such that, like tape, it darkens and decays over time. When every slot is full, arming a new loop drops the quietest one to make room. When a loop fades below a set level, it is removed on its own.

Finally, there are the effects. OCTAVE shifts by an octave through a grain window that tightens on attacks. DISTORT is a wavefolding fuzz with an octave-up rectifier underneath, matched in gain so that switching it on does not jump the volume. A double-tap on DISTORT brings in a tremolo built from a swept pair of delays. DELAY engages the matrix. Holding LOOP records a voice; a double-tap freezes it into grains; a short tap cancels the last freeze. The left pair of pedals drops the most recent loop, the right pair clears everything.

Reverse and granular freeze came later, for more variety. About 7% of loops also spawn a reverse layer, the same window played backward and high-passed down to a thin shimmer. The freeze takes a short segment and granulates it into a sustained tone that creeps in over a few seconds and decays over half a minute, with each double-tap stacking another layer on top.

## GUI

This is all a lot to keep track of while playing. So the interface is simple and easy to read. I drew it from Pen primitives on a warm paper ground, black ink, with color only where something is happening.

The grid of loops fills most of the screen. Each circle is one loop. A dot orbits the ring to show panning in a 360-degree field. The ring fills with color like a clock face as the loop records. A reverse layer shows as a faint dot running the other way. The slot for the next loop breathes in a slow pulse.

```supercollider
// the loop ring: a colored arc fills as the loop records,
// then a dot orbits at the playback phase, breathing with level
Pen.strokeColor = arcColor;                        // red while recording, the voice's color after
Pen.addArc(cx@cy, r, -0.5pi, recordFill * 2pi);    // fills like a clock face
Pen.stroke;
a = -0.5pi + (phase * 2pi);
Pen.addArc((cx + (r*cos(a))) @ (cy + (r*sin(a))), 3.6 + (amp * 1.4), 0, 2pi);  // breathing dot
Pen.fill;
```

## Next steps

I eventually want to remove the interface entirely and run the whole thing headless on a Bela or a Pi, with LED indicators in place of the screen, so I can perform with custom hardware rather than a laptop. This portability is another advantage of using barebones programmatic tools like SuperCollider!

## Listen

Two minutes of the four-channel system, folded to stereo.
