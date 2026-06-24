---
title: "Micro Software"
subtitle: "Four bits of software, none of them music"
summary: "A roundup of the non-music software I made this month: a violin practice app I use every day, a StreetEasy tracker for apartment hunting, a gallery website, and the site you're reading this on."
updated: "June 2026"
categories: ["Patches & UI", "Data & ML"]
sortOrder: 35
tags: ["software", "web", "python"]
stack: ["Vanilla JS", "Web Audio", "Python", "SQLite", "React", "Cloudflare Workers", "Astro"]
thumb: "/images/log/violin-practice-app/scales-ready.png"
draft: false
---

The last month or two I've written a lot of software that has nothing to do with music. These are four micro tools I've built for various parts of my life, all things I use every day. Quick notes on each.

## Violin Practice

I try to practice violin for 45 minutes a day, five days a week, more so when a performance is coming up. My practice used to be fairly fluid but lately I've been trying to be more disciplined about it: scales, modal work, some Bach, and structured improvisation. I wanted a way to both structure those sessions and track them so I'd stay focused over months. So I wrote a small app for it. A year ago this would have been totally overkill. Now it takes less than two hours to get a working framework (tracking, recording, metronome, tuning drones, streaks, metrics, a clean and colorful UI), replacing the separate tuner, metronome, and note-taking apps I'd used for years.

<details class="entry">
<summary><span class="entry-more">more</span><span class="entry-less">show less</span><span class="entry-chev" aria-hidden="true">▾</span></summary>

Here's the quick tour.

The app walks me through the routine one block at a time, each on its own screen. Scales and arpeggios come first, run against a metronome that starts at 60 and nudges me to bump the tempo after a few clean sessions. The key rotates through the circle of fifths, two weeks per tonic, minor one week, the parallel major the next. The full cycle runs about six months. Sitting on top of that is a mode for the day, with a check so I can practice recalling the characteristic degrees from memory. After scales is a rotating chord-scale vamp for practicing improvised mode switching and shifting harmonic context. Then measure-by-measure work on the Bach, followed by free improv that records so I can listen back. A short check-in closes the session.

<div class="phone-row">
  <figure>
    <img src="/images/log/violin-practice-app/scales-ready.png" alt="The scales screen: G minor, drone tuned to D, metronome at 60 BPM, slurred bowing." loading="lazy" decoding="async" />
    <figcaption>The scales block – it sets the week's key, tunes the drone, picks the bowing, and runs the metronome. You just play.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/violin-practice-app/scales-step.png" alt="Mid-block: broken thirds, two octaves, with a target time counting up." loading="lazy" decoding="async" />
    <figcaption>Mid-block. The times are suggestions, not countdowns – I move on when I'm ready.</figcaption>
  </figure>
</div>

The app handles all the bookkeeping around each session by tracking the week's key, rotating the bowing technique, preparing a drone on the right pitch, and giving me a metronome I can tweak. I tap "next" when I'm ready, so spending extra time on an awkward passage is easy and still gets tracked. The wrap-up logs the session and updates a streak and a small feeling/focus chart, which is the part that keeps me honest over a longer stretch.

The drone received the most attention in the app. It's built to be harmonically rich (additive partials tuned to just-intonation ratios, mixing tonic, fifth, and octave like a real tanpura) so I can lock my tuning against it and hear the overtones and beating clearly for intonation work.

Plain HTML, CSS, and JavaScript for the build. No framework, no backend. For a one-person tool anything heavier would be more to maintain. Everything lives on the phone – sessions, recordings, and notes all save locally – so that it runs fully offline on a music stand.

I had a working version in an afternoon and let daily use shape the rest: cutting the onboarding flow, fixing timezone bugs in the streak, teaching it to remember my tempo for each key, and shrinking every screen so all the information fits without scrolling. It now feels like a properly installed app, one that I use every day.

<div class="log-gallery">
  <figure>
    <img src="/images/log/violin-practice-app/modal.png" alt="The modal block: D phrygian, its mode notes, characteristic tone, implied chord, and a one-line description." loading="lazy" decoding="async" />
    <figcaption>Modes – the day's mode, its characteristic tone, the chord it implies, and a one-line use.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/violin-practice-app/chord-scale.png" alt="The chord-scale block: a looping modal vamp with bars-per-chord pacing and the chord tones." loading="lazy" decoding="async" />
    <figcaption>Chord-scale – a looping modal vamp to improvise over, with bars-per-chord pacing.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/violin-practice-app/improv.png" alt="The improv block: a single rotating constraint over a 15-minute timer, with a rotate-constraint button." loading="lazy" decoding="async" />
    <figcaption>Improv – a rotating compositional constraint to play against.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/violin-practice-app/recording.png" alt="A practice screen mid-recording, the record button now a red stop with a running timer." loading="lazy" decoding="async" />
    <figcaption>Recording – any block captures to disk with one tap.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/violin-practice-app/wrap-up.png" alt="The session wrap-up: feeling and focus rated one to five, a notes field, tags, and save." loading="lazy" decoding="async" />
    <figcaption>The check-in – rate feeling and focus, note what to chase next, then save.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/violin-practice-app/history.png" alt="The history screen: sessions, a streak, a feeling chart, and a dated list of past sessions." loading="lazy" decoding="async" />
    <figcaption>Tracking – every session, the streak, and a feeling chart.</figcaption>
  </figure>
