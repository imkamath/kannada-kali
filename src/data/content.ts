// Course content. Every item carries English, Hindi, Marathi and Kannada,
// plus a Roman transliteration of the Kannada.
// NOTE: have a native Kannada / Hindi / Marathi speaker review before release.

export type Lang = 'en' | 'hi' | 'mr' | 'kn';
export type BaseLang = 'en' | 'hi' | 'mr';

export interface Item {
  en: string;
  hi: string;
  mr: string;
  kn: string;
  roman: string;
  digit?: number; // for number items
}

export interface Unit {
  id: string;
  title: Record<Lang, string>;
  icon: string; // short glyph shown on the tile
  kind: 'words' | 'numbers';
  items: Item[];
}

const knDigits = ['೦', '೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯'];
export const toKannadaDigits = (n: number) =>
  String(n)
    .split('')
    .map((d) => knDigits[Number(d)] ?? d)
    .join('');

const num = (d: number, kn: string, roman: string, en: string, hi: string, mr: string): Item => ({
  digit: d,
  kn,
  roman,
  en,
  hi,
  mr,
});

export const NUMBERS_1_10: Item[] = [
  num(1, 'ಒಂದು', 'ondu', 'one', 'एक', 'एक'),
  num(2, 'ಎರಡು', 'eraḍu', 'two', 'दो', 'दोन'),
  num(3, 'ಮೂರು', 'mūru', 'three', 'तीन', 'तीन'),
  num(4, 'ನಾಲ್ಕು', 'nālku', 'four', 'चार', 'चार'),
  num(5, 'ಐದು', 'aidu', 'five', 'पाँच', 'पाच'),
  num(6, 'ಆರು', 'āru', 'six', 'छह', 'सहा'),
  num(7, 'ಏಳು', 'ēḷu', 'seven', 'सात', 'सात'),
  num(8, 'ಎಂಟು', 'eṇṭu', 'eight', 'आठ', 'आठ'),
  num(9, 'ಒಂಬತ್ತು', 'ombattu', 'nine', 'नौ', 'नऊ'),
  num(10, 'ಹತ್ತು', 'hattu', 'ten', 'दस', 'दहा'),
];

export const NUMBERS_11_20: Item[] = [
  num(11, 'ಹನ್ನೊಂದು', 'hannondu', 'eleven', 'ग्यारह', 'अकरा'),
  num(12, 'ಹನ್ನೆರಡು', 'hanneraḍu', 'twelve', 'बारह', 'बारा'),
  num(13, 'ಹದಿಮೂರು', 'hadimūru', 'thirteen', 'तेरह', 'तेरा'),
  num(14, 'ಹದಿನಾಲ್ಕು', 'hadinālku', 'fourteen', 'चौदह', 'चौदा'),
  num(15, 'ಹದಿನೈದು', 'hadinaidu', 'fifteen', 'पंद्रह', 'पंधरा'),
  num(16, 'ಹದಿನಾರು', 'hadināru', 'sixteen', 'सोलह', 'सोळा'),
  num(17, 'ಹದಿನೇಳು', 'hadinēḷu', 'seventeen', 'सत्रह', 'सतरा'),
  num(18, 'ಹದಿನೆಂಟು', 'hadineṇṭu', 'eighteen', 'अठारह', 'अठरा'),
  num(19, 'ಹತ್ತೊಂಬತ್ತು', 'hattombattu', 'nineteen', 'उन्नीस', 'एकोणीस'),
  num(20, 'ಇಪ್ಪತ್ತು', 'ippattu', 'twenty', 'बीस', 'वीस'),
];

