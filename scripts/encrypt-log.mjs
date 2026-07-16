import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { randomBytes, pbkdf2Sync, createCipheriv } from 'node:crypto';

/**
 * Password-protect /log at build time. The site is static (GitHub Pages), so there is no
 * server to check a password against; a JS-overlay gate would be theater, since the content
 * would still sit readable in the HTML. Instead each built /log page is AES-256-GCM-encrypted
 * with a key derived from LOG_PASSWORD, and the file on disk becomes a small unlock screen
 * that derives the key in the browser (Web Crypto) and decrypts the real page. Without the
 * password, view-source and curl see only ciphertext.
 *
 * - LOG_PASSWORD comes from the environment: the LOG_PASSWORD repo secret in CI, or a local
 *   `LOG_PASSWORD=… npm run build`. The repo is public, so it must never be hardcoded here.
 * - Fail-closed in CI: a GitHub Actions build without the secret aborts rather than deploying
 *   /log unprotected. Local builds just warn and skip, so `npm run build` keeps working.
 * - One salt (and thus one derived key) per build, a fresh random IV per page: unlocking any
 *   /log page unlocks them all. The derived key is cached in sessionStorage, so each tab asks
 *   once and every other /log page decrypts on arrival without re-prompting.
 * - The unlock shell deliberately omits Astro's view-transition marker. The ClientRouter falls
 *   back to a full-page load when the destination lacks it, so navigation into /log always
 *   parses the shell fresh — after decryption, document.write restores the original document
 *   (ClientRouter, audio scripts and all) exactly as built.
 * - Register this integration AFTER stripHtmlComments in astro.config.mjs: comments must be
 *   stripped from the plaintext before it is sealed.
 *
 * Caveats, accepted knowingly: assets under public/images/log and public/videos stay at their
 * plain URLs (only the encrypted HTML references them), and the case-study sources are in the
 * public repo anyway — this gate keeps the *site* from being casually readable, it is not a
 * vault.
 */

const PBKDF2_ITERATIONS = 600_000;

export function encryptLogPages() {
  return {
    name: 'encrypt-log-pages',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const password = process.env.LOG_PASSWORD;
        if (!password) {
          if (process.env.GITHUB_ACTIONS) {
            throw new Error(
              'LOG_PASSWORD is not set — refusing to deploy /log unprotected. ' +
              'Add the LOG_PASSWORD repository secret and pass it to the build step in deploy.yml.'
            );
          }
          logger.warn('LOG_PASSWORD not set — /log left unencrypted (fine locally; CI refuses to build without it).');
          return;
        }

        const logRoot = join(fileURLToPath(dir), 'log');
        let pages;
        try {
          pages = (await readdir(logRoot, { recursive: true })).filter((f) => f.endsWith('.html'));
        } catch {
          logger.warn('no dist/log directory — nothing to encrypt');
          return;
        }

        const salt = randomBytes(16);
        const key = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, 'sha256');

        for (const page of pages) {
          const full = join(logRoot, page);
          const html = await readFile(full, 'utf8');
          const iv = randomBytes(12);
          const cipher = createCipheriv('aes-256-gcm', key, iv);
          // Web Crypto expects the GCM auth tag appended to the ciphertext.
          const sealed = Buffer.concat([cipher.update(html, 'utf8'), cipher.final(), cipher.getAuthTag()]);
          // Carry the page's own CSP onto the shell. document.open() keeps the document's
          // policy container, so the shell's CSP also governs the decrypted page — it must be
          // the same policy, not a stricter one.
          const csp = html.match(/<meta http-equiv="Content-Security-Policy"[^>]*>/)?.[0] ?? '';
          await writeFile(full, unlockShell({
            csp,
            salt: salt.toString('base64'),
            iv: iv.toString('base64'),
            ct: sealed.toString('base64'),
          }));
        }
        logger.info(`encrypted ${pages.length} /log page(s) behind LOG_PASSWORD`);
      },
    },
  };
}

