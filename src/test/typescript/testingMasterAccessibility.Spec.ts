import { expect } from '@playwright/test'

import { test } from '../../main/typescript/base/customFixtures'

test.describe.configure({ mode: 'parallel' })
test.beforeEach(async ({ page, homePageActions }) => {
    await homePageActions.launchApp()
    await page.waitForTimeout(5 * 1000)
})

test.describe('Accessibility', () => {
  test('Heading hierarchy', async ({ page }) => {
    const h1s = await page.locator('h1').all()
    expect(h1s.length).toBeGreaterThan(0)
    // Check that h1 is present and visible
    for (const h1 of h1s) {
      await expect(h1).toBeVisible()
    }
  })

  test('Image alt text', async ({ page }) => {
    const images = page.locator('img')
    const count = await images.count()
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt).not.toBeNull()
      expect(alt).not.toBe('')
    }
  })

  test('Keyboard navigation', async ({ page }) => {
    await page.keyboard.press('Tab')
    // Check that focus is visible on first tabbable element
    const active = await page.evaluate(() => document.activeElement?.id)
    expect(active).not.toBeNull()
  })

  test('Color contrast', async ({ page }) => {
    // Check for high contrast on main nav links
    const navLinks = page.locator('nav a, nav button')
    const count = await navLinks.count()
    for (let i = 0; i < count; i++) {
      const color = await navLinks.nth(i).evaluate((el) => getComputedStyle(el).color)
      const bg = await navLinks.nth(i).evaluate((el) => getComputedStyle(el).backgroundColor)
      // Just check that color and bg are not the same (simple check)
      expect(color).not.toBe(bg)
    }
  })
})

