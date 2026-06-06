---
title: "Variable Loops and FDNs"
subtitle: "Live performance system for solo violin"
summary: "A live-performance instrument in SuperCollider: one violin feeds a network of self-modulating variable delays that sustains and spatializes it across multiple channels — no buffers, no loop boundaries."
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

## Variable Loops & Feedback Delay Networks

Loop-and-layer performance tends to push in one direction, toward predictable repetition and rising density. For my performance at the Long Night of Music in Oldenburg, I wanted something a bit looser and more unpredictable that would still allow me to build layers of sound as a solo player.

I achieved this by building a variable looping and feedback delay network in [SuperCollider](https://supercollider.github.io/), played with a violin and a four-button foot pedal. Variable looping is rooted in tape-delay experiments from the 1960s. [Terry Riley](https://en.wikipedia.org/wiki/Terry_Riley) fed tape machines back into each other at the [San Francisco Tape Music Center](https://en.wikipedia.org/wiki/San_Francisco_Tape_Music_Center). [Brian Eno](https://en.wikipedia.org/wiki/Brian_Eno) applied the same idea with [Robert Fripp](https://en.wikipedia.org/wiki/Robert_Fripp) on *(No Pussyfooting)* in 1973, running two Revox tape machines into each other. Fripp named the rig [Frippertronics](https://en.wikipedia.org/wiki/Frippertronics) and described it as "a way for one person to make an awful lot of noise."

My system draws most from Oliveros's Expanded Instrument System. The EIS is a performer-controlled network of delays and signal processing, meant as an improvising environment for acoustic players. Oliveros called it "an elaboration of my old tape delay systems from the '60s"; she thought of it as a kind of time machine, a way to hear past, present, and future at once. The digital version ran as many as forty delays whose times and spatialization fluctuate within ranges she sets during the performance with foot pedals.

In signal-processing terms the result is a feedback delay network: delay lines whose outputs feed back into one another. In this patch the matrix runs in parallel with a second layer, a bank of independent variable-length loops. Both feed a flexible multichannel output.

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

## The System

**Feedback Delay Network:** The delay matrix has three layers: short, medium, and long. Each layer carries one tap per output channel, so a four-channel run has twelve taps, each with its own delay time. Coupling runs across channels within a layer, never across layers: every short tap feeds the other short taps, and likewise for the medium and long sets, but no layer feeds another.

```supercollider
var layers = [
    [0.030, 0.100, 0.30, 0.60],   // short:  delay 30-100 ms,  feedback 0.30-0.60
    [0.500, 2.000, 0.40, 0.75],   // medium: delay 0.5-2 s,    feedback 0.40-0.75
    [3.000, 8.000, 0.55, 0.85]    // long:   delay 3-8 s,      feedback 0.55-0.85
];
```

Each delay's feedback amount wanders on its own slow random LFO, and each cross-feed gain wanders too, between three and twenty percent. So the matrix never settles into one pattern. Its coupling keeps drifting.

**Variable Loops:** On top of that, up to twenty-four loop lines run at once in a fixed slot grid. Each loop length is drawn between ten and sixty seconds. Every voice is panned around the speaker ring with `PanAz`, each on its own slow LFO, so a loop holds a position and drifts independently. Each loop is filtered a little further on every pass, like tape, so it darkens and decays at its own rate. When all twenty-four slots are full, arming a new loop drops the quietest to make room.

**FX:** There are also effects. OCTAVE is an octave-down whose grain window tightens on attacks. DISTORT is a wavefolding fuzz with an octave-up rectifier layered in, gain-matched so engaging it does not jump the level; a double-tap on DISTORT swaps in a tremolo instead, a swept dual-delay whose crossfade reads as an amplitude warble. DELAY engages the matrix. Holding LOOP records a voice, a double-tap on LOOP starts a granular freeze, and a short tap cancels the last freeze. Holding the left pair of pedals drops the most recent loop; holding the right pair clears everything.

**Reverse & Granular Freeze:** Two later additions break the no-buffer rule. About seven percent of armed loops also spawn a reverse layer, the same captured window played backward and high-passed down to a thin shimmer. The granular freeze takes a short captured window and granulates it into a sustained tone that creeps in over a few seconds and decays over half a minute or so; double-taps stack new layers on top. Everything else stays bounded inside the loops: `LeakDC`, the feedback clamp, the per-tap soft-clip, and the trim on the matrix feedback.

## The Look

This is a lot to keep track of while improvising. Hence, the GUI. I built it from `Pen` primitives so the surface is cohesive: a warm paper ground, near-black ink, and color where something is happening to draw attention.

The grid of loopers takes up most of the space. Each circle is one loop. A pan ring carries a dot that orbits to show where the voice sits in the 360-degree field and swells with its level. A loop ring fills like a clock face as the loop records, red while recording, then the voice's own color, with a dot that circles at the playback position so I can see when what I just played will come back. A feedback gauge reads the current value, usually near 0.97. An X kills the voice. A reverse layer shows as a faint dot running the other way around the same ring. The slot where the next loop will land breathes in a slow half-wave pulse that relaxes fully to nothing between beats, its hue drifting through the voice colors.

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

## Why

I have worked with buffer loopers, pitch tracking, and machine-listening control. Modulated delays turned out to be the most controllable way to build density. One gesture sets off a loop that sustains and animates itself, as a side effect of the delay physics. I wanted an instrument I perform, not a system that composes on its own.

Next steps are to strip the GUI and run it headless on a [Bela](https://bela.io/) or a [Pi](https://en.wikipedia.org/wiki/Raspberry_Pi) with LED indicators, and drop the laptop and the screen entirely.

## Listen

Two minutes of the four-channel system, folded to stereo.
