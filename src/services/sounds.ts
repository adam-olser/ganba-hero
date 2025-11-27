/**
 * Sound Effects Service
 * 
 * Handles audio feedback for app interactions.
 * Uses Web Audio API for web, with fallback support.
 */

import { Platform } from 'react-native';

// Sound effect types
export type SoundEffect = 
  | 'correct'
  | 'incorrect'
  | 'flip'
  | 'levelUp'
  | 'streakComplete'
  | 'sessionComplete'
  | 'buttonTap';

// Audio context for web
let audioContext: AudioContext | null = null;

// Sound configurations (frequency-based for web)
const SOUND_CONFIGS: Record<SoundEffect, { frequencies: number[]; duration: number; type: OscillatorType }> = {
  correct: {
    frequencies: [523.25, 659.25, 783.99], // C5, E5, G5 - major chord arpeggio
    duration: 0.15,
    type: 'sine',
  },
  incorrect: {
    frequencies: [220, 196], // A3, G3 - descending
    duration: 0.2,
    type: 'triangle',
  },
  flip: {
    frequencies: [440],
    duration: 0.05,
    type: 'sine',
  },
  levelUp: {
    frequencies: [523.25, 659.25, 783.99, 1046.5], // C5 to C6 arpeggio
    duration: 0.12,
    type: 'sine',
  },
  streakComplete: {
    frequencies: [392, 523.25, 659.25], // G4, C5, E5
    duration: 0.18,
    type: 'sine',
  },
  sessionComplete: {
    frequencies: [523.25, 659.25, 783.99, 1046.5, 1318.5], // Triumphant arpeggio
    duration: 0.1,
    type: 'sine',
  },
  buttonTap: {
    frequencies: [880],
    duration: 0.03,
    type: 'sine',
  },
};

/**
 * Initialize audio context (must be called after user interaction on web)
 */
function initAudioContext(): AudioContext | null {
  if (Platform.OS !== 'web') return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('[Sounds] Web Audio API not supported');
      return null;
    }
  }
  
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  return audioContext;
}

/**
 * Play a sound effect using Web Audio API
 */
function playWebSound(effect: SoundEffect): void {
  const ctx = initAudioContext();
  if (!ctx) return;
  
  const config = SOUND_CONFIGS[effect];
  const now = ctx.currentTime;
  
  config.frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(freq, now);
    
    // Envelope: quick attack, sustain, quick release
    const startTime = now + (index * config.duration);
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + config.duration * 0.7);
    gainNode.gain.linearRampToValueAtTime(0, startTime + config.duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + config.duration);
  });
}

/**
 * Sound service settings
 */
let soundEnabled = true;

/**
 * Sound Effects Service
 */
export const soundsService = {
  /**
   * Play a sound effect
   */
  play(effect: SoundEffect): void {
    if (!soundEnabled) return;
    
    if (Platform.OS === 'web') {
      playWebSound(effect);
    } else {
      // For native, we would use react-native-sound or expo-av
      // This is a placeholder for native implementation
      console.log(`[Sounds] Would play: ${effect}`);
    }
  },
  
  /**
   * Enable or disable sound effects
   */
  setEnabled(enabled: boolean): void {
    soundEnabled = enabled;
  },
  
  /**
   * Check if sound effects are enabled
   */
  isEnabled(): boolean {
    return soundEnabled;
  },
  
  /**
   * Initialize audio (call after first user interaction)
   */
  initialize(): void {
    if (Platform.OS === 'web') {
      initAudioContext();
    }
  },
};

// Convenience exports
export const playSound = soundsService.play.bind(soundsService);
export const setSoundEnabled = soundsService.setEnabled.bind(soundsService);

export default soundsService;

