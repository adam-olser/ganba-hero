/**
 * Error Boundary Component
 * 
 * Catches React rendering errors and displays a fallback UI.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '@/theme';
import { Text, Heading2, Caption } from '../Text';
import { Button } from '../Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** If true, shows a retry button to reset the error state */
  showRetry?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
    
    // In production, you could send this to a crash reporting service
    // crashlytics().recordError(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback, showRetry = true } = this.props;

    if (hasError) {
      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>😿</Text>
            <Heading2 align="center">Something went wrong</Heading2>
            <Caption align="center" color="textSecondary" style={styles.message}>
              We're sorry, but something unexpected happened. 
              {__DEV__ && error?.message && `\n\n${error.message}`}
            </Caption>
            
            {showRetry && (
              <Button
                title="Try Again"
                variant="primary"
                onPress={this.handleRetry}
                style={styles.button}
              />
            )}

            {__DEV__ && error && (
              <View style={styles.devInfo}>
                <Caption color="error">
                  {error.name}: {error.message}
                </Caption>
              </View>
            )}
          </View>
        </View>
      );
    }

    return children;
  }
}

/**
 * Inline error display for non-critical errors
 */
export function ErrorDisplay({ 
  message, 
  onRetry,
  compact = false 
}: { 
  message: string; 
  onRetry?: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <View style={styles.compactError}>
        <Text color="error" variant="caption">{message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry}>
            <Text color="primary" variant="caption">Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.errorCard}>
      <Text color="error">{message}</Text>
      {onRetry && (
        <Button
          title="Retry"
          variant="outline"
          size="small"
          onPress={onRetry}
          style={styles.retryButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  message: {
    marginTop: spacing.md,
    lineHeight: 22,
  },
  button: {
    marginTop: spacing.xl,
    minWidth: 160,
  },
  devInfo: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    maxWidth: '100%',
  },
  compactError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  errorCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
    gap: spacing.sm,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
});

export default ErrorBoundary;

