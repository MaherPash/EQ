import { numberToWords as numberToWordsImpl } from './numberToWords.js';
import CurrencyService from './currencyService.js';

// Shared architecture imports
import {
  Decimal as SharedDecimal,
  numberToWords as sharedNumberToWords,
  getResultScreen,
  getSpeechEngine,
  getClipboardEngine,
  getHistoryEngine,
  getKeyboardHandler,
  getDisplayRenderer
} from './src/core/index.js';
import { getCalculatorManager } from './src/CalculatorManager.js';
import StandardCalculator from './src/modes/StandardCalculator.js';

// Backward-compatible alias: route all local numberToWords calls through the shared engine
const numberToWords = sharedNumberToWords;

// Shared service instances (lazy singletons)
const sharedServices = {
  get resultScreen() { return getResultScreen(); },
  get speech() { return getSpeechEngine(); },
  get clipboard() { return getClipboardEngine(); },
  get history() { return getHistoryEngine(); },
  get keyboard() { return getKeyboardHandler(); },
  get display() { return getDisplayRenderer(); }
};

const DecimalCtor = typeof globalThis !== 'undefined' && globalThis.Decimal ? globalThis.Decimal : (typeof window !== 'undefined' ? window.Decimal : null);
const Decimal = DecimalCtor || class {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return String(this.value);
  }
  add(other) { return new this.constructor(Number(this.value) + Number(other?.toString?.() || other)); }
  sub(other) { return new this.constructor(Number(this.value) - Number(other?.toString?.() || other)); }
  mul(other) { return new this.constructor(Number(this.value) * Number(other?.toString?.() || other)); }
  div(other) { return new this.constructor(Number(this.value) / Number(other?.toString?.() || other)); }
};

const primaryDisplay = typeof document !== 'undefined' ? document.getElementById('primaryDisplay') : null;
const expressionDisplay = typeof document !== 'undefined' ? document.getElementById('expressionDisplay') : null;
const secondaryDisplay = typeof document !== 'undefined' ? document.getElementById('secondaryDisplay') : null;
const modeSwitchButtons = typeof document !== 'undefined' ? document.querySelectorAll('.mode-switch') : [];
const generalCalculatorPanel = typeof document !== 'undefined' ? document.getElementById('generalCalculatorPanel') : null;
const historyPanel = typeof document !== 'undefined' ? document.getElementById('historyPanel') : null;
const drawerToggle = typeof document !== 'undefined' ? document.getElementById('drawerToggle') : null;
const drawer = typeof document !== 'undefined' ? document.getElementById('drawer') : null;
const drawerOverlay = typeof document !== 'undefined' ? document.getElementById('drawerOverlay') : null;
const currencyMenuButton = typeof document !== 'undefined' ? document.getElementById('currencyMenuButton') : null;
const currencyMenuWrap = typeof document !== 'undefined' ? document.getElementById('currencyMenuWrap') : null;
const currencyMenuPopover = typeof document !== 'undefined' ? document.getElementById('currencyMenuPopover') : null;
const currencyPopoverItems = typeof document !== 'undefined' ? document.querySelectorAll('.currency-popover-item') : [];
const languageSelect = typeof document !== 'undefined' ? document.getElementById('languageSelect') : null;
const topBarLanguageSelect = typeof document !== 'undefined' ? document.getElementById('topBarLanguageSelect') : null;
const themeButtons = typeof document !== 'undefined' ? document.querySelectorAll('.theme-option') : [];
const percentAmount = typeof document !== 'undefined' ? document.getElementById('percentAmount') : null;
const percentRate = typeof document !== 'undefined' ? document.getElementById('percentRate') : null;
const percentPanel = typeof document !== 'undefined' ? document.getElementById('percentPanel') : null;
const percentToggle = typeof document !== 'undefined' ? document.getElementById('percentToggle') : null;
const percentBackButton = typeof document !== 'undefined' ? document.getElementById('percentBackButton') : null;
const percentRefreshButton = typeof document !== 'undefined' ? document.getElementById('percentRefreshButton') : null;
const keypadGrid = typeof document !== 'undefined' ? document.querySelector('.keypad-grid') : null;
const historyList = typeof document !== 'undefined' ? document.getElementById('historyList') : null;
const noteInput = typeof document !== 'undefined' ? document.getElementById('noteInput') : null;
const addNoteButton = typeof document !== 'undefined' ? document.getElementById('addNoteButton') : null;
const quickNoteInput = typeof document !== 'undefined' ? document.getElementById('quickNoteInput') : null;
const saveQuickNoteButton = typeof document !== 'undefined' ? document.getElementById('saveQuickNoteButton') : null;
const quickNotesList = typeof document !== 'undefined' ? document.getElementById('quickNotesList') : null;
const collapseQuickNotesButton = typeof document !== 'undefined' ? document.getElementById('collapseQuickNotes') : null;
const quickNotesPanel = typeof document !== 'undefined' ? document.getElementById('quickNotesPanel') : null;
const exportHistoryButton = typeof document !== 'undefined' ? document.getElementById('exportHistory') : null;
const selectAllHistoryButton = typeof document !== 'undefined' ? document.getElementById('selectAllHistory') : null;
const historyBackButton = typeof document !== 'undefined' ? document.getElementById('historyBackButton') : null;
const scientificToggle = typeof document !== 'undefined' ? document.getElementById('scientificToggle') : null;
const scientificPanel = typeof document !== 'undefined' ? document.getElementById('scientificPanel') : null;
const speechButton = typeof document !== 'undefined' ? document.getElementById('speechButton') : null;
const soundToggle = typeof document !== 'undefined' ? document.getElementById('soundToggle') : null;
const appSoundToggle = typeof document !== 'undefined' ? document.getElementById('appSoundToggle') : null;
const appSoundModes = typeof document !== 'undefined' ? document.getElementById('appSoundModes') : null;
const soundProfileSelect = typeof document !== 'undefined' ? document.getElementById('soundProfileSelect') : null;
const speakerToggle = typeof document !== 'undefined' ? document.getElementById('speakerToggle') : null;
const iosInstallModal = typeof document !== 'undefined' ? document.getElementById('iosInstallModal') : null;
const closeIosInstallModalButton = typeof document !== 'undefined' ? document.getElementById('closeIosInstallModal') : null;
const dismissIosInstallModalButton = typeof document !== 'undefined' ? document.getElementById('dismissIosInstallModal') : null;
const iosInstallTitle = typeof document !== 'undefined' ? document.getElementById('iosInstallTitle') : null;
const iosInstallSubtitle = typeof document !== 'undefined' ? document.getElementById('iosInstallSubtitle') : null;
const iosInstallStep1 = typeof document !== 'undefined' ? document.getElementById('iosInstallStep1') : null;
const iosInstallStep2 = typeof document !== 'undefined' ? document.getElementById('iosInstallStep2') : null;
const notesManagerModal = typeof document !== 'undefined' ? document.getElementById('notesManagerModal') : null;
const closeNotesManagerButton = typeof document !== 'undefined' ? document.getElementById('closeNotesManager') : null;
const addFolderButton = typeof document !== 'undefined' ? document.getElementById('addFolderButton') : null;
const foldersList = typeof document !== 'undefined' ? document.getElementById('foldersList') : null;
const openNewNoteButton = typeof document !== 'undefined' ? document.getElementById('openNewNoteButton') : null;
const refeshNotesButton = typeof document !== 'undefined' ? document.getElementById('refreshNotesButton') : null;
const notesList = typeof document !== 'undefined' ? document.getElementById('notesList') : null;
const fullScreenNoteModal = typeof document !== 'undefined' ? document.getElementById('fullScreenNoteModal') : null;
const closeFullScreenNoteButton = typeof document !== 'undefined' ? document.getElementById('closeFullScreenNote') : null;
const noteTitleInput = typeof document !== 'undefined' ? document.getElementById('noteTitleInput') : null;
const noteFolderSelect = typeof document !== 'undefined' ? document.getElementById('noteFolderSelect') : null;
const noteBodyInput = typeof document !== 'undefined' ? document.getElementById('noteBodyInput') : null;
const drawerCloseButton = typeof document !== 'undefined' ? document.getElementById('drawerCloseButton') : null;
const drawerMenuItems = typeof document !== 'undefined' ? document.querySelectorAll('.drawer-menu-item') : [];

// Notes UI extras
const folderTabsScroll = typeof document !== 'undefined' ? document.getElementById('folderTabsScroll') : null;
const addFolderBtn = typeof document !== 'undefined' ? document.getElementById('addFolderButton') : null;
const notesListPanel = typeof document !== 'undefined' ? document.getElementById('notesListPanel') : null;
const deletedListPanel = typeof document !== 'undefined' ? document.getElementById('deletedListPanel') : null;
const deletedNotesList = typeof document !== 'undefined' ? document.getElementById('deletedNotesList') : null;
const notesEmptyState = typeof document !== 'undefined' ? document.getElementById('notesEmptyState') : null;
const deletedEmptyState = typeof document !== 'undefined' ? document.getElementById('deletedEmptyState') : null;
const emptyNewNoteBtn = typeof document !== 'undefined' ? document.getElementById('emptyNewNoteBtn') : null;
const navNotesBtn = typeof document !== 'undefined' ? document.getElementById('navNotesBtn') : null;
const navDeletedBtn = typeof document !== 'undefined' ? document.getElementById('navDeletedBtn') : null;
const saveFullScreenNote = typeof document !== 'undefined' ? document.getElementById('saveFullScreenNote') : null;
const deleteCurrentNote = typeof document !== 'undefined' ? document.getElementById('deleteCurrentNote') : null;
const deleteConfirmModal = typeof document !== 'undefined' ? document.getElementById('deleteConfirmModal') : null;
const deleteConfirmCancel = typeof document !== 'undefined' ? document.getElementById('deleteConfirmCancel') : null;
const deleteConfirmOk = typeof document !== 'undefined' ? document.getElementById('deleteConfirmOk') : null;
const settingsModal = typeof document !== 'undefined' ? document.getElementById('settingsModal') : null;
const settingsCloseButton = typeof document !== 'undefined' ? document.getElementById('settingsCloseButton') : null;
// Help & About (self-contained, only opens from Settings)
const helpAboutButton = typeof document !== 'undefined' ? document.getElementById('helpAboutButton') : null;
const helpModal = typeof document !== 'undefined' ? document.getElementById('helpModal') : null;
const helpBackButton = typeof document !== 'undefined' ? document.getElementById('helpBackButton') : null;
const helpCloseButton = typeof document !== 'undefined' ? document.getElementById('helpCloseButton') : null;
const currencyFromSelect = typeof document !== 'undefined' ? document.getElementById('currencyFromSelect') : null;
const currencyToSelect = typeof document !== 'undefined' ? document.getElementById('currencyToSelect') : null;
const currencyFromAmount = typeof document !== 'undefined' ? document.getElementById('currencyFromAmount') : null;
const currencyConverterCloseButton = typeof document !== 'undefined' ? document.getElementById('currencyConverterCloseButton') : null;
const currencyToAmount = typeof document !== 'undefined' ? document.getElementById('currencyToAmount') : null;
const currencyDirectoryButton = typeof document !== 'undefined' ? document.getElementById('currencyDirectoryButton') : null;
const currencyCloseButton = typeof document !== 'undefined' ? document.getElementById('currencyCloseButton') : null;
const currencySearchInput = typeof document !== 'undefined' ? document.getElementById('currencySearchInput') : null;
const currencyList = typeof document !== 'undefined' ? document.getElementById('currencyList') : null;
const currencyStatusMessage = typeof document !== 'undefined' ? document.getElementById('currencyStatusMessage') : null;
const refreshRatesButton = typeof document !== 'undefined' ? document.getElementById('refreshRatesButton') : null;
const currencyDirectoryModal = typeof document !== 'undefined' ? document.getElementById('currencyDirectoryModal') : null;
const currencyConverterModal = typeof document !== 'undefined' ? document.getElementById('currencyConverterModal') : null;
// Currency Rates screen elements
const currencyRatesModal = typeof document !== 'undefined' ? document.getElementById('currencyRatesModal') : null;
const currencyRatesTitle = typeof document !== 'undefined' ? document.getElementById('currencyRatesTitle') : null;
const currencyRatesBackButton = typeof document !== 'undefined' ? document.getElementById('currencyRatesBackButton') : null;
const currencyRatesCloseButton = typeof document !== 'undefined' ? document.getElementById('currencyRatesCloseButton') : null;
const currencyRatesSearchInput = typeof document !== 'undefined' ? document.getElementById('currencyRatesSearchInput') : null;
const currencyRatesStatus = typeof document !== 'undefined' ? document.getElementById('currencyRatesStatus') : null;
const currencyRatesList = typeof document !== 'undefined' ? document.getElementById('currencyRatesList') : null;
// Currency Favorites screen elements
const currencyFavoritesModal = typeof document !== 'undefined' ? document.getElementById('currencyFavoritesModal') : null;
const currencyFavoritesTitle = typeof document !== 'undefined' ? document.getElementById('currencyFavoritesTitle') : null;
const currencyFavoritesBackButton = typeof document !== 'undefined' ? document.getElementById('currencyFavoritesBackButton') : null;
const currencyFavoritesStatus = typeof document !== 'undefined' ? document.getElementById('currencyFavoritesStatus') : null;
const currencyFavoritesEmpty = typeof document !== 'undefined' ? document.getElementById('currencyFavoritesEmpty') : null;
const currencyFavoritesList = typeof document !== 'undefined' ? document.getElementById('currencyFavoritesList') : null;

// Currency service instance
let currencyServiceInstance = null;

// New currency UI elements
const swapCurrenciesButton = typeof document !== 'undefined' ? document.getElementById('swapCurrenciesButton') : null;
const showFavoritesButton = typeof document !== 'undefined' ? document.getElementById('showFavoritesButton') : null;
const showRecentButton = typeof document !== 'undefined' ? document.getElementById('showRecentButton') : null;
const favoriteFromButton = typeof document !== 'undefined' ? document.getElementById('favoriteFromButton') : null;
const favoriteToButton = typeof document !== 'undefined' ? document.getElementById('favoriteToButton') : null;
const conversionRateDisplay = typeof document !== 'undefined' ? document.getElementById('conversionRateDisplay') : null;
const currencyWords = typeof document !== 'undefined' ? document.getElementById('currencyWords') : null;
const cacheIndicator = typeof document !== 'undefined' ? document.getElementById('cacheIndicator') : null;
const converterModeButtons = typeof document !== 'undefined' ? document.querySelectorAll('.converter-mode-btn') : [];
const marketRateField = typeof document !== 'undefined' ? document.getElementById('marketRateField') : null;
const marketRateInput = typeof document !== 'undefined' ? document.getElementById('marketRateInput') : null;
const marketRatePrefix = typeof document !== 'undefined' ? document.getElementById('marketRatePrefix') : null;
const marketRateSuffix = typeof document !== 'undefined' ? document.getElementById('marketRateSuffix') : null;
const converterFromFlag = typeof document !== 'undefined' ? document.getElementById('converterFromFlag') : null;
const converterFromLabel = typeof document !== 'undefined' ? document.getElementById('converterFromLabel') : null;
const converterToFlag = typeof document !== 'undefined' ? document.getElementById('converterToFlag') : null;
const converterToLabel = typeof document !== 'undefined' ? document.getElementById('converterToLabel') : null;
const currencySpeakButton = typeof document !== 'undefined' ? document.getElementById('currencySpeakButton') : null;
const currencyResetButton = typeof document !== 'undefined' ? document.getElementById('currencyResetButton') : null;

// Custom-rate converter (تحويل بسعر مخصص) elements
const customRateModal = typeof document !== 'undefined' ? document.getElementById('customRateModal') : null;
const customRateBackButton = typeof document !== 'undefined' ? document.getElementById('customRateBackButton') : null;
const customRateResetButton = typeof document !== 'undefined' ? document.getElementById('customRateResetButton') : null;
const customRateInput = typeof document !== 'undefined' ? document.getElementById('customRateInput') : null;
const customAmountInput = typeof document !== 'undefined' ? document.getElementById('customAmountInput') : null;
const customRateResult = typeof document !== 'undefined' ? document.getElementById('customRateResult') : null;
const customRateWords = typeof document !== 'undefined' ? document.getElementById('customRateWords') : null;
const customRateSpeakButton = typeof document !== 'undefined' ? document.getElementById('customRateSpeakButton') : null;

