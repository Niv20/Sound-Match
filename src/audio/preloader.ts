/* ===========================================================================
   preloader.ts — טעינה מקדימה חכמה כדי שהחוויה תהיה חלקה.
   - boot: אפקטים קריטיים
   - idle: שאר האפקטים + מוזיקת תפריט + תמונות קטגוריות (ברקע)
   - category: תמונות + TTS (he/ar) + מוזיקת משחק לפני "התחל משחק"
   =========================================================================== */

import { audioEngine } from './AudioEngine';
import { sfxManager } from './SfxManager';
import { ttsManager } from './TtsManager';
import { musicUrl, MENU_MUSIC, GAME_MUSIC } from '../config/music.config';
import { CATEGORIES } from '../config/categories.config';
import { imageItems } from '../data/vocabulary';
import { LANG_HE, LANG_AR } from '../config/constants';
import type { VocabItem } from '../data/types';

/* שומרים הפניה לאובייקטי Image (לא רק את ה-URL) כדי שה-bitmap המפוענח יישאר
   בזיכרון ולא ייאסף ע"י ה-GC. כך התמונות לא צריכות פענוח מחדש בגלילה מהירה. */
const imageCache = new Map<string, HTMLImageElement>();

/** טעינה מקדימה של תמונות + פענוח מוקדם (decode), עם שמירת הפניה. */
export function preloadImages(urls: (string | undefined)[]) {
  for (const url of urls) {
    if (!url || imageCache.has(url)) continue;
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    imageCache.set(url, img);
    void img.decode?.().catch(() => {});
  }
}

/** טוען+מפענח תמונה אחת ושומר הפניה; מסתיים גם בהצלחה וגם בכישלון — לעולם לא זורק. */
function loadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (imageCache.has(url)) return resolve();
    const img = new Image();
    img.decoding = 'async';
    imageCache.set(url, img);
    const done = () => resolve();
    img.onload = () => {
      // מפענחים מראש כדי שהציור למסך יהיה מיידי בזמן גלילה
      if (img.decode) img.decode().then(done, done);
      else done();
    };
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

/** כל כתובות המוזיקה (תפריט + שלבי משחק). */
function allMusicUrls(): string[] {
  const urls: string[] = [];
  for (const list of Object.values(MENU_MUSIC)) for (const rel of list) urls.push(musicUrl(rel));
  for (const list of Object.values(GAME_MUSIC)) for (const rel of list) urls.push(musicUrl(rel));
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
