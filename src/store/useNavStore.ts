import { create } from 'zustand';
import { SCREENS, type ScreenId } from '../config/constants';
import { CATEGORY_BY_ID } from '../config/categories.config';

interface NavState {
  screen: ScreenId;
  categoryId: string | null;
  subgroup: string | null;
  /** מסך לחזור אליו אחרי הגדרות/הוראות */
  returnTo: ScreenId;

  goHome: () => void;
  openCategories: () => void;
  /** בוחר קטגוריה ומנתב למסך המתאים לפי הסוג. */
  selectCategory: (id: string) => void;
  selectSubgroup: (sg: string) => void;
  openSettings: () => void;
  openInstructions: () => void;
  /** חזרה מהגדרות/הוראות. */
  back: () => void;
  go: (screen: ScreenId) => void;
}

export const useNavStore = create<NavState>((set, get) => ({
  screen: SCREENS.HOME,
  categoryId: null,
  subgroup: null,
  returnTo: SCREENS.HOME,

  goHome: () => set({ screen: SCREENS.HOME, categoryId: null, subgroup: null }),
  openCategories: () => set({ screen: SCREENS.CATEGORIES, categoryId: null, subgroup: null }),

  selectCategory: (id) => {
    const cat = CATEGORY_BY_ID[id];
    if (!cat) return;
    let next: ScreenId = SCREENS.CATEGORY_ITEMS;
    if (cat.type === 'numbers') next = SCREENS.NUMBERS_RANGE;
    else if (cat.type === 'grouped') next = SCREENS.ANIMAL_SUBGROUP;
    set({ categoryId: id, subgroup: null, screen: next });
  },

  selectSubgroup: (sg) => set({ subgroup: sg, screen: SCREENS.CATEGORY_ITEMS }),

  openSettings: () => set({ returnTo: get().screen, screen: SCREENS.SETTINGS }),
  openInstructions: () => set({ returnTo: get().screen, screen: SCREENS.INSTRUCTIONS }),
  back: () => set({ screen: get().returnTo }),
  go: (screen) => set({ screen }),
}));
