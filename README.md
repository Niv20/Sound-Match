# Sound Match 🎵

משחק רשת חינוכי לשני שחקנים לתרגול אוצר מילים בעברית דרך התאמה בין תמונה למילה
מושמעת, תוך התעלמות ממסיחי דעת. שחקן כחול = מקש **A**, שחקן אדום = מקש **L**.

## הרצה מקומית
```bash
npm install
npm run dev        # שרת פיתוח (Vite)
npm run build      # בנייה ל-production (dist/)
npm run preview    # תצוגה מקדימה של ה-build
```

## נכסים (Assets)

### תמונות + אוצר מילים
התמונות נמצאות ב-`img/` (שמות הקבצים = מילים בעברית עם ניקוד).
הסקריפט מנרמל אותן ומייצר מניפסט:
```bash
npm run manifest   # img/ -> public/images/<cat>/<id>.webp + src/data/vocabulary.generated.ts
```

### תרגומי ערבית
```bash
npm run arabic     # מייצר src/data/arabic.ts (תרגומים אוטומטיים — ניתן לתקן במילון שבסקריפט)
```

### הקראה (Google TTS) — מופק מראש
אוצר המילים קבוע, ולכן ההקראות מופקות **פעם אחת** בזמן build ונשמרות כקבצים
סטטיים. **אין צורך במפתח סוד בזמן ריצה.**
```bash
GOOGLE_TTS_KEY=xxx npm run tts          # מפיק public/audio/tts/{he,ar}/<id>.mp3
GOOGLE_TTS_KEY=xxx npm run tts -- --force   # הפקה מחדש של הכל
```
את המפתח יוצרים ב-Google Cloud Console (Text-to-Speech API מופעל). שמור אותו
ב-`.env` מקומי (ראה `.env.example`) — הוא לא נדרש בפרודקשן.

החלפת ספק ה-TTS בעתיד נוגעת רק ל-`src/audio/TtsManager.ts` (זמן ריצה)
ו-`scripts/build-tts.mjs` (הפקה).

### מוזיקה ואפקטים
ראה `public/audio/README.md`. האתר רץ גם בלי הקבצים (שקט, ללא שגיאות).
- מוזיקה: לופים באורך אחיד (`MUSIC_LOOP_SECONDS`), מוגדרים ב-`src/config/music.config.ts`.
- אפקטים: מוגדרים ב-`src/config/sfx.config.ts`.

```bash
npm run assets     # manifest + arabic + tts ביחד
```

## פריסה (Render)
פריסה כ-Static Site לפי `render.yaml` (build: `npm ci && npm run build`,
publish: `dist`, עם SPA fallback). מכיוון שה-TTS מופק מראש — אין משתני סוד בפרודקשן.

## מבנה
- `src/config/` — כל הקבועים וההגדרות (קטגוריות, מוזיקה, אפקטים, תזמונים).
- `src/audio/` — מנוע Web Audio: מוזיקה (crossfade מסונכרן-פאזה), אפקטים, TTS, טעינה מקדימה.
- `src/store/` — Zustand: ניווט, הגדרות (persisted), בחירת פריטים, מצב משחק.
- `src/screens/` + `src/components/` — ממשק המשתמש.
- `scripts/` — סקריפטי הפקת נכסים.
