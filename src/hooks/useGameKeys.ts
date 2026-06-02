import { useEffect } from 'react';
import { KEY_P1, KEY_P2, PLAYER1, PLAYER2 } from '../config/constants';
import { useGameStore } from '../store/useGameStore';

/**
 * מאזין למקשי השחקנים. החומרה שולחת אות *קטנה* בלחיצה (כפתור יורד) ואות *גדולה*
 * בשחרור (כפתור עולה) — לכן אנו רגישים לאותיות גדולות/קטנות (בלי toLowerCase).
 *   d → לחיצה P1 ,  D → שחרור P1
 *   a → לחיצה P2 ,  A → שחרור P2
 * פעיל רק כשמסך המשחק מורכב, כך שלחיצות בכל שאר המסכים נבלעות.
 */
export function useGameKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return; // התעלם מחזרות אוטומטיות של מקלדת
      switch (e.key) {
        case KEY_P1:
          return useGameStore.getState().press(PLAYER1);
        case KEY_P1.toUpperCase():
          return useGameStore.getState().release(PLAYER1);
        case KEY_P2:
          return useGameStore.getState().press(PLAYER2);
        case KEY_P2.toUpperCase():
          return useGameStore.getState().release(PLAYER2);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
