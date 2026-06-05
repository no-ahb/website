---
title: "FUNDAMENTAL"
subtitle: "Recording a building until its room modes take over"
summary: "An automated SuperCollider process records a gallery, plays it back through basement subwoofers, and re-records — looping until the room's own 14–15 Hz modes dominate, then slows the result to subsonic and plays it back autonomously."
updated: "March 2026"
categories: ["Patches & UI"]
sortOrder: 15
tags: ["dsp", "supercollider", "acoustics"]
stack: ["SuperCollider", "Focusrite Scarlett 18i20", "Mackie SWA 1501 subs", "Mac Mini M1", "macOS LaunchAgent"]
project: "/works/fundamental/"
hero: "/images/fundamental/01-hero.jpeg"
audioFiles:
  - src: "/audio/fundamental.mp3"
    note: "The finished piece — iteration 30 of the recursion, slowed 8× so the building's ~15 Hz modes sit at the bottom of hearing. Needs a system that reproduces sub-bass."
draft: true
---

FUNDAMENTAL applies [Alvin Lucier](https://en.wikipedia.org/wiki/Alvin_Lucier)'s [*I Am Sitting in a Room*](https://en.wikipedia.org/wiki/I_Am_Sitting_in_a_Room) to a building instead of a voice. I wrote a [SuperCollider](https://supercollider.github.io/) process that records the gallery, plays the recording back through two subwoofers in the basement, records the room's response, and repeats — until the building's own resonant modes are all that's left. I built the recursive automation, the convergence logging, and an autonomous patch that plays the finished piece unattended. It was the acoustic foundation of my [Haus für Medienkunst](https://hausmedienkunst.de/en/) show, under [ANTIPHON](/log/antiphon/) and beside [Suspension](/log/suspension/).

## The recursion

Iteration 0 records pure room tone with no playback — the seed. Every iteration after that plays the previous recording through the subs and records the room at the same time, sample-accurately, then writes the pass to disk and feeds it to the next one. As built: 44.1 kHz / 32-bit float, 10 minutes per iteration, about 30 iterations across one night, with no filtering at capture.

```supercollider
// each iteration: play the previous pass through the subs while recording the room
s.makeBundle(0, {
    playSynth = Synth(\fund_play, [\bufnum, prevBuf,
        \out1, subOut1, \out2, subOut2, \amp, playbackAmp]);
    recSynth  = Synth(\fund_rec,  [\bufnum, curBuf, \inChan, micIn]);
});
iterationDuration.wait;   // 600 seconds, then save curBuf and advance
```

Each pass, the room amplifies the frequencies it resonates at and attenuates everything else. Repeat it enough times and the room's modal signature is all that survives — Lucier's result, pointed at architecture instead of speech.

## Watching it converge

I logged peak and RMS amplitude, crest factor, and spectral centroid and flatness for every iteration. Convergence shows up two ways: the peak climbs as the modes reinforce, and the spectrum collapses from broadband noise toward discrete tones (centroid falls, flatness drops).

| Iteration | Peak (dBFS) |
|-----------|-------------|
| 0 (seed)  | −54.1 |
| 10        | −49.2 |
| 15        | −41.1 |
| 20        | −27.3 |
| 25        | −12.0 |
| 30        | −0.1 |

That ~54 dB rise over 30 passes is the room reinforcing itself until it hits the limiter, after which only the spectrum keeps changing. Measured back from the files, the collapse is stark: at the seed the energy is spread across the spectrum, but by iteration 30 nearly all of it has pooled below 120 Hz, while the content above 1 kHz has fallen from about 5 dB under the full signal to nearly 40 dB beneath it. The room filtered a broadband seed down to its own low modes.

## Why this building

The gallery is nearly a cube — 11.6 × 11.7 × 6.5 m — so its fundamental axial [room modes](https://en.wikipedia.org/wiki/Room_modes) are already subsonic. From `f = nc/2L`, the length gives 14.8 Hz and the width 14.7 Hz. Because the two are so close they beat against each other at about 0.13 Hz: one slow pulse every ~8 seconds, the room's own breath. (The square basement pit adds a steady 15.2 Hz with no beating.) I set the iteration length to 10 minutes specifically to capture that 8-second beat.

The processing choice was deliberate: run the recursion at full bandwidth and **slow** the converged result afterward — 8×, so the audible harmonics land back on the building's real modes — rather than measuring the modes and resynthesizing them as clean sine tones. Slowing keeps the beating and the small instabilities that make it feel like a room and not a test tone.

At these frequencies the room stops behaving like a space and starts behaving like a body. A 15 Hz wave is about 23 m long — roughly twice the room — so the whole volume moves more or less as one, with a single pressure antinode in the middle and nulls at the walls that a visitor physically walks through. And because the basement pit is acoustically open to the gallery above, the sub-bass climbs up into the room and shakes the hanging [Suspension](/log/suspension/) wires sympathetically: the foundation piece quite literally driving the one upstairs.

## Signal flow and autonomous playback

```
AKG C1000S (gallery)  →  Scarlett 18i20  →  Mac Mini M1 (SuperCollider)
       ▲                                              │
       │                                              ▼
  room response   ←   basement pit   ←   2× Mackie SWA 1501 (subs)
```

A separate patch plays the finished piece for the length of the show with no intervention. It loops the file as two layers at slightly different, very slow rate drift so it never exactly repeats, gates to gallery hours, and auto-starts on boot via a macOS [LaunchAgent](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html).

```supercollider
// playback never exactly repeats: ±2% rate drift over 30 minutes
rate = LFNoise1.kr(1/1800).range(0.98, 1.02);
sig  = PlayBuf.ar(1, bufnum, rate: rate * BufRateScale.kr(bufnum), loop: 1);
```

## Result

The finished piece is iteration 30, slowed 8× — the building playing its own fundamental:
