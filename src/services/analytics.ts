/**
 * Analytics Service (Two-Tier System)
 * 
 * Tier 1 (Always On): Crashlytics, screen views, app opens
 * Tier 2 (With Consent): Learning analytics, feature usage, funnels
 */

import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

class AnalyticsService {
  private enhancedEnabled = false;
  private initialized = false;

  /**
   * Initialize analytics service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Crashlytics is always enabled
      await crashlytics().setCrashlyticsCollectionEnabled(true);
      
      // Basic analytics always on
      await analytics().setAnalyticsCollectionEnabled(true);
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Set enhanced analytics consent
   */
  async setEnhancedConsent(enabled: boolean): Promise<void> {
    this.enhancedEnabled = enabled;
    
    // We keep basic analytics on, but control what events we send
    // based on consent
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
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
    } catch (error) {
      console.error('Failed to log screen view:', error);
    }
  }

  /**
   * Log app open
   */
  async logAppOpen(): Promise<void> {
    try {
      await analytics().logAppOpen();
    } catch (error) {
      console.error('Failed to log app open:', error);
    }
  }

  /**
   * Log error to Crashlytics
   */
  logError(error: Error, context?: string): void {
    try {
      if (context) {
        crashlytics().log(context);
      }
      crashlytics().recordError(error);
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  /**
   * Set user ID for analytics
   */
  async setUserId(userId: string | null): Promise<void> {
    try {
      await analytics().setUserId(userId);
      if (userId) {
        await crashlytics().setUserId(userId);
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
      await analytics().setUserProperty(name, value);
    } catch (error) {
      console.error('Failed to set user property:', error);
    }
  }

  /**
   * Log sign up
   */
  async logSignUp(method: 'google' | 'apple' | 'anonymous'): Promise<void> {
    try {
      await analytics().logSignUp({ method });
    } catch (error) {
      console.error('Failed to log sign up:', error);
    }
  }

  /**
   * Log login
   */
  async logLogin(method: 'google' | 'apple' | 'anonymous'): Promise<void> {
    try {
      await analytics().logLogin({ method });
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
      await analytics().logEvent(event, params);
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
      await analytics().logEvent('learning_progress', data);
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
      await analytics().logEvent('study_session', data);
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
      await analytics().logEvent('funnel_step', { funnel, step, success });
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
      await analytics().logEvent('feature_usage', { feature, action });
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
      await analytics().logEvent(`subscription_${event}`);
    } catch (error) {
      console.error('Failed to log subscription event:', error);
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export class for testing
export { AnalyticsService };

