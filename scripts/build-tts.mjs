/* ===========================================================================
   build-tts.mjs — הפקת קובצי הקראה מראש מ-Google Cloud Text-to-Speech.

   *** הקובץ היחיד שנוגע ב-Google TTS. ***
   הפלט: public/audio/tts/he/<id>.mp3 ו-public/audio/tts/ar/<id>.mp3
   הקבצים נשמרים בריפו; אין צורך במפתח בזמן ריצה.

   דרישות: משתנה סביבה GOOGLE_TTS_KEY (מפתח API עם Text-to-Speech מופעל).
   הרצה: GOOGLE_TTS_KEY=xxx node scripts/build-tts.mjs   (או: npm run tts)
   דגלים: --force  (הפק מחדש גם אם הקובץ קיים)
   =========================================================================== */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'audio', 'tts');

// ── הגדרות קול (שנה כאן בקלות) ──────────────────────────────────────────
const VOICES = {
  he: { languageCode: 'he-IL', name: 'he-IL-Wavenet-A', ssmlGender: 'FEMALE' },
  ar: { languageCode: 'ar-XA', name: 'ar-XA-Wavenet-A', ssmlGender: 'FEMALE' },
};
const AUDIO_CONFIG = { audioEncoding: 'MP3', speakingRate: 0.92, pitch: 0 };
const NUMBERS_MIN = 0;
const NUMBERS_MAX = 100;
const CONCURRENCY = 4;
// ────────────────────────────────────────────────────────────────────────

const KEY = process.env.GOOGLE_TTS_KEY;
const FORCE = process.argv.includes('--force');

function parsePairs(text, keyA, keyB) {
  // מחלץ זוגות {keyA, keyB} מתוך JSON/אובייקטים בקובץ TS.
  // תומך גם במפתחות ללא מרכאות וגם בערכים במרכאות בודדות (colors.ts כתוב ידנית).
  const re = new RegExp(
    `["']?${keyA}["']?\\s*:\\s*["']([^"']+)["'][\\s\\S]*?["']?${keyB}["']?\\s*:\\s*["']([^"']+)["']`,
    'g',
  );
  return [...text.matchAll(re)].map((m) => ({ [keyA]: m[1], [keyB]: m[2] }));
}

async function readVocabHe() {
  const items = [];
  const vocab = await fs.readFile(path.join(ROOT, 'src/data/vocabulary.generated.ts'), 'utf8');
  for (const p of parsePairs(vocab, 'id', 'he')) items.push({ id: p.id, text: p.he });
  const colors = await fs.readFile(path.join(ROOT, 'src/data/colors.ts'), 'utf8');
  for (const p of parsePairs(colors, 'id', 'he')) items.push({ id: p.id, text: p.he });
  for (let n = NUMBERS_MIN; n <= NUMBERS_MAX; n++) items.push({ id: `num_${n}`, text: String(n) });
  return items;
}

async function readArabic() {
  const items = [];
  const ar = await fs.readFile(path.join(ROOT, 'src/data/arabic.ts'), 'utf8');
  const re = /"?([a-z0-9_]+)"?:\s*"([^"]+)"/g;
  const body = ar.split('ARABIC: Record<string, string> = {')[1]?.split('};')[0] ?? '';
  for (const m of body.matchAll(re)) items.push({ id: m[1], text: m[2] });
  for (let n = NUMBERS_MIN; n <= NUMBERS_MAX; n++) items.push({ id: `num_${n}`, text: String(n) });
  return items;
}

async function synth(text, voice) {
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { text }, voice, audioConfig: AUDIO_CONFIG }),
    },
  );
  if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return Buffer.from(json.audioContent, 'base64');
}

async function run(lang, items) {
  const dir = path.join(OUT, lang);
  await fs.mkdir(dir, { recursive: true });
  let done = 0,
    skipped = 0,
    failed = 0;
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async ({ id, text }) => {
        const file = path.join(dir, `${id}.mp3`);
        if (!FORCE && (await fs.access(file).then(() => true).catch(() => false))) {
          skipped++;
          return;
        }
        try {
          const buf = await synth(text, VOICES[lang]);
          await fs.writeFile(file, buf);
          done++;
        } catch (e) {
          failed++;
          console.warn(`  ✗ ${lang}/${id}: ${e.message}`);
        }
      }),
    );
  }
  console.log(`  ${lang}: ${done} הופקו, ${skipped} דולגו, ${failed} נכשלו`);
}

async function main() {
  if (!KEY) {
    console.error(
      'ℹ️  GOOGLE_TTS_KEY לא מוגדר — מדלג על הפקת TTS (האתר ירוץ עם placeholders/שקט).\n' +
        '   להפקה: GOOGLE_TTS_KEY=xxx npm run tts',
    );
    return;
  }
  console.log('🗣️  מפיק עברית…');
  await run('he', await readVocabHe());
  console.log('🗣️  מפיק ערבית…');
  await run('ar', await readArabic());
  console.log('✅ סיום.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