const translations = {
  en: {
    eyebrow: '',
    title: 'EQ',
    install: 'Install App',
    actions: 'Actions',
    notesManagerTitle: 'Notes Manager',
    notesManagerSubtitle: 'Organize notes in folders and open a full screen editor.',
    foldersTitle: 'Folders',
    addFolder: '+ Folder',
    newNoteButton: 'New Full Screen Note',
    notesTitle: 'Notes',
    refreshNotes: 'Refresh',
    fullScreenNoteTitle: 'Full Screen Note',
    noteFolderLabel: 'Folder',
    noteTitleLabel: 'Title',
    noteTitlePlaceholder: 'Note title',
    folderSelectLabel: 'Folder',
    noteBodyPlaceholder: 'Start writing...',
    percentTab: 'Percentage',
    settingsTab: 'Settings',
    historyTab: 'History',
    percentTitle: 'Percentage Calculator',
    percentBack: 'Back',
    amountLabel: 'Amount',
    rateLabel: 'Percentage Rate',
    settingsTitle: 'Settings & Customization',
    languageLabel: 'Language',
    themeLabel: 'Theme',
    historyTitle: '24-Hour History',
    historyBack: 'Back',
    historyRemaining: 'remaining',
    selectAll: 'Select All',
    exportButton: 'Share / Export',
    quickNotesTitle: 'Quick Notes',
    quickNotesToggle: '▼',
    quickNotesAdd: 'Save',
    quickNotesPlaceholder: 'Write a note',
    historyNotePlaceholder: 'Tag this calculation',
    historyLabel: 'History',
    noteLabel: 'Note',
    noteInputPlaceholder: '+ New note',
    noteSaved: 'Note saved',
    noteEdit: 'Edit',
    noteShare: 'Share',
    emptyHistory: 'No history yet',
    copied: 'Result copied',
    pasted: 'Number pasted',
    installed: 'App is ready to install',
    noSelection: 'Select an item to share',
    shareTitle: 'EQ Calculator History',
    shareMessage: 'Exported from EQ Calculator',
    themeDark: 'Dark',
    themeLight: 'Light',
    themeViolet: 'Violet',
    languageEnglish: 'English',
    languageSpanish: 'Español',
    languageArabic: 'العربية',
    languageFrench: 'Français',
    languageRussian: 'Русский',
    languageGerman: 'Deutsch',
    languageTurkish: 'Türkçe',
    drawerTop: 'Top',
    drawerSide: 'Side',
    expand: 'Expand',
    Minimize: 'Minimize',
    installModalSubtitle: 'Add it to your Home Screen',
    installModalClose: 'Got it',
    settingsSubtitle: 'Customize app language, theme and feedback.',
    appSoundsLabel: 'App Sounds',
    soundHapticsLabel: 'Button sound & haptics',
    soundHapticsCaption: 'Enable click sounds and vibration',
    soundProfileLabel: 'Button Sound Profile',
    profileClassic: 'Classic',
    profileSoft: 'Soft',
    profileModern: 'Modern',
    profileClick: 'Click',
    profileSilent: 'Silent',
    speakerLabel: 'Speaker / Voice Reading',
    speakerCaption: 'When ON, the result is read aloud automatically after pressing = . When OFF, reading is manual via the speaker button only.',
    modeGeneral: 'General Calculator',
    scientificToggle: 'Scientific',
    percentResultLabel: 'Result',
    currencyConverterTitle: 'Convert Currencies',
    currencyConverterSubtitle: 'Convert amounts instantly with live rates.',
    resetButton: 'Reset',
    swapButton: 'Swap',
    favoritesButton: 'Favorites',
    recentButton: 'Recent',
    fromLabel: 'From',
    toLabel: 'To',
    convertedLabel: 'Converted',
    bankRateMode: '🏦 Bank Rate',
    marketRateMode: '🏪 Market Rate',
    marketRateFieldLabel: 'Market Exchange Rate',
    cachedLabel: 'Cached',
    refreshButton: 'Refresh',
    globalDirectoryButton: 'Global directory',
    currencyDirectoryTitle: 'Global Currencies Directory',
    currencyDirectorySubtitle: 'Search paper currencies by country name or currency code.',
    currencySearchPlaceholder: 'Search country or code',
    drawerEyebrow: '',
    drawerTitle: 'EQ',
    drawerHistory: 'History',
    drawerNotes: 'Notes',
    drawerConverter: 'Direct Currency Converter',
    drawerDirectory: 'Global Currency Directory & Search',
    drawerInstall: 'Install App',
    drawerSettings: 'Settings',
    installModalTitle: 'Install on iPhone',
    installModalStep1: 'Step 1: Tap the Share button (⎘ / ⇡) at the bottom or top of the browser.',
    installModalStep2: 'Step 2: Choose "Add to Home Screen" from the menu.',
    currencyOptionSearch: 'Search Currency',
    currencyOptionPrices: 'Live Currency Prices',
    currencyOptionConvert: 'Convert Currencies',
    currencyOptionFavorites: 'Favorite Currencies',
    currencyFavoritesTitle: 'Favorites',
    currencyFavoritesEmpty: 'No favorite currencies yet',
    currencyFavoritesEmptyHint: 'Tap the star on any currency to add it here',
    currencyOptionCustomRate: 'Convert at Custom Rate',
    customRateTitle: 'Convert at Custom Rate',
    customRateFieldLabel: 'Exchange Rate',
    currencyRatesTitle: 'Currency Rates',
    currencyRatesSearchPlaceholder: 'Search currency or code',
    currencyRatesEmpty: 'No currencies found',
    currencyRatesLoading: 'Loading rates…',
    currencyRatesError: 'Rates unavailable',
    recentlyDeletedTitle: 'Recently Deleted',
    emptyNotesText: 'No notes yet',
    emptyNotesAction: '+ New Note',
    emptyDeletedText: 'No deleted notes',
    deleteConfirmTitle: 'Delete permanently?',
    deleteConfirmText: 'This action cannot be undone.',
    cancelBtn: 'Cancel',
    deletePermanentBtn: 'Delete',
    doneBtn: 'Done',
    deleteNoteBtn: 'Delete note',
    restoreBtn: 'Restore',
    helpTitle: 'Help & About',
    helpSubtitle: 'Learn how to use EQ and discover its features.',
    helpAboutTitle: 'About the App',
    helpAboutDesc: 'EQ is a smart, all-in-one calculator that combines everyday math, scientific and percentage tools, currency conversion and much more in one simple, easy-to-use app.',
    helpWhyTitle: 'Why was EQ created?',
    helpWhyDesc: 'The idea is simple: one calculator instead of many, built for speed, clarity and everyday use.',
    helpWhyL1: 'Fast everyday calculations',
    helpWhyL2: 'Scientific tools such as square root, powers and parentheses',
    helpWhyL3: 'Easy percentage calculations',
    helpWhyL4: 'Currency conversion and live rates',
    helpWhyL5: 'Notes and calculation history',
    helpWhyL6: 'Simple, clear and quick to use',
    helpWhyL7: 'Works as an installable app (PWA) on different devices',
    helpSectionsTitle: 'Explaining the App Sections',
    helpSecGeneralTitle: 'General Calculator',
    helpSecGeneralDesc: 'The main calculator for everyday operations: add, subtract, multiply and divide.',
    helpSecGeneralEx: 'Example: 12 + 7 = 19.',
    helpSecScientificTitle: 'Scientific Tools',
    helpSecScientificDesc: 'Tap "Scientific" to use the square root, square and parentheses buttons inside the same calculator.',
    helpSecScientificEx: 'Example: √9 = 3, 2^3 = 8.',
    helpSecPercentTitle: 'Percentage Calculator',
    helpSecPercentDesc: 'Quickly work out a percentage of an amount without extra steps.',
    helpSecPercentEx: 'Example: 15% of 200 = 30.',
    helpSecHistoryTitle: 'History',
    helpSecHistoryDesc: 'EQ remembers what you calculated in the last 24 hours so you can review or share it.',
    helpSecNotesTitle: 'Notes',
    helpSecNotesDesc: 'Save quick notes, organize them in folders, and edit them in a full-screen editor.',
    helpSecCurrencyTitle: 'Currency Tools',
    helpSecCurrencyDesc: 'Search currencies, see live rates, convert between currencies, use a custom rate, and keep your favorites.',
    helpSecSettingsTitle: 'Settings',
    helpSecSettingsDesc: 'Change the language, the theme and the sound feedback exactly how you like.',
    helpButtonsTitle: 'How to Use the Calculator',
    helpBtnNumbers: 'Tap to type digits.',
    helpBtnAdd: 'Adds the next number.',
    helpBtnSub: 'Subtracts the next number.',
    helpBtnMul: 'Multiplies by the next number.',
    helpBtnDiv: 'Divides by the next number.',
    helpBtnEquals: 'Shows the result.',
    helpBtnAc: 'Clears everything and starts fresh.',
    helpBtnBack: 'Deletes the last digit you typed.',
    helpBtnDecimal: 'Adds a decimal point.',
    helpBtnScientific: 'Scientific / Percentage: switches the extra tools on and off.',
    helpBtnSpeak: 'Speaks the current result aloud.',
    helpSettingsExplainTitle: 'Settings',
    helpSetLanguage: 'Language: switches the whole app between the available languages.',
    helpSetTheme: 'Theme: choose Dark, Light or Violet appearance.',
    helpSetSoundsTitle: 'App Sounds: the master switch for sound and haptic feedback.',
    helpSetSoundsDesc: 'When App Sounds is ON, button sound and haptics are allowed. Turn it OFF to silence that feedback, and ON again to allow it.',
    helpSetSoundsSpeech: 'Speech/TTS is separate from App Sounds and is not turned off by App Sounds.',
    helpCurrencyTitle: 'Currency Converter',
    helpCurrencyDesc: 'Pick the currency you have (From) and the one you want (To), then type an amount.',
    helpCurrencySwap: 'Use the swap button to reverse the two currencies.',
    helpCurrencyFavorites: 'Use the star to mark a currency as a favorite, and open Favorite Currencies from the currency menu.',
    helpCurrencyCustomRate: 'Convert at Custom Rate lets you enter your own exchange rate.',
    helpCurrencyLive: 'Live prices come from the online service; if it is unavailable, cached rates may be used.',
    helpInstallTitle: 'Install & Offline',
    helpInstallDesc1: 'You can install EQ as an app on supported devices.',
    helpInstallDesc2: 'Some features work offline using stored resources, but live currency rates and app updates need an internet connection.',
    helpBenefitsTitle: 'Why Use EQ?',
    helpBenefit1: 'All-in-one calculator',
    helpBenefit2: 'Fast everyday calculations',
    helpBenefit3: 'Scientific and percentage tools',
    helpBenefit4: 'Currency conversion',
    helpBenefit5: 'History and notes',
    helpBenefit6: 'Multi-language interface',
    helpBenefit7: 'Responsive design and PWA support',
    helpLangTitle: 'Languages',
    helpLangDesc: 'EQ is fully translated. Choose your language in the top bar or in Settings, and the whole app — including this help page — updates instantly.'
  },
  es: {
    eyebrow: '',
    title: 'EQ',
    install: 'Instalar app',
    actions: 'Acciones',
    notesManagerTitle: 'Gestor de notas',
    notesManagerSubtitle: 'Organiza notas en carpetas y abre un editor de pantalla completa.',
    foldersTitle: 'Carpetas',
    addFolder: '+ Carpeta',
    newNoteButton: 'Nueva nota de pantalla completa',
    notesTitle: 'Notas',
    refreshNotes: 'Actualizar',
    fullScreenNoteTitle: 'Nota de pantalla completa',
    noteFolderLabel: 'Carpeta',
    noteTitleLabel: 'Título',
    noteTitlePlaceholder: 'Título de la nota',
    folderSelectLabel: 'Carpeta',
    noteBodyPlaceholder: 'Empieza a escribir...',
    percentTab: 'Porcentaje',
    settingsTab: 'Ajustes',
    historyTab: 'Historial',
    percentTitle: 'Calculadora de porcentaje',
    percentBack: 'Volver',
    amountLabel: 'Cantidad',
    rateLabel: 'Tasa de porcentaje',
    settingsTitle: 'Ajustes y personalización',
    languageLabel: 'Idioma',
    themeLabel: 'Tema',
    historyTitle: 'Historial de 24 horas',
    historyBack: 'Volver',
    historyRemaining: 'restante',
    selectAll: 'Seleccionar todo',
    exportButton: 'Compartir / Exportar',
    quickNotesTitle: 'Notas rápidas',
    quickNotesToggle: '▼',
    quickNotesAdd: 'Guardar',
    quickNotesPlaceholder: 'Escribe una nota',
    historyNotePlaceholder: 'Etiqueta este cálculo',
    historyLabel: 'Historial',
    noteLabel: 'Nota',
    noteInputPlaceholder: '+ Nueva nota',
    noteSaved: 'Nota guardada',
    noteEdit: 'Editar',
    noteShare: 'Compartir',
    emptyHistory: 'Sin historial todavía',
    copied: 'Resultado copiado',
    pasted: 'Número pegado',
    installed: 'La app está lista para instalar',
    noSelection: 'Selecciona un elemento para compartir',
    shareTitle: 'Historial de Calculadora EQ',
    shareMessage: 'Exportado desde Calculadora EQ',
    themeDark: 'Oscuro',
    themeLight: 'Claro',
    themeViolet: 'Violeta',
    languageEnglish: 'English',
    languageSpanish: 'Español',
    languageArabic: 'العربية',
    languageFrench: 'Français',
    languageRussian: 'Русский',
    languageGerman: 'Deutsch',
    languageTurkish: 'Türkçe',
    drawerTop: 'Superior',
    drawerSide: 'Lateral',
    expand: 'Expandir',
    Minimize: 'Minimizar',
    installModalSubtitle: 'Añádela a tu pantalla de inicio',
    installModalClose: 'Entendido',
    settingsSubtitle: 'Personaliza idioma, tema y comentarios.',
    appSoundsLabel: 'Sonidos de la app',
    soundHapticsLabel: 'Sonido y hápticos',
    soundHapticsCaption: 'Activar sonidos de clic y vibración',
    soundProfileLabel: 'Perfil de sonido de botones',
    profileClassic: 'Clásico',
    profileSoft: 'Suave',
    profileModern: 'Moderno',
    profileClick: 'Clic',
    profileSilent: 'Silencio',
    speakerLabel: 'Altavoz / Lectura por voz',
    speakerCaption: 'Cuando está ACTIVADO, el resultado se lee en voz alta automáticamente al pulsar = . Cuando está APAGADO, la lectura es manual solo con el botón del altavoz.',
    modeGeneral: 'Calculadora general',
    scientificToggle: 'Científica',
    percentResultLabel: 'Resultado',
    currencyConverterTitle: 'Conversor directo de divisas',
    currencyConverterSubtitle: 'Convierte cantidades al instante con tarifas en vivo.',
    swapButton: 'Intercambiar',
    favoritesButton: 'Favoritos',
    recentButton: 'Recientes',
    fromLabel: 'De',
    toLabel: 'A',
    convertedLabel: 'Convertido',
    bankRateMode: '🏦 Tarifa bancaria',
    marketRateMode: '🏪 Tarifa de mercado',
    marketRateFieldLabel: 'Tipo de cambio de mercado',
    cachedLabel: 'En caché',
    refreshButton: 'Actualizar',
    globalDirectoryButton: 'Directorio global',
    currencyDirectoryTitle: 'Directorio global de divisas',
    currencyDirectorySubtitle: 'Busca divisas por nombre de país o código.',
    currencySearchPlaceholder: 'Buscar país o código',
    drawerEyebrow: '',
    drawerTitle: 'EQ',
    drawerHistory: 'Historial',
    drawerNotes: 'Notas',
    drawerConverter: 'Conversor directo de divisas',
    drawerDirectory: 'Directorio global de divisas',
    drawerInstall: 'Instalar app',
    drawerSettings: 'Ajustes',
    installModalTitle: 'Instalar en iPhone',
    installModalStep1: 'Paso 1: Toca el botón Compartir (⎘ / ⇡) en la parte inferior o superior del navegador.',
    installModalStep2: 'Paso 2: Elige "Añadir a pantalla de inicio" en el menú.',
    currencyOptionSearch: 'Buscar moneda',
    currencyOptionPrices: 'Precios de monedas en vivo',
    currencyOptionConvert: 'Convertir monedas',
    currencyOptionFavorites: 'Monedas favoritas',
    currencyFavoritesTitle: 'Favoritas',
    currencyFavoritesEmpty: 'Aún no hay monedas favoritas',
    currencyFavoritesEmptyHint: 'Toca la estrella de cualquier moneda para añadirla aquí',
    currencyOptionCustomRate: 'Convertir a tarifa personalizada',
    customRateTitle: 'Convertir a tarifa personalizada',
    customRateFieldLabel: 'Tipo de cambio',
    currencyRatesTitle: 'Tipos de cambio',
    currencyRatesSearchPlaceholder: 'Buscar moneda o código',
    currencyRatesEmpty: 'No se encontraron monedas',
    currencyRatesLoading: 'Cargando tipos…',
    currencyRatesError: 'Tipos no disponibles',
    recentlyDeletedTitle: 'Eliminados recientemente',
    emptyNotesText: 'No hay notas',
    emptyNotesAction: '+ Nueva nota',
    emptyDeletedText: 'No hay notas eliminadas',
    deleteConfirmTitle: '¿Eliminar permanentemente?',
    deleteConfirmText: 'Esta acción no se puede deshacer.',
    cancelBtn: 'Cancelar',
    deletePermanentBtn: 'Eliminar',
    doneBtn: 'Hecho',
    deleteNoteBtn: 'Eliminar nota',
    restoreBtn: 'Restaurar',
    helpTitle: 'Ayuda y Acerca de',
    helpSubtitle: 'Aprende a usar EQ y descubre sus funciones.',
    helpAboutTitle: 'Acerca de la aplicación',
    helpAboutDesc: 'EQ es una calculadora inteligente y completa que reúne en una sola aplicación sencilla las operaciones diarias, las herramientas científicas y de porcentaje, la conversión de moneda y mucho más.',
    helpWhyTitle: '¿Por qué se creó EQ?',
    helpWhyDesc: 'La idea es simple: una sola calculadora en lugar de muchas, pensada para la rapidez, la claridad y el uso diario.',
    helpWhyL1: 'Cálculos diarios rápidos',
    helpWhyL2: 'Herramientas científicas como raíz cuadrada, potencias y paréntesis',
    helpWhyL3: 'Cálculos de porcentaje fáciles',
    helpWhyL4: 'Conversión de moneda y tasas en vivo',
    helpWhyL5: 'Notas e historial de cálculos',
    helpWhyL6: 'Sencilla, clara y rápida de usar',
    helpWhyL7: 'Funciona como aplicación instalable (PWA) en distintos dispositivos',
    helpSectionsTitle: 'Explicación de las secciones de la aplicación',
    helpSecGeneralTitle: 'Calculadora general',
    helpSecGeneralDesc: 'La calculadora principal para operaciones diarias: sumar, restar, multiplicar y dividir.',
    helpSecGeneralEx: 'Ejemplo: 12 + 7 = 19.',
    helpSecScientificTitle: 'Herramientas científicas',
    helpSecScientificDesc: 'Pulsa "Scientific" para usar los botones de raíz cuadrada, cuadrado y paréntesis en la misma calculadora.',
    helpSecScientificEx: 'Ejemplo: √9 = 3, 2^3 = 8.',
    helpSecPercentTitle: 'Calculadora de porcentaje',
    helpSecPercentDesc: 'Calcula rápidamente un porcentaje de una cantidad sin pasos extra.',
    helpSecPercentEx: 'Ejemplo: 15% de 200 = 30.',
    helpSecHistoryTitle: 'Historial',
    helpSecHistoryDesc: 'EQ recuerda lo que calculaste en las últimas 24 horas para que puedas revisarlo o compartirlo.',
    helpSecNotesTitle: 'Notas',
    helpSecNotesDesc: 'Guarda notas rápidas, organízalas en carpetas y edítalas en un editor a pantalla completa.',
    helpSecCurrencyTitle: 'Herramientas de moneda',
    helpSecCurrencyDesc: 'Busca monedas, consulta tasas en vivo, convierte monedas, usa una tasa personalizada y guarda tus favoritas.',
    helpSecSettingsTitle: 'Configuración',
    helpSecSettingsDesc: 'Cambia el idioma, el tema y el sonido a tu gusto.',
    helpButtonsTitle: 'Cómo usar la calculadora',
    helpBtnNumbers: 'Pulsa para escribir dígitos.',
    helpBtnAdd: 'Suma el siguiente número.',
    helpBtnSub: 'Resta el siguiente número.',
    helpBtnMul: 'Multiplica por el siguiente número.',
    helpBtnDiv: 'Divide entre el siguiente número.',
    helpBtnEquals: 'Muestra el resultado.',
    helpBtnAc: 'Borra todo y empieza de nuevo.',
    helpBtnBack: 'Elimina el último dígito escrito.',
    helpBtnDecimal: 'Añade un punto decimal.',
    helpBtnScientific: 'Scientific / Percentage: activa o desactiva las herramientas extra.',
    helpBtnSpeak: 'Lee el resultado actual en voz alta.',
    helpSettingsExplainTitle: 'Configuración',
    helpSetLanguage: 'Idioma: cambia toda la aplicación entre los idiomas disponibles.',
    helpSetTheme: 'Tema: elige la apariencia Oscura, Clara o Violeta.',
    helpSetSoundsTitle: 'Sonidos de la aplicación: interruptor principal del sonido y vibración.',
    helpSetSoundsDesc: 'Cuando Sonidos está activado, el sonido de los botones y la vibración están permitidos. Desactívalo para silenciarlos y actívalo de nuevo para permitirlos.',
    helpSetSoundsSpeech: 'Voz/TTS es independiente de Sonidos y no se desactiva con Sonidos.',
    helpCurrencyTitle: 'Conversor de moneda',
    helpCurrencyDesc: 'Elige la moneda que tienes (De) y la que quieres (A), y escribe una cantidad.',
    helpCurrencySwap: 'Usa el botón de intercambio para invertir las dos monedas.',
    helpCurrencyFavorites: 'Usa la estrella para marcar una moneda como favorita y abre Favoritos desde el menú de moneda.',
    helpCurrencyCustomRate: 'Conversión a tasa personalizada te permite introducir tu propio tipo de cambio.',
    helpCurrencyLive: 'Los precios en vivo vienen del servicio online; si no está disponible, pueden usarse tasas en caché.',
    helpInstallTitle: 'Instalar y sin conexión',
    helpInstallDesc1: 'Puedes instalar EQ como aplicación en dispositivos compatibles.',
    helpInstallDesc2: 'Algunas funciones funcionan sin conexión con recursos guardados, pero las tasas en vivo y las actualizaciones necesitan internet.',
    helpBenefitsTitle: '¿Por qué usar EQ?',
    helpBenefit1: 'Calculadora todo en uno',
    helpBenefit2: 'Cálculos diarios rápidos',
    helpBenefit3: 'Herramientas científicas y de porcentaje',
    helpBenefit4: 'Conversión de moneda',
    helpBenefit5: 'Historial y notas',
    helpBenefit6: 'Interfaz multilingüe',
    helpBenefit7: 'Diseño adaptable y soporte PWA',
    helpLangTitle: 'Idiomas',
    helpLangDesc: 'EQ está totalmente traducido. Elige tu idioma en la barra superior o en Configuración y toda la aplicación, incluida esta página de ayuda, se actualiza al instante.'
  },
  ar: {
    eyebrow: '',
    title: 'EQ',
    install: 'تثبيت التطبيق',
    actions: 'إجراءات',
    notesManagerTitle: 'مدير الملاحظات',
    notesManagerSubtitle: 'نظم الملاحظات في مجلدات وافتح محرراً بملء الشاشة.',
    foldersTitle: 'المجلدات',
    addFolder: '+ مجلد',
    newNoteButton: 'ملاحظة جديدة بملء الشاشة',
    notesTitle: 'الملاحظات',
    refreshNotes: 'تحديث',
    fullScreenNoteTitle: 'ملاحظة بملء الشاشة',
    noteFolderLabel: 'المجلد',
    noteTitleLabel: 'العنوان',
    noteTitlePlaceholder: 'عنوان الملاحظة',
    folderSelectLabel: 'المجلد',
    noteBodyPlaceholder: 'ابدأ الكتابة...',
    percentTab: 'النسبة المئوية',
    settingsTab: 'الإعدادات',
    historyTab: 'السجل',
    percentTitle: 'حاسبة النسبة المئوية',
    percentBack: 'رجوع',
    amountLabel: 'المبلغ',
    rateLabel: 'نسبة مئوية',
    settingsTitle: 'الإعدادات والتخصيص',
    languageLabel: 'اللغة',
    themeLabel: 'المظهر',
    historyTitle: 'سجل 24 ساعة',
    historyBack: 'رجوع',
    historyRemaining: 'متبقي',
    selectAll: 'تحديد الكل',
    exportButton: 'مشاركة / تصدير',
    quickNotesTitle: 'الملاحظات السريعة',
    quickNotesToggle: '▼',
    quickNotesAdd: 'حفظ',
    quickNotesPlaceholder: 'اكتب ملاحظة',
    historyNotePlaceholder: 'ضع علامة على هذه العملية',
    historyLabel: 'السجل',
    noteLabel: 'ملاحظة',
    noteInputPlaceholder: '+ ملاحظة جديدة',
    noteSaved: 'تم حفظ الملاحظة',
    noteEdit: 'تعديل',
    noteShare: 'مشاركة',
    emptyHistory: 'لا يوجد سجل بعد',
    copied: 'تم نسخ النتيجة',
    pasted: 'تم لصق الرقم',
    installed: 'التطبيق جاهز للتثبيت',
    noSelection: 'حدد عنصراً للمشاركة',
    shareTitle: 'سجل حاسبة EQ',
    shareMessage: 'تم التصدير من حاسبة EQ',
    themeDark: 'داكن',
    themeLight: 'فاتح',
    themeViolet: 'بنفسجي',
    languageEnglish: 'English',
    languageSpanish: 'Español',
    languageArabic: 'العربية',
    languageFrench: 'Français',
    languageRussian: 'Русский',
    languageGerman: 'Deutsch',
    languageTurkish: 'Türkçe',
    drawerTop: 'أعلى',
    drawerSide: 'جانب',
    expand: 'توسيع',
    Minimize: 'تصغير',
    installModalSubtitle: 'أضفه إلى الشاشة الرئيسية',
    installModalClose: 'حسناً',
    settingsSubtitle: 'خصص اللغة والمظهر والتغذية الراجعة.',
    appSoundsLabel: 'أصوات التطبيق',
    soundHapticsLabel: 'صوت الأزرار والاهتزاز',
    soundHapticsCaption: 'تفعيل أصوات النقر والاهتزاز',
    soundProfileLabel: 'نمط صوت الأزرار',
    profileClassic: 'كلاسيكي',
    profileSoft: 'ناعم',
    profileModern: 'حديث',
    profileClick: 'نقرة',
    profileSilent: 'صامت',
    speakerLabel: 'السماعة / القراءة الصوتية',
    speakerCaption: 'عند التشغيل تُقرأ النتيجة تلقائيًا بعد الضغط على =. عند الإيقاف تكون القراءة يدوية من زر السماعة فقط.',
    modeGeneral: 'آلة حاسبة عامة',
    scientificToggle: 'علمية',
    percentResultLabel: 'النتيجة',
    currencyConverterTitle: 'تحويل العملات',
    currencyConverterSubtitle: 'حول المبالغ فوراً بأسعار حية.',
    resetButton: 'إعادة تعيين',
    swapButton: 'تبديل',
    favoritesButton: 'المفضلة',
    recentButton: 'الأخيرة',
    fromLabel: 'من',
    toLabel: 'إلى',
    convertedLabel: 'محول',
    bankRateMode: '🏦 سعر البنك',
    marketRateMode: '🏪 سعر السوق',
    marketRateFieldLabel: 'سعر صرف السوق',
    cachedLabel: 'مخبأ',
    refreshButton: 'تحديث',
    globalDirectoryButton: 'الدليل العالمي',
    currencyDirectoryTitle: 'دليل العملات العالمي',
    currencyDirectorySubtitle: 'ابحث عن العملات الورقية حسب اسم الدولة أو رمز العملة.',
    currencySearchPlaceholder: 'ابحث عن دولة أو رمز',
    drawerEyebrow: '',
    drawerTitle: 'EQ',
    drawerHistory: 'السجل',
    drawerNotes: 'الملاحظات',
    drawerConverter: 'محول العملات المباشر',
    drawerDirectory: 'الدليل العالمي للعملات والبحث',
    drawerInstall: 'تثبيت التطبيق',
    drawerSettings: 'الإعدادات',
    installModalTitle: 'التثبيت على iPhone',
    installModalStep1: 'الخطوة 1: اضغط على زر المشاركة (⎘ / ⇡) في أسفل أو أعلى المتصفح.',
    installModalStep2: 'الخطوة 2: اختر "إضافة إلى الشاشة الرئيسية" من القائمة.',
    currencyOptionSearch: 'البحث عن عملة',
    currencyOptionPrices: 'أسعار العملات المباشرة',
    currencyOptionConvert: 'تحويل العملات',
    currencyOptionFavorites: 'العملات المفضلة',
    currencyFavoritesTitle: 'المفضلة',
    currencyFavoritesEmpty: 'لا توجد عملات مفضلة بعد',
    currencyFavoritesEmptyHint: 'اضغط على النجمة لأي عملة لإضافتها هنا',
    currencyOptionCustomRate: 'تحويل بسعر مخصص',
    customRateTitle: 'تحويل بسعر مخصص',
    customRateFieldLabel: 'سعر الصرف',
    currencyRatesTitle: 'أسعار العملات',
    currencyRatesSearchPlaceholder: 'ابحث عن عملة أو رمز',
    currencyRatesEmpty: 'لا توجد عملات',
    currencyRatesLoading: 'جارٍ تحميل الأسعار…',
    currencyRatesError: 'الأسعار غير متاحة',
    recentlyDeletedTitle: 'المحذوفة مؤخراً',
    emptyNotesText: 'لا توجد ملاحظات',
    emptyNotesAction: '+ ملاحظة جديدة',
    emptyDeletedText: 'لا توجد ملاحظات محذوفة',
    deleteConfirmTitle: 'حذف نهائي؟',
    deleteConfirmText: 'لا يمكن التراجع عن هذا الإجراء.',
    cancelBtn: 'إلغاء',
    deletePermanentBtn: 'حذف نهائي',
    doneBtn: 'تم',
    deleteNoteBtn: 'حذف الملاحظة',
    restoreBtn: 'استعادة',
    helpTitle: 'المساعدة والمعلومات',
    helpSubtitle: 'تعلّم كيفية استخدام EQ واكتشف مزاياه.',
    helpAboutTitle: 'عن التطبيق',
    helpAboutDesc: 'EQ حاسبة ذكية وشاملة تجمع بين الحسابات اليومية والأدوات العلمية وحساب النسبة المئوية وتحويل العملات وكل ذلك في تطبيق واحد سهل الاستخدام.',
    helpWhyTitle: 'لماذا أُنشئ EQ؟',
    helpWhyDesc: 'الفكرة بسيطة: حاسبة واحدة بدلًا من عدة حاسبات، مصمّمة للسرعة والوضوح والاستخدام اليومي.',
    helpWhyL1: 'حسابات يومية سريعة',
    helpWhyL2: 'أدوات علمية مثل الجذر التربيعي والأُسس والأقواس',
    helpWhyL3: 'حساب النسبة المئوية بسهولة',
    helpWhyL4: 'تحويل العملات والأسعار المباشرة',
    helpWhyL5: 'الملاحظات وسجل الحسابات',
    helpWhyL6: 'بسيط وواضح وسريع في الاستخدام',
    helpWhyL7: 'يعمل كتطبيق قابل للتثبيت (PWA) على أجهزة مختلفة',
    helpSectionsTitle: 'شرح أقسام التطبيق',
    helpSecGeneralTitle: 'الحاسبة العامة',
    helpSecGeneralDesc: 'الحاسبة الرئيسية للعمليات اليومية: الجمع والطرح والضرب والقسمة.',
    helpSecGeneralEx: 'مثال: 12 + 7 = 19.',
    helpSecScientificTitle: 'الأدوات العلمية',
    helpSecScientificDesc: 'اضغط على "Scientific" لاستخدام أزرار الجذر التربيعي والتربيع والأقواس داخل الحاسبة نفسها.',
    helpSecScientificEx: 'مثال: √9 = 3، 2^3 = 8.',
    helpSecPercentTitle: 'حاسبة النسبة المئوية',
    helpSecPercentDesc: 'احسب نسبة مئوية من مبلغ معيّن بسرعة ودون خطوات إضافية.',
    helpSecPercentEx: 'مثال: 15% من 200 = 30.',
    helpSecHistoryTitle: 'السجل',
    helpSecHistoryDesc: 'يحفظ EQ ما حاسبته في آخر 24 ساعة لتعيد الاطلاع عليه أو تشاركه.',
    helpSecNotesTitle: 'الملاحظات',
    helpSecNotesDesc: 'احفظ ملاحظات سريعة ونظّمها في مجلدات وعدّلها في محرّر بملء الشاشة.',
    helpSecCurrencyTitle: 'أدوات العملات',
    helpSecCurrencyDesc: 'ابحث عن العملات واطّلع على الأسعار المباشرة وحوّل بين العملات واستخدم سعرًا مخصصًا واحفظ المفضلة.',
    helpSecSettingsTitle: 'الإعدادات',
    helpSecSettingsDesc: 'غيّر اللغة والسمة والتنبيهات الصوتية بالطريقة التي تناسبك.',
    helpButtonsTitle: 'كيف تستخدم الحاسبة',
    helpBtnNumbers: 'اضغط لكتابة الأرقام.',
    helpBtnAdd: 'يضيف الرقم التالي.',
    helpBtnSub: 'يطرح الرقم التالي.',
    helpBtnMul: 'يضرب في الرقم التالي.',
    helpBtnDiv: 'يقسم على الرقم التالي.',
    helpBtnEquals: 'يعرض النتيجة.',
    helpBtnAc: 'يمسح كل شيء ويبدأ من جديد.',
    helpBtnBack: 'يحذف آخر رقم كتبته.',
    helpBtnDecimal: 'يضيف فاصلة عشرية.',
    helpBtnScientific: 'Scientific / Percentage: يعمل على تشغيل الأدوات الإضافية أو إيقافها.',
    helpBtnSpeak: 'يقرأ النتيجة الحالية بصوت مسموع.',
    helpSettingsExplainTitle: 'الإعدادات',
    helpSetLanguage: 'اللغة: تغيّر لغة التطبيق بالكامل بين اللغات المتاحة.',
    helpSetTheme: 'السمة: اختر المظهر الداكن أو الفاتح أو البنفسجي.',
    helpSetSoundsTitle: 'أصوات التطبيق: المفتاح الرئيسي لأصوات الأزرار والاهتزاز.',
    helpSetSoundsDesc: 'عند تفعيل أصوات التطبيق تُسمع أصوات الأزرار ويكون الاهتزاز مسموحًا. أوقِفه لكتم ذلك، وأعد تشغيله للسماح به مرة أخرى.',
    helpSetSoundsSpeech: 'النطق/TTS منفصل عن أصوات التطبيق ولا يتوقف بإيقافها.',
    helpCurrencyTitle: 'محوّل العملات',
    helpCurrencyDesc: 'اختر العملة التي لديك (من) والعملة التي تريدها (إلى)، ثم أدخل المبلغ.',
    helpCurrencySwap: 'استخدم زر التبديل لعكس العملتين.',
    helpCurrencyFavorites: 'استخدم النجمة لوضع علامة على عملة كمفضلة وافتح "العملات المفضلة" من قائمة العملات.',
    helpCurrencyCustomRate: 'التحويل بسعر مخصص يسمح لك بإدخال سعر الصرف الخاص بك.',
    helpCurrencyLive: 'الأسعار المباشرة تأتي من الخدمة عبر الإنترنت؛ وإذا كانت غير متاحة قد تُستخدم الأسعار المخزنة.',
    helpInstallTitle: 'التثبيت والعمل دون اتصال',
    helpInstallDesc1: 'يمكنك تثبيت EQ كتطبيق على الأجهزة المدعومة.',
    helpInstallDesc2: 'بعض الميزات تعمل دون اتصال باستخدام موارد مخزنة، لكن الأسعار المباشرة وتحديثات التطبيق تحتاج إلى اتصال بالإنترنت.',
    helpBenefitsTitle: 'لماذا تستخدم EQ؟',
    helpBenefit1: 'حاسبة شاملة للكل',
    helpBenefit2: 'حسابات يومية سريعة',
    helpBenefit3: 'أدوات علمية وحساب نسبة مئوية',
    helpBenefit4: 'تحويل العملات',
    helpBenefit5: 'السجل والملاحظات',
    helpBenefit6: 'واجهة متعددة اللغات',
    helpBenefit7: 'تصميم متجاوب ودعم PWA',
    helpLangTitle: 'اللغات',
    helpLangDesc: 'EQ مترجم بالكامل. اختر لغتك من الشريط العلوي أو من الإعدادات، وسيتم تحديث التطبيق بالكامل — بما في ذلك صفحة المساعدة هذه — فورًا.'
  },
  fr: {
    eyebrow: '',
    title: 'EQ',
    install: 'Installer l\'application',
    actions: 'Actions',
    notesManagerTitle: 'Gestionnaire de notes',
    notesManagerSubtitle: 'Organisez les notes dans des dossiers et ouvrez un éditeur plein écran.',
    foldersTitle: 'Dossiers',
    addFolder: '+ Dossier',
    newNoteButton: 'Nouvelle note plein écran',
    notesTitle: 'Notes',
    refreshNotes: 'Actualiser',
    fullScreenNoteTitle: 'Note plein écran',
    noteFolderLabel: 'Dossier',
    noteTitleLabel: 'Titre',
    noteTitlePlaceholder: 'Titre de la note',
    folderSelectLabel: 'Dossier',
    noteBodyPlaceholder: 'Commencez à écrire...',
    percentTab: 'Pourcentage',
    settingsTab: 'Paramètres',
    historyTab: 'Historique',
    percentTitle: 'Calculatrice de pourcentage',
    percentBack: 'Retour',
    amountLabel: 'Montant',
    rateLabel: 'Taux de pourcentage',
    settingsTitle: 'Paramètres et personnalisation',
    languageLabel: 'Langue',
    themeLabel: 'Thème',
    historyTitle: 'Historique 24 heures',
    historyBack: 'Retour',
    historyRemaining: 'restant',
    selectAll: 'Tout sélectionner',
    exportButton: 'Partager / Exporter',
    quickNotesTitle: 'Notes rapides',
    quickNotesToggle: '▼',
    quickNotesAdd: 'Enregistrer',
    quickNotesPlaceholder: 'Écrire une note',
    historyNotePlaceholder: 'Étiqueter ce calcul',
    historyLabel: 'Historique',
    noteLabel: 'Note',
    noteInputPlaceholder: '+ Nouvelle note',
    noteSaved: 'Note enregistrée',
    noteEdit: 'Modifier',
    noteShare: 'Partager',
    emptyHistory: 'Pas encore d\'historique',
    copied: 'Résultat copié',
    pasted: 'Nombre collé',
    installed: 'L\'application est prête à être installée',
    noSelection: 'Sélectionnez un élément à partager',
    shareTitle: 'Historique de Calculatrice EQ',
    shareMessage: 'Exporté depuis Calculatrice EQ',
    themeDark: 'Sombre',
    themeLight: 'Clair',
    themeViolet: 'Violet',
    languageEnglish: 'English',
    languageSpanish: 'Español',
    languageArabic: 'العربية',
    languageFrench: 'Français',
    languageRussian: 'Русский',
    languageGerman: 'Deutsch',
    languageTurkish: 'Türkçe',
    drawerTop: 'Haut',
    drawerSide: 'Côté',
    expand: 'Développer',
    Minimize: 'Réduire',
    installModalSubtitle: 'Ajoutez-le à votre écran d\'accueil',
    installModalClose: 'Compris',
    settingsSubtitle: 'Personnalisez la langue, le thème et les commentaires.',
    appSoundsLabel: 'Sons de l\'application',
    soundHapticsLabel: 'Son et haptique',
    soundHapticsCaption: 'Activer les sons de clic et les vibrations',
    soundProfileLabel: 'Profil sonore des boutons',
    profileClassic: 'Classique',
    profileSoft: 'Douce',
    profileModern: 'Moderne',
    profileClick: 'Clic',
    profileSilent: 'Silencieux',
    speakerLabel: 'Haut-parleur / Lecture vocale',
    speakerCaption: "Lorsqu'il est ACTIVÉ, le résultat est lu à voix haute automatiquement après avoir appuyé sur = . Lorsqu'il est DÉSACTIVÉ, la lecture est manuelle uniquement via le bouton du haut-parleur.",
    modeGeneral: 'Calculatrice générale',
    scientificToggle: 'Scientifique',
    percentResultLabel: 'Résultat',
    currencyConverterTitle: 'Convertisseur de devises direct',
    currencyConverterSubtitle: 'Convertissez des montants instantanément avec les taux en direct.',
    swapButton: 'Échanger',
    favoritesButton: 'Favoris',
    recentButton: 'Récent',
    fromLabel: 'De',
    toLabel: 'Vers',
    convertedLabel: 'Converti',
    bankRateMode: '🏦 Taux bancaire',
    marketRateMode: '🏪 Taux du marché',
    marketRateFieldLabel: 'Taux de change du marché',
    cachedLabel: 'En cache',
    refreshButton: 'Actualiser',
    globalDirectoryButton: 'Répertoire mondial',
    currencyDirectoryTitle: 'Répertoire mondial des devises',
    currencyDirectorySubtitle: 'Recherchez des devises par nom de pays ou code.',
    currencySearchPlaceholder: 'Rechercher un pays ou un code',
    drawerEyebrow: '',
    drawerTitle: 'EQ',
    drawerHistory: 'Historique',
    drawerNotes: 'Notes',
    drawerConverter: 'Convertisseur de devises direct',
    drawerDirectory: 'Répertoire mondial des devises & recherche',
    drawerInstall: 'Installer l\'application',
    drawerSettings: 'Paramètres',
    installModalTitle: 'Installer sur iPhone',
    installModalStep1: 'Étape 1 : Appuyez sur le bouton Partager (⎘ / ⇡) en bas ou en haut du navigateur.',
    installModalStep2: 'Étape 2 : Choisissez "Ajouter à l\'écran d\'accueil" dans le menu.',
    currencyOptionSearch: 'Rechercher une devise',
    currencyOptionPrices: 'Cours des devises en direct',
    currencyOptionConvert: 'Convertir des devises',
    currencyOptionFavorites: 'Devises favorites',
    currencyFavoritesTitle: 'Favoris',
    currencyFavoritesEmpty: 'Aucune devise favorite pour le moment',
    currencyFavoritesEmptyHint: 'Appuyez sur l\'étoile d\'une devise pour l\'ajouter ici',
    currencyOptionCustomRate: 'Convertir à un taux personnalisé',
    customRateTitle: 'Convertir à un taux personnalisé',
    customRateFieldLabel: 'Taux de change',
    currencyRatesTitle: 'Taux de change',
    currencyRatesSearchPlaceholder: 'Rechercher une devise ou un code',
    currencyRatesEmpty: 'Aucune devise trouvée',
    currencyRatesLoading: 'Chargement des taux…',
    currencyRatesError: 'Taux indisponibles',
    recentlyDeletedTitle: 'Récemment supprimé',
    emptyNotesText: 'Pas de notes',
    emptyNotesAction: '+ Nouvelle note',
    emptyDeletedText: 'Aucune note supprimée',
    deleteConfirmTitle: 'Supprimer définitivement ?',
    deleteConfirmText: 'Cette action est irréversible.',
    cancelBtn: 'Annuler',
    deletePermanentBtn: 'Supprimer',
    doneBtn: 'Terminé',
    deleteNoteBtn: 'Supprimer la note',
    restoreBtn: 'Restaurer',
    helpTitle: 'Aide et à propos',
    helpSubtitle: 'Apprenez à utiliser EQ et découvrez ses fonctionnalités.',
    helpAboutTitle: 'À propos de l’application',
    helpAboutDesc: 'EQ est une calculatrice intelligente et complète qui réunit calculs du quotidien, outils scientifiques et de pourcentage, conversion de devises et bien plus dans une seule application simple à utiliser.',
    helpWhyTitle: 'Pourquoi EQ a-t-il été créé ?',
    helpWhyDesc: 'L’idée est simple : une seule calculatrice au lieu de plusieurs, pensée pour la rapidité, la clarté et l’usage quotidien.',
    helpWhyL1: 'Calculs quotidiens rapides',
    helpWhyL2: 'Outils scientifiques : racine carrée, puissances et parenthèses',
    helpWhyL3: 'Calculs de pourcentage faciles',
    helpWhyL4: 'Conversion de devises et taux en direct',
    helpWhyL5: 'Notes et historique des calculs',
    helpWhyL6: 'Simple, claire et rapide à utiliser',
    helpWhyL7: 'Fonctionne comme application installable (PWA) sur différents appareils',
    helpSectionsTitle: 'Explication des sections de l’application',
    helpSecGeneralTitle: 'Calculatrice générale',
    helpSecGeneralDesc: 'La calculatrice principale pour les opérations quotidiennes : additionner, soustraire, multiplier et diviser.',
    helpSecGeneralEx: 'Exemple : 12 + 7 = 19.',
    helpSecScientificTitle: 'Outils scientifiques',
    helpSecScientificDesc: 'Touchez « Scientific » pour utiliser les boutons racine carrée, carré et parenthèses dans la même calculatrice.',
    helpSecScientificEx: 'Exemple : √9 = 3, 2^3 = 8.',
    helpSecPercentTitle: 'Calculatrice de pourcentage',
    helpSecPercentDesc: 'Calculez rapidement un pourcentage d’un montant sans étapes supplémentaires.',
    helpSecPercentEx: 'Exemple : 15 % de 200 = 30.',
    helpSecHistoryTitle: 'Historique',
    helpSecHistoryDesc: 'EQ mémorise ce que vous avez calculé au cours des 24 dernières heures pour le revoir ou le partager.',
    helpSecNotesTitle: 'Notes',
    helpSecNotesDesc: 'Enregistrez des notes rapides, rangez-les dans des dossiers et modifiez-les dans un éditeur plein écran.',
    helpSecCurrencyTitle: 'Outils de devises',
    helpSecCurrencyDesc: 'Recherchez des devises, consultez les taux en direct, convertissez, utilisez un taux personnalisé et gardez vos favoris.',
    helpSecSettingsTitle: 'Paramètres',
    helpSecSettingsDesc: 'Modifiez la langue, le thème et les sons selon vos envies.',
    helpButtonsTitle: 'Comment utiliser la calculatrice',
    helpBtnNumbers: 'Touchez pour saisir des chiffres.',
    helpBtnAdd: 'Ajoute le nombre suivant.',
    helpBtnSub: 'Soustrait le nombre suivant.',
    helpBtnMul: 'Multiplie par le nombre suivant.',
    helpBtnDiv: 'Divise par le nombre suivant.',
    helpBtnEquals: 'Affiche le résultat.',
    helpBtnAc: 'Efface tout et recommence.',
    helpBtnBack: 'Supprime le dernier chiffre saisi.',
    helpBtnDecimal: 'Ajoute une virgule décimale.',
    helpBtnScientific: 'Scientific / Percentage : active ou désactive les outils supplémentaires.',
    helpBtnSpeak: 'Lit le résultat actuel à voix haute.',
    helpSettingsExplainTitle: 'Paramètres',
    helpSetLanguage: 'Langue : change toute l’application entre les langues disponibles.',
    helpSetTheme: 'Thème : choisissez l’apparence Sombre, Claire ou Violette.',
    helpSetSoundsTitle: 'Sons de l’application : interrupteur principal des sons et de la vibration.',
    helpSetSoundsDesc: 'Lorsque Sons est activé, les sons des boutons et la vibration sont autorisés. Désactivez-le pour les couper et activez-le à nouveau pour les permettre.',
    helpSetSoundsSpeech: 'La voix/TTS est séparée des Sons et n’est pas désactivée par Sons.',
    helpCurrencyTitle: 'Convertisseur de devises',
    helpCurrencyDesc: 'Choisissez la devise que vous avez (De) et celle que vous voulez (À), puis saisissez un montant.',
    helpCurrencySwap: 'Utilisez le bouton d’échange pour inverser les deux devises.',
    helpCurrencyFavorites: 'Utilisez l’étoile pour marquer une devise comme favorite et ouvrez Devises favorites depuis le menu devises.',
    helpCurrencyCustomRate: 'Convertir à taux personnalisé vous permet de saisir votre propre taux de change.',
    helpCurrencyLive: 'Les prix en direct proviennent du service en ligne ; s’il est indisponible, des taux en cache peuvent être utilisés.',
    helpInstallTitle: 'Installer et hors ligne',
    helpInstallDesc1: 'Vous pouvez installer EQ comme application sur les appareils pris en charge.',
    helpInstallDesc2: 'Certaines fonctionnalités fonctionnent hors ligne avec des ressources stockées, mais les taux en direct et les mises à jour nécessitent une connexion Internet.',
    helpBenefitsTitle: 'Pourquoi utiliser EQ ?',
    helpBenefit1: 'Calculatrice tout-en-un',
    helpBenefit2: 'Calculs quotidiens rapides',
    helpBenefit3: 'Outils scientifiques et de pourcentage',
    helpBenefit4: 'Conversion de devises',
    helpBenefit5: 'Historique et notes',
    helpBenefit6: 'Interface multilingue',
    helpBenefit7: 'Design responsive et support PWA',
    helpLangTitle: 'Langues',
    helpLangDesc: 'EQ est entièrement traduit. Choisissez votre langue dans la barre supérieure ou dans les Paramètres, et toute l’application — y compris cette page d’aide — se met à jour instantanément.'
  },
  ru: {
    eyebrow: '',
    title: 'EQ',
    install: 'Установить приложение',
    actions: 'Действия',
    notesManagerTitle: 'Менеджер заметок',
    notesManagerSubtitle: 'Организуйте заметки в папках и открывайте полноэкранный редактор.',
    foldersTitle: 'Папки',
    addFolder: '+ Папка',
    newNoteButton: 'Новая полноэкранная заметка',
    notesTitle: 'Заметки',
    refreshNotes: 'Обновить',
    fullScreenNoteTitle: 'Полноэкранная заметка',
    noteFolderLabel: 'Папка',
    noteTitleLabel: 'Заголовок',
    noteTitlePlaceholder: 'Заголовок заметки',
    folderSelectLabel: 'Папка',
    noteBodyPlaceholder: 'Начните писать...',
    percentTab: 'Проценты',
    settingsTab: 'Настройки',
    historyTab: 'История',
    percentTitle: 'Калькулятор процентов',
    percentBack: 'Назад',
    amountLabel: 'Сумма',
    rateLabel: 'Процентная ставка',
    settingsTitle: 'Настройки и кастомизация',
    languageLabel: 'Язык',
    themeLabel: 'Тема',
    historyTitle: 'История за 24 часа',
    historyBack: 'Назад',
    historyRemaining: 'осталось',
    selectAll: 'Выбрать все',
    exportButton: 'Поделиться / Экспорт',
    quickNotesTitle: 'Быстрые заметки',
    quickNotesToggle: '▼',
    quickNotesAdd: 'Сохранить',
    quickNotesPlaceholder: 'Напишите заметку',
    historyNotePlaceholder: 'Пометьте этот расчет',
    historyLabel: 'История',
    noteLabel: 'Заметка',
    noteInputPlaceholder: '+ Новая заметка',
    noteSaved: 'Заметка сохранена',
    noteEdit: 'Редактировать',
    noteShare: 'Поделиться',
    emptyHistory: 'История пуста',
    copied: 'Результат скопирован',
    pasted: 'Число вставлено',
    installed: 'Приложение готово к установке',
    noSelection: 'Выберите элемент для публикации',
    shareTitle: 'История калькулятора EQ',
    shareMessage: 'Экспортировано из калькулятора EQ',
    themeDark: 'Тёмная',
    themeLight: 'Светлая',
    themeViolet: 'Фиолетовая',
    languageEnglish: 'English',
    languageSpanish: 'Español',
    languageArabic: 'العربية',
    languageFrench: 'Français',
    languageRussian: 'Русский',
    languageGerman: 'Deutsch',
    languageTurkish: 'Türkçe',
    drawerTop: 'Сверху',
    drawerSide: 'Сбоку',
    expand: 'Развернуть',
    Minimize: 'Свернуть',
    installModalSubtitle: 'Добавьте его на главный экран',
    installModalClose: 'Понятно',
    settingsSubtitle: 'Настройте язык, тему и отзывы.',
    appSoundsLabel: 'Звуки приложения',
    soundHapticsLabel: 'Звук кнопок и тактильная связь',
    soundHapticsCaption: 'Включить звуки кликов и вибрацию',
    soundProfileLabel: 'Профиль звука кнопок',
    profileClassic: 'Классический',
    profileSoft: 'Мягкий',
    profileModern: 'Современный',
    profileClick: 'Щелчок',
    profileSilent: 'Без звука',
    speakerLabel: 'Динамик / Озвучивание',
    speakerCaption: 'Когда ВКЛЮЧЕНО, результат озвучивается автоматически после нажатия = . Когда ВЫКЛЮЧЕНО, чтение только вручную кнопкой динамика.',
    modeGeneral: 'Обычный калькулятор',
    scientificToggle: 'Научный',
    percentResultLabel: 'Результат',
    currencyConverterTitle: 'Прямой конвертер валют',
    currencyConverterSubtitle: 'Мгновенная конвертация сумм по актуальным курсам.',
    swapButton: 'Поменять',
    favoritesButton: 'Избранное',
    recentButton: 'Недавние',
    fromLabel: 'Из',
    toLabel: 'В',
    convertedLabel: 'Конвертировано',
    bankRateMode: '🏦 Банковский курс',
    marketRateMode: '🏪 Рыночный курс',
    marketRateFieldLabel: 'Рыночный обменный курс',
    cachedLabel: 'Кэшировано',
    refreshButton: 'Обновить',
    globalDirectoryButton: 'Глобальный справочник',
    currencyDirectoryTitle: 'Глобальный справочник валют',
    currencyDirectorySubtitle: 'Поиск бумажных валют по названию страны или коду.',
    currencySearchPlaceholder: 'Поиск страны или кода',
    drawerEyebrow: '',
    drawerTitle: 'EQ',
    drawerHistory: 'История',
    drawerNotes: 'Заметки',
    drawerConverter: 'Прямой конвертер валют',
    drawerDirectory: 'Глобальный справочник валют и поиск',
    drawerInstall: 'Установить приложение',
    drawerSettings: 'Настройки',
    installModalTitle: 'Установка на iPhone',
    installModalStep1: 'Шаг 1: Нажмите кнопку «Поделиться» (⎘ / ⇡) внизу или вверху браузера.',
    installModalStep2: 'Шаг 2: Выберите «На главный экран» в меню.',
    currencyOptionSearch: 'Поиск валюты',
    currencyOptionPrices: 'Живые курсы валют',
    currencyOptionConvert: 'Конвертация валют',
    currencyOptionFavorites: 'Избранные валюты',
    currencyFavoritesTitle: 'Избранное',
    currencyFavoritesEmpty: 'Пока нет избранных валют',
    currencyFavoritesEmptyHint: 'Нажмите на звезду любой валюты, чтобы добавить её сюда',
    currencyOptionCustomRate: 'Конвертация по собственному курсу',
    customRateTitle: 'Конвертация по собственному курсу',
    customRateFieldLabel: 'Обменный курс',
    currencyRatesTitle: 'Курсы валют',
    currencyRatesSearchPlaceholder: 'Поиск валюты или кода',
    currencyRatesEmpty: 'Валюты не найдены',
    currencyRatesLoading: 'Загрузка курсов…',
    currencyRatesError: 'Курсы недоступны',
    recentlyDeletedTitle: 'Недавно удалённые',
    emptyNotesText: 'Нет заметок',
    emptyNotesAction: '+ Новая заметка',
    emptyDeletedText: 'Нет удалённых заметок',
    deleteConfirmTitle: 'Удалить навсегда?',
    deleteConfirmText: 'Это действие нельзя отменить.',
    cancelBtn: 'Отмена',
    deletePermanentBtn: 'Удалить',
    doneBtn: 'Готово',
    deleteNoteBtn: 'Удалить заметку',
    restoreBtn: 'Восстановить',
    helpTitle: 'Справка и о приложении',
    helpSubtitle: 'Узнайте, как пользоваться EQ и познакомьтесь с его функциями.',
    helpAboutTitle: 'О приложении',
    helpAboutDesc: 'EQ — это умный многофункциональный калькулятор, который объединяет повседневные расчёты, научные и процентные инструменты, конвертацию валют и многое другое в одном простом приложении.',
    helpWhyTitle: 'Зачем был создан EQ?',
    helpWhyDesc: 'Идея проста: один калькулятор вместо нескольких, созданный для скорости, ясности и повседневного использования.',
    helpWhyL1: 'Быстрые повседневные расчёты',
    helpWhyL2: 'Научные инструменты: квадратный корень, степени и скобки',
    helpWhyL3: 'Лёгкие расчёты процентов',
    helpWhyL4: 'Конвертация валют и актуальные курсы',
    helpWhyL5: 'Заметки и история вычислений',
    helpWhyL6: 'Просто, понятно и быстро в использовании',
    helpWhyL7: 'Работает как устанавливаемое приложение (PWA) на разных устройствах',
    helpSectionsTitle: 'Объяснение разделов приложения',
    helpSecGeneralTitle: 'Обычный калькулятор',
    helpSecGeneralDesc: 'Основной калькулятор для повседневных операций: сложение, вычитание, умножение и деление.',
    helpSecGeneralEx: 'Пример: 12 + 7 = 19.',
    helpSecScientificTitle: 'Научные инструменты',
    helpSecScientificDesc: 'Нажмите «Scientific», чтобы использовать кнопки квадратного корня, квадрата и скобок в том же калькуляторе.',
    helpSecScientificEx: 'Пример: √9 = 3, 2^3 = 8.',
    helpSecPercentTitle: 'Калькулятор процентов',
    helpSecPercentDesc: 'Быстро вычислите процент от суммы без лишних действий.',
    helpSecPercentEx: 'Пример: 15% от 200 = 30.',
    helpSecHistoryTitle: 'История',
    helpSecHistoryDesc: 'EQ запоминает ваши вычисления за последние 24 часа, чтобы вы могли их просмотреть или поделиться ими.',
    helpSecNotesTitle: 'Заметки',
    helpSecNotesDesc: 'Сохраняйте быстрые заметки, размещайте их по папкам и редактируйте в полноэкранном редакторе.',
    helpSecCurrencyTitle: 'Инструменты валют',
    helpSecCurrencyDesc: 'Ищите валюты, смотрите актуальные курсы, конвертируйте, используйте собственный курс и сохраняйте избранное.',
    helpSecSettingsTitle: 'Настройки',
    helpSecSettingsDesc: 'Изменяйте язык, тему и звуковые уведомления по своему вкусу.',
    helpButtonsTitle: 'Как пользоваться калькулятором',
    helpBtnNumbers: 'Нажмите, чтобы ввести цифры.',
    helpBtnAdd: 'Прибавляет следующее число.',
    helpBtnSub: 'Вычитает следующее число.',
    helpBtnMul: 'Умножает на следующее число.',
    helpBtnDiv: 'Делит на следующее число.',
    helpBtnEquals: 'Показывает результат.',
    helpBtnAc: 'Очищает всё и начинает заново.',
    helpBtnBack: 'Удаляет последнюю введённую цифру.',
    helpBtnDecimal: 'Добавляет десятичную точку.',
    helpBtnScientific: 'Scientific / Percentage: включает или выключает дополнительные инструменты.',
    helpBtnSpeak: 'Озвучивает текущий результат.',
    helpSettingsExplainTitle: 'Настройки',
    helpSetLanguage: 'Язык: переключает всё приложение между доступными языками.',
    helpSetTheme: 'Тема: выберите Тёмный, Светлый или Фиолетовый вид.',
    helpSetSoundsTitle: 'Звуки приложения: главный переключатель звука и вибрации.',
    helpSetSoundsDesc: 'Когда Звуки включены, звук кнопок и вибрация разрешены. Выключите их, чтобы отключить, и включите снова, чтобы разрешить.',
    helpSetSoundsSpeech: 'Озвучивание/ТТС отдельно от Звуков и не отключается Звуками.',
    helpCurrencyTitle: 'Конвертер валют',
    helpCurrencyDesc: 'Выберите валюту, которая у вас есть (Из), и нужную вам (В), затем введите сумму.',
    helpCurrencySwap: 'Используйте кнопку обмена, чтобы поменять валюты местами.',
    helpCurrencyFavorites: 'Используйте звезду, чтобы отметить валюту как избранную, и откройте Избранные валюты из меню валют.',
    helpCurrencyCustomRate: 'Конвертация по собственному курсу позволяет ввести свой обменный курс.',
    helpCurrencyLive: 'Актуальные цены поступают из онлайн-сервиса; если он недоступен, могут использоваться сохранённые курсы.',
    helpInstallTitle: 'Установка и офлайн',
    helpInstallDesc1: 'Вы можете установить EQ как приложение на поддерживаемых устройствах.',
    helpInstallDesc2: 'Некоторые функции работают офлайн на сохранённых данных, но актуальные курсы и обновления приложения требуют подключения к интернету.',
    helpBenefitsTitle: 'Зачем использовать EQ?',
    helpBenefit1: 'Всё в одном калькуляторе',
    helpBenefit2: 'Быстрые повседневные расчёты',
    helpBenefit3: 'Научные и процентные инструменты',
    helpBenefit4: 'Конвертация валют',
    helpBenefit5: 'История и заметки',
    helpBenefit6: 'Многоязычный интерфейс',
    helpBenefit7: 'Адаптивный дизайн и поддержка PWA',
    helpLangTitle: 'Языки',
    helpLangDesc: 'EQ полностью переведён. Выберите язык в верхней панели или в Настройках, и всё приложение — включая эту страницу справки — обновится мгновенно.'
  },
  de: {
    eyebrow: '',
    title: 'EQ',
    install: 'App installieren',
    actions: 'Aktionen',
    notesManagerTitle: 'Notizverwaltung',
    notesManagerSubtitle: 'Organisieren Sie Notizen in Ordnern und öffnen Sie einen Vollbild-Editor.',
    foldersTitle: 'Ordner',
    addFolder: '+ Ordner',
    newNoteButton: 'Neue Vollbild-Notiz',
    notesTitle: 'Notizen',
    refreshNotes: 'Aktualisieren',
    fullScreenNoteTitle: 'Vollbild-Notiz',
    noteFolderLabel: 'Ordner',
    noteTitleLabel: 'Titel',
    noteTitlePlaceholder: 'Notiztitel',
    folderSelectLabel: 'Ordner',
    noteBodyPlaceholder: 'Beginnen Sie zu schreiben...',
    percentTab: 'Prozent',
    settingsTab: 'Einstellungen',
    historyTab: 'Verlauf',
    percentTitle: 'Prozentrechner',
    percentBack: 'Zurück',
    amountLabel: 'Betrag',
    rateLabel: 'Prozentsatz',
    settingsTitle: 'Einstellungen & Anpassung',
    languageLabel: 'Sprache',
    themeLabel: 'Design',
    historyTitle: '24-Stunden-Verlauf',
    historyBack: 'Zurück',
    historyRemaining: 'verbleibend',
    selectAll: 'Alle auswählen',
    exportButton: 'Teilen / Exportieren',
    quickNotesTitle: 'Schnellnotizen',
    quickNotesToggle: '▼',
    quickNotesAdd: 'Speichern',
    quickNotesPlaceholder: 'Notiz schreiben',
    historyNotePlaceholder: 'Diese Berechnung taggen',
    historyLabel: 'Verlauf',
    noteLabel: 'Notiz',
    noteInputPlaceholder: '+ Neue Notiz',
    noteSaved: 'Notiz gespeichert',
    noteEdit: 'Bearbeiten',
    noteShare: 'Teilen',
    emptyHistory: 'Noch kein Verlauf',
    copied: 'Ergebnis kopiert',
    pasted: 'Zahl eingefügt',
    installed: 'App ist bereit zur Installation',
    noSelection: 'Wählen Sie ein Element zum Teilen',
    shareTitle: 'EQ-Rechner-Verlauf',
    shareMessage: 'Exportiert aus EQ-Rechner',
    themeDark: 'Dunkel',
    themeLight: 'Hell',
    themeViolet: 'Violett',
    languageEnglish: 'English',
    languageSpanish: 'Español',
    languageArabic: 'العربية',
    languageFrench: 'Français',
    languageRussian: 'Русский',
    languageGerman: 'Deutsch',
    languageTurkish: 'Türkçe',
    drawerTop: 'Oben',
    drawerSide: 'Seite',
    expand: 'Erweitern',
    Minimize: 'Minimieren',
    installModalSubtitle: 'Zur Startseite hinzufügen',
    installModalClose: 'Verstanden',
    settingsSubtitle: 'Sprache, Design und Feedback anpassen.',
    appSoundsLabel: 'App-Sounds',
    soundHapticsLabel: 'Tastenton & Haptik',
    soundHapticsCaption: 'Klickgeräusche und Vibration aktivieren',
    soundProfileLabel: 'Tastenton-Profil',
    profileClassic: 'Klassisch',
    profileSoft: 'Sanft',
    profileModern: 'Modern',
    profileClick: 'Klick',
    profileSilent: 'Stumm',
    speakerLabel: 'Lautsprecher / Sprachausgabe',
    speakerCaption: 'Wenn EIN, wird das Ergebnis nach dem Drücken von = automatisch vorgelesen. Wenn AUS, erfolgt das Vorlesen nur manuell über die Lautsprecher-Taste.',
    modeGeneral: 'Allgemeiner Rechner',
    scientificToggle: 'Wissenschaftlich',
    percentResultLabel: 'Ergebnis',
    currencyConverterTitle: 'Direkter Währungsrechner',
    currencyConverterSubtitle: 'Beträge sofort mit Live-Kursen umrechnen.',
    swapButton: 'Tauschen',
    favoritesButton: 'Favoriten',
    recentButton: 'Zuletzt',
    fromLabel: 'Von',
    toLabel: 'Zu',
    convertedLabel: 'Umgerechnet',
    bankRateMode: '🏦 Bankkurs',
    marketRateMode: '🏪 Marktkurs',
    marketRateFieldLabel: 'Markt-Wechselkurs',
    cachedLabel: 'Zwischengespeichert',
    refreshButton: 'Aktualisieren',
    globalDirectoryButton: 'Globales Verzeichnis',
    currencyDirectoryTitle: 'Globales Währungsverzeichnis',
    currencyDirectorySubtitle: 'Papierwährungen nach Ländername oder Währungscode suchen.',
    currencySearchPlaceholder: 'Land oder Code suchen',
    drawerEyebrow: '',
    drawerTitle: 'EQ',
    drawerHistory: 'Verlauf',
    drawerNotes: 'Notizen',
    drawerConverter: 'Direkter Währungsrechner',
    drawerDirectory: 'Globales Währungsverzeichnis & Suche',
    drawerInstall: 'App installieren',
    drawerSettings: 'Einstellungen',
    installModalTitle: 'Auf iPhone installieren',
    installModalStep1: 'Schritt 1: Tippen Sie auf die Schaltfläche Teilen (⎘ / ⇡) unten oder oben im Browser.',
    installModalStep2: 'Schritt 2: Wählen Sie „Zum Home-Bildschirm hinzufügen" aus dem Menü.',
    currencyOptionSearch: 'Währung suchen',
    currencyOptionPrices: 'Live-Währungskurse',
    currencyOptionConvert: 'Währungen umrechnen',
    currencyOptionFavorites: 'Favoriten-Währungen',
    currencyFavoritesTitle: 'Favoriten',
    currencyFavoritesEmpty: 'Noch keine Favoriten-Währungen',
    currencyFavoritesEmptyHint: 'Tippen Sie auf den Stern einer Währung, um sie hier hinzuzufügen',
    currencyOptionCustomRate: 'Zu benutzerdefiniertem Kurs umrechnen',
    customRateTitle: 'Zu benutzerdefiniertem Kurs umrechnen',
    customRateFieldLabel: 'Wechselkurs',
    currencyRatesTitle: 'Wechselkurse',
    currencyRatesSearchPlaceholder: 'Währung oder Code suchen',
    currencyRatesEmpty: 'Keine Währungen gefunden',
    currencyRatesLoading: 'Kurse werden geladen…',
    currencyRatesError: 'Kurse nicht verfügbar',
    recentlyDeletedTitle: 'Kürzlich gelöscht',
    emptyNotesText: 'Keine Notizen',
    emptyNotesAction: '+ Neue Notiz',
    emptyDeletedText: 'Keine gelöschten Notizen',
    deleteConfirmTitle: 'Endgültig löschen?',
    deleteConfirmText: 'Diese Aktion kann nicht rückgängig gemacht werden.',
    cancelBtn: 'Abbrechen',
    deletePermanentBtn: 'Löschen',
    doneBtn: 'Fertig',
    deleteNoteBtn: 'Notiz löschen',
    restoreBtn: 'Wiederherstellen',
    helpTitle: 'Hilfe und Info',
    helpSubtitle: 'Erfahren Sie, wie Sie EQ nutzen und entdecken Sie seine Funktionen.',
    helpAboutTitle: 'Über die App',
    helpAboutDesc: 'EQ ist ein intelligenter All-in-One-Rechner, der Alltagsmathematik, wissenschaftliche und Prozentwerkzeuge, Währungsrechnung und vieles mehr in einer einfachen, benutzerfreundlichen App vereint.',
    helpWhyTitle: 'Warum wurde EQ entwickelt?',
    helpWhyDesc: 'Die Idee ist einfach: ein Rechner statt vieler, gemacht für Schnelligkeit, Klarheit und den Alltag.',
    helpWhyL1: 'Schnelle tägliche Berechnungen',
    helpWhyL2: 'Wissenschaftliche Werkzeuge wie Quadratwurzel, Potenzen und Klammern',
    helpWhyL3: 'Einfache Prozentberechnungen',
    helpWhyL4: 'Währungsrechnung und Live-Kurse',
    helpWhyL5: 'Notizen und Berechnungsverlauf',
    helpWhyL6: 'Einfach, klar und schnell zu bedienen',
    helpWhyL7: 'Funktioniert als installierbare App (PWA) auf verschiedenen Geräten',
    helpSectionsTitle: 'Erklärung der App-Bereiche',
    helpSecGeneralTitle: 'Allgemeiner Rechner',
    helpSecGeneralDesc: 'Der Hauptrechner für den Alltag: Addieren, Subtrahieren, Multiplizieren und Dividieren.',
    helpSecGeneralEx: 'Beispiel: 12 + 7 = 19.',
    helpSecScientificTitle: 'Wissenschaftliche Werkzeuge',
    helpSecScientificDesc: 'Tippen Sie auf „Scientific“, um die Quadratwurzel-, Quadrat- und Klammerntasten im selben Rechner zu nutzen.',
    helpSecScientificEx: 'Beispiel: √9 = 3, 2^3 = 8.',
    helpSecPercentTitle: 'Prozentrechner',
    helpSecPercentDesc: 'Berechnen Sie schnell einen Prozentsatz einer Summe ohne Extra-Schritte.',
    helpSecPercentEx: 'Beispiel: 15 % von 200 = 30.',
    helpSecHistoryTitle: 'Verlauf',
    helpSecHistoryDesc: 'EQ merkt sich, was Sie in den letzten 24 Stunden berechnet haben, damit Sie es überprüfen oder teilen können.',
    helpSecNotesTitle: 'Notizen',
    helpSecNotesDesc: 'Speichern Sie Schnellnotizen, ordnen Sie sie in Ordnern und bearbeiten Sie sie in einem Vollbild-Editor.',
    helpSecCurrencyTitle: 'Währungswerkzeuge',
    helpSecCurrencyDesc: 'Suchen Sie Währungen, sehen Sie Live-Kurse, rechnen Sie um, nutzen Sie einen eigenen Kurs und speichern Sie Favoriten.',
    helpSecSettingsTitle: 'Einstellungen',
    helpSecSettingsDesc: 'Ändern Sie Sprache, Design und Klang wie es Ihnen gefällt.',
    helpButtonsTitle: 'So verwenden Sie den Rechner',
    helpBtnNumbers: 'Tippen, um Ziffern einzugeben.',
    helpBtnAdd: 'Addiert die nächste Zahl.',
    helpBtnSub: 'Subtrahiert die nächste Zahl.',
    helpBtnMul: 'Multipliziert mit der nächsten Zahl.',
    helpBtnDiv: 'Dividiert durch die nächste Zahl.',
    helpBtnEquals: 'Zeigt das Ergebnis.',
    helpBtnAc: 'Löscht alles und beginnt neu.',
    helpBtnBack: 'Löscht die letzte eingegebene Ziffer.',
    helpBtnDecimal: 'Fügt ein Dezimalkomma hinzu.',
    helpBtnScientific: 'Scientific / Percentage: schaltet die Zusatzwerkzeuge ein und aus.',
    helpBtnSpeak: 'Spricht das aktuelle Ergebnis vor.',
    helpSettingsExplainTitle: 'Einstellungen',
    helpSetLanguage: 'Sprache: wechselt die gesamte App zwischen den verfügbaren Sprachen.',
    helpSetTheme: 'Design: wählen Sie Dunkel, Hell oder Violett.',
    helpSetSoundsTitle: 'App-Töne: der Hauptschalter für Ton- und Vibrationsrückmeldung.',
    helpSetSoundsDesc: 'Wenn App-Töne eingeschaltet ist, sind Tastenton und Vibration erlaubt. Schalten Sie es aus, um diese Rückmeldung zu stummen, und wieder ein, um sie zu erlauben.',
    helpSetSoundsSpeech: 'Sprache/TTS ist getrennt von App-Tönen und wird von App-Tönen nicht ausgeschaltet.',
    helpCurrencyTitle: 'Währungsrechner',
    helpCurrencyDesc: 'Wählen Sie die Währung, die Sie haben (Von), und die gewünschte (Nach), und geben Sie einen Betrag ein.',
    helpCurrencySwap: 'Nutzen Sie die Tausch-Taste, um die beiden Währungen zu vertauschen.',
    helpCurrencyFavorites: 'Nutzen Sie den Stern, um eine Währung als Favorit zu markieren, und öffnen Sie Favoriten-Währungen aus dem Währungsmenü.',
    helpCurrencyCustomRate: 'Mit „Eigener Kurs umrechnen“ können Sie Ihren eigenen Wechselkurs eingeben.',
    helpCurrencyLive: 'Live-Preise kommen vom Online-Dienst; ist er nicht verfügbar, können zwischengespeicherte Kurse verwendet werden.',
    helpInstallTitle: 'Installieren und offline',
    helpInstallDesc1: 'Sie können EQ auf unterstützten Geräten als App installieren.',
    helpInstallDesc2: 'Einige Funktionen funktionieren offline mit gespeicherten Ressourcen, aber Live-Kurse und App-Updates benötigen eine Internetverbindung.',
    helpBenefitsTitle: 'Warum EQ verwenden?',
    helpBenefit1: 'All-in-One-Rechner',
    helpBenefit2: 'Schnelle tägliche Berechnungen',
    helpBenefit3: 'Wissenschaftliche und Prozentwerkzeuge',
    helpBenefit4: 'Währungsrechnung',
    helpBenefit5: 'Verlauf und Notizen',
    helpBenefit6: 'Mehrsprachige Oberfläche',
    helpBenefit7: 'Responsives Design und PWA-Support',
    helpLangTitle: 'Sprachen',
    helpLangDesc: 'EQ ist vollständig übersetzt. Wählen Sie Ihre Sprache in der oberen Leiste oder in den Einstellungen, und die gesamte App – einschließlich dieser Hilfeseite – wird sofort aktualisiert.'
  },
  tr: {
    eyebrow: '',
    title: 'EQ',
    install: 'Uygulamayı Yükle',
    actions: 'Eylemler',
    notesManagerTitle: 'Not Yöneticisi',
    notesManagerSubtitle: 'Notları klasörlerde düzenleyin ve tam ekran düzenleyici açın.',
    foldersTitle: 'Klasörler',
    addFolder: '+ Klasör',
    newNoteButton: 'Yeni Tam Ekran Not',
    notesTitle: 'Notlar',
    refreshNotes: 'Yenile',
    fullScreenNoteTitle: 'Tam Ekran Not',
    noteFolderLabel: 'Klasör',
    noteTitleLabel: 'Başlık',
    noteTitlePlaceholder: 'Not başlığı',
    folderSelectLabel: 'Klasör',
    noteBodyPlaceholder: 'Yazmaya başla...',
    percentTab: 'Yüzde',
    settingsTab: 'Ayarlar',
    historyTab: 'Geçmiş',
    percentTitle: 'Yüzde Hesaplayıcı',
    percentBack: 'Geri',
    amountLabel: 'Miktar',
    rateLabel: 'Yüzde Oranı',
    settingsTitle: 'Ayarlar ve Özelleştirme',
    languageLabel: 'Dil',
    themeLabel: 'Tema',
    historyTitle: '24 Saatlik Geçmiş',
    historyBack: 'Geri',
    historyRemaining: 'kalan',
    selectAll: 'Tümünü Seç',
    exportButton: 'Paylaş / Dışa Aktar',
    quickNotesTitle: 'Hızlı Notlar',
    quickNotesToggle: '▼',
    quickNotesAdd: 'Kaydet',
    quickNotesPlaceholder: 'Not yaz',
    historyNotePlaceholder: 'Bu hesaplamayı etiketle',
    historyLabel: 'Geçmiş',
    noteLabel: 'Not',
    noteInputPlaceholder: '+ Yeni not',
    noteSaved: 'Not kaydedildi',
    noteEdit: 'Düzenle',
    noteShare: 'Paylaş',
    emptyHistory: 'Henüz geçmiş yok',
    copied: 'Sonuç kopyalandı',
    pasted: 'Sayı yapıştırıldı',
    installed: 'Uygulama yüklenmeye hazır',
    noSelection: 'Paylaşmak için bir öğe seçin',
    shareTitle: 'EQ Hesap Makinesi Geçmişi',
    shareMessage: 'EQ Hesap Makinesi\'nden dışa aktarıldı',
    themeDark: 'Koyu',
    themeLight: 'Açık',
    themeViolet: 'Mor',
    languageEnglish: 'English',
    languageSpanish: 'Español',
    languageArabic: 'العربية',
    languageFrench: 'Français',
    languageRussian: 'Русский',
    languageGerman: 'Deutsch',
    languageTurkish: 'Türkçe',
    drawerTop: 'Üst',
    drawerSide: 'Yan',
    expand: 'Genişlet',
    Minimize: 'Küçült',
    installModalSubtitle: 'Ana ekranınıza ekleyin',
    installModalClose: 'Anladım',
    settingsSubtitle: 'Dil, tema ve geri bildirimi özelleştirin.',
    appSoundsLabel: 'Uygulama Sesleri',
    soundHapticsLabel: 'Ses ve dokunsal geri bildirim',
    soundHapticsCaption: 'Tıklama seslerini ve titreşimi etkinleştir',
    soundProfileLabel: 'Tuş Ses Profili',
    profileClassic: 'Klasik',
    profileSoft: 'Yumuşak',
    profileModern: 'Modern',
    profileClick: 'Tık',
    profileSilent: 'Sessiz',
    speakerLabel: 'Hoparlör / Sesli Okuma',
    speakerCaption: 'AÇIK olduğunda sonuç = tuşuna bastıktan sonra otomatik olarak sesli okunur. KAPALI olduğunda okuma yalnızca hoparlör düğmesinden manuel yapılır.',
    modeGeneral: 'Genel Hesap Makinesi',
    scientificToggle: 'Bilimsel',
    percentResultLabel: 'Sonuç',
    currencyConverterTitle: 'Doğrudan Döviz Çevirici',
    currencyConverterSubtitle: 'Tutarları canlı kurlarla anında çevirin.',
    swapButton: 'Değiştir',
    favoritesButton: 'Favoriler',
    recentButton: 'Son',
    fromLabel: 'Kimden',
    toLabel: 'Kime',
    convertedLabel: 'Dönüştürüldü',
    bankRateMode: '🏦 Banka Kuru',
    marketRateMode: '🏪 Piyasa Kuru',
    marketRateFieldLabel: 'Piyasa Döviz Kuru',
    cachedLabel: 'Önbellekte',
    refreshButton: 'Yenile',
    globalDirectoryButton: 'Küresel dizin',
    currencyDirectoryTitle: 'Küresel Döviz Rehberi',
    currencyDirectorySubtitle: 'Ülke adına veya para birimi koduna göre kağıt para arayın.',
    currencySearchPlaceholder: 'Ülke veya kod ara',
    drawerEyebrow: '',
    drawerTitle: 'EQ',
    drawerHistory: 'Geçmiş',
    drawerNotes: 'Notlar',
    drawerConverter: 'Doğrudan Döviz Çevirici',
    drawerDirectory: 'Küresel Döviz Rehberi ve Arama',
    drawerInstall: 'Uygulamayı Yükle',
    drawerSettings: 'Ayarlar',
    installModalTitle: 'iPhone\'a Yükle',
    installModalStep1: 'Adım 1: Tarayıcının altındaki veya üstündeki Paylaş düğmesine dokunun (⎘ / ⇡).',
    installModalStep2: 'Adım 2: Menüden "Ana Ekrana Ekle"yi seçin.',
    currencyOptionSearch: 'Para birimi ara',
    currencyOptionPrices: 'Canlı kur fiyatları',
    currencyOptionConvert: 'Para birimi çevir',
    currencyOptionFavorites: 'Favori para birimleri',
    currencyFavoritesTitle: 'Favoriler',
    currencyFavoritesEmpty: 'Henüz favori para birimi yok',
    currencyFavoritesEmptyHint: 'Herhangi bir para birimindeki yıldıza dokunarak buraya ekleyin',
    currencyOptionCustomRate: 'Özel kur ile çevir',
    customRateTitle: 'Özel kur ile çevir',
    customRateFieldLabel: 'Döviz kuru',
    currencyRatesTitle: 'Döviz kurları',
    currencyRatesSearchPlaceholder: 'Para birimi veya kod ara',
    currencyRatesEmpty: 'Para birimi bulunamadı',
    currencyRatesLoading: 'Kurlar yükleniyor…',
    currencyRatesError: 'Kurlar kullanılamıyor',
    recentlyDeletedTitle: 'Son Silinenler',
    emptyNotesText: 'Henüz not yok',
    emptyNotesAction: '+ Yeni not',
    emptyDeletedText: 'Silinen not yok',
    deleteConfirmTitle: 'Kalıcı olarak silinsin mi?',
    deleteConfirmText: 'Bu işlem geri alınamaz.',
    cancelBtn: 'İptal',
    deletePermanentBtn: 'Sil',
    doneBtn: 'Bitti',
    deleteNoteBtn: 'Notu sil',
    restoreBtn: 'Geri yükle',
    helpTitle: 'Yardım ve Hakkında',
    helpSubtitle: 'EQ’yu nasıl kullanacağınızı öğrenin ve özelliklerini keşfedin.',
    helpAboutTitle: 'Uygulama Hakkında',
    helpAboutDesc: 'EQ, günlük matematiği, bilimsel ve yüzde araçlarını, döviz çevirmeyi ve çok daha fazlasını tek bir basit, kullanımı kolay uygulamada birleştiren akıllı, çok yönlü bir hesap makinesidir.',
    helpWhyTitle: 'EQ neden oluşturuldu?',
    helpWhyDesc: 'Fikir basit: birçok hesap makinesi yerine tek bir hesap makinesi; hız, netlik ve günlük kullanım için tasarlanmıştır.',
    helpWhyL1: 'Hızlı günlük hesaplamalar',
    helpWhyL2: 'Karekök, üsler ve parantezler gibi bilimsel araçlar',
    helpWhyL3: 'Kolay yüzde hesaplamaları',
    helpWhyL4: 'Döviz çevirme ve canlı kurlar',
    helpWhyL5: 'Notlar ve hesap geçmişi',
    helpWhyL6: 'Basit, anlaşılır ve hızlı kullanım',
    helpWhyL7: 'Farklı cihazlarda kurulabilir bir uygulama (PWA) olarak çalışır',
    helpSectionsTitle: 'Uygulama Bölümlerinin Açıklaması',
    helpSecGeneralTitle: 'Genel Hesap Makinesi',
    helpSecGeneralDesc: 'Günlük işlemler için ana hesap makinesi: toplama, çıkarma, çarpma ve bölme.',
    helpSecGeneralEx: 'Örnek: 12 + 7 = 19.',
    helpSecScientificTitle: 'Bilimsel Araçlar',
    helpSecScientificDesc: 'Aynı hesap makinesinde karekök, kare ve parantez düğmelerini kullanmak için “Scientific”e dokunun.',
    helpSecScientificEx: 'Örnek: √9 = 3, 2^3 = 8.',
    helpSecPercentTitle: 'Yüzde Hesaplayıcı',
    helpSecPercentDesc: 'Ekstra adım olmadan bir tutarın yüzdesini hızlıca hesaplayın.',
    helpSecPercentEx: 'Örnek: 200’ün %15’i = 30.',
    helpSecHistoryTitle: 'Geçmiş',
    helpSecHistoryDesc: 'EQ, son 24 saatte hesapladıklarınızı hatırlar, böylece inceleyebilir veya paylaşabilirsiniz.',
    helpSecNotesTitle: 'Notlar',
    helpSecNotesDesc: 'Hızlı notlar kaydedin, bunları klasörlerde düzenleyin ve tam ekran düzenleyicide yönetin.',
    helpSecCurrencyTitle: 'Döviz Araçları',
    helpSecCurrencyDesc: 'Para birimleri arayın, canlı kurları görün, çevirin, özel kur kullanın ve favorilerinizi saklayın.',
    helpSecSettingsTitle: 'Ayarlar',
    helpSecSettingsDesc: 'Dili, temayı ve ses geri bildirimini dilediğiniz gibi değiştirin.',
    helpButtonsTitle: 'Hesap Makinesi Nasıl Kullanılır',
    helpBtnNumbers: 'Rakam yazmak için dokunun.',
    helpBtnAdd: 'Sonraki sayıyı ekler.',
    helpBtnSub: 'Sonraki sayıyı çıkarır.',
    helpBtnMul: 'Sonraki sayıyla çarpar.',
    helpBtnDiv: 'Sonraki sayıya böler.',
    helpBtnEquals: 'Sonucu gösterir.',
    helpBtnAc: 'Her şeyi temizler ve sıfırdan başlar.',
    helpBtnBack: 'Yazdığınız son rakamı siler.',
    helpBtnDecimal: 'Ondalık ayracı ekler.',
    helpBtnScientific: 'Scientific / Percentage: ekstra araçları açar veya kapatır.',
    helpBtnSpeak: 'Geçerli sonucu sesli olarak okur.',
    helpSettingsExplainTitle: 'Ayarlar',
    helpSetLanguage: 'Dil: tüm uygulamayı mevcut diller arasında değiştirir.',
    helpSetTheme: 'Tema: Koyu, Açık veya Mor görünümü seçin.',
    helpSetSoundsTitle: 'Uygulama Sesleri: ses ve dokunsal geri bildirimin ana anahtarı.',
    helpSetSoundsDesc: 'Uygulama Sesleri açıkken düğme sesi ve titreşim etkindir. Bunu kapatmak kapatır, tekrar açmak izin verir.',
    helpSetSoundsSpeech: 'Konuşma/TTS, Uygulama Seslerinden ayrıdır ve Uygulama Sesleri tarafından kapatılmaz.',
    helpCurrencyTitle: 'Döviz Çevirici',
    helpCurrencyDesc: 'Sahip olduğunuz para birimini (Gönderen) ve istediğinizi (Alan) seçin, ardından bir tutar girin.',
    helpCurrencySwap: 'İki para birimini ters çevirmek için değiştirme düğmesini kullanın.',
    helpCurrencyFavorites: 'Bir para birimini favori olarak işaretlemek için yıldızı kullanın ve döviz menüsünden Favorileri açın.',
    helpCurrencyCustomRate: 'Özel kur ile çevirme, kendi döviz kurunuzu girmenizi sağlar.',
    helpCurrencyLive: 'Canlı fiyatlar çevrimiçi hizmetten gelir; hizmet yoksa önbelleğe alınmış kurlar kullanılabilir.',
    helpInstallTitle: 'Yükleme ve Çevrimdışı',
    helpInstallDesc1: 'EQ’yu desteklenen cihazlara bir uygulama olarak kurabilirsiniz.',
    helpInstallDesc2: 'Bazı özellikler depolanan kaynaklarla çevrimdışı çalışır, ancak canlı kurlar ve uygulama güncellemeleri internet bağlantısı gerektirir.',
    helpBenefitsTitle: 'Neden EQ?',
    helpBenefit1: 'Hepsi bir arada hesap makinesi',
    helpBenefit2: 'Hızlı günlük hesaplamalar',
    helpBenefit3: 'Bilimsel ve yüzde araçları',
    helpBenefit4: 'Döviz çevirme',
    helpBenefit5: 'Geçmiş ve notlar',
    helpBenefit6: 'Çok dilli arayüz',
    helpBenefit7: 'Duyarlı tasarım ve PWA desteği',
    helpLangTitle: 'Diller',
    helpLangDesc: 'EQ tamamen çevrilmiştir. Dilinizi üst çubukta veya Ayarlar’da seçin; bu yardım sayfası dahil tüm uygulama anında güncellenir.'
  }
};

