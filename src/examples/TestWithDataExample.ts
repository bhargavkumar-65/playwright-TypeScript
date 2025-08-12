import { expect } from '@playwright/test'
import { testWithData } from '../main/typescript/helpers/Decorators'

/**
 * Example tests showing how to use the testWithData decorator
 * 
 * This demonstrates how to create data-driven tests that generate
 * multiple test cases from a single method
 */
export class LoginDataDrivenTests {
  // Test data for login scenarios defined as a static property
  // Makes it easy to access from test methods
  static readonly TEST_DATA = [
    { 
      username: 'valid@example.com', 
      password: 'Password123',
      expectSuccess: true,
      expectedMessage: 'Welcome, Valid User',
    },
    { 
      username: 'invalid@example.com', 
      password: 'wrongpassword',
      expectSuccess: false,
      expectedMessage: 'Invalid username or password',
    },
    { 
      username: '', 
      password: 'Password123',
      expectSuccess: false,
      expectedMessage: 'Username is required',
    },
  ]
  
  /**
   * Test showing basic usage of testWithData decorator
   * 
   * One test will be created for each item in the TEST_DATA array
   * Each will have a descriptive name showing the data being used
   */
  @testWithData(() => LoginDataDrivenTests.TEST_DATA, {
    title: 'validates login form under various conditions',
    tags: ['login', 'data-driven'],
  })
  async loginWithDataTest({ page }, scenario) {
    // Navigate to login page
    await page.goto('/login')
    
    // Fill in the form with data from the current scenario
    await page.fill('#username', scenario.username)
    await page.fill('#password', scenario.password)
    await page.click('#login-button')
    
    // Assert based on expected outcome from test data
    if (scenario.expectSuccess) {
      const message = await page.textContent('.welcome-message')
      expect(message).toBe(scenario.expectedMessage)
    } else {
      const error = await page.textContent('.error-message')
      expect(error).toBe(scenario.expectedMessage)
    }
  }
  
  /**
   * Test with conditional skipping based on test data
   * 
   * Shows how to skip specific test cases based on their data
   */
  @testWithData(() => LoginDataDrivenTests.TEST_DATA, {
    title: 'handles login scenarios with conditional skipping',
    conditionalSkip: (data) => data.username === '', // Skip tests with empty username
  })
  async conditionalLoginTest({ page }, scenario) {
    // This test implementation is the same, but empty username tests will be skipped
    await page.goto('/login')
    await page.fill('#username', scenario.username)
    await page.fill('#password', scenario.password)
    await page.click('#login-button')
    
    if (scenario.expectSuccess) {
      const message = await page.textContent('.welcome-message')
      expect(message).toBe(scenario.expectedMessage)
    } else {
      const error = await page.textContent('.error-message')
      expect(error).toBe(scenario.expectedMessage)
    }
  }
  
  /**
   * Test with dynamically generated data
   * 
   * Shows how you can generate test data programmatically
   */
  @testWithData(() => {
    // Generate data dynamically - could include API calls, etc.
    return [
      { user: 'admin', pass: 'admin123', role: 'Administrator' },
      { user: 'user1', pass: 'pass1', role: 'Standard User' },
      { user: 'guest', pass: 'guest', role: 'Guest' },
    ]
  })
  async testWithGeneratedData({ page }, data) {
    await page.goto('/login')
    await page.fill('#username', data.user)
    await page.fill('#password', data.pass)
    await page.click('#login-button')
    
    // Verify user role is displayed correctly after login
    const roleText = await page.textContent('.user-role')
    expect(roleText).toContain(data.role)
  }
}
