---
title: "Micro Software"
subtitle: "Four non-music tools."
summary: "A roundup of the non-music software I made this month: a violin practice app I use every day, a StreetEasy tracker for apartment hunting, a gallery website, and the site you're reading this on."
updated: "June 2026"
categories: ["Patches & UI", "Data & ML"]
sortOrder: 35
tags: ["software", "web", "python"]
stack: ["Vanilla JS", "Web Audio", "Python", "SQLite", "React", "Cloudflare Workers", "Astro"]
thumb: "/images/log/violin-practice-app/gallery-grid.jpg"
draft: false
---

In the last month or two I've written a lot of software that has nothing to do with music. These are four micro tools I've built for various parts of my life. Quick notes on each.

## Violin Practice

I try to practice violin for 45 minutes a day, more so when a performance is coming up. My practice used to be fairly fluid but lately I've been trying to be more disciplined about it: scales, modal work, some Bach, and structured improvisation. I wanted to both structure the sessions and track them so I'd stay focused over months. So I wrote a small app for it. A year ago this would have been overkill; now it takes less than two hours to get something working, replacing the tuner, metronome, and note-taking apps I'd used for years.

<details class="entry">
<summary><span class="entry-more">more</span><span class="entry-less">show less</span><span class="entry-chev" aria-hidden="true">▾</span></summary>

Here's the quick tour.

The app walks me through the routine one step at a time, each on its own screen. Scales and arpeggios come first, run against a metronome that starts at 60 and nudges me to bump the tempo after a few clean sessions. The key rotates through the circle of fifths, two weeks per tonic, minor one week, the parallel major the next. The full cycle runs about six months. Sitting on top of that is a mode for the day, with a check so I can practice recalling the characteristic degrees from memory. After scales is a rotating chord-scale vamp for practicing improvised mode switching and shifting harmonic context. Then measure-by-measure work on the Bach, followed by free improv that records so I can listen back. A short check-in closes the session.

<div class="phone-row">
  <figure>
    <div class="iphone" style="--bg:#2f6b3b"><img src="/images/log/violin-practice-app/scales-ready.png" alt="The scales screen: G minor, drone tuned to D, metronome at 60 BPM, slurred bowing." loading="lazy" decoding="async" /></div>
    <figcaption>The scales block.</figcaption>
  </figure>
  <figure>
    <div class="iphone" style="--bg:#2f6b3b"><img src="/images/log/violin-practice-app/scales-step.png" alt="Mid-block: broken thirds, two octaves, with a target time counting up." loading="lazy" decoding="async" /></div>
    <figcaption>The times are suggestions, not countdowns.</figcaption>
  </figure>
</div>

The app handles all the bookkeeping around each session by tracking the week's key, rotating the bowing technique, preparing a drone on the right pitch, and giving me a metronome I can tweak. I tap "next" when ready, so spending extra time on an awkward passage is easy and still gets tracked. The wrap-up logs the session and updates a streak and a small feeling/focus chart, which is the part that keeps me honest over a longer stretch.

The drone received the most attention. It's built to be harmonically rich (additive partials tuned to just-intonation ratios, mixing tonic, fifth, and octave like a real tanpura) so I can lock my tuning against it and hear the overtones and beating clearly for intonation work.

Plain HTML, CSS, and JavaScript for the build. No framework, no backend. For a one-person tool anything heavier would be more to maintain. Everything lives on the phone – sessions, recordings, and notes all save locally – so that it runs fully offline on a music stand.

I had a working version in an afternoon and let daily use shape the rest: cutting the onboarding flow, fixing timezone bugs in the streak, teaching it to remember my tempo for each key, and shrinking every screen so all the information fits without scrolling. It now feels like a properly installed app, one that I use every day.

<div class="log-gallery">
  <figure>
    <div class="iphone" style="--bg:#a42453"><img src="/images/log/violin-practice-app/modal.png" alt="The modal block: D phrygian, its mode notes, characteristic tone, implied chord, and a one-line description." loading="lazy" decoding="async" /></div>
    <figcaption>The day's mode, its characteristic tone, the chord it implies, and a one-line use.</figcaption>
  </figure>
  <figure>
    <div class="iphone" style="--bg:#7a4a1f"><img src="/images/log/violin-practice-app/chord-scale.png" alt="The chord-scale block: a looping modal vamp with bars-per-chord pacing and the chord tones." loading="lazy" decoding="async" /></div>
    <figcaption>A looping modal vamp to improvise over, with bars-per-chord pacing.</figcaption>
  </figure>
  <figure>
    <div class="iphone" style="--bg:#c6442b"><img src="/images/log/violin-practice-app/improv.png" alt="The improv block: a single rotating constraint over a 15-minute timer." loading="lazy" decoding="async" /></div>
    <figcaption>A rotating compositional constraint to play against.</figcaption>
  </figure>
  <figure>
    <div class="iphone" style="--bg:#186a6a"><img src="/images/log/violin-practice-app/recording.png" alt="A practice screen mid-recording, the record button now a red stop with a running timer." loading="lazy" decoding="async" /></div>
    <figcaption>Recording captures to disk.</figcaption>
  </figure>
  <figure>
    <div class="iphone" style="--bg:#3a6e2f"><img src="/images/log/violin-practice-app/wrap-up.png" alt="The session wrap-up: feeling and focus rated one to five, a notes field, and save." loading="lazy" decoding="async" /></div>
    <figcaption>Rate feeling and focus, note what to chase next, then save.</figcaption>
  </figure>
  <figure>
    <div class="iphone" style="--bg:#7a4a1f"><img src="/images/log/violin-practice-app/history.png" alt="The history screen: sessions, a streak, a feeling chart, and a dated list of past sessions." loading="lazy" decoding="async" /></div>
    <figcaption>Tracking sessions, streaks, and focus/feel.</figcaption>
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

