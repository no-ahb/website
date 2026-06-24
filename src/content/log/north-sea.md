---
title: "North Sea"
subtitle: "A buoy to record the movement of the sea; stepper motors to replay it"
summary: "A self-contained buoy logs ocean motion at 50 Hz for 25 hours; an offline pipeline reconstructs surge, sway and heave; and three belt-driven carriages replay that motion across a field of tuned strings."
updated: "March 2026"
categories: ["Hardware & PCBs", "Data & ML"]
sortOrder: 25
tags: ["hardware", "firmware", "sensors", "dsp"]
stack: ["Raspberry Pi Pico 2", "MicroPython", "BNO085 IMU", "NumPy / SciPy", "TMC2209 steppers", "EasyEDA PCB"]
project: "/works/north-sea/"
hero: "/images/north-sea/01-header.jpeg"
thumb: "/images/log/north-sea/pcb-v1.jpg"
video: "/videos/north-sea.mp4"
videoPoster: "/images/north-sea/01-header.jpeg"
draft: false
---

North Sea started off as a very simple idea. I wanted to translate the motion of the sea into three axes of linear motion that would pluck strings. I looked at the complex movement of the waves and wondered what that motion would sound like.

<figure>
  <img src="/images/log/north-sea/north-sea-margate.jpg" alt="The surface of the North Sea from above in Margate, low sun catching waves." loading="lazy" decoding="async" />
  <figcaption>The surface of the North Sea from above in Margate, low sun catching waves.</figcaption>
</figure>

## The buoy

