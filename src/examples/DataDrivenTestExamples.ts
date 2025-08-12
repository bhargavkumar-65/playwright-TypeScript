import { expect } from '@playwright/test'

import { testWithData } from '../main/typescript/helpers/Decorators'

// Mock LoginPageActions class for example purposes
class LoginPageActions {
  private page: any
  
  constructor(page: any) {
    this.page = page
  }
  
  async login(email: string, password: string): Promise<void> {
    await this.page.fill('[data-test="email"]', email)
    await this.page.fill('[data-test="password"]', password)
    await this.page.click('[data-test="login-button"]')
  }
  
  async getWelcomeMessage(): Promise<string> {
    return await this.page.textContent('.welcome-message')
  }
  
  async getErrorMessage(): Promise<string> {
    return await this.page.textContent('.error-message')
  }
}

// Define test data - moved outside the class to avoid the "used before declaration" error
const LOGIN_TEST_DATA = [
  { 
    email: 'valid@example.com', 
    password: 'Password123',
    expectSuccess: true,
    expectedMessage: 'Welcome, Valid User',
  },
  { 
    email: 'invalid@example.com', 
    password: 'wrongpassword',
    expectSuccess: false,
    expectedMessage: 'Invalid email or password',
  },
  { 
    email: '', 
    password: 'Password123',
    expectSuccess: false,
    expectedMessage: 'Email is required',
  },
  { 
    email: 'valid@example.com', 
    password: '',
    expectSuccess: false,
    expectedMessage: 'Password is required',
  },
]

/**
 * Example test class using testWithData decorator
 */
export class LoginTests {
    /**
   * Data-driven login test using testWithData decorator
   */
  @testWithData(LOGIN_TEST_DATA, { 
    title: 'should validate login scenarios',
    tags: ['login', 'validation'],
  })
  async testLoginScenarios({ page, articlePageActions }, testCase) {
    // Create page object instance
    const loginPage = new LoginPageActions(page)
    
    // Navigate to login page
    await page.goto('/login')
    
    // Perform login
    await loginPage.login(testCase.email, testCase.password)
    
    // Verify results based on expectations
    if (testCase.expectSuccess) {
      const welcomeMsg = await loginPage.getWelcomeMessage()
      expect(welcomeMsg).toBe(testCase.expectedMessage)
    } else {
      const errorMsg = await loginPage.getErrorMessage()
      expect(errorMsg).toBe(testCase.expectedMessage)
    }
  }
    /**
   * Example with conditional skipping based on the data
   */
  @testWithData(LOGIN_TEST_DATA, {
    title: 'should handle different login scenarios',
    conditionalSkip: (data: any) => data.email === '', // Skip empty email tests
  })
  async testLoginWithConditionalSkip({ page }, testCase) {
    // Create page object instance
    const loginPage = new LoginPageActions(page)
    
    // Navigate to login page
    await page.goto('/login')
    
    // Perform login
    await loginPage.login(testCase.email, testCase.password)
    
    // Verify results based on expectations
    if (testCase.expectSuccess) {
      const welcomeMsg = await loginPage.getWelcomeMessage()
      expect(welcomeMsg).toBe(testCase.expectedMessage)
    } else {
      const errorMsg = await loginPage.getErrorMessage()
      expect(errorMsg).toBe(testCase.expectedMessage)
    }
  }
    /**
   * Example using a function to generate test data
   */
  @testWithData(() => {
    // Generate test data dynamically
    return [
      { username: 'user1', password: 'pass1', expected: 'Welcome User1' },
      { username: 'user2', password: 'pass2', expected: 'Welcome User2' },
      { username: 'admin', password: 'admin123', expected: 'Welcome Admin' },
    ]
  })
  async testWithDynamicData({ page }, data) {
    await page.goto('/login')
    await page.fill('[name="username"]', data.username)
    await page.fill('[name="password"]', data.password)
    await page.click('button[type="submit"]')
    
    const message = await page.textContent('.welcome-message')
    expect(message).toBe(data.expected)
  }
}
