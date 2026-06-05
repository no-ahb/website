---
title: "ANTIPHON"
subtitle: "Composition via multidimensional timbral traversal"
summary: "300,000 timbral windows from a string quintet and an orchestra of objects, mapped with UMAP and composed into a 14-channel piece by a SuperCollider engine that navigates it."
updated: "March 2026"
category: "Data & ML"
sortOrder: 30
tags: ["ml", "audio", "generative", "data"]
stack: ["SuperCollider", "Python", "librosa / numpy", "UMAP", "Flask", "Plotly WebGL", "REAPER"]
project: "/works/antiphon/"
thumb: "/images/log/antiphon/explorer-hero.png"
audioFiles:
  - src: "/audio/antiphon.mp3"
    note: "Stereo reduction of the full 14-channel piece — the generative engine walking the timbral map."
draft: false
---

I recorded a string quintet, playing through an "orchestra of objects" — cymbals, gongs, piano frames, sheets of metal and paper — with extended-range microphones that capture well above the limit of human hearing.

I then analyzed and mapped those recordings and wrote a program to traverse the map with 14 paired-yet-distinct voices for a fourteen-speaker room. It was shown at the [Haus für Medienkunst](https://hausmedienkunst.de/en/) in Oldenburg from March through May 2026, alongside [Suspension](/log/suspension/) and [FUNDAMENTAL](/works/fundamental/).

## Recording the corpus

The source is a session at [Studio Richter Mahr](https://studiorichtermahr.com/) in September 2025: a string quintet and an "orchestra of objects," captured at 192 kHz. Chris Kalcov was enormously helpful in engineering an immaculate close-and-far-miked re-amping system for over 32 channels on a Neve 5088 (RME Horus / MADI), at the limits of what the equipment and the room could handle. I recorded with four friends (Kirke, Caius, Amanda, and Evie) and played violin myself.

We recorded 10 hours over the course of 2 days — around 700 GB of audio. At night, Chris let the recordings from each day play back through the objects and re-recorded the result.

Every source had its own perspective, and most had several at once. The instruments were close-miked with extended-HF Schoeps capsules (the "XT" tracks) and Coles 4038 ribbons; the bass with a Sennheiser MKH 800; the room with a Schoeps pair, a DPA 4006A, and an AEA R84 ribbon; the objects with Schoeps, a Neumann M49, and a Sennheiser MKH 20 on the bass drum. At 192 kHz the files reach to 96 kHz, and the extended-HF capsules carry real content to roughly 40–80 kHz — well past the ~20 kHz limit of hearing.

<figure>
  <img src="/images/log/antiphon/control-room.jpg" alt="A large-format mixing console in a wood-panelled control room, the live room visible through the glass." loading="lazy" decoding="async" />
  <figcaption>The control room.</figcaption>
</figure>

<div class="log-grid log-grid-2-3">
  <figure>
    <img src="/images/log/antiphon/recording-materials.jpg" alt="Sheets of metal, wood, brass and copper hung from a bar, each with a microphone pointed at it." loading="lazy" decoding="async" />
    <figcaption>Sheets of metal, wood, brass, copper and paper, hung and miked individually.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/antiphon/objects-percussion.jpg" alt="A bass drum, gong and cymbals on stands, a transducer puck resting on the drum head." loading="lazy" decoding="async" />
    <figcaption>A bass drum, gong and cymbals, fitted with transducers.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/antiphon/live-room.jpg" alt="The live room: microphones, headphones on stands, a reed organ against the wall, the control-room window behind." loading="lazy" decoding="async" />
    <figcaption>The live room.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/antiphon/tunings-note.jpg" alt="A torn scrap of paper with two written tunings: G C F B-flat E-flat, and C G D A E." loading="lazy" decoding="async" />
    <figcaption>Two of the session's tunings, on a torn scrap of paper: stacked fourths and fifths.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/antiphon/quintet-tracking.jpg" alt="A string quintet — violin, double bass and cellos — tracking in a wood-panelled live room ringed with microphones." loading="lazy" decoding="async" />
    <figcaption>The quintet.</figcaption>
  </figure>
</div>

The instructions for the session were broad and open, relying on the improvisatory intuition of players from classical, free-jazz, noise, and traditional-folk backgrounds.

Some of the reamps were sine sweeps, which I later deconvolved into impulse responses — each object as a measured filter (steel, brass, paper, ply, the thunder-sheet, the piano, the cymbals) that I could convolve other sounds through.

## Why Traverse?

The corpus was large: **1,615 files**, many of them long reamp passes — several 45 to 95 minutes. And the material I cared most about was ultrasonic, which meant slowing the audio to a quarter speed to bring it into the audible range, quadrupling the running time.

Trying to build systematically, take by take, was hopeless, so instead I used the recordings as *raw material*, thinking of it almost like sculpture. In contrast to my installation work, which finds sound at the end of a long road of trial and error, this began with sound, structured by subtraction, layering, and transposition.

I decided to navigate by *timbre*, creating a systematic yet unpredictable way of moving through the multidimensional space of the corpus. Each speaker would be a "voice" — a different perspective on the material. So you might expect that the mic recording the brass sheet would be timbrally very similar to the same take through the steel sheet, or through a cymbal: speaker 1 brass, speaker 2 steel. But then maybe a totally different recording through the paper turns out to sit right next to the bass drum — and we start to bridge and fracture through the material in an interesting, web-like way.

## Approach

First, I analyzed the material. I sliced the corpus into **303,799 five-second windows** (2.5-second hop) and extracted **34 descriptive features** per window — spectral centroid, flatness, flux, contrast and rolloff; pitch and a custom pitch-confidence; 13 [MFCCs](https://en.wikipedia.org/wiki/Mel-frequency_cepstrum); a 20–75 Hz "roughness" measure; and an ultrasonic-energy ratio computed at the native sample rate. The augmentation pass ran about 12 hours.

A separate rule-based pass flagged the windows that were really between-take talking — count-ins, discussion — so the map wouldn't fill up with speech (about 3.8% of windows, caught from the features alone, no re-listening).

Everything was recorded at 192 kHz, and 72% of the files carried real content above 20 kHz; the ultrasonic-energy ratio lets the map pull that material out on its own.

<figure>
  <img src="/images/log/antiphon/ultrasonic-rx.jpg" alt="An iZotope RX spectrogram of a take, with energy extending to the very top of the frequency axis, above 20 kHz." loading="lazy" decoding="async" />
  <figcaption>A take in iZotope RX — energy runs to the top of the captured spectrum, past 20 kHz. That ultrasonic band (and the beautiful, ladder-like consistency of a string instrument's harmonics) is precisely what I was aiming to record.</figcaption>
</figure>

To make that 34-dimensional space walkable, I used [UMAP](https://umap-learn.readthedocs.io/), which collapses those features to a 2-D map you can look at. I fit UMAP on a stratified **100k subsample** and `.transform()`-ed the remaining 203k onto it (`n_neighbors=15, min_dist=0.05`). Color the result by recording layer, roughness, or ultrasonic content and the structure of the sessions looks like splashes of paint or vapor:

<div class="log-duo">
  <figure>
    <img src="/images/log/antiphon/umap-windows-by-layer.png" alt="A UMAP scatter plot of 300,000 points, colored by recording layer, forming distinct timbral regions." loading="lazy" decoding="async" />
    <figcaption>303,799 windows projected to 2-D, colored by layer (reamp, transduced object, room, ribbon…). Similar timbres land near each other, so moving through the map is moving through sound.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/antiphon/umap-windows-by-ultrasonic.png" alt="The same UMAP map colored by ultrasonic energy, with the ultrasonic-rich windows forming their own region." loading="lazy" decoding="async" />
    <figcaption>The same map by ultrasonic energy — the takes caught by the extended-HF mics form their own territory.</figcaption>
  </figure>
</div>

## The explorer

A [Flask](https://flask.palletsprojects.com/) backend serves the UMAP coordinates to a [Plotly](https://plotly.com/javascript/) WebGL `scattergl` front-end that renders all 300k points at interactive framerates. Click any point and it streams that 5-second window back, decimated on the fly with `scipy`. Lasso-select a region to summarize and export it. The archive becomes something you explore by ear. (A separate binary export of the same coordinates feeds the SuperCollider engine.)

<div class="log-grid">
  <figure>
    <img src="/images/log/antiphon/explorer-lasso.png" alt="The Timbral Explorer web app: all 303,799 windows as a UMAP scatter colored by layer, with a freeform lasso drawn around a central region; a side panel reads 'Lasso Selection — Points: 174,789' and a tooltip labels one window 'noisy, bright · Metal · G · Sheet · reamp_04'." loading="lazy" decoding="async" />
    <figcaption>The explorer, all 303,799 windows colored by layer. Filter by instrument group or character, recolor by any feature, click a point to hear its five seconds, or lasso a region — here, 174,789 windows — to summarize and export.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/antiphon/explorer-zoom.jpg" alt="A zoomed-in region of the windows map, the individual points resolving into colored striations of recording layers." loading="lazy" decoding="async" />
    <figcaption>Zoomed in, the points resolve into striations — each take's many perspectives strung across the space.</figcaption>
  </figure>
</div>

<figure>
  <img src="/images/log/antiphon/umap-windows-by-roughness.png" alt="The same UMAP map colored by a roughness feature, showing a smooth gradient across the space." loading="lazy" decoding="async" />
  <figcaption>The same map by roughness (20–75 Hz amplitude modulation). Roughness and the ultrasonic ratio separated the interesting regions far better than pitch did.</figcaption>
</figure>

## The engine

Once I had a feel for the map, I wrote a generative engine to play it back — about 4,000 lines of [SuperCollider](https://supercollider.github.io/), specific to the fourteen-speaker room at the Haus für Medienkunst. It went through four rewrites; the short version of what it became is a continuous **drone** that navigates the map, with pre-composed **sketches** that surface out of it and dissolve back in. The drone is the ocean; the sketches are waves.

A cursor drifts across the map by filtered Brownian motion, with a drift speed (from calm to storm), a range (stay local or roam), a path smoothness, and a "gravity" that pulls toward dense regions; every step pulls new five-second windows to play across the speakers. Each window plays at three speeds at once, which I think of as magnifications: at 1× you hear music, at half speed it becomes texture, at quarter speed it becomes grain and the sound of the recording chain itself — and the ultrasonics I'd recorded fold down into hearing.

The engine listens back to itself: a small analysis synth taps its own output, splits it into six bands, and reports the spectral centroid and spread back to the language — so it knows what it is *actually* doing, not just what it asked for:

```supercollider
sig   = In.ar(in, 2).sum * 0.5;        // tap the engine's own master output
bands = [ BPF.ar(sig, 40, 1.5), BPF.ar(sig, 155, 1.4), BPF.ar(sig, 548, 1.3),
          BPF.ar(sig, 1732, 1.15), BPF.ar(sig, 4899, 1.02), BPF.ar(sig, 12000, 0.83) ];
amps  = bands.collect { |b| Amplitude.kr(b, attackTime, releaseTime) };
amps.do { |amp, i| Out.kr(analysisOut + i, amp) };   // → control buses the language reads
```

That readout drives a homeostasis loop: each voice is nudged up or down toward a target balance across the bands, so the field never collapses into all-bass or all-hiss on its own.

When the engine wants a chord, it doesn't pitch-shift the playing voices; it spawns new "ghost" voices at just-intonation ratios that fade in, dwell, and fade back out — arriving faster than they leave, so a fifth seems to emerge from the beating of two near-unisons and then reluctantly dissolves.

I ended up choosing the drone material by hand. I'd first tried having the engine pick it automatically from the features, and for this corpus that was fundamentally broken — what sounds good as a drone is a compositional judgment, not an acoustic measurement. So the engine still navigates with UMAP, but only *within* a hand-approved pool of 26 takes.

Most of the real work was in the failures. A 192 kHz corpus played on a 48 kHz server aliased every voice into hiss, so I resampled the whole pool into matched 48k/96k/192k copies and let each speed layer play at its native rate. A rule meant to stop the cursor jumping around inside a file had the opposite emergent effect — the engine once held a single take for 38 minutes straight. And SuperCollider quietly taught me that the string `"true"` is not boolean `true`, which is why three manifest features silently never fired for a week.

<figure>
  <img src="/images/log/antiphon/srm-engine-v4.png" alt="A dark control-panel GUI for the generative engine, with movement, speed-layer, coupling, and spectral-reading panels." loading="lazy" decoding="async" />
  <figcaption>A later revision of the engine — movement, speed-layer magnification, per-speaker coupling, and a live spectral-role readout driving how it moves through the map.</figcaption>
</figure>

In the end, I found the map too unpredictable to trust for an unattended two-month run. It had long stretches of uninspired wandering — doubling back, lingering in place — interspersed with flashes of brilliance that felt like musical genius. So I recorded long passes of the engine running, listened for about two days, curated the 5–8 minute chunks I particularly liked, and reassembled them in REAPER with a few pre-composed chordal sequences from the sessions. It ends up as a hybrid of machine and human composition.

<figure>
  <img src="/images/log/antiphon/srm-night.jpg" alt="Studio Richter Mahr at night — lit windows spelling S R M in a dark facade, reflected in a puddle." loading="lazy" decoding="async" />
  <figcaption>Studio Richter Mahr at night.</figcaption>
</figure>
