---
title: "Variable Loops and FDNs"
summary: "A live-performance instrument in SuperCollider: one violin feeds a network of self-modulating variable delays that sustains and spatializes it across multiple channels — no buffers, no loop boundaries — with a sidechain duck that keeps the wash under the live playing."
updated: "May 2026"
category: "Patches & UI"
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

This is the system I perform with. Violin, a four-button foot pedal, and a network of modulated delays in [SuperCollider](https://supercollider.github.io/). I built the feedback-delay engine, the spatialization, the foot-pedal control, and the painted GUI.

## Variable Loops & Feedback Delay Networks

The usual way to loop is with a buffer: hold to record, release, and it plays back what you captured. That always felt too linear to me. Loop-and-layer performance tends to push in one direction, toward predictable repetition and rising density, and I wanted something that would keep moving on its own.

This is not a new idea. Variable looping grows out of tape-delay experiments from the 1960s onward. [Terry Riley](https://en.wikipedia.org/wiki/Terry_Riley) built sustaining textures by feeding two tape machines back into each other, working in the same [San Francisco Tape Music Center](https://en.wikipedia.org/wiki/San_Francisco_Tape_Music_Center) circle that [Pauline Oliveros](https://en.wikipedia.org/wiki/Pauline_Oliveros) came out of. [Brian Eno](https://en.wikipedia.org/wiki/Brian_Eno) took the technique further on [(No Pussyfooting)](<https://en.wikipedia.org/wiki/(No_Pussyfooting)>) with [Robert Fripp](https://en.wikipedia.org/wiki/Robert_Fripp) in 1973: two [Revox A77](https://en.wikipedia.org/wiki/Revox) reel-to-reel machines set a short distance apart, the record head of one feeding the playback head of the other, the second machine's output fed back to the first. The gap between the decks set the delay, roughly three to six seconds, and each pass decayed a little. Fripp played guitar over the loop and later named the rig [Frippertronics](https://en.wikipedia.org/wiki/Frippertronics). He described it as "a way for one person to make an awful lot of noise," which is close to what I want from this patch.

The matrix here owes most to Oliveros's Expanded Instrument System, which she developed over decades, from 1960s tape delays to outboard [Lexicon](<https://en.wikipedia.org/wiki/Lexicon_(company)>) units to software. The EIS is a performer-controlled network of delays and signal processing, meant as an improvising environment for acoustic players. Oliveros called it "an elaboration of my old tape delay systems from the '60s"; early on she hauled reel-to-reel machines from venue to venue. She thought of it as a kind of time machine, a way to hear past, present, and future at once, "simultaneously with transformations." The digital version ran as many as forty delays whose times and spatialization fluctuate within ranges she sets during the performance, doing what a player's hands and feet cannot, with foot pedals to shift those parameters mid-piece. The parallels to what I built are direct: a bank of modulated delays, performer-set ranges, foot-pedal control, multichannel spread, and the past folded back into the present.

I wanted that behavior under a performer's hands, built from scratch so I could shape every part of it. In signal-processing terms the result is a feedback delay network: a set of delay lines whose outputs feed back into one another through a matrix of gains, the same structure used in algorithmic reverbs. In this patch the matrix runs in parallel with a second layer, a bank of independent loop voices. Both feed a multichannel output that ducks the delay field under whatever I am playing live.

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
[output]  liveBus + delayBus, delayBus ducked by live amplitude,
          + dry signal (Haas-spread) + per-channel reverb
  |
  v
N speakers
```

## How it's built

Two layers run in parallel.

The delay matrix has three banks: short, medium, and long. Each bank holds one delay tap per output channel, so four taps each in the quad layout. Within a bank, every tap cross-feeds the others. The banks do not feed each other.

```supercollider
var layers = [
    [0.030, 0.100, 0.30, 0.60],   // short:  delay 30-100 ms,  feedback 0.30-0.60
    [0.500, 2.000, 0.40, 0.75],   // medium: delay 0.5-2 s,    feedback 0.40-0.75
    [3.000, 8.000, 0.55, 0.85]    // long:   delay 3-8 s,      feedback 0.55-0.85
];
```

Each row is `[delay min, delay max, feedback min, feedback max]`. The delay time for each tap is drawn once at startup and then held fixed. I had the times sweeping at first, but a moving read pointer bends pitch like tape Doppler, and that was not what I wanted, so the times stay put. The motion comes from elsewhere. Each tap's feedback amount wanders on its own slow random LFO between that bank's limits, and each cross-feed gain wanders too, between three and twenty percent. So the matrix never settles into one resonance. Its coupling keeps drifting: a tap strongly tied to one neighbor slowly loosens and re-ties to another over tens of seconds. The whole matrix feedback is scaled to 85 percent of nominal and every tap is soft-clipped, which is what keeps it from running away.

On top of that, each voice is an independent loop line. Up to twenty-four run at once in a fixed slot grid; arm a twenty-fifth and the quietest voice is dropped to make room. A voice recirculates through `LocalIn` and `LocalOut` with feedback clamped just under one. A DC blocker and that clamp are what stop it running away. The feedback is not constant either: a slow per-voice LFO breathes it by about plus or minus 0.04 under the ceiling, so no two loops decay at the same rate.

```supercollider
fbIn     = LocalIn.ar(1);
mixed    = LeakDC.ar(input + (fbIn * (feedback + fbMod).clip(0, 0.97)));
delayed  = DelayC.ar(mixed, 65, (baseDelay + timeMod).max(0.01));   // DelayC: no clicks under modulation
filtered = HPF.ar(LPF.ar(delayed, cutoff), 120);
LocalOut.ar(filtered);
```

Each loop length is drawn between ten and sixty seconds, so a phrase might return in a few seconds or wait the better part of a minute. Every voice is panned around the speaker ring with `PanAz`, each on its own slow LFO, so each loop holds a position and drifts independently rather than reading as one block. The matrix taps do not drift: each bank lays one tap on each channel, so the wash is spread across the ring but anchored. The channel count is a single constant. I run the same patch at two channels on headphones and four for a quad ring.

The signal a voice records is not the raw violin. It runs first through whatever I have engaged on the four-button pedal, which maps to LOOP, OCTAVE, DISTORT, and DELAY. OCTAVE is an octave-down whose grain window tightens on attacks, down to about 50 milliseconds for tight tracking, and opens to about 200 on sustains so it stays smooth. DISTORT is a wavefolding fuzz with an octave-up rectifier layered in, gain-matched so engaging it does not jump the level; a double-tap on DISTORT swaps in a tremolo instead, a swept dual-delay whose crossfade reads as an amplitude warble. DELAY engages the matrix. Holding LOOP records a voice, a double-tap on LOOP starts a granular freeze, and a short tap cancels the last freeze. Holding the left pair of pedals drops the most recent loop; holding the right pair clears everything. Whatever is on when I arm a loop is baked into it.

Two later additions break the no-buffer rule because they earned it. About seven percent of armed loops also spawn a reverse layer, the same captured window played backward and high-passed down to a thin shimmer. The granular freeze takes a short captured window and granulates it into a sustained tone that creeps in over a few seconds and decays over half a minute or so; double-taps stack new layers on top. Everything else stays bounded inside the loops: `LeakDC`, the feedback clamp, the per-tap soft-clip, the trim on the matrix feedback. There is no master limiter anywhere. I kept it that way on purpose. The limiter should never be the thing holding the sound together.

## The interface

I have to read the GUI at a glance while bowing, to see the state of the system in more detail than I can always hear. Every widget is hand-drawn. I built all of them from `Pen` primitives so the whole surface follows one grammar: a warm paper ground, a warm near-black ink, and color only where something is happening.

The grid of loopers takes up most of the panel. Each circle is one loop. A pan ring carries a dot that orbits to show where the voice sits in the 360-degree field and swells with its level. A loop ring fills like a clock face as the loop records, red while recording, then the voice's own color, with a dot that circles at the playback position so I can see when what I just played will come back. A feedback gauge reads the current value, usually near 0.97. An X kills the voice. A reverse layer shows as a faint dot running the other way around the same ring. The slot where the next loop will land breathes in a slow half-wave pulse that relaxes fully to nothing between beats, its hue drifting through the voice colors.

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

State changes ease in over about a fifth of a second. The orbiting dots interpolate between telemetry frames, and nothing moves faster than about a hertz. The panel is dense, up to twenty-four voices, each with its position, phase, level, and feedback, plus a per-speaker meter and the pedal row. It stays calm, because nothing blinks and nothing is colored unless it is alive. It mirrors the music: complex but slow.

## Why this way

I wanted a minimal-input instrument I could perform, not a system clever enough to compose on its own. I have worked with buffer loopers, pitch tracking, and machine-listening control, and plain modulated delays turned out to be a stronger and more controllable way to build density. One gesture sets off a self-sustaining, self-animating loop as a side effect of the delay physics. It is the same feedback principle that drives the [Suspension](/log/suspension/) strings, here under a player's hands. The long-term plan is to strip the GUI and run it headless on a [Bela](https://bela.io/) or a [Pi](https://en.wikipedia.org/wiki/Raspberry_Pi) with LED indicators, and drop the laptop and the screen entirely.

## Listen

Two minutes of the four-channel system, folded to stereo.
