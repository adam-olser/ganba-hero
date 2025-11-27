/**
 * Responsive Hook
 * 
 * Provides responsive breakpoint information for adaptive layouts.
 * Supports mobile, tablet, and desktop views.
 */

import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';
import { layout } from '@/theme';

export interface ResponsiveInfo {
  // Screen dimensions
  width: number;
  height: number;
  
  // Breakpoint flags
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Layout helpers
  showSidebar: boolean;
  showBottomTabs: boolean;
  
  // Content width (for centered layouts)
  contentWidth: number;
  
  // Orientation
  isLandscape: boolean;
  isPortrait: boolean;
}

// Breakpoint values
const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

/**
 * Hook for responsive layout information
 */
export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();
  
  return useMemo(() => {
    const isMobile = width < BREAKPOINTS.tablet;
    const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
    const isDesktop = width >= BREAKPOINTS.desktop;
    
    // Show sidebar on desktop, bottom tabs on mobile/tablet
    const showSidebar = isDesktop;
    const showBottomTabs = !isDesktop;
    
    // Calculate content width (centered on large screens)
    const contentWidth = isDesktop
      ? Math.min(width - layout.sidebarWidth - (layout.screenPaddingHorizontal * 2), layout.maxContentWidth)
      : width - (layout.screenPaddingHorizontal * 2);
    
    const isLandscape = width > height;
    const isPortrait = height >= width;
    
    return {
      width,
      height,
      isMobile,
      isTablet,
      isDesktop,
      showSidebar,
      showBottomTabs,
      contentWidth,
      isLandscape,
      isPortrait,
    };
  }, [width, height]);
}

/**
 * Get responsive value based on breakpoint
 */
export function useResponsiveValue<T>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
}): T {
  const { isMobile, isTablet } = useResponsive();
  
  if (isMobile) {
    return values.mobile;
  }
  
  if (isTablet) {
    return values.tablet ?? values.mobile;
  }
  
  return values.desktop ?? values.tablet ?? values.mobile;
}

/**
 * Get responsive spacing multiplier
 */
export function useResponsiveSpacing(): number {
  const { isMobile, isTablet } = useResponsive();
  
  if (isMobile) return 1;
  if (isTablet) return 1.25;
  return 1.5;
}

