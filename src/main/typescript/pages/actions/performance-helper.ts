// performance-helper.ts
import { Page } from '@playwright/test'

export class PerformanceHelper {
  private page: Page
  
  constructor(page: Page) {
    this.page = page
  }

  async getNavigationMetrics() {
    return await this.page.evaluate(() => {
      const timing = performance.timing
      const navigationStart = timing.navigationStart
      
      return {
        ttfb: timing.responseStart - navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
        load: timing.loadEventEnd - navigationStart,
        domInteractive: timing.domInteractive - navigationStart,
        domComplete: timing.domComplete - navigationStart,
        serverResponseTime: timing.responseEnd - timing.requestStart,
        domProcessingTime: timing.domComplete - timing.domLoading,
      }
    })
  }
  async getBrowserMetrics() {
    // Create a CDP session (Chrome-only)
    if (this.page.context().browser()) {
      const cdpSession = await this.page.context().newCDPSession(this.page)
      await cdpSession.send('Performance.enable')
      const result = await cdpSession.send('Performance.getMetrics')
      return result.metrics
    }
    throw new Error('Browser metrics are only available in Chromium-based browsers')
  }
  
  async measureInteraction(action: () => Promise<void>) {
    // Start timing
    const startTime = await this.page.evaluate(() => performance.now())
    
    // Perform the action
    await action()
    
    // End timing
    const endTime = await this.page.evaluate(() => performance.now())
    return endTime - startTime
  }

  async getLCP() {
    return await this.page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry ? lastEntry.startTime : 0)
        }).observe({ type: 'largest-contentful-paint', buffered: true })
      })
    })
  }

  async getCLS() {
    return await this.page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.entryType) {
              clsValue += entry.duration
            }
          }
          resolve(clsValue)
        }).observe({ type: 'layout-shift', buffered: true })
      })
    })
  }
}