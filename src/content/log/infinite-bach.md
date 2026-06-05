---
title: "Infinite Bach"
subtitle: "Training a small neural net to mix a cello"
summary: "For cellist Maya Beiser, I trained a small neural network to mix her cello: it maps a 2-D control pad to a full multi-mic EQ mix, interpolating between a handful of corner mixes I set by hand."
updated: "November 2022"
category: "Data & ML"
sortOrder: 16
tags: ["ml", "max-msp", "audio"]
stack: ["Max/MSP", "Max for Live", "FluCoMa", "Ableton Live"]
thumb: "/images/log/infinite-bach/maya-beiser.jpg"
audioFiles:
  - src: "/audio/infinite-bach.mp3"
    note: "A binaural render of the multi-mic Bach mix the system produces — ninety seconds, best on headphones."
draft: false
---

Infinite Bach is a project I built for cellist [Maya Beiser](https://mayabeiser.com/), working from multi-mic stems of her cello. The premise: she plays Bach, and the system handles the mix — a single gesture moves between mixes of her many microphones. The core of it is a small neural network that blends between a handful of reference mixes I set at the corners of a control pad. I built it in [Max/MSP](https://cycling74.com/products/max) and Max for Live, as a studio system rather than a live rig.

<figure>
  <img src="/images/log/infinite-bach/maya-beiser.jpg" alt="Cellist Maya Beiser, eyes closed and head tilted back, dressed in black with a sculptural fanned gold collar sweeping up around her neck; her cello rests against her against a dark background." loading="lazy" decoding="async" />
</figure>

## What I built

Two parts. A generative engine that loops and time-stretches a Bach excerpt — the Prelude from Bach's Fourth Cello Suite (E-flat, BWV 1010), with pitch decoupled from speed (Max's `groove~` does the stretch) — though the probabilistic note-to-drone idea layered on top stayed a sketch. And the real deliverable: an auto-mixer that learns a mapping from a 2-D control pad to a full EQ mix of the cello.

## The auto-mixer

Maya's cello came to me on eight tracks: a close condenser (a 414), a close ribbon (a 122), a stereo mid pair in front (184s), a stereo ribbon behind her (an SF24), and four distant "drone" mics. Each track has a three-band EQ, so a full mix is 24 numbers. I didn't want to ride 24 controls live, so I trained a network to generate them from a single XY pad.

The model is small and supervised — a multilayer perceptron with a single hidden layer of three units, mapping the pad's X and Y to 24 EQ gains, built with [FluCoMa](https://www.flucoma.org/)'s `fluid.mlpregressor~`. Sigmoid on both layers keeps every output in 0–1, the normalized range the EQ bands want. I set four corner mixes — low-, mid-, and high-band-forward, plus a neutral balance — at the corners of the pad and trained the net on those four pairs; moving the pad interpolates between them, and the weights save to a JSON file the live device loads and runs forward in real time.

```
net:       fluid.mlpregressor~  @hiddenlayers 3   (2 → 3 → 24, sigmoid in and out)

training:  author 4 corner mixes (low / mid / high / neutral)  →  fit  →  weights.json
runtime:   pad XY  →  net  →  24 EQ gains  →  8 tracks × 3-band EQ
auto-walk: a new random pad point every ~10 s, glided to, in place of the hand
```

It's worth being precise about what this is and isn't. It's a small network interpolating four corner mixes — not a model trained on a large corpus — and its input is a control gesture, not the audio, so it doesn't listen to Maya and react; it maps where the pad is to a mix. Left alone, it drives the pad itself — a fresh random point every ten seconds or so, glided to — so the mix drifts with no hand on it. (FluCoMa's networks turn up again, as classifiers, in my [augmented-violin](/log/augmented-violin/) work.)

## Why

The idea is that the performer plays and the machine mixes: an engineer authors a few reference mixes, and the network turns them into a continuous space you can steer through. Collapsing a 24-dimensional mix down to a 2-D pad makes it something you could perform with one hand.

## Listen

A binaural render of the multi-mic mix:
