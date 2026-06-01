import { useCallback } from 'react';
import { sfxManager } from '../audio/SfxManager';
import type { SfxName } from '../config/sfx.config';

/** מחזיר פונקציה להשמעת אפקט קול. */
export function useSfx() {
  return useCallback((name: SfxName) => sfxManager.play(name), []);
}
