/**
 * Seed Firestore with sample vocabulary data
 * 
 * Run with: npx ts-node scripts/seed-firestore.ts
 * 
 * Note: Requires Firebase Admin SDK credentials.
 * Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account key path.
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

// Sample N5 vocabulary data
const N5_VOCABULARY = [
  {
    term: '食べる',
    reading: 'たべる',
    meaning: 'to eat',
    synonyms: ['eat', 'to consume'],
    readingSynonyms: ['taberu'],
    jlptLevel: 'N5',
    frequencyRank: 1,
    partOfSpeech: 'verb',
    exampleJapanese: '朝ごはんを食べる',
    exampleEnglish: 'I eat breakfast',
    tags: ['food', 'daily-life'],
  },
  {
    term: '飲む',
    reading: 'のむ',
    meaning: 'to drink',
    synonyms: ['drink', 'to consume liquid'],
    readingSynonyms: ['nomu'],
    jlptLevel: 'N5',
    frequencyRank: 2,
    partOfSpeech: 'verb',
    exampleJapanese: '水を飲む',
    exampleEnglish: 'I drink water',
    tags: ['food', 'daily-life'],
  },
  {
    term: '行く',
    reading: 'いく',
    meaning: 'to go',
    synonyms: ['go', 'to travel'],
    readingSynonyms: ['iku'],
    jlptLevel: 'N5',
    frequencyRank: 3,
    partOfSpeech: 'verb',
    exampleJapanese: '学校に行く',
    exampleEnglish: 'I go to school',
    tags: ['movement', 'daily-life'],
  },
  {
    term: '来る',
    reading: 'くる',
    meaning: 'to come',
    synonyms: ['come', 'to arrive'],
    readingSynonyms: ['kuru'],
    jlptLevel: 'N5',
    frequencyRank: 4,
    partOfSpeech: 'verb',
    exampleJapanese: '友達が来る',
    exampleEnglish: 'A friend comes',
    tags: ['movement', 'daily-life'],
  },
  {
    term: '見る',
    reading: 'みる',
    meaning: 'to see, to look, to watch',
    synonyms: ['see', 'look', 'watch', 'to view'],
    readingSynonyms: ['miru'],
    jlptLevel: 'N5',
    frequencyRank: 5,
    partOfSpeech: 'verb',
    exampleJapanese: 'テレビを見る',
    exampleEnglish: 'I watch TV',
    tags: ['senses', 'daily-life'],
  },
  {
    term: '聞く',
    reading: 'きく',
    meaning: 'to hear, to listen, to ask',
    synonyms: ['hear', 'listen', 'ask'],
    readingSynonyms: ['kiku'],
    jlptLevel: 'N5',
    frequencyRank: 6,
    partOfSpeech: 'verb',
    exampleJapanese: '音楽を聞く',
    exampleEnglish: 'I listen to music',
    tags: ['senses', 'daily-life'],
  },
  {
    term: '読む',
    reading: 'よむ',
    meaning: 'to read',
    synonyms: ['read'],
    readingSynonyms: ['yomu'],
    jlptLevel: 'N5',
    frequencyRank: 7,
    partOfSpeech: 'verb',
    exampleJapanese: '本を読む',
    exampleEnglish: 'I read a book',
    tags: ['study', 'daily-life'],
  },
  {
    term: '書く',
    reading: 'かく',
    meaning: 'to write',
    synonyms: ['write'],
    readingSynonyms: ['kaku'],
    jlptLevel: 'N5',
    frequencyRank: 8,
    partOfSpeech: 'verb',
    exampleJapanese: '手紙を書く',
    exampleEnglish: 'I write a letter',
    tags: ['study', 'daily-life'],
  },
  {
    term: '話す',
    reading: 'はなす',
    meaning: 'to speak, to talk',
    synonyms: ['speak', 'talk', 'to converse'],
    readingSynonyms: ['hanasu'],
    jlptLevel: 'N5',
    frequencyRank: 9,
    partOfSpeech: 'verb',
    exampleJapanese: '日本語を話す',
    exampleEnglish: 'I speak Japanese',
    tags: ['communication', 'daily-life'],
  },
  {
    term: '買う',
    reading: 'かう',
    meaning: 'to buy',
    synonyms: ['buy', 'purchase'],
    readingSynonyms: ['kau'],
    jlptLevel: 'N5',
    frequencyRank: 10,
    partOfSpeech: 'verb',
    exampleJapanese: '本を買う',
    exampleEnglish: 'I buy a book',
    tags: ['shopping', 'daily-life'],
  },
  // Nouns
  {
    term: '日本',
    reading: 'にほん',
    meaning: 'Japan',
    synonyms: ['Nippon'],
    readingSynonyms: ['nihon', 'nippon'],
    jlptLevel: 'N5',
    frequencyRank: 11,
    partOfSpeech: 'noun',
    exampleJapanese: '日本に住んでいます',
    exampleEnglish: 'I live in Japan',
    tags: ['country', 'place'],
  },
  {
    term: '人',
    reading: 'ひと',
    meaning: 'person, people',
    synonyms: ['person', 'people', 'human'],
    readingSynonyms: ['hito'],
    jlptLevel: 'N5',
    frequencyRank: 12,
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
    jlptLevel: 'N5',
    frequencyRank: 13,
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
    jlptLevel: 'N5',
    frequencyRank: 14,
    partOfSpeech: 'noun',
    exampleJapanese: '学校は大きいです',
    exampleEnglish: 'The school is big',
    tags: ['education', 'place'],
  },
  {
    term: '友達',
    reading: 'ともだち',
    meaning: 'friend',
    synonyms: ['friend', 'pal'],
    readingSynonyms: ['tomodachi'],
    jlptLevel: 'N5',
    frequencyRank: 15,
    partOfSpeech: 'noun',
    exampleJapanese: '友達と遊ぶ',
    exampleEnglish: 'I play with friends',
    tags: ['people', 'relationship'],
  },
  // Adjectives
  {
    term: '大きい',
    reading: 'おおきい',
    meaning: 'big, large',
    synonyms: ['big', 'large', 'great'],
    readingSynonyms: ['ookii'],
    jlptLevel: 'N5',
    frequencyRank: 16,
    partOfSpeech: 'adjective',
    exampleJapanese: '大きい犬',
    exampleEnglish: 'A big dog',
    tags: ['size', 'description'],
  },
  {
    term: '小さい',
    reading: 'ちいさい',
    meaning: 'small, little',
    synonyms: ['small', 'little', 'tiny'],
    readingSynonyms: ['chiisai'],
    jlptLevel: 'N5',
    frequencyRank: 17,
    partOfSpeech: 'adjective',
    exampleJapanese: '小さい猫',
    exampleEnglish: 'A small cat',
    tags: ['size', 'description'],
  },
  {
    term: '新しい',
    reading: 'あたらしい',
    meaning: 'new',
    synonyms: ['new', 'fresh'],
    readingSynonyms: ['atarashii'],
    jlptLevel: 'N5',
    frequencyRank: 18,
    partOfSpeech: 'adjective',
    exampleJapanese: '新しい本',
    exampleEnglish: 'A new book',
    tags: ['time', 'description'],
  },
  {
    term: '古い',
    reading: 'ふるい',
    meaning: 'old (things)',
    synonyms: ['old', 'ancient'],
    readingSynonyms: ['furui'],
    jlptLevel: 'N5',
    frequencyRank: 19,
    partOfSpeech: 'adjective',
    exampleJapanese: '古い家',
    exampleEnglish: 'An old house',
    tags: ['time', 'description'],
  },
  {
    term: 'いい',
    reading: 'いい',
    meaning: 'good, nice',
    synonyms: ['good', 'nice', 'fine', 'okay'],
    readingSynonyms: ['ii', 'yoi'],
    jlptLevel: 'N5',
    frequencyRank: 20,
    partOfSpeech: 'adjective',
    exampleJapanese: 'いい天気',
    exampleEnglish: 'Good weather',
    tags: ['quality', 'description'],
  },
];

// Sample N5 grammar points
const N5_GRAMMAR = [
  {
    pattern: 'です',
    meaning: 'is, am, are (polite copula)',
    jlptLevel: 'N5',
    order: 1,
    explanation: 'です is the polite form of the copula, used to link a subject to a noun or adjective. It is equivalent to "is/am/are" in English.',
    formation: 'Noun + です\nな-adjective + です',
    examples: [
      { japanese: '私は学生です。', reading: 'わたしはがくせいです。', english: 'I am a student.' },
      { japanese: 'これは本です。', reading: 'これはほんです。', english: 'This is a book.' },
    ],
    tags: ['copula', 'polite'],
    notes: 'The plain form equivalent is だ (da).',
  },
  {
    pattern: 'ます',
    meaning: 'polite verb ending',
    jlptLevel: 'N5',
    order: 2,
    explanation: 'ます is the polite verb ending used in formal situations. It attaches to the verb stem.',
    formation: 'Verb stem + ます',
    examples: [
      { japanese: '食べます', reading: 'たべます', english: 'eat (polite)' },
      { japanese: '日本語を勉強します。', reading: 'にほんごをべんきょうします。', english: 'I study Japanese.' },
    ],
    tags: ['verb', 'polite'],
    notes: 'ません is the negative form, ました is past tense.',
  },
  {
    pattern: 'は (topic marker)',
    meaning: 'as for, speaking of (topic marker)',
    jlptLevel: 'N5',
    order: 3,
    explanation: 'は marks the topic of a sentence - what you are talking about. It is pronounced "wa" when used as a particle.',
    formation: 'Noun + は',
    examples: [
      { japanese: '私は日本人です。', reading: 'わたしはにほんじんです。', english: 'I am Japanese.' },
      { japanese: '今日は暑いです。', reading: 'きょうはあついです。', english: 'Today is hot.' },
    ],
    tags: ['particle', 'topic'],
    relatedPatterns: ['が (subject marker)'],
  },
  {
    pattern: 'を (object marker)',
    meaning: 'object marker',
    jlptLevel: 'N5',
    order: 4,
    explanation: 'を marks the direct object of a verb - the thing that the action is done to.',
    formation: 'Noun + を + Verb',
    examples: [
      { japanese: '水を飲みます。', reading: 'みずをのみます。', english: 'I drink water.' },
      { japanese: '本を読みます。', reading: 'ほんをよみます。', english: 'I read a book.' },
    ],
    tags: ['particle', 'object'],
  },
  {
    pattern: 'に (location/time)',
    meaning: 'at, in, on, to (location/time marker)',
    jlptLevel: 'N5',
    order: 5,
    explanation: 'に indicates a specific point in time, location, or destination.',
    formation: 'Time/Place + に',
    examples: [
      { japanese: '7時に起きます。', reading: 'しちじにおきます。', english: 'I wake up at 7 o\'clock.' },
      { japanese: '東京に行きます。', reading: 'とうきょうにいきます。', english: 'I go to Tokyo.' },
    ],
    tags: ['particle', 'location', 'time'],
    relatedPatterns: ['へ (direction)', 'で (location of action)'],
  },
  {
    pattern: 'で (location of action)',
    meaning: 'at, in (location where action takes place)',
    jlptLevel: 'N5',
    order: 6,
    explanation: 'で marks the location where an action takes place, or the means/method by which something is done.',
    formation: 'Place + で + Verb',
    examples: [
      { japanese: '学校で勉強します。', reading: 'がっこうでべんきょうします。', english: 'I study at school.' },
      { japanese: '電車で行きます。', reading: 'でんしゃでいきます。', english: 'I go by train.' },
    ],
    tags: ['particle', 'location', 'means'],
  },
  {
    pattern: 'と (and, with)',
    meaning: 'and, with',
    jlptLevel: 'N5',
    order: 7,
    explanation: 'と connects nouns (and) or indicates accompaniment (with).',
    formation: 'Noun + と + Noun\nPerson + と + Verb',
    examples: [
      { japanese: 'りんごとみかん', reading: 'りんごとみかん', english: 'apples and oranges' },
      { japanese: '友達と映画を見ます。', reading: 'ともだちとえいがをみます。', english: 'I watch a movie with a friend.' },
    ],
    tags: ['particle', 'conjunction'],
  },
  {
    pattern: 'か (question)',
    meaning: 'question marker',
    jlptLevel: 'N5',
    order: 8,
    explanation: 'か at the end of a sentence turns it into a question.',
    formation: 'Statement + か',
    examples: [
      { japanese: 'これは何ですか。', reading: 'これはなんですか。', english: 'What is this?' },
      { japanese: '日本語がわかりますか。', reading: 'にほんごがわかりますか。', english: 'Do you understand Japanese?' },
    ],
    tags: ['particle', 'question'],
  },
  {
    pattern: 'ない (negative)',
    meaning: 'not, negative verb form',
    jlptLevel: 'N5',
    order: 9,
    explanation: 'ない is the plain negative form of verbs.',
    formation: 'Verb (negative stem) + ない',
    examples: [
      { japanese: '食べない', reading: 'たべない', english: 'don\'t eat' },
      { japanese: '分からない', reading: 'わからない', english: 'don\'t understand' },
    ],
    tags: ['verb', 'negative', 'plain'],
    relatedPatterns: ['ません (polite negative)'],
  },
  {
    pattern: 'たい (want to)',
    meaning: 'want to',
    jlptLevel: 'N5',
    order: 10,
    explanation: 'たい expresses the speaker\'s desire to do something.',
    formation: 'Verb stem + たい',
    examples: [
      { japanese: '日本に行きたい。', reading: 'にほんにいきたい。', english: 'I want to go to Japan.' },
      { japanese: 'ラーメンが食べたい。', reading: 'らーめんがたべたい。', english: 'I want to eat ramen.' },
    ],
    tags: ['verb', 'desire'],
    notes: 'This is only used for the speaker\'s own desires. For others, use たがっている.',
  },
];

async function seedVocabulary() {
  console.log('Seeding vocabulary data...');
  
  const batch = db.batch();
  
  for (const vocab of N5_VOCABULARY) {
    const docRef = db.collection('vocabularies').doc();
    batch.set(docRef, {
      ...vocab,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  
  await batch.commit();
  console.log(`Seeded ${N5_VOCABULARY.length} vocabulary items`);
}

async function seedGrammar() {
  console.log('Seeding grammar data...');
  
  const batch = db.batch();
  
  for (const grammar of N5_GRAMMAR) {
    const docRef = db.collection('grammarPoints').doc();
    batch.set(docRef, {
      ...grammar,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  
  await batch.commit();
  console.log(`Seeded ${N5_GRAMMAR.length} grammar points`);
}

async function main() {
  try {
    await seedVocabulary();
    await seedGrammar();
    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

main();