// ============================================================
// STATE
// ============================================================
const state = {
  locale: 'en',
  theme: 'dark',
  currentExpression: '',
  waitingForOperand: false,
  lastInputWasEquals: false,
  currentOperator: null,
  previousOperand: null,
  history: [],
  notes: [],
  quickNotes: [],
  folders: [],
  activeFolder: null,
  noteData: { notes: [], folders: [], activeFolder: null },
  percentPanelOpen: false,
  scientificPanelOpen: false,
  soundEnabled: true,
  appSoundEnabled: true,
  soundProfile: 'classic',
  speakerEnabled: true,
  hasPressedEquals: false,
  displayValue: '0',
  expression: '',
  pendingOperator: null,
  storedValue: null,
  startNewNumber: true,
  historyCountdownTimer: null,
  noteSaveTimer: null,
  currentOpenNote: null,
  currentNotesView: 'notes', // 'notes' | 'deleted'
  pendingDeleteNoteId: null,
  isRTL: false,
  rates: null,
  ratesLastUpdated: null,
  ratesStatus: 'loading',
  converterMode: 'bank',
  marketRate: null,
  currencyFrom: null,
  currencyTo: null,
  currentQuickNotesTab: 'all'
};

// Legacy aliases
const history = {
  entries: []
};

const quickNotes = [];

