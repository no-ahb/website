---
title: "Augmented violin — a live performance system, 2022–2024"
summary: "A live-electronics system for violin, built and rebuilt across 2022–2024: audio machine-learning that classified string and bowing, a modular Max synth, experimental IMU 'gloves' — then, the way it kept pointing, stripped back to pure feedback."
updated: "June 2024"
category: "Data & ML"
sortOrder: 7
tags: ["dsp", "max-msp", "ml", "sensors"]
stack: ["Max/MSP", "FluCoMa", "BNO055 IMU", "Teensy", "Ableton Live"]
project: "/works/violin-improvisation-system/"
hero: "/images/violin-system/01-hero.png"
thumb: "/images/log/augmented-violin/imu-glove.jpg"
draft: false
---

This is the performance system I built and rebuilt for solo and duo violin between 2022 and 2024. It's worth showing as a sequence, because the useful part is what got added and then taken away: it went from audio machine-learning, through body-motion sensing, toward the pure-feedback instrument I perform now — [Variable Loops and FDNs](/log/violin-electronics-solo/).

## 2022 — machine listening

The first version tried to make the system aware of how I was playing. Using [FluCoMa](https://www.flucoma.org/) — the same toolkit behind the [neural mixer I built for Maya Beiser](/log/infinite-bach/) — I trained small neural classifiers (`fluid.mlpclassifier~`) to recognize which string I was on (A/D/E/G) and the bowing technique (tremolo, staccato, spiccato, pizzicato, legato, col legno). The mature version ran two nets in parallel, one per axis, off a 153-dimensional feature frame: pitch and confidence, 31 MFCCs (dropping the 0th coefficient, which is really just loudness), and 120 mel bands. I gathered the training sets by playing into it — roughly 120,000 labelled frames for the string net, 68,000 dual-labelled for string-and-technique — and gated prediction below a loudness threshold so silence wouldn't classify. Running alongside it was a stereo feedback-delay network, gigged that June — the earliest version of the idea the whole project eventually came back to.

## 2023 — a modular synth, and gloves

I consolidated the synthesis into a set of [Max](https://cycling74.com/products/max) modules under version control: pitch-tracking oscillators, a feedback delay, a 12-partial additive synth, pitch-shift, a MIDI-pedal control surface, and a multichannel harmonic drone where each harmonic pans in its own harmonic ratio, so the overtones spread across the speakers. Each is a self-contained patch I could recombine per performance. The control surface was a Genki Wave ring, a MIDI footswitch, and an expression pedal.

The same year I added motion sensing — two Bosch BNO055 IMUs, one strapped to each hand as a "glove," read by a [Teensy](https://www.pjrc.com/teensy/) and streamed into Max. Both sit on one I2C bus at the chip's two addresses, and the firmware ships Euler angles, quaternion, acceleration and gravity per hand at about 10 Hz:

```cpp
Adafruit_BNO055 bno1 = Adafruit_BNO055(-1, 0x28, &Wire);  // First BNO055 sensor
Adafruit_BNO055 bno2 = Adafruit_BNO055(-1, 0x29, &Wire);  // Second BNO055 sensor
```

A submodule normalized the serial stream into left- and right-hand control, and an experimental patch mapped that motion to synth parameters with a pair of FluCoMa regressors (`fluid.mlpregressor~`, one per hand) — left-hand tilt to the volume of the sine drone, that kind of thing. I built it through 2023 and even collected gesture data for a June duo. But it stayed R&D: when I performed the most elaborate version of the whole system — a violin-and-cello duo at Goldsmiths in January 2024 — the patch didn't even load the gesture layer. I built and tested it; I won't claim it drove a live set.

<figure>
  <img src="/images/log/augmented-violin/goldsmiths-duo.jpg" alt="A violin-and-cello duo performing in a wood-panelled hall hung with gilded honour boards; a small table beside them holds a laptop running the Max system, flanked by studio monitors, with a seated audience watching." loading="lazy" decoding="async" />
  <figcaption>The most elaborate outing of the system: a violin-and-cello duo at Goldsmiths, January 2024, the modular Max patch running from the laptop. The IMU gesture layer was built and tested by then — but this set didn't load it.</figcaption>
</figure>

## Why the arc matters

Each stage added a layer of intelligence — classify the playing, sense the body, map the gestures — and each was harder to trust on stage than the last. The machine listening was brittle; the gesture mapping was one more thing that could fail mid-performance. Through 2024 the work drifted the other way: part of the year went into concatenative synthesis — matching live violin against corpora of tens of thousands of short units — but by December my sets were built around plain “feedback sketches,” and that’s the thread that held. Take out the smart layers; let the instrument’s own feedback carry the music. That’s the system I perform now — [Variable Loops and FDNs](/log/violin-electronics-solo/).

(The tools I built on were third-party — FluCoMa, [Rodrigo Constanzo's sp-tools](https://rodrigoconstanzo.com/sp-tools/), IRCAM's Spat, and Alice Eldridge and Chris Kiefer's feedback-cello examples. The modules, mappings, and performance patches are mine.)
