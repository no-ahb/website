---
title: "North Sea — a buoy that records the sea, and strings that replay it"
summary: "A self-contained buoy logs ocean motion at 50 Hz for 25 hours; an offline pipeline reconstructs surge, sway and heave; and three belt-driven carriages replay that motion across a field of tuned strings."
updated: "March 2026"
category: "Data & ML"
sortOrder: 25
tags: ["hardware", "firmware", "sensors", "dsp"]
stack: ["Raspberry Pi Pico 2", "MicroPython", "BNO085 IMU", "NumPy / SciPy", "TMC2209 steppers", "EasyEDA PCB"]
project: "/works/north-sea/"
hero: "/images/log/north-sea/pcb-v1.jpg"
heroPosition: "center 68%"
video: "/videos/north-sea.mp4"
videoPoster: "/images/north-sea/01-header.jpeg"
draft: false
---

North Sea is a buoy that records the motion of the sea and a wall of strings that replays it. I built three things: the buoy's logger firmware, the offline pipeline that turns raw motion into a playable signal, and the motor system that draws the strings.

<figure>
  <img src="/images/log/north-sea/north-sea-margate.jpg" alt="The surface of the North Sea from above at Margate, low sun catching the swell." loading="lazy" decoding="async" />
  <figcaption>The North Sea at Margate — the surface motion the buoy was built to record.</figcaption>
</figure>

## The buoy logger