// Legacy persist/load aliases for storage
const NOTE_STORAGE_KEY = 'eq-notes';
const QUICK_NOTES_KEY = 'eq-quick-notes';
const FOLDERS_KEY = 'eq-note-folders';
const NOTES_MANAGER_KEY = 'eq-note-manager-notes';
const LANGUAGE_KEY = 'eq-language';
const HISTORY_KEY = 'eq-history';
const APP_SOUND_KEY = 'eq-app-sound';
const SOUND_MODE_KEY = 'eq-sound-mode';
const SOUND_PROFILE_KEY = 'eq-sound-profile';
const SPEAKER_KEY = 'eq-speaker';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function showToast(message, duration = 1600) {
  if (typeof document === 'undefined') return;
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

function showClipboardToast(message) {
  showToast(message, 2000);
}

function triggerButtonFeedback() {
  // App Sounds master switch must be ON and the individual sound mode must be
  // enabled for button feedback (click sound + haptics) to fire. Speech/TTS is
  // completely unaffected by this switch.
  if (!state.appSoundEnabled || !state.soundEnabled) return;
  playButtonSound(state.soundProfile);
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  } catch (e) { /* ignore */ }
}

// ============================================================
// APP SOUND PROFILES (Button click sounds)
// Small, dependency-free Web Audio blips. Each profile just tweaks
// the waveform, pitch, length and number of steps. 'silent' plays nothing.
// ============================================================
const SOUND_PROFILES = {
  classic: { type: 'square', freq: 620, duration: 0.07, gain: 0.04, steps: 1 },
  soft: { type: 'sine', freq: 430, duration: 0.12, gain: 0.03, steps: 1 },
  modern: { type: 'sine', freq: 740, duration: 0.05, gain: 0.035, steps: 2, stepFreq: 80 },
  click: { type: 'square', freq: 1300, duration: 0.03, gain: 0.02, steps: 1 },
  silent: null
};

