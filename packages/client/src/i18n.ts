export type Locale = 'uz' | 'ru' | 'en';

export interface Translations {
  appName: string;
  appSubtitle: string;
  tagline: string;
  welcome: string;

  // Navigation & Actions
  createRoom: string;
  joinRoom: string;
  quickPlay: string;
  soloPractice: string;
  roomCode: string;
  enterRoomCode: string;
  enterNickname: string;
  maxPlayers: string;
  turnTimer: string;
  mode: string;
  modeFull: string;
  modeShort: string;
  privateRoom: string;
  publicRoom: string;
  copyCode: string;
  codeCopied: string;
  shareLink: string;
  linkCopied: string;
  leaveRoom: string;

  // Lobby
  lobbyTitle: string;
  waitingPlayers: string;
  chooseToken: string;
  chooseColor: string;
  ready: string;
  notReady: string;
  toggleReady: string;
  startGame: string;
  needMorePlayers: string;
  notAllReady: string;
  kick: string;
  hostBadge: string;
  youBadge: string;
  botBadge: string;

  // In-Game
  yourTurn: string;
  waitingTurn: string;
  rollDice: string;
  buyProperty: string;
  declineBuy: string;
  auction: string;
  passAuction: string;
  bid: string;
  endTurn: string;
  inJail: string;
  payJailFine: string;
  useJailCard: string;
  manageProperties: string;
  mortgage: string;
  unmortgage: string;
  buildHouse: string;
  sellHouse: string;
  bankrupt: string;
  victory: string;
  winnerDeclared: string;
  congratulations: string;
  newGame: string;

  // UI Panels
  playersTab: string;
  eventsTab: string;
  chatTab: string;
  chatPlaceholder: string;
  sendChat: string;
  cashLabel: string;
  netWorthLabel: string;
  propertyCount: string;
  rent: string;
  price: string;
  houses: string;
  hotel: string;
  mortgagedBadge: string;

  // Tokens
  tokens: {
    doppi: string;
    choynak: string;
    qozon: string;
    tarvuz: string;
    damas: string;
    tulpar: string;
  };
}

