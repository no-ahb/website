---
title: "INTERVAL — self-oscillating string modules tuned to a room"
summary: "Five wall-mounted steel strings driven into continuous self-oscillation by electromagnetic sustainers. I designed the wooden driver-modules in CAD, built the sustainer electronics from open-source designs, and tuned each string to the building's resonances."
updated: "May 2024"
category: "Hardware & PCBs"
sortOrder: 8
tags: ["hardware", "cad", "electronics"]
stack: ["Onshape / CAD", "electromagnetic sustainer", "open-source pedal PCBs", "woodworking"]
project: "/works/interval/"
hero: "/images/interval/01-hero.jpeg"
draft: true
---

INTERVAL is five steel strings on a gallery wall, each sounding continuously on its own — no player, no hammer. Each string is held in self-oscillation by an electromagnetic sustainer. I designed and built the string modules and the mechanical instrument, assembled the sustainer electronics from open-source designs, and tuned each string so its pitch is set by the architecture of the room. It's the self-oscillating sibling of [Suspension](/log/suspension/) and [Setting (N1 5SH)](/log/fm-strings/).

## How a string sounds itself

An electromagnetic sustainer is a coil that both senses a steel string's vibration and drives it. Feed the sensed motion back into the coil in phase and the string never decays — it self-oscillates, the same principle as an [E-Bow](https://en.wikipedia.org/wiki/EBow). The pitch is the string's own resonant frequency, set by its length and tension. One non-obvious constraint shapes the whole circuit: the magnetic force on a steel string rises with the *square* of the coil current, so a plain alternating drive would sound an octave too high — the string has to be pushed single-ended, by a current that swings positive but never reverses. The physics, and the single-ended drive that answers it, are laid out in Andrew McPherson's NIME 2012 paper [*Techniques and Circuits for Electromagnetic Instrument Actuation*](https://www.nime.org/proc/mcpherson2012a/index.html) — the basis of his [Magnetic Resonator Piano](http://instrumentslab.org/research/mrp.html) — which is what I worked from.

## What I built, and what I integrated

I didn't design the sustainer circuit, and I won't claim it. The driver is Brian Thornock's open-source [Stealth sustainer](https://github.com/brianthornock/StealthSustainer), a recreation of the Sustainiac: a JFET-input op-amp front end feeds an LM393 comparator that switches a pair of IRF740 power MOSFETs into the coil — and because a comparator switches rather than amplifies, that output is the single-ended drive the physics calls for. The signal path runs through an open-source ["Thunder Boost"](https://github.com/barbarachbc/thunder-boost), a clean TL072 boost with a level control and a treble switch, which I had fabricated at [Aisler](https://aisler.net/). My engineering on the electronics is integration: winding and potting the driver coils, building the per-string signal chain, and getting five of them to run stably side by side.

The original design is the instrument itself. I designed each string module in CAD: a hardwood block with a machine head for tuning, a recessed Ø20 mm bore that seats the round driver coil directly under the string, a string anchor at the far end, and a ¼-inch jack output. It went through four hand-built wooden prototypes before the CAD version.

<figure>
  <img src="/images/log/interval/module-detail.jpg" alt="Two horizontal wooden string modules on a wall, each with a tuning peg, a circular driver coil, and a jack cable." loading="lazy" decoding="async" />
  <figcaption>Two string modules. Each hardwood block carries a machine head (left) for tuning, the round electromagnetic driver coil seated under the string, and a ¼-inch jack output.</figcaption>
</figure>

<figure>
  <img src="/images/log/interval/module-coil.jpg" alt="Two vertical modules hanging, showing the recessed driver coil and brass hardware close up." loading="lazy" decoding="async" />
  <figcaption>The coil seats in a recessed bore directly under the string; the jack carries the signal out to the sustainer electronics.</figcaption>
</figure>

## Tuning to the room

The strings aren't tuned to musical notes. Each module's machine head sets length and tension so the string resonates at a frequency chosen for the space — the pitches come from the architecture and materials of the gallery. Because the modules are bolted to the wall, the wall itself radiates the sound.

<figure>
  <img src="/images/log/interval/install-wide.jpg" alt="A bright period gallery room with white walls, ornate skirting and tall sash windows; wooden string modules are mounted on the walls and a window pier, with thin strings spanning across the wall and running up toward the ceiling cornice." loading="lazy" decoding="async" />
  <figcaption>Interval at the Sarabande Foundation — the modules mounted around the gallery, long strings spanning the walls, each tuned by its length and tension to the room.</figcaption>
</figure>

## Result

Five strings, five continuous tones, tuned to the building — shown as *As Long as a Piece of String* at the [Sarabande Foundation](https://sarabandefoundation.org/), London, 2024.