let buttonAudioContext = null;

function getButtonAudioContext() {
  try {
    if (typeof window === 'undefined') return null;
    if (!buttonAudioContext) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      buttonAudioContext = new AC();
    }
    if (buttonAudioContext.state === 'suspended') {
      buttonAudioContext.resume().catch(() => {});
    }
    return buttonAudioContext;
  } catch (e) { return null; }
}

function playButtonSound(profile) {
  const cfg = SOUND_PROFILES[profile] || SOUND_PROFILES.classic;
  if (!cfg) return; // silent profile
  const ctx = getButtonAudioContext();
  if (!ctx) return;
  try {
    const steps = cfg.steps || 1;
    const stepGap = 0.05;
    for (let i = 0; i < steps; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = cfg.type;
      osc.frequency.value = cfg.freq + (i * (cfg.stepFreq || 0));
      const now = ctx.currentTime + (i * stepGap);
      gain.gain.setValueAtTime(cfg.gain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + cfg.duration + 0.02);
    }
  } catch (e) { /* ignore */ }
}

// ============================================================
// APP SOUND + SPEAKER PREFERENCES (persistence)
// ============================================================
function loadSoundPreferences() {
  try {
    const appSound = localStorage.getItem(APP_SOUND_KEY);
    if (appSound !== null) state.appSoundEnabled = appSound === 'true';
    const soundMode = localStorage.getItem(SOUND_MODE_KEY);
    if (soundMode !== null) state.soundEnabled = soundMode === 'true';
    const profile = localStorage.getItem(SOUND_PROFILE_KEY);
    if (profile && Object.prototype.hasOwnProperty.call(SOUND_PROFILES, profile)) {
      state.soundProfile = profile;
    }
    const speaker = localStorage.getItem(SPEAKER_KEY);
    if (speaker !== null) state.speakerEnabled = speaker === 'true';
  } catch (e) { /* ignore */ }
}

function saveSoundPreferences() {
  try {
    localStorage.setItem(APP_SOUND_KEY, String(state.appSoundEnabled));
    localStorage.setItem(SOUND_MODE_KEY, String(state.soundEnabled));
    localStorage.setItem(SOUND_PROFILE_KEY, state.soundProfile);
  } catch (e) { /* ignore */ }
}

function saveSpeakerPreference() {
  try {
    localStorage.setItem(SPEAKER_KEY, String(state.speakerEnabled));
  } catch (e) { /* ignore */ }
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '0';
  let num;
  try {
    if (typeof value === 'object' && value !== null && typeof value.toString === 'function') {
      num = new Decimal(value.toString());
    } else {
      num = new Decimal(String(value));
    }
  } catch (e) {
    // Non-numeric value (e.g. a scientific expression string like "sqrt(3)" or "3^2"):
    // render it as-is instead of crashing the display pipeline.
    return String(value);
  }
  const str = num.toString();
  // Expand scientific notation for display
  let expanded;
  try {
    expanded = num.toFixed && !str.includes('e') && !str.includes('E') ? str : String(num);
  } catch (e) {
    expanded = str;
  }
  // Add thousands separators to integer part
  const [whole, fraction] = expanded.split('.');
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction !== undefined ? `${formattedWhole}.${fraction}` : formattedWhole;
}

function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  } catch (e) {
    return String(value);
  }
}

function formatRemainingTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function isIOSDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (typeof navigator.platform === 'string' && /Mac/.test(navigator.platform) && navigator.maxTouchPoints > 1);
}

function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function getLocaleFromStorage() {
  try {
    return localStorage.getItem(LANGUAGE_KEY) || 'en';
  } catch (e) {
    return 'en';
  }
}

// ============================================================
// CALCULATOR LOGIC
// ============================================================
// The authoritative standard-calculator input/calculation logic now lives in
// StandardCalculator (src/modes/StandardCalculator.js). The functions below
// are thin compatibility wrappers so the existing UI/event wiring and the
// keyboard path continue to work unchanged while delegating to the mode.
let standardCalculator = null; // Populated in initialize().

function updatePrimaryDisplay() {
  if (primaryDisplay) {
    primaryDisplay.textContent = formatNumber(state.displayValue);
  }
}

function updateSecondaryDisplay() {
  if (secondaryDisplay) {
    if (state.displayValue !== '' && !isNaN(Number(state.displayValue))) {
      secondaryDisplay.textContent = numberToWords(state.displayValue, state.locale);
    } else {
      secondaryDisplay.textContent = 'Zero';
    }
  }
}

function updateExpressionDisplay() {
  if (expressionDisplay) {
    expressionDisplay.textContent = state.expression || '';
  }
}

function syncExpressionDisplay() {
  const built = buildExpressionString();
  if (expressionDisplay) {
    expressionDisplay.textContent = built;
  }
  state.expression = built;
}

function buildExpressionString() {
  if (standardCalculator) return standardCalculator.buildExpressionString();
  return '';
}

function displayOperator(op) {
  const symbolMap = { '*': '×', '/': '÷', '+': '+', '-': '−' };
  return symbolMap[op] || op;
}

function appendDigit(digit) {
  if (standardCalculator) {
    standardCalculator.appendDigit(digit);
  }
}

function applyOperator(op) {
  if (standardCalculator) {
    standardCalculator.applyOperator(op);
  }
}

function handlePercent() {
  if (standardCalculator) {
    standardCalculator.handlePercent();
  }
}

function handleEquals() {
  if (standardCalculator) {
    standardCalculator.handleEquals();
  }
}

function clearAll() {
  if (standardCalculator) {
    standardCalculator.clearAll();
  }
}

function backspace() {
  if (standardCalculator) {
    standardCalculator.backspace();
  }
}

function appendScientificValue(value) {
  triggerButtonFeedback();
  if (value === 'sqrt(') {
    if (state.displayValue !== '0' && !state.startNewNumber) {
      state.displayValue = state.displayValue + '*';
      state.startNewNumber = true;
    }
    state.displayValue = 'sqrt(' + state.displayValue + ')';
    state.startNewNumber = true;
  } else if (value === '^2') {
    state.displayValue = state.displayValue + '^2';
  } else if (value === '(') {
    state.displayValue = state.displayValue + '(';
    state.startNewNumber = true;
  } else if (value === ')') {
    state.displayValue = state.displayValue + ')';
  }
  updatePrimaryDisplay();
  syncExpressionDisplay();
}

// ============================================================
// CLIPBOARD
// ============================================================
async function copyResult() {
  triggerButtonFeedback();
  const text = state.displayValue;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      showClipboardToast(translations[state.locale].copied || 'Result copied');
    } else {
      throw new Error('Clipboard API not available');
    }
  } catch (e) {
    // Fallback: temporary textarea + execCommand
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    let success = false;
    try {
      success = document.execCommand('copy');
    } catch (e2) {
      success = false;
    }
    document.body.removeChild(textarea);
    if (success) {
      showClipboardToast(translations[state.locale].copied || 'Result copied');
    } else {
      showToast('Copy failed');
    }
  }
}

async function pasteNumber(userInitiated = false) {
  triggerButtonFeedback();
  try {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      throw new Error('Clipboard API not available');
    }
    const text = await navigator.clipboard.readText();
    // Accept only valid numeric values: digits, decimal point, optional minus sign
    const cleaned = text.replace(/[^\d.-]/g, '');
    if (cleaned && !isNaN(Number(cleaned))) {
      state.displayValue = cleaned;
      state.startNewNumber = false;
      state.hasPressedEquals = false;
      updatePrimaryDisplay();
      updateSecondaryDisplay();
      syncExpressionDisplay();
      showClipboardToast(translations[state.locale].pasted || 'Number pasted');
    } else if (userInitiated) {
      showToast('Paste failed');
    }
  } catch (e) {
    if (userInitiated) {
      showToast('Paste failed');
    }
  }
}

// ============================================================
// SPEECH
// ============================================================
// Tracks whether the main calculator is currently reading aloud so that the
// same speaker button acts as a toggle: first press starts, second press stops
// immediately, and a later press reads again from the start.
let speechActive = false;

function stopCurrentSpeech() {
  try {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } catch (e) {
    // no-op
  }
  speechActive = false;
}

