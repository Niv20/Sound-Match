/* ===========================================================================
   AudioEngine — ליבת ה-Web Audio.
   - AudioContext יחיד (singleton)
   - master gains נפרדים למוזיקה / SFX / TTS (נשלטים מההגדרות)
   - מטמון של AudioBuffer לפי URL (decode פעם אחת)
   - עמיד לקבצים חסרים: loadBuffer מחזיר null במקום לזרוק.
   =========================================================================== */

export type AudioChannel = 'music' | 'sfx' | 'tts';

class AudioEngineImpl {
  private ctx: AudioContext | null = null;
  private masterMusic!: GainNode;
  private masterSfx!: GainNode;
  private masterTts!: GainNode;

  private buffers = new Map<string, AudioBuffer | null>();
  private pending = new Map<string, Promise<AudioBuffer | null>>();

  /** רמות ווליום בסיס (0..1) לכל ערוץ — מעודכן מההגדרות. */
  private volumes: Record<AudioChannel, number> = { music: 0.6, sfx: 0.85, tts: 1 };
  private enabled: Record<AudioChannel, boolean> = { music: true, sfx: true, tts: true };

  /** מאותחל בעצלתיים — חובה בתוך מחווה של המשתמש (autoplay policy). */
  ensure(): AudioContext {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new Ctor();
      this.masterMusic = this.ctx.createGain();
      this.masterSfx = this.ctx.createGain();
      this.masterTts = this.ctx.createGain();
      this.masterMusic.connect(this.ctx.destination);
      this.masterSfx.connect(this.ctx.destination);
      this.masterTts.connect(this.ctx.destination);
      this.applyChannel('music');
      this.applyChannel('sfx');
      this.applyChannel('tts');
    }
    return this.ctx;
  }

  get context(): AudioContext {
    return this.ensure();
  }

  get now(): number {
    return this.ensure().currentTime;
  }

  /** לחדש את ההקשר (נדרש אחרי מחוות משתמש בדפדפנים מסוימים). */
  async resume(): Promise<void> {
    const ctx = this.ensure();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        /* ignore */
      }
    }
  }

  master(channel: AudioChannel): GainNode {
    this.ensure();
    return channel === 'music' ? this.masterMusic : channel === 'sfx' ? this.masterSfx : this.masterTts;
  }

  setVolume(channel: AudioChannel, volume: number) {
    this.volumes[channel] = Math.max(0, Math.min(1, volume));
    if (this.ctx) this.applyChannel(channel);
  }

  setEnabled(channel: AudioChannel, on: boolean) {
    this.enabled[channel] = on;
    if (this.ctx) this.applyChannel(channel);
  }

  private applyChannel(channel: AudioChannel) {
    const node = this.master(channel);
    const target = this.enabled[channel] ? this.volumes[channel] : 0;
    node.gain.setTargetAtTime(target, this.now, 0.04);
  }

  /** טוען ומפענח buffer (עם מטמון). מחזיר null אם הקובץ חסר/נכשל. */
  async loadBuffer(url: string): Promise<AudioBuffer | null> {
    if (this.buffers.has(url)) return this.buffers.get(url)!;
    if (this.pending.has(url)) return this.pending.get(url)!;

    const p = (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const arr = await res.arrayBuffer();
        const buf = await this.ensure().decodeAudioData(arr);
        this.buffers.set(url, buf);
        return buf;
      } catch {
        // קובץ חסר (placeholder) — לא שובר את האפליקציה
        this.buffers.set(url, null);
        return null;
      } finally {
        this.pending.delete(url);
      }
    })();

    this.pending.set(url, p);
    return p;
  }

  /** buffer מהמטמון אם כבר נטען (סינכרוני), אחרת undefined. */
  cached(url: string): AudioBuffer | null | undefined {
    return this.buffers.get(url);
  }

  /** השמעת buffer פשוטה (חד-פעמית) על ערוץ. מחזיר את ה-source. */
  playOneShot(
    buffer: AudioBuffer,
    channel: AudioChannel,
    opts: { volume?: number; when?: number; offset?: number } = {},
  ): AudioBufferSourceNode {
    const ctx = this.ensure();
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    g.gain.value = opts.volume ?? 1;
    src.connect(g).connect(this.master(channel));
    src.start(opts.when ?? ctx.currentTime, opts.offset ?? 0);
    return src;
  }
}

/** singleton */
export const audioEngine = new AudioEngineImpl();
