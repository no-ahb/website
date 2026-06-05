---
title: "Interval II"
subtitle: "Twelve strings and a deterministic, non-repeating wave field"
summary: "Twelve vibration motors excite piano strings along a wall, driven by a Raspberry Pi Pico running a generative algorithm: a wandering cursor over a scrambled string order, shaped by two prime-period oscillators so the pattern never settles."
updated: "March 2026"
category: "Hardware & PCBs"
sortOrder: 12
tags: ["hardware", "firmware", "generative"]
stack: ["Raspberry Pi Pico", "MicroPython", "PWM", "MOSFET drivers", "EasyEDA PCB"]
project: "/works/interval-ii/"
hero: "/images/interval-ii/01-hero.jpeg"
thumb: "/images/log/interval-ii/components.jpg"
video: "/videos/interval-ii.mp4"
draft: false
---

Interval II is a wall of twelve piano strings, each excited by its own small motor, run by a generative algorithm on a [Raspberry Pi Pico](https://www.raspberrypi.com/products/raspberry-pi-pico/). I built the control firmware, the carrier board that drives the motors, and a browser visualizer for tuning the behavior. The brief I set myself: it should run for the length of a show and never repeat or settle into an obvious pattern. It's the motor-driven counterpart to [Interval](/works/interval/), where the same wall strings sounded themselves through feedback.

## The hardware

A Pico switches each motor through a MOSFET, using four off-the-shelf [MonkMakes "Mosfetti"](https://monkmakes.com/mosfetti) 4-channel boards — sixteen channels in all, twelve of them wired to motors on the wall — which carry the flyback diodes an inductive load like a motor needs. I designed a carrier PCB in [EasyEDA](https://easyeda.com/) that seats the Pico and all four boards, takes 12 V in, and steps it down to 5 V through an OKI-78SR regulator. PWM runs at 800 Hz; duty ranges from 4000 (the lowest value that reliably spins a motor) up to 25000.

## The algorithm

A floating-point cursor sweeps back and forth across the twelve positions, and the sweep speed itself wanders — it's a slow sine LFO (0.2–0.6 positions/sec) whose period (35–60 s) and phase are randomized at every boot, so the cursor breathes between roughly an 18-second dash across the wall and a 55-second crawl, never the same way twice. A motor's intensity is a smooth falloff with its distance from the cursor — an inverted parabola, zero beyond a width the meta wave controls. Two things keep that from being a dull sweep.

First, the order is scrambled twice over. The strings are hung in a fanned zigzag — odd strings stepping left across the wall, even strings stepping right — so neighbours on the wall are never neighbours in the sequence. And in firmware a fixed map sends each cursor position to a non-adjacent channel, so consecutive steps scatter further still:

```python
# consecutive cursor positions map to distant strings,
# so the wave scatters across the wall instead of sweeping in a line
WAVE_ORDER = (0, 9, 4, 13, 2, 11, 6, 15, 1, 8, 5, 14, 3, 10, 7, 12)
```

(`ocean-wave.py` addresses the full sixteen-channel board; the wall I built wired twelve of them.)

Second, a slow "meta wave" sets how many strings are active and how loud, as a blend of two asymmetric waves at incommensurate periods:

```python
META_PERIOD_A = 37.0   # primary swell
META_PERIOD_B = 53.0   # secondary, slower
# 37 and 53 are both prime, so the pair only realigns every 37×53 = 1961 s (32.7 min)
raw = 0.65 * wave_a + 0.35 * wave_b
```

Because 37 and 53 are prime, the combined envelope doesn't return to the same state for 32.7 minutes — so the texture keeps shifting with no hard resets and no state machine. On top of that, each motor has its own slow swell (18–31 s) and occasional accent pulses (5–11 s); the periods are spaced by steps coprime to the channel count, so no two come out the same, and their phases are fixed offsets rather than random seeds — deterministic, but because no two match, nothing ever breathes in lockstep. Intensity maps to PWM duty through a square-root curve, which gives more resolution at the quiet end where the motors are most expressive:

```python
intensity = (prox * ceiling * swell_mod + swell_base) * pulse_accent * jitter
# sqrt opens up the lower range
duty = MIN_ACTIVE_DUTY + (MAX_DUTY - MIN_ACTIVE_DUTY) * math.sqrt(scaled)
```

## The visualizer

Tuning a wall of motors by ear is slow, so I wrote a browser visualizer that runs the firmware's exact algorithm — the same envelopes, the same meta wave, the same per-string swell and pulse — and draws it three ways at once: the strings at their real positions on the wall, a bar per motor for live intensity, and a scrolling oscilloscope of every channel's history so I can see whether the texture is starting to repeat.

<figure>
  <img src="/images/log/interval-ii/wave-viz.png" alt="A dark browser tuning tool in three panels: twelve glowing strings at their fanned wall positions, a row of per-motor intensity bars, and a scrolling multi-channel intensity history." loading="lazy" decoding="async" />
  <figcaption>The tuning visualizer running the firmware's algorithm — the twelve strings at their wall positions, a live intensity bar per motor, and a scrolling history of every channel.</figcaption>
</figure>

The control that matters is a time-scale slider up to 8×: it compresses the 32-minute meta cycle and the minute-long sweeps into seconds, so I can watch a show's worth of behaviour in a couple of minutes and confirm it never settles — before committing the motors and an hours-long gallery run to it.

## Why this way

The whole design is built against habituation. Prime periods instead of round numbers so nothing loops; a scrambled spatial order so you can't predict the next string; independent per-string swell so it reads as many things breathing rather than one mechanism sweeping. Even the envelope is shaped like a wave — a fast 28% rise and a slow 72% ebb, each cubically eased — so the swells break the way water does. ([North Sea](/log/north-sea/) drives strings with motors too, but from recorded ocean data rather than a generative pattern.)

## Result

Documentation of the installation:
