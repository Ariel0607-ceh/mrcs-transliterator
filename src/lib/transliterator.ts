// MRCS Transliterator Pro - Exact conversion logic from Python
// This file contains the EXACT conversion logic from the Python code
// No modifications to the transliteration rules

// Global flag for transliteration mode
let useHighClassCoptic = true;

// Global flag to track if the Coptic number explanation message has been shown
let copticNumberMessageShown = false;

// Custom dictionary that can be modified by users
let customDictionary: Record<string, string> = {};

// Load custom dictionary from localStorage
export function loadCustomDictionary(): void {
  const saved = localStorage.getItem('mrcs-custom-dictionary');
  if (saved) {
    try {
      customDictionary = JSON.parse(saved);
    } catch {
      customDictionary = {};
    }
  }
}

// Save custom dictionary to localStorage
export function saveCustomDictionary(): void {
  localStorage.setItem('mrcs-custom-dictionary', JSON.stringify(customDictionary));
}

// Add entry to custom dictionary
export function addDictionaryEntry(key: string, value: string): { success: boolean; message: string } {
  // Check for empty inputs
  if (!key.trim() || !value.trim()) {
    return { success: false, message: 'Both word and transliteration are required' };
  }

  // Check for duplicates in custom dictionary
  if (key in customDictionary) {
    return { success: false, message: `Entry "${key}" already exists in dictionary` };
  }

  // Check for duplicates in built-in dictionary
  const builtInDict = getBuiltInDictionary();
  if (key in builtInDict) {
    return { success: false, message: `Entry "${key}" already exists in built-in dictionary` };
  }

  // Add entry
  customDictionary[key] = value;
  saveCustomDictionary();
  return { success: true, message: `Entry "${key}" added successfully` };
}

// Remove entry from custom dictionary
export function removeDictionaryEntry(key: string): void {
  delete customDictionary[key];
  saveCustomDictionary();
}

// Get all dictionary entries (built-in + custom)
export function getAllDictionaryEntries(): Record<string, string> {
  return { ...getBuiltInDictionary(), ...customDictionary };
}

// Get only custom dictionary entries
export function getCustomDictionaryEntries(): Record<string, string> {
  return { ...customDictionary };
}

// Function to get the current mode
export function getMode(): boolean {
  return useHighClassCoptic;
}

// Function to set the mode
export function setMode(highClass: boolean): void {
  useHighClassCoptic = highClass;
}

// Function to reset the Coptic number explanation message flag
export function resetCopticNumberMessage(): void {
  copticNumberMessageShown = false;
}

// Function to get and reset the Coptic number message flag
export function getAndResetCopticNumberMessage(): boolean {
  const wasShown = copticNumberMessageShown;
  copticNumberMessageShown = true;
  return wasShown;
}

// Function to preprocess the input and normalize specific patterns
export function preprocessInput(text: string): string {
  // Replace uppercase consonant clusters with proper capitalization
  const replacements: Record<string, string> = {
    'GH': 'Gh',
    'NG': 'Ng',
    'NY': 'Ny',
    'KH': 'Kh',
    'DH': 'Dh',
    'SY': 'Sy',
    'SH': 'Sy',
    'TH': 'Th'
  };

  for (const [pattern, replacement] of Object.entries(replacements)) {
    text = text.replace(new RegExp(`\\b${pattern}\\b`, 'g'), replacement);
  }

  // Handle lowercase 'sh' and capitalize 'Sh'
  text = text.replace(/\bsh\b/g, 'sy'); // Match lowercase 'sh'
  text = text.replace(/\bSh\b/g, 'Sy'); // Match uppercase 'Sh'

  return text;
}

// Coptic numeral mappings
const copticUnits: Record<number, string> = {
  1: 'ⲁ1',
  2: 'ⲃ1',
  3: 'ⲅ1',
  4: 'ⲇ1',
  5: 'ⲉ1',
  6: 'ⲋ1',
  7: 'ⲍ1',
  8: 'ⲏ1',
  9: 'ⲑ1'
};

const copticTens: Record<number, string> = {
  10: 'ⲓ1',
  20: 'ⲕ1',
  30: 'ⲗ1',
  40: 'ⲙ1',
  50: 'ⲛ1',
  60: 'ⲝ1',
  70: 'ⲟ1',
  80: 'ⲡ1',
  90: 'ϥ1'
};

const copticHundreds: Record<number, string> = {
  100: 'ⲣ1',
  200: 'ⲥ1',
  300: 'ⲧ1',
  400: 'ⲩ1',
  500: 'ⲫ1',
  600: 'ⲭ1',
  700: 'ⲯ1',
  800: 'ⲱ1',
  900: 'ϣ1'
};

const copticThousands: Record<number, string> = {
  1000: 'ⲁ2',
  2000: 'ⲃ2',
  3000: 'ⲅ2',
  4000: 'ⲇ2',
  5000: 'ⲉ2',
  6000: 'ⲋ2',
  7000: 'ⲍ2',
  8000: 'ⲏ2',
  9000: 'ⲑ2'
};

const copticTenThousands: Record<number, string> = {
  10000: 'ⲓ2',
  20000: 'ⲕ2',
  30000: 'ⲗ2',
  40000: 'ⲙ2',
  50000: 'ⲛ2',
  60000: 'ⲝ2',
  70000: 'ⲟ2',
  80000: 'ⲡ2',
  90000: 'ϥ2'
};

const copticHundredThousands: Record<number, string> = {
  100000: 'ⲣ2',
  200000: 'ⲥ2',
  300000: 'ⲧ2',
  400000: 'ⲩ2',
  500000: 'ⲫ2',
  600000: 'ⲭ2',
  700000: 'ⲯ2',
  800000: 'ⲱ2',
  900000: 'ϣ2'
};

const copticMillion: Record<number, string> = {
  1000000: 'ⲁ3'
};

// Helper function to convert a part of the number
function convertPart(value: number, mapping: Record<number, string>): string {
  return mapping[value] || '';
}

// Function to convert number to Coptic numerals
export function numberToCoptic(number: number): { result: string; showMessage: boolean } {
  if (number < 1 || number > 1000000) {
    return {
      result: '\nWarning: Number out of range (1-1000000)\nPlease enter a number between 1 and 1,000,000.',
      showMessage: false
    };
  }

  const parts: string[] = [];
  let remaining = number;

  if (remaining >= 1000000) {
    parts.push(convertPart(1000000, copticMillion));
    remaining -= 1000000;
  }
  if (remaining >= 100000) {
    const hundredThousands = Math.floor(remaining / 100000) * 100000;
    parts.push(convertPart(hundredThousands, copticHundredThousands));
    remaining -= hundredThousands;
  }
  if (remaining >= 10000) {
    const tenThousands = Math.floor(remaining / 10000) * 10000;
    parts.push(convertPart(tenThousands, copticTenThousands));
    remaining -= tenThousands;
  }
  if (remaining >= 1000) {
    const thousands = Math.floor(remaining / 1000) * 1000;
    parts.push(convertPart(thousands, copticThousands));
    remaining -= thousands;
  }
  if (remaining >= 100) {
    const hundreds = Math.floor(remaining / 100) * 100;
    parts.push(convertPart(hundreds, copticHundreds));
    remaining -= hundreds;
  }
  if (remaining >= 10) {
    const tens = Math.floor(remaining / 10) * 10;
    parts.push(convertPart(tens, copticTens));
    remaining -= tens;
  }
  if (remaining > 0) {
    parts.push(convertPart(remaining, copticUnits));
  }

  const showMessage = !copticNumberMessageShown;
  copticNumberMessageShown = true;

  return {
    result: parts.join(''),
    showMessage
  };
}

// Original specific mappings for special characters (EXACT from Python)
const melayuToRcs: Record<string, string> = {
  // Lowercase letters
  a: 'ⲁ',
  b: 'ⲃ',
  c: 'ϭ',
  d: 'ⲇ',
  e: 'ⲉ',
  f: 'ϥ',
  g: 'ⲅ',
  h: 'ϩ',
  i: 'ⲓ',
  j: 'ϫ',
  k: 'ⲕ',
  l: 'ⲗ',
  m: 'ⲙ',
  n: 'ⲛ',
  o: 'ⲟ',
  p: 'ⲡ',
  q: 'ϧ',
  r: 'ⲣ',
  s: 'ⲥ',
  t: 'ⲧ',
  u: 'ⲩ',
  v: 'ⲫ',
  w: 'ⲱ',
  x: 'ⲝ',
  y: 'ⲏ',
  z: 'ⲍ',

  // Uppercase letters
  A: 'Ⲁ',
  B: 'Ⲃ',
  C: 'Ϭ',
  D: 'Ⲇ',
  E: 'Ⲉ',
  F: 'Ϥ',
  G: 'Ⲅ',
  H: 'Ϩ',
  I: 'Ⲓ',
  J: 'Ϫ',
  K: 'Ⲕ',
  L: 'Ⲗ',
  M: 'Ⲙ',
  N: 'Ⲛ',
  O: 'Ⲟ',
  P: 'Ⲡ',
  Q: 'Ϧ',
  R: 'Ⲣ',
  S: 'Ⲥ',
  T: 'Ⲧ',
  U: 'Ⲩ',
  V: 'Ⲫ',
  W: 'Ⲱ',
  X: 'Ⲝ',
  Y: 'Ⲏ',
  Z: 'Ⲍ',

  // Digits (empty mappings)
  '1': '',
  '2': '',
  '3': '',
  '4': '',
  '5': '',
  '6': '',
  '7': '',
  '8': '',
  '9': '',
  '0': '',

  // Special characters
  '`': '`',
  '-': '-',
  '=': '=',
  '[': '[',
  '~': '~',
  '!': '!',
  '@': '@',
  '#': '#',
  $: '$',
  '%': '%',
  '^': '^',
  '&': '&',
  '*': '*',
  '(': '(',
  ')': ')',
  '+': '+',
  '{': '{',
  '}': '}',
  '|': '|',
  ':': ':',
  '"': '"',
  '<': '<',
  '>': '>',
  '?': '?',
  _: '_',
  ']': ']',
  '\\': '\\',
  ';': ';',
  "'": "'",
  ',': ',',
  '.': '.',
  '/': '/',

  // Additional consonant mappings
  gh: 'ⳉ',
  ng: 'ⲋ',
  kh: 'ⲭ',
  dh: 'ⲑ',
  ch: 'ϭ',
  sy: 'ϣ',
  ny: 'ⲯ',
  th: 'ϯ',
  Gh: 'Ⳉ',
  Ng: 'Ⲋ',
  Kh: 'Ⲭ',
  Dh: 'Ⲑ',
  Ch: 'Ϭ',
  Sy: 'Ϣ',
  Ny: 'Ⲯ',
  Th: 'Ϯ'
};

// Built-in dictionary of words with direct transliteration (EXACT from Python)
const builtInDictionary: Record<string, string> = {
  sangha: 'ⲥⲁⲛⲅϩⲁ',
  Sangha: 'Ⲥⲁⲛⲅϩⲁ',
  SANGHA: 'ⲤⲀⲚⲄϨⲀ'
};

// Get built-in dictionary
function getBuiltInDictionary(): Record<string, string> {
  return { ...builtInDictionary };
}

// Function to transliterate a single word (EXACT logic from Python)
export function transliterateWord(word: string): { result: string; showNumberMessage: boolean } {
  const cleanedWord = word; // Use the input word

  // Check if input is a number
  if (/^\d+$/.test(cleanedWord)) {
    const number = parseInt(cleanedWord, 10);
    const { result, showMessage } = numberToCoptic(number);
    return { result, showNumberMessage: showMessage };
  }

  // Check custom dictionary FIRST (user entries take priority)
  if (cleanedWord in customDictionary) {
    return { result: customDictionary[cleanedWord], showNumberMessage: false };
  }

  // Check built-in dictionary for direct transliteration
  if (cleanedWord in builtInDictionary) {
    return { result: builtInDictionary[cleanedWord], showNumberMessage: false };
  }

  let transliterated = '';
  let i = 0;

  while (i < cleanedWord.length) {
    let matched = false;

    // Check multi-character mappings first (e.g., 'ng', 'gh') only if high-class mode is active
    if (useHighClassCoptic) {
      // Sort by length descending to match longest first
      const sortedMappings = Object.entries(melayuToRcs).sort(
        (a, b) => b[0].length - a[0].length
      );

      for (const [multiChar, replacement] of sortedMappings) {
        if (multiChar.length > 1 && cleanedWord.substring(i, i + multiChar.length) === multiChar) {
          transliterated += replacement;
          i += multiChar.length; // Skip over the matched characters
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      // No multi-character match, handle single characters
      const char = cleanedWord[i];
      transliterated += melayuToRcs[char] !== undefined ? melayuToRcs[char] : char;
      i += 1; // Move to the next character
    }
  }

  return { result: transliterated, showNumberMessage: false };
}

// Function to transliterate a sentence or paragraph (EXACT logic from Python)
export function transliterateSentence(sentence: string): {
  result: string;
  showNumberMessage: boolean;
} {
  // Reset the number message flag at the beginning of each transliteration
  resetCopticNumberMessage();

  // Preprocess the input
  const processedSentence = preprocessInput(sentence);

  // Split the sentence into words and non-words (like numbers, punctuation, etc.)
  // This regex matches either digits OR non-digits
  const tokens = processedSentence.split(/(\d+)/).filter((t) => t.length > 0);

  const transliteratedTokens: string[] = [];
  let showNumberMessage = false;

  for (const token of tokens) {
    if (/^\d+$/.test(token)) {
      // If the token is a number, transliterate it
      const number = parseInt(token, 10);
      const { result, showMessage } = numberToCoptic(number);
      transliteratedTokens.push(result);
      if (showMessage) showNumberMessage = true;
    } else {
      // Otherwise, transliterate it as words
      const words = token.split(/(\s+)/).filter((w) => w.length > 0);
      const transliteratedWords = words.map((word) => {
        if (/^\s+$/.test(word)) {
          return word; // Preserve whitespace
        }
        const { result } = transliterateWord(word);
        return result;
      });
      transliteratedTokens.push(transliteratedWords.join(''));
    }
  }

  return { result: transliteratedTokens.join(''), showNumberMessage };
}

// Get the key mapping manual
export function getKeyMapping(): Array<{ key: string; value: string }> {
  return Object.entries(melayuToRcs)
    .filter(([key]) => key.length === 1 && /[a-zA-Z]/.test(key))
    .map(([key, value]) => ({ key, value }));
}

// Get the multi-character mappings
export function getMultiCharMapping(): Array<{ key: string; value: string }> {
  return Object.entries(melayuToRcs)
    .filter(([key]) => key.length > 1)
    .map(([key, value]) => ({ key, value }));
}

// Get all dictionary entries (built-in + custom)
export function getDictionaryEntries(): Array<{ key: string; value: string }> {
  return Object.entries(getAllDictionaryEntries()).map(([key, value]) => ({ key, value }));
}

// Initialize - load custom dictionary on module load
loadCustomDictionary();
