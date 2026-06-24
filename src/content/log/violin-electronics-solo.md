---
title: "SuperCollider Performance Software"
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

For a performance in Germany last month, I wanted a looper that would allow me to layer sound while staying loose and unpredictable.

I used [SuperCollider](https://supercollider.github.io/), a powerful albeit unwieldy tool for algorithmic composition and real-time DSP. With AI, the investment of both skill and time for programming custom patches has decreased tremendously, allowing for previously inaccessible flexibility and rapid prototyping.

My interest in variable looping came from reading about [Pauline Oliveros](https://en.wikipedia.org/wiki/Pauline_Oliveros)’s Expanded Instrument System (EIS) from the early 1990s and 2000s. The EIS is a performer-controlled network of delays and signal processing, built as an environment for improvising acoustic musicians. Oliveros called it “an elaboration of my old tape delay systems from the ’60s”. She thought of it as a kind of time machine, a way to hear past, present, and future sounds all at once. The digital version ran as many as forty delays whose times and spatialization fluctuated within ranges she set during the performance with foot pedals.

This kind of approach is rooted in the tape-delay experiments of the 1960s, from Pauline Oliveros and [Terry Riley](https://en.wikipedia.org/wiki/Terry_Riley)’s work at the [San Francisco Tape Music Center](https://en.wikipedia.org/wiki/San_Francisco_Tape_Music_Center) to [Brian Eno](https://en.wikipedia.org/wiki/Brian_Eno) and [Robert Fripp](https://en.wikipedia.org/wiki/Robert_Fripp)’s experiments in the 1970s. Fripp once described his system as “a way for one person to make an awful lot of noise.”

My system uses stacked delay lines in parallel with 24 independent variable-length loops. Both feed an arbitrary number of channels with adaptable multichannel panning and delays.

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

Each delay has three layers: short, medium, and long. Each layer has one tap per output channel. This means that a four-speaker performance will have twelve distinct delays. The delays couple across channels within a layer.

```supercollider
var layers = [
    [0.030, 0.100, 0.30, 0.60],   // short:  delay 30-100 ms,  feedback 0.30-0.60
    [0.500, 2.000, 0.40, 0.75],   // medium: delay 0.5-2 s,    feedback 0.40-0.75
    [3.000, 8.000, 0.55, 0.85]    // long:   delay 3-8 s,      feedback 0.55-0.85
];
```

The feedback amount for each delay wanders on an independent LFO. Cross-feed gain wanders too, between three and twenty percent. So the matrix never settles into one pattern or state and the center of the system keeps drifting.

For the 24-loop layer, each duration is randomly chosen between 10 and 60 seconds and every voice is panned around the speaker ring on another LFO so that loops drift independently in space. Each loop is filtered a little on every pass, such that, like tape, it darkens and decays over time. If all loop slots are full, arming a new loop drops the quietest to make room. Once a loop degrades below a certain threshold of amplitude it is also automatically removed.

Finally, there are good old FX. OCTAVE is an octave-shifter with an adjustable grain window that tightens on attacks. DISTORT is a wavefolding fuzz with an octave-up rectifier layered in, gain-matched so engaging it does not jump volume. A double-tap on DISTORT applies a tremolo, a swept dual-delay. DELAY engages the stacked delay matrix. Holding LOOP records a voice, a double-tap on LOOP starts a granular freeze, and a short tap cancels the last freeze. Holding the left pair of pedals drops the most recent loop; holding the right pair clears everything.

REVERSE & GRANULAR FREEZE were two later additions for still more variety. About 7% of loops also spawn a reverse layer, the same captured window played backward and high-passed down to a thin shimmer. The granular freeze takes a short captured window and granulates it into a sustained tone that creeps in over a few seconds and decays over half a minute or so; double-taps stack new layers on top. Everything else stays bounded inside the loops: `LeakDC`, the feedback clamp, the per-tap soft-clip, and the trim on the matrix feedback.

## GUI

This is all a lot to keep track of, especially while performing live. Hence the simple, easy-to-read GUI. I built it from `Pen` primitives using a minimalist warm paper ground, black ink, and color where something is happening to draw attention.

The grid of loopers takes up most of the interface. Each circle is one loop. A pan ring carries a dot that orbits to show where the voice sits in the 360-degree field and swells with its level. A loop ring fills like a clock face as the loop records, red while recording, then the voice’s own color, with a dot that circles at the playback position so I can see when what I just played will come back. A reverse layer shows as a faint dot running the other way around the same ring. The slot where the next loop will land breathes in a slow half-wave pulse that relaxes fully to nothing between beats, its hue drifting through the voice colors.

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

## Looking Forward

Next steps for this project are to strip the GUI entirely and run it headless on a [Bela](https://bela.io/) or a [Pi](https://en.wikipedia.org/wiki/Raspberry_Pi) with LED indicators to perform with custom hardware instead of a laptop. This is another advantage of using barebones programmatic tools like SuperCollider!

## Listen

Two minutes of the four-channel system, folded to stereo.