</div>

<ul class="log-stack">
  <li>Vanilla JS</li>
  <li>Web Audio API</li>
  <li>IndexedDB</li>
  <li>Service Worker</li>
  <li>VexFlow</li>
  <li>MediaRecorder</li>
  <li>PWA</li>
</ul>

[Live demo ↗](https://no-ahb.github.io/violin-practice/) [Source ↗](https://github.com/no-ahb/violin-practice)

</details>

---

## StreetEasy Tracker

Apartment hunting in New York is miserable, and it's really a data problem in disguise, so I turned it into one. It scrapes StreetEasy every day, scores every listing against what I actually want, learns from what I save and dismiss, and pulls each building's real city records and subway commute. I approve, dismiss, and flag everything from a local web app. It's all pure Python with no dependencies, about two thousand listings deep.

<details class="entry">
<summary><span class="entry-more">more</span><span class="entry-less">show less</span><span class="entry-chev" aria-hidden="true">▾</span></summary>

The scoring is the core. It reads each listing's description and amenities and detects the things I care about – a separate kitchen, windows on more than one side, in-unit laundry, a dishwasher, prewar bones, outdoor space – and turns them into a 0–100 match score, with the hard limits (price cap, no studios) enforced locally because the source applies them loosely. Everything dedupes into a local SQLite database, so my approvals, notes, and flags survive every re-scrape. Each building geocodes to its tax lot and pulls its last sale, open HPD and DOB violations, complaints, and 311 history from NYC Open Data, and the commute is the real subway trip worked out from the MTA's schedule data, not straight-line distance.

Most of the fun is the workflow on top. A pipeline board moves a place from saved to texted to toured to offer; a "teach the model" page surfaces the listings the scorer is least sure about, so rating a handful sharpens every score more than weeks of passive scrolling; an address vault holds buildings I love whether or not they're listed and flags them the instant something opens up there; a trends page reads asking prices by neighborhood week over week so I can see where I have leverage; and a map plots everything by match score. Clicking any listing drafts a broker inquiry I can send in one tap.

<figure>
  <img src="/images/log/streeteasy-scraper/list.png" alt="The tracker dashboard: rental cards with photos, a match score, price, building details, and the soft-match tags each one earned." loading="lazy" decoding="async" />
  <figcaption>The dashboard – every listing scored 0–100 and deduped, with the features it matched read straight out of the description.</figcaption>
</figure>

<div class="log-duo">
  <figure>
    <img src="/images/log/streeteasy-scraper/board.png" alt="A Kanban pipeline board with Saved, Texted, Received videos, and Toured columns of listing cards." loading="lazy" decoding="async" />
    <figcaption>The pipeline board – drag a place from saved to texted to toured to offer.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/streeteasy-scraper/learn.png" alt="The teach-the-model page: three listings the scorer is unsure about, each with a match score and feature tags, waiting to be rated." loading="lazy" decoding="async" />
    <figcaption>Teach the model – it surfaces the listings it's least sure about; rating a few sharpens every score.</figcaption>
  </figure>
</div>

<div class="log-duo">
  <figure>
    <img src="/images/log/streeteasy-scraper/vault.png" alt="The address vault: saved buildings with NYC records, notes, and any live listings at that address." loading="lazy" decoding="async" />
    <figcaption>The address vault – buildings I love, saved with their NYC records, flagged the moment something opens up there.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/streeteasy-scraper/trends.png" alt="The market-trends table: median asking rent by neighborhood with a three-week trend." loading="lazy" decoding="async" />
    <figcaption>Market trends – asking prices by neighborhood, week over week, so I can read where I have leverage.</figcaption>
  </figure>
</div>

<ul class="log-stack">
  <li>Python (stdlib only)</li>
  <li>SQLite</li>
  <li>Apify</li>
  <li>NYC Open Data (Socrata)</li>
  <li>MTA GTFS</li>
  <li>ThreadingHTTPServer</li>
</ul>

</details>

---

## Incubator

A website for an art gallery in London that the staff need to keep updated forever without ever touching code. So there's no build step at all – it's React compiled in the browser – and all the content lives in one JSON file. Staff edit shows through a password-gated form; a small Cloudflare Worker checks the password and commits the changes straight to the repo, which redeploys the site. Cheap to host, no dependency tree to rot, nothing for me to maintain.

<details class="entry">
<summary><span class="entry-more">more</span><span class="entry-less">show less</span><span class="entry-chev" aria-hidden="true">▾</span></summary>

<figure>
  <img src="/images/log/incubator-site/exhibition-jelly-green.jpg" alt="An exhibition page: Jelly Green's Conflagration ii, a fiery abstract painting full-bleed above the show title and a strip of installation views." loading="lazy" decoding="async" />
  <figcaption>An exhibition page – Jelly Green's <em>Conflagration ii</em>. Every show is one entry in a single JSON file.</figcaption>
</figure>

<div class="log-duo">
  <figure>
    <img src="/images/log/incubator-site/exhibition-yuma-radne.jpg" alt="An exhibition page: Yuma Radne's Playing with Hands, a colorful figurative painting of hands meeting." loading="lazy" decoding="async" />
    <figcaption>Yuma Radne, <em>Playing with Hands</em>.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/incubator-site/exhibition-harry-grundy.jpg" alt="An exhibition page: Harry Grundy's FULL PELT, a sculptural work in wood and green panels." loading="lazy" decoding="async" />
    <figcaption>Harry Grundy, <em>FULL PELT</em> – one of 61 shows, each its own page.</figcaption>
  </figure>
</div>

<ul class="log-stack">
  <li>React 18 (UMD)</li>
  <li>Babel Standalone</li>
  <li>Cloudflare Workers</li>
  <li>GitHub Pages</li>
  <li>JSON content store</li>
</ul>

[Live site ↗](https://no-ahb.github.io/incubator-site/)

</details>

---

## Personal Website

The one you're reading. It's really my art portfolio with this engineering log bolted on, and the two are the same thing underneath – a work page and a log entry are the same shape, so they share one renderer and two schemas that overlap on purpose. The works pages are where the motion is: each piece plays a video preview on hover, full performance videos stream on click, and a long strip of images scrolls on its own as a pure CSS animation running on the compositor, so it pans without ever touching the main thread or stuttering. It's static [Astro](https://astro.build/) with no client framework; adding a piece or a post is just writing a markdown file like this one.

<details class="entry">
<summary><span class="entry-more">more</span><span class="entry-less">show less</span><span class="entry-chev" aria-hidden="true">▾</span></summary>

<div class="log-duo">
  <figure>
    <img src="/images/log/personal-website/home.png" alt="The works index: a single art piece per row, a large installation photo of Suspension." loading="lazy" decoding="async" />
    <figcaption>The works index – the art portfolio, one piece per row.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/personal-website/work-detail.png" alt="A work page: Antiphon, a 16-channel audio installation, shown as a dark full-width still above the scrolling gallery." loading="lazy" decoding="async" />
    <figcaption>A work page – stills and full performance video, over a gallery that scrolls on its own.</figcaption>
  </figure>
</div>

<ul class="log-stack">
  <li>Astro 5</li>
  <li>Content Collections</li>
  <li>Zod</li>
  <li>Sharp</li>
  <li>music-metadata</li>
  <li>GitHub Pages</li>
</ul>

</details>

<style>
  .log-detail-body details.entry { margin: 0; }
  .log-detail-body details.entry > summary {
    display: inline-flex;
    align-items: center;
    gap: 0.35em;
    width: max-content;
    cursor: pointer;
    list-style: none;
    user-select: none;
    font-size: 0.7rem;
    letter-spacing: 0.02em;
    text-transform: lowercase;
    color: #000;
    border: 1px solid rgba(0, 0, 0, 0.28);
    border-radius: 999px;
    padding: 0.22rem 0.62rem;
    line-height: 1;
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .log-detail-body details.entry > summary::-webkit-details-marker { display: none; }
  .log-detail-body details.entry > summary::marker { content: ""; }
  .log-detail-body details.entry > summary:hover { background: var(--color-surface); border-color: #000; }
  .log-detail-body details.entry[open] > summary { margin-bottom: 1.4rem; }
  .log-detail-body details.entry .entry-less { display: none; }
  .log-detail-body details.entry[open] .entry-more { display: none; }
  .log-detail-body details.entry[open] .entry-less { display: inline; }
  .log-detail-body details.entry .entry-chev { font-size: 0.85em; line-height: 1; transition: transform 0.18s ease; }
  .log-detail-body details.entry[open] .entry-chev { transform: rotate(180deg); }
  .log-detail-body hr {
    border: 0;
    border-top: 1px solid var(--color-rule);
    margin: 2.75rem 0;
  }
  .log-panel .log-detail-body hr { margin-left: -2.5rem; }
</style>
