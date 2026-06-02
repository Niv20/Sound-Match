import { useEffect } from 'react';
import { musicManager } from '../audio/MusicManager';
import type { MenuMusicGroup, GameMusicTier } from '../config/music.config';

/** מפעיל מעבר לקבוצת מוזיקת תפריט כשהמסך נטען/משתנה. */
export function useScreenMusic(group: MenuMusicGroup) {
  useEffect(() => {
    void musicManager.toMenuGroup(group);
  }, [group]);
}

/** מפעיל מעבר לשלב מוזיקת משחק כשהמסך נטען (tier1=סבב, tier2=חשיפה). */
export function useGameMusic(tier: GameMusicTier) {
  useEffect(() => {
    void musicManager.toGameTier(tier);
  }, [tier]);
}
