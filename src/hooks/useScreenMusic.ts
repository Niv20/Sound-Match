import { useEffect } from 'react';
import { musicManager } from '../audio/MusicManager';
import type { MenuMusicGroup } from '../config/music.config';

/** מפעיל מעבר לקבוצת מוזיקת תפריט כשהמסך נטען/משתנה. */
export function useScreenMusic(group: MenuMusicGroup) {
  useEffect(() => {
    void musicManager.toMenuGroup(group);
  }, [group]);
}
