import { useEffect } from 'react';
import { KEY_P1, KEY_P2, PLAYER1, PLAYER2 } from '../config/constants';
import { useGameStore } from '../store/useGameStore';

/** מאזין למקשי השחקנים (A / L) ומפעיל לחיצה. פעיל רק כשהמסך מורכב. */
export function useGameKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === KEY_P1) useGameStore.getState().press(PLAYER1);
      else if (k === KEY_P2) useGameStore.getState().press(PLAYER2);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
