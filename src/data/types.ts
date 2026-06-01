/** פריט אוצר מילים אחד (מילה/צבע/מספר). */
export interface VocabItem {
  /** מזהה ascii יציב — משמש לשמות קבצי תמונה ו-TTS */
  id: string;
  /** המילה בעברית עם ניקוד — מקור ל-TTS ולתצוגה */
  he: string;
  /** מזהה קטגוריה */
  categoryId: string;
  /** תת-קבוצה (רק בקטגוריית חיות) */
  subgroup?: string;
  /** נתיב תמונה תחת /images (לא קיים בצבעים/מספרים) */
  image?: string;
  /** צבע hex (רק בקטגוריית צבעים) */
  color?: string;
  /** ערך מספרי (רק בקטגוריית מספרים) */
  value?: number;
}