export const NUMBERS_TENS: Item[] = [
  num(10, 'ಹತ್ತು', 'hattu', 'ten', 'दस', 'दहा'),
  num(20, 'ಇಪ್ಪತ್ತು', 'ippattu', 'twenty', 'बीस', 'वीस'),
  num(30, 'ಮೂವತ್ತು', 'mūvattu', 'thirty', 'तीस', 'तीस'),
  num(40, 'ನಲವತ್ತು', 'nalavattu', 'forty', 'चालीस', 'चाळीस'),
  num(50, 'ಐವತ್ತು', 'aivattu', 'fifty', 'पचास', 'पन्नास'),
  num(60, 'ಅರವತ್ತು', 'aravattu', 'sixty', 'साठ', 'साठ'),
  num(70, 'ಎಪ್ಪತ್ತು', 'eppattu', 'seventy', 'सत्तर', 'सत्तर'),
  num(80, 'ಎಂಬತ್ತು', 'embattu', 'eighty', 'अस्सी', 'ऐंशी'),
  num(90, 'ತೊಂಬತ್ತು', 'tombattu', 'ninety', 'नब्बे', 'नव्वद'),
  num(100, 'ನೂರು', 'nūru', 'one hundred', 'सौ', 'शंभर'),
  num(1000, 'ಸಾವಿರ', 'sāvira', 'one thousand', 'हज़ार', 'हजार'),
];

export const MONEY_TIME: Item[] = [
  { en: 'Rupee', hi: 'रुपया', mr: 'रुपया', kn: 'ರೂಪಾಯಿ', roman: 'rūpāyi' },
  { en: 'Ten rupees (₹10)', hi: 'दस रुपये', mr: 'दहा रुपये', kn: 'ಹತ್ತು ರೂಪಾಯಿ', roman: 'hattu rūpāyi' },
  { en: 'Fifty rupees (₹50)', hi: 'पचास रुपये', mr: 'पन्नास रुपये', kn: 'ಐವತ್ತು ರೂಪಾಯಿ', roman: 'aivattu rūpāyi' },
  { en: 'Hundred rupees (₹100)', hi: 'सौ रुपये', mr: 'शंभर रुपये', kn: 'ನೂರು ರೂಪಾಯಿ', roman: 'nūru rūpāyi' },
  { en: 'How much?', hi: 'कितना?', mr: 'किती?', kn: 'ಎಷ್ಟು?', roman: 'eṣṭu?' },
  { en: 'What time is it?', hi: 'कितने बजे हैं?', mr: 'किती वाजले?', kn: 'ಎಷ್ಟು ಗಂಟೆ?', roman: 'eṣṭu gaṇṭe?' },
  { en: 'Hour / o’clock', hi: 'बजे / घंटा', mr: 'वाजता / तास', kn: 'ಗಂಟೆ', roman: 'gaṇṭe' },
  { en: 'Minute', hi: 'मिनट', mr: 'मिनिट', kn: 'ನಿಮಿಷ', roman: 'nimiṣa' },
];

export const UNITS: Unit[] = [
  {
    id: 'greetings',
    icon: 'ನ',
    kind: 'words',
    title: { en: 'Greetings', hi: 'अभिवादन', mr: 'अभिवादन', kn: 'ಶುಭಾಶಯಗಳು' },
    items: [
      { en: 'Hello', hi: 'नमस्ते', mr: 'नमस्कार', kn: 'ನಮಸ್ಕಾರ', roman: 'namaskāra' },
      { en: 'Thank you', hi: 'धन्यवाद', mr: 'धन्यवाद', kn: 'ಧನ್ಯವಾದ', roman: 'dhanyavāda' },
      { en: 'Yes', hi: 'हाँ', mr: 'हो', kn: 'ಹೌದು', roman: 'haudu' },
      { en: 'No', hi: 'नहीं', mr: 'नाही', kn: 'ಇಲ್ಲ', roman: 'illa' },
      { en: 'Please', hi: 'कृपया', mr: 'कृपया', kn: 'ದಯವಿಟ್ಟು', roman: 'dayaviṭṭu' },
      { en: 'Sorry', hi: 'माफ़ कीजिए', mr: 'माफ करा', kn: 'ಕ್ಷಮಿಸಿ', roman: 'kṣamisi' },
      { en: 'Okay', hi: 'ठीक है', mr: 'ठीक आहे', kn: 'ಸರಿ', roman: 'sari' },
      { en: 'How are you?', hi: 'आप कैसे हैं?', mr: 'तुम्ही कसे आहात?', kn: 'ನೀವು ಹೇಗಿದ್ದೀರಿ?', roman: 'nīvu hēgiddīri?' },
      { en: 'I am fine', hi: 'मैं ठीक हूँ', mr: 'मी ठीक आहे', kn: 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ', roman: 'nānu cennāgiddēne' },
      { en: 'See you again', hi: 'फिर मिलेंगे', mr: 'पुन्हा भेटू', kn: 'ಮತ್ತೆ ಸಿಗೋಣ', roman: 'matte sigōṇa' },
    ],
  },
  {
    id: 'intro',
    icon: 'ಹೆ',
    kind: 'words',
    title: { en: 'Introduce yourself', hi: 'अपना परिचय', mr: 'स्वतःची ओळख', kn: 'ಪರಿಚಯ' },
    items: [
      { en: 'I', hi: 'मैं', mr: 'मी', kn: 'ನಾನು', roman: 'nānu' },
      { en: 'You (polite)', hi: 'आप', mr: 'तुम्ही', kn: 'ನೀವು', roman: 'nīvu' },
      { en: 'My name is…', hi: 'मेरा नाम … है', mr: 'माझे नाव … आहे', kn: 'ನನ್ನ ಹೆಸರು…', roman: 'nanna hesaru…' },
      { en: 'What is your name?', hi: 'आपका नाम क्या है?', mr: 'तुमचे नाव काय आहे?', kn: 'ನಿಮ್ಮ ಹೆಸರು ಏನು?', roman: 'nimma hesaru ēnu?' },
      { en: 'Where are you from?', hi: 'आप कहाँ से हैं?', mr: 'तुम्ही कुठले आहात?', kn: 'ನೀವು ಎಲ್ಲಿಯವರು?', roman: 'nīvu elliyavaru?' },
      { en: 'Friend', hi: 'दोस्त', mr: 'मित्र', kn: 'ಸ್ನೇಹಿತ', roman: 'snēhita' },
      { en: 'I know a little Kannada', hi: 'मुझे थोड़ी कन्नड़ आती है', mr: 'मला थोडं कन्नड येतं', kn: 'ನನಗೆ ಸ್ವಲ್ಪ ಕನ್ನಡ ಬರುತ್ತೆ', roman: 'nanage swalpa kannaḍa barutte' },
      { en: "I don't know Kannada", hi: 'मुझे कन्नड़ नहीं आती', mr: 'मला कन्नड येत नाही', kn: 'ನನಗೆ ಕನ್ನಡ ಬರಲ್ಲ', roman: 'nanage kannaḍa baralla' },
    ],
  },
  {
    id: 'num1',
    icon: '೧೨೩',
    kind: 'numbers',
    title: { en: 'Numbers 1–10', hi: 'संख्या 1–10', mr: 'संख्या 1–10', kn: 'ಸಂಖ್ಯೆಗಳು 1–10' },
    items: NUMBERS_1_10,
  },
  {
    id: 'food',
    icon: 'ಊ',
    kind: 'words',
    title: { en: 'Food & drink', hi: 'खाना-पीना', mr: 'खाणं-पिणं', kn: 'ಊಟ ತಿಂಡಿ' },
    items: [
      { en: 'Water', hi: 'पानी', mr: 'पाणी', kn: 'ನೀರು', roman: 'nīru' },
      { en: 'Milk', hi: 'दूध', mr: 'दूध', kn: 'ಹಾಲು', roman: 'hālu' },
      { en: 'Meal', hi: 'खाना', mr: 'जेवण', kn: 'ಊಟ', roman: 'ūṭa' },
      { en: 'Fruit', hi: 'फल', mr: 'फळ', kn: 'ಹಣ್ಣು', roman: 'haṇṇu' },
      { en: 'Rice', hi: 'चावल', mr: 'भात', kn: 'ಅನ್ನ', roman: 'anna' },
      { en: 'Coffee', hi: 'कॉफ़ी', mr: 'कॉफी', kn: 'ಕಾಫಿ', roman: 'kāphi' },
      { en: 'Tea', hi: 'चाय', mr: 'चहा', kn: 'ಟೀ', roman: 'ṭī' },
      { en: 'It is tasty', hi: 'स्वादिष्ट है', mr: 'चविष्ट आहे', kn: 'ರುಚಿಯಾಗಿದೆ', roman: 'ruciyāgide' },
      { en: 'Enough', hi: 'बस', mr: 'पुरे', kn: 'ಸಾಕು', roman: 'sāku' },
      { en: 'A little', hi: 'थोड़ा', mr: 'थोडं', kn: 'ಸ್ವಲ್ಪ', roman: 'swalpa' },
    ],
  },
  {
    id: 'num2',
    icon: '೨೦',
    kind: 'numbers',
    title: { en: 'Numbers 11–20', hi: 'संख्या 11–20', mr: 'संख्या 11–20', kn: 'ಸಂಖ್ಯೆಗಳು 11–20' },
    items: NUMBERS_11_20,
  },
  {
    id: 'around',
    icon: 'ಎ',
    kind: 'words',
    title: { en: 'Getting around', hi: 'आना-जाना', mr: 'प्रवास', kn: 'ಓಡಾಟ' },
    items: [
      { en: 'Where is it?', hi: 'कहाँ है?', mr: 'कुठे आहे?', kn: 'ಎಲ್ಲಿದೆ?', roman: 'ellide?' },
      { en: 'Left', hi: 'बाएँ', mr: 'डावीकडे', kn: 'ಎಡಕ್ಕೆ', roman: 'eḍakke' },
      { en: 'Right', hi: 'दाएँ', mr: 'उजवीकडे', kn: 'ಬಲಕ್ಕೆ', roman: 'balakke' },
      { en: 'Straight', hi: 'सीधा', mr: 'सरळ', kn: 'ನೇರವಾಗಿ', roman: 'nēravāgi' },
      { en: 'Stop here', hi: 'यहाँ रुकिए', mr: 'इथे थांबा', kn: 'ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ', roman: 'illi nillisi' },
      { en: 'Bus stop', hi: 'बस स्टॉप', mr: 'बस थांबा', kn: 'ಬಸ್ ನಿಲ್ದಾಣ', roman: 'bas nildāṇa' },
      { en: 'Come', hi: 'आइए', mr: 'या', kn: 'ಬನ್ನಿ', roman: 'banni' },
      { en: 'Go', hi: 'जाइए', mr: 'जा', kn: 'ಹೋಗಿ', roman: 'hōgi' },
      { en: 'Slowly', hi: 'धीरे', mr: 'हळू', kn: 'ನಿಧಾನವಾಗಿ', roman: 'nidhānavāgi' },
    ],
  },
  {
    id: 'num3',
    icon: '೧೦೦',
    kind: 'numbers',
    title: { en: 'Tens to 1000', hi: 'दहाई से हज़ार', mr: 'दहा ते हजार', kn: 'ಹತ್ತರಿಂದ ಸಾವಿರ' },
    items: NUMBERS_TENS,
  },
  {
    id: 'money',
    icon: '₹',
    kind: 'words',
    title: { en: 'Money & time', hi: 'पैसे और समय', mr: 'पैसे आणि वेळ', kn: 'ಹಣ ಮತ್ತು ಸಮಯ' },
    items: MONEY_TIME,
  },
];

export interface PhraseCategory {
  id: string;
  title: Record<Lang, string>;
  items: Item[];
}

export const PHRASES: PhraseCategory[] = [
  {
    id: 'auto',
    title: { en: 'Auto-rickshaw', hi: 'ऑटो', mr: 'रिक्षा', kn: 'ಆಟೋ' },
    items: [
      { en: 'Put the meter on', hi: 'मीटर लगाइए', mr: 'मीटर टाका', kn: 'ಮೀಟರ್ ಹಾಕಿ', roman: 'mīṭar hāki' },
      { en: 'Will you come to …?', hi: '… चलेंगे?', mr: '… ला येणार का?', kn: '…ಗೆ ಬರ್ತೀರಾ?', roman: '…ge bartīrā?' },
      { en: 'Stop here', hi: 'यहाँ रुकिए', mr: 'इथे थांबा', kn: 'ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ', roman: 'illi nillisi' },
      { en: 'Turn left', hi: 'बाएँ मुड़िए', mr: 'डावीकडे वळा', kn: 'ಎಡಕ್ಕೆ ತಿರುಗಿ', roman: 'eḍakke tirugi' },
      { en: 'Turn right', hi: 'दाएँ मुड़िए', mr: 'उजवीकडे वळा', kn: 'ಬಲಕ್ಕೆ ತಿರುಗಿ', roman: 'balakke tirugi' },
      { en: 'Go slowly', hi: 'धीरे चलिए', mr: 'हळू चला', kn: 'ನಿಧಾನವಾಗಿ ಹೋಗಿ', roman: 'nidhānavāgi hōgi' },
    ],
  },
  {
    id: 'market',
    title: { en: 'Market', hi: 'बाज़ार', mr: 'बाजार', kn: 'ಮಾರುಕಟ್ಟೆ' },
    items: [
      { en: 'How much is this?', hi: 'यह कितने का है?', mr: 'हे किती आहे?', kn: 'ಇದು ಎಷ್ಟು?', roman: 'idu eṣṭu?' },
      { en: 'Too expensive', hi: 'बहुत महँगा है', mr: 'खूप महाग आहे', kn: 'ತುಂಬಾ ದುಬಾರಿ', roman: 'tumbā dubāri' },
      { en: 'Reduce it a little', hi: 'थोड़ा कम कीजिए', mr: 'थोडं कमी करा', kn: 'ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ', roman: 'swalpa kaḍime māḍi' },
      { en: 'Give me one kilo', hi: 'एक किलो दीजिए', mr: 'एक किलो द्या', kn: 'ಒಂದು ಕೆಜಿ ಕೊಡಿ', roman: 'ondu keji koḍi' },
      { en: 'I want this', hi: 'मुझे यह चाहिए', mr: 'मला हे हवं आहे', kn: 'ನನಗೆ ಇದು ಬೇಕು', roman: 'nanage idu bēku' },
      { en: "Don't want", hi: 'नहीं चाहिए', mr: 'नको', kn: 'ಬೇಡ', roman: 'bēḍa' },
    ],
  },
  {
    id: 'office',
    title: { en: 'Office', hi: 'दफ़्तर', mr: 'ऑफिस', kn: 'ಕಚೇರಿ' },
    items: [
      { en: 'Good morning', hi: 'सुप्रभात', mr: 'सुप्रभात', kn: 'ಶುಭೋದಯ', roman: 'śubhōdaya' },
      { en: 'One minute, please', hi: 'एक मिनट', mr: 'एक मिनिट', kn: 'ಒಂದು ನಿಮಿಷ', roman: 'ondu nimiṣa' },
      { en: 'I will come tomorrow', hi: 'मैं कल आऊँगा', mr: 'मी उद्या येईन', kn: 'ನಾನು ನಾಳೆ ಬರುತ್ತೇನೆ', roman: 'nānu nāḷe baruttēne' },
      { en: 'What time is the meeting?', hi: 'मीटिंग कितने बजे है?', mr: 'मीटिंग किती वाजता आहे?', kn: 'ಮೀಟಿಂಗ್ ಎಷ್ಟು ಗಂಟೆಗೆ?', roman: 'mīṭiṅg eṣṭu gaṇṭege?' },
      { en: "I didn't understand", hi: 'मुझे समझ नहीं आया', mr: 'मला समजलं नाही', kn: 'ನನಗೆ ಅರ್ಥ ಆಗಲಿಲ್ಲ', roman: 'nanage artha āgalilla' },
      { en: 'Please say it again', hi: 'फिर से बोलिए', mr: 'पुन्हा सांगा', kn: 'ದಯವಿಟ್ಟು ಮತ್ತೆ ಹೇಳಿ', roman: 'dayaviṭṭu matte hēḷi' },
    ],
  },
  {
    id: 'hospital',
    title: { en: 'Hospital', hi: 'अस्पताल', mr: 'दवाखाना', kn: 'ಆಸ್ಪತ್ರೆ' },
    items: [
      { en: 'I need a doctor', hi: 'मुझे डॉक्टर चाहिए', mr: 'मला डॉक्टर हवा आहे', kn: 'ನನಗೆ ಡಾಕ್ಟರ್ ಬೇಕು', roman: 'nanage ḍākṭar bēku' },
      { en: 'Where is the hospital?', hi: 'अस्पताल कहाँ है?', mr: 'दवाखाना कुठे आहे?', kn: 'ಆಸ್ಪತ್ರೆ ಎಲ್ಲಿದೆ?', roman: 'āspatre ellide?' },
      { en: 'I have a fever', hi: 'मुझे बुखार है', mr: 'मला ताप आहे', kn: 'ನನಗೆ ಜ್ವರ ಇದೆ', roman: 'nanage jvara ide' },
      { en: 'It hurts here', hi: 'यहाँ दर्द है', mr: 'इथे दुखतं', kn: 'ಇಲ್ಲಿ ನೋವಾಗುತ್ತಿದೆ', roman: 'illi nōvāguttide' },
      { en: 'Medicine', hi: 'दवा', mr: 'औषध', kn: 'ಔಷಧಿ', roman: 'auṣadhi' },
      { en: 'Please help', hi: 'मदद कीजिए', mr: 'मदत करा', kn: 'ಸಹಾಯ ಮಾಡಿ', roman: 'sahāya māḍi' },
    ],
  },
];

export interface Letter {
  kn: string;
  deva: string; // nearest Devanagari letter
  roman: string;
  note?: string;
}

export const VOWELS: Letter[] = [
  { kn: 'ಅ', deva: 'अ', roman: 'a' },
  { kn: 'ಆ', deva: 'आ', roman: 'ā' },
  { kn: 'ಇ', deva: 'इ', roman: 'i' },
  { kn: 'ಈ', deva: 'ई', roman: 'ī' },
  { kn: 'ಉ', deva: 'उ', roman: 'u' },
  { kn: 'ಊ', deva: 'ऊ', roman: 'ū' },
  { kn: 'ಋ', deva: 'ऋ', roman: 'ṛ' },
  { kn: 'ಎ', deva: 'ए*', roman: 'e', note: 'short e — no separate Devanagari letter' },
  { kn: 'ಏ', deva: 'ए', roman: 'ē' },
  { kn: 'ಐ', deva: 'ऐ', roman: 'ai' },
  { kn: 'ಒ', deva: 'ओ*', roman: 'o', note: 'short o — no separate Devanagari letter' },
  { kn: 'ಓ', deva: 'ओ', roman: 'ō' },
  { kn: 'ಔ', deva: 'औ', roman: 'au' },
];

const cons = (kn: string, deva: string, roman: string, note?: string): Letter => ({ kn, deva, roman, note });

export const CONSONANTS: Letter[] = [
  cons('ಕ', 'क', 'ka'), cons('ಖ', 'ख', 'kha'), cons('ಗ', 'ग', 'ga'), cons('ಘ', 'घ', 'gha'), cons('ಙ', 'ङ', 'ṅa'),
  cons('ಚ', 'च', 'ca'), cons('ಛ', 'छ', 'cha'), cons('ಜ', 'ज', 'ja'), cons('ಝ', 'झ', 'jha'), cons('ಞ', 'ञ', 'ña'),
  cons('ಟ', 'ट', 'ṭa'), cons('ಠ', 'ठ', 'ṭha'), cons('ಡ', 'ड', 'ḍa'), cons('ಢ', 'ढ', 'ḍha'), cons('ಣ', 'ण', 'ṇa'),
  cons('ತ', 'त', 'ta'), cons('ಥ', 'थ', 'tha'), cons('ದ', 'द', 'da'), cons('ಧ', 'ध', 'dha'), cons('ನ', 'न', 'na'),
  cons('ಪ', 'प', 'pa'), cons('ಫ', 'फ', 'pha'), cons('ಬ', 'ब', 'ba'), cons('ಭ', 'भ', 'bha'), cons('ಮ', 'म', 'ma'),
  cons('ಯ', 'य', 'ya'), cons('ರ', 'र', 'ra'), cons('ಲ', 'ल', 'la'), cons('ವ', 'व', 'va'), cons('ಶ', 'श', 'śa'),
  cons('ಷ', 'ष', 'ṣa'), cons('ಸ', 'स', 'sa'), cons('ಹ', 'ह', 'ha'), cons('ಳ', 'ळ', 'ḷa', 'same sound as Marathi ळ'),
];

// Sentences used on the Speak screen.
export const SPEAK_SENTENCES: Item[] = [
  UNITS[1].items[3],
  UNITS[0].items[7],
  UNITS[0].items[8],
  PHRASES[1].items[0],
  UNITS[0].items[1],
  PHRASES[2].items[4],
];