Apartment hunting in New York! A wonderful activity. I was getting sick of StreetEasy and the skewed promotion-first interface, how much I had to dig for the places I knew I would like. I built a StreetEasy scraper in an hour that pulls listings every day, scores each against what I'm looking for (e.g., windows on 2+ sides of the house), learns from what I save and dismiss, and pulls each building's city records and subway commute to my family and friends. I approve, dismiss, and flag everything from a local web app and my decisions persist so that once a listing is dismissed I don't see it again.

<details class="entry">
<summary><span class="entry-more">more</span><span class="entry-less">show less</span><span class="entry-chev" aria-hidden="true">▾</span></summary>

The scoring works by reading each listing's description and amenities and detecting the things I care about: a separate kitchen, windows on more than one side, in-unit laundry, a dishwasher, prewar bones, outdoor space. It turns these into a 0–100 match score. Everything dedupes into a local SQLite database, so my approvals, notes, and flags persist. Each building geocodes to its tax lot and pulls its last sale, open HPD and DOB violations, complaints, and 311 history from NYC Open Data. Commutes are calculated from the MTA's schedule data.

A pipeline board moves a place from saved to texted to toured to offer; a "teach the model" page surfaces the listings the scorer is least sure about, so rating a handful sharpens every score more than weeks of passive scrolling; an address vault holds buildings I love whether or not they're listed and flags them the instant something opens up there; a trends page reads asking prices by neighborhood week over week so I can see where I have leverage; and a map plots everything by match score. Clicking any listing drafts a broker inquiry I can send in one tap.

<figure class="winshot">
  <img src="/images/log/streeteasy-scraper/list.jpg" alt="The tracker dashboard: rental cards with photos, a match score, price, building details, and the soft-match tags each one earned." loading="lazy" decoding="async" />
  <figcaption>Every listing scored 0–100 and deduped, with the features it matched read straight out of the description.</figcaption>
</figure>

<div class="log-duo">
  <figure>
    <img src="/images/log/streeteasy-scraper/board.jpg" alt="A Kanban pipeline board with Saved, Texted, Received videos, and Toured columns of listing cards." loading="lazy" decoding="async" />
    <figcaption>Drag a place from saved to texted to toured to offer.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/streeteasy-scraper/learn.jpg" alt="The teach-the-model page: listings the scorer is unsure about, each with a match score and feature tags, waiting to be rated." loading="lazy" decoding="async" />
    <figcaption>Teach the model.</figcaption>
  </figure>
</div>

<div class="log-duo">
  <figure>
    <img src="/images/log/streeteasy-scraper/vault.jpg" alt="The address vault: saved buildings with NYC records, notes, and any live listings at that address." loading="lazy" decoding="async" />
    <figcaption>The address vault of buildings I love, in case something opens up.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/streeteasy-scraper/trends.jpg" alt="The market-trends table: median asking rent by neighborhood with a three-week trend." loading="lazy" decoding="async" />
    <figcaption>Market trends.</figcaption>
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

A lightweight website for an art gallery in London that the staff can update without touching code or git repos. Staff edit shows through a password-gated form; a small Cloudflare Worker checks the password and commits the changes straight to the repo, which redeploys the site.

<details class="entry">
<summary><span class="entry-more">more</span><span class="entry-less">show less</span><span class="entry-chev" aria-hidden="true">▾</span></summary>

<figure class="winshot">
  <img src="/images/log/incubator-site/exhibition-jelly-green.jpg" alt="An exhibition page: Jelly Green's Conflagration ii, a fiery abstract painting full-bleed above the show title and a strip of installation views." loading="lazy" decoding="async" />
  <figcaption>Jelly Green's <em>Conflagration ii</em>, with its installation views. Every show is one entry in a single JSON file.</figcaption>
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

This is my art portfolio and engineering log. I work primarily with sound, so I've embedded custom players for video and audio alongside high-def images. Otherwise it's meant to be as simple as possible, like a gallery space.

<details class="entry">
<summary><span class="entry-more">more</span><span class="entry-less">show less</span><span class="entry-chev" aria-hidden="true">▾</span></summary>

