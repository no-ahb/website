---
title: "Live DSP"
subtitle: "Variable looper and feedback delay network for solo violin"
summary: "A live-performance instrument in SuperCollider: one violin feeds a self-modulating matrix of feedback delays and a bank of variable-length loops that sustain and spatialize it across multiple channels."
updated: "May 2026"
categories: ["Patches & UI"]
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

For my performance at the Long Night of Music in Oldenburg, I wanted something, a looper that was loose and unpredictable (I find that loop-and-layer performances tend toward predictable repetition and rising density) that would still allow me to build layers of sound as a solo player.

I turned to [SuperCollider](https://supercollider.github.io/), a normally unwieldy but powerful tool for algorithmic composition and real-time DSP. With AI, the development overhead (across both skill and time) for programming custom patches from scratch decreases tremendously, allowing for rapid prototyping with previously inaccessible flexibility.

I was interested in variable looping from reading about [Pauline Oliveros](https://en.wikipedia.org/wiki/Pauline_Oliveros)'s Expanded Instrument System (EIS) from the early ’90s and 2000s. The EIS is a performer-controlled network of delays and signal processing, meant as an improvising environment for acoustic players. Oliveros called it "an elaboration of my old tape delay systems from the '60s"; she thought of it as a kind of time machine, a way to hear past, present, and future at once. The digital version ran as many as forty delays whose times and spatialization fluctuate within ranges she sets during the performance with foot pedals.

Her work (and mine) is rooted in tape-delay experiments of the 1960s, from [Terry Riley](https://en.wikipedia.org/wiki/Terry_Riley)'s work at the [San Francisco Tape Music Center](https://en.wikipedia.org/wiki/San_Francisco_Tape_Music_Center) to [Brian Eno](https://en.wikipedia.org/wiki/Brian_Eno) and [Robert Fripp](https://en.wikipedia.org/wiki/Robert_Fripp)'s experiments in the 1970s. Fripp once described his system as "a way for one person to make an awful lot of noise."

My system uses stacked delay lines whose outputs feed back into one another. This delay matrix runs in parallel with a second layer for recycling live sound, a bank of up to 24 independent variable-length loops. Both feed an arbitrary number of channels with adaptable multichannel panning and delays.

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

## Details

The delay matrix has three layers: short, medium, and long. Each layer has one tap per output channel, meaning that a four-channel setup will have twelve distinct delays. The delays couple across channels within a layer.

```supercollider
var layers = [
    [0.030, 0.100, 0.30, 0.60],   // short:  delay 30-100 ms,  feedback 0.30-0.60
    [0.500, 2.000, 0.40, 0.75],   // medium: delay 0.5-2 s,    feedback 0.40-0.75
    [3.000, 8.000, 0.55, 0.85]    // long:   delay 3-8 s,      feedback 0.55-0.85
];
```

Each delay's feedback amount wanders on its own slow random LFO, and each cross-feed gain wanders too, between three and twenty percent. So the matrix never settles into one pattern and the gravity of the system keeps drifting.

The next layer is up to twenty-four loopers. Each loop duration is randomly chosen between 10 and 60 seconds. Every voice is panned around the speaker ring with `PanAz`, each on its own slow LFO, so loops drift independently in space. Each loop is filtered a little further on every pass, like tape, so it darkens and decays over time. If all twenty-four slots are full, arming a new loop drops the quietest to make room. Once a loop degrades below a certain threshold of amplitude it is automatically removed.

Finally, there are the effects. OCTAVE is an octave-shifter with an adjustable grain window that tightens on attacks. DISTORT is a wavefolding fuzz with an octave-up rectifier layered in, gain-matched so engaging it does not jump volume. A double-tap on DISTORT applies a tremolo, a swept dual-delay. DELAY engages the stacked delay matrix. Holding LOOP records a voice, a double-tap on LOOP starts a granular freeze, and a short tap cancels the last freeze. Holding the left pair of pedals drops the most recent loop; holding the right pair clears everything.

Reverse & Granular Freeze were two later additions for still more variety. About 7% of loops also spawn a reverse layer, the same captured window played backward and high-passed down to a thin shimmer. The granular freeze takes a short captured window and granulates it into a sustained tone that creeps in over a few seconds and decays over half a minute or so; double-taps stack new layers on top. Everything else stays bounded inside the loops: `LeakDC`, the feedback clamp, the per-tap soft-clip, and the trim on the matrix feedback.

## GUI

This is a lot to keep track of, especially while improvising live. Hence the simple, easy-to-read GUI. I built it from `Pen` primitives using a minimalist warm paper ground, black ink, and color where something is happening to draw attention.

The grid of loopers takes up most of the interface. Each circle is one loop. A pan ring carries a dot that orbits to show where the voice sits in the 360-degree field and swells with its level. A loop ring fills like a clock face as the loop records, red while recording, then the voice's own color, with a dot that circles at the playback position so I can see when what I just played will come back. A reverse layer shows as a faint dot running the other way around the same ring. The slot where the next loop will land breathes in a slow half-wave pulse that relaxes fully to nothing between beats, its hue drifting through the voice colors.

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

## Future Dev

Next steps for this project are to strip the GUI entirely and run it headless on a [Bela](https://bela.io/) or a [Pi](https://en.wikipedia.org/wiki/Raspberry_Pi) with LED indicators to perform with custom hardware instead of a laptop. This is another advantage of using barebones programmatic tools like SuperCollider!

## Listen

Two minutes of the four-channel system, folded to stereo.
