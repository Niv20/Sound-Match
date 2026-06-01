/* ===========================================================================
   SfxManager — השמעת אפקטי קול קצרים.
   בוחר וריאציה אקראית, מנגן על ערוץ ה-sfx. עמיד לקבצים חסרים.
   =========================================================================== */

import { audioEngine } from './AudioEngine';
import { sfxFiles, allSfxFiles, CRITICAL_SFX, type SfxName } from '../config/sfx.config';

class SfxManagerImpl {
  /** משמיע אפקט (וריאציה אקראית). לא חוסם — טוען אם צריך ומשמיע. */
  play(name: SfxName) {
    const files = sfxFiles(name);
    const url = files[Math.floor(Math.random() * files.length)];
    const cached = audioEngine.cached(url);
    if (cached) {
      audioEngine.playOneShot(cached, 'sfx');
    } else if (cached === undefined) {
      // לא נטען עדיין — טען והשמע (אם קיים)
      void audioEngine.loadBuffer(url).then((buf) => {
        if (buf) audioEngine.playOneShot(buf, 'sfx');
      });
    }
    // cached === null => קובץ חסר, מתעלמים בשקט
  }

  /** טעינה מקדימה של אפקטים קריטיים. */
  async preloadCritical() {
    await Promise.all(CRITICAL_SFX.flatMap(sfxFiles).map((u) => audioEngine.loadBuffer(u)));
  }

  /** טעינה מקדימה של כל האפקטים (ברקע). */
  async preloadAll() {
    await Promise.all(allSfxFiles().map((u) => audioEngine.loadBuffer(u)));
  }
}

export const sfxManager = new SfxManagerImpl();
