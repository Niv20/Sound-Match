/* ===========================================================================
   categories.config.ts — מטא-דאטה של 8 הקטגוריות (בסדר התצוגה).
   =========================================================================== */

export type CategoryType = 'images' | 'colors' | 'numbers' | 'grouped';

export interface SubgroupDef {
  id: string;
  he: string;
  icon: string;
}

export interface CategoryDef {
  id: string;
  he: string;
  /** סוג זרימה: רשת תמונות / צבעים / מספרים / מקובץ לתת-קבוצות */
  type: CategoryType;
  /** Material Symbol name */
  icon: string;
  /** צבע מבטא לאריח */
  color: string;
  /** תת-קבוצות (רק עבור type === 'grouped') */
  subgroups?: SubgroupDef[];
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'numbers', he: 'מִסְפָּרִים', type: 'numbers', icon: 'tag', color: '#7c5cff' },
  {
    id: 'animals',
    he: 'חַיּוֹת',
    type: 'grouped',
    icon: 'pets',
    color: '#36d399',
    subgroups: [
      { id: 'wild', he: 'חַיּוֹת בָּר', icon: 'forest' },
      { id: 'farm', he: 'חַיּוֹת מֶשֶׁק', icon: 'agriculture' },
      { id: 'sea', he: 'חַיּוֹת יָם', icon: 'water' },
      { id: 'birds', he: 'צִפּוֹרִים', icon: 'flutter_dash' },
    ],
  },
  { id: 'colors', he: 'צְבָעִים', type: 'colors', icon: 'palette', color: '#ff6fb5' },
  { id: 'music', he: 'מוּזִיקָה', type: 'images', icon: 'music_note', color: '#ffc83d' },
  { id: 'fruits', he: 'פֵּרוֹת', type: 'images', icon: 'nutrition', color: '#ff5470' },
  { id: 'vegetables', he: 'יְרָקוֹת', type: 'images', icon: 'eco', color: '#34c759' },
  { id: 'desserts', he: 'קִנּוּחִים', type: 'images', icon: 'icecream', color: '#ff8c1a' },
  { id: 'characters', he: 'דְּמוּיוֹת', type: 'images', icon: 'theater_comedy', color: '#3b82f6' },
];

export const CATEGORY_BY_ID: Record<string, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);
