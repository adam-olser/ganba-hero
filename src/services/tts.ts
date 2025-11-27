/**
 * Text-to-Speech Service
 * 
 * Provides Japanese pronunciation using device TTS or Web Speech API.
 */

import { Platform } from 'react-native';

// Web Speech API types
interface SpeechSynthesisUtteranceWeb extends SpeechSynthesisUtterance {
  voice: SpeechSynthesisVoice | null;
}

// Check if TTS is available
export function isTTSAvailable(): boolean {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
  // For native, we'd need expo-speech or react-native-tts
  // Return false for now - can be enhanced later
  return false;
}

// Get available Japanese voices
export function getJapaneseVoices(): SpeechSynthesisVoice[] {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.speechSynthesis) {
    return [];
  }
  
  const voices = window.speechSynthesis.getVoices();
  return voices.filter(voice => 
    voice.lang.startsWith('ja') || 
    voice.lang === 'ja-JP' ||
    voice.name.toLowerCase().includes('japanese')
  );
}

// Speak Japanese text
export function speakJapanese(text: string, options?: {
  rate?: number;
  pitch?: number;
  volume?: number;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        reject(new Error('Speech synthesis not available'));
        return;
      }
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = options?.rate ?? 0.9; // Slightly slower for clarity
      utterance.pitch = options?.pitch ?? 1.0;
      utterance.volume = options?.volume ?? 1.0;
      
      // Try to find a Japanese voice
      const japaneseVoices = getJapaneseVoices();
      if (japaneseVoices.length > 0) {
        // Prefer native Japanese voices over Google TTS
        const preferredVoice = japaneseVoices.find(v => !v.name.includes('Google')) || japaneseVoices[0];
        utterance.voice = preferredVoice;
      }
      
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(event.error));
      
      window.speechSynthesis.speak(utterance);
    } else {
      // For native platforms, we'd use expo-speech or react-native-tts
      // For now, just resolve immediately
      console.log('[TTS] Native TTS not implemented, would speak:', text);
      resolve();
    }
  });
}

// Stop any ongoing speech
export function stopSpeaking(): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Preload voices (needed for some browsers)
export function preloadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.speechSynthesis) {
      resolve([]);
      return;
    }
    
    // Some browsers load voices asynchronously
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    
    // Wait for voices to load
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
    
    // Timeout fallback
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
}

export default {
  isTTSAvailable,
  getJapaneseVoices,
  speakJapanese,
  stopSpeaking,
  preloadVoices,
};