function unlockShell({ csp, salt, iv, ct }) {
  const payload = JSON.stringify({ salt, iv, ct });
  return `<!DOCTYPE html>
<html lang="en" data-state="checking">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="strict-origin-when-cross-origin">
${csp}
<title>Log — Noah Berrie</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Instrument Sans', -apple-system, 'Helvetica Neue', sans-serif;
    background: #fff;
    color: rgba(0, 0, 0, 0.75);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }
  .gate { width: 100%; max-width: 380px; border: 1px solid #000; padding: 2rem 1.75rem 1.75rem; }
  html[data-state="checking"] .gate { visibility: hidden; }
  .gate h1 { font-size: 1rem; font-weight: 700; letter-spacing: 0.02em; color: rgba(0, 0, 0, 0.85); }
  .gate h1::after { content: ""; display: block; width: 1.4rem; height: 2px; margin-top: 0.5rem; background: #4C2A86; }
  .gate p { font-size: 0.85rem; color: rgba(0, 0, 0, 0.45); margin-top: 0.75rem; line-height: 1.5; }
  .gate form { margin-top: 1.25rem; display: flex; gap: 0.5rem; }
  .gate input {
    flex: 1; min-width: 0; font: inherit; font-size: 0.9rem; color: rgba(0, 0, 0, 0.85);
    padding: 0.5rem 0.6rem; border: 1px solid rgba(0, 0, 0, 0.3); border-radius: 0; background: #fff;
  }
  .gate input:focus { outline: none; border-color: #4C2A86; }
  .gate button {
    font: inherit; font-size: 0.85rem; font-weight: 500; cursor: pointer;
    padding: 0.5rem 0.9rem; border: 1px solid #4C2A86; border-radius: 0; background: #4C2A86; color: #fff;
  }
  .gate button:disabled { opacity: 0.6; cursor: default; }
  .gate .error { display: none; color: #8B0000; }
  html[data-state="error"] .error { display: block; }
</style>
</head>
<body>
<div class="gate">
  <h1>Log</h1>
  <p>This section is password-protected. Enter the password to view the case studies.</p>
  <noscript><p>Unlocking requires JavaScript — the content is encrypted and decrypts in your browser.</p></noscript>
  <form id="gate-form">
    <input id="gate-pw" type="password" autocomplete="current-password" aria-label="Password" placeholder="Password">
    <button id="gate-btn" type="submit">Unlock</button>
  </form>
  <p class="error" role="alert">Incorrect password — try again.</p>
</div>
<script>
(function () {
  var P = ${payload};
  var ITERATIONS = ${PBKDF2_ITERATIONS};
  var form = document.getElementById('gate-form');
  var input = document.getElementById('gate-pw');
  var btn = document.getElementById('gate-btn');
  var b64 = function (s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); };

  function setState(s) { document.documentElement.dataset.state = s; }

  function decryptWith(rawKey) {
    return crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['decrypt']).then(function (key) {
      return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(P.iv) }, key, b64(P.ct));
    }).then(function (plain) { return new TextDecoder().decode(plain); });
  }

  function deriveKey(password) {
    return crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
      .then(function (material) {
        return crypto.subtle.deriveBits(
          { name: 'PBKDF2', hash: 'SHA-256', salt: b64(P.salt), iterations: ITERATIONS },
          material, 256
        );
      }).then(function (bits) { return new Uint8Array(bits); });
  }

  // Replace this shell with the decrypted original document. Scripts in the written HTML
  // (ClientRouter included) parse and run as on a normal load, so the page behaves as built.
  function show(html) {
    document.open();
    document.write(html);
    document.close();
  }

  function lock() {
    setState('locked');
    input.focus();
  }

  // Already unlocked in this tab? The cached key decrypts without prompting. A stale key
  // (password rotated, new build salt) fails GCM auth — clear it and fall back to the form.
  // Deferred to DOMContentLoaded: while the shell is still parsing, document.open() is a
  // no-op and write() would APPEND the decrypted page into the gate instead of replacing it.
  function autoUnlock() {
    var cached = sessionStorage.getItem('nb-log-key');
    if (cached) {
      decryptWith(b64(cached)).then(show, function () {
        sessionStorage.removeItem('nb-log-key');
        lock();
      });
    } else {
      lock();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoUnlock);
  else autoUnlock();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var pw = input.value.trim();
    if (!pw) return;
    btn.disabled = true;
    btn.textContent = 'Unlocking…';
    deriveKey(pw).then(function (raw) {
      return decryptWith(raw).then(function (html) {
        var b = '';
        raw.forEach(function (v) { b += String.fromCharCode(v); });
        try { sessionStorage.setItem('nb-log-key', btoa(b)); } catch (err) {}
        show(html);
      });
    }).catch(function () {
      setState('error');
      btn.disabled = false;
      btn.textContent = 'Unlock';
      input.select();
    });
  });
})();
</script>
</body>
</html>
`;
}
