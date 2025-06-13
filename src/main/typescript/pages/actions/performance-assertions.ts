// performance-assertions.ts
import { expect } from '@playwright/test'

import { PerformanceHelper } from './performance-helper'

export async function expectPerformanceBudget(
  perfHelper: PerformanceHelper,
  budgets: {
    ttfb?: number
    domContentLoaded?: number
    load?: number
    lcp?: number
    cls?: number
    interactionTime?: number
  },
) {
  // Get navigation metrics
  const navMetrics = await perfHelper.getNavigationMetrics()
  
  // Check Time to First Byte (TTFB)
  if (budgets.ttfb !== undefined) {
    expect(navMetrics.ttfb).toBeLessThanOrEqual(budgets.ttfb)
  }
  
  // Check DOM Content Loaded
  if (budgets.domContentLoaded !== undefined) {
    expect(navMetrics.domContentLoaded).toBeLessThanOrEqual(budgets.domContentLoaded)
  }
  
  // Check Load Time
  if (budgets.load !== undefined) {
    expect(navMetrics.load).toBeLessThanOrEqual(budgets.load)
  }
  
  // Check Largest Contentful Paint
  if (budgets.lcp !== undefined) {
    const lcp = await perfHelper.getLCP()
    expect(lcp).toBeLessThanOrEqual(budgets.lcp)
  }
  
  // Check Cumulative Layout Shift
  if (budgets.cls !== undefined) {
    const cls = await perfHelper.getCLS()
    expect(cls).toBeLessThanOrEqual(budgets.cls)
  }
}