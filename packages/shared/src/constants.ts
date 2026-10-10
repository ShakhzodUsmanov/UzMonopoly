export const TOTAL_TILES = 52;

export const START_CASH = 3000;
export const SALARY_PASS_GO = 300;
export const JAIL_FINE = 100;
export const MAX_PLAYERS = 6;
export const MIN_PLAYERS = 2;

export const MAX_HOUSES_PER_TILE = 4;
export const HOTEL_LEVEL = 5;
export const TOTAL_BANK_HOUSES = 32;
export const TOTAL_BANK_HOTELS = 12;

export const DEFAULT_TURN_TIMEOUT_SEC = 60;
export const AUCTION_TIMEOUT_SEC = 20;
export const RECONNECT_TIMEOUT_SEC = 60;

export const TOKENS = [
  { id: 'doppi', nameUz: "Do'ppi", nameRu: 'Тюбетейка', nameEn: 'Tubeteika', icon: '🧢' },
  { id: 'choynak', nameUz: 'Choynak', nameRu: 'Чайник', nameEn: 'Teapot', icon: '🫖' },
  { id: 'qozon', nameUz: 'Qozon', nameRu: 'Казан', nameEn: 'Cauldron', icon: '🍲' },
  { id: 'tarvuz', nameUz: 'Tarvuz', nameRu: 'Арбуз', nameEn: 'Watermelon', icon: '🍉' },
  { id: 'damas', nameUz: 'Damas', nameRu: 'Дамас', nameEn: 'Damas Van', icon: '🚐' },
  { id: 'tulpar', nameUz: 'Tulpar', nameRu: 'Тулпар', nameEn: 'Winged Horse', icon: '🐎' },
] as const;

export type TokenId = (typeof TOKENS)[number]['id'];

export const PLAYER_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
] as const;

export const COLOR_GROUPS = [
  {
    id: 'bakery',
    nameUz: 'Novvoyxona va shirinliklar',
    nameRu: 'Выпечка и десерты',
    nameEn: 'Bakery & Desserts',
    color: '#8B5A2B',
    houseCost: 50,
  },
  {
    id: 'fastfood',
    nameUz: 'Fastfud',
    nameRu: 'Фастфуд',
    nameEn: 'Fast Food',
    color: '#F97316',
    houseCost: 50,
  },
  {
    id: 'markets',
    nameUz: 'Bozorlar',
    nameRu: 'Рынки и места',
    nameEn: 'Markets & Bazaars',
    color: '#EAB308',
    houseCost: 50,
  },
  {
    id: 'retail',
    nameUz: 'Chakana savdo',
    nameRu: 'Ритейл',
    nameEn: 'Retail',
    color: '#10B981',
    houseCost: 100,
  },
  {
    id: 'fuel',
    nameUz: 'Yoqilgi',
    nameRu: 'Топливо',
    nameEn: 'Fuel & Gas',
    color: '#06B6D4',
    houseCost: 100,
  },
  {
    id: 'payments',
    nameUz: 'Tolov tizimlari',
    nameRu: 'Платежи',
    nameEn: 'Payment Systems',
    color: '#3B82F6',
    houseCost: 100,
  },
  {
    id: 'mobile',
    nameUz: 'Mobil operatorlar',
    nameRu: 'Мобильные операторы',
    nameEn: 'Mobile Carriers',
    color: '#6366F1',
    houseCost: 150,
  },
  {
    id: 'telecom',
    nameUz: 'Internet va aloqa',
    nameRu: 'Телеком и интернет',
    nameEn: 'Telecom & ISP',
    color: '#8B5CF6',
    houseCost: 150,
  },
  {
    id: 'marketplaces',
    nameUz: 'Marketpleyslar',
    nameRu: 'Маркетплейсы',
    nameEn: 'Marketplaces',
    color: '#EC4899',
    houseCost: 150,
  },
  {
    id: 'payment_cards',
    nameUz: 'Tolov kartalari',
    nameRu: 'Платёжные карты',
    nameEn: 'Card Networks',
    color: '#14B8A6',
    houseCost: 150,
  },
  {
    id: 'real_estate',
    nameUz: 'Kozgalmas mulk',
    nameRu: 'Недвижимость',
    nameEn: 'Real Estate',
    color: '#F43F5E',
    houseCost: 200,
  },
  {
    id: 'automotive',
    nameUz: 'Avtomobillar',
    nameRu: 'Автомобили',
    nameEn: 'Automotive',
    color: '#64748B',
    houseCost: 200,
  },
  {
    id: 'banking',
    nameUz: 'Banklar',
    nameRu: 'Банки',
    nameEn: 'Banking',
    color: '#475569',
    houseCost: 200,
  },
  {
    id: 'aviation',
    nameUz: 'Aviakompaniyalar',
    nameRu: 'Авиакомпании',
    nameEn: 'Aviation',
    color: '#0284C7',
    houseCost: 200,
  },
] as const;

export type GroupId = (typeof COLOR_GROUPS)[number]['id'];