function speakCurrentResult() {
  try {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    // Toggle: if currently reading, stop immediately.
    if (speechActive) {
      stopCurrentSpeech();
      return;
    }
    // Arabic speech: speak the number as words so the TTS does not read the
    // decimal separator as "نقطة". The on-screen display stays unchanged.
    const text = state.locale === 'ar' && !Number.isNaN(Number(state.displayValue))
      ? numberToWords(state.displayValue, 'ar')
      : `${state.displayValue}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.locale === 'ar' ? 'ar-SA' : state.locale === 'es' ? 'es-ES' : state.locale === 'fr' ? 'fr-FR' : state.locale === 'ru' ? 'ru-RU' : state.locale === 'de' ? 'de-DE' : state.locale === 'tr' ? 'tr-TR' : 'en-US';
    utterance.onstart = () => { speechActive = true; };
    utterance.onend = () => { speechActive = false; };
    utterance.onerror = () => { speechActive = false; };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    // Speech synthesis not available
  }
}

// ============================================================
// LANGUAGE / I18N
// ============================================================
function setLanguage(locale) {
  state.locale = locale;
  try {
    localStorage.setItem(LANGUAGE_KEY, locale);
  } catch (e) { /* ignore */ }
  const html = document.documentElement;
  html.lang = locale;
  html.dir = locale === 'ar' ? 'rtl' : 'ltr';
  document.body.setAttribute('data-language', locale);
  state.isRTL = locale === 'ar';
  updateTexts();
  if (languageSelect) languageSelect.value = locale;
  if (topBarLanguageSelect) topBarLanguageSelect.value = locale;
  renderHistory();
  renderFolders();
  renderNotes();
  if (percentPanel && !percentPanel.classList.contains('percent-open')) {
    updatePercentPanel();
  }
  updateInstallModalContent();
  // Re-render the currency rates screen so localized currency names update live
  if (currencyRatesModal && currencyRatesModal.classList.contains('show')) {
    renderCurrencyRates();
  }
  // Re-render the favorites screen so localized names/text update live
  if (currencyFavoritesModal && currencyFavoritesModal.classList.contains('show')) {
    renderCurrencyFavorites();
  }
}

function updateTexts() {
  if (typeof document === 'undefined') return;
  const locale = state.locale;
  const t = translations[locale] || translations.en;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = t[key];
    if (value !== undefined && value !== null) {
      el.textContent = value;
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    const value = t[key];
    if (value !== undefined && value !== null) {
      el.setAttribute('placeholder', value);
    }
  });
}

function updateInstallModalContent() {
  const t = translations[state.locale] || translations.en;
  if (iosInstallTitle) iosInstallTitle.textContent = t.installModalTitle || '';
  if (iosInstallSubtitle) iosInstallSubtitle.textContent = t.installModalSubtitle || '';
  if (iosInstallStep1) iosInstallStep1.textContent = t.installModalStep1 || '';
  if (iosInstallStep2) iosInstallStep2.textContent = t.installModalStep2 || '';
}

// ============================================================
// THEME
// ============================================================
function setTheme(theme) {
  state.theme = theme;
  document.body.setAttribute('data-theme', theme);
  const colorScheme = theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : 'dark';
  document.body.style.colorScheme = colorScheme;
  themeButtons.forEach((btn) => {
    const btnTheme = btn.getAttribute('data-theme');
    btn.classList.toggle('active', btnTheme === theme);
  });
}

// ============================================================
// SCIENTIFIC PANEL
// ============================================================
function setScientificPanelOpen(open) {
  state.scientificPanelOpen = open;
  if (scientificPanel) {
    scientificPanel.classList.toggle('open', open);
  }
  if (scientificToggle) {
    scientificToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
}

function toggleScientificPanel() {
  triggerButtonFeedback();
  setScientificPanelOpen(!state.scientificPanelOpen);
}

// ============================================================
// PERCENTAGE PANEL
// ============================================================
function updatePercentPanel() {
  const amount = percentAmount ? parseFloat(percentAmount.value) : NaN;
  const rate = percentRate ? parseFloat(percentRate.value) : NaN;
  if (isNaN(amount) || isNaN(rate)) {
    if (sharedServices.display) {
      sharedServices.display.updatePrimary('0');
      sharedServices.display.updateSecondary('Zero', state.locale);
    }
    return;
  }
  const result = (amount * rate) / 100;
  state.displayValue = String(result);
  if (sharedServices.display) {
    sharedServices.display.updatePrimary(result);
    sharedServices.display.updateSecondary(result, state.locale);
  }
}

function calculatePercent() {
  updatePercentPanel();
}

function setPercentPanelOpen(open) {
  state.percentPanelOpen = open;
  if (percentPanel) {
    percentPanel.classList.toggle('percent-open', open);
    percentPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  if (percentToggle) {
    percentToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (keypadGrid) {
    keypadGrid.classList.toggle('percent-open', open);
  }
  if (open) {
    updatePercentPanel();
  } else {
    if (percentAmount) percentAmount.value = '';
    if (percentRate) percentRate.value = '';
    if (standardCalculator) {
      standardCalculator.refreshDisplay();
    }
  }
}

function togglePercentPanel() {
  triggerButtonFeedback();
  setPercentPanelOpen(!state.percentPanelOpen);
}

// ============================================================
// MODES
// ============================================================
function setActiveMode(mode) {
  modeSwitchButtons.forEach((btn) => {
    const isActive = btn.getAttribute('data-mode') === mode;
    btn.classList.toggle('active', isActive);
  });
  if (generalCalculatorPanel) {
    generalCalculatorPanel.classList.toggle('active', mode === 'general');
  }
}

// ============================================================
// HISTORY SYSTEM
// ============================================================
const HISTORY_LIMIT = 1000;
const HISTORY_TTL = 24 * 60 * 60 * 1000; // 24 hours

function cleanupExpiredHistory() {
  const now = Date.now();
  const before = state.history.length;
  state.history = state.history.filter(entry => (now - (entry.timestamp || now)) < HISTORY_TTL);
  if (state.history.length !== before) {
    saveHistory();
  }
}

function migrateHistoryEntry(entry) {
  const ts = entry.timestamp || entry.date || Date.now();
  const d = new Date(ts);
  if (!entry.date) {
    entry.date = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
  }
  if (!entry.time) {
    entry.time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  if (!entry.id) {
    entry.id = 'h-' + ts.toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }
  if (!entry.note) entry.note = '';
  if (!entry.timestamp) entry.timestamp = ts;
  return entry;
}

function loadHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      state.history = parsed
        .filter(entry => entry && (now - (entry.timestamp || now)) < HISTORY_TTL)
        .map(migrateHistoryEntry)
        .slice(0, HISTORY_LIMIT);
    } else {
      state.history = [];
    }
  } catch (e) {
    state.history = [];
  }
  history.entries = state.history;
}

function saveHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history.slice(0, HISTORY_LIMIT)));
  } catch (e) { /* ignore */ }
}

function addHistory(expression, result) {
  const now = Date.now();
  // Duplicate prevention: skip if an identical expression+result was added within the last 2 seconds
  const duplicate = state.history.some(entry =>
    entry.expression === expression &&
    entry.result === result &&
    (now - (entry.timestamp || 0)) < 2000
  );
  if (duplicate) {
    return;
  }

  const d = new Date(now);
  const entry = {
    id: 'h-' + now.toString(36) + '-' + Math.random().toString(36).slice(2, 7),
    expression,
    result,
    timestamp: now,
    date: d.toLocaleDateString('en-CA'), // YYYY-MM-DD
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    note: ''
  };

  cleanupExpiredHistory();
  state.history.unshift(entry);
  if (state.history.length > HISTORY_LIMIT) {
    state.history = state.history.slice(0, HISTORY_LIMIT);
  }
  history.entries = state.history;
  saveHistory();
  renderHistory();
}

const historyDateFormatter = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
const historyTimeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

function formatEntryDate(ts, locale) {
  try {
    return new Intl.DateTimeFormat(locale || 'en', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(ts);
  } catch (e) {
    return historyDateFormatter.format(ts);
  }
}

function formatEntryTime(ts, locale) {
  try {
    return new Intl.DateTimeFormat(locale || 'en', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(ts);
  } catch (e) {
    return historyTimeFormatter.format(ts);
  }
}

function renderHistory() {
  if (!historyList) return;
  const t = translations[state.locale] || translations.en;
  if (!state.history.length) {
    historyList.innerHTML = `<li class="empty-history">${t.emptyHistory || 'No history yet'}</li>`;
    return;
  }
  const now = Date.now();
  const remainingPrefix = t.historyRemaining || 'remaining';
  historyList.innerHTML = state.history.map((entry) => {
    const ts = entry.timestamp || Date.now();
    const remaining = Math.max(0, HISTORY_TTL - (now - ts));
    const remainingLabel = `${formatRemainingTime(remaining)} ${remainingPrefix}`;
    const dateStr = entry.date || formatEntryDate(ts, state.locale);
    const timeStr = entry.time || formatEntryTime(ts, state.locale);
    return `
      <li class="history-entry" data-id="${entry.id}">
        <div class="history-entry-header">
          <label class="history-check">
            <input type="checkbox" class="history-select" />
            <span class="history-id-badge">#${escapeHtml(entry.id.slice(0, 4))}</span>
          </label>
        </div>
        <div class="history-expression">${escapeHtml(entry.expression)}</div>
        <div class="history-result">= ${escapeHtml(entry.result)}</div>
        <div class="history-datetime">
          <span class="history-date">📅 ${escapeHtml(dateStr)}</span>
          <span class="history-time">🕒 ${escapeHtml(timeStr)}</span>
        </div>
        <div class="history-remaining-row">
          <span class="history-remaining" data-ts="${ts}">${remainingLabel}</span>
        </div>
        <div class="history-note-row">
          <input class="history-note-input" type="text" placeholder="${t.historyNotePlaceholder || 'Tag this calculation'}"
            value="${escapeHtml(entry.note || '')}" data-id="${entry.id}" />
          <button class="history-edit-note-btn" data-id="${entry.id}" title="${t.noteEdit || 'Edit Note'}">
            ✏️
          </button>
          <button class="history-share-btn" data-id="${entry.id}" title="${t.noteShare || 'Share'}">
            <i class="fa-solid fa-share-nodes"></i>
          </button>
        </div>
      </li>
    `;
  }).join('');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

function openHistory() {
  cleanupExpiredHistory();
  if (historyPanel) {
    historyPanel.classList.add('open');
    historyPanel.setAttribute('aria-hidden', 'false');
  }
  renderHistory();
  startHistoryCountdown();
  updateHistoryCountdown();
}

function closeHistory() {
  if (historyPanel) {
    historyPanel.classList.remove('open');
    historyPanel.setAttribute('aria-hidden', 'true');
  }
  stopHistoryCountdown();
}

function selectAllHistory() {
  const checkboxes = document.querySelectorAll('.history-select');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  checkboxes.forEach(cb => cb.checked = !allChecked);
}

async function exportHistory() {
  triggerButtonFeedback();
  const t = translations[state.locale] || translations.en;
  const checkedEntries = Array.from(document.querySelectorAll('.history-select:checked')).map(cb =>
    state.history.find(h => h.id === cb.closest('.history-entry')?.getAttribute('data-id'))
  ).filter(Boolean);

  const entriesToExport = checkedEntries.length ? checkedEntries : state.history;
  if (!entriesToExport.length) {
    showToast(t.noSelection || 'Select an item to share');
    return;
  }
  const data = JSON.stringify({ exportedAt: new Date().toISOString(), entries: entriesToExport }, null, 2);
  const filename = `eq-history-${Date.now()}.json`;

  if (navigator.share && navigator.canShare) {
    try {
      const file = new File([data], filename, { type: 'application/json' });
      await navigator.share({
        files: [file],
        title: t.shareTitle || 'EQ Calculator History',
        text: t.shareMessage || 'Exported from EQ Calculator'
      });
      return;
    } catch (e) {
      // Fall through to download
    }
  }

  // Download fallback
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function updateEntryNote(id, note) {
  const entry = state.history.find(h => h.id === id);
  if (entry) {
    entry.note = note;
    saveHistory();
  }
}

async function shareEntry(id) {
  const t = translations[state.locale] || translations.en;
  const entry = state.history.find(h => h.id === id);
  if (!entry) return;
  const text = `${entry.expression} = ${entry.result}${entry.note ? ` (${entry.note})` : ''}`;
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch (e) { /* cancelled */ }
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied');
  } catch (e) {
    showToast('Copy failed');
  }
}

function startHistoryCountdown() {
  stopHistoryCountdown();
  state.historyCountdownTimer = setInterval(updateHistoryCountdown, 1000);
}

function stopHistoryCountdown() {
  if (state.historyCountdownTimer) {
    clearInterval(state.historyCountdownTimer);
    state.historyCountdownTimer = null;
  }
}

function updateHistoryCountdown() {
  const now = Date.now();
  const t = translations[state.locale] || translations.en;
  const remainingLabel = t.historyRemaining || 'remaining';
  cleanupExpiredHistory();
  if (!state.history.length) {
    if (historyList) renderHistory();
    stopHistoryCountdown();
    return;
  }
  // Performance: use cached data-ts timestamps, no per-element lookup
  document.querySelectorAll('.history-entry').forEach((el) => {
    const remainingEl = el.querySelector('.history-remaining');
    if (!remainingEl) return;
    const ts = Number(remainingEl.getAttribute('data-ts')) || 0;
    if (!ts) {
      el.remove();
      return;
    }
    const remaining = HISTORY_TTL - (now - ts);
    if (remaining <= 0) {
      el.remove();
      return;
    }
    remainingEl.textContent = `${formatRemainingTime(remaining)} ${remainingLabel}`;
  });
}

// ============================================================
// NOTES SYSTEM
// ============================================================
function loadNoteData() {
  try {
    const foldersRaw = localStorage.getItem(FOLDERS_KEY);
    const notesRaw = localStorage.getItem(NOTES_MANAGER_KEY);
    state.folders = foldersRaw ? JSON.parse(foldersRaw) : [];
    state.noteData.notes = notesRaw ? JSON.parse(notesRaw) : [];
    state.noteData.folders = state.folders;
    state.noteData.activeFolder = state.activeFolder;
    if (!state.folders.length) {
      const defaultFolder = { id: 'personal', name: 'Personal', createdAt: Date.now() };
      state.folders = [defaultFolder];
      saveFolders();
    }
  } catch (e) {
    state.folders = [];
    state.noteData.notes = [];
  }
}

function saveFolders() {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(state.folders));
  } catch (e) { /* ignore */ }
}

function saveNotesData() {
  try {
    localStorage.setItem(NOTES_MANAGER_KEY, JSON.stringify(state.noteData.notes));
  } catch (e) { /* ignore */ }
}

function persistNoteData() {
  saveFolders();
  saveNotesData();
}

function getActiveFolder() {
  return state.activeFolder || (state.folders.length ? state.folders[0].id : 'personal');
}

function setActiveFolder(folderId) {
  state.activeFolder = folderId;
  state.noteData.activeFolder = folderId;
  renderNotes();
}

function getNotesForActiveFolder() {
  const folderId = getActiveFolder();
  return state.noteData.notes.filter(n => n.folderId === folderId);
}

function getFolderOptions() {
  return state.folders.map(f => `<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('');
}

function renderFolders() {
  renderFolderTabs();
}

function openNotesManager() {
  if (notesManagerModal) {
    notesManagerModal.classList.add('show');
    notesManagerModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  loadNoteData();
  switchNotesView('notes');
  renderFolderTabs();
  renderNotes();
}

function closeNotesManager() {
  if (notesManagerModal) {
    notesManagerModal.classList.remove('show');
    notesManagerModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
}

function addFolder() {
  const name = prompt('Folder name:');
  if (!name || !name.trim()) return;
  const folder = {
    id: 'folder-' + Date.now().toString(36),
    name: name.trim(),
    createdAt: Date.now()
  };
  state.folders.push(folder);
  saveFolders();
  renderFolders();
}

function createFolder(name) {
  const folder = {
    id: 'folder-' + Date.now().toString(36),
    name,
    createdAt: Date.now()
  };
  state.folders.push(folder);
  saveFolders();
  return folder;
}

function deleteFolder(folderId) {
  state.folders = state.folders.filter(f => f.id !== folderId);
  state.noteData.notes = state.noteData.notes.filter(n => n.folderId !== folderId);
  if (getActiveFolder() === folderId) {
    state.activeFolder = state.folders.length ? state.folders[0].id : null;
  }
  persistNoteData();
  renderFolders();
  renderNotes();
}

function openFullScreenNote(noteId) {
  const notes = state.noteData.notes;
  let note = null;
  if (noteId) {
    note = notes.find(n => n.id === noteId);
  }
  if (!note) {
    note = {
      id: 'note-' + Date.now().toString(36),
      title: '',
      body: '',
      folderId: getActiveFolder(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    notes.push(note);
    saveNotesData();
  }
  state.currentOpenNote = note;
  if (noteTitleInput) noteTitleInput.value = note.title;
  if (noteBodyInput) noteBodyInput.value = note.body;
  if (fullScreenNoteModal) {
    fullScreenNoteModal.classList.add('show');
    fullScreenNoteModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
}

function closeFullScreenNote() {
  saveCurrentOpenNote();
  state.currentOpenNote = null;
  if (fullScreenNoteModal) {
    fullScreenNoteModal.classList.remove('show');
    fullScreenNoteModal.setAttribute('aria-hidden', 'true');
    // Keep the body locked while the Notes manager is still open beneath the editor.
    if (!notesManagerModal || !notesManagerModal.classList.contains('show')) {
      document.body.classList.remove('modal-open');
    }
  }
}

function saveCurrentOpenNote() {
  if (!state.currentOpenNote) return;
  const note = state.currentOpenNote;
  note.title = noteTitleInput ? noteTitleInput.value.trim() : note.title;
  note.body = noteBodyInput ? noteBodyInput.value : note.body;
  if (noteFolderSelect) {
    note.folderId = noteFolderSelect.value;
  }
  note.updatedAt = Date.now();
  saveNotesData();
  renderNotes();
  renderFolderTabs();
}

function scheduleNoteSave() {
  if (state.noteSaveTimer) clearTimeout(state.noteSaveTimer);
  state.noteSaveTimer = setTimeout(() => {
    saveCurrentOpenNote();
  }, 350);
}

function deleteNote(noteId) {
  const note = state.noteData.notes.find(n => n.id === noteId);
  if (note) {
    note.deletedAt = Date.now();
    note.originalFolderId = note.folderId;
    saveNotesData();
    if (state.currentNotesView === 'deleted') {
      renderDeletedNotes();
    } else {
      renderNotes();
    }
  }
}

function restoreNote(noteId) {
  const note = state.noteData.notes.find(n => n.id === noteId);
  if (note) {
    if (note.originalFolderId) {
      note.folderId = note.originalFolderId;
      delete note.originalFolderId;
    }
    delete note.deletedAt;
    saveNotesData();
    renderDeletedNotes();
  }
}

function permanentDeleteNote(noteId) {
  const wasCurrent = state.currentOpenNote && state.currentOpenNote.id === noteId;
  state.noteData.notes = state.noteData.notes.filter(n => n.id !== noteId);
  saveNotesData();
  if (wasCurrent) {
    closeFullScreenNote();
  }
  if (state.currentNotesView === 'deleted') {
    renderDeletedNotes();
  }
}

function getActiveNotes() {
  return state.noteData.notes.filter(n => !n.deletedAt);
}

function getDeletedNotes() {
  return state.noteData.notes
    .filter(n => n.deletedAt)
    .sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
}

function switchNotesView(view) {
  state.currentNotesView = view;
  if (navNotesBtn) navNotesBtn.classList.toggle('active', view === 'notes');
  if (navDeletedBtn) navDeletedBtn.classList.toggle('active', view === 'deleted');
  if (notesListPanel) notesListPanel.classList.toggle('hidden', view !== 'notes');
  if (deletedListPanel) deletedListPanel.classList.toggle('hidden', view !== 'deleted');
  if (view === 'notes') {
    renderNotes();
  } else {
    renderDeletedNotes();
  }
}

function renderNotes() {
  if (!notesList) return;
  const notes = getActiveNotes().filter(n => n.folderId === getActiveFolder());
  const t = translations[state.locale] || translations.en;
  notesList.innerHTML = notes.map(note => {
    const preview = (note.body || '').slice(0, 80);
    const dateStr = new Date(note.updatedAt || note.createdAt || Date.now()).toLocaleDateString(state.locale, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    return `
      <li class="note-item" data-note-id="${note.id}">
        <div class="note-item-main">
          <span class="note-item-title">${escapeHtml(note.title || t.untitled || 'Untitled')}</span>
          ${preview ? `<span class="note-item-preview">${escapeHtml(preview)}</span>` : ''}
          <span class="note-item-meta">${escapeHtml(dateStr)}</span>
        </div>
        <div class="note-item-actions">
          <button class="note-action-btn delete" data-action="delete" data-note-id="${note.id}" aria-label="Delete" title="${t.deleteNoteBtn || 'Delete'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </li>`;
  }).join('');

  if (notesEmptyState) notesEmptyState.classList.toggle('hidden', notes.length > 0);
}

function renderDeletedNotes() {
  if (!deletedNotesList) return;
  const notes = getDeletedNotes();
  const t = translations[state.locale] || translations.en;
  deletedNotesList.innerHTML = notes.map(note => {
    const dateStr = new Date(note.deletedAt || Date.now()).toLocaleDateString(state.locale, {
      month: 'short', day: 'numeric'
    });
    return `
      <li class="note-item" data-note-id="${note.id}">
        <div class="note-item-main">
          <span class="note-item-title">${escapeHtml(note.title || t.untitled || 'Untitled')}</span>
          <span class="note-item-meta">${t.deleteConfirmText || 'Deleted'} · ${escapeHtml(dateStr)}</span>
        </div>
        <div class="note-item-actions">
          <button class="note-action-btn restore" data-action="restore" data-note-id="${note.id}" aria-label="Restore" title="${t.restoreBtn || 'Restore'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
          <button class="note-action-btn danger" data-action="permanent-delete" data-note-id="${note.id}" aria-label="Delete permanently" title="${t.deletePermanentBtn || 'Delete'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </li>`;
  }).join('');

  if (deletedEmptyState) deletedEmptyState.classList.toggle('hidden', notes.length > 0);
}

function renderFolderTabs() {
  if (!folderTabsScroll) return;
  folderTabsScroll.innerHTML = state.folders.map(folder => {
    const isActive = folder.id === getActiveFolder();
    return `<button class="folder-tab ${isActive ? 'active' : ''}" data-folder-id="${folder.id}" type="button">${escapeHtml(folder.name)}</button>`;
  }).join('');
}

function showDeleteConfirm(noteId) {
  state.pendingDeleteNoteId = noteId;
  if (deleteConfirmModal) {
    deleteConfirmModal.classList.add('show');
    deleteConfirmModal.setAttribute('aria-hidden', 'false');
  }
}

function hideDeleteConfirm() {
  state.pendingDeleteNoteId = null;
  if (deleteConfirmModal) {
    deleteConfirmModal.classList.remove('show');
    deleteConfirmModal.setAttribute('aria-hidden', 'true');
  }
}

function handleNotesListClick(e) {
  const item = e.target.closest('.note-item');
  if (!item) return;
  const noteId = item.getAttribute('data-note-id');
  openFullScreenNote(noteId);
}

function handleFolderClick(e) {
  const deleteBtn = e.target.closest('.folder-delete-btn');
  if (deleteBtn) {
    const folderId = deleteBtn.getAttribute('data-folder-id');
    deleteFolder(folderId);
    return;
  }
  const item = e.target.closest('.folder-item');
  if (item) {
    const folderId = item.getAttribute('data-folder-id');
    setActiveFolder(folderId);
    renderFolders();
  }
}

// ============================================================
// QUICK NOTES
// ============================================================
export function getQuickNoteLabels(locale) {
  const labels = {
    en: { title: 'Quick Notes', addButton: '+ New Note', placeholder: 'Write a note' },
    ar: { title: 'الملاحظات السريعة', addButton: '+ ملاحظة جديدة', placeholder: 'اكتب ملاحظة' },
    es: { title: 'Notas rápidas', addButton: '+ Nueva nota', placeholder: 'Escribe una nota' },
    fr: { title: 'Notes rapides', addButton: '+ Nouvelle note', placeholder: 'Écrire une note' },
    ru: { title: 'Быстрые заметки', addButton: '+ Новая заметка', placeholder: 'Напишите заметку' },
    de: { title: 'Schnellnotizen', addButton: '+ Neue Notiz', placeholder: 'Notiz schreiben' },
    tr: { title: 'Hızlı Notlar', addButton: '+ Yeni Not', placeholder: 'Not yaz' }
  };
  return labels[locale] || labels.en;
}

function addQuickNote(text) {
  if (!text || !text.trim()) return;
  const note = {
    id: Date.now().toString(36),
    text: text.trim(),
    createdAt: Date.now()
  };
  state.notes.unshift(note);
  if (state.notes.length > 20) state.notes = state.notes.slice(0, 20);
  saveQuickNotes();
  renderQuickNotesFallback();
}

function addGeneralQuickNote(text) {
  if (!text || !text.trim()) return;
  const note = {
    id: Date.now().toString(36),
    text: text.trim(),
    createdAt: Date.now()
  };
  state.quickNotes.unshift(note);
  if (state.quickNotes.length > 20) state.quickNotes = state.quickNotes.slice(0, 20);
  saveGeneralQuickNotes();
  renderQuickNotesFallback();
}

function deleteQuickNote(id, source) {
  if (source === 'general') {
    state.quickNotes = state.quickNotes.filter(n => n.id !== id);
    saveGeneralQuickNotes();
  } else {
    state.notes = state.notes.filter(n => n.id !== id);
    saveQuickNotes();
  }
  renderQuickNotesFallback();
}

function saveQuickNotes() {
  try {
    localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(state.notes));
  } catch (e) { /* ignore */ }
}

function saveGeneralQuickNotes() {
  try {
    localStorage.setItem(QUICK_NOTES_KEY, JSON.stringify(state.quickNotes));
  } catch (e) { /* ignore */ }
}

function loadQuickNotes() {
  try {
    const stored = localStorage.getItem(NOTE_STORAGE_KEY);
    state.notes = stored ? JSON.parse(stored) : [];
    const storedGeneral = localStorage.getItem(QUICK_NOTES_KEY);
    state.quickNotes = storedGeneral ? JSON.parse(storedGeneral) : [];
  } catch (e) {
    state.notes = [];
    state.quickNotes = [];
  }
}

function renderQuickNotesFallback() {
  // Legacy UI elements may not exist; this is a fallback for storage-only quick notes
}

function renderQuickNotes() {
  renderQuickNotesFallback();
}

function toggleQuickNotesPanel() {
  // Legacy panel may not exist
}

// ============================================================
// CURRENCY UI
// ============================================================
function setCurrencyStatus(message, isError = false) {
  if (currencyStatusMessage) {
    currencyStatusMessage.textContent = message;
    currencyStatusMessage.classList.toggle('error', isError);
  }
}

function fetchCurrencyRates() {
  return new Promise((resolve, reject) => {
    if (!currencyServiceInstance) {
      reject(new Error('Currency service not initialized'));
      return;
    }
    currencyServiceInstance.refreshCurrencyData()
      .then(() => {
        state.rates = currencyServiceInstance.getState().rates;
        state.ratesLastUpdated = currencyServiceInstance.getLastUpdated();
        resolve(state.rates);
      })
      .catch(reject);
  });
}

async function initializeCurrencyServiceInBackground() {
  try {
    currencyServiceInstance = CurrencyService;
    const result = await currencyServiceInstance.initializeCurrencyService();
    state.rates = result.rates;
    state.ratesLastUpdated = currencyServiceInstance.getLastUpdated();
    state.ratesStatus = currencyServiceInstance.isUsingCachedData() ? 'cached' : 'ready';
    updateCurrencyUI();
    populateCurrencySelects();
    if (currencyStatusMessage) {
      const cached = currencyServiceInstance.isUsingCachedData();
      if (currencyServiceInstance.getError()) {
        setCurrencyStatus('Rates unavailable - using cached rates', true);
      } else {
        setCurrencyStatus('Rates updated');
      }
      if (cacheIndicator) {
        cacheIndicator.style.display = cached ? 'flex' : 'none';
      }
    }
    updateConverterOutput();
  } catch (e) {
    console.error('Currency service init failed:', e);
    setCurrencyStatus('Currency service unavailable', true);
  }
}

function populateCurrencySelects() {
  if (!currencyServiceInstance) return;
  const catalog = currencyServiceInstance.getCatalog();
  if (!catalog || !catalog.length) return;

  const optionsHTML = catalog.map(c =>
    `<option value="${c.code}">${c.flag} ${c.code} — ${escapeHtml(c.name)}</option>`
  ).join('');

  if (currencyFromSelect) {
    currencyFromSelect.innerHTML = optionsHTML;
    currencyFromSelect.value = 'USD';
  }
  if (currencyToSelect) {
    currencyToSelect.innerHTML = optionsHTML;
    currencyToSelect.value = 'IQD';
  }
  updateCurrencyUI();
}

function updateCurrencyUI() {
  if (!currencyServiceInstance) return;
  const state_ = currencyServiceInstance.getState();
  state.currencyFrom = state_.catalog.find(c => c.code === 'USD') || null;
  state.currencyTo = state_.catalog.find(c => c.code === 'IQD') || null;
  const fromCode = currencyFromSelect ? currencyFromSelect.value : 'USD';
  const toCode = currencyToSelect ? currencyToSelect.value : 'IQD';
  updateFavoriteButtons(fromCode, toCode);
  updateConverterOutput();
}

function expandScientific(str) {
  if (!str.includes('e') && !str.includes('E')) return str;
  const [mantissa, expStr] = str.split(/[eE]/);
  const exp = parseInt(expStr, 10);
  const [intPart, fracPart = ''] = mantissa.split('.');
  const digits = intPart + fracPart;
  const decimalPos = intPart.length + exp;
  if (decimalPos <= 0) {
    return '0.' + '0'.repeat(-decimalPos) + digits;
  }
  if (decimalPos >= digits.length) {
    return digits + '0'.repeat(decimalPos - digits.length);
  }
  return digits.slice(0, decimalPos) + '.' + digits.slice(decimalPos);
}

function formatCleanNumber(value) {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (isNaN(num)) return '0';
  if (!isFinite(num)) return String(num);
  // Use 15 significant digits to round away floating-point artifacts
  // while preserving meaningful precision for display.
  let cleaned;
  try {
    cleaned = num.toPrecision(15);
  } catch (e) {
    return formatNumber(String(num));
  }
  // Expand scientific notation to a plain decimal string
  cleaned = expandScientific(cleaned);
  // Limit display to a maximum of 6 decimal places for converter output
  let rounded = Number(cleaned).toFixed(6);
  if (rounded === 'NaN') {
    rounded = cleaned;
  }
  rounded = expandScientific(rounded);
  // Trim trailing zeros (and trailing decimal point)
  rounded = rounded.replace(/\.?0+$/, '');
  // Add thousands separators
  return formatNumber(rounded);
}

// Update the flag + label shown on the From/To currency strips based on the
// currently selected currency. Arabic shows "flag Localized Name — CODE",
// other locales show the simpler "flag CODE" (cleaner non-Arabic UI).
function updateConverterStrips() {
  if (!currencyServiceInstance) return;
  const fromCode = currencyFromSelect ? currencyFromSelect.value : '';
  const toCode = currencyToSelect ? currencyToSelect.value : '';
  const isArabic = (state.locale || '') === 'ar';
  const fromCur = fromCode ? currencyServiceInstance.getCurrencyByCode(fromCode) : null;
  const toCur = toCode ? currencyServiceInstance.getCurrencyByCode(toCode) : null;
  if (converterFromFlag) converterFromFlag.textContent = fromCur ? fromCur.flag : '';
  if (converterToFlag) converterToFlag.textContent = toCur ? toCur.flag : '';
  if (converterFromLabel) {
    converterFromLabel.textContent = fromCur
      ? (isArabic ? `${getLocalizedCurrencyName(fromCur)} — ${fromCur.code}` : fromCur.code)
      : '';
  }
  if (converterToLabel) {
    converterToLabel.textContent = toCur
      ? (isArabic ? `${getLocalizedCurrencyName(toCur)} — ${toCur.code}` : toCur.code)
      : '';
  }
}

function updateConverterOutput() {
  if (!currencyServiceInstance || !currencyFromSelect || !currencyToSelect || !currencyFromAmount) return;
  updateConverterStrips();
  const fromCode = currencyFromSelect.value;
  const toCode = currencyToSelect.value;
  const amount = parseFloat(currencyFromAmount.value);

  let result = 0;
  if (!isNaN(amount)) {
    if (state.converterMode === 'market' && state.marketRate !== null) {
      // Use Decimal for precise market rate calculation
      try {
        result = new Decimal(String(amount)).mul(new Decimal(String(state.marketRate))).toNumber();
      } catch (e) {
        result = amount * state.marketRate;
      }
    } else {
      result = currencyServiceInstance.convertCurrency(amount, fromCode, toCode);
    }
  }

  const displayResult = formatCleanNumber(result);

  if (currencyToAmount) {
    currencyToAmount.textContent = displayResult;
  }

  // Update rate display
  if (conversionRateDisplay) {
    const rate = state.converterMode === 'market' && state.marketRate !== null
      ? state.marketRate
      : currencyServiceInstance.convertCurrency(1, fromCode, toCode);
    const rateText = `1 ${fromCode} = ${formatCleanNumber(rate)} ${toCode}`;
    conversionRateDisplay.textContent = rateText;
  }

  // Update market rate field
  if (marketRatePrefix) marketRatePrefix.textContent = `1 ${fromCode} =`;
  if (marketRateSuffix) marketRateSuffix.textContent = toCode;
  if (marketRateField) {
    marketRateField.hidden = state.converterMode !== 'market';
  }

  // Update words display: number written in words followed by the localized
  // currency name, reusing the existing Number-To-Words system.
  if (currencyWords && result !== 0) {
    const toCur = toCode ? currencyServiceInstance.getCurrencyByCode(toCode) : null;
    const currencyName = toCur ? getLocalizedCurrencyName(toCur) : '';
    currencyWords.textContent = currencyName
      ? `${numberToWords(displayResult, state.locale)} ${currencyName}`
      : numberToWords(displayResult, state.locale);
  } else if (currencyWords) {
    currencyWords.textContent = '';
  }
}

function updateFavoriteButtons(fromCode, toCode) {
  if (!currencyServiceInstance) return;
  const isFromFav = currencyServiceInstance.isFavorite(fromCode);
  const isToFav = currencyServiceInstance.isFavorite(toCode);
  if (favoriteFromButton) {
    const icon = favoriteFromButton.querySelector('i');
    if (icon) {
      icon.className = isFromFav ? 'fa-solid fa-star' : 'fa-regular fa-star';
    }
    favoriteFromButton.classList.toggle('active', isFromFav);
  }
  if (favoriteToButton) {
    const icon = favoriteToButton.querySelector('i');
    if (icon) {
      icon.className = isToFav ? 'fa-solid fa-star' : 'fa-regular fa-star';
    }
    favoriteToButton.classList.toggle('active', isToFav);
  }
}

function swapCurrencies() {
  if (!currencyFromSelect || !currencyToSelect) return;
  const from = currencyFromSelect.value;
  const to = currencyToSelect.value;
  currencyFromSelect.value = to;
  currencyToSelect.value = from;
  if (currencyServiceInstance) {
    currencyServiceInstance.addToRecent(from);
    currencyServiceInstance.addToRecent(to);
  }
  updateFavoriteButtons(currencyFromSelect.value, currencyToSelect.value);
  updateConverterOutput();
}

function toggleFavorite(side) {
  if (!currencyServiceInstance) return;
  const code = side === 'from'
    ? (currencyFromSelect ? currencyFromSelect.value : null)
    : (currencyToSelect ? currencyToSelect.value : null);
  if (!code) return;
  if (currencyServiceInstance.isFavorite(code)) {
    currencyServiceInstance.removeFromFavorites(code);
  } else {
    currencyServiceInstance.addToFavorites(code);
  }
  updateFavoriteButtons(
    currencyFromSelect ? currencyFromSelect.value : '',
    currencyToSelect ? currencyToSelect.value : ''
  );
}

function showFavoritesList() {
  if (!currencyServiceInstance || !currencyFromSelect || !currencyToSelect) return;
  const favorites = currencyServiceInstance.getFavorites();
  const codes = favorites.map(f => f.code);
  if (!codes.length) {
    showToast('No favorites yet');
    return;
  }
  const currentFrom = currencyFromSelect.value;
  currencyFromSelect.innerHTML = codes.map(code => {
    const c = currencyServiceInstance.getCurrencyByCode(code);
    return c ? `<option value="${c.code}">${c.flag} ${c.code}</option>` : '';
  }).join('');
  currencyFromSelect.value = currentFrom;
  updateFavoriteButtons(currencyFromSelect.value, currencyToSelect.value);
  updateConverterOutput();
}

function showRecentList() {
  if (!currencyServiceInstance || !currencyFromSelect || !currencyToSelect) return;
  const recent = currencyServiceInstance.getRecent();
  const codes = recent.map(r => r.code);
  if (!codes.length) {
    showToast('No recent currencies');
    return;
  }
  const currentFrom = currencyFromSelect.value;
  currencyFromSelect.innerHTML = codes.map(code => {
    const c = currencyServiceInstance.getCurrencyByCode(code);
    return c ? `<option value="${c.code}">${c.flag} ${c.code}</option>` : '';
  }).join('');
  currencyFromSelect.value = currentFrom;
  updateFavoriteButtons(currencyFromSelect.value, currencyToSelect.value);
  updateConverterOutput();
}

function handleCurrencySearch(event) {
  if (!currencyServiceInstance || !currencyList) return;
  const query = event.target.value;
  const results = currencyServiceInstance.searchCurrencies(query);
  currencyList.innerHTML = results.map(c => `
    <li class="currency-list-item" data-code="${c.code}">
      <span class="currency-flag">${c.flag}</span>
      <span class="currency-code">${c.code}</span>
      <span class="currency-name">${escapeHtml(c.name)}</span>
      <span class="currency-country">${escapeHtml(c.country)}</span>
    </li>
  `).join('');
}

function renderCurrencyDirectoryWithService() {
  if (!currencyServiceInstance || !currencyList) return;
  const catalog = currencyServiceInstance.getCatalog();
  if (!catalog || !catalog.length) {
    currencyList.innerHTML = '<li class="empty-list">Loading...</li>';
    return;
  }
  currencyList.innerHTML = catalog.map(c => `
    <li class="currency-list-item" data-code="${c.code}">
      <span class="currency-flag">${c.flag}</span>
      <span class="currency-code">${c.code}</span>
      <span class="currency-name">${escapeHtml(c.name)}</span>
      <span class="currency-country">${escapeHtml(c.country)}</span>
    </li>
  `).join('');
}

function openCurrencyDirectory() {
  if (currencyDirectoryModal) {
    currencyDirectoryModal.classList.add('show');
    currencyDirectoryModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  renderCurrencyDirectoryWithService();
  if (currencySearchInput) {
    currencySearchInput.value = '';
  }
}

function closeCurrencyDirectory() {
  if (currencyDirectoryModal) {
    currencyDirectoryModal.classList.remove('show');
    currencyDirectoryModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
}

// ============================================================
// CURRENCY RATES SCREEN (accessed via Currency Menu -> Search Currency)
// ============================================================
// Localized (Arabic) names for the supported ISO codes. English names come
// straight from CurrencyService; these are only used when the app is Arabic.
const CURRENCY_NAMES_AR = {
  AED: 'درهم إماراتي', AFN: 'أفغاني', ALL: 'ليك ألباني', AMD: 'درام أرميني',
  AOA: 'كوانزا أنغولي', ARS: 'بيزو أرجنتيني', AUD: 'دولار أسترالي',
  AZN: 'مانات أذربيجاني', BAM: 'مارك بوسني', BBD: 'دولار باربادوسي',
  BDT: 'تاكا بنغلاديشي', BGN: 'ليف بلغاري', BHD: 'دينار بحريني',
  BIF: 'فرنك بوروندي', BND: 'دولار بروناي', BOB: 'بوليفيانو بوليفي',
  BRL: 'ريال برازيلي', BWP: 'بولا بوتسواني', BYN: 'روبل بيلاروسي',
  CAD: 'دولار كندي', CHF: 'فرنك سويسري', CLP: 'بيزو تشيلي',
  CNY: 'يوان صيني', COP: 'بيزو كولومبي', CRC: 'كولون كوستاريكي',
  CZK: 'كورونا تشيكية', DKK: 'كرونة دنماركية', DOP: 'بيزو دومينيكي',
  DZD: 'دينار جزائري', EGP: 'جنيه مصري', ETB: 'بير إثيوبي', EUR: 'يورو',
  GBP: 'جنيه إسترليني', GEL: 'لاري جورجي', GHS: 'سيدي غاني',
  GTQ: 'كتزل غواتيمالي', HKD: 'دولار هونغ كونغ', HNL: 'لمبيرة هندوراسية',
  HTG: 'جورد هايتي', HUF: 'فورنت مجري', IDR: 'روبية إندونيسية',
  ILS: 'شيكل إسرائيلي', INR: 'روبية هندية', IQD: 'دينار عراقي',
  IRR: 'ريال إيراني', ISK: 'كرونة آيسلندية', JMD: 'دولار جامايكي',
  JOD: 'دينار أردني', JPY: 'ين ياباني', KES: 'شلن كيني',
  KGS: 'سوم قيرغيزي', KHR: 'ريال كمبودي', KRW: 'وون كوري جنوبي',
  KWD: 'دينار كويتي', KZT: 'تنغي كازاخستاني', LAK: 'كيب لاوسي',
  LBP: 'ليرة لبنانية', LKR: 'روبية سريلانكية', MAD: 'درهم مغربي',
  MGA: 'أرياري مدغشقري', MKD: 'دينار مقدوني', MUR: 'روبية موريشيوسية',
  MXN: 'بيزو مكسيكي', MYR: 'رينغيت ماليزي', NGN: 'نيرة نيجيرية',
  NOK: 'كرونة نرويجية', NPR: 'روبية نيبالية', NZD: 'دولار نيوزيلندي',
  OMR: 'ريال عماني', PAB: 'بالبوا بنمي', PEN: 'سول بيروفي',
  PHP: 'بيزو فلبيني', PKR: 'روبية باكستانية', PLN: 'زلوتي بولندي',
  QAR: 'ريال قطري', RON: 'ليو روماني', RSD: 'دينار صربي',
  RUB: 'روبل روسي', SAR: 'ريال سعودي', SEK: 'كرونة سويدية',
  SGD: 'دولار سنغافوري', THB: 'بات تايلاندي', TRY: 'ليرة تركية',
  TTD: 'دولار ترينيداد وتوباغو', TWD: 'دولار تايواني',
  UAH: 'هريفنا أوكرانية', USD: 'دولار أمريكي', UZS: 'سوم أوزبكي',
  VND: 'دونغ فيتنامي', ZAR: 'راند جنوب أفريقي', ZMW: 'كواشا زامبي'
};

function getLocalizedCurrencyName(currency) {
  if (!currency) return '';
  if ((state.locale || '') === 'ar') {
    return CURRENCY_NAMES_AR[currency.code] || currency.name || currency.code;
  }
  return currency.name || currency.code;
}

function getCurrencyRatesBase() {
  if (currencyServiceInstance && currencyServiceInstance.getState) {
    return currencyServiceInstance.getState().base || 'USD';
  }
  return 'USD';
}

// Format a rate value with commas and up to 4 decimals (matches service style).
function formatRatesValue(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  try {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4
    }).format(value);
  } catch (e) {
    return String(value);
  }
}

function currencyRatesRateText(code) {
  if (!currencyServiceInstance) return '';
  const base = getCurrencyRatesBase();
  let rate = 1;
  try {
    rate = currencyServiceInstance.getExchangeRate ? currencyServiceInstance.getExchangeRate(code) : null;
  } catch (e) {
    rate = null;
  }
  if (rate === null || rate === undefined || isNaN(rate)) return '';
  return `1 ${base} = ${formatRatesValue(rate)} ${code}`;
}

function setCurrencyRatesStatus(message, type) {
  if (!currencyRatesStatus) return;
  currencyRatesStatus.textContent = message || '';
  currencyRatesStatus.hidden = !message;
  currencyRatesStatus.className = 'currency-rates-status' + (type ? ' ' + type : '');
}

function renderCurrencyRates() {
  if (!currencyRatesList) return;
  const t = translations[state.locale] || translations.en;

  if (!currencyServiceInstance) {
    setCurrencyRatesStatus(t.currencyRatesLoading || 'Loading rates…', 'loading');
    currencyRatesList.innerHTML = '';
    return;
  }

  const catalog = currencyServiceInstance.getCatalog();
  if (!catalog || !catalog.length) {
    setCurrencyRatesStatus(t.currencyRatesLoading || 'Loading rates…', 'loading');
    currencyRatesList.innerHTML = '';
    return;
  }

  const query = currencyRatesSearchInput ? (currencyRatesSearchInput.value || '').trim().toLowerCase() : '';
  const results = catalog.filter(c => {
    if (!query) return true;
    return (
      (c.code || '').toLowerCase().includes(query) ||
      (c.name || '').toLowerCase().includes(query) ||
      (c.country || '').toLowerCase().includes(query) ||
      (getLocalizedCurrencyName(c) || '').toLowerCase().includes(query)
    );
  });

  setCurrencyRatesStatus('', '');

  if (!results.length) {
    setCurrencyRatesStatus(t.currencyRatesEmpty || 'No currencies found', 'empty');
    currencyRatesList.innerHTML = '';
    return;
  }

  const serviceErr = currencyServiceInstance.getError ? currencyServiceInstance.getError() : null;
  const hasRates = currencyServiceInstance.getState() && currencyServiceInstance.getState().rates &&
    Object.keys(currencyServiceInstance.getState().rates).length > 0;

  currencyRatesList.innerHTML = results.map(c => {
    const isFav = currencyServiceInstance && currencyServiceInstance.isFavorite ? currencyServiceInstance.isFavorite(c.code) : false;
    const rateText = currencyRatesRateText(c.code);
    const priceHtml = rateText
      ? `<span class="currency-rates-price">${escapeHtml(rateText)}</span>`
      : `<span class="currency-rates-price muted">—</span>`;
    const starIcon = isFav ? 'fa-solid fa-star' : 'fa-regular fa-star';
    return `
      <li class="currency-rates-item" data-code="${escapeHtml(c.code)}">
        <span class="currency-rates-flag">${c.flag}</span>
        <span class="currency-rates-info">
          <span class="currency-rates-code">${escapeHtml(c.code)}</span>
          <span class="currency-rates-name">${escapeHtml(getLocalizedCurrencyName(c))}</span>
        </span>
        <span class="currency-rates-right">
          ${priceHtml}
          <button class="currency-rates-fav${isFav ? ' active' : ''}" data-code="${escapeHtml(c.code)}" type="button" aria-label="Toggle favorite">
            <i class="${starIcon}"></i>
          </button>
        </span>
      </li>
    `;
  }).join('');

  if (serviceErr && !hasRates) {
    setCurrencyRatesStatus(t.currencyRatesError || 'Rates unavailable', 'error');
  }
}

function openCurrencyRates() {
  closeCurrencyConverter();
  if (currencyRatesModal) {
    currencyRatesModal.classList.add('show');
    currencyRatesModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  if (currencyRatesSearchInput) currencyRatesSearchInput.value = '';
  renderCurrencyRates();
  if (currencyRatesSearchInput) {
    setTimeout(() => currencyRatesSearchInput.focus(), 100);
  }
}

function closeCurrencyRates() {
  if (currencyRatesModal) {
    currencyRatesModal.classList.remove('show');
    currencyRatesModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
}

// ============================================================
// CURRENCY FAVORITES SCREEN (accessed via Currency Menu -> Favorites)
// ============================================================
function setCurrencyFavoritesStatus(message, type) {
  if (!currencyFavoritesStatus) return;
  currencyFavoritesStatus.textContent = message || '';
  currencyFavoritesStatus.hidden = !message;
  currencyFavoritesStatus.className = 'currency-favorites-status' + (type ? ' ' + type : '');
}

async function openCurrencyFavorites() {
  closeCurrencyConverter();
  if (currencyFavoritesModal) {
    currencyFavoritesModal.classList.add('show');
    currencyFavoritesModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  renderCurrencyFavorites();
  // Fetch the latest live prices automatically when the screen opens.
  // Rates come exclusively from the existing CurrencyService API (no hardcoded values).
  if (currencyServiceInstance && typeof currencyServiceInstance.refreshCurrencyData === 'function') {
    try {
      await currencyServiceInstance.refreshCurrencyData();
      state.rates = currencyServiceInstance.getState().rates;
    } catch (e) {
      // Keep current/cached rates if the network call fails.
    }
    renderCurrencyFavorites();
  }
}

function closeCurrencyFavorites() {
  if (currencyFavoritesModal) {
    currencyFavoritesModal.classList.remove('show');
    currencyFavoritesModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
}

function renderCurrencyFavorites() {
  if (!currencyFavoritesList) return;
  const t = translations[state.locale] || translations.en;
  if (currencyFavoritesEmpty) currencyFavoritesEmpty.hidden = true;
  setCurrencyFavoritesStatus('', '');

  if (!currencyServiceInstance) {
    setCurrencyFavoritesStatus(t.currencyRatesLoading || 'Loading favorites…', 'loading');
    currencyFavoritesList.innerHTML = '';
    return;
  }

  const favorites = currencyServiceInstance.getFavorites();
  if (!favorites.length) {
    currencyFavoritesList.innerHTML = '';
    if (currencyFavoritesEmpty) {
      currencyFavoritesEmpty.hidden = false;
      const textEl = currencyFavoritesEmpty.querySelector('[data-i18n="currencyFavoritesEmpty"]');
      if (textEl) textEl.textContent = t.currencyFavoritesEmpty || '';
      const hintEl = currencyFavoritesEmpty.querySelector('[data-i18n="currencyFavoritesEmptyHint"]');
      if (hintEl) hintEl.textContent = t.currencyFavoritesEmptyHint || '';
    }
    return;
  }

  currencyFavoritesList.innerHTML = favorites.map(c => {
    const rateText = currencyRatesRateText(c.code);
    const priceHtml = rateText
      ? `<span class="currency-favorites-price">${escapeHtml(rateText)}</span>`
      : `<span class="currency-favorites-price muted">—</span>`;
    return `
      <li class="currency-favorites-item" data-code="${escapeHtml(c.code)}">
        <span class="currency-favorites-flag">${c.flag}</span>
        <span class="currency-favorites-info">
          <span class="currency-favorites-code">${escapeHtml(c.code)}</span>
          <span class="currency-favorites-name">${escapeHtml(getLocalizedCurrencyName(c))}</span>
        </span>
        <span class="currency-favorites-right">
          ${priceHtml}
          <button class="currency-favorites-fav" data-code="${escapeHtml(c.code)}" type="button" aria-label="Remove from favorites">
            <i class="fa-solid fa-star"></i>
          </button>
        </span>
      </li>
    `;
  }).join('');
}

function openCurrencyConverter() {
  if (currencyConverterModal) {
    currencyConverterModal.classList.add('show');
    currencyConverterModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  if (currencyFromAmount) {
    currencyFromAmount.value = '1';
  }
  updateConverterOutput();
  focusCurrencyConverter();
}

function closeCurrencyConverter() {
  if (currencyConverterModal) {
    currencyConverterModal.classList.remove('show');
    currencyConverterModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
}

function focusCurrencyConverter() {
  if (currencyFromAmount) {
    setTimeout(() => currencyFromAmount.focus(), 100);
  }
}

// Speak the current converted result aloud, reusing the same localized speech
// behavior as the rest of the app. Tracks speaking state so that a second tap
// while speaking stops the audio immediately, and a later tap speaks again.
let currencySpeechActive = false;

function stopCurrencySpeech() {
  try {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } catch (e) {
    // no-op
  }
  currencySpeechActive = false;
  if (currencySpeakButton) currencySpeakButton.classList.remove('speaking');
}

function speakCurrencyResult() {
  try {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    // Toggle: if currently reading, stop immediately.
    if (currencySpeechActive) {
      stopCurrencySpeech();
      return;
    }
    const text = currencyToAmount ? currencyToAmount.textContent : '';
    if (!text || text === '0' || text === '—') return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.locale === 'ar' ? 'ar-SA' : state.locale === 'es' ? 'es-ES' : state.locale === 'fr' ? 'fr-FR' : state.locale === 'ru' ? 'ru-RU' : state.locale === 'de' ? 'de-DE' : state.locale === 'tr' ? 'tr-TR' : 'en-US';
    utterance.onstart = () => {
      currencySpeechActive = true;
      if (currencySpeakButton) currencySpeakButton.classList.add('speaking');
    };
    utterance.onend = () => {
      currencySpeechActive = false;
      if (currencySpeakButton) currencySpeakButton.classList.remove('speaking');
    };
    utterance.onerror = () => {
      currencySpeechActive = false;
      if (currencySpeakButton) currencySpeakButton.classList.remove('speaking');
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    // Speech synthesis not available
  }
}

// Reset the conversion screen to its start state: clear the amount, clear the
// result, and leave the currency strips ready for a fresh selection. All other
// converter features (favorites, recent, mode, etc.) remain untouched.
function resetCurrencyConverter() {
  if (currencyFromAmount) currencyFromAmount.value = '';
  updateConverterOutput();
  if (currencyToAmount) currencyToAmount.textContent = '0';
  if (conversionRateDisplay) conversionRateDisplay.textContent = '—';
  if (currencyWords) currencyWords.textContent = '';
}

// ============================================================
// CUSTOM-RATE CONVERTER (تحويل بسعر مخصص)
// A minimal screen: the user enters an exchange rate and an
// amount; the result is simply  amount × rate  (no API involved).
// ============================================================
let customRateSpeechActive = false;

function openCustomRateConverter() {
  // Make sure other currency screens are not layered underneath.
  closeCurrencyConverter();
  closeCurrencyRates();
  if (customRateModal) {
    customRateModal.classList.add('show');
    customRateModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  updateCustomRateResult();
  if (customRateInput) {
    setTimeout(() => customRateInput.focus(), 100);
  }
}

function closeCustomRateConverter() {
  stopCustomRateSpeech();
  if (customRateModal) {
    customRateModal.classList.remove('show');
    customRateModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
}

// Reset the whole screen back to its initial state: stop any speech,
// clear the rate, the amount, the result and the written-out words.
function resetCustomRateConverter() {
  stopCustomRateSpeech();
  if (customRateInput) customRateInput.value = '';
  if (customAmountInput) customAmountInput.value = '';
  if (customRateResult) customRateResult.textContent = '0';
  if (customRateWords) customRateWords.textContent = '';
}

// Update the result live as soon as both values are entered: result = amount × rate.
function updateCustomRateResult() {
  if (!customRateResult) return;
  const rate = customRateInput ? parseFloat(customRateInput.value) : NaN;
  const amount = customAmountInput ? parseFloat(customAmountInput.value) : NaN;
  if (isNaN(rate) || isNaN(amount)) {
    customRateResult.textContent = '0';
    if (customRateWords) customRateWords.textContent = '';
    return;
  }
  const result = new Decimal(String(amount)).mul(rate).toString();
  customRateResult.textContent = formatNumber(result);
  if (customRateWords) {
    customRateWords.textContent = numberToWords(result, state.locale);
  }
}

function stopCustomRateSpeech() {
  try {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } catch (e) {
    // no-op
  }
  customRateSpeechActive = false;
  if (customRateSpeakButton) customRateSpeakButton.classList.remove('speaking');
}

// Speak the current result using the same localized Speech system as the
// rest of the app. No autoplay: it only reads when the user presses the
// speaker button (once), stops on a second press while reading, and reads
// again from the start on a later press.
function speakCustomRateResult() {
  try {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    // Toggle: if currently reading, stop immediately.
    if (customRateSpeechActive) {
      stopCustomRateSpeech();
      return;
    }
    const text = customRateResult ? customRateResult.textContent : '';
    if (!text || text === '0' || text === '—') return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.locale === 'ar' ? 'ar-SA' : state.locale === 'es' ? 'es-ES' : state.locale === 'fr' ? 'fr-FR' : state.locale === 'ru' ? 'ru-RU' : state.locale === 'de' ? 'de-DE' : state.locale === 'tr' ? 'tr-TR' : 'en-US';
    utterance.onstart = () => {
      customRateSpeechActive = true;
      if (customRateSpeakButton) customRateSpeakButton.classList.add('speaking');
    };
    utterance.onend = () => {
      customRateSpeechActive = false;
      if (customRateSpeakButton) customRateSpeakButton.classList.remove('speaking');
    };
    utterance.onerror = () => {
      customRateSpeechActive = false;
      if (customRateSpeakButton) customRateSpeakButton.classList.remove('speaking');
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    // Speech synthesis not available
  }
}

function setConverterMode(mode) {
  state.converterMode = mode;
  converterModeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-converter-mode') === mode);
  });
  if (marketRateField) {
    marketRateField.hidden = mode !== 'market';
  }
  if (mode === 'market' && marketRateInput && marketRateInput.value) {
    state.marketRate = parseFloat(marketRateInput.value);
  }
  updateConverterOutput();
}

// ============================================================
// DRAWER & MODALS
// ============================================================
function toggleDrawer() {
  triggerButtonFeedback();
  if (!drawer || !drawerOverlay) return;
  const isOpen = drawer.classList.contains('open');
  drawer.classList.toggle('open', !isOpen);
  drawerOverlay.classList.toggle('open', !isOpen);
  document.body.classList.toggle('modal-open', !isOpen);
}

function closeDrawer() {
  if (!drawer || !drawerOverlay) return;
  drawer.classList.remove('open');
  drawerOverlay.classList.remove('open');
  document.body.classList.remove('modal-open');
}

// ============================================================
// CURRENCY POPOVER (independent from drawer & language popover)
// ============================================================
function openCurrencyMenu() {
  if (currencyMenuPopover) {
    currencyMenuPopover.classList.add('open');
    currencyMenuPopover.setAttribute('aria-hidden', 'false');
  }
  if (currencyMenuButton) {
    currencyMenuButton.setAttribute('aria-expanded', 'true');
  }
}

function closeCurrencyMenu() {
  if (currencyMenuPopover) {
    currencyMenuPopover.classList.remove('open');
    currencyMenuPopover.setAttribute('aria-hidden', 'true');
  }
  if (currencyMenuButton) {
    currencyMenuButton.setAttribute('aria-expanded', 'false');
  }
}

function toggleCurrencyMenu() {
  if (currencyMenuPopover && currencyMenuPopover.classList.contains('open')) {
    closeCurrencyMenu();
  } else {
    openCurrencyMenu();
  }
}

function handleCurrencyAction(action) {
  // Close the popover first, then navigate to the existing interface.
  closeCurrencyMenu();
  switch (action) {
    case 'search':
      // Currency Rates screen (أسعار العملات) — the standalone currency rates list
      openCurrencyRates();
      break;
    case 'prices':
      // Direct Currency Converter displays the live API rates (existing interface)
      openCurrencyConverter();
      break;
    case 'convert':
      // Direct Currency Converter (existing converter, unchanged)
      openCurrencyConverter();
      break;
    case 'customRate':
      // Custom-rate converter (تحويل بسعر مخصص) — new minimal screen
      openCustomRateConverter();
      break;
    case 'favorites':
      // Standalone Favorites screen — opens with live rates fetched automatically
      openCurrencyFavorites();
      break;
  }
}

function handleDrawerMenuItem(action) {
  closeDrawer();
  switch (action) {
    case 'open-history':
      openHistory();
      break;
    case 'open-notes':
      openNotesManager();
      break;
    case 'open-install':
      openInstallModal();
      break;
    case 'open-settings':
      openSettingsModal();
      break;
  }
}

function openSettingsModal() {
  if (settingsModal) {
    settingsModal.classList.add('show');
    settingsModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  if (languageSelect) languageSelect.value = state.locale;
  if (topBarLanguageSelect) topBarLanguageSelect.value = state.locale;
  if (appSoundToggle) appSoundToggle.checked = state.appSoundEnabled;
  if (soundToggle) {
    soundToggle.checked = state.soundEnabled;
    soundToggle.disabled = !state.appSoundEnabled;
  }
  if (soundProfileSelect) soundProfileSelect.value = state.soundProfile;
  if (speakerToggle) speakerToggle.checked = state.speakerEnabled;
  if (appSoundModes) {
    appSoundModes.closest('.app-sounds-group')?.classList.toggle('app-sounds-off', !state.appSoundEnabled);
  }
}

function closeSettingsModal() {
  if (settingsModal) {
    settingsModal.classList.remove('show');
    settingsModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
}

function openHelpModal() {
  if (helpModal) {
    helpModal.classList.add('show');
    helpModal.setAttribute('aria-hidden', 'false');
  }
  // Help opens on top of Settings, so the body must stay locked.
  document.body.classList.add('modal-open');
}

function closeHelpModal() {
  if (helpModal) {
    helpModal.classList.remove('show');
    helpModal.setAttribute('aria-hidden', 'true');
  }
  // Settings remains open behind the help page -> keep the body locked.
  const settingsShown = settingsModal && settingsModal.classList.contains('show');
  if (settingsShown) document.body.classList.add('modal-open');
  else document.body.classList.remove('modal-open');
}

function openInstallModal() {
  if (iosInstallModal) {
    iosInstallModal.classList.add('show');
    iosInstallModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  updateInstallModalContent();
}

function closeInstallModal() {
  if (iosInstallModal) {
    iosInstallModal.classList.remove('show');
    iosInstallModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
}

// ============================================================
// KEYBOARD INPUT
// ============================================================
function handleKeydown(event) {
  // Phase 1: preserves the original monolith keyboard behavior exactly.
  // The shared KeyboardHandler remains available for future modes, but the
  // active Standard Calculator is still driven by the monolith's own functions
  // to guarantee 100% backward compatibility (history, live evaluation, etc.).
  const key = event.key;
  const activeTag = document.activeElement ? document.activeElement.tagName : '';
  if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
    return;
  }
  if (/^\d$/.test(key)) {
    appendDigit(key);
  } else if (key === '.') {
    appendDigit('.');
  } else if (key === '+' || key === '-' || key === '*' || key === '/') {
    applyOperator(key);
  } else if (key === '%') {
    togglePercentPanel();
  } else if (key === 'Enter' || key === '=') {
    event.preventDefault();
    handleEquals();
  } else if (key === 'Backspace') {
    event.preventDefault();
    backspace();
  } else if (key === 'Escape') {
    clearAll();
  }
}

// ============================================================
// SERVICE WORKER
// ============================================================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
        .then((registration) => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    });
  }
}

// ============================================================
// VIEWPORT SYNC
// ============================================================
function syncViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--app-height', `${vh}px`);
}

// ============================================================
// WIRE EVENTS
// ============================================================
function wireEvents() {
  // Keypad number buttons
  document.querySelectorAll('.keypad-btn.number').forEach((btn) => {
    btn.addEventListener('click', () => {
      triggerButtonFeedback();
      appendDigit(btn.getAttribute('data-value'));
    });
  });

  // Keypad operator buttons
  document.querySelectorAll('.keypad-btn.operator').forEach((btn) => {
    btn.addEventListener('click', () => {
      triggerButtonFeedback();
      applyOperator(btn.getAttribute('data-value'));
    });
  });

  // Equals button
  const equalsBtn = document.querySelector('.keypad-btn.equals');
  if (equalsBtn) {
    equalsBtn.addEventListener('click', handleEquals);
  }

  // Control buttons (AC, backspace, copy, paste)
  document.querySelectorAll('.control-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      switch (action) {
        case 'clear':
          clearAll();
          break;
        case 'backspace':
          backspace();
          break;
        case 'copy':
          copyResult();
          break;
        case 'paste':
          pasteNumber(true);
          break;
      }
    });
  });

  // Scientific buttons
  document.querySelectorAll('.scientific-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      appendScientificValue(btn.getAttribute('data-scientific'));
    });
  });

  // Scientific toggle
  if (scientificToggle) {
    scientificToggle.addEventListener('click', toggleScientificPanel);
  }

  // Percent toggle
  if (percentToggle) {
    percentToggle.addEventListener('click', togglePercentPanel);
  }

  // Percent panel back button
  if (percentBackButton) {
    percentBackButton.addEventListener('click', () => {
      setPercentPanelOpen(false);
    });
  }

  // Percent refresh button
  if (percentRefreshButton) {
    percentRefreshButton.addEventListener('click', () => {
      triggerButtonFeedback();
      if (percentAmount) percentAmount.value = '';
      if (percentRate) percentRate.value = '';
      if (sharedServices.display) {
        sharedServices.display.updatePrimary('0');
        sharedServices.display.updateSecondary('Zero', state.locale);
      }
    });
  }

  // Percent inputs
  if (percentAmount) {
    percentAmount.addEventListener('input', calculatePercent);
  }
  if (percentRate) {
    percentRate.addEventListener('input', calculatePercent);
  }

  // Speech button
  if (speechButton) {
    speechButton.addEventListener('click', () => {
      triggerButtonFeedback();
      speakCurrentResult();
    });
  }

  // History buttons
  if (historyBackButton) {
    historyBackButton.addEventListener('click', closeHistory);
  }
  if (selectAllHistoryButton) {
    selectAllHistoryButton.addEventListener('click', selectAllHistory);
  }
  if (exportHistoryButton) {
    exportHistoryButton.addEventListener('click', exportHistory);
  }
  if (historyList) {
    historyList.addEventListener('click', (e) => {
      const shareBtn = e.target.closest('.history-share-btn');
      if (shareBtn) {
        shareEntry(shareBtn.getAttribute('data-id'));
      }
      const editNoteBtn = e.target.closest('.history-edit-note-btn');
      if (editNoteBtn) {
        const entryId = editNoteBtn.getAttribute('data-id');
        const noteInput = editNoteBtn.closest('.history-note-row')?.querySelector('.history-note-input');
        if (noteInput) {
          noteInput.focus();
        }
      }
    });
    historyList.addEventListener('change', (e) => {
      const input = e.target.closest('.history-note-input');
      if (input) {
        updateEntryNote(input.getAttribute('data-id'), input.value);
      }
    });
  }

  // Drawer
  if (drawerToggle) {
    drawerToggle.addEventListener('click', toggleDrawer);
  }
  if (drawerCloseButton) {
    drawerCloseButton.addEventListener('click', closeDrawer);
  }
  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeDrawer);
  }
  drawerMenuItems.forEach((item) => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      handleDrawerMenuItem(action);
    });
  });

  // Language selects
  if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }
  if (topBarLanguageSelect) {
    topBarLanguageSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }

  // Currency menu
  if (currencyMenuButton) {
    currencyMenuButton.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCurrencyMenu();
    });
  }
  currencyPopoverItems.forEach((item) => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      handleCurrencyAction(action);
    });
  });

  // Close currency menu on outside click
  document.addEventListener('click', (e) => {
    if (currencyMenuWrap && !currencyMenuWrap.contains(e.target)) {
      closeCurrencyMenu();
    }
  });

  // Close currency menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCurrencyMenu();
    }
  });

  // Theme buttons
  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      triggerButtonFeedback();
      setTheme(btn.getAttribute('data-theme'));
    });
  });

  // App Sounds master toggle (gates all app sound modes below)
  if (appSoundToggle) {
    appSoundToggle.addEventListener('change', (e) => {
      state.appSoundEnabled = e.target.checked;
      if (soundToggle) soundToggle.disabled = !e.target.checked;
      if (appSoundModes) {
        appSoundModes.closest('.app-sounds-group')?.classList.toggle('app-sounds-off', !e.target.checked);
      }
      saveSoundPreferences();
    });
  }

  // Sound toggle (per sound mode)
  if (soundToggle) {
    soundToggle.addEventListener('change', (e) => {
      state.soundEnabled = e.target.checked;
      saveSoundPreferences();
    });
  }

  // Sound profile selector (button click sound). Selecting a non-silent profile
  // plays a short preview. The chosen profile is persisted.
  if (soundProfileSelect) {
    soundProfileSelect.addEventListener('change', (e) => {
      state.soundProfile = e.target.value;
      saveSoundPreferences();
      playButtonSound(state.soundProfile);
    });
  }

  // Speaker / Voice Reading toggle (auto-read on =). Independent of App Sounds.
  if (speakerToggle) {
    speakerToggle.addEventListener('change', (e) => {
      state.speakerEnabled = e.target.checked;
      saveSpeakerPreference();
    });
  }

  // Settings modal
  if (settingsCloseButton) {
    settingsCloseButton.addEventListener('click', closeSettingsModal);
  }
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) closeSettingsModal();
    });
  }

  // Help & About (only reachable from Settings)
  if (helpAboutButton) {
    helpAboutButton.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerButtonFeedback();
      openHelpModal();
    });
  }
  if (helpBackButton) {
    helpBackButton.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerButtonFeedback();
      closeHelpModal();
    });
  }
  if (helpCloseButton) {
    helpCloseButton.addEventListener('click', closeHelpModal);
  }
  if (helpModal) {
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) closeHelpModal();
    });
  }

  // iOS install modal
  if (closeIosInstallModalButton) {
    closeIosInstallModalButton.addEventListener('click', closeInstallModal);
  }
  if (dismissIosInstallModalButton) {
    dismissIosInstallModalButton.addEventListener('click', closeInstallModal);
  }
  if (iosInstallModal) {
    iosInstallModal.addEventListener('click', (e) => {
      if (e.target === iosInstallModal) closeInstallModal();
    });
  }

  // Notes manager
  if (closeNotesManagerButton) {
    closeNotesManagerButton.addEventListener('click', closeNotesManager);
  }
  if (notesManagerModal) {
    notesManagerModal.addEventListener('click', (e) => {
      if (e.target === notesManagerModal) closeNotesManager();
    });
  }
  if (addFolderButton) {
    addFolderButton.addEventListener('click', addFolder);
  }
  if (openNewNoteButton) {
    openNewNoteButton.addEventListener('click', () => {
      // Open the editor on top of the notes manager so that after saving
      // the user returns to the Folders / Notes list automatically.
      openFullScreenNote(null);
    });
  }
  if (emptyNewNoteBtn) {
    emptyNewNoteBtn.addEventListener('click', () => {
      setTimeout(() => openFullScreenNote(null), 150);
    });
  }
  if (navNotesBtn) {
    navNotesBtn.addEventListener('click', () => switchNotesView('notes'));
  }
  if (navDeletedBtn) {
    navDeletedBtn.addEventListener('click', () => switchNotesView('deleted'));
  }
  if (folderTabsScroll) {
    folderTabsScroll.addEventListener('click', (e) => {
      const tab = e.target.closest('.folder-tab');
      if (!tab) return;
      const folderId = tab.getAttribute('data-folder-id');
      setActiveFolder(folderId);
      renderFolderTabs();
      renderNotes();
    });
  }
  if (notesList) {
    notesList.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action="delete"]');
      if (actionBtn) {
        e.stopPropagation();
        const noteId = actionBtn.getAttribute('data-note-id');
        if (noteId) deleteNote(noteId);
        return;
      }
      const item = e.target.closest('.note-item');
      if (!item) return;
      const noteId = item.getAttribute('data-note-id');
      if (noteId) openFullScreenNote(noteId);
    });
  }
  if (deletedNotesList) {
    deletedNotesList.addEventListener('click', (e) => {
      const restoreBtn = e.target.closest('[data-action="restore"]');
      if (restoreBtn) {
        e.stopPropagation();
        const noteId = restoreBtn.getAttribute('data-note-id');
        if (noteId) restoreNote(noteId);
        return;
      }
      const delBtn = e.target.closest('[data-action="permanent-delete"]');
      if (delBtn) {
        e.stopPropagation();
        const noteId = delBtn.getAttribute('data-note-id');
        if (noteId) showDeleteConfirm(noteId);
        return;
      }
      const item = e.target.closest('.note-item');
      if (!item) return;
      const noteId = item.getAttribute('data-note-id');
      if (noteId) openFullScreenNote(noteId);
    });
  }

  // Delete confirm
  if (deleteConfirmCancel) {
    deleteConfirmCancel.addEventListener('click', hideDeleteConfirm);
  }
  if (deleteConfirmOk) {
    deleteConfirmOk.addEventListener('click', () => {
      if (state.pendingDeleteNoteId) {
        permanentDeleteNote(state.pendingDeleteNoteId);
      }
      hideDeleteConfirm();
    });
  }
  if (deleteConfirmModal) {
    deleteConfirmModal.addEventListener('click', (e) => {
      if (e.target === deleteConfirmModal) hideDeleteConfirm();
    });
  }

  // Full screen note
  if (closeFullScreenNoteButton) {
    closeFullScreenNoteButton.addEventListener('click', closeFullScreenNote);
  }
  if (fullScreenNoteModal) {
    fullScreenNoteModal.addEventListener('click', (e) => {
      if (e.target === fullScreenNoteModal) closeFullScreenNote();
    });
  }
  if (noteTitleInput) {
    noteTitleInput.addEventListener('input', scheduleNoteSave);
  }
  if (noteBodyInput) {
    noteBodyInput.addEventListener('input', scheduleNoteSave);
  }
  if (saveFullScreenNote) {
    saveFullScreenNote.addEventListener('click', () => {
      saveCurrentOpenNote();
      closeFullScreenNote();
    });
  }
  if (deleteCurrentNote) {
    deleteCurrentNote.addEventListener('click', () => {
      if (state.currentOpenNote) {
        showDeleteConfirm(state.currentOpenNote.id);
      }
    });
  }

  // Currency converter
  if (currencyConverterCloseButton) {
    currencyConverterCloseButton.addEventListener('click', closeCurrencyConverter);
  }
  if (currencyConverterModal) {
    currencyConverterModal.addEventListener('click', (e) => {
      if (e.target === currencyConverterModal) closeCurrencyConverter();
    });
  }
  if (swapCurrenciesButton) {
    swapCurrenciesButton.addEventListener('click', swapCurrencies);
  }
  if (currencySpeakButton) {
    currencySpeakButton.addEventListener('click', () => {
      triggerButtonFeedback();
      speakCurrencyResult();
    });
  }
  if (currencyResetButton) {
    currencyResetButton.addEventListener('click', () => {
      triggerButtonFeedback();
      resetCurrencyConverter();
    });
  }
  // Custom-rate converter (تحويل بسعر مخصص)
  if (customRateBackButton) {
    customRateBackButton.addEventListener('click', () => {
      triggerButtonFeedback();
      closeCustomRateConverter();
    });
  }
  if (customRateResetButton) {
    customRateResetButton.addEventListener('click', () => {
      triggerButtonFeedback();
      resetCustomRateConverter();
    });
  }
  if (customRateModal) {
    customRateModal.addEventListener('click', (e) => {
      if (e.target === customRateModal) closeCustomRateConverter();
    });
  }
  if (customRateInput) {
    customRateInput.addEventListener('input', updateCustomRateResult);
  }
  if (customAmountInput) {
    customAmountInput.addEventListener('input', updateCustomRateResult);
  }
  if (customRateSpeakButton) {
    customRateSpeakButton.addEventListener('click', () => {
      triggerButtonFeedback();
      speakCustomRateResult();
    });
  }
  if (showFavoritesButton) {
    showFavoritesButton.addEventListener('click', showFavoritesList);
  }
  if (showRecentButton) {
    showRecentButton.addEventListener('click', showRecentList);
  }
  if (favoriteFromButton) {
    favoriteFromButton.addEventListener('click', () => toggleFavorite('from'));
  }
  if (favoriteToButton) {
    favoriteToButton.addEventListener('click', () => toggleFavorite('to'));
  }
  if (currencyFromSelect) {
    currencyFromSelect.addEventListener('change', () => {
      if (currencyServiceInstance) {
        currencyServiceInstance.addToRecent(currencyFromSelect.value);
      }
      updateFavoriteButtons(currencyFromSelect.value, currencyToSelect ? currencyToSelect.value : '');
      updateConverterOutput();
    });
  }
  if (currencyToSelect) {
    currencyToSelect.addEventListener('change', () => {
      if (currencyServiceInstance) {
        currencyServiceInstance.addToRecent(currencyToSelect.value);
      }
      updateFavoriteButtons(currencyFromSelect ? currencyFromSelect.value : '', currencyToSelect.value);
      updateConverterOutput();
    });
  }
  if (currencyFromAmount) {
    currencyFromAmount.addEventListener('input', updateConverterOutput);
  }
  if (currencyDirectoryButton) {
    currencyDirectoryButton.addEventListener('click', openCurrencyDirectory);
  }
  if (refreshRatesButton) {
    refreshRatesButton.addEventListener('click', async () => {
      // Refresh: clear the entered amount, result and words, stop any ongoing
      // speech, keep the screen open and keep the currently selected currencies.
      stopCurrencySpeech();
      resetCurrencyConverter();
      const spinIcon = refreshRatesButton.querySelector('.fa-rotate');
      if (spinIcon) spinIcon.classList.add('spinning');
      try {
        await fetchCurrencyRates();
        updateConverterOutput();
      } catch (e) {
        // Rates failed to update; the converter keeps working with cached data.
      }
      if (spinIcon) setTimeout(() => spinIcon.classList.remove('spinning'), 700);
    });
  }
  if (marketRateInput) {
    marketRateInput.addEventListener('input', () => {
      const val = parseFloat(marketRateInput.value);
      state.marketRate = isNaN(val) ? null : val;
      updateConverterOutput();
    });
  }
  converterModeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setConverterMode(btn.getAttribute('data-converter-mode'));
    });
  });

  // Currency directory
  if (currencyCloseButton) {
    currencyCloseButton.addEventListener('click', closeCurrencyDirectory);
  }
  if (currencyDirectoryModal) {
    currencyDirectoryModal.addEventListener('click', (e) => {
      if (e.target === currencyDirectoryModal) closeCurrencyDirectory();
    });
  }
  if (currencySearchInput) {
    currencySearchInput.addEventListener('input', handleCurrencySearch);
  }
  if (currencyList) {
    currencyList.addEventListener('click', (e) => {
      const item = e.target.closest('.currency-list-item');
      if (item) {
        const code = item.getAttribute('data-code');
        if (currencyFromSelect) currencyFromSelect.value = code;
        if (currencyServiceInstance) currencyServiceInstance.addToRecent(code);
        updateFavoriteButtons(currencyFromSelect ? currencyFromSelect.value : '', currencyToSelect ? currencyToSelect.value : '');
        updateConverterOutput();
        closeCurrencyDirectory();
        openCurrencyConverter();
      }
    });
  }

  // Currency Rates screen
  if (currencyRatesBackButton) {
    currencyRatesBackButton.addEventListener('click', closeCurrencyRates);
  }
  if (currencyRatesCloseButton) {
    currencyRatesCloseButton.addEventListener('click', closeCurrencyRates);
  }
  if (currencyRatesModal) {
    currencyRatesModal.addEventListener('click', (e) => {
      if (e.target === currencyRatesModal) closeCurrencyRates();
    });
  }
  if (currencyRatesSearchInput) {
    currencyRatesSearchInput.addEventListener('input', renderCurrencyRates);
  }
  if (currencyRatesList) {
    currencyRatesList.addEventListener('click', (e) => {
      const favBtn = e.target.closest('.currency-rates-fav');
      if (favBtn) {
        e.preventDefault();
        e.stopPropagation();
        const code = favBtn.getAttribute('data-code');
        if (currencyServiceInstance && code) {
          if (currencyServiceInstance.isFavorite(code)) {
            currencyServiceInstance.removeFromFavorites(code);
          } else {
            currencyServiceInstance.addToFavorites(code);
          }
          renderCurrencyRates();
        }
      }
    });
  }

  // Currency Favorites screen
  if (currencyFavoritesBackButton) {
    currencyFavoritesBackButton.addEventListener('click', closeCurrencyFavorites);
  }
  if (currencyFavoritesModal) {
    currencyFavoritesModal.addEventListener('click', (e) => {
      if (e.target === currencyFavoritesModal) closeCurrencyFavorites();
    });
  }
  if (currencyFavoritesList) {
    currencyFavoritesList.addEventListener('click', (e) => {
      const favBtn = e.target.closest('.currency-favorites-fav');
      if (favBtn) {
        e.preventDefault();
        e.stopPropagation();
        const code = favBtn.getAttribute('data-code');
        if (currencyServiceInstance && code) {
          if (currencyServiceInstance.isFavorite(code)) {
            currencyServiceInstance.removeFromFavorites(code);
          } else {
            currencyServiceInstance.addToFavorites(code);
          }
          renderCurrencyFavorites();
        }
      }
    });
  }


  // Keyboard
  document.addEventListener('keydown', handleKeydown);

  // Window resize for viewport height
  window.addEventListener('resize', syncViewportHeight);
}