export const DICTIONARY: Record<Locale, Translations> = {
  uz: {
    appName: 'UzMonopoly',
    appSubtitle: 'O‘zbekiston Milliy Biznes O‘yini',
    tagline: '52 katakli shahar, bozorlar va yirik korxonalar monopoliyasi',
    welcome: 'Xush kelibsiz!',

    createRoom: 'Xona yaratish',
    joinRoom: 'Kod orqali kirish',
    quickPlay: 'Tezkor o‘yin',
    soloPractice: 'Botlar bilan mashq',
    roomCode: 'Xona kodi',
    enterRoomCode: '5 xonali kodni kiriting',
    enterNickname: 'Ismingiz yoki taxallusingiz',
    maxPlayers: 'O‘yinchilar soni',
    turnTimer: 'Yurish vaqti',
    mode: 'O‘yin rejimi',
    modeFull: 'To‘liq klassik',
    modeShort: 'Tezkor rejim',
    privateRoom: 'Yopiq xona (faqat kod orqali)',
    publicRoom: 'Ochiq xona',
    copyCode: 'Kodni nusxalash',
    codeCopied: 'Kod nusxalandi!',
    shareLink: 'Havolani ulashish',
    linkCopied: 'Havola nusxalandi!',
    leaveRoom: 'Xonadan chiqish',

    lobbyTitle: 'Kutish zali (Lobby)',
    waitingPlayers: 'O‘yinchilar yig‘ilishi kutilmoqda...',
    chooseToken: 'Fishechka tanlang',
    chooseColor: 'Rangingizni tanlang',
    ready: 'Tayyor',
    notReady: 'Kutilmoqda',
    toggleReady: 'Tayyorman!',
    startGame: 'O‘yinni boshlash',
    needMorePlayers: 'Kamida 2 ta o‘yinchi kerak',
    notAllReady: 'Barcha o‘yinchilar tayyor bo‘lishi shart',
    kick: 'Chiqarib yuborish',
    hostBadge: 'Xona egasi',
    youBadge: 'Siz',
    botBadge: 'AI Bot',

    yourTurn: 'Sizning navbatingiz!',
    waitingTurn: 'Boshqa o‘yinchining navbati',
    rollDice: 'Toshlarni tashlash',
    buyProperty: 'Sotib olish',
    declineBuy: 'Auksionga chiqarish',
    auction: 'Auksion',
    passAuction: 'Pas (O‘tkazib yuborish)',
    bid: 'Taklif kiritish',
    endTurn: 'Navbatni yakunlash',
    inJail: 'Qamoqda',
    payJailFine: 'Jarima to‘lab chiqish (50)',
    useJailCard: 'Qamoqdan chiqish kartasi',
    manageProperties: 'Mulkni boshqarish',
    mortgage: 'Garovga qo‘yish',
    unmortgage: 'Garovdan chiqarish',
    buildHouse: 'Bino qurish',
    sellHouse: 'Binoni sotish',
    bankrupt: 'Bankrot!',
    victory: 'G‘alaba!',
    winnerDeclared: 'G‘olib aniqlandi!',
    congratulations: 'Tabriklaymiz!',
    newGame: 'Yangi o‘yin',

    playersTab: 'O‘yinchilar',
    eventsTab: 'Voqealar',
    chatTab: 'Chat',
    chatPlaceholder: 'Xabar yozing...',
    sendChat: 'Yuborish',
    cashLabel: 'Naqd pul',
    netWorthLabel: 'Umumiy boylik',
    propertyCount: 'Mulklar',
    rent: 'Ijara',
    price: 'Narxi',
    houses: 'uylar',
    hotel: 'Mehmonxona',
    mortgagedBadge: 'GAROVDA',

    tokens: {
      doppi: 'Do‘ppi (Тюбетейка)',
      choynak: 'Choynak (Чайник)',
      qozon: 'Qozon (Казан)',
      tarvuz: 'Tarvuz (Арбуз)',
      damas: 'Damas (Автомобиль)',
      tulpar: 'Tulpar (Qanotli ot)',
    },
  },

  ru: {
    appName: 'UzMonopoly',
    appSubtitle: 'Узбекская Национальная Бизнес-Игра',
    tagline: '52 клетки: города, базары и национальные компании',
    welcome: 'Добро пожаловать!',

    createRoom: 'Создать комнату',
    joinRoom: 'Войти по коду',
    quickPlay: 'Быстрая игра',
    soloPractice: 'Игра против ботов',
    roomCode: 'Код комнаты',
    enterRoomCode: 'Введите 5-значный код',
    enterNickname: 'Ваше имя или никнейм',
    maxPlayers: 'Количество игроков',
    turnTimer: 'Таймер хода',
    mode: 'Режим игры',
    modeFull: 'Полная классическая',
    modeShort: 'Быстрая партия',
    privateRoom: 'Приватная (только по коду)',
    publicRoom: 'Публичная комната',
    copyCode: 'Скопировать код',
    codeCopied: 'Код скопирован!',
    shareLink: 'Поделиться ссылкой',
    linkCopied: 'Ссылка скопирована!',
    leaveRoom: 'Покинуть комнату',

    lobbyTitle: 'Лобби ожидания',
    waitingPlayers: 'Ожидание игроков...',
    chooseToken: 'Выберите фишку',
    chooseColor: 'Выберите цвет',
    ready: 'Готов',
    notReady: 'Не готов',
    toggleReady: 'Я готов!',
    startGame: 'Начать игру',
    needMorePlayers: 'Нужно минимум 2 игрока',
    notAllReady: 'Все игроки должны нажать «Готов»',
    kick: 'Исключить',
    hostBadge: 'Хост',
    youBadge: 'Вы',
    botBadge: 'Бот',

    yourTurn: 'Ваш ход!',
    waitingTurn: 'Ход другого игрока',
    rollDice: 'Бросить кубики',
    buyProperty: 'Купить компанию',
    declineBuy: 'Выставить на аукцион',
    auction: 'Аукцион',
    passAuction: 'Пас',
    bid: 'Сделать ставку',
    endTurn: 'Завершить ход',
    inJail: 'В тюрьме',
    payJailFine: 'Выйти под залог (50)',
    useJailCard: 'Использовать карту выхода',
    manageProperties: 'Управление имуществом',
    mortgage: 'Заложить',
    unmortgage: 'Выкупить',
    buildHouse: 'Построить филиал',
    sellHouse: 'Продать филиал',
    bankrupt: 'Банкрот!',
    victory: 'Победа!',
    winnerDeclared: 'Победитель определен!',
    congratulations: 'Поздравляем!',
    newGame: 'В главное меню',

    playersTab: 'Игроки',
    eventsTab: 'События',
    chatTab: 'Чат',
    chatPlaceholder: 'Напишите сообщение...',
    sendChat: 'Отправить',
    cashLabel: 'Наличные',
    netWorthLabel: 'Капитал',
    propertyCount: 'Активы',
    rent: 'Аренда',
    price: 'Цена',
    houses: 'филиала',
    hotel: 'Штаб-квартира',
    mortgagedBadge: 'В ЗАЛОГЕ',

    tokens: {
      doppi: 'Тюбетейка (Do‘ppi)',
      choynak: 'Чайник (Choynak)',
      qozon: 'Казан (Qozon)',
      tarvuz: 'Арбуз (Tarvuz)',
      damas: 'Дамас (Damas)',
      tulpar: 'Тулпар (Tulpar)',
    },
  },

  en: {
    appName: 'UzMonopoly',
    appSubtitle: 'Uzbek National Business Board Game',
    tagline: '52 tiles featuring Uzbekistan cities, bazaars and top enterprises',
    welcome: 'Welcome!',

    createRoom: 'Create Room',
    joinRoom: 'Join by Code',
    quickPlay: 'Quick Play',
    soloPractice: 'Play vs Bots',
    roomCode: 'Room Code',
    enterRoomCode: 'Enter 5-character code',
    enterNickname: 'Your nickname',
    maxPlayers: 'Players count',
    turnTimer: 'Turn timer',
    mode: 'Game Mode',
    modeFull: 'Classic Full',
    modeShort: 'Fast Mode',
    privateRoom: 'Private (code only)',
    publicRoom: 'Public room',
    copyCode: 'Copy Code',
    codeCopied: 'Code copied!',
    shareLink: 'Share Link',
    linkCopied: 'Link copied!',
    leaveRoom: 'Leave Room',

    lobbyTitle: 'Game Lobby',
    waitingPlayers: 'Waiting for players...',
    chooseToken: 'Choose Token',
    chooseColor: 'Choose Color',
    ready: 'Ready',
    notReady: 'Not Ready',
    toggleReady: 'Ready Up!',
    startGame: 'Start Game',
    needMorePlayers: 'Need at least 2 players',
    notAllReady: 'All players must be ready',
    kick: 'Kick',
    hostBadge: 'Host',
    youBadge: 'You',
    botBadge: 'AI Bot',

    yourTurn: 'Your Turn!',
    waitingTurn: 'Waiting for opponent...',
    rollDice: 'Roll Dice',
    buyProperty: 'Buy Property',
    declineBuy: 'Send to Auction',
    auction: 'Auction',
    passAuction: 'Pass',
    bid: 'Place Bid',
    endTurn: 'End Turn',
    inJail: 'In Jail',
    payJailFine: 'Pay Fine & Leave (50)',
    useJailCard: 'Use Get Out of Jail Card',
    manageProperties: 'Manage Assets',
    mortgage: 'Mortgage',
    unmortgage: 'Unmortgage',
    buildHouse: 'Build Branch',
    sellHouse: 'Sell Branch',
    bankrupt: 'Bankrupt!',
    victory: 'Victory!',
    winnerDeclared: 'Winner Decided!',
    congratulations: 'Congratulations!',
    newGame: 'Main Menu',

    playersTab: 'Players',
    eventsTab: 'Event Log',
    chatTab: 'Live Chat',
    chatPlaceholder: 'Type a message...',
    sendChat: 'Send',
    cashLabel: 'Cash',
    netWorthLabel: 'Net Worth',
    propertyCount: 'Properties',
    rent: 'Rent',
    price: 'Price',
    houses: 'branches',
    hotel: 'Headquarters',
    mortgagedBadge: 'MORTGAGED',

    tokens: {
      doppi: 'Doppi (Traditional Skullcap)',
      choynak: 'Choynak (Ceramic Teapot)',
      qozon: 'Qozon (Iron Cauldron)',
      tarvuz: 'Tarvuz (Fresh Watermelon)',
      damas: 'Damas (Microbus)',
      tulpar: 'Tulpar (Winged Horse)',
    },
  },
};
