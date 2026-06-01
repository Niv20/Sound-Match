/* ===========================================================================
   TtsManager — *** גבול ה-TTS היחיד בזמן ריצה ***

   כרגע: מנגן קובצי mp3 שהופקו מראש (npm run tts → Google TTS).
   אם בעתיד תרצה TTS חי / ספק אחר — שנה רק את הקובץ הזה.

   נתיב קובץ: /audio/tts/<lang>/<id>.mp3
   =========================================================================== */

import { audioEngine } from './AudioEngine';
import { TIMINGS, type Lang } from '../config/constants';

export const TTS_BASE = '/audio/tts';

export function ttsUrl(id: string, lang: Lang): string {
  return `${TTS_BASE}/${lang}/${id}.mp3`;
}

class TtsManagerImpl {
  /** טעינה מראש של רשימת מזהים בשפה נתונה. */
  async preload(ids: string[], lang: Lang) {
    await Promise.all(ids.map((id) => audioEngine.loadBuffer(ttsUrl(id, lang))));
  }

  /** מבטיח שה-buffer טעון ומחזיר אותו (או null אם חסר). */
  async load(id: string, lang: Lang): Promise<AudioBuffer | null> {
    return audioEngine.loadBuffer(ttsUrl(id, lang));
  }

  /**
   * משמיע מילה ומחזיר Promise שמסתיים כשההשמעה נגמרת.
   * אם הקובץ חסר — מסתיים אחרי משך ברירת-מחדל (שקט) כדי שהמשחק ימשיך לזרום.
   * הערך המוחזר: משך ההשמעה במילישניות.
   */
  async playWord(id: string, lang: Lang): Promise<number> {
    const buf = await audioEngine.loadBuffer(ttsUrl(id, lang));
    if (!buf) {
      return new Promise((resolve) =>
        setTimeout(() => resolve(TIMINGS.WORD_FALLBACK_DURATION), TIMINGS.WORD_FALLBACK_DURATION),
      );
    }
    const durationMs = buf.duration * 1000;
    return new Promise((resolve) => {
      const src = audioEngine.playOneShot(buf, 'tts');
      src.onended = () => resolve(durationMs);
      // גיבוי אם onended לא נורה
      setTimeout(() => resolve(durationMs), durationMs + 200);
    });
  }
}

export const ttsManager = new TtsManagerImpl();
