/* ===========================================================================
   MusicManager — מוזיקת רקע מבוססת לופים (אורכים חופשיים).

   רעיון הליבה:
   • אורך כל לופ נגזר אוטומטית מהקובץ (AudioBuffer.duration) — לא מוגדר מראש,
     והלופים יכולים להיות באורכים שונים זה מזה.
   • "עוגן" (anchor) = שעון ה-AudioContext שבו המוזיקה התחילה (מתוך שקט).
     "מיקום הפאזה" של לופ באורך d הוא (now - anchor) % d — כמה זמן חלף
     מההתחלה, מודולו אורך הלופ.
   • מעבר בין קבוצות (crossfade): הסגמנט הראשון של הקבוצה החדשה מתחיל
     ממיקום-הפאזה שלו, ובו-זמנית מנמיכים את הישן ומגבירים את החדש.
   • בתוך קבוצה עם כמה קבצים — בכל מחזור-לופ נבחר קובץ אקראית, והם משורשרים
     חלק (chaining מתוזמן לפי שעון האודיו), כל אחד באורכו-שלו.
   • תפריט ומשחק חולקים את אותו מנגנון: קבוצת תפריט (toMenuGroup) ושלב-משחק
     (toGameTier) הם שניהם "קבוצת לופים" עם crossfade מסונכרן-פאזה. שלבי
     המשחק מתחלפים לפי אירוע (tier1=סבב, tier2=חשיפה), לא אוטומטית.
   =========================================================================== */

import { audioEngine } from './AudioEngine';
import {
  MUSIC_CROSSFADE_SECONDS as CF,
  MUSIC_SILENT_SEGMENT_SECONDS as SILENT_SEGMENT,
  MENU_MUSIC,
  GAME_MUSIC,
  musicUrl,
  type MenuMusicGroup,
  type GameMusicTier,
} from '../config/music.config';

/** ספק הלופ הבא: מחזיר buffer (או null אם חסר/placeholder). */
type LoopProvider = () => AudioBuffer | null;

/** כמה זמן לפני סוף סגמנט לתזמן את הסגמנט הבא. */
const SCHEDULE_LOOKAHEAD = 0.25;

/**
 * ערוץ מוזיקה בודד: מנגן רצף לופים מ-provider, חלק ומחזורי, באורכים חופשיים,
 * עם GainNode משלו (ל-crossfade). הסגמנט הראשון מסונכרן-פאזה מול עוגן משותף.
 */
class MusicChannel {
  readonly gain: GainNode;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private sources: AudioBufferSourceNode[] = [];
  private stopped = false;

  /** @param anchor שעון ctx שבו pos=0 (מתחילת המוזיקה), לחישוב הפאזה. */
  constructor(private provider: LoopProvider, private anchor: number) {
    const ctx = audioEngine.context;
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(audioEngine.master('music'));
  }

  /** מתחיל ניגון; הסגמנט הראשון מתחיל ממיקום-הפאזה. */
  start() {
    this.scheduleSegment(audioEngine.context.currentTime, true);
  }

  private scheduleSegment(when: number, first: boolean) {
    if (this.stopped) return;
    const buf = this.provider();
    let segDuration: number;

    if (buf) {
      const dur = buf.duration;
      // הסגמנט הראשון מתחיל ממיקום-הפאזה: הזמן שחלף מההתחלה, מודולו אורך
      // הלופ הזה. שאר הסגמנטים מתחילים מ-0 (שרשור חלק רצוף).
      const offset = first ? (((when - this.anchor) % dur) + dur) % dur : 0;
      const ctx = audioEngine.context;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.gain);
      src.start(when, offset);
      src.onended = () => {
        const i = this.sources.indexOf(src);
        if (i >= 0) this.sources.splice(i, 1);
      };
      this.sources.push(src);
      segDuration = dur - offset; // עד סוף הקובץ
    } else {
      // קובץ חסר (placeholder) — סגמנט שקט קצר ואז ננסה שוב. לא שובר את האפליקציה.
      segDuration = SILENT_SEGMENT;
    }

    // תזמן את הסגמנט הבא (offset=0) קצת לפני שהנוכחי נגמר
    const nextWhen = when + segDuration;
    const delayMs = Math.max(0, (nextWhen - SCHEDULE_LOOKAHEAD - audioEngine.now) * 1000);
    this.timer = setTimeout(() => this.scheduleSegment(nextWhen, false), delayMs);
  }

  /** עליה הדרגתית ל-1. */
  fadeIn(seconds = CF) {
    const g = this.gain.gain;
    const now = audioEngine.now;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(1, now + seconds);
  }

  /** ירידה הדרגתית ל-0 ואז עצירה. */
  fadeOutAndStop(seconds = CF) {
    const g = this.gain.gain;
    const now = audioEngine.now;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + seconds);
    setTimeout(() => this.stop(), seconds * 1000 + 60);
  }

  stop() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    for (const s of this.sources) {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    }
    this.sources = [];
    try {
      this.gain.disconnect();
    } catch {
      /* noop */
    }
  }
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

class MusicManagerImpl {
  private active: MusicChannel | null = null;
  private currentKey: string | null = null;
  /** עוגן הפאזה: ctx-time שבו המוזיקה התחילה. נקבע כשמתחילים מתוך שקט. */
  private anchor = 0;

  /** מעבר לקבוצת מוזיקת תפריט (crossfade מסונכרן-פאזה). */
  async toMenuGroup(group: MenuMusicGroup) {
    await this.toLoopGroup(`menu:${group}`, MENU_MUSIC[group] ?? []);
  }

  /**
   * מעבר לשלב מוזיקת משחק (crossfade מסונכרן-פאזה, זהה לתפריט).
   * tier1 = במהלך הסבב, tier2 = במסך החשיפה. נקרא לפי אירוע מהמסכים.
   */
  async toGameTier(tier: GameMusicTier) {
    await this.toLoopGroup(`game:${tier}`, GAME_MUSIC[tier] ?? []);
  }

  /** טוען את הלופים של קבוצה ומבצע crossfade מסונכרן-פאזה אליה. */
  private async toLoopGroup(key: string, relPaths: string[]) {
    if (key === this.currentKey) return;
    const buffers = (
      await Promise.all(relPaths.map((rel) => audioEngine.loadBuffer(musicUrl(rel))))
    ).filter((b): b is AudioBuffer => !!b);
    // ייתכן שבזמן הטעינה כבר ביקשו קבוצה אחרת — אל תדרוס אותה.
    if (key === this.currentKey) return;
    const provider: LoopProvider = () => pickRandom(buffers) ?? null;
    this.crossfadeTo(provider, key);
  }

  private crossfadeTo(provider: LoopProvider, key: string) {
    // עוגן הפאזה נקבע כשמתחילים מתוך שקט, ונשמר לאורך כל מעברי התפריט (רצף).
    if (!this.active) this.anchor = audioEngine.now;
    const next = new MusicChannel(provider, this.anchor);
    next.start();
    next.fadeIn();

    if (this.active) this.active.fadeOutAndStop();
    this.active = next;
    this.currentKey = key;
  }

  /** עצירה מוחלטת (יציאה מהמשחק וכו'). העוגן יתאפס בהשמעה הבאה. */
  stopAll() {
    if (this.active) this.active.fadeOutAndStop();
    this.active = null;
    this.currentKey = null;
  }
}

export const musicManager = new MusicManagerImpl();
