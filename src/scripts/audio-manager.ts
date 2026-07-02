// Site-wide audio singleton. With the ClientRouter, this module's JS realm survives
// client-side navigation, so the one <audio> element here keeps playing while pages
// swap around it. Player UIs (AudioPlayer, the mini-player in Base) are re-rendered
// per page and re-bind to this state on astro:page-load; they all listen for the
// 'nb:audio' document event, which fires on any playback state change.
//
// The WebAudio tap exists for the favicon: while something plays, an AnalyserNode
// exposes the live waveform (see the favicon script in Base). The graph is built
// lazily inside the first play() call — a user gesture — so autoplay policy never
// leaves the context suspended.

export type TrackMeta = {
  src: string;
  title: string;
  work: string;
  clip?: string;
  /** Page the piece lives on (where play was pressed) — the mini-player's title links here. */
  href?: string;
  /** Sparse bar-waveform path for the mini-player (from the inline player's data attribute). */
  waveMini?: string;
};

let audio: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let meta: TrackMeta | null = null;
let started = false;          // a track has actually begun playing this visit

// Listen-time analytics (moved here from AudioPlayer so totals survive navigation).
let trackedPlay = false;
let playStartedAt = 0;
let totalMs = 0;
let durationFired = false;

const emit = () => document.dispatchEvent(new CustomEvent('nb:audio'));

function markPlay() { if (playStartedAt === 0) playStartedAt = Date.now(); }
function markStop() {
  if (playStartedAt !== 0) {
    totalMs += Date.now() - playStartedAt;
    playStartedAt = 0;
  }
}
function fireDuration(reason: string) {
  if (durationFired || !meta) return;
  markStop();
  if (totalMs < 3000) return;
  durationFired = true;
  const dur = audio?.duration || 0;
  const seconds = Math.round(totalMs / 1000);
  const pct = dur ? Math.min(100, Math.round((totalMs / 1000 / dur) * 100)) : 0;
  (window as any).umami?.track?.('audio-end', { work: meta.work, clip: meta.clip, title: meta.title, seconds, pct, reason });
}

function ensureAudio(): HTMLAudioElement {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = 'metadata';
  audio.addEventListener('play', () => { started = true; markPlay(); emit(); });
  audio.addEventListener('pause', () => { markStop(); emit(); });
  audio.addEventListener('ended', () => { fireDuration('ended'); emit(); });
  audio.addEventListener('timeupdate', emit);
  audio.addEventListener('loadedmetadata', emit);
  window.addEventListener('pagehide', () => fireDuration('leave'));
  return audio;
}

function ensureGraph() {
  if (ctx || !audio) return;
  try {
    ctx = new AudioContext();
    const srcNode = ctx.createMediaElementSource(audio);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.6;
    srcNode.connect(analyser);
    analyser.connect(ctx.destination);
  } catch {
    ctx = null;
    analyser = null;
  }
}

export const nbAudio = {
  get meta() { return meta; },
  get analyser() { return analyser; },
  get el() { return audio; },
  get started() { return started; },
  get playing() { return !!audio && !audio.paused && !audio.ended; },
  get ended() { return !!audio && audio.ended; },

  /** Start (or restart) a track. Switching tracks closes out the old one's analytics. */
  play(next: TrackMeta) {
    const a = ensureAudio();
    if (meta?.src !== next.src) {
      if (meta) fireDuration('switch');
      meta = next;
      trackedPlay = false;
      totalMs = 0;
      durationFired = false;
      a.src = next.src;
    }
    ensureGraph();
    ctx?.resume?.().catch(() => {});
    a.play().then(() => {
      if (!trackedPlay) {
        trackedPlay = true;
        (window as any).umami?.track?.('audio-play', { work: next.work, clip: next.clip, title: next.title });
      }
    }).catch(() => {});
    emit();
  },

  toggle() {
    if (!audio || !meta) return;
    if (audio.paused) {
      ctx?.resume?.().catch(() => {});
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  },

  /** Dismiss: close out analytics, stop playback, and clear the session (hides the mini-player). */
  stop(reason = 'dismiss') {
    if (!audio || !meta) return;
    fireDuration(reason);
    audio.pause();
    audio.currentTime = 0;
    meta = null;
    started = false;
    emit();
  },

  seekPct(p: number) {
    if (audio && isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = Math.max(0, Math.min(1, p)) * audio.duration;
      emit();
    }
  },
};

(window as any).__nbAudio = nbAudio;
