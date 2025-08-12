import { expect } from '@playwright/test'
import { Test } from '../main/typescript/helpers/Decorators'

/**
 * Example class showing how to use the unified @Test decorator
 * 
 * This class demonstrates the various ways you can use the @Test decorator:
 * - Basic tests with just a title
 * - Tests with metadata (testCaseId, description, tags)
 * - Data-driven tests with static test data
 * - Data-driven tests with dynamically generated test data
 * - Tests with conditional skipping
 */
export class UnifiedTestExamples {
  
  /**
   * Basic test with just a title string
   */
  @Test('should display the login form')
  async testLoginDisplay({ page }) {
    await page.goto('/login')
    
    // Verify login form is displayed
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('h1')).toHaveText('Login')
    await expect(page.locator('#username')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  }
  
  /**
   * Test with complete metadata
   */
  @Test({
    title: 'User can login with valid credentials',
    description: 'Verifies that users can successfully login with valid credentials and are redirected to the dashboard',
    testCaseId: 'LOGIN-001',
    tags: ['login', 'smoke', 'critical-path'],
  })
  async testSuccessfulLogin({ page }) {
    await page.goto('/login')
    
    // Perform login
    await page.fill('#username', 'validuser@example.com')
    await page.fill('#password', 'validPassword123')
    await page.click('button[type="submit"]')
    
    // Verify successful login
    await expect(page).toHaveURL(/dashboard/)
    await expect(page.locator('.welcome-message')).toHaveText(/Welcome/)
  }
  
  /**
   * Data-driven test with static test data
   */
  @Test({
    title: 'Login validation handles edge cases appropriately',
    testCaseId: 'LOGIN-002',
    tags: ['login', 'validation'],
    data: [
      { 
        username: 'validuser@example.com', 
        password: 'validPassword123',
        expectedResult: 'success',
        expectedMessage: 'Welcome to your dashboard'
      },
      { 
        username: 'invalid@example.com', 
        password: 'wrongpassword',
        expectedResult: 'error',
        expectedMessage: 'Invalid username or password'
      },
      { 
        username: '', 
        password: 'validPassword123',
        expectedResult: 'error',
        expectedMessage: 'Username is required'
      },
      { 
        username: 'validuser@example.com', 
        password: '',
        expectedResult: 'error',
        expectedMessage: 'Password is required'
      }
    ]
  })
  async testLoginValidation({ page }, testData) {
    await page.goto('/login')
    
    // Fill form with test data
    await page.fill('#username', testData.username)
    await page.fill('#password', testData.password)
    await page.click('button[type="submit"]')
    
    // Verify results based on expected outcome
    if (testData.expectedResult === 'success') {
      await expect(page).toHaveURL(/dashboard/)
      await expect(page.locator('.welcome-message')).toHaveText(testData.expectedMessage)
    } else {
      // Should still be on login page
      await expect(page).toHaveURL(/login/)
      await expect(page.locator('.error-message')).toHaveText(testData.expectedMessage)
    }
  }
  
  /**
   * Test with conditional skipping
   */
  @Test({
    title: 'Password reset functionality works correctly',
    testCaseId: 'LOGIN-003',
    skip: () => process.env.RUN_FULL_SUITE !== 'true', // Only run in full test suite
  })
  async testPasswordReset({ page }) {
    await page.goto('/login')
    await page.click('text=Forgot Password?')
    
    // Verify password reset page
    await expect(page).toHaveURL(/password-reset/)
    await expect(page.locator('h1')).toHaveText('Reset Your Password')
    
    // Test password reset flow
    await page.fill('#email', 'user@example.com')
    await page.click('button[type="submit"]')
    
    // Verify success message
    await expect(page.locator('.success-message'))
      .toHaveText('Password reset instructions have been sent to your email')
  }
  
  /**
   * Data-driven test with dynamically generated data and conditional skipping
   */
  @Test({
    title: 'Registration form validates user inputs',
    testCaseId: 'REG-001',
    data: () => {
      // Generate test data dynamically
      return [
        { field: 'email', value: 'invalid-email', errorMsg: 'Please enter a valid email address' },
        { field: 'password', value: '123', errorMsg: 'Password must be at least 8 characters long' },
        { field: 'password', value: 'nodigits', errorMsg: 'Password must contain at least one number' },
        { field: 'confirmPassword', value: 'different123', errorMsg: 'Passwords do not match' }
      ]
    },
    skip: (testItem) => testItem?.field === 'confirmPassword', // Skip confirmPassword test
  })
  async testRegistrationValidation({ page }, testData) {
    await page.goto('/register')
    
    // Fill form with valid data first
    await page.fill('#name', 'Test User')
    await page.fill('#email', 'testuser@example.com')
    await page.fill('#password', 'ValidPass123')
    await page.fill('#confirmPassword', 'ValidPass123')
    
    // Now override with invalid test data
    await page.fill(`#${testData.field}`, testData.value)
    
    // Try to submit form
    await page.click('button[type="submit"]')
    
    // Verify appropriate error message is displayed
    await expect(page.locator(`#${testData.field}-error`)).toHaveText(testData.errorMsg)
    
    // Should still be on register page
    await expect(page).toHaveURL(/register/)
  }
}
