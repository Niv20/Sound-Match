/* ===========================================================================
   MusicManager — מוזיקת רקע מבוססת לופים.

   רעיון הליבה:
   • כל הלופים באורך זהה L = MUSIC_LOOP_SECONDS.
   • "מיקום בלופ" נמדד מול שעון ה-AudioContext: pos = (now - virtualStart) % L.
   • מעבר בין קבוצות (crossfade מסונכרן-פאזה): מתחילים את הלופ החדש מאותו
     pos של הישן, ובו-זמנית מנמיכים את הישן ומגבירים את החדש.
   • בתוך קבוצה עם כמה קבצים — קופצים אקראית מקובץ לקובץ בכל מחזור לופ,
     בצורה חלקה (chaining מתוזמן לפי שעון האודיו).
   =========================================================================== */

import { audioEngine } from './AudioEngine';
import {
  MUSIC_LOOP_SECONDS as L,
  MUSIC_CROSSFADE_SECONDS as CF,
  MENU_MUSIC,
  GAME_MUSIC_TIERS,
  musicUrl,
  type MenuMusicGroup,
} from '../config/music.config';

/** ספק הלופ הבא: מחזיר buffer (או null אם חסר/placeholder). */
type LoopProvider = () => AudioBuffer | null;

/** כמה זמן לפני סוף סגמנט לתזמן את הסגמנט הבא. */
const SCHEDULE_LOOKAHEAD = 0.25;

/**
 * ערוץ מוזיקה בודד: מנגן רצף לופים מ-provider, חלק ומחזורי,
 * עם GainNode משלו (ל-crossfade). מסנכרן פאזה מול שעון משותף.
 */
class MusicChannel {
  readonly gain: GainNode;
  private virtualStart = 0; // זמן ctx שבו pos=0 (מסונכרן בין ערוצים)
  private timer: ReturnType<typeof setTimeout> | null = null;
  private sources: AudioBufferSourceNode[] = [];
  private stopped = false;

  constructor(private provider: LoopProvider) {
    const ctx = audioEngine.context;
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(audioEngine.master('music'));
  }

  /** מיקום נוכחי בתוך הלופ (0..L), מסונכרן בין ערוצים. */
  position(): number {
    const t = audioEngine.now - this.virtualStart;
    return ((t % L) + L) % L;
  }

  /** מתחיל ניגון מ-offset נתון (לסנכרון פאזה). */
  start(offset: number) {
    const ctx = audioEngine.context;
    this.virtualStart = ctx.currentTime - offset;
    this.scheduleSegment(ctx.currentTime, offset);
  }

  private scheduleSegment(when: number, offset: number) {
    if (this.stopped) return;
    const buf = this.provider();
    // משך הסגמנט: עד סוף הלופ (L). אם יש buffer ננגן אותו, אחרת שקט.
    const segDuration = Math.max(0.05, L - offset);

    if (buf) {
      const ctx = audioEngine.context;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.gain);
      const playOffset = Math.min(offset, Math.max(0, buf.duration - 0.001));
      src.start(when, playOffset);
      src.stop(when + segDuration);
      src.onended = () => {
        const i = this.sources.indexOf(src);
        if (i >= 0) this.sources.splice(i, 1);
      };
      this.sources.push(src);
    }

    // תזמן את הסגמנט הבא (offset=0) קצת לפני שהנוכחי נגמר
    const nextWhen = when + segDuration;
    const delayMs = Math.max(0, (nextWhen - SCHEDULE_LOOKAHEAD - audioEngine.now) * 1000);
    this.timer = setTimeout(() => this.scheduleSegment(nextWhen, 0), delayMs);
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

  /** מעבר לקבוצת מוזיקת תפריט (crossfade מסונכרן-פאזה). */
  async toMenuGroup(group: MenuMusicGroup) {
    const key = `menu:${group}`;
    if (key === this.currentKey) return;
    const urls = (MENU_MUSIC[group] ?? []).map(musicUrl);
    const buffers = (await Promise.all(urls.map((u) => audioEngine.loadBuffer(u)))).filter(
      (b): b is AudioBuffer => !!b,
    );
    const provider: LoopProvider = () => pickRandom(buffers) ?? null;
    this.crossfadeTo(provider, key);
  }

  /** התחלת מוזיקת משחק (שכבות מתקדמות). */
  async toGame() {
    const key = 'game';
    if (key === this.currentKey) return;

    // טען מראש את כל ה-buffers של כל השכבות
    const tierBuffers: (AudioBuffer | null)[][] = await Promise.all(
      GAME_MUSIC_TIERS.map((t) => Promise.all(t.loops.map((rel) => audioEngine.loadBuffer(musicUrl(rel))))),
    );

    let tierIndex = 0;
    let playsInTier = 0;
    const provider: LoopProvider = () => {
      const tier = GAME_MUSIC_TIERS[tierIndex];
      const pool = tierBuffers[tierIndex].filter((b): b is AudioBuffer => !!b);
      const buf = pickRandom(pool) ?? null;
      playsInTier++;
      if (playsInTier >= tier.plays) {
        tierIndex = (tierIndex + 1) % GAME_MUSIC_TIERS.length;
        playsInTier = 0;
      }
      return buf;
    };
    this.crossfadeTo(provider, key);
  }

  private crossfadeTo(provider: LoopProvider, key: string) {
    const offset = this.active ? this.active.position() : 0;
    const next = new MusicChannel(provider);
    next.start(offset);
    next.fadeIn();

    if (this.active) this.active.fadeOutAndStop();
    this.active = next;
    this.currentKey = key;
  }

  /** עצירה מוחלטת (יציאה מהמשחק וכו'). */
  stopAll() {
    if (this.active) this.active.fadeOutAndStop();
    this.active = null;
    this.currentKey = null;
  }
}

export const musicManager = new MusicManagerImpl();
