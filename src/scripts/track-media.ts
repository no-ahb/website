// Shared client-side media analytics + video-facade activation.
//
// Replaces what were several near-identical inline copies of the same watch-time
// logic (works detail page, scoring page, AudioPlayer — and, once it adopts this,
// the /log LogArticle). Imported from processed <script> blocks, so Astro bundles
// it once per page regardless of how many consumers import it.

type Payload = Record<string, string | number | undefined>;

const track = (event: string, props: Payload) =>
  (window as unknown as { umami?: { track?: (e: string, p: Payload) => void } })
    .umami?.track?.(event, props);

/**
 * Track watch/listen time on a media element and fire a single umami `endEvent`
 * (e.g. 'video-end' / 'audio-end') once playback passes 3s.
 *
 * Re-anchors on every `play` so a missed `pause` (tab throttling, element teardown)
 * can't leave a stale timestamp that inflates the next segment; reported `seconds`
 * are clamped to the clip duration. Pass `playEvent` to also fire a one-time
 * "started playing" event on first play.
 */
export function trackMediaWatch(
  media: HTMLMediaElement,
  endEvent: string,
  payload: Payload,
  playEvent?: string,
): void {
  let startedAt = 0;
  let totalMs = 0;
  let ended = false;
  let playFired = false;

  const markPlay = () => {
    startedAt = Date.now();
    if (playEvent && !playFired) {
      playFired = true;
      track(playEvent, payload);
    }
  };
  const markStop = () => {
    if (startedAt !== 0) {
      totalMs += Date.now() - startedAt;
      startedAt = 0;
    }
  };
  const fire = (reason: string) => {
    if (ended) return;
    markStop();
    if (totalMs < 3000) return;
    ended = true;
    const dur = media.duration || 0;
    const seconds = dur ? Math.min(Math.round(totalMs / 1000), Math.round(dur)) : Math.round(totalMs / 1000);
    const pct = dur ? Math.min(100, Math.round((totalMs / 1000 / dur) * 100)) : 0;
    track(endEvent, { ...payload, seconds, pct, reason });
  };

  media.addEventListener('play', markPlay);
  media.addEventListener('pause', markStop);
  media.addEventListener('ended', () => fire('ended'));
  window.addEventListener('pagehide', () => fire('leave'), { once: true });
}

/**
 * Activate every `.video-facade` poster button on the page (emitted by
 * VideoEmbed.astro): on click, replace the button with the real local <video>
 * or YouTube <iframe>, and start watch tracking for local videos. Idempotent
 * per button, so it's safe even if called more than once.
 */
export function initVideoFacades(): void {
  document.querySelectorAll<HTMLButtonElement>('.video-facade').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.activated) return;
      btn.dataset.activated = '1';
      const local = btn.getAttribute('data-local-src');
      const yt = btn.getAttribute('data-yt-src');
      const work = btn.getAttribute('data-umami-event-work') || '';
      const label = btn.getAttribute('aria-label') || '';
      if (local) {
        const v = document.createElement('video');
        v.src = local;
        v.controls = true;
        v.autoplay = true;
        v.playsInline = true;
        v.preload = 'metadata';
        v.title = label;
        btn.replaceWith(v);
        v.play?.().catch(() => {});
        trackMediaWatch(v, 'video-end', { work, src: local });
      } else if (yt) {
        const iframe = document.createElement('iframe');
        iframe.src = yt;
        iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; gyroscope; accelerometer');
        iframe.setAttribute('allowfullscreen', '');
        iframe.title = label;
        btn.replaceWith(iframe);
      }
    });
  });
}
