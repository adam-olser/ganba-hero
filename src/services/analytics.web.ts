/**
 * Analytics Service - Web Version
 * 
 * Uses Firebase JS SDK for web platform.
 * Tier 1 (Always On): Crashlytics, screen views, app opens
 * Tier 2 (With Consent): Learning analytics, feature usage, funnels
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { firebaseConfig } from '@/config/firebase';

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Analytics (only available in browser with valid config)
let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;

try {
  if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
    analyticsInstance = getAnalytics(app);
  }
} catch (e) {
  console.warn('Analytics not available:', e);
}

class AnalyticsService {
  private enhancedEnabled = false;
  private initialized = false;

  /**
   * Initialize analytics service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
  }

  /**
   * Set enhanced analytics consent
   */
  async setEnhancedConsent(enabled: boolean): Promise<void> {
    this.enhancedEnabled = enabled;
  }

  /**
   * Check if enhanced analytics is enabled
   */
  isEnhancedEnabled(): boolean {
    return this.enhancedEnabled;
  }

  // ============================================
  // TIER 1: Always On (Basic Analytics)
  // ============================================

  /**
   * Log screen view
   */
  async logScreenView(screenName: string, screenClass?: string): Promise<void> {
    try {
      if (analyticsInstance) {
        logEvent(analyticsInstance, 'screen_view', {
          screen_name: screenName,
          screen_class: screenClass || screenName,
        });
      }
    } catch (error) {
      console.error('Failed to log screen view:', error);
    }
  }

  /**
   * Log app open
   */
  async logAppOpen(): Promise<void> {
    try {
      if (analyticsInstance) {
        logEvent(analyticsInstance, 'app_open');
      }
    } catch (error) {
      console.error('Failed to log app open:', error);
    }
  }

  /**
   * Log error (Web doesn't have Crashlytics, log to console)
   */
  logError(error: Error, context?: string): void {
    console.error('App error:', context, error);
  }

  /**
   * Set user ID for analytics
   */
  async setUserId(userId: string | null): Promise<void> {
    try {
      if (analyticsInstance && userId) {
        setUserId(analyticsInstance, userId);
      }
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  /**
   * Set user property
   */
  async setUserProperty(name: string, value: string | null): Promise<void> {
    try {
      if (analyticsInstance && value) {
        setUserProperties(analyticsInstance, { [name]: value });
      }
    } catch (error) {
      console.error('Failed to set user property:', error);
    }
  }

  /**
   * Log sign up
   */
  async logSignUp(method: 'google' | 'apple' | 'anonymous'): Promise<void> {
    try {
      if (analyticsInstance) {
        logEvent(analyticsInstance, 'sign_up', { method });
      }
    } catch (error) {
      console.error('Failed to log sign up:', error);
    }
  }

  /**
   * Log login
   */
  async logLogin(method: 'google' | 'apple' | 'anonymous'): Promise<void> {
    try {
      if (analyticsInstance) {
        logEvent(analyticsInstance, 'login', { method });
      }
    } catch (error) {
      console.error('Failed to log login:', error);
    }
  }

  // ============================================
  // TIER 2: With Consent (Enhanced Analytics)
  // ============================================

  /**
   * Log detailed event (only if consent given)
   */
  async logDetailedEvent(event: string, params?: Record<string, unknown>): Promise<void> {
    if (!this.enhancedEnabled) return;
    
    try {
      if (analyticsInstance) {
        logEvent(analyticsInstance, event, params);
      }
    } catch (error) {
      console.error('Failed to log detailed event:', error);
    }
  }

  /**
   * Log learning progress
   */
  async logLearningProgress(data: {
    cardsStudied: number;
    accuracy: number;
    xpEarned: number;
    level: number;
  }): Promise<void> {
    if (!this.enhancedEnabled) return;
    
    try {
      if (analyticsInstance) {
        logEvent(analyticsInstance, 'learning_progress', data);
      }
    } catch (error) {
      console.error('Failed to log learning progress:', error);
    }
  }

  /**
   * Log study session
   */
  async logStudySession(data: {
    duration: number;
    cardsReviewed: number;
    newCardsLearned: number;
    accuracy: number;
    goalCompleted: boolean;
  }): Promise<void> {
    if (!this.enhancedEnabled) return;
    
    try {
      if (analyticsInstance) {
        logEvent(analyticsInstance, 'study_session', data);
      }
    } catch (error) {
      console.error('Failed to log study session:', error);
    }
  }

  /**
   * Log funnel step (onboarding, subscription, etc.)
   */
  async logFunnelStep(funnel: string, step: string, success: boolean): Promise<void> {
    if (!this.enhancedEnabled) return;
    
    try {
      if (analyticsInstance) {
        logEvent(analyticsInstance, 'funnel_step', { funnel, step, success });
      }
    } catch (error) {
      console.error('Failed to log funnel step:', error);
    }
  }

  /**
   * Log feature usage
   */
  async logFeatureUsage(feature: string, action: string): Promise<void> {
    if (!this.enhancedEnabled) return;
    
    try {
      if (analyticsInstance) {
        logEvent(analyticsInstance, 'feature_usage', { feature, action });
      }
    } catch (error) {
      console.error('Failed to log feature usage:', error);
    }
  }

  /**
   * Log subscription event
   */
  async logSubscriptionEvent(event: 'view_paywall' | 'start_trial' | 'subscribe' | 'cancel'): Promise<void> {
    if (!this.enhancedEnabled) return;
    
    try {
      if (analyticsInstance) {
        logEvent(analyticsInstance, `subscription_${event}`);
      }
    } catch (error) {
      console.error('Failed to log subscription event:', error);
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export class for testing
export { AnalyticsService };

