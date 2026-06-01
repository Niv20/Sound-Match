/* ===========================================================================
   preloader.ts — טעינה מקדימה חכמה כדי שהחוויה תהיה חלקה.
   - boot: אפקטים קריטיים
   - idle: שאר האפקטים + מוזיקת תפריט + תמונות קטגוריות (ברקע)
   - category: תמונות + TTS (he/ar) + מוזיקת משחק לפני "התחל משחק"
   =========================================================================== */

import { audioEngine } from './AudioEngine';
import { sfxManager } from './SfxManager';
import { ttsManager } from './TtsManager';
import { musicUrl, MENU_MUSIC } from '../config/music.config';
import { LANG_HE, LANG_AR } from '../config/constants';
import type { VocabItem } from '../data/types';

const imageCache = new Set<string>();

/** טעינה מקדימה של תמונות (decode ברקע). */
export function preloadImages(urls: (string | undefined)[]) {
  for (const url of urls) {
    if (!url || imageCache.has(url)) continue;
    imageCache.add(url);
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  }
}

const ric: (cb: () => void) => void =
  typeof (window as any).requestIdleCallback === 'function'
    ? (cb) => (window as any).requestIdleCallback(cb, { timeout: 2000 })
    : (cb) => setTimeout(cb, 300);

/** עליית האתר — מיידי. */
export async function preloadBoot() {
  await sfxManager.preloadCritical();
}

/** ברקע כשהדפדפן פנוי. */
export function preloadIdle(categoryThumbs: (string | undefined)[]) {
  ric(() => {
    void sfxManager.preloadAll();
    for (const urls of Object.values(MENU_MUSIC)) {
      for (const rel of urls) void audioEngine.loadBuffer(musicUrl(rel));
    }
    preloadImages(categoryThumbs);
  });
}

/** טעינה מקדימה לקטגוריה לפני תחילת משחק. */
export async function preloadForCategory(items: VocabItem[]) {
  preloadImages(items.map((it) => it.image));
  const ids = items.map((it) => it.id);
  await Promise.all([ttsManager.preload(ids, LANG_HE), ttsManager.preload(ids, LANG_AR)]);
}
