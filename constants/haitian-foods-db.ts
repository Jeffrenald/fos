export interface HaitianFood {
  id: string;
  name_ht: string;
  name_en: string;
  name_fr: string;
  serving_g: number;
  kcal: number;
  p: number;
  c: number;
  f: number;
  category: 'main' | 'side' | 'soup' | 'snack' | 'drink';
}

export const HAITIAN_FOODS: HaitianFood[] = [
  { id: 'griot',         name_ht: 'Griot',          name_en: 'Fried Pork',           name_fr: 'Porc Frit',             serving_g: 100, kcal: 258, p: 25, c: 0,  f: 18, category: 'main'  },
  { id: 'diri-ak-pwa',   name_ht: 'Diri ak Pwa',    name_en: 'Rice & Beans',          name_fr: 'Riz et Pois',           serving_g: 180, kcal: 204, p: 8,  c: 34, f: 4,  category: 'main'  },
  { id: 'legume',        name_ht: 'Legume',          name_en: 'Braised Vegetables',    name_fr: 'Légumes Braisés',       serving_g: 200, kcal: 174, p: 9,  c: 22, f: 6,  category: 'main'  },
  { id: 'bannann-peze',  name_ht: 'Bannann Peze',    name_en: 'Fried Plantain',        name_fr: 'Banane Pesée Frite',    serving_g: 80,  kcal: 148, p: 1,  c: 28, f: 4,  category: 'side'  },
  { id: 'soup-joumou',   name_ht: 'Soup Joumou',     name_en: 'Pumpkin Beef Soup',     name_fr: 'Soupe au Giraumon',     serving_g: 350, kcal: 196, p: 14, c: 18, f: 8,  category: 'soup'  },
  { id: 'tassot-cabrit', name_ht: 'Tassot Kabrit',   name_en: 'Fried Goat',            name_fr: 'Tassot de Cabri',       serving_g: 100, kcal: 242, p: 28, c: 2,  f: 14, category: 'main'  },
  { id: 'tassot-bef',    name_ht: 'Tassot Bèf',      name_en: 'Fried Beef',            name_fr: 'Tassot de Boeuf',       serving_g: 100, kcal: 224, p: 26, c: 1,  f: 13, category: 'main'  },
  { id: 'poul-ak-nwa',   name_ht: 'Poul ak Nwa',     name_en: 'Chicken with Cashews',  name_fr: 'Poulet aux Noix',       serving_g: 200, kcal: 312, p: 32, c: 8,  f: 18, category: 'main'  },
  { id: 'akra',          name_ht: 'Akra',             name_en: 'Malanga Fritters',      name_fr: 'Acras de Malanga',      serving_g: 60,  kcal: 164, p: 3,  c: 20, f: 8,  category: 'snack' },
  { id: 'marinad',       name_ht: 'Marinad',          name_en: 'Fried Dough',           name_fr: 'Marinade',              serving_g: 50,  kcal: 142, p: 3,  c: 18, f: 7,  category: 'snack' },
  { id: 'pain-patate',   name_ht: 'Pain Patate',      name_en: 'Sweet Potato Cake',     name_fr: 'Pain Patate',           serving_g: 80,  kcal: 220, p: 3,  c: 38, f: 7,  category: 'snack' },
  { id: 'labouyi',       name_ht: 'Labouyi Bannann',  name_en: 'Banana Porridge',       name_fr: 'Bouillie de Banane',    serving_g: 250, kcal: 188, p: 4,  c: 36, f: 4,  category: 'main'  },
  { id: 'diri-blan',     name_ht: 'Diri Blan',        name_en: 'White Rice',            name_fr: 'Riz Blanc',             serving_g: 180, kcal: 206, p: 4,  c: 45, f: 0,  category: 'side'  },
  { id: 'kafe-ayisyen',  name_ht: 'Kafe Ayisyen',     name_en: 'Haitian Coffee',        name_fr: 'Café Haïtien',          serving_g: 240, kcal: 12,  p: 1,  c: 2,  f: 0,  category: 'drink' },
  { id: 'jus-korosol',   name_ht: 'Jus Korosol',      name_en: 'Soursop Juice',         name_fr: 'Jus de Corossol',       serving_g: 250, kcal: 148, p: 1,  c: 36, f: 1,  category: 'drink' },
];

export const HAITIAN_PROVERBS = [
  { ht: 'Dèyè mòn gen mòn',          en: 'Beyond mountains, more mountains',       fr: 'Derrière les montagnes, il y a des montagnes' },
  { ht: 'Ti pa ti pa, ou rive lwen',  en: 'Step by step, you go far',               fr: 'Pas à pas, on va loin' },
  { ht: 'Piti piti zwazo fè nich li', en: 'Little by little, the bird builds its nest', fr: 'Petit à petit, l\'oiseau fait son nid' },
  { ht: 'Men anpil chay pa lou',      en: 'Many hands make the load light',          fr: 'Plusieurs mains allègent la charge' },
  { ht: 'Sak vid pa kanpe',           en: 'An empty sack cannot stand',              fr: 'Un sac vide ne peut pas se tenir debout' },
  { ht: 'Bouche ou pa fè ou bèl',     en: "Keeping quiet doesn't make you beautiful", fr: 'Se taire ne vous rend pas beau' },
];
