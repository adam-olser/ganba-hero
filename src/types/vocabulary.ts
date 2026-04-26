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
  pattern: string;
  meaning: string;
  jlptLevel: JlptLevel;
  explanation: string;
  formation: string;
  examples: Array<{
    japanese: string;
    reading: string;
    english: string;
  }>;
  relatedPatterns?: string[];
  relatedGrammar?: string[];
  relatedVocab?: string[];
  tags?: string[];
  notes?: string;
  order: number;
}