<div class="log-duo">
  <figure>
    <img src="/images/log/personal-website/home.jpg" alt="The works index: a single art piece per row, a large installation photo." loading="lazy" decoding="async" />
    <figcaption>The works index.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/personal-website/work-interval.jpg" alt="A work page, Interval II, mid-scroll: the installation shot and a detail shot side by side as the gallery pans." loading="lazy" decoding="async" />
    <figcaption>A work page – the image gallery pans as you scroll.</figcaption>
  </figure>
</div>

<div class="log-duo">
  <figure>
    <img src="/images/log/personal-website/video.jpg" alt="A work page with the custom video player: a play button over the piece's images." loading="lazy" decoding="async" />
    <figcaption>A custom player for the performance videos.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/personal-website/info.jpg" alt="The info page: a bio, a list of shows and exhibitions, and residencies and grants." loading="lazy" decoding="async" />
    <figcaption>The info page.</figcaption>
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

  /* Faux browser window around the desktop screenshots (matches the TutorDash study):
     a chrome bar in the figure's top padding with traffic-light dots. */
  .log-detail-body figure.winshot,
  .log-detail-body .log-duo figure { position: relative; padding-top: 30px; }
  .log-detail-body figure.winshot::before,
  .log-detail-body .log-duo figure::before {
    content: "";
    position: absolute; top: 0; left: 0; right: 0; height: 30px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-bottom: none;
    border-radius: 8px 8px 0 0;
  }
  .log-detail-body figure.winshot::after,
  .log-detail-body .log-duo figure::after {
    content: "";
    position: absolute; top: 11px; left: 12px; width: 38px; height: 8px;
    background:
      radial-gradient(circle at 4px 4px, #ff5f57 3.5px, transparent 4px),
      radial-gradient(circle at 19px 4px, #febc2e 3.5px, transparent 4px),
      radial-gradient(circle at 34px 4px, #28c840 3.5px, transparent 4px);
  }
  .log-detail-body figure.winshot img,
  .log-detail-body .log-duo figure img {
    border: 1px solid var(--color-border);
    border-radius: 0 0 8px 8px;
  }

  /* Faux iPhone — violin screens only. The screenshot is pushed down into a
     status-bar band of the screen's own bg colour (--bg) so the Dynamic Island
     never overlaps the app's top row. %-sized so it scales across the pair and the
     3-up gallery; radii tuned to the framed ~1:2.30 aspect so corners stay round.
     Not scoped to .log-detail-body, so the same frame is reused in the lightbox. */
  .iphone {
    position: relative;
    display: block;
    padding: 3.3%;
    background: #111214;
    border-radius: 15% / 6.8%;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22), inset 0 0 0 1.5px rgba(255, 255, 255, 0.06);
  }
  .iphone img {
    box-sizing: border-box;
    display: block;
    width: 100%;
    padding: 6% 0;
    background: var(--bg, #111214);
    border-radius: 11.5% / 5%;
  }
  .log-detail-body .iphone img, .iphone-lightbox .iphone img { border: none; }
  .iphone::before {
    content: "";
    position: absolute;
    top: 1.7%;
    left: 50%;
    transform: translateX(-50%);
    width: 18%;
    aspect-ratio: 5 / 1.5;
    background: #000;
    border-radius: 999px;
    z-index: 2;
    pointer-events: none;
  }
  /* Click a violin screen → enlarge it inside its iPhone frame. */
  .iphone-lightbox {
    position: fixed; inset: 0; z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    padding: 4vmin;
    background: rgba(12, 12, 14, 0.85);
    cursor: zoom-out;
    opacity: 0; transition: opacity 0.18s ease;
  }
  .iphone-lightbox.is-open { opacity: 1; }
  /* In the overlay the bezel can't be a % (that resolves against the full-screen
     container, not the phone) — pin it to the phone's own viewport-based width. */
  .iphone-lightbox .iphone { width: min(34vh, 82vw); padding: min(1.1vh, 2.7vw); box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.55); }
  @media (prefers-reduced-motion: reduce) { .iphone-lightbox { transition: none; } }
</style>

<script>
  // Click a violin screen → open it enlarged in its iPhone frame. Runs in the
  // capture phase and stops propagation so the article's default (bare-image)
  // lightbox never fires for these shots.
  (() => {
    let overlay = null;
    const close = () => { if (overlay) { overlay.remove(); overlay = null; document.removeEventListener('keydown', onKey); } };
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('click', (e) => {
      const img = e.target.closest && e.target.closest('.log-detail-body .iphone > img');
      if (!img) return;
      e.stopPropagation();
      e.preventDefault();
      close();
      overlay = document.createElement('div');
      overlay.className = 'iphone-lightbox';
      const frame = document.createElement('div');
      frame.className = 'iphone';
      const inline = img.closest('.iphone').getAttribute('style');
      if (inline) frame.setAttribute('style', inline);
      const big = document.createElement('img');
      big.src = img.currentSrc || img.src;
      big.alt = img.alt || '';
      frame.appendChild(big);
      overlay.appendChild(frame);
      overlay.addEventListener('click', close);
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('is-open'));
      document.addEventListener('keydown', onKey);
    }, true);
  })();
</script>
