/* ===========================================================================
   preloader.ts — טעינה מקדימה חכמה כדי שהחוויה תהיה חלקה.
   - boot: אפקטים קריטיים
   - idle: שאר האפקטים + מוזיקת תפריט + תמונות קטגוריות (ברקע)
   - category: תמונות + TTS (he/ar) + מוזיקת משחק לפני "התחל משחק"
   =========================================================================== */

import { audioEngine } from './AudioEngine';
import { sfxManager } from './SfxManager';
import { ttsManager } from './TtsManager';
import { musicUrl, MENU_MUSIC, GAME_MUSIC_TIERS } from '../config/music.config';
import { CATEGORIES } from '../config/categories.config';
import { imageItems } from '../data/vocabulary';
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

/** טוען תמונה אחת; מסתיים (resolve) גם בהצלחה וגם בכישלון — לעולם לא זורק. */
function loadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (imageCache.has(url)) return resolve();
    imageCache.add(url);
    const img = new Image();
    img.decoding = 'async';
    const done = () => resolve();
    img.onload = done;
    img.onerror = done;
    img.src = url;
  });
}

/** כל כתובות התמונות מכל הקטגוריות. */
function allImageUrls(): string[] {
  const urls = CATEGORIES.flatMap((c) => imageItems(c.id).map((it) => it.image)).filter(
    (u): u is string => !!u,
  );
  return [...new Set(urls)];
}

/** כל כתובות המוזיקה (תפריט + שכבות משחק). */
function allMusicUrls(): string[] {
  const urls: string[] = [];
  for (const list of Object.values(MENU_MUSIC)) for (const rel of list) urls.push(musicUrl(rel));
  for (const tier of GAME_MUSIC_TIERS) for (const rel of tier.loops) urls.push(musicUrl(rel));
  return [...new Set(urls)];
}

export interface BootProgress {
  loaded: number;
  total: number;
}

/** טעינה חוסמת: כל התמונות + כל המוזיקה, עם דיווח התקדמות. */
export async function preloadAll(onProgress?: (p: BootProgress) => void): Promise<void> {
  const images = allImageUrls();
  const music = allMusicUrls();
  const total = images.length + music.length;
  let loaded = 0;
  onProgress?.({ loaded, total });
  const tick = () => {
    loaded += 1;
    onProgress?.({ loaded, total });
  };
  await Promise.all([
    ...images.map((u) => loadImage(u).then(tick)),
    ...music.map((u) => audioEngine.loadBuffer(u).then(tick)),
  ]);
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