First I had to record motion. I used a [Raspberry Pi Pico 2](https://www.raspberrypi.com/products/raspberry-pi-pico-2/) with a [BNO085](https://www.adafruit.com/product/4754) IMU recording at 50 Hz, writing the linear acceleration and the orientation quaternion to disk. Samples are written as a fixed 32-byte binary layout (`<Ifffffff`: a millisecond timestamp plus seven float32s), buffered into 32 KiB blocks, behind a 42-byte header that's rewritten on close with the final sample count and an accumulated CRC32.

<div class="log-duo">
  <figure>
    <img src="/images/log/north-sea/buoy-electronics.jpg" alt="A Raspberry Pi Pico 2 and a BNO085 IMU breakout in a waterproof enclosure, resting on a foam core." loading="lazy" decoding="async" />
    <figcaption>A Raspberry Pi Pico 2 and a BNO085 IMU breakout in a waterproof enclosure.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/north-sea/buoy-construction.jpg" alt="The sealed sensor capsule ringed with grey foam tubes with a mooring line." loading="lazy" decoding="async" />
    <figcaption>The capsule ringed with foam pipe-insulation for flotation plus a mooring line.</figcaption>
  </figure>
</div>

<figure>
  <img src="/images/log/north-sea/buoy-deployed.jpg" alt="A storm-ready buoy tied to a concrete sea wall, the grey North Sea and overcast sky behind it." loading="lazy" decoding="async" />
  <figcaption>Weatherproofed and tied to the pier wall, ready to be thrown into the North Sea.</figcaption>
</figure>

<figure>
  <img src="/images/log/north-sea/buoy-log.png" alt="Two stacked plots over 25 hours: linear acceleration on three axes, and the four-component orientation quaternion." loading="lazy" decoding="async" />
  <figcaption>25 hours of raw buoy data: linear acceleration (top) and orientation quaternion (bottom), logged at 50 Hz.</figcaption>
</figure>

## Reconstructing surge, sway and heave

All the heavy math runs afterward on a laptop once I recover the buoy. The buoy measures acceleration; the strings need position. Getting from one to the other takes some translation:

- Each acceleration sample is rotated out of the sensor's frame and into the world frame using that sample's quaternion.
- A high-pass and a low-pass remove DC bias and tide drift at the bottom and noise at the top.
- Acceleration becomes velocity, then displacement, with a detrend between the two integrations.
- The result is then decimated from 50 Hz to 10 Hz, averaging to eliminate noise.

The output is three channels — surge, sway, heave — at 10 Hz. One run logged 4,567,746 samples at an effective 49.99999 Hz — 25.4 hours continuous, CRC-verified, on a 2000 mAh LiPo.

<figure>
  <img src="/images/log/north-sea/reconstruction.png" alt="Three stacked plots of surge, sway and heave displacement in metres over 25 hours." loading="lazy" decoding="async" />
  <figcaption>The same 25 hours after reconstruction: surge, sway and heave displacement at 10 Hz.</figcaption>
</figure>

## Replaying it through the strings

A second Pico 2 streams that 10 Hz motion to three carriages over a custom board I designed in [EasyEDA](https://easyeda.com/): Pico 2, three [TMC2209](https://www.analog.com/en/products/tmc2209.html) stepper drivers, a microSD slot, and a 24-to-5 V buck. Each carriage is a NEMA 14 stepper on a belt-driven gantry; the mechanics work out to 160 steps/mm (1/32 microstepping on a 20-tooth GT2 belt) over 1100 mm of travel. On boot each axis homes against endstops, centers, then loops the day-long file, linearly interpolating between the 10 Hz samples and converting position into a hardware-PWM step frequency per axis, so three motors move concurrently.

<figure>
  <img src="/images/log/north-sea/motor-schematic.png" alt="The EasyEDA schematic 'Sea Strings v1.1': a Raspberry Pi Pico 2 wired to three Adafruit TMC2209 stepper drivers, a buck converter, and a microSD breakout, with motor and endstop connectors." loading="lazy" decoding="async" />
  <figcaption>The controller schematic (EasyEDA): one Pico 2 driving three TMC2209 channels, each with its own motor-and-endstop connector, plus the microSD and 24-to-5 V buck.</figcaption>
</figure>

<div class="log-duo">
  <figure>
    <img src="/images/log/north-sea/motor-breadboard.jpg" alt="A breadboard prototype with a Pico, a microSD module, driver breakouts and a tangle of jumper wires." loading="lazy" decoding="async" />
    <figcaption>A breadboard prototype with a Pico, a microSD module, driver breakouts and a tangle of jumper wires.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/north-sea/pcb-v1.jpg" alt="The fabricated 'North Sea v1' PCB held in hand: a Pico 2, three stepper-driver channels labelled Motor 1 to 3, a buck converter and a microSD header." loading="lazy" decoding="async" />
    <figcaption>The PCB: a Pico 2, three stepper channels (Motor 1–3), a 24 V buck and a microSD header.</figcaption>
  </figure>
</div>

<figure>
  <img src="/images/log/north-sea/parametric-layout.png" alt="A browser tool laying out three plates of vertical strings with tuning pins and hitch pins, a panel of layout parameters on the left, a header reading 516 strings across three columns." loading="lazy" decoding="async" />
  <figcaption>The parametric layout tool I wrote to position all 516 strings (172 × 3 panels) and their tuning and hitch pins from a handful of parameters. It produces a file for the laser-cutter directly.</figcaption>
</figure>

<div class="log-duo">
  <figure>
    <img src="/images/log/north-sea/frame-cad.png" alt="A CAD rendering of the steel frame: two long perforated rails top and bottom within a rectangular frame." loading="lazy" decoding="async" />
    <figcaption>The frame in CAD.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/north-sea/frame-mockup.jpg" alt="An early steel frame on a workshop floor, with a perforated rail mounted top and bottom." loading="lazy" decoding="async" />
    <figcaption>An early frame mock-up.</figcaption>
  </figure>
</div>

<div class="log-duo">
  <figure>
    <img src="/images/log/north-sea/laser-cut-plates.jpg" alt="Four long steel rails laid out, each with a dense row of laser-cut holes following a curved pattern." loading="lazy" decoding="async" />
    <figcaption>The laser-cut plates.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/north-sea/tuning-pegs.jpg" alt="Hundreds of piano tuning pins laid out in groups." loading="lazy" decoding="async" />
    <figcaption>516 tuning pegs.</figcaption>
  </figure>
</div>

<figure>
  <img src="/images/log/north-sea/tension-wall.jpg" alt="Two wall panels backed by black steel box-section frames within timber surrounds, before the front surfaces go on." loading="lazy" decoding="async" />
  <figcaption>The panels are backed by steel frames as the combined string tension is extremely high.</figcaption>
</figure>

<figure>
  <img src="/images/log/north-sea/stringing.jpg" alt="One string panel mounted on a wall, partway through stringing: a steel tuning rail along the top, a black hitch rail along the bottom, vertical strings strung between them, and a horizontal belt-driven carriage crossing the middle with its motor and wiring to one side." loading="lazy" decoding="async" />
  <figcaption>Stringing a panel by hand, every string threaded and brought up to tension. With 5 people this took about 2 full days.</figcaption>
</figure>

## Result

The installation loops a single 25-hour recording of the North Sea as durational music.

Documentation of the piece:
