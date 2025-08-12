import { expect, test } from '@playwright/test'

import { conditionalTest, testDecorator, testMethod } from '../main/typescript/helpers/Decorators'

/**
 * Example class demonstrating how to use the test decorators
 */
export class ExampleTestClass {

  /**
   * Using the testDecorator with a title
   */
  @testDecorator('should perform a basic login')
  async testBasicLogin({ page }) {
    // Simple test implementation
    await page.goto('https://example.com/login')
    await page.fill('[name="username"]', 'testuser')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    
    // Verify login was successful
    await expect(page.locator('.welcome-message')).toHaveText('Welcome, Test User')
  }
  
  /**
   * Using the testMethod decorator with a simple title string
   */
  @testMethod('should navigate to about page')
  async testNavigation({ page }) {
    await page.goto('https://example.com')
    await page.click('text=About Us')
    
    // Verify navigation was successful
    await expect(page).toHaveTitle(/About Us/)
    await expect(page.locator('h1')).toHaveText('About Our Company')
  }
  
  /**
   * Using the conditionalTest decorator with skip logic
   */
  @conditionalTest({
    title: 'should process payment',
    tags: ['payment', 'e2e'],
    conditionalSkip: () => process.env.SKIP_PAYMENT_TESTS === 'true',
  })
  async testPaymentProcessing({ page }) {
    await page.goto('https://example.com/checkout')
    await page.fill('[name="cardNumber"]', '4111111111111111')
    await page.fill('[name="expiryDate"]', '12/25')
    await page.fill('[name="cvv"]', '123')
    await page.click('#submit-payment')
    
    // Verify payment was successful
    await expect(page.locator('.success-message')).toBeVisible()
    await expect(page.locator('.order-confirmation')).toContainText('Thank you for your order')
  }
}
