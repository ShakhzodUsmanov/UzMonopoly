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

  // Trading
  trade: string;
  proposeTrade: string;
  tradeWith: string;
  myOffer: string;
  myRequest: string;
  acceptTrade: string;
  declineTrade: string;
  noTradePartners: string;

  // Debt & Bankruptcy
  debtTitle: string;
  debtAmount: string;
  creditor: string;
  payDebt: string;
  declareBankruptcy: string;
  needToRaise: string;

  // Balance
  currentBalance: string;
  balanceAfter: string;

  // Modals
  buyModal: {
    header: string;
    thinking: string;
  };
  auctionModal: {
    header: string;
    currentBid: string;
    noBids: string;
    highBidder: string;
    you: string;
    beFirst: string;
    participants: string;
    quickBid: string;
    bid: string;
    youPassed: string;
  };
  tradeModal: {
    header: string;
    receivedProposal: string;
    proposalNotice: string;
    theyGive: string;
    theyWant: string;
    accept: string;
    reject: string;
    waitingResponse: string;
    reviewingNotice: string;
    cancelProposal: string;
    tradeWith: string;
    iGive: string;
    iGet: string;
    money: string;
    properties: string;
    noProperties: string;
    sendProposal: string;
  };
  cardModal: {
    imkonTitle: string;
    xazinaTitle: string;
    understand: string;
  };
  propertyModal: {
    header: string;
    noBuildings: string;
    mortgagedBadge: string;
    construction: string;
    buildBranch: string;
    mortgageSection: string;
    mortgage: string;
    unmortgage: string;
  };
  debtModal: {
    header: string;
    creditor: string;
    bank: string;
    remainingToCollect: string;
    payFullDebt: string;
    liquidationHelp: string;
    sellBuildings: string;
    mortgageProperties: string;
    declareBankruptcy: string;
    confirmBankruptcy: string;
  };
  gameOverModal: {
    victoryTitle: string;
    totalCapital: string;
    propertiesOwned: string;
    branchesBuilt: string;
    turnsPlayed: string;
    playAgain: string;
    homeMenu: string;
  };
  propertyCard: {
    baseRent: string;
    fullGroupRent: string;
    mortgageValue: string;
    house: string;
    hotel: string;
  };

  // Why Can't I Reasons
  reasons: {
    reasonNotOwner: string;
    reasonNeedMonopoly: string;
    reasonGroupMortgaged: string;
    reasonMaxBuildings: string;
    reasonEvenBuild: string;
    reasonInsufficientCash: string;
    reasonNoBuildings: string;
    reasonEvenSell: string;
    reasonAlreadyMortgaged: string;
    reasonBuildingsExist: string;
    reasonNotMortgaged: string;
    reasonAlreadyHighBidder: string;
  };

  // Cards & Chance
  chanceCard: string;
  chestCard: string;
  continueBtn: string;

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

  // Phase 6: Legal, Shortcuts, Bot & Mode
  footerDisclaimer: string;
  keyboardShortcutsGuide: string;
  addBot: string;
  shortGameRemaining: string;
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

    trade: 'Almashish (Savdo)',
    proposeTrade: 'Taklif yuborish',
    tradeWith: 'Kim bilan almashmoqchisiz?',
    myOffer: 'Siz taklif qilasiz:',
    myRequest: 'Siz so‘raysiz:',
    acceptTrade: 'Qabul qilish',
    declineTrade: 'Rad etish',
    noTradePartners: 'Almashish uchun faol o‘yinchilar yo‘q',

    debtTitle: 'Qarzni to‘lash talab qilinadi!',
    debtAmount: 'Qarz miqdori:',
    creditor: 'Kreditor:',
    payDebt: 'Qarzni to‘lash',
    declareBankruptcy: 'Bankrot deb e‘lon qilish',
    needToRaise: 'Mablag‘ yetmayapti. Bino sotish yoki mulkni garovga qo‘yish kerak.',

    currentBalance: 'Joriy hisobingiz',
    balanceAfter: 'Xariddan keyingi qoldiq',

    buyModal: {
      header: 'MULKNI XARID QILISH',
      thinking: 'qaror qabul qilmoqda...',
    },
    auctionModal: {
      header: 'MULK AUKSIONI',
      currentBid: 'Eng yuqori taklif',
      noBids: 'Hozircha takliflar yo‘q',
      highBidder: 'Yetakchi o‘yinchi',
      you: 'Siz',
      beFirst: 'Birinchi bo‘lib taklif bering!',
      participants: 'Ishtirokchilar',
      quickBid: 'Tezkor stavka',
      bid: 'Taklif',
      youPassed: 'Siz ushbu auksionda pas bergansiz',
    },
    tradeModal: {
      header: 'AYIRBOSHLASH (SAVDO)',
      receivedProposal: 'KELIB TUSHGAN TAKLIF',
      proposalNotice: 'quyidagi shartlar bilan almashishni taklif qilmoqda',
      theyGive: 'U taklif qiladi',
      theyWant: 'U so‘raydi',
      accept: 'Taklifni qabul qilish',
      reject: 'Taklifni rad etish',
      waitingResponse: 'Javob kutilmoqda...',
      reviewingNotice: 'siz yuborgan taklifni ko‘rib chiqmoqda.',
      cancelProposal: 'Taklifni qaytarib olish',
      tradeWith: 'Hamkor',
      iGive: 'Men beraman',
      iGet: 'Men olaman',
      money: 'Mablag‘ (so‘m)',
      properties: 'Mulklar ro‘yxati',
      noProperties: 'Mavjud mulklar yo‘q',
      sendProposal: 'Ayirboshlash taklifini yuborish',
    },
    cardModal: {
      imkonTitle: 'IMKON KARTASI',
      xazinaTitle: 'XAZINA KARTASI',
      understand: 'Tushunarli, davom etish',
    },
    propertyModal: {
      header: 'MULKNI BOSHQARISH',
      noBuildings: 'Hozircha binolar yo‘q',
      mortgagedBadge: 'GAROVGA QO‘YILGAN',
      construction: 'Qurilish boshqaruvi',
      buildBranch: 'Filial qurish',
      mortgageSection: 'Garov va kredit',
      mortgage: 'Garovga qo‘yish',
      unmortgage: 'Garovdan chiqarish',
    },
    debtModal: {
      header: 'QARZNI TO‘LASH TALAB QILINADI!',
      creditor: 'Kreditor',
      bank: 'O‘zbekiston Banki',
      remainingToCollect: 'Yig‘ish kerak bo‘lgan summa',
      payFullDebt: 'Qarzni to‘liq uzish',
      liquidationHelp: 'Mablag‘ yetarli emas. Bino soting yoki mulkni garovga qo‘ying:',
      sellBuildings: 'Sotiladigan binolar',
      mortgageProperties: 'Garovga qo‘yiladigan mulklar',
      declareBankruptcy: 'Bankrot deb tan olish',
      confirmBankruptcy:
        'Haqiqatan ham bankrotlik e‘lon qilmoqchimisiz? Barcha mulklaringiz musodara qilinadi!',
    },
    gameOverModal: {
      victoryTitle: 'O‘YIN G‘OLIBI ANIQLANDI!',
      totalCapital: 'Umumiy boylik',
      propertiesOwned: 'Egalikdagi mulklar',
      branchesBuilt: 'Qurilgan filiallar',
      turnsPlayed: 'Yurishlar soni',
      playAgain: 'Qayta o‘ynash',
      homeMenu: 'Bosh sahifaga qaytish',
    },
    propertyCard: {
      baseRent: 'Oddiy ijara',
      fullGroupRent: 'Monopoliya bilan ijara',
      mortgageValue: 'Garov qiymati',
      house: 'filial',
      hotel: 'Bosh ofis (Mehmonxona)',
    },

    reasons: {
      reasonNotOwner: 'Siz bu mulkning egasi emassiz',
      reasonNeedMonopoly: 'Guruhning barcha mulklariga egalik qilish shart',
      reasonGroupMortgaged: 'Guruhda garovdagi mulk bor, avval uni qutqaring',
      reasonMaxBuildings: 'Maksimal bino allaqachon qurilgan',
      reasonEvenBuild: 'Qurilish bir tekis bo‘lishi shart (farq 1 tadan oshmasin)',
      reasonInsufficientCash: 'Mablag‘ yetarli emas',
      reasonNoBuildings: 'Mulkda sotish uchun binolar yo‘q',
      reasonEvenSell: 'Binolar bir tekis sotilishi shart',
      reasonAlreadyMortgaged: 'Mulk allaqachon garovga qo‘yilgan',
      reasonBuildingsExist: 'Guruhda binolar bor, avval ularni soting',
      reasonNotMortgaged: 'Mulk garovda emas',
      reasonAlreadyHighBidder: 'Siz allaqachon eng yuqori taklif bergansiz',
    },

    chanceCard: 'Imkoniyat kartasi',
    chestCard: 'Xazina kartasi',
    continueBtn: 'Tushunarli, davom etish',

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

    footerDisclaimer:
      'UzMonopoly / UzBiznes — O‘zbekiston milliy biznes o‘yini. Loyiha eslatib o‘tilgan brendlar (Uzum, Korzinka, Payme, Click, Humo, Uzcard va b.) bilan rasmiy bog‘liq emas. Barcha nomlar o‘yin va ko‘ngilochar maqsadlarda ishlatilgan.',
    keyboardShortcutsGuide:
      'Tugmalar: Probel / R — Tosh tashlash, B — Sotib olish, D — Auksion, E — Yurishni tugatish, Esc — Yopish',
    addBot: 'AI Bot qo‘shish',
    shortGameRemaining: 'Qisqa o‘yin: qolgan yurishlar',
  },

  ru: {
    appName: 'UzMonopoly',
    appSubtitle: 'Узбекская Национальная Бизнес-Игра',
    tagline: '52 клетки: города, базары и национальные компании',
    welcome: 'Добро пожаловать!',

    createRoom: 'Создать комнату',
    joinRoom: 'Войти по коду',
    quickPlay: 'Быстрая игра',
    soloPractice: 'Тренировка с ботами',
    roomCode: 'Код комнаты',
    enterRoomCode: 'Введите 5-значный код',
    enterNickname: 'Ваше имя или никнейм',
    maxPlayers: 'Количество игроков',
    turnTimer: 'Время на ход',
    mode: 'Режим игры',
    modeFull: 'Полный классический',
    modeShort: 'Быстрый матч',
    privateRoom: 'Приватная комната (по коду)',
    publicRoom: 'Открытая комната',
    copyCode: 'Копировать код',
    codeCopied: 'Код скопирован!',
    shareLink: 'Поделиться ссылкой',
    linkCopied: 'Ссылка скопирована!',
    leaveRoom: 'Покинуть комнату',

    lobbyTitle: 'Лобби ожидания',
    waitingPlayers: 'Ожидание подключения игроков...',
    chooseToken: 'Выберите фишку',
    chooseColor: 'Выберите цвет',
    ready: 'Готов',
    notReady: 'Не готов',
    toggleReady: 'Я готов!',
    startGame: 'Начать игру',
    needMorePlayers: 'Нужно минимум 2 игрока',
    notAllReady: 'Все игроки должны нажать «Готов»',
    kick: 'Исключить',
    hostBadge: 'Создатель',
    youBadge: 'Вы',
    botBadge: 'AI Бот',

    yourTurn: 'Ваш ход!',
    waitingTurn: 'Ход соперника...',
    rollDice: 'Бросить кубики',
    buyProperty: 'Купить актив',
    declineBuy: 'На аукцион',
    auction: 'Аукцион',
    passAuction: 'Пас',
    bid: 'Сделать ставку',
    endTurn: 'Завершить ход',
    inJail: 'В тюрьме',
    payJailFine: 'Заплатить штраф (50)',
    useJailCard: 'Карточка выхода из тюрьмы',
    manageProperties: 'Управление активами',
    mortgage: 'Заложить',
    unmortgage: 'Выкупить из залога',
    buildHouse: 'Построить филиал',
    sellHouse: 'Продать филиал',
    bankrupt: 'Банкрот!',
    victory: 'Победа!',
    winnerDeclared: 'Победитель определён!',
    congratulations: 'Поздравляем!',
    newGame: 'Главное меню',

    trade: 'Обмен (Сделка)',
    proposeTrade: 'Предложить сделку',
    tradeWith: 'Партнер по сделке:',
    myOffer: 'Вы отдаёте:',
    myRequest: 'Вы получаете:',
    acceptTrade: 'Принять сделку',
    declineTrade: 'Отклонить сделку',
    noTradePartners: 'Нет доступных игроков для торговли',

    debtTitle: 'Необходимо погасить долг!',
    debtAmount: 'Сумма долга:',
    creditor: 'Кредитор:',
    payDebt: 'Оплатить долг',
    declareBankruptcy: 'Объявить банкротство',
    needToRaise: 'Недостаточно денег. Продайте филиалы или заложите активы.',

    currentBalance: 'Текущий баланс',
    balanceAfter: 'Баланс после покупки',

    buyModal: {
      header: 'ПОКУПКА АКТИВА',
      thinking: 'принимает решение...',
    },
    auctionModal: {
      header: 'АУКЦИОН АКТИВА',
      currentBid: 'Текущая ставка',
      noBids: 'Ставок пока нет',
      highBidder: 'Лидер аукциона',
      you: 'Вы',
      beFirst: 'Сделайте первую ставку!',
      participants: 'Участники',
      quickBid: 'Быстрая ставка',
      bid: 'Повысить',
      youPassed: 'Вы спасовали на этом аукционе',
    },
    tradeModal: {
      header: 'ОБМЕН И СДЕЛКИ',
      receivedProposal: 'ВХОДЯЩЕЕ ПРЕДЛОЖЕНИЕ',
      proposalNotice: 'предлагает обмен со следующими условиями',
      theyGive: 'Партнер отдает',
      theyWant: 'Партнер хочет',
      accept: 'Принять сделку',
      reject: 'Отклонить сделку',
      waitingResponse: 'Ожидание ответа...',
      reviewingNotice: 'рассматривает ваше предложение обмена.',
      cancelProposal: 'Отозвать предложение',
      tradeWith: 'С кем меняться',
      iGive: 'Я отдаю',
      iGet: 'Я получаю',
      money: 'Деньги (so‘m)',
      properties: 'Активы',
      noProperties: 'Нет подходящих активов',
      sendProposal: 'Отправить предложение',
    },
    cardModal: {
      imkonTitle: 'КАРТОЧКА «ИМКОН»',
      xazinaTitle: 'КАРТОЧКА «ХАЗИНА»',
      understand: 'Понятно, продолжить',
    },
    propertyModal: {
      header: 'УПРАВЛЕНИЕ АКТИВОМ',
      noBuildings: 'Построек пока нет',
      mortgagedBadge: 'В ЗАЛОГЕ',
      construction: 'Строительство филиалов',
      buildBranch: 'Построить филиал',
      mortgageSection: 'Залог и выкуп',
      mortgage: 'Заложить актив',
      unmortgage: 'Выкупить из залога',
    },
    debtModal: {
      header: 'ТРЕБУЕТСЯ ПОГАСИТЬ ДОЛГ!',
      creditor: 'Кредитор',
      bank: 'Банк Узбекистана',
      remainingToCollect: 'Осталось собрать',
      payFullDebt: 'Погасить долг полностью',
      liquidationHelp: 'Средств не хватает. Продайте филиалы или заложите активы:',
      sellBuildings: 'Продажа построек',
      mortgageProperties: 'Залог активов',
      declareBankruptcy: 'Сдаться (Банкротство)',
      confirmBankruptcy: 'Вы уверены, что хотите объявить банкротство? Вы покинете игру!',
    },
    gameOverModal: {
      victoryTitle: 'ПОБЕДА В ИГРЕ!',
      totalCapital: 'Капитал победителя',
      propertiesOwned: 'Куплено активов',
      branchesBuilt: 'Построено филиалов',
      turnsPlayed: 'Сделано ходов',
      playAgain: 'Сыграть снова',
      homeMenu: 'В главное меню',
    },
    propertyCard: {
      baseRent: 'Обычная аренда',
      fullGroupRent: 'Аренда с монополией',
      mortgageValue: 'Стоимость залога',
      house: 'филиал',
      hotel: 'Отель (Штаб-квартира)',
    },

    reasons: {
      reasonNotOwner: 'Вы не владеете этим активом',
      reasonNeedMonopoly: 'Нужна полная монополия группы улиц',
      reasonGroupMortgaged: 'В группе есть заложенный актив, выкупите его',
      reasonMaxBuildings: 'Максимальный уровень (Отель) уже построен',
      reasonEvenBuild: 'Строить нужно равномерно (разница не более 1 филиала)',
      reasonInsufficientCash: 'Недостаточно сумов на балансе',
      reasonNoBuildings: 'На активе нет построек для продажи',
      reasonEvenSell: 'Продавать нужно равномерно по всей группе',
      reasonAlreadyMortgaged: 'Актив уже находится в залоге',
      reasonBuildingsExist: 'В группе есть филиалы, сначала продайте их',
      reasonNotMortgaged: 'Актив не заложен',
      reasonAlreadyHighBidder: 'Ваша ставка уже является наивысшей',
    },

    chanceCard: 'Карточка «Имкон»',
    chestCard: 'Карточка «Хазина»',
    continueBtn: 'Понятно, продолжить',

    playersTab: 'Игроки',
    eventsTab: 'События',
    chatTab: 'Чат',
    chatPlaceholder: 'Написать сообщение...',
    sendChat: 'Отправить',
    cashLabel: 'Наличные',
    netWorthLabel: 'Капитал',
    propertyCount: 'Активы',
    rent: 'Аренда',
    price: 'Цена',
    houses: 'филиалы',
    hotel: 'Штаб-квартира',
    mortgagedBadge: 'В ЗАЛОГЕ',

    tokens: {
      doppi: 'Do‘ppi (Тюбетейка)',
      choynak: 'Choynak (Чайник)',
      qozon: 'Qozon (Казан)',
      tarvuz: 'Tarvuz (Арбуз)',
      damas: 'Damas (Автомобиль)',
      tulpar: 'Tulpar (Крылатый конь)',
    },

    footerDisclaimer:
      'UzMonopoly / UzBiznes — Узбекская национальная бизнес-игра. Проект не связан с упомянутыми компаниями (Uzum, Korzinka, Payme, Click, Humo, Uzcard и др.). Названия используются исключительно в игровых и развлекательных целях.',
    keyboardShortcutsGuide:
      'Горячие клавиши: Пробел / R — Бросить кубики, B — Купить, D — На аукцион, E — Завершить ход, Esc — Закрыть',
    addBot: 'Добавить AI Бота',
    shortGameRemaining: 'Быстрый матч: ходов осталось',
  },

  en: {
    appName: 'UzMonopoly',
    appSubtitle: 'Uzbek National Business Board Game',
    tagline: '52 tiles of cities, grand bazaars, and national enterprises',
    welcome: 'Welcome!',

    createRoom: 'Create Room',
    joinRoom: 'Join with Code',
    quickPlay: 'Quick Match',
    soloPractice: 'Practice vs Bots',
    roomCode: 'Room Code',
    enterRoomCode: 'Enter 5-character code',
    enterNickname: 'Your name or nickname',
    maxPlayers: 'Number of Players',
    turnTimer: 'Turn Timer',
    mode: 'Game Mode',
    modeFull: 'Full Classic',
    modeShort: 'Speed Game',
    privateRoom: 'Private Room (Code only)',
    publicRoom: 'Public Room',
    copyCode: 'Copy Code',
    codeCopied: 'Code copied!',
    shareLink: 'Share Link',
    linkCopied: 'Link copied!',
    leaveRoom: 'Leave Room',

    lobbyTitle: 'Room Lobby',
    waitingPlayers: 'Waiting for players to join...',
    chooseToken: 'Choose Token',
    chooseColor: 'Pick Color',
    ready: 'Ready',
    notReady: 'Waiting',
    toggleReady: 'Ready Up!',
    startGame: 'Start Game',
    needMorePlayers: 'At least 2 players needed',
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

    trade: 'Trade Deal',
    proposeTrade: 'Propose Trade',
    tradeWith: 'Trade Partner:',
    myOffer: 'You Offer:',
    myRequest: 'You Request:',
    acceptTrade: 'Accept Deal',
    declineTrade: 'Decline',
    noTradePartners: 'No active players available for trade',

    debtTitle: 'Debt Settlement Required!',
    debtAmount: 'Debt Amount:',
    creditor: 'Creditor:',
    payDebt: 'Pay Debt',
    declareBankruptcy: 'Declare Bankruptcy',
    needToRaise: 'Insufficient cash. Sell branches or mortgage properties to raise funds.',

    currentBalance: 'Current Cash',
    balanceAfter: 'Balance After Purchase',

    buyModal: {
      header: 'PROPERTY ACQUISITION',
      thinking: 'is deciding...',
    },
    auctionModal: {
      header: 'PROPERTY AUCTION',
      currentBid: 'Highest Bid',
      noBids: 'No bids yet',
      highBidder: 'Leading Bidder',
      you: 'You',
      beFirst: 'Place the opening bid!',
      participants: 'Bidders',
      quickBid: 'Quick Raise',
      bid: 'Bid',
      youPassed: 'You passed on this auction',
    },
    tradeModal: {
      header: 'TRADE & NEGOTIATION',
      receivedProposal: 'INCOMING PROPOSAL',
      proposalNotice: 'proposes a trade with the following terms',
      theyGive: 'They Offer',
      theyWant: 'They Want',
      accept: 'Accept Deal',
      reject: 'Reject Deal',
      waitingResponse: 'Waiting for response...',
      reviewingNotice: 'is reviewing your trade offer.',
      cancelProposal: 'Cancel Proposal',
      tradeWith: 'Trading Partner',
      iGive: 'I Give',
      iGet: 'I Get',
      money: 'Money (so‘m)',
      properties: 'Properties',
      noProperties: 'No properties available',
      sendProposal: 'Send Trade Proposal',
    },
    cardModal: {
      imkonTitle: 'IMKON (CHANCE) CARD',
      xazinaTitle: 'XAZINA (TREASURY) CARD',
      understand: 'Understood, Continue',
    },
    propertyModal: {
      header: 'MANAGE PROPERTY',
      noBuildings: 'No branches yet',
      mortgagedBadge: 'MORTGAGED',
      construction: 'Branch Construction',
      buildBranch: 'Build Branch',
      mortgageSection: 'Mortgage & Redemption',
      mortgage: 'Mortgage Property',
      unmortgage: 'Unmortgage Property',
    },
    debtModal: {
      header: 'DEBT SETTLEMENT REQUIRED!',
      creditor: 'Creditor',
      bank: 'Central Bank of Uzbekistan',
      remainingToCollect: 'Remaining to Raise',
      payFullDebt: 'Pay Off Debt in Full',
      liquidationHelp: 'Insufficient cash. Sell branches or mortgage properties:',
      sellBuildings: 'Sell Buildings',
      mortgageProperties: 'Mortgage Properties',
      declareBankruptcy: 'Declare Bankruptcy',
      confirmBankruptcy: 'Are you sure you want to declare bankruptcy? You will be eliminated!',
    },
    gameOverModal: {
      victoryTitle: 'MATCH WINNER DECLARED!',
      totalCapital: 'Winner Net Worth',
      propertiesOwned: 'Properties Acquired',
      branchesBuilt: 'Branches Built',
      turnsPlayed: 'Turns Played',
      playAgain: 'Play Again',
      homeMenu: 'Back to Home',
    },
    propertyCard: {
      baseRent: 'Base Rent',
      fullGroupRent: 'Full Monopoly Rent',
      mortgageValue: 'Mortgage Value',
      house: 'branch',
      hotel: 'Headquarters',
    },

    reasons: {
      reasonNotOwner: 'You do not own this property',
      reasonNeedMonopoly: 'Complete monopoly required (all group properties)',
      reasonGroupMortgaged: 'A property in the group is mortgaged; redeem it first',
      reasonMaxBuildings: 'Maximum level (Headquarters) already reached',
      reasonEvenBuild: 'Must build evenly across color group (max difference of 1)',
      reasonInsufficientCash: 'Insufficient cash balance',
      reasonNoBuildings: 'No branches to sell on this property',
      reasonEvenSell: 'Must sell branches evenly across color group',
      reasonAlreadyMortgaged: 'Property is already mortgaged',
      reasonBuildingsExist: 'Group still has buildings; sell them first',
      reasonNotMortgaged: 'Property is not mortgaged',
      reasonAlreadyHighBidder: 'You are already the highest bidder',
    },

    chanceCard: 'Imkoniyat (Chance) Card',
    chestCard: 'Xazina (Community Chest) Card',
    continueBtn: 'Understood, Continue',

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

    footerDisclaimer:
      'UzMonopoly / UzBiznes — Uzbek national business board game. This project is not affiliated with the mentioned brands (Uzum, Korzinka, Payme, Click, Humo, Uzcard, etc.). Names are used solely for gameplay and entertainment purposes.',
    keyboardShortcutsGuide:
      'Shortcuts: Space / R — Roll Dice, B — Buy, D — Auction, E — End Turn, Esc — Close',
    addBot: 'Add AI Bot',
    shortGameRemaining: 'Speed Game: turns remaining',
  },
};