// ============================================================
// INITIALIZE
// ============================================================
function initialize() {
  // Load stored language
  const savedLanguage = getLocaleFromStorage();
  state.locale = savedLanguage;

  // Load persisted App Sounds / Sound Profile / Speaker preferences
  loadSoundPreferences();

  // Set initial language
  if (languageSelect) languageSelect.value = state.locale;
  if (topBarLanguageSelect) topBarLanguageSelect.value = state.locale;

  // Initialize theme
  setTheme('dark');

  // Update texts
  updateTexts();

  // Set RTL if needed
  const html = document.documentElement;
  html.lang = state.locale;
  html.dir = state.locale === 'ar' ? 'rtl' : 'ltr';
  document.body.setAttribute('data-language', state.locale);
  state.isRTL = state.locale === 'ar';

  // Load history (also removes expired entries on startup)
  loadHistory();
  cleanupExpiredHistory();
  renderHistory();
  // Refresh countdown timers on startup
  startHistoryCountdown();
  updateHistoryCountdown();

  // Load notes
  loadNoteData();
  loadQuickNotes();

  // Wire events
  wireEvents();

  // Initialize Calculator Manager with the Standard Calculator mode
  const calculatorManager = getCalculatorManager();
  standardCalculator = new StandardCalculator();
  standardCalculator.state = state;
  standardCalculator.translations = translations;
  standardCalculator.locale = state.locale;
  standardCalculator.feedback = triggerButtonFeedback;
  // Preserve the app's history, speech and error/toast integrations exactly by
  // delegating their side-effects back to the existing app functions.
  standardCalculator.onAddHistory = addHistory;
  standardCalculator.onSpeak = speakCurrentResult;
  standardCalculator.onError = () => showToast('Error');
  calculatorManager.registerMode('general', standardCalculator);
  calculatorManager.bindModeSwitchButtons((modeName) => {
    calculatorManager.switchMode(modeName);
  });
  calculatorManager.switchMode('general');

  // Wire the shared history engine to the app's renderHistory for backward compatibility
  const sharedHistory = getHistoryEngine();
  sharedHistory.setOnChange(() => {
    renderHistory();
  });

  // Init currency in background (non-blocking)
  initializeCurrencyServiceInBackground();

  // Register service worker
  registerServiceWorker();

  // Sync viewport height
  syncViewportHeight();

  // Set display initial values
  updatePrimaryDisplay();
  updateSecondaryDisplay();
  updateExpressionDisplay();
}

// Guard for browser environment - only run initialize in browser
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initialize);
}