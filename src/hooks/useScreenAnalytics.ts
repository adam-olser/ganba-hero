import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { analyticsService } from '@/services/analytics';

export function useScreenAnalytics(screenName: string) {
  useFocusEffect(
    useCallback(() => {
      analyticsService.logScreenView(screenName);
    }, [screenName])
  );
}
