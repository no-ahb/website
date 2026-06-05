---
title: "Setting (N1 5SH) — twelve strings driven by local FM radio"
summary: "Twelve piano strings tuned chromatically and bolted to a gallery, set into motion by whatever is playing on local FM radio — site- and time-specific music for one London postcode."
updated: "September 2024"
category: "Hardware & PCBs"
sortOrder: 5
tags: ["hardware", "cad", "concept"]
stack: ["Raspberry Pi Pico W", "TEA5767 FM tuner", "electromagnetic drivers", "Onshape / CAD"]
project: "/works/setting-n1-5sh/"
hero: "/images/setting/01-hero.jpeg"
draft: true
---

Setting (N1 5SH) is twelve piano strings, tuned chromatically across an octave and bolted to a gallery's walls and ceiling, that sound continuously — driven not by their own feedback but by whatever is on local FM radio. The title is the postcode of the gallery itself — the [Sarabande Foundation](https://sarabandefoundation.org/), N1 5SH — so the piece is, quite literally, whatever the airwaves carry to that address at that moment.

## How it works

It shares its physics with my other electromagnetic-string pieces — [Interval](/log/interval/) and [Suspension](/log/suspension/): an electromagnetic driver under a steel string pushes it into motion. The hardware here is a shared bank — four drivers seated in a machined plate, energizing all twelve strings at once — rather than one coil per string. What's different is the drive *signal*. Instead of a feedback loop that lets each string find its own resonance, the input is radio: a TEA5767 FM receiver tunes to a station and the demodulated broadcast is what moves the strings. Because the twelve strings are tuned to a fixed chromatic octave, they behave as a bank of mechanical resonators on that signal — the strings whose pitch matches energy in the broadcast ring out, the rest stay quiet. The radio gets sieved through a fixed twelve-note grid.

<figure>
  <img src="/images/log/fm-strings/mechanism.jpg" alt="A machined aluminium plate mounted on a white wall: four round electromagnetic drivers in a two-by-two block near the top, a row of brass tuning pins below them, twelve steel strings running the length of the plate to a chevron of ball-end anchors at the bottom, and a power cable plugged into one side." loading="lazy" decoding="async" />
  <figcaption>The drive unit: four electromagnetic drivers seated in a machined plate excite the twelve strings, tuned at the brass pin bank and anchored in the chevron below. The only thing wired in is power — the signal is whatever the radio pulls out of the air.</figcaption>
</figure>

I should be straight about what's mine here. The FM tuning is an off-the-shelf [MicroPython library for the TEA5767](https://github.com/alankrantas/micropython-TEA5767) on a [Raspberry Pi Pico W](https://www.raspberrypi.com/products/raspberry-pi-pico/) — an I2C-controlled PLL tuner where setting a station is a single library call — not code I wrote, and the electromagnetic drive borrows from the pieces above. The build that *is* mine is mechanical: I designed the string modules in CAD (Onshape, the same workflow as [Interval](/log/interval/)) — the plate that seats the four drivers, the bank of tuning pins, the string anchor — and tuned the strings to their chromatic grid. The radio conceit is the point, but it plays through a real instrument I had to build.

## Why

It's a site- and time-specific instrument. Tuning the strings chromatically — rather than to the room, as in Interval — gives the radio a fixed musical grid to play through, so the broadcast is filtered into a scale. The result is different every time you stand in front of it, and specific to where it is.

## Listen

A recording from the installation:

<iframe style="border: 0; width: 100%; max-width: 400px; height: 120px;" src="https://bandcamp.com/EmbeddedPlayer/track=653721336/size=large/bgcol=ffffff/linkcol=333333/tracklist=false/artwork=small/transparent=true/" seamless title="Setting (N1 5SH)"></iframe>