A [Raspberry Pi Pico 2](https://www.raspberrypi.com/products/raspberry-pi-pico-2/) reads a [BNO085](https://www.adafruit.com/product/4754) IMU at 50 Hz and writes two things per sample to a microSD card: the linear acceleration (gravity already removed by the sensor's on-chip fusion) and the orientation quaternion — its magnetometer-free game rotation vector, so there's no compass to be pulled around by the battery and boards riding alongside it. I read the IMU through a [MicroPython port](https://github.com/dobodu/BOSCH-BNO085-I2C-micropython-library) of Adafruit's driver. Records are a fixed 32-byte binary layout (`<Ifffffff`: a millisecond timestamp plus seven float32s), buffered into 32 KiB blocks, behind a 42-byte header that's rewritten on close with the final sample count and an accumulated CRC32.

<div class="log-duo">
  <figure>
    <img src="/images/log/north-sea/buoy-electronics.jpg" alt="A Raspberry Pi Pico 2 and a BNO085 IMU breakout in a sealed clear enclosure, resting on a foam core." loading="lazy" decoding="async" />
    <figcaption>The logger boards — a Pico 2 and a BNO085 IMU — sealed in a clear enclosure.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/north-sea/buoy-construction.jpg" alt="The sealed sensor capsule ringed with grey foam pipe-insulation tubes, taped into a cylinder, with a mooring line." loading="lazy" decoding="async" />
    <figcaption>Under construction — the capsule ringed with foam pipe-insulation for flotation, mooring line attached.</figcaption>
  </figure>
</div>

I log raw and reconstruct later, on purpose. Keeping the per-sample work to two sensor reads and a memory copy is what lets the Pico hold a steady 50 Hz for a full day; all the heavy math runs afterward on a laptop, where I can re-tune it without having to recover the buoy. One deployment logged **4,567,746 samples at an effective 49.99999 Hz — 25.4 hours continuous**, CRC-verified, on a 2000 mAh LiPo whose system rail never fell below 3.91 V, comfortably clear of the 3.40 V cutoff. Most of the firmware is reliability: bounded retries on SD errors, an unmount/remount/reopen recovery path that refuses to append to a misaligned tail, a per-record CRC32, a low-voltage cutoff, and a last-known-good hold that reuses the previous sample whenever a read slips, so the file stays sample-aligned to the end.

<figure>
  <img src="/images/log/north-sea/buoy-deployed.jpg" alt="A foil-wrapped buoy tied off on a concrete sea wall, the grey North Sea and overcast sky behind it." loading="lazy" decoding="async" />
  <figcaption>Weatherproofed and tied off on the sea wall, ready to deploy into the North Sea.</figcaption>
</figure>

<figure>
  <img src="/images/log/north-sea/buoy-log.png" alt="Two stacked plots over 25 hours: linear acceleration on three axes, and the four-component orientation quaternion." loading="lazy" decoding="async" />
  <figcaption>25 hours of raw buoy data — linear acceleration (top) and orientation quaternion (bottom), logged at 50 Hz. This is the input to the pipeline.</figcaption>
</figure>

## Reconstructing surge, sway and heave

The buoy measures acceleration; the strings need position. Getting from one to the other is the core of the project, and it runs in four steps:

1. Each acceleration sample is rotated out of the sensor's frame and into the world frame using that sample's quaternion, so "up" stays up no matter how the buoy tipped on the wave.
2. A zero-phase Butterworth high-pass and low-pass removes DC bias and tide drift at the bottom and noise at the top.
3. Acceleration becomes velocity, then displacement, with a detrend between the two integrations.
4. The result is then decimated from 50 Hz to 10 Hz.

The output is three channels — surge, sway, heave — at 10 Hz. The band-limit in step 2 is the load-bearing part: double-integrating raw acceleration turns any constant offset or slow tilt into displacement that grows without bound, so the high-pass is what keeps the result from drifting off the screen. I deployed the frequency-domain version of this (integrate by dividing the spectrum by −ω² across a passband), and tuned the high-pass cutoff up to 0.02 Hz to trade drift against keeping the slow swell you can feel.

That integration is only a few lines of NumPy:

```python
# the whole double-integration, done in the frequency domain:
# dividing each bin by −ω² turns acceleration into displacement
omega2 = (2 * np.pi * freqs[passband]) ** 2
disp_spectrum[passband] = -accel_spectrum[passband] / omega2
displacement = np.fft.irfft(disp_spectrum)
```

The `passband` mask is the high-pass made concrete: bins below 0.02 Hz and above roughly 1.5 Hz are left at zero, so the tiny ω² at low frequencies — which would otherwise blow slow drift up enormously the moment you divide by it — never gets the chance.

<figure>
  <img src="/images/log/north-sea/reconstruction.png" alt="Three stacked plots of surge, sway and heave displacement in metres over 25 hours." loading="lazy" decoding="async" />
  <figcaption>The same 25 hours after reconstruction: surge, sway and heave displacement at 10 Hz — metres of real sea motion, the last physical signal before it's scaled for the carriages.</figcaption>
</figure>

Displacement in metres still isn't something a carriage can follow: the rail has about 1.1 m of travel, and a calm hour and a stormy hour can't both swing the full range — or neither one reads as itself. The last step is scaling, and it's where I spent the most time second-guessing. I auditioned several strategies — percentile clipping with a soft knee, a dual-band split that normalizes slow drift and fast chop separately, an envelope that tracks the sea's energy with a rolling standard deviation — and shipped the plainest one that held up across recordings: find the in-water window automatically (the buoy keeps logging on the sea wall before and after, so I detect the stretch where it was moving on the water), normalize surge, sway and heave together against one shared range so their relative size survives, then despike, smooth, slew-limit, and fade in and out over ten seconds. The cleverer curves felt better on one day and wrong on the next; the deterministic chain was predictable across days, which is what matters when a single fixed scale has to carry a looping 25-hour file.

<figure>
  <img src="/images/log/north-sea/motor-feed.png" alt="Four stacked plots over the 25-hour window: a flat-topped fade envelope, and surge, sway and heave each normalized between 0 and 1." loading="lazy" decoding="async" />
  <figcaption>The signal that drives the motors: surge, sway and heave cropped to the in-water window, normalized together to 0–1, with a ten-second fade in and out (top trace) — the reconstruction after the scaling step.</figcaption>
</figure>

## Replaying it through the strings

A second Pico 2 streams that 10 Hz motion to three belt-driven carriages over a custom board I designed in [EasyEDA](https://easyeda.com/) and had fabbed: Pico 2, three [TMC2209](https://www.analog.com/en/products/tmc2209.html) stepper drivers, a microSD slot, and a 24-to-5 V buck. Each carriage is a NEMA 14 stepper on a belt-driven gantry; the mechanics work out to 160 steps/mm (1/32 microstepping on a 20-tooth GT2 belt) over 1100 mm of travel. On boot each axis homes against endstops, centers, then loops the day-long file — linearly interpolating between the 10 Hz samples and converting position into a hardware-PWM step frequency per axis, so three motors move concurrently.

<figure>
  <img src="/images/log/north-sea/motor-schematic.png" alt="The EasyEDA schematic 'Sea Strings v1.1': a Raspberry Pi Pico 2 wired to three Adafruit TMC2209 stepper drivers, a buck converter, and a microSD breakout, with motor and endstop connectors." loading="lazy" decoding="async" />
  <figcaption>The controller schematic (EasyEDA) — one Pico 2 driving three TMC2209 channels, each with its own motor-and-endstop connector, plus the microSD and 24-to-5 V buck.</figcaption>
</figure>

<div class="log-duo">
  <figure>
    <img src="/images/log/north-sea/motor-breadboard.jpg" alt="A breadboard prototype with a Pico, a microSD module, driver breakouts and a tangle of jumper wires." loading="lazy" decoding="async" />
    <figcaption>The motor controller, prototyped on a breadboard first.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/north-sea/pcb-v1.jpg" alt="The fabricated 'North Sea v1' PCB held in hand: a Pico 2, three stepper-driver channels labelled Motor 1 to 3, a buck converter and a microSD header." loading="lazy" decoding="async" />
    <figcaption>The fabbed board: a Pico 2, three stepper channels (Motor 1–3), a 24 V buck and a microSD header.</figcaption>
  </figure>
</div>

Nearly all of the motor tuning exists for one reason: the gallery is quiet. I run the TMC2209 drivers in stealthChop and pin them there — left alone they flip to their louder spreadCycle mode above a speed threshold, so I set that threshold to its maximum and they never do. Microstepping is 1/32, chosen over 1/16 purely for low-speed smoothness (the driver interpolates it to 256 microsteps internally); run current is held low, around half the motor's 2 A rating — just enough to move the belts; the coils freewheel at standstill; and each carriage eases to a stop through a 20 mm soft-deceleration zone at either end. All of it is there to keep the steppers from being heard over the strings. The carriages carry plectra that pluck a field of tuned steel strings — 0.94 mm piano wire, 172 per panel across three panels, about 2,860 ft of wire in all — laid out by a small parametric tool I wrote that generates the laser-cut DXF directly: a single self-contained HTML page, no CAD library, emitting the cut file by hand. ([Interval II](/log/interval-ii/) is the sibling piece that drives strings with motors too, but generatively rather than from recorded data.)

<figure>
  <img src="/images/log/north-sea/parametric-layout.png" alt="A browser tool laying out three plates of vertical strings with tuning pins and hitch pins, a panel of layout parameters on the left, a header reading 516 strings across three columns." loading="lazy" decoding="async" />
  <figcaption>The parametric layout tool I wrote — it positions all 516 strings (172 × 3 panels) and their tuning and hitch pins from a handful of parameters, and emits the laser-cut file directly.</figcaption>
</figure>

<div class="log-duo">
  <figure>
    <img src="/images/log/north-sea/frame-cad.png" alt="A CAD rendering of the steel frame: two long perforated rails top and bottom within a rectangular frame." loading="lazy" decoding="async" />
    <figcaption>The frame in CAD — the perforated rails carry the hole pattern from the layout tool.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/north-sea/frame-mockup.jpg" alt="An early steel frame on a workshop floor, with a perforated rail mounted top and bottom." loading="lazy" decoding="async" />
    <figcaption>An early frame mock-up, with a rail mounted top and bottom.</figcaption>
  </figure>
</div>

<div class="log-duo">
  <figure>
    <img src="/images/log/north-sea/laser-cut-plates.jpg" alt="Four long steel rails laid out, each with a dense row of laser-cut holes following a curved pattern." loading="lazy" decoding="async" />
    <figcaption>The laser-cut rails, straight from the tool's DXF — 172 peg holes per tuning rail, one for every string; the hitch rails carry 86, since the strings hitch in pairs.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/north-sea/tuning-pegs.jpg" alt="Hundreds of zither tuning pegs laid out in groups on a studio floor, bound with red rubber bands." loading="lazy" decoding="async" />
    <figcaption>The 516 tuning pegs, sorted before fitting — one per string.</figcaption>
  </figure>
</div>

<figure>
  <img src="/images/log/north-sea/tension-wall.jpg" alt="Two wall panels backed by black steel box-section frames within timber surrounds, before the front surfaces go on." loading="lazy" decoding="async" />
  <figcaption>The panels are backed by steel frames — the combined string tension is high enough to need the reinforcement.</figcaption>
</figure>

<figure>
  <img src="/images/log/north-sea/stringing.jpg" alt="One string panel mounted on a wall, partway through stringing: a steel tuning rail along the top, a black hitch rail along the bottom, vertical strings strung between them, and a horizontal belt-driven carriage crossing the middle with its motor and wiring to one side." loading="lazy" decoding="async" />
  <figcaption>Stringing a panel by hand, a carriage already mounted across it — the steel tuning rail at the top, the hitch rail at the bottom, every string threaded and brought up to tension one at a time.</figcaption>
</figure>

## Result

The installation loops a single 25-hour recording of the North Sea as durational music.

Documentation of the piece:
