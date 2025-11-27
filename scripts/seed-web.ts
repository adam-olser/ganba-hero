/**
 * Seed Firestore with sample vocabulary data using Firebase Web SDK
 * 
 * Run with: npx ts-node --esm scripts/seed-web.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample N5 vocabulary data
const N5_VOCABULARY = [
  {
    term: '食べる',
    reading: 'たべる',
    meaning: 'to eat',
    synonyms: ['eat', 'to consume'],
    readingSynonyms: ['taberu'],
    level: 'N5',
    order: 1,
    partOfSpeech: 'verb',
    exampleJapanese: '朝ごはんを食べる',
    exampleEnglish: 'I eat breakfast',
    tags: ['food', 'daily-life'],
  },
  {
    term: '飲む',
    reading: 'のむ',
    meaning: 'to drink',
    synonyms: ['drink'],
    readingSynonyms: ['nomu'],
    level: 'N5',
    order: 2,
    partOfSpeech: 'verb',
    exampleJapanese: '水を飲む',
    exampleEnglish: 'I drink water',
    tags: ['food', 'daily-life'],
  },
  {
    term: '行く',
    reading: 'いく',
    meaning: 'to go',
    synonyms: ['go'],
    readingSynonyms: ['iku'],
    level: 'N5',
    order: 3,
    partOfSpeech: 'verb',
    exampleJapanese: '学校に行く',
    exampleEnglish: 'I go to school',
    tags: ['movement'],
  },
  {
    term: '来る',
    reading: 'くる',
    meaning: 'to come',
    synonyms: ['come'],
    readingSynonyms: ['kuru'],
    level: 'N5',
    order: 4,
    partOfSpeech: 'verb',
    exampleJapanese: '友達が来る',
    exampleEnglish: 'A friend comes',
    tags: ['movement'],
  },
  {
    term: '見る',
    reading: 'みる',
    meaning: 'to see, to look, to watch',
    synonyms: ['see', 'look', 'watch'],
    readingSynonyms: ['miru'],
    level: 'N5',
    order: 5,
    partOfSpeech: 'verb',
    exampleJapanese: 'テレビを見る',
    exampleEnglish: 'I watch TV',
    tags: ['senses'],
  },
  {
    term: '聞く',
    reading: 'きく',
    meaning: 'to hear, to listen, to ask',
    synonyms: ['hear', 'listen', 'ask'],
    readingSynonyms: ['kiku'],
    level: 'N5',
    order: 6,
    partOfSpeech: 'verb',
    exampleJapanese: '音楽を聞く',
    exampleEnglish: 'I listen to music',
    tags: ['senses'],
  },
  {
    term: '読む',
    reading: 'よむ',
    meaning: 'to read',
    synonyms: ['read'],
    readingSynonyms: ['yomu'],
    level: 'N5',
    order: 7,
    partOfSpeech: 'verb',
    exampleJapanese: '本を読む',
    exampleEnglish: 'I read a book',
    tags: ['study'],
  },
  {
    term: '書く',
    reading: 'かく',
    meaning: 'to write',
    synonyms: ['write'],
    readingSynonyms: ['kaku'],
    level: 'N5',
    order: 8,
    partOfSpeech: 'verb',
    exampleJapanese: '手紙を書く',
    exampleEnglish: 'I write a letter',
    tags: ['study'],
  },
  {
    term: '話す',
    reading: 'はなす',
    meaning: 'to speak, to talk',
    synonyms: ['speak', 'talk'],
    readingSynonyms: ['hanasu'],
    level: 'N5',
    order: 9,
    partOfSpeech: 'verb',
    exampleJapanese: '日本語を話す',
    exampleEnglish: 'I speak Japanese',
    tags: ['communication'],
  },
  {
    term: '買う',
    reading: 'かう',
    meaning: 'to buy',
    synonyms: ['buy', 'purchase'],
    readingSynonyms: ['kau'],
    level: 'N5',
    order: 10,
    partOfSpeech: 'verb',
    exampleJapanese: '本を買う',
    exampleEnglish: 'I buy a book',
    tags: ['shopping'],
  },
  {
    term: '日本',
    reading: 'にほん',
    meaning: 'Japan',
    synonyms: ['Nippon'],
    readingSynonyms: ['nihon'],
    level: 'N5',
    order: 11,
    partOfSpeech: 'noun',
    exampleJapanese: '日本に住んでいます',
    exampleEnglish: 'I live in Japan',
    tags: ['country'],
  },
  {
    term: '人',
    reading: 'ひと',
    meaning: 'person, people',
    synonyms: ['person', 'people'],
    readingSynonyms: ['hito'],
    level: 'N5',
    order: 12,
    partOfSpeech: 'noun',
    exampleJapanese: 'あの人は誰ですか',
    exampleEnglish: 'Who is that person?',
    tags: ['people'],
  },
  {
    term: '水',
    reading: 'みず',
    meaning: 'water',
    synonyms: ['water'],
    readingSynonyms: ['mizu'],
    level: 'N5',
    order: 13,
    partOfSpeech: 'noun',
    exampleJapanese: '水をください',
    exampleEnglish: 'Please give me water',
    tags: ['food', 'nature'],
  },
  {
    term: '学校',
    reading: 'がっこう',
    meaning: 'school',
    synonyms: ['school'],
    readingSynonyms: ['gakkou'],
    level: 'N5',
    order: 14,
    partOfSpeech: 'noun',
    exampleJapanese: '学校は大きいです',
    exampleEnglish: 'The school is big',
    tags: ['education', 'place'],
  },
  {
    term: '友達',
    reading: 'ともだち',
    meaning: 'friend',
    synonyms: ['friend'],
    readingSynonyms: ['tomodachi'],
    level: 'N5',
    order: 15,
    partOfSpeech: 'noun',
    exampleJapanese: '友達と遊ぶ',
    exampleEnglish: 'I play with friends',
    tags: ['people'],
  },
  {
    term: '大きい',
    reading: 'おおきい',
    meaning: 'big, large',
    synonyms: ['big', 'large'],
    readingSynonyms: ['ookii'],
    level: 'N5',
    order: 16,
    partOfSpeech: 'adjective',
    exampleJapanese: '大きい犬',
    exampleEnglish: 'A big dog',
    tags: ['size'],
  },
  {
    term: '小さい',
    reading: 'ちいさい',
    meaning: 'small, little',
    synonyms: ['small', 'little'],
    readingSynonyms: ['chiisai'],
    level: 'N5',
    order: 17,
    partOfSpeech: 'adjective',
    exampleJapanese: '小さい猫',
    exampleEnglish: 'A small cat',
    tags: ['size'],
  },
  {
    term: '新しい',
    reading: 'あたらしい',
    meaning: 'new',
    synonyms: ['new', 'fresh'],
    readingSynonyms: ['atarashii'],
    level: 'N5',
    order: 18,
    partOfSpeech: 'adjective',
    exampleJapanese: '新しい本',
    exampleEnglish: 'A new book',
    tags: ['time'],
  },
  {
    term: 'いい',
    reading: 'いい',
    meaning: 'good, nice',
    synonyms: ['good', 'nice', 'fine'],
    readingSynonyms: ['ii', 'yoi'],
    level: 'N5',
    order: 19,
    partOfSpeech: 'adjective',
    exampleJapanese: 'いい天気',
    exampleEnglish: 'Good weather',
    tags: ['quality'],
  },
  {
    term: '今日',
    reading: 'きょう',
    meaning: 'today',
    synonyms: ['today'],
    readingSynonyms: ['kyou'],
    level: 'N5',
    order: 20,
    partOfSpeech: 'noun',
    exampleJapanese: '今日は何曜日ですか',
    exampleEnglish: 'What day is today?',
    tags: ['time'],
  },
];

// Sample N5 grammar points
const N5_GRAMMAR = [
  {
    pattern: 'です',
    meaning: 'is, am, are (polite copula)',
    level: 'N5',
    order: 1,
    explanation: 'です is the polite form of the copula, used to link a subject to a noun or adjective.',
    formation: 'Noun + です\nな-adjective + です',
    examples: [
      { japanese: '私は学生です。', reading: 'わたしはがくせいです。', english: 'I am a student.' },
      { japanese: 'これは本です。', reading: 'これはほんです。', english: 'This is a book.' },
    ],
    tags: ['copula', 'polite'],
  },
  {
    pattern: 'ます',
    meaning: 'polite verb ending',
    level: 'N5',
    order: 2,
    explanation: 'ます is the polite verb ending used in formal situations.',
    formation: 'Verb stem + ます',
    examples: [
      { japanese: '食べます', reading: 'たべます', english: 'eat (polite)' },
      { japanese: '日本語を勉強します。', reading: 'にほんごをべんきょうします。', english: 'I study Japanese.' },
    ],
    tags: ['verb', 'polite'],
  },
  {
    pattern: 'は (topic marker)',
    meaning: 'as for, speaking of',
    level: 'N5',
    order: 3,
    explanation: 'は marks the topic of a sentence. Pronounced "wa" as a particle.',
    formation: 'Noun + は',
    examples: [
      { japanese: '私は日本人です。', reading: 'わたしはにほんじんです。', english: 'I am Japanese.' },
    ],
    tags: ['particle', 'topic'],
  },
  {
    pattern: 'を (object marker)',
    meaning: 'object marker',
    level: 'N5',
    order: 4,
    explanation: 'を marks the direct object of a verb.',
    formation: 'Noun + を + Verb',
    examples: [
      { japanese: '水を飲みます。', reading: 'みずをのみます。', english: 'I drink water.' },
    ],
    tags: ['particle', 'object'],
  },
  {
    pattern: 'に (location/time)',
    meaning: 'at, in, on, to',
    level: 'N5',
    order: 5,
    explanation: 'に indicates a specific point in time or destination.',
    formation: 'Time/Place + に',
    examples: [
      { japanese: '7時に起きます。', reading: 'しちじにおきます。', english: 'I wake up at 7.' },
    ],
    tags: ['particle', 'location', 'time'],
  },
];

async function seedVocabulary() {
  console.log('Seeding vocabulary data...');
  
  for (let i = 0; i < N5_VOCABULARY.length; i++) {
    const vocab = N5_VOCABULARY[i];
    const docRef = doc(collection(db, 'vocabularies'));
    await setDoc(docRef, {
      ...vocab,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`  [${i + 1}/${N5_VOCABULARY.length}] Added: ${vocab.term}`);
  }
  
  console.log(`✅ Seeded ${N5_VOCABULARY.length} vocabulary items`);
}

async function seedGrammar() {
  console.log('Seeding grammar data...');
  
  for (let i = 0; i < N5_GRAMMAR.length; i++) {
    const grammar = N5_GRAMMAR[i];
    const docRef = doc(collection(db, 'grammarPoints'));
    await setDoc(docRef, {
      ...grammar,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`  [${i + 1}/${N5_GRAMMAR.length}] Added: ${grammar.pattern}`);
  }
  
  console.log(`✅ Seeded ${N5_GRAMMAR.length} grammar points`);
}

async function main() {
  console.log('🌱 Starting Firestore seed...\n');
  console.log(`Project: ${firebaseConfig.projectId}\n`);
  
  try {
    await seedVocabulary();
    console.log('');
    await seedGrammar();
    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

main();

