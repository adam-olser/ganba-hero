import type { JlptLevel } from './user';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'particle'
  | 'conjunction'
  | 'interjection'
  | 'pronoun'
  | 'counter'
  | 'expression'
  | 'other';

export interface KanjiInfo {
  kanji: string;
  meanings: string[];
  readings: {
    onyomi: string[];
    kunyomi: string[];
  };
}

export interface Vocabulary {
  id: string;
  term: string; // Japanese word (e.g., 食べる)
  reading: string; // Hiragana reading (e.g., たべる)
  meaning: string; // Primary English meaning
  synonyms: string[]; // Alternative accepted answers
  readingSynonyms: string[]; // Alternative readings
  jlptLevel: JlptLevel;
  frequencyRank: number;
  partOfSpeech: PartOfSpeech;
  exampleJapanese?: string;
  exampleEnglish?: string;
  kanjiInfo?: KanjiInfo[];
  tags: string[];
}

export interface GrammarPoint {
  id: string;
  pattern: string; // Grammar pattern (e.g., ～ている)
  meaning: string; // Brief meaning
  jlptLevel: JlptLevel;
  explanation: string; // Detailed explanation
  formation: string; // How to form it
  examples: Array<{
    japanese: string;
    reading: string;
    english: string;
  }>;
  relatedGrammar: string[]; // IDs of related grammar points
  relatedVocab: string[]; // IDs of related vocabulary
  order: number; // Display order within level
}

